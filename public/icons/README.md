# Icons

Place `icon-192.png` (192×192) and `icon-512.png` (512×512) in this folder before deploying.

Quick way to generate placeholders with ImageMagick:

```bash
convert -size 192x192 xc:#7aa2ff -gravity center -pointsize 96 -fill black -annotate 0 "J" icon-192.png
convert -size 512x512 xc:#7aa2ff -gravity center -pointsize 256 -fill black -annotate 0 "J" icon-512.png
```

Or use https://realfavicongenerator.net/ for a polished set.
