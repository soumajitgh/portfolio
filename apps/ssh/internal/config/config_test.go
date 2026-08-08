package config

import "testing"

func TestLoadAllowsMissingAuthorizedKeysPath(t *testing.T) {
	t.Setenv("SSH_AUTHORIZED_KEYS_PATH", "")
	t.Setenv("PAYLOAD_URL", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.SSHAuthorizedKeysPath != "" {
		t.Fatalf("SSHAuthorizedKeysPath = %q, want empty", cfg.SSHAuthorizedKeysPath)
	}
	if cfg.PayloadURL != "http://127.0.0.1:3000" {
		t.Fatalf("PayloadURL = %q, want local web URL", cfg.PayloadURL)
	}
}

func TestLoadRejectsInvalidPayloadURL(t *testing.T) {
	t.Setenv("PAYLOAD_URL", "payload")

	if _, err := Load(); err == nil {
		t.Fatal("Load() error = nil, want invalid PAYLOAD_URL error")
	}
}
