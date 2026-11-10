/* Sổ Gió — game-facing journal, village requests, equipment and encounter UI. */
(() => {
 'use strict';const V=globalThis.Voxel||={},$=id=>document.getElementById(id),sessions=new WeakMap();
 const tabs={journey:'Hành trình',village:'Góp sức cho làng',equipment:'Trang bị',guardian:'Hộ Vệ'};
 const slotNames={head:'Đầu',body:'Thân',feet:'Chân',charm:'Phụ kiện'};
 function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=String(text);return e;}
 function button(text,fn,data={},secondary=false){const b=el('button','pixel-button'+(secondary?'':' primary'),text);b.type='button';for(const[k,v]of Object.entries(data))b.dataset[k]=String(v);b.onclick=fn;return b;}
 function goods(app,rows){
  const ctx=sessions.get(app)?.ctx,out=el('div','adventure-goods');
  for(const[id,n]of rows||[]){const row=el('span','adventure-good'),im=el('img');im.src=ctx.icon(id);im.alt='';row.append(im,document.createTextNode(n+' '+ctx.item(id).name));out.append(row);}
  return out;
 }
 function notice(text){$('adventureMessage').textContent=text||'';}
 function action(app,fn){
  let r;try{r=fn();}catch(e){app.api.record('error','Adventure action failed',e.stack||e.message);r={ok:false,message:'Chưa thể hoàn tất thao tác.'};}
  let message=r?.message||'Đã cập nhật.';
  if(r?.ok){V.services.refresh(app,r.grants||[]);if(!app.api.save(false))message+=' Chưa lưu được; hãy xuất thế giới từ bảng tạm dừng.';}
  render(app);notice(message);return r;
 }
 function section(title,text){const h=el('div','adventure-section-heading');h.append(el('h3','',title));if(text)h.append(el('p','',text));return h;}
 function meter(value,max,label){const wrap=el('div','adventure-meter'),p=el('progress');p.max=max;p.value=Math.min(max,Math.max(0,value));p.setAttribute('aria-label',label);wrap.append(p,el('span','',label));return wrap;}
 function recipe(app,id){
  const ctx=sessions.get(app).ctx;app.tab='all';document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab==='all'));$('itemSearch').value=ctx.item(id).name;$('recipeSearch').value='';$('craftReadyOnly').checked=false;app.api.openPanel('inventory');app.api.renderInventory();
  const match=V.recipes.find(r=>r.out[0]===id),target=match?document.querySelector('#recipes [data-recipe="'+match.id+'"]'):null;
  if(target){target.classList.add('adventure-recipe-target');target.scrollIntoView({block:'center',inline:'nearest'});$('inventoryDetail').textContent='Đã tìm công thức '+ctx.item(id).name+'. Nguyên liệu cần có nằm ngay dưới tên công thức.';if(!target.disabled)target.focus({preventScroll:true});else $('itemSearch').focus({preventScroll:true});}
 }
 function journey(app,body){
  const v=V.journey.view(app);
  body.append(section('Một miền đất, nhiều việc để làm',v.enabled?'Hoàn thành bằng các thao tác Sinh tồn. Mỗi phần thưởng được nhận một lần trong thế giới này.':v.reason));
  const summary=el('div','adventure-summary');summary.append(el('span','',v.completedCount+'/8 mốc hoàn thành'),el('span','',v.claimedCount+'/8 phần thưởng đã nhận'),el('span','','Uy tín làng: '+v.reputation));body.append(summary);
  if(v.legacyInferred.length)body.append(el('p','adventure-note','Bản cũ đã ghi một phần tiến độ gỗ/chế tạo/xây dựng. Sổ giữ lại các số đó; những hoạt động chưa từng được ghi sẽ bắt đầu từ lần chơi này.'));
  const grid=el('div','adventure-grid');
  for(const m of v.milestones){
   const c=el('article','adventure-card'+(m.claimed?' claimed':'')+(m.completed?' completed':''));c.dataset.milestone=m.id;
   c.append(el('div','adventure-kicker',m.claimed?'ĐÃ NHẬN':m.completed?'ĐÃ HOÀN THÀNH':'ĐANG LÀM'),el('h3','',m.title),el('p','',m.description));
   c.append(meter(m.progress,m.goal,Math.min(m.goal,m.progress)+' / '+m.goal),goods(app,m.grants));
   if(m.contextReason)c.append(el('p','adventure-note',m.contextReason));
   const full=m.grants.some(([id,n])=>(app.inventory[id]||0)+n>99999);
   if(m.completed&&!m.claimed&&full)c.append(el('p','adventure-note','Túi đã đầy vật phẩm thưởng; dùng bớt rồi quay lại nhận.'));
   const b=button(m.claimed?'Đã nhận':m.completed?'Nhận thưởng':'Chưa đủ',()=>action(app,()=>V.journey.claim(app,m.id)),{journeyClaim:m.id});
   b.disabled=!m.canClaim;c.append(b);grid.append(c);
  }body.append(grid);
  const details=el('details','adventure-guide');details.append(el('summary','','Gợi ý để đi tiếp'));
  for(const g of v.guides){const item=el('div','adventure-guide-row');item.append(el('h4','',g.title),el('p','',g.text));details.append(item);}body.append(details);
 }
 function village(app,body){
  const v=V.journey.orders(app);
  body.append(section('Góp sức cho làng','Mang vật liệu đến đúng người dân ở gần. Mỗi nghề nhận một đơn trong một ngày của thế giới.'));
  const summary=el('div','adventure-summary');summary.append(el('span','','Ngày '+v.day),el('span','','Uy tín làng: '+v.reputation),el('span','','Đơn mới theo ngày'));body.append(summary);
  if(!v.enabled)body.append(el('p','adventure-note',v.reason));
  const grid=el('div','adventure-grid village-grid');
  for(const o of v.rows){
   const c=el('article','adventure-card'+(o.delivered?' claimed':''));c.dataset.orderRole=String(o.role);
   c.append(el('div','adventure-kicker',o.roleName),el('h3','',o.title),el('p','','Mang đến:'),goods(app,o.need),el('p','','Bạn nhận:'),goods(app,o.grants),el('p','adventure-reputation','+'+o.reputationGain+' uy tín làng'));
   if(!o.delivered&&o.missing.length)c.append(el('p','adventure-note','Còn thiếu: '+o.missing.map(([id,n])=>n+' '+sessions.get(app).ctx.item(id).name).join(', ')));
   c.append(el('p','adventure-order-status',o.delivered?'Đã góp đủ cho người này hôm nay.':o.reason||'Người nhận ở gần và túi đồ đã đủ.'));
   const b=button(o.delivered?'Đã giao hôm nay':'Giao đơn',()=>action(app,()=>V.journey.deliver(app,o.role)),{villageDeliver:o.role});b.disabled=!o.canDeliver;c.append(b);grid.append(c);
  }body.append(grid);
  body.append(el('p','adventure-note','Hãy đứng trong 6 khối của người dân đúng nghề còn sống. Đơn yêu cầu đúng nguyên liệu, không trừ đồ khi chưa đủ hoặc khi không thể nhận phần thưởng.'));
 }
 function equipment(app,body){
  const v=V.equipment.view(app),ctx=sessions.get(app).ctx;
  body.append(section('Đồ mang theo','Chế tạo trong túi đồ (E), rồi mang từng món. Muốn dùng giáp đồng làm nguyên liệu nâng cấp, hãy tháo nó trước.'));
  const summary=el('div','adventure-summary');
  summary.append(el('span','','Cản đòn: '+Math.round(v.totals.defense*100)+'%'),el('span','','Tốc độ: ×'+v.totals.move.toFixed(2)),el('span','','Cận chiến: ×'+v.totals.melee.toFixed(2)));body.append(summary);
  const grid=el('div','adventure-grid');
  for(const slot of ['head','body','feet','charm']){
   const row=v.slots[slot],c=el('article','adventure-card equipment-slot');c.dataset.equipmentSlot=slot;
   c.append(el('div','adventure-kicker',slotNames[slot]),el('h3','',row.id?row.name:'Chưa mang'));
   if(row.id){
    const top=el('div','adventure-equipped'),im=el('img');im.src=ctx.icon(row.id);im.alt=row.name;top.append(im);
    const detail=el('div');detail.append(el('p','',row.maxDurability?'Độ bền còn '+row.remaining+' / '+row.maxDurability:'Phụ kiện không hao độ bền'));
    if(row.maxDurability)detail.append(meter(row.remaining,row.maxDurability,Math.round(row.remaining/row.maxDurability*100)+'%'));top.append(detail);c.append(top);
    c.append(button('Tháo',()=>action(app,()=>V.equipment.unequip(app,slot)),{unequip:slot},true));
   }
   const choices=v.available.filter(x=>x.slot===slot);
   if(!choices.length)c.append(el('p','muted','Chưa có món phù hợp trong túi đồ.'));
   for(const x of choices){
    const line=el('div','adventure-equipment-choice');line.append(goods(app,[[x.id,x.count]]),button('Mang',()=>action(app,()=>V.equipment.equip(app,slot,x.id)),{equip:x.id}));c.append(line);
   }
   grid.append(c);
  }body.append(grid);
  body.append(el('p','adventure-note','Giáp giảm đòn đánh và vụ nổ, hao độ bền khi trúng đòn. Ngã cao, đói, đuối nước và dung nham vẫn gây sát thương đầy đủ. Chỉ mang một phụ kiện cùng lúc. Bùa nhịp bước chỉ tăng tốc trong Sinh tồn khi không bay và không cưỡi ngựa.'));
  const plans=el('details','adventure-guide');plans.open=true;plans.append(el('summary','','Công thức trang bị'));
  const links=el('div','adventure-recipe-links');
  for(const id of [176,177,178,179,180,181,182,183])links.append(button(ctx.item(id).name,()=>recipe(app,id),{gearRecipe:id},true));
  plans.append(links,el('p','','Giáp lăng kính cần giáp đồng tương ứng và Lõi lăng kính nhận từ Hộ Vệ. Độ bền của các bản sao cùng loại được dùng chung; tháo và mang lại không sửa món đồ.'));body.append(plans);
 }
 function guardian(app,body){
  const v=V.guardian.view(app),shown=v.active?v.profiles.find(p=>p.id===v.active.profileId):v.nextProfile;
  body.append(section('Ba Hộ Vệ','Bạn chủ động chọn thử thách. Chuẩn bị kiếm, thức ăn và giáp; dọn một khoảng đất rộng để đọc dấu đòn và né.'));
  const info=el('div','adventure-summary');info.append(el('span','','Đã gọi: '+v.attempts),el('span','','Hoàn tất: '+v.wins),el('span','','Ba kiểu · ba nhịp'));body.append(info);
  const choice=el('article','adventure-card guardian-card');choice.append(el('h3','','Chọn Hộ Vệ cho ấn tiếp theo'));
  const choices=el('div','adventure-recipe-links');choices.setAttribute('role','group');choices.setAttribute('aria-label','Chọn Hộ Vệ');
  for(const p of v.profiles){
   const selected=p.id===v.nextProfile.id;
   const b=button(p.title,()=>{const r=action(app,()=>V.guardian.chooseProfile(app,p.id));if(r?.ok)document.querySelector('[data-guardian-profile="'+p.id+'"]')?.focus({preventScroll:true});},{guardianProfile:p.id},!selected);
   b.setAttribute('aria-pressed',String(selected));b.disabled=v.selectionLocked;choices.append(b);
  }
  const next=el('p','','Ấn tiếp theo: '+v.nextProfile.title+'. '+v.nextProfile.hint);next.id='guardianNextProfile';next.setAttribute('aria-live','polite');
  choice.append(choices,next,el('p','muted',v.selectionLocked?'Hoàn tất thử thách hoặc nhận thưởng đang chờ để đổi lựa chọn.':v.selection==='auto'?'Chưa chọn riêng: ba Hộ Vệ sẽ luân phiên qua các lượt gọi.':'Lựa chọn được lưu cùng thế giới. Cầm ấn để gọi đúng Hộ Vệ đã chọn.'));body.append(choice);
  const c=el('article','adventure-card guardian-card');
  if(v.active){
   c.append(el('div','adventure-kicker','THỬ THÁCH ĐANG DIỄN RA'),el('h3','',v.active.title),el('p','',v.active.phaseName),meter(v.active.health,v.active.maxHealth,Math.ceil(v.active.health)+' / '+v.active.maxHealth+' sức bền'));
   c.append(el('p','',v.active.paused?'Hộ Vệ đang chờ ở thế giới chính. Trở lại trong phạm vi 48 khối theo chiều ngang để tiếp tục.':'Đóng sổ để tiếp tục. '+v.active.hint));
   c.append(el('p','','Vị trí: '+v.active.position.map(x=>Math.round(x)).join(', ')));
   c.append(button('Kết thúc thử thách',()=>action(app,()=>V.guardian.abandon(app)),{guardianAbandon:'1'},true),el('p','muted','Kết thúc hoặc gục ngã sẽ dùng hết ấn này; bạn có thể chế tạo ấn khác.'));
  }else{
   c.append(el('div','adventure-kicker',v.pending?'PHẦN THƯỞNG ĐANG CHỜ':'CHUẨN BỊ THỬ THÁCH'),el('h3','','Chế tạo Ấn gọi Hộ Vệ'),goods(app,[[142,4],[143,4],[144,2]]));
   c.append(button('Xem công thức ấn',()=>recipe(app,184),{guardianRecipe:'184'}));
   c.append(el('p','','Cầm ấn, lùi ít nhất 3 khối và nhấn chuột phải lên nền khô 3 × 3, phía trên trống 4 khối. Dùng ở thế giới chính.'));
  }
  body.append(c);
  if(v.pending){
   const r=el('article','adventure-card completed');r.append(el('h3','','Thành quả của bạn'),goods(app,v.pending.grants));
   const b=button('Nhận phần thưởng còn chờ',()=>action(app,()=>V.guardian.collect(app)),{guardianCollect:'1'});b.disabled=!v.pending.canCollect;r.append(b);
   if(!v.pending.canCollect)r.append(el('p','adventure-note','Dùng bớt lõi/ngọc trong túi rồi quay lại. Phần thưởng đang được giữ trong thế giới này.'));body.append(r);
  }
  body.append(section(shown.title,shown.description));
  const phases=el('div','adventure-grid guardian-phases');
  shown.phases.forEach((phase,i)=>{const p=el('article','adventure-card');p.append(el('div','adventure-kicker',String(i+1).padStart(2,'0')),el('h3','',phase.name),el('p','',phase.hint));phases.append(p);});body.append(phases);
  body.append(el('p','adventure-note','Thắng trong Sinh tồn nhận 3 Lõi lăng kính và 6 ngọc. Nếu túi đầy, phần thưởng chờ trong sổ. Sáng tạo cho thử hình ảnh và trận đấu, không cấp thưởng Sinh tồn.'));
 }

 function render(app){
  const s=sessions.get(app);if(!s||app.panel!=='adventure')return;
  $('adventureSubtitle').textContent='Ngày '+app.day+' · '+(app.mode==='survival'?'Sinh tồn':'Sáng tạo')+' · '+app.seed;
  document.querySelectorAll('[data-adventure-tab]').forEach(b=>{const on=b.dataset.adventureTab===s.tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;});
  const body=$('adventureContent');body.setAttribute('aria-labelledby','adventureTab-'+s.tab);body.replaceChildren();
  ({journey,village,equipment,guardian}[s.tab]||journey)(app,body);
 }
 function open(app,tab=null){
  const s=sessions.get(app);if(!s||!app.started||app.inHome||app.player.health<=0)return false;
  if(Object.hasOwn(tabs,tab))s.tab=tab;
  notice('');app.api.openPanel('adventure',app.panel);const panel=document.querySelector('#adventure .adventure-panel');if(panel)panel.scrollTop=0;const selected=document.querySelector('[data-adventure-tab="'+s.tab+'"]');selected?.focus({preventScroll:true});return true;
 }
 function install(app,ctx){
  sessions.set(app,{ctx,tab:'journey'});
  const chooseTab=tab=>{sessions.get(app).tab=tab;render(app);notice('');const panel=document.querySelector('#adventure .adventure-panel');if(panel)panel.scrollTop=0;};
  const controls=[...document.querySelectorAll('[data-adventure-tab]')];$('adventureContent').setAttribute('role','tabpanel');$('adventureContent').tabIndex=0;
  for(const b of controls){b.id='adventureTab-'+b.dataset.adventureTab;b.setAttribute('aria-controls','adventureContent');b.onclick=()=>chooseTab(b.dataset.adventureTab);b.onkeydown=e=>{const i=controls.indexOf(b);let next;if(e.key==='ArrowRight')next=(i+1)%controls.length;else if(e.key==='ArrowLeft')next=(i-1+controls.length)%controls.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=controls.length-1;else return;e.preventDefault();e.stopPropagation();chooseTab(controls[next].dataset.adventureTab);controls[next].focus();};}
  for(const id of ['pauseAdventure','inventoryAdventure','touchAdventure'])if($(id))$(id).onclick=()=>open(app);
  if($('adventureDone'))$('adventureDone').onclick=()=>app.api.closePanel();
  document.addEventListener('keydown',e=>{
   if(e.key!=='Tab'||app.panel!=='adventure')return;
   const dialog=$('adventure'),items=[...dialog.querySelectorAll('button,[href],input,select,textarea,summary,[tabindex]')].filter(x=>x.tabIndex>=0&&!x.disabled&&x.getClientRects().length);
   if(!items.length)return;
   const current=document.activeElement,first=items[0],last=items[items.length-1],outside=!items.includes(current);
   if((e.shiftKey&&(current===first||outside))||(!e.shiftKey&&(current===last||outside))){e.preventDefault();(e.shiftKey?last:first).focus({preventScroll:true});}
  });
 }
 function updateHUD(app){
  const box=$('guardianHud');if(!box)return;
  const v=V.guardian?.view(app),b=v?.active,show=b&&!app.inHome&&!app.panel&&!app.starting&&!app.contextLost&&!b.paused;
  box.classList.toggle('hidden',!show);
  if(show){$('guardianName').textContent=b.title.toLocaleUpperCase('vi-VN');$('guardianHealth').max=b.maxHealth;$('guardianHealth').value=b.health;$('guardianHealth').setAttribute('aria-label',Math.ceil(b.health)+' / '+b.maxHealth);$('guardianPhase').textContent=b.phaseName+' · '+Math.ceil(b.health)+' / '+b.maxHealth;$('guardianWarning').textContent=b.telegraph?b.telegraph.hint+' · '+b.telegraph.remaining.toFixed(1)+' giây':b.hint;}
 }
 V.adventureUI=Object.freeze({install,open,render,updateHUD});
})();
