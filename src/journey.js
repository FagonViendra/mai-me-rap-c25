/* Sổ Gió — original, bounded journey rewards and daily village supplies.
 * Production action owners call observe only after their action succeeds.
 * This module owns no DOM, renderer, timers, save I/O or runtime patches. */
(() => {
  'use strict';
  const V = globalThis.Voxel ||= {};
  const MAX_COUNTER = 10000000, MAX_DAY = 100000, MAX_REPUTATION = 300000;
  const STACK = 99999, RANGE = 6;
  const COUNTERS = ['wood','crafted','placed','walkers','harvested','traded','smelted'];
  const LEGACY = ['wood','crafted','placed'];
  const REALMS = ['inferno','sky'];
  const own = (o,k) => Object.hasOwn(o,k);
  const integer = (n,lo,hi) => Number.isInteger(n) && n >= lo && n <= hi;
  const plain = o => !!o && typeof o === 'object' && !Array.isArray(o)
    && (Object.getPrototypeOf(o) === Object.prototype || Object.getPrototypeOf(o) === null);
  function freeze(o) { for (const value of Object.values(o)) if (value && typeof value === 'object') freeze(value); return Object.freeze(o); }
  const definitions = freeze([
    {id:'timber',title:'Mùi gỗ đầu mùa',description:'Tự chặt 6 khối thân cây.',metric:'wood',goal:6,grants:[[19,6]]},
    {id:'maker',title:'Nhịp bàn tay',description:'Hoàn thành 5 lượt chế tạo.',metric:'crafted',goal:5,grants:[[123,3]]},
    {id:'shelter',title:'Một góc để về',description:'Tự đặt 24 khối vào thế giới.',metric:'placed',goal:24,grants:[[10,8]]},
    {id:'nightwatch',title:'Qua bóng tối',description:'Đánh bại 3 kẻ lang thang.',metric:'walkers',goal:3,grants:[[144,2]]},
    {id:'harvest',title:'Mùa nhỏ đầu tiên',description:'Thu hoạch 3 cây lúa mì đã chín.',metric:'harvested',goal:3,grants:[[122,3]]},
    {id:'neighbor',title:'Lời hẹn bên làng',description:'Hoàn tất 3 lượt trao đổi với dân làng.',metric:'traded',goal:3,grants:[[143,4]]},
    {id:'kiln',title:'Lửa biết giữ lời',description:'Lấy 6 thành phẩm đã nung từ ô ra của lò.',metric:'smelted',goal:6,grants:[[142,4]]},
    {id:'wayfarer',title:'Hai phía chân trời',description:'Đích thân đi tới Vực Lửa và Thiên Giới.',metric:'realms',goal:2,grants:[[112,2],[28,4]]}
  ]);
  const definitionById = new Map(definitions.map(row => [row.id,row]));
  const guides = freeze([
    {id:'craft',title:'Bắt đầu bằng đôi tay',text:'Chặt thân cây, chế tạo ván và que, rồi đặt bàn chế tạo. Năm lượt chế tạo mở phần thưởng ngọc để bắt đầu trao đổi.'},
    {id:'supply',title:'Góp sức cho làng',text:'Mỗi ngày, mỗi nghề cần một lô hàng. Mang đủ hàng và đứng trong 6 khối của dân làng đúng nghề để giao; bạn nhận ngọc và một điểm uy tín làng.'},
    {id:'kiln',title:'Chăm một ngọn lửa',text:'Đặt nguyên liệu cùng nhiên liệu vào lò; lò vẫn nung khi bảng lò đang mở. Lấy thành phẩm ở ô ra để Sổ Gió ghi nhận. Đóng bảng rồi nhấn Esc nếu muốn tạm dừng.'},
    {id:'journey',title:'Dấu chân có thật',text:'Các mốc ghi việc bạn làm trong Sinh tồn và chỉ nhận quà một lần. Bộ đếm cũ chỉ được dùng khi chứng minh đúng việc; chúng được ghi rõ là dữ liệu kế thừa.'},
    {id:'realms',title:'Chuẩn bị trước khi đi xa',text:'Mang thức ăn, ánh sáng và dụng cụ trước khi qua cổng. Mốc Hai phía chân trời dành cho thế giới tự sinh; thế giới Minecraft nhập hiện chưa mở hai miền này.'}
  ]);
  const roleNames = freeze(['Nông dân','Thợ xây','Thợ rèn']);
  const orderDefinitions = freeze([
    [
      {id:'farmer_wheat',title:'Góp lúa cho bếp làng',need:[[121,6]],grants:[[123,3]]},
      {id:'farmer_apples',title:'Giỏ táo cuối vườn',need:[[108,4]],grants:[[123,2]]},
      {id:'farmer_bread',title:'Bánh cho một buổi chợ',need:[[122,3]],grants:[[123,4]]}
    ],
    [
      {id:'builder_cobble',title:'Vá lại lối đá',need:[[9,24]],grants:[[123,3]]},
      {id:'builder_glass',title:'Thêm ô cửa đón nắng',need:[[10,12]],grants:[[123,4]]},
      {id:'builder_earth',title:'Gạch cho hiên nhỏ',need:[[175,8]],grants:[[123,4]]}
    ],
    [
      {id:'smith_coal',title:'Giữ ấm lò rèn',need:[[109,8]],grants:[[123,4]]},
      {id:'smith_iron',title:'Một mẻ sắt mới',need:[[111,4]],grants:[[123,4]]},
      {id:'smith_copper',title:'Đồng cho bản lề',need:[[142,6]],grants:[[123,4]]}
    ]
  ]);
  const sessions = new WeakMap();
  const copyRows = rows => rows.map(row => row.slice());
  function fail(code,message) { return {ok:false,code,message,grants:[]}; }
  function blank() {
    return {version:1,counters:Object.fromEntries(COUNTERS.map(k => [k,0])),realms:[],claimed:[],legacyInferred:[],orders:{lastDay:[0,0,0],reputation:0}};
  }
  function record(value,keys,label) {
    if (!plain(value)) throw new TypeError(label+' phải là một bản ghi thuần.');
    const actual=Reflect.ownKeys(value);
    if (actual.length!==keys.length || actual.some(k => typeof k!=='string'||!keys.includes(k))) throw new TypeError(label+' có trường không được hỗ trợ.');
    for (const key of keys) {
      const d=Object.getOwnPropertyDescriptor(value,key);
      if (!d || !own(d,'value')) throw new TypeError(label+' chứa thuộc tính không phải dữ liệu.');
    }
    return value;
  }
  function list(value,allowed,label) {
    if (!Array.isArray(value) || value.length>allowed.length || Object.keys(value).length!==value.length) throw new TypeError(label+' không hợp lệ.');
    const seen=new Set();
    for (let i=0;i<value.length;i++) {
      const d=Object.getOwnPropertyDescriptor(value,String(i));
      if (!d || !own(d,'value') || !allowed.includes(d.value) || seen.has(d.value)) throw new TypeError(label+' chứa mục lặp hoặc không hợp lệ.');
      seen.add(d.value);
    }
    return allowed.filter(k => seen.has(k));
  }
  const progressFor = (s,d) => d.metric==='realms' ? s.realms.length : s.counters[d.metric];
  function validateSaved(raw) {
    if (raw===undefined) return blank();
    const r=record(raw,['version','counters','realms','claimed','legacyInferred','orders'],'Sổ Gió');
    if (r.version!==1) throw new TypeError('Phiên bản Sổ Gió không được hỗ trợ.');
    record(r.counters,COUNTERS,'Bộ đếm Sổ Gió');
    const s=blank();
    for (const k of COUNTERS) {
      if (!integer(r.counters[k],0,MAX_COUNTER)) throw new TypeError('Bộ đếm Sổ Gió vượt giới hạn.');
      s.counters[k]=r.counters[k];
    }
    s.realms=list(r.realms,REALMS,'Các miền đã đến');
    s.claimed=list(r.claimed,definitions.map(d => d.id),'Sổ phần thưởng');
    s.legacyInferred=list(r.legacyInferred,LEGACY,'Nguồn bộ đếm cũ');
    record(r.orders,['lastDay','reputation'],'Đơn hàng làng');
    if (!Array.isArray(r.orders.lastDay) || r.orders.lastDay.length!==3 || Object.keys(r.orders.lastDay).length!==3) throw new TypeError('Ngày giao hàng không hợp lệ.');
    for (let i=0;i<3;i++) {
      const d=Object.getOwnPropertyDescriptor(r.orders.lastDay,String(i));
      if (!d || !own(d,'value') || !integer(d.value,0,MAX_DAY)) throw new TypeError('Ngày giao hàng vượt giới hạn.');
      s.orders.lastDay[i]=d.value;
    }
    if (!integer(r.orders.reputation,0,MAX_REPUTATION) || r.orders.reputation>s.orders.lastDay.reduce((a,b)=>a+b,0)) throw new TypeError('Uy tín làng không hợp lệ.');
    s.orders.reputation=r.orders.reputation;
    for (const id of s.claimed) if (progressFor(s,definitionById.get(id))<definitionById.get(id).goal) throw new TypeError('Phần thưởng đã nhận chưa đủ dấu mốc.');
    return s;
  }
  function bind(app,s) { app.journeyState=s; const old=sessions.get(app); sessions.set(app,{id:app.id,world:app.world,state:s,busy:old?.busy||false}); }
  function init(app,saved) {
    if (!app || typeof app!=='object' || !app.world || typeof app.id!=='string' || !app.id) throw new TypeError('Sổ Gió cần một thế giới đã xác định.');
    if (sessions.get(app)?.busy) return fail('busy','Đang hoàn tất một giao dịch Sổ Gió.');
    const s=validateSaved(saved);
    if (saved===undefined && app.mode==='survival' && plain(app.progress)) {
      for (const k of LEGACY) {
        const d=Object.getOwnPropertyDescriptor(app.progress,k),n=d&&own(d,'value')?d.value:undefined;
        if (integer(n,1,MAX_COUNTER)) {s.counters[k]=n;s.legacyInferred.push(k);}
      }
    }
    bind(app,s);return view(app);
  }
  function bound(app) {
    const b=app&&typeof app==='object'?sessions.get(app):null;
    return b && b.id===app.id && b.world===app.world && b.state===app.journeyState ? b : null;
  }
  function active(app,allowRealmArrival=false) {
    const b=bound(app);
    if (!b) return fail('world','Sổ Gió chưa gắn với thế giới này.');
    if (b.busy) return fail('busy','Đang hoàn tất một giao dịch Sổ Gió.');
    if (app.mode!=='survival') return fail('creative','Dấu mốc và phần thưởng chỉ tính trong Sinh tồn.');
    if (app.started!==true || app.playing!==true || app.inHome || (app.starting&&!allowRealmArrival) || app.contextLost || !app.player || !Number.isFinite(app.player.health) || app.player.health<=0) return fail('inactive','Trở lại phiên Sinh tồn đang chơi để tiếp tục.');
    return {ok:true,b};
  }
  function snapshot(app) {
    const b=bound(app);
    if (!b) {
      if (!app?.journeyState && !sessions.has(app)) return blank();
      throw new TypeError('Sổ Gió thuộc một thế giới khác; cần khởi tạo lại.');
    }
    return validateSaved(b.state);
  }
  function stateForView(app) { const b=bound(app); if (!b) return blank(); return validateSaved(b.state); }
  function contextReason(app,d) {
    return d.id==='wayfarer' && app?.world?.importedWorld ? 'Thế giới nhập hiện chưa mở Vực Lửa và Thiên Giới; mốc này dành cho thế giới tự sinh.' : '';
  }
  function view(app) {
    const s=stateForView(app),a=active(app);
    const milestones=definitions.map(d => {
      const n=progressFor(s,d),claimed=s.claimed.includes(d.id),reason=contextReason(app,d);
      return {id:d.id,title:d.title,description:d.description,progress:Math.min(n,d.goal),goal:d.goal,completed:n>=d.goal,claimed,canClaim:a.ok&&n>=d.goal&&!claimed&&!reason,grants:copyRows(d.grants),contextReason:reason};
    });
    return {title:'Sổ Gió',enabled:a.ok,reason:a.ok?'':a.message,claimedCount:s.claimed.length,completedCount:milestones.filter(m=>m.completed).length,reputation:s.orders.reputation,legacyInferred:s.legacyInferred.slice(),milestones,guides:guides.map(g=>({...g}))};
  }
  function observe(app,event,detail={}) {
    // Copy own data before reading event fields or taking a state snapshot.
    // Accessors must never re-enter a reward transaction through an observation.
    if (!plain(detail)) return fail('event','Chi tiết hành động không hợp lệ.');
    const detailKeys=Reflect.ownKeys(detail),values=Object.create(null);
    if (detailKeys.length>8) return fail('event','Chi tiết hành động có quá nhiều trường.');
    for (const key of detailKeys) {
      const d=Object.getOwnPropertyDescriptor(detail,key);
      if (typeof key!=='string'||!d||!own(d,'value')) return fail('event','Chi tiết hành động chỉ nhận thuộc tính dữ liệu.');
      values[key]=d.value;
    }
    detail=values;
    // Only the successful realm transaction may record arrival while start() is loading.
    const arrival=event==='realm'&&plain(detail)&&app?.dimensionTransit===true&&['overworld',...REALMS].includes(detail.from)&&detail.from!==detail.to&&['overworld',...REALMS].includes(detail.to)&&app.dimension===detail.to&&app.world?.dimension===detail.to;
    const a=active(app,arrival);if (!a.ok) return a;
    const s=validateSaved(a.b.state),before=new Set(definitions.filter(d=>progressFor(s,d)>=d.goal).map(d=>d.id));
    let metric=null,count=1;
    if (event==='mine') {
      if (!integer(detail.id,1,V.BLOCK_ID_MAX)||!V.blocks?.[detail.id]) return fail('event','Khối vừa đào không hợp lệ.');
      if (V.blocks[detail.id].treeLog===true) metric='wood';
    } else if (event==='craft') {
      if (typeof detail.recipeId!=='string'||!V.recipes?.some(r=>r.id===detail.recipeId&&r.station!=='furnace')) return fail('event','Công thức vừa chế tạo không hợp lệ.');
      if (detail.executions!==undefined) {
        if (!integer(detail.executions,1,99999)) return fail('event','Số lượt chế tạo không hợp lệ.');
        count=detail.executions;
      }
      metric='crafted';
    } else if (event==='place') {
      if (!integer(detail.id,1,V.BLOCK_ID_MAX)||!V.blocks?.[detail.id]) return fail('event','Khối vừa đặt không hợp lệ.');
      metric='placed';
    } else if (event==='kill') {
      if (typeof detail.type!=='string') return fail('event','Loại sinh vật không hợp lệ.');
      if (detail.type==='walker') metric='walkers';
    } else if (event==='farm') {
      if (detail.from!==42) return fail('event','Chỉ ghi nhận cây lúa mì đã chín.');
      metric='harvested';
    } else if (event==='trade') {
      if (typeof detail.offerId!=='string'||!V.trading?.offers?.some(o=>o.id===detail.offerId)) return fail('event','Lượt trao đổi không hợp lệ.');
      metric='traded';
    } else if (event==='smelt') {
      if (!integer(detail.count,1,64)||!integer(detail.id,1,V.BLOCK_ID_MAX)||!Object.values(V.furnaces?.RECIPES||{}).includes(detail.id)) return fail('event','Thành phẩm lò nung không hợp lệ.');
      metric='smelted';count=detail.count;
    } else if (event==='realm') {
      if (!['overworld',...REALMS].includes(detail.to)) return fail('event','Miền vừa đến không hợp lệ.');
      if (app.world.importedWorld && detail.to!=='overworld') return fail('context','Thế giới nhập chưa hỗ trợ chuyến đi này.');
      if (REALMS.includes(detail.to)&&!s.realms.includes(detail.to)) s.realms=REALMS.filter(r=>r===detail.to||s.realms.includes(r));
    } else return fail('event','Sổ Gió không nhận loại hành động này.');
    if (metric) s.counters[metric]=Math.min(MAX_COUNTER,s.counters[metric]+count);
    const changed=JSON.stringify(s)!==JSON.stringify(a.b.state);
    if (changed) bind(app,s);
    return {ok:true,changed,event,completed:definitions.filter(d=>progressFor(s,d)>=d.goal&&!before.has(d.id)).map(d=>d.id)};
  }
  function inventoryCopy(app) {
    const d=Object.getOwnPropertyDescriptor(app,'inventory'),j=Object.getOwnPropertyDescriptor(app,'journeyState');
    if (!d||!own(d,'value')||d.writable!==true||!j||!own(j,'value')||j.writable!==true||!plain(d.value)) return null;
    const keys=Reflect.ownKeys(d.value);if (keys.length>V.BLOCK_ID_MAX) return null;
    const next={};
    for (const k of keys) {
      if (typeof k!=='string'||!(/^[1-9][0-9]{0,2}$/).test(k)||!integer(Number(k),1,V.BLOCK_ID_MAX)||!own(V.items||{},k)) return null;
      const entry=Object.getOwnPropertyDescriptor(d.value,k);
      if (!entry||!own(entry,'value')||!integer(entry.value,0,STACK)) return null;
      next[k]=entry.value;
    }
    return next;
  }
  function prepareInventory(app,need,grants) {
    const next=inventoryCopy(app);if (!next) return fail('inventory','Túi đồ chưa hợp lệ; chưa chuyển vật phẩm nào.');
    for (const [id,n] of [...need,...grants]) if (!own(V.items||{},id)||!integer(n,1,STACK)) return fail('catalog','Vật phẩm của phần thưởng hoặc đơn hàng chưa sẵn sàng.');
    for (const [id,n] of need) if ((next[id]||0)<n) return fail('items','Chưa đủ hàng để giao.');
    for (const [id,n] of need) next[id]=(next[id]||0)-n;
    for (const [id,n] of grants) {
      if ((next[id]||0)+n>STACK) return fail('capacity','Túi đồ đã chạm giới hạn của vật phẩm thưởng; chưa chuyển hàng hoặc ghi nhận phần thưởng.');
      next[id]=(next[id]||0)+n;
    }
    if (Object.keys(next).length>V.BLOCK_ID_MAX) return fail('capacity','Túi đồ không còn chỗ cho loại vật phẩm thưởng.');
    return {ok:true,next};
  }
  function commit(app,b,next,state) {
    // Both writable own data properties were checked before any mutation. No
    // callback, I/O, render or await can interleave the two state assignments.
    app.inventory=next;app.journeyState=state;b.state=state;
  }
  function claim(app,id) {
    const a=active(app);if (!a.ok) return a;
    const d=definitionById.get(id);if (!d) return fail('milestone','Không tìm thấy dấu mốc này.');
    a.b.busy=true;
    try {
      const s=validateSaved(a.b.state);
      if (s.claimed.includes(id)) return fail('claimed','Bạn đã nhận phần thưởng này rồi.');
      const reason=contextReason(app,d);if (reason) return fail('context',reason);
      if (progressFor(s,d)<d.goal) return fail('incomplete','Dấu mốc này chưa hoàn thành.');
      const next=prepareInventory(app,[],d.grants);if (!next.ok) return next;
      s.claimed=definitions.filter(row=>row.id===id||s.claimed.includes(row.id)).map(row=>row.id);
      commit(app,a.b,next.next,s);
      return {ok:true,code:'claimed',message:'Đã nhận quà cho “'+d.title+'”.',id,grants:copyRows(d.grants),claimed:true};
    } finally { a.b.busy=false; }
  }
  function seedOffset(seed,role) {
    const text=String(seed)+'|village-supplies-v1|'+role;let h=2166136261;
    for (let i=0;i<text.length;i++) h=Math.imul(h^text.charCodeAt(i),16777619);
    return (h>>>0)%3;
  }
  function daily(app,role) {
    if (!integer(app?.day,1,MAX_DAY)||!integer(role,0,2)) return null;
    return orderDefinitions[role][(seedOffset(app.seed,role)+app.day-1)%3];
  }
  function nearby(app,role) {
    const p=app?.player,w=app?.world;
    if (!p||!w?.chunks||![p.x,p.y,p.z].every(Number.isFinite)||(w.dimension||app.dimension||'overworld')!=='overworld') return false;
    for (const m of app.mobs||[]) {
      if (!m||m.type!=='villager'||m.dead||!Number.isFinite(m.health)||m.health<=0||![m.x,m.y,m.z].every(Number.isFinite)) continue;
      const r=integer(m.role,0,2)?m.role:integer(m.homeIndex,0,3)?m.homeIndex%3:-1;
      if (r!==role||Math.hypot(m.x-p.x,m.y-p.y,m.z-p.z)>RANGE) continue;
      if (w.chunks.get(Math.floor(m.x/16)+','+Math.floor(m.z/16))?.data) return true;
    }
    return false;
  }
  function orders(app) {
    const s=stateForView(app),a=active(app),day=integer(app?.day,1,MAX_DAY)?app.day:null;
    const inv=app&&typeof app==='object'?inventoryCopy(app):null;
    const rows=roleNames.map((roleName,role)=>{
      const d=daily(app,role);if (!d) return {role,roleName,id:null,title:'Chưa xác định ngày giao hàng',need:[],grants:[],reputationGain:1,delivered:false,nearby:false,missing:[],canDeliver:false,reason:'Ngày của thế giới chưa hợp lệ.'};
      const delivered=s.orders.lastDay[role]>=day,near=nearby(app,role),missing=d.need.map(([id,n])=>[id,Math.max(0,n-(inv?.[id]||0))]).filter(([,n])=>n>0);
      let reason=!a.ok?a.message:delivered?'Đơn của nghề này hôm nay đã hoàn tất.':!near?'Đứng trong 6 khối của '+roleName.toLocaleLowerCase('vi')+' còn sống ở vùng đã tải để giao hàng.':!inv?'Túi đồ chưa hợp lệ.':missing.length?'Chưa đủ hàng để giao.':'';
      if (!reason) {const q=prepareInventory(app,d.need,d.grants);if (!q.ok) reason=q.message;else if (s.orders.reputation>=MAX_REPUTATION) reason='Uy tín làng đã đạt giới hạn của bản lưu.';}
      return {role,roleName,id:d.id,title:d.title,need:copyRows(d.need),grants:copyRows(d.grants),reputationGain:1,delivered,nearby:near,missing,canDeliver:!reason,reason};
    });
    return {title:'Góp sức cho làng',day,enabled:a.ok,reason:a.ok?'':a.message,reputation:s.orders.reputation,rows};
  }
  function deliver(app,role) {
    const a=active(app);if (!a.ok) return a;
    if (!integer(role,0,2)) return fail('role','Nghề nhận hàng không hợp lệ.');
    const d=daily(app,role);if (!d) return fail('day','Ngày của thế giới chưa hợp lệ.');
    a.b.busy=true;
    try {
      const s=validateSaved(a.b.state);
      if (s.orders.lastDay[role]>=app.day) return fail('delivered','Đơn của nghề này hôm nay đã hoàn tất.');
      if (!nearby(app,role)) return fail('range','Đứng trong 6 khối của '+roleNames[role].toLocaleLowerCase('vi')+' còn sống ở vùng đã tải để giao hàng.');
      if (s.orders.reputation>=MAX_REPUTATION) return fail('capacity','Uy tín làng đã đạt giới hạn của bản lưu.');
      const next=prepareInventory(app,d.need,d.grants);if (!next.ok) return next;
      s.orders.lastDay[role]=app.day;s.orders.reputation++;
      commit(app,a.b,next.next,s);
      return {ok:true,code:'delivered',message:'Đã góp hàng cho '+roleNames[role].toLocaleLowerCase('vi')+' · +1 uy tín làng.',role,day:app.day,orderId:d.id,consumed:copyRows(d.need),grants:copyRows(d.grants),reputationGain:1,reputation:s.orders.reputation};
    } finally { a.b.busy=false; }
  }
  V.journey=Object.freeze({VERSION:1,MAX_COUNTER,MAX_DAY,MAX_REPUTATION,STACK,RANGE,definitions,orderDefinitions,roleNames,guides,validateSaved,init,snapshot,observe,view,claim,orders,deliver});
})();
