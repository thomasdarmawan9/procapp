package models

import (
        "gorm.io/gorm"
)

type ProcurementRequest struct {
        gorm.Model
        ItemName     string    `gorm:"not null" json:"item_name"`
        Description  string    `gorm:"type:text" json:"description"`
        Quantity     int       `gorm:"not null" json:"quantity"`
        UnitPrice    float64   `gorm:"not null" json:"unit_price"`
        TotalCost    float64   `gorm:"not null" json:"total_cost"`
        Justification string   `gorm:"type:text" json:"justification"`
        Status       string    `gorm:"default:'pending';index" json:"status"` // pending, approved, rejected
        RequestorID  uint      `gorm:"not null;index" json:"requestor_id"`
        Requestor    User      `gorm:"foreignKey:RequestorID" json:"requestor"`
        VendorID     *uint     `gorm:"index" json:"vendor_id"`
        Vendor       *Vendor   `gorm:"foreignKey:VendorID" json:"vendor,omitempty"`
        Approvals    []Approval `gorm:"foreignKey:RequestID" json:"approvals,omitempty"`
}
