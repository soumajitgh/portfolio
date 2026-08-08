package payload

import "testing"

func TestNewClientConfiguresPayloadBaseURL(t *testing.T) {
	client := NewClient("https://cms.example.com/")

	if got, want := client.http.BaseURL, "https://cms.example.com"; got != want {
		t.Fatalf("BaseURL = %q, want %q", got, want)
	}
	if got, want := client.http.Header.Get("Accept"), "application/json"; got != want {
		t.Fatalf("Accept header = %q, want %q", got, want)
	}
}
