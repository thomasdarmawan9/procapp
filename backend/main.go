package main

import (
        "log"
        "procurement-app/database"
        "procurement-app/handlers"
        "procurement-app/middleware"

        "github.com/gin-contrib/cors"
        "github.com/gin-gonic/gin"
)

func main() {
        database.InitDatabase()

        router := gin.Default()

        router.Use(cors.New(cors.Config{
                AllowOriginFunc: func(origin string) bool {
                        return true
                },
                AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
                AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
                ExposeHeaders:    []string{"Content-Length"},
                AllowCredentials: true,
        }))

        router.POST("/api/auth/login", handlers.Login)

        protected := router.Group("/api")
        protected.Use(middleware.AuthMiddleware())
        {
                protected.GET("/requests", handlers.GetRequests)
                protected.POST("/requests", handlers.CreateRequest)
                protected.GET("/requests/:id", handlers.GetRequestByID)
                protected.PUT("/requests/:id/status", handlers.UpdateRequestStatus)
                
                protected.POST("/requests/:id/approvals", handlers.CreateApproval)
                protected.GET("/requests/:id/approvals", handlers.GetApprovals)
                
                protected.GET("/vendors", handlers.GetVendors)
                protected.POST("/vendors", handlers.CreateVendor)
                protected.GET("/vendors/:id", handlers.GetVendorByID)
                protected.PUT("/vendors/:id", handlers.UpdateVendor)
                protected.DELETE("/vendors/:id", handlers.DeleteVendor)
        }

        log.Println("Server starting on :8080")
        if err := router.Run(":8080"); err != nil {
                log.Fatal("Failed to start server:", err)
        }
}
