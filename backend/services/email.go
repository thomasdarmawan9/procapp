package services

import (
        "context"
        "encoding/base64"
        "encoding/json"
        "fmt"
        "io"
        "net/http"
        "os"
        "procurement-app/models"
        "strings"
        "time"

        "golang.org/x/oauth2"
        "google.golang.org/api/gmail/v1"
        "google.golang.org/api/option"
)

type GmailConnectionSettings struct {
        Settings struct {
                AccessToken string `json:"access_token"`
                OAuth       struct {
                        Credentials struct {
                                AccessToken string `json:"access_token"`
                        } `json:"credentials"`
                } `json:"oauth"`
                ExpiresAt string `json:"expires_at"`
        } `json:"settings"`
}

type GmailConnectionResponse struct {
        Items []GmailConnectionSettings `json:"items"`
}

func getGmailAccessToken() (string, error) {
        hostname := os.Getenv("REPLIT_CONNECTORS_HOSTNAME")
        if hostname == "" {
                hostname = "connectors.replit.com"
        }

        xReplitToken := ""
        if replIdentity := os.Getenv("REPL_IDENTITY"); replIdentity != "" {
                xReplitToken = "repl " + replIdentity
        } else if webReplRenewal := os.Getenv("WEB_REPL_RENEWAL"); webReplRenewal != "" {
                xReplitToken = "depl " + webReplRenewal
        }

        if xReplitToken == "" {
                return "", fmt.Errorf("X_REPLIT_TOKEN not found for repl/depl")
        }

        url := fmt.Sprintf("https://%s/api/v2/connection?include_secrets=true&connector_names=google-mail", hostname)
        req, err := http.NewRequest("GET", url, nil)
        if err != nil {
                return "", err
        }

        req.Header.Set("Accept", "application/json")
        req.Header.Set("X_REPLIT_TOKEN", xReplitToken)

        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
                return "", err
        }
        defer resp.Body.Close()

        body, err := io.ReadAll(resp.Body)
        if err != nil {
                return "", err
        }

        var connResp GmailConnectionResponse
        if err := json.Unmarshal(body, &connResp); err != nil {
                return "", err
        }

        if len(connResp.Items) == 0 {
                return "", fmt.Errorf("Gmail not connected")
        }

        accessToken := connResp.Items[0].Settings.AccessToken
        if accessToken == "" {
                accessToken = connResp.Items[0].Settings.OAuth.Credentials.AccessToken
        }

        if accessToken == "" {
                return "", fmt.Errorf("Gmail access token not found")
        }

        return accessToken, nil
}

func createGmailService() (*gmail.Service, error) {
        ctx := context.Background()
        accessToken, err := getGmailAccessToken()
        if err != nil {
                return nil, err
        }

        token := &oauth2.Token{
                AccessToken: accessToken,
        }

        client := oauth2.NewClient(ctx, oauth2.StaticTokenSource(token))
        gmailService, err := gmail.NewService(ctx, option.WithHTTPClient(client))
        if err != nil {
                return nil, err
        }

        return gmailService, nil
}

// func getGmailUserEmail(gmailService *gmail.Service) (string, error) {
//         profile, err := gmailService.Users.GetProfile("me").Do()
//         if err != nil {
//                 return "", err
//         }
//         return profile.EmailAddress, nil
// }

func sendGmailMessage(to, subject, htmlBody string) error {
    gmailService, err := createGmailService()
    if err != nil {
        return err
    }

    var message strings.Builder
    message.WriteString("To: " + to + "\r\n")
    message.WriteString("Subject: " + subject + "\r\n")
    message.WriteString("Date: " + time.Now().Format(time.RFC1123Z) + "\r\n")
    message.WriteString("MIME-Version: 1.0\r\n")
    message.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
    message.WriteString("\r\n")
    message.WriteString(htmlBody)

    var gmailMessage gmail.Message
    gmailMessage.Raw = base64.RawURLEncoding.EncodeToString([]byte(message.String()))

    _, err = gmailService.Users.Messages.Send("me", &gmailMessage).Do()
    return err
}

func SendRequestCreatedEmail(request *models.ProcurementRequest, requestor *models.User) error {
        subject := fmt.Sprintf("New Procurement Request: %s", request.ItemName)
        htmlContent := fmt.Sprintf(`
                <h2>New Procurement Request Created</h2>
                <p>A new procurement request has been submitted and requires approval.</p>
                <h3>Request Details:</h3>
                <ul>
                        <li><strong>Item:</strong> %s</li>
                        <li><strong>Requestor:</strong> %s (%s)</li>
                        <li><strong>Quantity:</strong> %d</li>
                        <li><strong>Unit Price:</strong> Rp %.2f</li>
                        <li><strong>Total Cost:</strong> Rp %.2f</li>
                        <li><strong>Status:</strong> %s</li>
                </ul>
                <p><strong>Justification:</strong> %s</p>
                <p>Please review and process this request at your earliest convenience.</p>
        `, request.ItemName, requestor.FullName, requestor.Role, request.Quantity,
                request.UnitPrice, request.TotalCost, request.Status, request.Justification)

        return sendGmailMessage(requestor.Email, subject, htmlContent)
}

func SendApprovalEmail(request *models.ProcurementRequest, requestor *models.User, approver *models.User, status string, comments string) error {
        statusText := "Approved"
        statusEmoji := "✅"
        if status == "rejected" {
                statusText = "Rejected"
                statusEmoji = "❌"
        }

        subject := fmt.Sprintf("Request %s: %s", statusText, request.ItemName)
        htmlContent := fmt.Sprintf(`
                <h2>%s Your Procurement Request Has Been %s</h2>
                <p>Your procurement request has been reviewed and %s.</p>
                <h3>Request Details:</h3>
                <ul>
                        <li><strong>Item:</strong> %s</li>
                        <li><strong>Total Cost:</strong> Rp %.2f</li>
                        <li><strong>Status:</strong> %s %s</li>
                </ul>
                <h3>Approval Details:</h3>
                <ul>
                        <li><strong>Reviewed By:</strong> %s (%s)</li>
                        <li><strong>Comments:</strong> %s</li>
                </ul>
                <p>Thank you for using the procurement system.</p>
        `, statusEmoji, statusText, statusText, request.ItemName, request.TotalCost,
                statusEmoji, statusText, approver.FullName, approver.Role, comments)

        return sendGmailMessage(requestor.Email, subject, htmlContent)
}

func SendApproverNotificationEmail(request *models.ProcurementRequest, requestor *models.User, approverEmail string) error {
        subject := fmt.Sprintf("Action Required: Approve Procurement Request - %s", request.ItemName)
        htmlContent := fmt.Sprintf(`
                <h2>New Procurement Request Awaiting Your Approval</h2>
                <p>A procurement request has been submitted and requires your review.</p>
                <h3>Request Details:</h3>
                <ul>
                        <li><strong>Item:</strong> %s</li>
                        <li><strong>Requestor:</strong> %s (%s)</li>
                        <li><strong>Quantity:</strong> %d</li>
                        <li><strong>Total Cost:</strong> Rp %.2f</li>
                </ul>
                <p><strong>Justification:</strong> %s</p>
                <p>Please log in to the procurement system to review and process this request.</p>
        `, request.ItemName, requestor.FullName, requestor.Role, request.Quantity,
                request.TotalCost, request.Justification)

        return sendGmailMessage(approverEmail, subject, htmlContent)
}
