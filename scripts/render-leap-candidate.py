"""Render exact Frame Studio cells for review; does not generate or alter artwork."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
frame = json.loads((root / 'prototype/horizontal-leap-candidate.json').read_text(encoding='utf-8'))
assert frame['origin'] == 'ai' and frame['review'] in ('candidate', 'accepted')
assert len(frame['rows']) == 24 and all(len(row) == 24 for row in frame['rows'])
native = Image.new('RGBA', (24, 24))
preview = Image.new('RGB', (288, 288), '#edf1f5')
draw = ImageDraw.Draw(preview)
for y, row in enumerate(frame['rows']):
    for x, token in enumerate(row):
        ink = token != '.'
        native.putpixel((x, y), (32, 42, 50, 255) if ink else (0, 0, 0, 0))
        colour = '#202a32' if ink else ('#edf1f5' if (x // 2 + y // 2) % 2 else '#e0e6ed')
        draw.rectangle((x * 12, y * 12, x * 12 + 11, y * 12 + 11), fill=colour)
native.save(root / 'prototype/horizontal-leap-candidate-24.png')
preview.save(root / 'prototype/horizontal-leap-candidate-preview.png')
print('Rendered AI candidate at native 24 px and exact 12x pixel scale.')
