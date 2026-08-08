package sshserver

import (
	"context"
	"errors"
	"log/slog"

	"charm.land/ssh"
	"charm.land/wish/v2"
	"charm.land/wish/v2/recover"

	"github.com/soumajit/portfolio/apps/ssh/internal/config"
)

type Server struct {
	server *ssh.Server
	logger *slog.Logger
}

func New(cfg config.Config, logger *slog.Logger) (*Server, error) {
	if logger == nil {
		logger = slog.Default()
	}

	srv, err := wish.NewServer(
		wish.WithAddress(cfg.SSHAddress),
		wish.WithHostKeyPath(cfg.SSHHostKeyPath),
		wish.WithAuthorizedKeys(cfg.SSHAuthorizedKeysPath),
		wish.WithIdleTimeout(cfg.SSHIdleTimeout),
		wish.WithMaxTimeout(cfg.SSHMaxTimeout),
		wish.WithMiddleware(
			sessionMiddleware(logger),
			recover.Middleware(),
		),
	)

	if err != nil {
		return nil, err
	}

	return &Server{
		server: srv,
		logger: logger,
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

			wish.Println(session, "Welcome to Portfolio SSH")

			next(session)
		}
	}
}
