package models

import (
        "gorm.io/gorm"
)

type User struct {
        gorm.Model
        Username string `gorm:"uniqueIndex;not null" json:"username"`
        Password string `gorm:"not null" json:"-"`
        FullName string `gorm:"not null" json:"full_name"`
        Email    string `json:"email"`
        Role     string `gorm:"not null" json:"role"` // user, superuser, manager, director
}
