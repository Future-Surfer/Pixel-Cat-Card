"""Render saved pixel grids at the same gait speed with separate head clocks."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
project = json.loads((root / 'prototype/walk-head-development-project.json').read_text(encoding='utf-8'))
grids = {(f['source']['index'], f['source']['headIndex']): f['rows'] for f in project['frames']}
frames = []
for step in range(16):
    frame = Image.new('RGB', (400, 222), '#edf1f5')
    draw = ImageDraw.Draw(frame)
    draw.text((34, 14), 'Original head timing', fill='#243849')
    draw.text((232, 14), 'Half-time head', fill='#243849')
    draw.text((70, 204), 'Same 32-cell/s gait and paw cells', fill='#243849')
    gait = (step + 1) % 4
    for side in range(2):
        phase = (step + 1 if side == 0 else step // 2 + 1) % 4
        rows = grids[(gait, 0 if phase in (0, 3) else 1)]
        x0, y0, scale = 30 + side * 200, 46, 6
        draw.line((x0, y0 + 144, x0 + 144, y0 + 144), fill='#9b7958', width=2)
        for y, row in enumerate(rows):
            for x, token in enumerate(row):
                if token == '.':
                    continue
                draw.rectangle((x0 + x * scale, y0 + y * scale, x0 + (x + 1) * scale - 1, y0 + (y + 1) * scale - 1), fill='#dc6c64' if token == 'R' else '#202a32')
    frames.append(frame)
frames[0].save(root / 'prototype/walk-head-comparison.gif', save_all=True, append_images=frames[1:], duration=30, loop=0, disposal=2)
frames[3].save(root / 'prototype/walk-head-comparison.png')
print('Rendered head cadence comparison from saved development pixel frames.')
