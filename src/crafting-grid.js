/* Mải mê ráp C19 — a real 3×3 recipe surface over the existing craft transaction. */
(() => {
 'use strict';
 const V=globalThis.Voxel ||= {},LIMIT=99999,blank=()=>Array.from({length:9},()=>({id:0,count:0}));
 const integer=(n,min=0,max=LIMIT)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const copy=g=>g.map(c=>({id:c.id,count:c.count}));
 const valid=g=>Array.isArray(g)&&g.length===9&&g.every(c=>c&&integer(c.id)&&integer(c.count)&&(c.id===0)===(c.count===0));
 function totals(g){const out={};for(const c of g)if(c.id)out[c.id]=(out[c.id]||0)+c.count;return out;}
 function pattern(recipe){
  if(!recipe||recipe.station==='furnace')return null;
  const costs=new Map();
  for(const row of recipe.need||[]){if(!Array.isArray(row)||row.length!==2||!integer(row[0],1)||!integer(row[1],1))throw Error('Invalid grid recipe '+recipe.id);costs.set(row[0],(costs.get(row[0])||0)+row[1]);}
  const a=[...costs],A=a[0]?.[0],B=a[1]?.[0],C=a[2]?.[0];let g=blank();
  const put=(rows,symbols)=>{g=blank();rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!=='.'){const v=symbols[ch];g[y*3+x]={id:Array.isArray(v)?v[0]:v,count:Array.isArray(v)?v[1]:1};}}));};
  const id=recipe.id;
  if(/(?:^|_)pick$/.test(id))put(['AAA','.B.','.B.'],{A,B});
  else if(['axe','iron_axe','copper_axe'].includes(id))put(['AA.','AB.','.B.'],{A,B});
  else if(id==='diamond_inlaid_axe')put(['AA.','BC.','.C.'],{A,B,C});
  else if(id.endsWith('_shovel'))put(['.A.','.B.','.B.'],{A,B});
  else if(['sword','stone_sword'].includes(id))put(['.A.','.A.','.B.'],{A,B});
  else if(id==='stone_hoe')put(['AA.','.B.','.B.'],{A,B});
  else if(id==='furnace')put(['AAA','A.A','AAA'],{A});
  else if(id==='shears')put(['.A.','A..'],{A});
  else if(['torch','charcoal_torch'].includes(id))put(['A..','B..'],{A,B});
  else if(id==='copper_helmet')put(['AAA','A.A'],{A});
  else if(id==='copper_chest')put(['A.A','AAA','AAA'],{A});
  else if(id==='copper_boots')put(['A.A','A.A'],{A});
  else if(id==='companion_whistle')put(['A.A','.B.'],{A,B});
  else if(a.length===1&&a[0][1]===1)put(['A'],{A});
  else if(a.length===1&&a[0][1]===2)put(['A','A'],{A});
  else if(a.length===1&&a[0][1]===3)put(['AAA'],{A});
  else if(a.length===1&&a[0][1]===4)put(['AA','AA'],{A});
  else if(a.length===1&&a[0][1]===9)put(['AAA','AAA','AAA'],{A});
  else if(a.length===2&&a[0][1]===4&&a[1][1]===1)put(['A.A','.B.','A.A'],{A,B});
  else if(a.length===2&&a[0][1]===16&&a[1][1]===1)put(['A.A','.B.','A.A'],{A:[A,4],B});
  else if(a.length===2&&a[0][1]===2&&a[1][1]===2)put(['AB','BA'],{A,B});
  else if(a.length===2&&a[0][1]===3&&a[1][1]===1)put(['AAA','.B.'],{A,B});
  else{
   const sum=a.reduce((n,r)=>n+r[1],0);
   if(sum<=9){let i=0;for(const[item,n]of a)for(let k=0;k<n;k++)g[i++]={id:item,count:1};}
   else{if(a.length>9)throw Error('Recipe needs more than nine ingredient types');a.forEach(([item,n],i)=>g[i]={id:item,count:n});}
  }
  if(!valid(g))throw Error('Invalid pattern '+id);
  const actual=totals(g);if(costs.size!==Object.keys(actual).length||[...costs].some(([item,n])=>actual[item]!==n))throw Error('Pattern changes recipe costs: '+id);
  return g;
 }
 function bounds(g){const used=g.map((c,i)=>c.id?i:-1).filter(i=>i>=0);return used.length?{x:Math.min(...used.map(i=>i%3)),y:Math.min(...used.map(i=>Math.floor(i/3))),right:Math.max(...used.map(i=>i%3)),bottom:Math.max(...used.map(i=>Math.floor(i/3)))}:null;}
 function placements(p){
  const b=bounds(p),out=[],seen=new Set();if(!b)return out;const w=b.right-b.x+1,h=b.bottom-b.y+1;
  for(const mirror of [false,true])for(let oy=0;oy<=3-h;oy++)for(let ox=0;ox<=3-w;ox++){
   const g=blank();for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=p[(y+b.y)*3+x+b.x];g[(oy+y)*3+ox+(mirror?w-1-x:x)]={...c};}
   const key=JSON.stringify(g);if(!seen.has(key)){seen.add(key);out.push(g);}
  }return out;
 }
 function compile(recipes){
  const ids=new Set();return recipes.filter(r=>r.station!=='furnace').map(r=>{if(ids.has(r.id))throw Error('Duplicate grid recipe');ids.add(r.id);const canonical=pattern(r);return Object.freeze({recipe:r,canonical,placements:placements(canonical)});});
 }
 function match(grid,compiled){
  if(!valid(grid))return [];
  const hits=[];for(const entry of compiled){let best=null;for(const p of entry.placements){let n=LIMIT,ok=true;for(let i=0;i<9;i++){if(grid[i].id!==p[i].id||grid[i].count<p[i].count){ok=false;break;}if(p[i].id)n=Math.min(n,Math.floor(grid[i].count/p[i].count));}if(ok&&n>0&&(!best||n>best.maxBatches))best={recipe:entry.recipe,consume:p,maxBatches:n};}if(best)hits.push(best);}return hits;
 }
 function consume(grid,matched,n){
  if(!valid(grid)||!matched||!integer(n,1)||n>matched.maxBatches||!valid(matched.consume))return null;
  const out=copy(grid);for(let i=0;i<9;i++){const c=matched.consume[i];if(out[i].id!==c.id||out[i].count<c.count*n)return null;out[i].count-=c.count*n;if(!out[i].count)out[i].id=0;}return valid(out)?out:null;
 }
 function allocationValid(grid,inventory,creative){
  if(!valid(grid))return false;if(creative)return true;
  return Object.entries(totals(grid)).every(([id,n])=>integer(inventory[id])&&inventory[id]>=n);
 }
 V.craftingGridCore=Object.freeze({limit:LIMIT,blank,copy,valid,totals,pattern,placements,compile,match,consume,allocationValid});

 const sessions=new WeakMap(),$=id=>document.getElementById(id),key=s=>String(s??'').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
 function state(app){return sessions.get(app);}
 function editable(app){return app.started&&!app.starting&&!app.inHome&&!app.contextLost&&app.player?.health>0&&app.panel==='inventory';}
 function setText(el,text){if(el.textContent!==text)el.textContent=text;}
 function icon(s,id){const img=document.createElement('img');img.src=s.ctx.icon(id);img.alt='';return img;}
 function clear(app,message='Đã dọn ô; nguyên liệu vẫn ở trong túi.'){const s=state(app);if(!s||s.taking)return false;s.cells=blank();s.template=null;s.preferred=null;s.message=message;render(app);return true;}
 function reset(app){const s=state(app);if(!s)return;s.cells=blank();s.template=null;s.preferred=null;s.selected=0;s.erase=false;s.message='';s.worldId=app.id;s.worldMode=app.mode;}
 function mode(app,value,focus=false){const s=state(app);if(!s||!['grid','legacy'].includes(value)||s.taking)return false;if(s.mode!==value)clear(app,'');s.mode=value;render(app);if(focus)$(value==='grid'?'craftGridTab':'craftLegacyTab').focus({preventScroll:true});return true;}
 function select(app,id){const s=state(app);if(!s||s.mode!=='grid'||!editable(app)||!integer(id,1)||!V.items[id])return false;s.selected=id;s.erase=false;s.message='Đã chọn '+s.ctx.item(id).name+'. Nhấn một ô để xếp.';render(app);return true;}
 function place(app,index,remove=false,all=false){
  const s=state(app);if(!s||s.mode!=='grid'||!editable(app)||s.taking||!integer(index,0,8))return false;
  const g=copy(s.cells),old=g[index];
  if(remove){if(!old.id)return false;old.count=all?0:old.count-1;if(!old.count)old.id=0;}
  else{
   if(!s.selected){s.message='Chọn vật phẩm trong túi, rồi nhấn ô muốn xếp.';render(app);return false;}
   const amount=$('craftGridPlaceCount').valueAsNumber;if(!integer(amount,1)){s.message='Số lượng xếp phải là số nguyên từ 1 đến 99.999.';render(app);return false;}
   const count=old.id===s.selected?old.count+amount:amount;if(count>LIMIT){s.message='Mỗi ô chứa tối đa 99.999 nguyên liệu.';render(app);return false;}
   g[index]={id:s.selected,count};
   if(!allocationValid(g,app.inventory,app.mode==='creative')){s.message='Không đủ '+s.ctx.item(s.selected).name+' chưa xếp trong túi.';render(app);return false;}
  }
  s.cells=g;s.template=null;s.preferred=null;s.message='';render(app);return true;
 }
 function fill(app,id,requested=1){
  const s=state(app);if(!s||!editable(app)||s.taking||s.mode!=='grid')return false;
  const entry=s.compiled.find(e=>e.recipe.id===id);if(!entry)return false;
  if(!integer(requested,1)){s.message='Số lượt xếp phải là số nguyên từ 1 đến 99.999.';render(app);return false;}
  const r=entry.recipe,q=s.ctx.quote(r,app.inventory,app.mode==='creative',1),cap=Math.floor(LIMIT/Math.max(...entry.canonical.map(c=>c.count))),n=Math.min(requested,q.valid?q.maxExecutions:0,cap);
  s.template=entry;s.preferred=id;s.erase=false;s.cells=n?entry.canonical.map(c=>c.id?{id:c.id,count:c.count*n}:{id:0,count:0}):blank();
  s.message=n?'Đã xếp nguyên liệu cho '+n+' lượt. Nhấn thành phẩm để chế tạo.':'Chưa đủ nguyên liệu hoặc chỗ chứa; mẫu mờ cho biết cách xếp.';
  render(app);return n>0;
 }
 function selection(app){const s=state(app),hits=match(s.cells,s.compiled),chosen=hits.find(h=>h.recipe.id===s.preferred)||(hits.length===1?hits[0]:null);return{hits,chosen};}
 function take(app,max=false){
  const s=state(app);if(!s||!editable(app)||s.mode!=='grid'||s.taking||!allocationValid(s.cells,app.inventory,app.mode==='creative'))return false;
  const {chosen}=selection(app);if(!chosen)return false;
  const q=s.ctx.quote(chosen.recipe,app.inventory,app.mode==='creative',1),n=max?Math.min(chosen.maxBatches,q.valid?q.maxExecutions:0):1;
  if(!n||!q.valid||!q.enabled||!s.ctx.stationAvailable(chosen.recipe))return false;
  const next=consume(s.cells,chosen,n);if(!next)return false;
  s.taking=true;let ok=false;
  try{ok=s.ctx.craft(chosen.recipe,n)===true;if(ok){if(app.mode!=='creative')s.cells=next;s.message='Đã nhận '+chosen.recipe.out[1]*n+' '+s.ctx.item(chosen.recipe.out[0]).name+'.';}}
  finally{s.taking=false;render(app);}return ok;
 }
 function book(app){
  const s=state(app),query=key($('craftGridSearch').value).trim(),tokens=query.split(/\s+/).filter(Boolean),readyOnly=$('craftGridReadyOnly').checked;
  const rows=s.compiled.filter(e=>{const r=e.recipe,q=s.ctx.quote(r,app.inventory,app.mode==='creative',1);return tokens.every(t=>key([r.name,...r.need.map(([id])=>s.ctx.item(id).name)].join(' ')).includes(t))&&(!readyOnly||q.enabled&&s.ctx.stationAvailable(r));});
  const signature=JSON.stringify([query,readyOnly,app.mode,s.ctx.stationAvailable({station:'crafting'}),rows.map(e=>[e.recipe.id,...e.recipe.need.map(([id])=>app.inventory[id]||0),app.inventory[e.recipe.out[0]]||0])]);
  if(s.bookSignature===signature)return;s.bookSignature=signature;
  const frag=document.createDocumentFragment();for(const e of rows){const r=e.recipe,b=document.createElement('button');b.type='button';b.className='craft-grid-recipe';b.dataset.gridRecipe=r.id;b.append(icon(s,r.out[0]));const label=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=r.name+' ×'+r.out[1];detail.textContent=r.need.map(([id,n])=>n+' '+s.ctx.item(id).name).join(' · ');label.append(title,detail);b.append(label);b.setAttribute('aria-label','Xếp công thức '+r.name);b.onclick=()=>{fill(app,r.id,1);$('craftGridSlots').scrollIntoView({block:'nearest',inline:'nearest'});};frag.append(b);}
  if(!rows.length){const p=document.createElement('p');p.className='craft-grid-help';p.textContent='Không có công thức phù hợp. Hãy đổi từ khóa hoặc bỏ lọc.';frag.append(p);}
  $('craftGridRecipes').replaceChildren(frag);setText($('craftGridRecipeCount'),rows.length+'/'+s.compiled.length+' công thức. Công thức nung ở mục Legacy hoặc lò nung.');
 }
 function render(app){
  const s=state(app);if(!s||s.taking)return;if(s.worldId!==app.id||s.worldMode!==app.mode)reset(app);
  for(const name of ['grid','legacy']){const active=s.mode===name,tab=$(name==='grid'?'craftGridTab':'craftLegacyTab'),panel=$(name==='grid'?'craftGridPanel':'craftLegacyPanel');tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;panel.hidden=!active;}
  $('craftGridBookOpen').hidden=s.mode!=='grid';
  if(s.mode!=='grid')return;
  $('craftGridPlaceCount').setAttribute('aria-invalid',String(!integer($('craftGridPlaceCount').valueAsNumber,1)));
  $('craftGridFillCount').setAttribute('aria-invalid',String(!integer($('craftGridFillCount').valueAsNumber,1)));
  $('craftGridErase').setAttribute('aria-pressed',String(s.erase));
  setText($('craftGridSelected'),s.erase?'Đang gỡ: nhấn ô để bớt 1 nguyên liệu.':s.selected?s.ctx.item(s.selected).name+' · '+(app.mode==='creative'?'Sáng tạo':Math.max(0,(app.inventory[s.selected]||0)-(totals(s.cells)[s.selected]||0))+' chưa xếp'):'Chọn vật phẩm trong túi để xếp');
  const ghost=s.template?.canonical;
  for(let i=0;i<9;i++){const b=s.buttons[i],c=s.cells[i],hint=!c.id&&ghost?.[i]?.id?ghost[i]:null,shown=c.id?c:hint;const sig=JSON.stringify([c,hint]);if(b.dataset.signature!==sig){b.dataset.signature=sig;b.replaceChildren();if(shown){b.append(icon(s,shown.id));const count=document.createElement('span');count.className='craft-grid-count';count.textContent=String(shown.count);b.append(count);}else{const empty=document.createElement('span');empty.className='craft-grid-empty';empty.textContent='+';empty.setAttribute('aria-hidden','true');b.append(empty);}}b.classList.toggle('is-template',!!hint);b.dataset.item=String(c.id);b.dataset.count=String(c.count);b.setAttribute('aria-label','Ô hàng '+(Math.floor(i/3)+1)+', cột '+(i%3+1)+': '+(c.id?s.ctx.item(c.id).name+', '+c.count:hint?'mẫu '+s.ctx.item(hint.id).name+', cần '+hint.count:'trống'));b.title=b.getAttribute('aria-label');}
  const {hits,chosen}=selection(app),preview=chosen?.recipe||s.template?.recipe,choice=$('craftGridChoice'),sig=hits.map(h=>h.recipe.id).join('|');
  $('craftGridChoiceLabel').hidden=hits.length<2;
  if(choice.dataset.signature!==sig){choice.dataset.signature=sig;const empty=document.createElement('option');empty.value='';empty.textContent='Chọn thành phẩm';choice.replaceChildren(empty,...hits.map(h=>{const o=document.createElement('option');o.value=h.recipe.id;o.textContent=h.recipe.name+' ×'+h.recipe.out[1];return o;}));}choice.value=chosen?.recipe.id||'';
  const q=chosen?s.ctx.quote(chosen.recipe,app.inventory,app.mode==='creative',1):null,allowed=!!chosen&&!!q?.enabled&&s.ctx.stationAvailable(chosen.recipe)&&allocationValid(s.cells,app.inventory,app.mode==='creative')&&editable(app);
  const result=$('craftGridResult'),resultSig=preview?.id||'';if(result.dataset.recipe!==resultSig){result.dataset.recipe=resultSig;result.replaceChildren();if(preview)result.append(icon(s,preview.out[0]));const count=document.createElement('span');count.textContent=preview?'×'+preview.out[1]:'?';result.append(count);}
  result.disabled=!allowed;result.setAttribute('aria-label',preview?'Chế tạo '+preview.out[1]+' '+s.ctx.item(preview.out[0]).name:'Chưa có thành phẩm');
  $('craftGridTake').disabled=!allowed;$('craftGridTakeMax').disabled=!allowed;$('craftGridClear').disabled=!s.cells.some(c=>c.id)&&!s.template;
  const n=chosen&&q?.valid?Math.min(chosen.maxBatches,q.maxExecutions):0;setText($('craftGridTakeMax'),n>1?'Chế '+n+' lượt':'Chế tối đa');
  setText($('craftGridResultName'),preview?preview.name:'Thành phẩm');
  let status='Xếp nguyên liệu theo mẫu trong sổ công thức.';
  if(hits.length>1&&!chosen)status=hits.length+' công thức dùng cách xếp này. Hãy chọn thành phẩm.';
  else if(chosen&&!s.ctx.stationAvailable(chosen.recipe))status='Cần bàn chế tạo trong tầm 5 khối.';
  else if(chosen&&!allocationValid(s.cells,app.inventory,app.mode==='creative'))status='Nguyên liệu trong túi đã thay đổi. Dọn ô rồi xếp lại.';
  else if(chosen&&!q?.room)status='Túi không còn chỗ cho thành phẩm. Nguyên liệu được giữ nguyên.';
  else if(allowed)status=app.mode==='creative'?'Sáng tạo: chế tạo không dùng hết nguyên liệu.':'Sẵn sàng. Nguyên liệu chỉ được trừ khi nhận thành phẩm.';
  else if(s.cells.some(c=>c.id))status='Cách xếp chưa khớp công thức. Kiểm tra vị trí và số lượng.';
  setText($('craftGridStatus'),s.message);setText($('craftGridAvailability'),status);book(app);
 }
 function install(app,ctx){
  if(sessions.has(app))throw Error('Craft grid already installed');
  const s={ctx,compiled:compile(V.recipes),mode:'grid',cells:blank(),template:null,preferred:null,selected:0,erase:false,message:'',taking:false,worldId:app.id,worldMode:app.mode,buttons:[],bookSignature:null};sessions.set(app,s);
  for(let i=0;i<9;i++){const b=document.createElement('button');b.type='button';b.className='craft-grid-slot';b.dataset.slot=String(i);b.onclick=()=>place(app,i,s.erase);b.oncontextmenu=e=>{e.preventDefault();place(app,i,true,e.shiftKey);};b.onkeydown=e=>{const moves={ArrowLeft:-1,ArrowRight:1,ArrowUp:-3,ArrowDown:3};if(e.key in moves){e.preventDefault();e.stopPropagation();s.buttons[(i+moves[e.key]+9)%9].focus();}else if(['Delete','Backspace'].includes(e.key)){e.preventDefault();e.stopPropagation();place(app,i,true,true);}};b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer?.getData('text/plain')||'';if(/^mmr-item:[1-9][0-9]{0,4}$/.test(raw)&&select(app,Number(raw.slice(9))))place(app,i);};s.buttons.push(b);$('craftGridSlots').append(b);}
  for(const name of ['grid','legacy']){const b=$(name==='grid'?'craftGridTab':'craftLegacyTab');b.onclick=()=>mode(app,name);b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();mode(app,e.key==='Home'?'grid':e.key==='End'?'legacy':name==='grid'?'legacy':'grid',true);}};}
  $('craftGridClear').onclick=()=>clear(app);$('craftGridResult').onclick=$('craftGridTake').onclick=()=>take(app,false);$('craftGridTakeMax').onclick=()=>take(app,true);
  $('craftGridChoice').onchange=()=>{s.preferred=$('craftGridChoice').value||null;s.message='';render(app);};
  $('craftGridSearch').oninput=$('craftGridReadyOnly').onchange=()=>{s.bookSignature=null;book(app);};$('craftGridPlaceCount').oninput=$('craftGridFillCount').oninput=()=>render(app);
  $('craftGridErase').onclick=()=>{if(!editable(app))return;s.erase=!s.erase;s.message='';render(app);};
  $('craftGridBookOpen').onclick=()=>{const b=document.getElementById('craftGridBook');b.open=true;document.getElementById('craftGridSearch').focus({preventScroll:true});b.scrollIntoView({block:'start',inline:'nearest'});};
  $('craftGridRefill').onclick=()=>{const r=s.template?.recipe||selection(app).chosen?.recipe;if(r)fill(app,r.id,$('craftGridFillCount').valueAsNumber);else{s.message='Chọn một công thức trong sổ trước.';render(app);}};
 }
 V.crafting3=Object.freeze({install,render,select,place,fill,take,clear,reset,setMode:mode,isGrid:app=>state(app)?.mode==='grid',exit(app){if(state(app))clear(app,'');},inspect(app){const s=state(app);if(!s)return null;const q=selection(app);return{mode:s.mode,worldId:s.worldId,cells:copy(s.cells),selected:s.selected,template:s.template?.recipe.id||null,preferred:s.preferred,matches:q.hits.map(h=>({id:h.recipe.id,maxBatches:h.maxBatches})),chosen:q.chosen?.recipe.id||null,compiledRecipes:s.compiled.length,allocationValid:allocationValid(s.cells,app.inventory,app.mode==='creative'),taking:s.taking};}});
})();
