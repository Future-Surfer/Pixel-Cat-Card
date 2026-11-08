"""Render exact runtime samples, without editing source artwork."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
clips = json.loads(Path('.studio-data/startle-motion-samples.json').read_text())
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 14)
images = []
for i in range(len(clips[0]['samples'])):
    image = Image.new('RGB', (640, 290), '#dfe8ef')
    draw = ImageDraw.Draw(image)
    for row, clip in enumerate(clips):
        oy = row * 145
        draw.text((14, oy + 7), clip['label'], font=font, fill='#23323c')
        draw.line((12, oy + 130, 628, oy + 130), fill='#8e9fa8', width=2)
        sx = clip['sourceX'] * 4
        draw.ellipse((sx - 5, oy + 94, sx + 5, oy + 104), fill='#d76550')
        p = clip['samples'][i]
        for y, line in enumerate(p['rows']):
            for x, token in enumerate(line):
                if token != '.':
                    px, py = round((p['x'] + x) * 4), round(oy + 130 + (p['top'] + y - 55) * 4)
                    draw.rectangle((px, py, px + 3, py + 3), fill='#23323c')
    images.append(image)
images[0].save('frame-studio/user-sequences/startle-hop-2026-10-15/directional-startle.gif', save_all=True, append_images=images[1:], duration=[25] * (len(images)-1) + [900], loop=0)
