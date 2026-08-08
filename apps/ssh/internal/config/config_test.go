package config

import "testing"

func TestLoadAllowsMissingAuthorizedKeysPath(t *testing.T) {
	t.Setenv("SSH_AUTHORIZED_KEYS_PATH", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.SSHAuthorizedKeysPath != "" {
		t.Fatalf("SSHAuthorizedKeysPath = %q, want empty", cfg.SSHAuthorizedKeysPath)
	}
}
