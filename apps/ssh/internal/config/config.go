package config

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"time"
)

type Config struct {
	PayloadURL            string
	SSHAddress            string
	SSHHostKeyPath        string
	SSHAuthorizedKeysPath string
	SSHIdleTimeout        time.Duration
	SSHMaxTimeout         time.Duration
	ShutdownTimeout       time.Duration
}

func Load() (Config, error) {
	idleTimeout, err := durationFromEnv("SSH_IDLE_TIMEOUT", 10*time.Minute)
	if err != nil {
		return Config{}, err
	}

	maxTimeout, err := durationFromEnv("SSH_MAX_TIMEOUT", time.Hour)
	if err != nil {
		return Config{}, err
	}

	shutdownTimeout, err := durationFromEnv("SSH_SHUTDOWN_TIMEOUT", 30*time.Second)
	if err != nil {
		return Config{}, err
	}

	cfg := Config{
		PayloadURL:            getEnv("PAYLOAD_URL", "http://127.0.0.1:3000"),
		SSHAddress:            getEnv("SSH_ADDRESS", "127.0.0.1:23234"),
		SSHHostKeyPath:        getEnv("SSH_HOST_KEY_PATH", "./.ssh/id_ed25519"),
		SSHAuthorizedKeysPath: os.Getenv("SSH_AUTHORIZED_KEYS_PATH"),
		SSHIdleTimeout:        idleTimeout,
		SSHMaxTimeout:         maxTimeout,
		ShutdownTimeout:       shutdownTimeout,
	}

	if _, _, err := net.SplitHostPort(cfg.SSHAddress); err != nil {
		return Config{}, fmt.Errorf("invalid SSH_ADDRESS %q: %w", cfg.SSHAddress, err)
	}
	payloadURL, err := url.ParseRequestURI(cfg.PayloadURL)
	if err != nil || payloadURL.Scheme == "" || payloadURL.Host == "" {
		return Config{}, fmt.Errorf("PAYLOAD_URL must be an absolute HTTP URL, got %q", cfg.PayloadURL)
	}
	if payloadURL.Scheme != "http" && payloadURL.Scheme != "https" {
		return Config{}, fmt.Errorf("PAYLOAD_URL must use http or https, got %q", cfg.PayloadURL)
	}

	if cfg.SSHHostKeyPath == "" {
		return Config{}, fmt.Errorf("SSH_HOST_KEY_PATH cannot be empty")
	}
	if cfg.SSHMaxTimeout < cfg.SSHIdleTimeout {
		return Config{}, fmt.Errorf("SSH_MAX_TIMEOUT must be greater than or equal to SSH_IDLE_TIMEOUT")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	value := os.Getenv(key)

	if value == "" {
		return fallback
	}

	return value
}

func durationFromEnv(key string, fallback time.Duration) (time.Duration, error) {
	value := os.Getenv(key)
	if value == "" {
		return fallback, nil
	}

	duration, err := time.ParseDuration(value)
	if err != nil {
		return 0, fmt.Errorf("invalid %s %q: %w", key, value, err)
	}
	if duration <= 0 {
		return 0, fmt.Errorf("%s must be greater than zero", key)
	}

	return duration, nil
}
