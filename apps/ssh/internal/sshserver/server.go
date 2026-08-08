package sshserver

import (
	"context"
	"errors"
	"log/slog"
	"os"
	"path/filepath"

	"charm.land/ssh"
	"charm.land/wish/v2"
	wishbubbletea "charm.land/wish/v2/bubbletea"
	"charm.land/wish/v2/recover"

	"github.com/soumajit/portfolio/apps/ssh/internal/config"
	"github.com/soumajit/portfolio/apps/ssh/internal/payload"
	"github.com/soumajit/portfolio/apps/ssh/internal/tui"
)

type Server struct {
	server  *ssh.Server
	logger  *slog.Logger
	payload *payload.Client
}

func New(cfg config.Config, logger *slog.Logger, payloadClient *payload.Client) (*Server, error) {
	if logger == nil {
		logger = slog.Default()
	}

	if err := os.MkdirAll(filepath.Dir(cfg.SSHHostKeyPath), 0o700); err != nil {
		return nil, err
	}

	options := []ssh.Option{
		wish.WithAddress(cfg.SSHAddress),
		wish.WithHostKeyPath(cfg.SSHHostKeyPath),
		wish.WithIdleTimeout(cfg.SSHIdleTimeout),
		wish.WithMaxTimeout(cfg.SSHMaxTimeout),
		wish.WithMiddleware(
			wishbubbletea.Middleware(tui.New),
			sessionMiddleware(logger),
			recover.Middleware(),
		),
	}

	if cfg.SSHAuthorizedKeysPath != "" {
		options = append(options, wish.WithAuthorizedKeys(cfg.SSHAuthorizedKeysPath))
	} else {
		logger.Warn("SSH_AUTHORIZED_KEYS_PATH is unset; accepting any public key on the loopback development server")
		options = append(options, wish.WithPublicKeyAuth(func(ssh.Context, ssh.PublicKey) bool {
			return true
		}))
	}

	srv, err := wish.NewServer(options...)

	if err != nil {
		return nil, err
	}

	return &Server{
		server:  srv,
		logger:  logger,
		payload: payloadClient,
	}, nil
}

func (s *Server) Start() error {
	s.logger.Info(
		"starting SSH server",
		"address", s.server.Addr,
	)

	err := s.server.ListenAndServe()

	if err != nil && !errors.Is(err, ssh.ErrServerClosed) {
		return err
	}

	return nil
}

func (s *Server) Shutdown(ctx context.Context) error {
	s.logger.Info("shutting down SSH server")

	return s.server.Shutdown(ctx)
}

func sessionMiddleware(logger *slog.Logger) wish.Middleware {
	return func(next ssh.Handler) ssh.Handler {
		return func(session ssh.Session) {
			logger.Info(
				"SSH session started",
				"user", session.User(),
				"remote_addr", session.RemoteAddr().String(),
			)

			next(session)
		}
	}
}
