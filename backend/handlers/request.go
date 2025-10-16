package handlers

import (
        "log"
        "net/http"
        "procurement-app/database"
        "procurement-app/models"
        "procurement-app/services"

        "github.com/gin-gonic/gin"
)

type CreateRequestInput struct {
        ItemName      string  `json:"item_name" binding:"required"`
        Description   string  `json:"description"`
        Quantity      int     `json:"quantity" binding:"required,min=1"`
        UnitPrice     float64 `json:"unit_price" binding:"required,min=0"`
        Justification string  `json:"justification"`
        VendorID      *uint   `json:"vendor_id"`
}

func CreateRequest(c *gin.Context) {
        var input CreateRequestInput
        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        userID := c.GetUint("user_id")
        totalCost := float64(input.Quantity) * input.UnitPrice

        request := models.ProcurementRequest{
                ItemName:      input.ItemName,
                Description:   input.Description,
                Quantity:      input.Quantity,
                UnitPrice:     input.UnitPrice,
                TotalCost:     totalCost,
                Justification: input.Justification,
                RequestorID:   userID,
                VendorID:      input.VendorID,
                Status:        "pending",
        }

        if err := database.DB.Create(&request).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
                return
        }

        database.DB.Preload("Requestor").Preload("Vendor").Preload("Approvals.Approver").First(&request, request.ID)

        // Send email notifications asynchronously
        go func() {
                // Notify requestor
                if err := services.SendRequestCreatedEmail(&request, &request.Requestor); err != nil {
                        log.Printf("Failed to send request created email: %v", err)
                }

                // Notify approvers (managers and directors)
                var approvers []models.User
                database.DB.Where("role IN ?", []string{"manager", "director"}).Find(&approvers)
                for _, approver := range approvers {
                        if err := services.SendApproverNotificationEmail(&request, &request.Requestor, approver.Email); err != nil {
                                log.Printf("Failed to send approver notification to %s: %v", approver.Email, err)
                        }
                }
        }()

        c.JSON(http.StatusCreated, request)
}

func GetRequests(c *gin.Context) {
        userID := c.GetUint("user_id")
        role := c.GetString("role")
        status := c.Query("status")

        var requests []models.ProcurementRequest
        query := database.DB.Preload("Requestor").Preload("Vendor").Preload("Approvals.Approver")

        if role == "user" || role == "superuser" {
                query = query.Where("requestor_id = ?", userID)
        }

        if status != "" {
                query = query.Where("status = ?", status)
        }

        if err := query.Order("created_at desc").Find(&requests).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch requests"})
                return
        }

        c.JSON(http.StatusOK, requests)
}

func GetRequestByID(c *gin.Context) {
        id := c.Param("id")
        userID := c.GetUint("user_id")
        role := c.GetString("role")

        var request models.ProcurementRequest
        query := database.DB.Preload("Requestor").Preload("Vendor").Preload("Approvals.Approver")

        if err := query.First(&request, id).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
                return
        }

        if (role == "user" || role == "superuser") && request.RequestorID != userID {
                c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
                return
        }

        c.JSON(http.StatusOK, request)
}

func UpdateRequestStatus(c *gin.Context) {
        id := c.Param("id")
        
        var input struct {
                Status string `json:"status" binding:"required,oneof=pending approved rejected"`
        }
        
        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var request models.ProcurementRequest
        if err := database.DB.First(&request, id).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
                return
        }

        request.Status = input.Status
        if err := database.DB.Save(&request).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
                return
        }

        c.JSON(http.StatusOK, request)
}
