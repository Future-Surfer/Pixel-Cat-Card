"""Generic rectangle-stream encoder. Choreography and pixels come from JS."""
import json,os,shutil,subprocess,sys
from pathlib import Path
from PIL import Image,ImageDraw

data=json.load(sys.stdin)
assert 1 <= data['width'] <= 1600 and 1 <= data['height'] <= 900
assert 1 <= len(data['frames']) <= 3000
colours=list(dict.fromkeys(r['c'] for frame in [data.get('base',[]),*data['frames']] for r in frame))
assert len(colours)<=256
palette=[]
for colour in colours:
 assert len(colour)==7 and colour[0]=='#'
 palette.extend(int(colour[i:i+2],16) for i in (1,3,5))
palette.extend([0]*(768-len(palette)))
indices={c:i for i,c in enumerate(colours)}
base=Image.new('P',(data['width'],data['height']))
base.putpalette(palette)
base_draw=ImageDraw.Draw(base)
for r in data.get('base',[]):
 x,y,w,h=(r[k] for k in ('x','y','w','h'))
 base_draw.rectangle((x,y,x+w-1,y+h-1),fill=indices[r['c']])
frames=[]
for commands in data['frames']:
 image=base.copy()
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

if len(sys.argv)>2:
 video=Path(sys.argv[2]).resolve()
 assert video.name=='pixel-cat-routine.mp4' and video.parent.name=='.release'
 executable=os.environ.get('FFMPEG') or shutil.which('ffmpeg')
 if not executable:
  from imageio_ffmpeg import get_ffmpeg_exe
  executable=get_ffmpeg_exe()
 video.parent.mkdir(exist_ok=True)
 temporary=video.with_name('pixel-cat-routine.partial.mp4')
 arguments=[
  executable,'-hide_banner','-loglevel','error','-y',
  '-f','rawvideo','-pixel_format','rgb24',
  '-video_size',f"{data['width']}x{data['height']}",
  '-framerate',str(1000//data['frameMs']),'-i','pipe:0',
  '-vf','scale=1920:1080:flags=neighbor,setsar=1',
  '-an','-c:v','libx264','-pix_fmt','yuv420p','-crf','18',
  '-movflags','+faststart',str(temporary)
 ]
 with subprocess.Popen(arguments,stdin=subprocess.PIPE) as encoder:
  for frame in frames:
   encoder.stdin.write(frame.convert('RGB').tobytes())
  encoder.stdin.close()
  if encoder.wait()!=0:
   raise RuntimeError('MP4 encoding failed')
 subprocess.run([executable,'-v','error','-xerror','-i',str(temporary),'-f','null',os.devnull],check=True)
 temporary.replace(video)
 print(json.dumps({'file':str(video),'bytes':video.stat().st_size,'durationMs':total}))
