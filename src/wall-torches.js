/* Directional wall torches: world variants, one inventory identity and bounded support plans. */
(() => {
  'use strict';
  const V=globalThis.Voxel||={},IDS=Object.freeze([186,187,188,189]);
  const isWall=id=>IDS.includes(id),isTorch=id=>id===19||isWall(id),canonicalItem=id=>isWall(id)?19:id;
  const fail=message=>({ok:false,message});
  function validCell(world,x,y,z){
    const limit=V.coordinates?.forWorld?.(world)?.blockLimit??30000000;
    return [x,y,z].every(Number.isInteger)&&y>=0&&y<96&&Math.abs(x)<=limit&&Math.abs(z)<=limit;
  }
  function read(world,x,y,z){
    if(!validCell(world,x,y,z))return 0;
    // Reading a boundary neighbor may load its saved chunk, but never edits blocks or inventory.
    world.ensure?.(Math.floor(x/16),Math.floor(z/16),true);
    return world.get(x,y,z);
  }
  function support(id,x,y,z){
    const offset=id===19?[0,-1,0]:isWall(id)?V.blocks[id].supportOffset:null;
    return offset?[x+offset[0],y+offset[1],z+offset[2]]:null;
  }
  function placement(world,ray){
    if(!world||!ray||!Array.isArray(ray.previous)||ray.previous.length!==3)return fail('Nhìn vào mặt trên hoặc mặt bên của một khối chắc.');
    const [x,y,z]=ray.previous;
    if(!validCell(world,x,y,z))return fail('Vị trí đuốc nằm ngoài giới hạn thế giới.');
    if(![ray.x,ray.y,ray.z].every(Number.isInteger))return fail('Mặt đỡ đuốc không hợp lệ.');
    const delta=[x-ray.x,y-ray.y,z-ray.z];
    if(delta.reduce((n,v)=>n+Math.abs(v),0)!==1)return fail('Chọn một mặt khối để gắn đuốc.');
    let id;
    if(delta[1]===1)id=19;
    else if(delta[1]===-1)return fail('Đuốc cần mặt trên hoặc mặt bên; không treo dưới trần.');
    else id=delta[0]===1?186:delta[0]===-1?187:delta[2]===1?188:189;
    const anchor=support(id,x,y,z);
    const anchorId=read(world,...anchor);
    if(!V.blocks[anchorId]?.solid)return fail('Đuốc cần một mặt đỡ chắc.');
    if(V.blocks[anchorId].shape==='boxes'){
      const axis=delta[1]?1:delta[0]?0:2,sign=delta[axis];
      // Match the existing shaft foot (13/32..19/32) and wall plate
      // (height .08..31, cross-width .39..61); the cell position stays fixed.
      const lo=axis===1?[13/32,13/32]:axis===0?[.08,.39]:[.39,.08];
      const hi=axis===1?[19/32,19/32]:axis===0?[.31,.61]:[.61,.31];
      if(!V.blockGeometry.faceCoversRect(anchorId,axis,sign,lo,hi))return fail('Mặt khối chưa đỡ kín chân hoặc giá gắn đuốc. Chọn mặt ngoài đủ rộng.');
    }
    if(V.blocks[read(world,x,y,z)]?.solid)return fail('Vị trí đặt đuốc đã bị chắn.');
    return {ok:true,id,x,y,z,support:anchor};
  }
  function removal(world,x,y,z){
    if(!world||!validCell(world,x,y,z))return fail('Vị trí phá khối không hợp lệ.');
    const targetId=read(world,x,y,z);
    if(!targetId)return fail('Khối đã được lấy đi.');
    const changes=[{x,y,z,id:0,expected:targetId}],neighbors=[[x+1,y,z],[x-1,y,z],[x,y,z+1],[x,y,z-1],[x,y+1,z]];
    for(const [nx,ny,nz]of neighbors){
      const id=read(world,nx,ny,nz),anchor=support(id,nx,ny,nz);
      if(anchor&&anchor[0]===x&&anchor[1]===y&&anchor[2]===z)changes.push({x:nx,y:ny,z:nz,id:0,expected:id});
    }
    return {ok:true,targetId,changes,attachedTorches:changes.length-1};
  }
  function canReceiveTorches(inventory,count){
    const stock=inventory?.[19]??0;
    return Number.isInteger(count)&&count>=0&&Number.isInteger(stock)&&stock>=0&&stock+count<=99999;
  }
  V.wallTorches=Object.freeze({IDS,isWall,isTorch,canonicalItem,support,placement,removal,canReceiveTorches});
})();
