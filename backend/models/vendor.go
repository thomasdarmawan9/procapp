package models

import (
	"gorm.io/gorm"
)

type Vendor struct {
	gorm.Model
	Name            string  `gorm:"not null" json:"name"`
	ContactPerson   string  `gorm:"not null" json:"contact_person"`
	Email           string  `gorm:"not null" json:"email"`
	Phone           string  `json:"phone"`
	Category        string  `gorm:"not null" json:"category"` // IT, Office Supplies, Services, etc.
	Rating          float64 `gorm:"default:0" json:"rating"`  // 0-5 rating
	Address         string  `gorm:"type:text" json:"address"`
	TotalOrders     int     `gorm:"default:0" json:"total_orders"`
	TotalSpent      float64 `gorm:"default:0" json:"total_spent"`
	Status          string  `gorm:"default:'active'" json:"status"` // active, inactive
	Notes           string  `gorm:"type:text" json:"notes"`
	Requests        []ProcurementRequest `gorm:"foreignKey:VendorID" json:"requests,omitempty"`
}
