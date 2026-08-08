// Package imageview renders images in terminal-friendly formats.
package imageview

import (
	"image"
	"reflect"
	"sync"
)

// ImageMode is the terminal image protocol selected for a session.
type ImageMode int

const (
	// ImageSixel renders a SIXEL image for terminals that advertise support.
	ImageSixel ImageMode = iota
	// ImageANSI renders coloured upper-half block characters as a portable fallback.
	ImageANSI
)

const maxCacheEntries = 64

type cacheKey struct {
	image  image.Image
	width  int
	height int
	mode   ImageMode
}

var renderCache = struct {
	sync.Mutex
	entries map[cacheKey]string
}{entries: make(map[cacheKey]string)}

// DetectImageMode returns SIXEL only for terminals that explicitly advertise it.
// SSH environment variables belong to the client session, not the server process.
func DetectImageMode(env []string) ImageMode {
	values := make(map[string]string, len(env))
	for _, entry := range env {
		for i := 0; i < len(entry); i++ {
			if entry[i] == '=' {
				values[entry[:i]] = entry[i+1:]
				break
			}
		}
	}

	if values["XTERM_SIXEL"] == "1" || values["TERM"] == "xterm-sixel" {
		return ImageSixel
	}

	switch values["TERM_PROGRAM"] {
	case "WezTerm", "Contour", "mlterm", "xterm.js", "xtermjs":
		return ImageSixel
	default:
		return ImageANSI
	}
}

// RenderImage resizes img to terminal-cell dimensions and returns SIXEL or ANSI output.
// SIXEL uses an 8x16 pixel cell so its visual footprint matches the requested dimensions.
func RenderImage(img image.Image, width, height int, mode ImageMode) string {
	if img == nil || width <= 0 || height <= 0 {
		return ""
	}

	key, cacheable := cacheKeyFor(img, width, height, mode)
	if cacheable {
		renderCache.Lock()
		cached, ok := renderCache.entries[key]
		renderCache.Unlock()
		if ok {
			return cached
		}
	}

	var rendered string
	switch mode {
	case ImageSixel:
		rendered = renderSixel(img, width, height)
	default:
		rendered = renderANSI(img, width, height)
	}

	if cacheable {
		renderCache.Lock()
		if len(renderCache.entries) >= maxCacheEntries {
			clear(renderCache.entries)
		}
		renderCache.entries[key] = rendered
		renderCache.Unlock()
	}

	return rendered
}

func cacheKeyFor(img image.Image, width, height int, mode ImageMode) (cacheKey, bool) {
	value := reflect.ValueOf(img)
	if !value.IsValid() || !value.Type().Comparable() {
		return cacheKey{}, false
	}

	return cacheKey{image: img, width: width, height: height, mode: mode}, true
}
