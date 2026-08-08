// Package payload contains the SSH app's boundary to the Payload REST API.
package payload

import (
	"time"

	"github.com/go-resty/resty/v2"
)

// Client owns the reusable HTTP client for future Payload collection requests.
type Client struct {
	http *resty.Client
}

// NewClient creates the single Payload REST client used by the SSH service.
func NewClient(baseURL string) *Client {
	return &Client{
		http: resty.New().
			SetBaseURL(baseURL).
			SetTimeout(10*time.Second).
			SetHeader("Accept", "application/json"),
	}
}
