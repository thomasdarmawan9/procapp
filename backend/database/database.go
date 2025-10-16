package database

import (
        "fmt"
        "log"
        "os"
        "procurement-app/models"

        "gorm.io/driver/postgres"
        "gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase() {
        dsn := os.Getenv("DATABASE_URL")
        if dsn == "" {
                log.Fatal("DATABASE_URL environment variable is not set")
        }

        var err error
        DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
        if err != nil {
                log.Fatal("Failed to connect to database:", err)
        }

        fmt.Println("Database connection established")

        err = DB.AutoMigrate(&models.User{}, &models.Vendor{}, &models.ProcurementRequest{}, &models.Approval{})
        if err != nil {
                log.Fatal("Failed to migrate database:", err)
        }

        fmt.Println("Database migration completed")

        seedUsers()
}

func seedUsers() {
        users := []models.User{
                {Username: "user", Password: "password123", FullName: "Regular User", Email: "user@procurement.com", Role: "user"},
                {Username: "superuser", Password: "password123", FullName: "Super User", Email: "superuser@procurement.com", Role: "superuser"},
                {Username: "manager", Password: "password123", FullName: "Manager User", Email: "manager@procurement.com", Role: "manager"},
                {Username: "director", Password: "password123", FullName: "Director User", Email: "director@procurement.com", Role: "director"},
        }

        for _, user := range users {
                var existingUser models.User
                result := DB.Where("username = ?", user.Username).First(&existingUser)
                if result.Error == gorm.ErrRecordNotFound {
                        DB.Create(&user)
                        fmt.Printf("Created user: %s\n", user.Username)
                } else {
                        // Update existing user's email if it's empty
                        if existingUser.Email == "" {
                                existingUser.Email = user.Email
                                DB.Save(&existingUser)
                                fmt.Printf("Updated email for user: %s\n", user.Username)
                        }
                }
        }
}
