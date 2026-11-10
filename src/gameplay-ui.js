/* MảiMêRáp — accessible furnace and villager panels. */
(() => {
 'use strict';const V=globalThis.Voxel||={},states=new WeakMap(),$=id=>document.getElementById(id);
 function state(app){return states.get(app);}
 function icon(id,ctx){const im=document.createElement('img');im.src=ctx.icon(id);im.alt='';return im;}
 function goods(rows,ctx){const frag=document.createDocumentFragment();for(const[id,n]of rows){const span=document.createElement('span');span.className='goods-item';span.append(icon(id,ctx),document.createTextNode(n+' '+ctx.item(id).name));frag.append(span);}return frag;}
 function refresh(app,grants=[]){const s=state(app);if(!s)return;
  if(app.mode==='survival')app.hotbar=app.hotbar.map(id=>id&&!(app.inventory[id]>0)?0:id);
  for(const[id]of grants)if(app.inventory[id]>0&&!app.hotbar.includes(id)){const empty=app.hotbar.indexOf(0);if(empty>=0)app.hotbar[empty]=id;}
  app.api.renderHotbar();app.api.updateHUD();
 }
 function result(app,r,grants=[]){
  if(!r?.ok){app.api.toast(r?.message||'Chưa thể hoàn tất.');return false;}
  refresh(app,grants);app.api.save(false);return true;
 }
 function batch(){const n=Number($('tradeBatch').value);return Number.isInteger(n)&&n>=1&&n<=16?n:0;}
 function renderTrade(app,force=false){
  const s=state(app);if(!s||app.panel!=='trade')return;
  const v=V.trading.view(app);if(!v.open){app.api.closePanel();app.api.toast(v.message);return;}
  $('tradeRole').textContent=v.roleName;$('tradeHint').textContent='Có thể trao đổi nhiều lần · Vật phẩm được lấy từ túi đồ.';
  if(force||s.tradeRole!==v.role||!s.tradeRows){
   s.tradeRole=v.role;s.tradeRows=[];const cards=[];
   for(const offer of v.offers){
    const card=document.createElement('article');card.className='trade-card';card.dataset.offer=offer.id;
    const h=document.createElement('h3');h.textContent=offer.name;
    const need=document.createElement('div');need.className='trade-goods';need.append(goods(offer.need,s.ctx));
    const arrow=document.createElement('span');arrow.className='trade-arrow';arrow.textContent='↓';
    const out=document.createElement('div');out.className='trade-goods';out.append(goods(offer.out,s.ctx));
    const button=document.createElement('button');button.className='pixel-button primary';button.dataset.trade=offer.id;button.textContent='Trao đổi';
    const status=document.createElement('small');status.className='trade-status';status.setAttribute('aria-live','polite');
    button.onclick=()=>{const r=V.trading.trade(app,offer.id,batch());if(result(app,r,r.grants||[])){app.api.toast(r.message);$('tradeMessage').textContent=r.message;}renderTrade(app);};
    card.append(h,need,arrow,out,button,status);cards.push(card);s.tradeRows.push({offer,button,status});
   }
   $('tradeOffers').replaceChildren(...cards);
  }
  const n=batch();$('tradeMessage').textContent=n?'Số lượng bên trên là giá cho 1 lượt.':'Nhập số lượt nguyên từ 1 đến 16.';
  for(const row of s.tradeRows){const q=V.trading.quote(app,row.offer.id,n);row.button.disabled=!q.ok;row.button.textContent=n>1?'Trao đổi ×'+n:'Trao đổi';row.status.textContent=q.ok?'Có thể đổi tối đa '+q.maxBatch+' lượt':q.reason==='cooldown'?'Đang chuẩn bị lượt tiếp theo…':q.message;}
  const gem=app.inventory[123]||0;$('tradeBalance').textContent=gem+' ngọc trong túi';
 }
 function fillChoice(app,slot,table,preferred){
  const select=$(slot==='input'?'furnaceInputChoice':'furnaceFuelChoice'),prior=Number(select.value),ids=Object.keys(table).map(Number).filter(id=>(app.inventory[id]||0)>0),signature=ids.map(id=>id+':'+app.inventory[id]).join('|'),optionsChanged=select.dataset.signature!==signature;
  if(optionsChanged){
   select.dataset.signature=signature;
   if(!ids.length){const op=document.createElement('option');op.value='0';op.textContent=slot==='input'?'Chưa có nguyên liệu phù hợp':'Chưa có nhiên liệu';select.replaceChildren(op);}
   else select.replaceChildren(...ids.map(id=>{const op=document.createElement('option');op.value=String(id);op.textContent=V.items[id].name+' · '+app.inventory[id];return op;}));
  }
  if(optionsChanged||(slot==='input'&&ids.includes(preferred)))select.value=String(slot==='input'&&ids.includes(preferred)?preferred:ids.includes(prior)?prior:ids.includes(preferred)?preferred:ids[0]||0);
  select.disabled=!ids.length;
  for(const n of[1,8])$(slot==='input'?'furnaceInputAdd'+n:'furnaceFuelAdd'+n).disabled=!ids.includes(Number(select.value))||(app.inventory[select.value]||0)<n;
 }
 function slotView(slot,id,count,s){
  const el=$('furnace'+slot+'Slot');el.replaceChildren();
  if(id&&count){el.append(icon(id,s.ctx));const amount=document.createElement('strong');amount.textContent='×'+count;el.append(amount);}
  else{const span=document.createElement('span');span.textContent='Trống';span.className='muted';el.append(span);}
  el.setAttribute('aria-label',(id?s.ctx.item(id).name:'Ô trống')+', số lượng '+count);
 }
 function renderFurnace(app){
  const s=state(app);if(!s||app.panel!=='furnace'||!s.furnace)return;
  const v=V.furnaces.view(app,s.furnace);if(!v.ok){app.api.closePanel();app.api.toast(v.message);return;}
  $('furnaceStatus').textContent=v.status;
  for(const slot of['Input','Fuel','Output'])slotView(slot,v[slot.toLowerCase()+'Id'],v[slot.toLowerCase()+'Count'],s);
  $('furnaceCook').value=v.progress/V.furnaces.COOK_SECONDS*100;
  $('furnaceCookText').textContent=v.inputCount?v.progress.toFixed(1)+' / '+V.furnaces.COOK_SECONDS+' giây':'Mỗi vật phẩm cần 10 giây';
  $('furnaceBurn').value=v.burnTotal?v.burnLeft/v.burnTotal*100:0;
  $('furnaceBurnText').textContent=v.lit?'Còn '+Math.ceil(v.burnLeft)+' giây cháy':'Lò chưa nhóm';
  $('furnaceInputTake').disabled=!v.inputCount;$('furnaceFuelTake').disabled=!v.fuelCount;$('furnaceOutputTake').disabled=!v.outputCount;
  $('furnaceFlame').classList.toggle('lit',v.lit);
  fillChoice(app,'input',V.furnaces.RECIPES,s.preferred);fillChoice(app,'fuel',V.furnaces.FUELS,109);s.preferred=0;
 }
 V.services=Object.freeze({
  init(app,ctx){
   const s={ctx,furnace:null,preferred:0,tradeRows:null,tradeRole:null,timer:0};states.set(app,s);
   $('tradeBatch').oninput=()=>renderTrade(app);$('tradeDone').onclick=()=>app.api.closePanel();$('furnaceDone').onclick=()=>app.api.closePanel();
   for(const slot of['input','fuel']){
    const prefix=slot==='input'?'furnaceInput':'furnaceFuel';
    $(prefix+'Choice').onchange=()=>renderFurnace(app);
    for(const n of[1,8])$(prefix+'Add'+n).onclick=()=>{const r=V.furnaces.put(app,s.furnace,slot,Number($(prefix+'Choice').value),n);result(app,r);renderFurnace(app);};
    $(prefix+'Take').onclick=()=>{const r=V.furnaces.take(app,s.furnace,slot,64);result(app,r,r.ok?[[r.id,r.count]]:[]);renderFurnace(app);};
   }
   $('furnaceOutputTake').onclick=()=>{const r=V.furnaces.take(app,s.furnace,'output',64);if(result(app,r,r.ok?[[r.id,r.count]]:[]))app.api.toast('Đã lấy '+r.count+' '+ctx.item(r.id).name.toLocaleLowerCase('vi')+'.');renderFurnace(app);};
  },
  openFurnace(app,pos,preferred=0){
   const s=state(app);if(!s)return false;const v=V.furnaces.view(app,pos);if(!v.ok){app.api.toast(v.message);return false;}
   s.furnace={x:pos.x,y:pos.y,z:pos.z};s.preferred=preferred;s.timer=0;app.api.openPanel('furnace');return true;
  },
  render(app,name){if(name==='trade')renderTrade(app,true);if(name==='furnace')renderFurnace(app);},
  exit(app,name){const s=state(app);if(name==='trade')V.trading.close(app);if(name==='furnace'&&s){app.api.save(false);s.furnace=null;}},
  reset(app){V.trading.close(app);const s=state(app);if(s){s.furnace=null;s.tradeRows=null;s.tradeRole=null;s.timer=0;}},
  tick(app,dt){const s=state(app);if(!s)return;s.timer+=dt;if(s.timer<.12)return;s.timer=0;if(app.panel==='trade')renderTrade(app);if(app.panel==='furnace')renderFurnace(app);},
  refresh,renderTrade,renderFurnace,
  inspect(app){const s=state(app);return s?{furnace:s.furnace?{...s.furnace}:null,tradeRole:s.tradeRole}:null;}
 });
})();
