package handlers

import (
        "log"
        "net/http"
        "procurement-app/database"
        "procurement-app/models"
        "procurement-app/services"
        "time"

        "github.com/gin-gonic/gin"
)

type ApprovalInput struct {
        Status   string `json:"status" binding:"required,oneof=approved rejected"`
        Comments string `json:"comments"`
}

func CreateApproval(c *gin.Context) {
        requestID := c.Param("id")
        userID := c.GetUint("user_id")
        role := c.GetString("role")

        if role != "manager" && role != "director" {
                c.JSON(http.StatusForbidden, gin.H{"error": "Only managers and directors can approve requests"})
                return
        }

        var input ApprovalInput
        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        var request models.ProcurementRequest
        if err := database.DB.First(&request, requestID).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Request not found"})
                return
        }

        if request.Status != "pending" {
                c.JSON(http.StatusBadRequest, gin.H{"error": "Request has already been processed"})
                return
        }

        approval := models.Approval{
                RequestID:  request.ID,
                ApproverID: userID,
                Status:     input.Status,
                Comments:   input.Comments,
                ApprovedAt: time.Now(),
        }

        if err := database.DB.Create(&approval).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create approval"})
                return
        }

        request.Status = input.Status
        database.DB.Save(&request)

        database.DB.Preload("Approver").First(&approval, approval.ID)

        // Send email notification to requestor asynchronously
        go func() {
                var requestor models.User
                database.DB.First(&requestor, request.RequestorID)
                
                var approver models.User
                database.DB.First(&approver, userID)
                
                if err := services.SendApprovalEmail(&request, &requestor, &approver, input.Status, input.Comments); err != nil {
                        log.Printf("Failed to send approval email: %v", err)
                }
        }()

        c.JSON(http.StatusCreated, approval)
}

func GetApprovals(c *gin.Context) {
        requestID := c.Param("id")

        var approvals []models.Approval
        if err := database.DB.Preload("Approver").Where("request_id = ?", requestID).Order("created_at desc").Find(&approvals).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch approvals"})
                return
        }

        c.JSON(http.StatusOK, approvals)
}
