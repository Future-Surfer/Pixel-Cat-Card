"""Render exact borrowed grids; vertical offsets demonstrate proposed runtime motion."""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

folder = Path('frame-studio/user-sequences/startle-hop-2026-10-15')
project = json.loads((folder / 'project.json').read_text(encoding='utf-8'))['project']
offsets = [item['previewOffsetY'] for item in project['assembly']['sourceFrames']]
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
images = []
for frame, offset in zip(project['frames'], offsets):
    im = Image.new('RGB', (48, 48), '#dfe8ef')
    draw = ImageDraw.Draw(im)
    draw.line((4, 38, 44, 38), fill='#8e9fa8')
    for y, row in enumerate(frame['rows']):
        for x, token in enumerate(row):
            if token != '.':
                draw.point((12 + x, 14 + offset + y), fill='#23323c')
    images.append(im.resize((288, 288), Image.Resampling.NEAREST))
images[0].save(folder / 'startle-hop-preview.gif', save_all=True, append_images=images[1:],
               duration=[f['durationMs'] for f in project['frames'][:-1]] + [900], loop=0)

sheet = Image.new('RGB', (7 * 132, 188), '#14202a')
draw = ImageDraw.Draw(sheet)
draw.text((12, 8), 'Startle hop draft - exact borrowed pixels; motion supplied separately', font=font, fill='#e4edf3')
for i, frame in enumerate(project['frames']):
    x0 = i * 132 + 18
    for y, row in enumerate(frame['rows']):
        for x, token in enumerate(row):
            if token != '.':
                draw.rectangle((x0 + x * 4, 38 + y * 4, x0 + x * 4 + 3, 38 + y * 4 + 3), fill='#dfe8ef')
    draw.text((i * 132 + 10, 140), f"{i + 1} / {frame['durationMs']} ms / {frame['role']}", font=font, fill='#bad98e')
    draw.text((i * 132 + 10, 161), frame['name'], font=font, fill='#dbe7ef')
sheet.save(folder / 'startle-hop-sheet.png')
print('Rendered source sheet and suggested-motion GIF (extra recovery pause between repeats).')
