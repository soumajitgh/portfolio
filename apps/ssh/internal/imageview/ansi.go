package imageview

import (
	"fmt"
	"image"
	"image/color"
	"strings"
)

var background = color.NRGBA{R: 13, G: 17, B: 23, A: 255}

// renderANSI uses one coloured upper-half block for each terminal cell. The
// foreground is the top pixel and the background is the bottom pixel.
func renderANSI(img image.Image, width, height int) string {
	resized := resize(img, width, height*2)
	var output strings.Builder
	output.Grow(width * height * 40)

	for y := 0; y < height*2; y += 2 {
		for x := 0; x < width; x++ {
			top := resized.NRGBAAt(x, y)
			bottom := resized.NRGBAAt(x, y+1)
			fmt.Fprintf(
				&output,
				"\x1b[38;2;%d;%d;%dm\x1b[48;2;%d;%d;%dm▀",
				top.R, top.G, top.B, bottom.R, bottom.G, bottom.B,
			)
		}
		output.WriteString("\x1b[0m")
		if y+2 < height*2 {
			output.WriteByte('\n')
		}
	}

	return output.String()
}

func resize(source image.Image, width, height int) *image.NRGBA {
	target := image.NewNRGBA(image.Rect(0, 0, width, height))
	bounds := source.Bounds()
	if bounds.Empty() {
		return target
	}

	for y := range height {
		sourceY := bounds.Min.Y + y*bounds.Dy()/height
		for x := range width {
			sourceX := bounds.Min.X + x*bounds.Dx()/width
			pixel := color.NRGBAModel.Convert(source.At(sourceX, sourceY)).(color.NRGBA)
			target.SetNRGBA(x, y, composite(pixel))
		}
	}

	return target
}

func composite(pixel color.NRGBA) color.NRGBA {
	if pixel.A == 255 {
		return pixel
	}

	alpha := int(pixel.A)
	return color.NRGBA{
		R: uint8((int(pixel.R)*alpha + int(background.R)*(255-alpha) + 127) / 255),
		G: uint8((int(pixel.G)*alpha + int(background.G)*(255-alpha) + 127) / 255),
		B: uint8((int(pixel.B)*alpha + int(background.B)*(255-alpha) + 127) / 255),
		A: 255,
	}
}
