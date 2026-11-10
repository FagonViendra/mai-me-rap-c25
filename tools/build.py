"""Build the single-file offline game from readable source. Standard library only."""
from pathlib import Path
import argparse, datetime, hashlib, json, sys
root = Path(__file__).resolve().parent.parent
src = root / 'src'
names = ['crafted-blocks.js','catalog.js','block-shapes.js','world-coordinates.js','wall-torches.js','world.js','realm-generation.js','sky-generation.js','mesher.js','render-origin.js','cube-batch.js','rigid-cube-batch.js','ore-vision.js','sun-shadows.js','block-effects.js','weather-state.js','weather-renderer.js','renderer.js','mc-java.js','mc-bedrock.js','mc-container.js','import-world-core.js','world-manager.js','spawn-safety.js','tree-growth.js','farming.js','furnaces.js','villager-trading.js','gameplay-ui.js','crafting-grid.js','villager-model.js','entities.js','mounts.js','journey.js','equipment.js','guardian.js','adventure-ui.js','held-item.js','lighting.js','dimensions.js','presentation-camera.js','camera-motion.js','player-avatar.js','import-ui.js','scene-library-data.js','scene-library.js','saved-worlds.js','game.js','diagnostics.js']
missing = [n for n in names if n != 'entities.js' and not (src/n).is_file()]
if missing:
    raise SystemExit('Missing source: '+', '.join(missing))
worker_names = ['mc-java.js','mc-bedrock.js','mc-container.js','import-world-core.js','import-worker.js']
worker_source = '\n'.join((src/n).read_text(encoding='utf-8-sig') for n in worker_names)
scripts = ['globalThis.Voxel ||= {}; globalThis.Voxel.MC_IMPORT_WORKER_SOURCE = '+json.dumps(worker_source,ensure_ascii=False)+';']
for name in names:
    if (src/name).is_file():
        scripts.append('\n/* ===== '+name+' ===== */\n'+(src/name).read_text(encoding='utf-8-sig'))
guard = "window.__voxelErrors=[];window.addEventListener('error',e=>{window.__voxelErrors.push({message:e.message,file:e.filename,line:e.lineno});if(window.__voxelErrors.length>200)window.__voxelErrors.shift();});"
html = '<!doctype html>\n<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta name="theme-color" content="#28352b"><meta name="description" content="MảiMêRáp: xây dựng, nông trại, trang bị và Hành trình Lăng Kính trong thế giới voxel ngoại tuyến."><title>MảiMêRáp — Hành trình Lăng Kính</title><link rel="icon" href="data:,"><style>\n'+((src/'style.css').read_text(encoding='utf-8-sig')+'\n'+(src/'import-style.css').read_text(encoding='utf-8-sig')+'\n'+(src/'adventure-style.css').read_text(encoding='utf-8-sig'))+'\n</style></head><body>\n'+((src/'ui.html').read_text(encoding='utf-8-sig')+'\n'+(src/'import-panel.html').read_text(encoding='utf-8-sig')+'\n'+(src/'adventure-panel.html').read_text(encoding='utf-8-sig'))+'\n<script>\n'+guard+'\n'+'\n'.join(scripts).replace('</script','<\\/script')+'\n</script></body></html>\n'
parser = argparse.ArgumentParser(description='Create an immutable single-file game build.')
parser.add_argument('--output', help='New destination HTML; an existing file is never overwritten.')
args = parser.parse_args()
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
target = Path(args.output) if args.output else root/'builds'/stamp/'MAI_ME_RAP.html'
if not target.is_absolute():
    target = root/target
manifest_path = target.parent/'BUILD.json'
if target.exists() or manifest_path.exists():
    raise SystemExit('Refusing to overwrite an existing build: '+str(target))
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(html,encoding='utf-8',newline='\n')
manifest = {'file':target.name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'sources':{n:hashlib.sha256((src/n).read_bytes()).hexdigest() for n in names+['style.css','ui.html','import-style.css','import-panel.html','import-worker.js','adventure-style.css','adventure-panel.html'] if (src/n).is_file()},'builder_sha256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'external_dependencies':[]}
manifest_path.write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,ensure_ascii=False))
