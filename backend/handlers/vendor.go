package handlers

import (
        "net/http"
        "procurement-app/database"
        "procurement-app/models"

        "github.com/gin-gonic/gin"
)

type CreateVendorInput struct {
        Name          string  `json:"name" binding:"required"`
        ContactPerson string  `json:"contact_person" binding:"required"`
        Email         string  `json:"email" binding:"required,email"`
        Phone         string  `json:"phone"`
        Category      string  `json:"category" binding:"required"`
        Rating        float64 `json:"rating"`
        Address       string  `json:"address"`
        Status        string  `json:"status"`
        Notes         string  `json:"notes"`
}

type UpdateVendorInput struct {
        Name          string  `json:"name"`
        ContactPerson string  `json:"contact_person"`
        Email         string  `json:"email"`
        Phone         string  `json:"phone"`
        Category      string  `json:"category"`
        Rating        float64 `json:"rating"`
        Address       string  `json:"address"`
        Status        string  `json:"status"`
        Notes         string  `json:"notes"`
}

func GetVendors(c *gin.Context) {
        // All authenticated users can view vendors (for vendor selection in requests)
        category := c.Query("category")
        status := c.Query("status")
        search := c.Query("search")

        var vendors []models.Vendor
        query := database.DB

        if category != "" {
                query = query.Where("category = ?", category)
        }

        if status != "" {
                query = query.Where("status = ?", status)
        }

        if search != "" {
                query = query.Where("name ILIKE ? OR contact_person ILIKE ?", "%"+search+"%", "%"+search+"%")
        }

        if err := query.Order("name asc").Find(&vendors).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vendors"})
                return
        }

        c.JSON(http.StatusOK, vendors)
}

func GetVendorByID(c *gin.Context) {
        // All authenticated users can view vendor details
        id := c.Param("id")

        var vendor models.Vendor
        if err := database.DB.Preload("Requests.Requestor").First(&vendor, id).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
                return
        }

        c.JSON(http.StatusOK, vendor)
}

func CreateVendor(c *gin.Context) {
        role := c.GetString("role")
        
        if role != "manager" && role != "director" {
                c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
                return
        }

        var input CreateVendorInput
        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        if input.Status == "" {
                input.Status = "active"
        }

        vendor := models.Vendor{
                Name:          input.Name,
                ContactPerson: input.ContactPerson,
                Email:         input.Email,
                Phone:         input.Phone,
                Category:      input.Category,
                Rating:        input.Rating,
                Address:       input.Address,
                Status:        input.Status,
                Notes:         input.Notes,
        }

        if err := database.DB.Create(&vendor).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vendor"})
                return
        }

        c.JSON(http.StatusCreated, vendor)
}

func UpdateVendor(c *gin.Context) {
        role := c.GetString("role")
        
        if role != "manager" && role != "director" {
                c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
                return
        }

        id := c.Param("id")

        var vendor models.Vendor
        if err := database.DB.First(&vendor, id).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
                return
        }

        var input UpdateVendorInput
        if err := c.ShouldBindJSON(&input); err != nil {
                c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                return
        }

        if input.Name != "" {
                vendor.Name = input.Name
        }
        if input.ContactPerson != "" {
                vendor.ContactPerson = input.ContactPerson
        }
        if input.Email != "" {
                vendor.Email = input.Email
        }
        if input.Phone != "" {
                vendor.Phone = input.Phone
        }
        if input.Category != "" {
                vendor.Category = input.Category
        }
        if input.Rating > 0 {
                vendor.Rating = input.Rating
        }
        if input.Address != "" {
                vendor.Address = input.Address
        }
        if input.Status != "" {
                vendor.Status = input.Status
        }
        if input.Notes != "" {
                vendor.Notes = input.Notes
        }

        if err := database.DB.Save(&vendor).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vendor"})
                return
        }

        c.JSON(http.StatusOK, vendor)
}

func DeleteVendor(c *gin.Context) {
        role := c.GetString("role")
        
        if role != "manager" && role != "director" {
                c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
                return
        }

        id := c.Param("id")

        var vendor models.Vendor
        if err := database.DB.First(&vendor, id).Error; err != nil {
                c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
                return
        }

        if err := database.DB.Delete(&vendor).Error; err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete vendor"})
                return
        }

        c.JSON(http.StatusOK, gin.H{"message": "Vendor deleted successfully"})
}
