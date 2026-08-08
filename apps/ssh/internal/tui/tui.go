package tui

import (
	"fmt"
	"strings"

	tea "charm.land/bubbletea/v2"
	"charm.land/lipgloss/v2"
	"charm.land/ssh"
)

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("62"))
	helpStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("241"))
	roleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("110"))
)

type model struct {
	user       string
	remoteAddr string
}

// New creates an independent Bubble Tea model for each SSH session.
func New(session ssh.Session) (tea.Model, []tea.ProgramOption) {
	return model{
		user:       session.User(),
		remoteAddr: session.RemoteAddr().String(),
	}, nil
}

func (m model) Init() tea.Cmd {
	return nil
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	if key, ok := msg.(tea.KeyPressMsg); ok {
		switch key.String() {
		case "q", "esc", "ctrl+c":
			return m, tea.Quit
		}
	}

	return m, nil
}

func (m model) View() tea.View {
	content := strings.Join([]string{
		titleStyle.Render("Soumajit over SSH"),
		roleStyle.Render("Backend Engineer"),
		"",
		fmt.Sprintf("Connected as %s from %s", m.user, m.remoteAddr),
		"",
		helpStyle.Render("Press q, Esc, or Ctrl+C to disconnect."),
	}, "\n")

	view := tea.NewView(content)
	view.AltScreen = true
	view.WindowTitle = "Soumajit over SSH"

	return view
}
