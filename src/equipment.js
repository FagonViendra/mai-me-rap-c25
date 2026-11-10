/* MảiMêRáp: owned equipment, shared item-type wear, and render-only appearance. */
(() => {
 'use strict';
 const V=globalThis.Voxel ||= {},MAX_STACK=99999,SLOTS=Object.freeze(['head','body','feet','charm']),stores=new WeakMap();
 const palettes={copper:{color:[.76,.47,.29],trim:[.95,.70,.40]},prism:{color:[.43,.66,.70],trim:[.83,.74,.97]},trail:{color:[.30,.68,.53],trim:[.83,.93,.69]},courage:{color:[.60,.40,.75],trim:[.97,.78,.46]}};
 for(const p of Object.values(palettes)){Object.freeze(p.color);Object.freeze(p.trim);Object.freeze(p);}Object.freeze(palettes);
 const definitions=[
  [176,'Mũ đồng','head','copper',.06,120,1,1,'copper'],
  [177,'Giáp đồng','body','copper',.12,200,1,1,'copper'],
  [178,'Ủng đồng','feet','copper',.06,150,1,1,'copper'],
  [179,'Mũ lăng kính','head','prism',.10,220,1,1,'prism'],
  [180,'Giáp lăng kính','body','prism',.18,340,1,1,'prism'],
  [181,'Ủng lăng kính','feet','prism',.10,260,1,1,'prism'],
  [182,'Bùa nhịp bước','charm','charm',0,0,1.08,1,'trail'],
  [183,'Bùa dũng khí','charm','charm',0,0,1,1.15,'courage']
 ];
 const SPECS=Object.freeze(Object.fromEntries(definitions.map(([id,name,slot,tier,defense,maxDurability,move,melee,palette])=>[id,Object.freeze({id,name,slot,tier,defense,maxDurability,move,melee,palette:palettes[palette]})])));
 const messages=Object.freeze({inactive:'Mở một thế giới đang chơi để thay trang bị.',slot:'Ô trang bị không hợp lệ.',item:'Vật phẩm không thuộc ô trang bị này.',stock:'Bạn chưa có món trang bị này trong túi.',full:'Túi đồ đã đầy loại vật phẩm cần trả lại.',inventory:'Túi đồ chưa hợp lệ. Hãy tải lại bản lưu.',catalog:'Trang bị chưa có trong danh mục.'});
 const empty=()=>({version:1,slots:{head:0,body:0,feet:0,charm:0},wear:{}});
 const copy=data=>({version:1,slots:{...data.slots},wear:{...data.wear}});
 const fail=reason=>({ok:false,changed:false,reason,message:messages[reason]||'Chưa thể đổi trang bị.'});
 function dataObject(value,label){if(!value||typeof value!=='object'||Array.isArray(value))throw TypeError(label+' phải là một đối tượng.');for(const k of Reflect.ownKeys(value)){const d=Object.getOwnPropertyDescriptor(value,k);if(typeof k!=='string'||!d||!('value'in d))throw TypeError(label+' có trường không hợp lệ.');}return value;}
 function exactKeys(value,keys,label){dataObject(value,label);const got=Reflect.ownKeys(value).sort();if(got.length!==keys.length||got.some((k,i)=>k!==[...keys].sort()[i]))throw TypeError(label+' có trường thừa hoặc thiếu.');}
 function validateSaved(value){
  if(value===undefined)return empty();exactKeys(value,['version','slots','wear'],'Trang bị');if(value.version!==1)throw TypeError('Phiên bản trang bị không được hỗ trợ.');exactKeys(value.slots,SLOTS,'Các ô trang bị');dataObject(value.wear,'Độ mòn trang bị');const out=empty();
  for(const slot of SLOTS){const id=value.slots[slot];if(!Number.isInteger(id)||id!==0&&(!SPECS[id]||SPECS[id].slot!==slot))throw TypeError('Vật phẩm sai ô trang bị: '+slot);out.slots[slot]=id;}
  for(const key of Reflect.ownKeys(value.wear)){const n=value.wear[key];if(!/^[1-9][0-9]{0,2}$/.test(key))throw TypeError('Mã độ mòn không hợp lệ.');const spec=SPECS[Number(key)];if(!spec?.maxDurability||!Number.isInteger(n)||n<0||n>=spec.maxDurability)throw TypeError('Độ mòn trang bị ngoài giới hạn.');if(n)out.wear[key]=n;}
  return out;
 }
 function record(app,create=true){if(!app||typeof app!=='object')throw TypeError('Ứng dụng trang bị không hợp lệ.');let s=stores.get(app);if(!s||s.id!==app.id||s.world!==app.world){if(!create)return null;s={id:app.id,world:app.world,data:empty()};stores.set(app,s);}return s;}
 const read=app=>record(app,false)?.data||empty();
 function prune(app,data){for(const key of Object.keys(data.wear))if(!Object.values(data.slots).includes(Number(key))&&!(app.inventory?.[key]>0))delete data.wear[key];return data;}
 function init(app,saved){const data=validateSaved(saved);prune(app,data);stores.set(app,{id:app.id,world:app.world,data});return view(app);}
 function snapshot(app){const s=record(app);prune(app,s.data);return copy(s.data);}
 function inventoryCopy(app){const source=app.inventory;if(!source||typeof source!=='object'||Array.isArray(source))return null;const inv={};for(const key of Reflect.ownKeys(source)){const d=Object.getOwnPropertyDescriptor(source,key);if(typeof key!=='string'||!/^[1-9][0-9]{0,2}$/.test(key)||!d||!('value'in d)||!Object.hasOwn(V.items||{},key)||!Number.isInteger(d.value)||d.value<0||d.value>MAX_STACK)return null;inv[key]=d.value;}return inv;}
 function ready(app){return !!(app&&app.started&&app.playing&&!app.inHome&&!app.starting&&!app.contextLost&&Number.isFinite(app.player?.health)&&app.player.health>0);}
 function clearEmptyHotbar(app){let changed=false;if(Array.isArray(app.hotbar))app.hotbar=app.hotbar.map(id=>{if(id&&!(app.inventory[id]>0)){changed=true;return 0;}return id;});return changed;}
 function equip(app,slot,id){
  if(!ready(app))return fail('inactive');if(!SLOTS.includes(slot))return fail('slot');const spec=SPECS[id];if(!Number.isInteger(id)||!spec||spec.slot!==slot)return fail('item');if(!Object.hasOwn(V.items||{},id))return fail('catalog');
  const inv=inventoryCopy(app);if(!inv)return fail('inventory');const s=record(app),before=s.data,old=before.slots[slot];if(old===id)return{ok:true,changed:false,slot,id,returned:0,hotbarChanged:false,message:'Bạn đang mang món trang bị này.'};if(!(inv[id]>0))return fail('stock');if(old&&(inv[old]||0)>=MAX_STACK)return fail('full');
  const data=copy(before);inv[id]-=1;if(old)inv[old]=(inv[old]||0)+1;data.slots[slot]=id;prune({...app,inventory:inv},data);
  app.inventory=inv;s.data=data;const hotbarChanged=clearEmptyHotbar(app);return{ok:true,changed:true,slot,id,returned:old,consumed:id,hotbarChanged,message:'Đã trang bị '+spec.name.toLocaleLowerCase('vi')+'.'};
 }
 function unequip(app,slot){
  if(!ready(app))return fail('inactive');if(!SLOTS.includes(slot))return fail('slot');const inv=inventoryCopy(app);if(!inv)return fail('inventory');const s=record(app),id=s.data.slots[slot];if(!id)return{ok:true,changed:false,slot,id:0,returned:0,hotbarChanged:false,message:'Ô trang bị này đang trống.'};if((inv[id]||0)>=MAX_STACK)return fail('full');
  const data=copy(s.data);data.slots[slot]=0;inv[id]=(inv[id]||0)+1;prune({...app,inventory:inv},data);app.inventory=inv;s.data=data;return{ok:true,changed:true,slot,id:0,returned:id,hotbarChanged:false,message:'Đã cất '+SPECS[id].name.toLocaleLowerCase('vi')+' vào túi.'};
 }
 function bonuses(app){const data=read(app);let defense=0,move=1,melee=1;for(const id of Object.values(data.slots)){const spec=SPECS[id];if(!spec)continue;defense+=spec.defense;move*=spec.move;melee*=spec.melee;}return{move,melee,defense:Math.min(.45,defense)};}
 function mitigate(app,amount,kind='combat'){
  if(!Number.isFinite(amount)||amount<0)throw RangeError('Sát thương phải là số hữu hạn không âm.');const protection=bonuses(app).defense,protectedHit=['combat','projectile','explosion'].includes(kind)&&amount>0&&protection>0;
  if(!protectedHit)return{damage:amount,absorbed:0,defense:0,broken:[],changed:false,kind};
  const s=record(app),data=copy(s.data),broken=[],wearCost=Math.min(1000000,Math.max(1,Math.ceil(amount)));
  for(const slot of SLOTS){const id=data.slots[slot],spec=SPECS[id];if(!spec?.maxDurability)continue;const next=(data.wear[id]||0)+wearCost;if(next>=spec.maxDurability){data.slots[slot]=0;delete data.wear[id];broken.push(id);}else data.wear[id]=next;}
  prune(app,data);s.data=data;const damage=amount*(1-protection);return{damage,absorbed:amount-damage,defense:protection,broken,changed:true,kind,wearCost};
 }
 function description(slot,id,data,count){const s=SPECS[id];return{slot,id:id||0,name:s?.name||'Trống',tier:s?.tier||null,defense:s?.defense||0,wear:s?.maxDurability?(data.wear[id]||0):0,maxDurability:s?.maxDurability||0,remaining:s?.maxDurability?s.maxDurability-(data.wear[id]||0):0,...(count===undefined?{}:{count,move:s?.move||1,melee:s?.melee||1})};}
 function view(app){const data=read(app);return{version:1,slots:Object.fromEntries(SLOTS.map(slot=>[slot,description(slot,data.slots[slot],data)])),totals:bonuses(app),available:Object.values(SPECS).filter(s=>app.inventory?.[s.id]>0).map(s=>description(s.slot,s.id,data,app.inventory[s.id]))};}
 function appearance(app){const data=read(app),out={version:1};for(const slot of SLOTS){const id=data.slots[slot],spec=SPECS[id];out[slot]=spec?{id,tier:spec.tier,color:spec.palette.color.slice(),trim:spec.palette.trim.slice()}:null;}return out;}
 V.equipment=Object.freeze({SLOTS,SPECS,MAX_STACK,validateSaved,init,snapshot,view,equip,unequip,mitigate,bonuses,appearance});
})();