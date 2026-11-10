"""Embed seven exact scene envelopes. No network or save-format changes."""
from pathlib import Path
import argparse, hashlib, json
root=Path(__file__).resolve().parent.parent
specs=[
 ('inferno','worlds/c21_realms_vuc_lua_v1.json',117775,'816037b48753d78a85f32e4005fdfc4a125e79cb217f11e849f8b89aa3a4f028'),
 ('sky','worlds/c21_realms_thien_gioi_v1.json',109584,'a0dacd0e17a02269797304bf65f87d59fb4456694d0f740243f7bf66d9626851'),
 ('workshop','worlds/c23_workshop_c20_original.json',91478,'de7aeedea490d1b110ef983ad0be98e0e9152a5f901dac8b7ea63fe31c53749f'),
 ('lake_village','worlds/01_xom_ven_ho.json',129820,'42e1e83873b064a714c1c96db7d4ee5a66932ec2a8e4865feff1f2a12994534f'),
 ('sky_garden','worlds/02_vuon_tren_cao.json',120347,'9bb7bc095b836b9c9c54e85ccfd1c209090e3b97da773d99e69fb19166ba205c'),
 ('market_workshop','worlds/03_khu_cho_xuong.json',148434,'082c4c60243bd50e0d62d95f5e8b1dd7ddea661a9bac137a097626064eb69972'),
 ('forest_farm','worlds/04_nong_trai_ven_rung.json',142072,'cc1555183021f8d827668ca11533881c6256dbb2264532ed4729cf22a1b55fb2')
]
entries=[]
for scene_id,relative,size,digest in specs:
 raw=(root/relative).read_bytes()
 if len(raw)!=size or hashlib.sha256(raw).hexdigest()!=digest:
  raise SystemExit('Scene input pin differs: '+relative)
 text=raw.decode('utf-8')
 envelope=json.loads(text)
 if envelope.get('format')!='mien-khoi' or envelope.get('version')!=1 or not isinstance(envelope.get('payload'),str):
  raise SystemExit('Scene envelope differs: '+relative)
 json.loads(envelope['payload'])
 entries.append(dict(id=scene_id,bytes=size,sha256=digest,text=text))
encoded=json.dumps(entries,ensure_ascii=True,separators=(',',':')).replace('<',r'\u003c').replace('\u2028',r'\u2028').replace('\u2029',r'\u2029')
source="/* C24 built-in scenes: exact pinned realm, workshop and expansion envelopes. */\n(() => {\n  'use strict';\n  globalThis.Voxel ||= {};\n  globalThis.Voxel.builtInScenes=Object.freeze("+encoded+".map(Object.freeze));\n})();\n"
result=source.encode('utf-8')
parser=argparse.ArgumentParser(description='Generate or check the pinned C24 scene data.')
parser.add_argument('--check',action='store_true',help='Compare the existing target without writing.')
parser.add_argument('--output',help='Optional output path, relative to the C24 source root.')
args=parser.parse_args()
target=Path(args.output) if args.output else root/'src/scene-library-data.js'
if not target.is_absolute():target=root/target
existing=target.read_bytes() if target.exists() else None
if args.check:
 if existing!=result:raise SystemExit('Generated scene data differs: '+str(target))
else:
 if existing is not None and existing!=result and hashlib.sha256(existing).hexdigest()!='6632c7030bebb07a4c5f74cc4cb15648a3467b50a3707ce6298f24669b59e737':
  raise SystemExit('Refusing to overwrite modified scene data: '+str(target))
 if existing!=result:
  target.parent.mkdir(parents=True,exist_ok=True)
  target.write_bytes(result)
print(json.dumps({'file':str(target),'bytes':len(result),'sha256':hashlib.sha256(result).hexdigest(),'sceneIds':[x['id'] for x in entries],'checked':args.check}))
