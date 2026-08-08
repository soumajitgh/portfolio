package imageview

import (
	"image"
	"image/color"
	"strings"
	"testing"
)

func TestDetectImageMode(t *testing.T) {
	tests := []struct {
		name string
		env  []string
		want ImageMode
	}{
		{name: "explicit xterm support", env: []string{"XTERM_SIXEL=1"}, want: ImageSixel},
		{name: "browser terminal", env: []string{"TERM_PROGRAM=xterm.js"}, want: ImageSixel},
		{name: "portable default", env: []string{"TERM=xterm-256color"}, want: ImageANSI},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := DetectImageMode(test.env); got != test.want {
				t.Fatalf("DetectImageMode(%v) = %v, want %v", test.env, got, test.want)
			}
		})
	}
}

func TestRenderImageANSIUsesHalfBlocks(t *testing.T) {
	img := testImage()
	rendered := RenderImage(img, 2, 1, ImageANSI)

	if got := strings.Count(rendered, "▀"); got != 2 {
		t.Fatalf("expected 2 half blocks, got %d in %q", got, rendered)
	}
	if !strings.Contains(rendered, "\x1b[38;2;") || !strings.Contains(rendered, "\x1b[48;2;") {
		t.Fatalf("expected true-colour foreground and background escapes, got %q", rendered)
	}
}

func TestRenderImageSixelReservesTerminalRows(t *testing.T) {
	rendered := RenderImage(testImage(), 2, 3, ImageSixel)

	if !strings.HasPrefix(rendered, "\x1bPq\"1;1;16;48") {
		t.Fatalf("expected SIXEL header, got %q", rendered[:min(len(rendered), 32)])
	}
	if !strings.HasSuffix(rendered, "\x1b\\\n\n\n") {
		t.Fatal("expected SIXEL terminator and three reserved rows")
	}
}

func TestRenderImageCachesComparableImages(t *testing.T) {
	renderCache.Lock()
	clear(renderCache.entries)
	renderCache.Unlock()

	img := testImage()
	RenderImage(img, 2, 1, ImageANSI)
	RenderImage(img, 2, 1, ImageANSI)

	renderCache.Lock()
	defer renderCache.Unlock()
	if got := len(renderCache.entries); got != 1 {
		t.Fatalf("expected one cache entry, got %d", got)
	}
}

func testImage() *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, 2, 2))
	img.SetNRGBA(0, 0, color.NRGBA{R: 255, A: 255})
	img.SetNRGBA(1, 0, color.NRGBA{G: 255, A: 255})
	img.SetNRGBA(0, 1, color.NRGBA{B: 255, A: 255})
	img.SetNRGBA(1, 1, color.NRGBA{R: 255, G: 255, B: 255, A: 255})
	return img
}
