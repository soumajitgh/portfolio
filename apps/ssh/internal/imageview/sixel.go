package imageview

import (
	"fmt"
	"image"
	"image/color"
	"sort"
	"strings"
)

const (
	sixelPixelsPerCellX = 8
	sixelPixelsPerCellY = 16
	sixelPaletteSize    = 4
)

// renderSixel encodes a compact 4x4x4 RGB palette, which is enough for a
// profile-sized image while keeping the escape sequence practical over SSH.
func renderSixel(img image.Image, width, height int) string {
	pixelWidth := width * sixelPixelsPerCellX
	pixelHeight := height * sixelPixelsPerCellY
	resized := resize(img, pixelWidth, pixelHeight)

	var output strings.Builder
	fmt.Fprintf(&output, "\x1bPq\"1;1;%d;%d", pixelWidth, pixelHeight)

	for top := 0; top < pixelHeight; top += 6 {
		planes := make(map[int][]byte)
		for x := range pixelWidth {
			for offset := 0; offset < 6 && top+offset < pixelHeight; offset++ {
				colour := sixelColour(resized.NRGBAAt(x, top+offset))
				if _, ok := planes[colour]; !ok {
					planes[colour] = make([]byte, pixelWidth)
				}
				planes[colour][x] |= 1 << offset
			}
		}

		colours := make([]int, 0, len(planes))
		for colour := range planes {
			colours = append(colours, colour)
		}
		sort.Ints(colours)

		for index, colour := range colours {
			if index > 0 {
				output.WriteByte('$')
			}
			writeSixelColour(&output, colour)
			writeSixelPlane(&output, planes[colour])
		}
		if top+6 < pixelHeight {
			output.WriteByte('-')
		}
	}

	output.WriteString("\x1b\\")
	// SIXEL does not reserve terminal rows itself; reserve the requested cells
	// so Bubble Tea can place subsequent text beneath the image.
	output.WriteString(strings.Repeat("\n", height))
	return output.String()
}

func sixelColour(pixel color.NRGBA) int {
	toLevel := func(component uint8) int {
		return int(component) * (sixelPaletteSize - 1) / 255
	}

	return toLevel(pixel.R)*sixelPaletteSize*sixelPaletteSize +
		toLevel(pixel.G)*sixelPaletteSize + toLevel(pixel.B)
}

func writeSixelColour(output *strings.Builder, colour int) {
	red := colour / (sixelPaletteSize * sixelPaletteSize)
	green := (colour / sixelPaletteSize) % sixelPaletteSize
	blue := colour % sixelPaletteSize
	step := 100 / (sixelPaletteSize - 1)
	fmt.Fprintf(output, "#%d;2;%d;%d;%d", colour, red*step, green*step, blue*step)
}

func writeSixelPlane(output *strings.Builder, plane []byte) {
	for start := 0; start < len(plane); {
		value := plane[start]
		end := start + 1
		for end < len(plane) && plane[end] == value {
			end++
		}

		count := end - start
		if count >= 3 {
			fmt.Fprintf(output, "!%d%c", count, '?'+value)
		} else {
			for range count {
				output.WriteByte('?' + value)
			}
		}
		start = end
	}
}
