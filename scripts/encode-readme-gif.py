"""Generic rectangle-stream encoder. Choreography and pixels come from JS."""
import json,sys
from pathlib import Path
from PIL import Image,ImageDraw

data=json.load(sys.stdin)
assert 1 <= data['width'] <= 1600 and 1 <= data['height'] <= 900
assert 1 <= len(data['frames']) <= 1000
colours=list(dict.fromkeys(r['c'] for frame in data['frames'] for r in frame))
assert len(colours)<=256
palette=[]
for colour in colours:
 assert len(colour)==7 and colour[0]=='#'
 palette.extend(int(colour[i:i+2],16) for i in (1,3,5))
palette.extend([0]*(768-len(palette)))
indices={c:i for i,c in enumerate(colours)}
frames=[]
for commands in data['frames']:
 image=Image.new('P',(data['width'],data['height']))
 image.putpalette(palette)
 draw=ImageDraw.Draw(image)
 for r in commands:
  x,y,w,h=(r[k] for k in ('x','y','w','h'))
  draw.rectangle((x,y,x+w-1,y+h-1),fill=indices[r['c']])
 frames.append(image)
target=Path(sys.argv[1]).resolve()
assert target.name=='pixel-cat-routine.gif' and target.parent.name=='images'
frames[0].save(target,save_all=True,append_images=frames[1:],duration=data['frameMs'],loop=0,disposal=2,optimize=True)
with Image.open(target) as check:
 assert check.size==(data['width'],data['height'])
 assert check.info.get('loop')==0
 total=0
 for i in range(check.n_frames):
  check.seek(i);total+=check.info['duration']
 assert total==len(frames)*data['frameMs']
print(json.dumps({'file':str(target),'bytes':target.stat().st_size,'frames':len(frames),'durationMs':total}))
