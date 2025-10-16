package models

import (
        "time"
        "gorm.io/gorm"
)

type Approval struct {
        gorm.Model
        RequestID     uint      `gorm:"not null;index" json:"request_id"`
        ApproverID    uint      `gorm:"not null;index" json:"approver_id"`
        Approver      User      `gorm:"foreignKey:ApproverID" json:"approver"`
        Status        string    `gorm:"not null;index" json:"status"` // approved, rejected
        Comments      string    `gorm:"type:text" json:"comments"`
        ApprovedAt    time.Time `json:"approved_at"`
}
