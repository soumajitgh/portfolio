package tui

import (
	"strings"
	"testing"

	tea "charm.land/bubbletea/v2"
)

func TestViewUsesAlternateScreen(t *testing.T) {
	model := model{user: "alice", remoteAddr: "127.0.0.1:2222"}
	view := model.View()

	if !view.AltScreen {
		t.Fatal("expected alternate screen")
	}
	if !strings.Contains(view.Content, "Connected as alice from 127.0.0.1:2222") {
		t.Fatalf("unexpected view content: %q", view.Content)
	}
	if !strings.Contains(view.Content, "Soumajit over SSH") || !strings.Contains(view.Content, "Backend Engineer") {
		t.Fatalf("expected profile details in view: %q", view.Content)
	}
}

func TestQuitKeysReturnQuitCommand(t *testing.T) {
	for _, key := range []string{"q", "esc", "ctrl+c"} {
		t.Run(key, func(t *testing.T) {
			model := model{}
			_, command := model.Update(tea.KeyPressMsg(tea.Key{Text: key}))
			if command == nil {
				t.Fatal("expected quit command")
			}
		})
	}
}
