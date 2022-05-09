## Preparing the spritesheet

Let's prepare our spritesheet for using it in our game.

### Background transparency

Our sprite's background is pink. That's not ideal because we don't want Mario to be surrounded by a pink square in our game. Let's use ImageMagick to convert the pink pixels to transparent ones.

First, install ImageMagick

- `brew install imagemagick`

First, identify the actual color of the pixels we want to convert. ImageMagick's `identify` command will provide us with tons of information about the image. Specifically, we're interested in what color has the most number of pixels, because the background is by far the most prominent color on the sheet.

Run the following command:

- `identify -verbose smb.png`

Look for the Histogram section.

```
 Histogram:
          4862: (107,138,255,255) #6B8AFFFF srgba(107,138,255,1)
           697: (115,105,0,255) #736900FF srgba(115,105,0,1)
           616: (222,0,0,255) #DE0000FF srgba(222,0,0,1)
           521: (255,178,16,255) #FFB210FF srgba(255,178,16,1)
```

We can see that most of the pixels (4,862 out of 6,687 total) are of the color `#6B8AFFFF`. This is the color we want to make transparent, which we can do with ImageMagick's `convert` command.

Run the following command:

- `convert smb.png -transparent "#6B8AFFFF" spritesheet.png`

We should have a new file `spritesheet.png` that has the same Mario sprites, but now with a transparent background!

### Scale the image

Our spritesheet is a bit smaller than we'd like. We can use the `convert` utility to upscale it.

Run the following command:

- `convert spritesheet.png -scale "400%" -interpolate Integer -filter point spritesheet4x.png`

The `interpolate` and `filter` options prevent any anti-aliasing or blending; we want to preserve Mario's pixelated style!


