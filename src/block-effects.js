/* Original integer-pixel breaking cracks. No canvas, network, or runtime assets. */
(() => {
  'use strict';
  const V=globalThis.Voxel ||= {};
  const SIZE=16,STAGES=10,UNREACHED=255;
  const CENTER=[8,8]; // Authoring coordinates use a top-left origin.
  const DARK=[18,16,15],BRANCH=[29,25,23];
  // Hand-authored, asymmetric fracture paths: eight main cracks and twelve forks.
  // Each fork begins after its attachment point has already appeared.
  const paths=[
    {from:0,to:9,points:[[8,8],[7,7],[7,6],[5,5],[5,3],[3,2],[2,0]]},
    {from:0,to:9,points:[[8,8],[9,6],[8,4],[9,2],[8,0]]},
    {from:0,to:9,points:[[8,8],[10,8],[11,6],[13,5],[14,3],[15,2]]},
    {from:0,to:9,points:[[8,8],[10,9],[12,8],[14,9],[15,8]]},
    {from:0,to:9,points:[[8,8],[9,10],[11,11],[11,13],[13,14],[13,15]]},
    {from:0,to:9,points:[[8,8],[7,10],[8,12],[7,14],[7,15]]},
    {from:0,to:9,points:[[8,8],[6,9],[5,11],[3,12],[3,14],[1,15]]},
    {from:0,to:9,points:[[8,8],[6,7],[4,8],[3,7],[1,7],[0,6]]},
    {from:4,to:8,points:[[5,5],[3,5],[2,4],[0,4]]},
    {from:6,to:9,points:[[5,3],[6,2],[6,0]]},
    {from:7,to:9,points:[[9,2],[11,2],[12,0]]},
    {from:5,to:8,points:[[11,6],[11,4],[12,3]]},
    {from:6,to:9,points:[[12,8],[13,7],[15,7]]},
    {from:8,to:9,points:[[14,9],[14,11],[15,12]]},
    {from:5,to:9,points:[[11,11],[13,11],[14,13],[15,13]]},
    {from:6,to:9,points:[[8,12],[9,13],[9,15]]},
    {from:5,to:9,points:[[5,11],[4,10],[2,10],[1,9]]},
    {from:8,to:9,points:[[3,14],[1,13],[0,13]]},
    {from:5,to:9,points:[[4,8],[3,9],[1,9],[0,10]]},
    {from:6,to:9,points:[[3,7],[2,6],[1,6]]}
  ];
  let cached=null,generationCount=0,stageOccupancy=Object.freeze([]);

  function integerLine(start,end){
    let [x,y]=start;const [tx,ty]=end;
    const dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;
    let error=dx+dy;const points=[];
    for(;;){
      points.push([x,y]);if(x===tx&&y===ty)break;
      const twice=error*2;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}
    }
    return points;
  }

  V.makeCrackTextures=function makeCrackTextures(){
    if(cached)return cached;
    const activation=new Uint8Array(SIZE*SIZE);activation.fill(UNREACHED);
    const mark=(x,y,stage)=>{
      if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=SIZE||y<0||y>=SIZE||!Number.isInteger(stage)||stage<0||stage>=STAGES)throw Error('Crack authoring coordinate is out of bounds.');
      const p=x+SIZE*y;activation[p]=Math.min(activation[p],stage);
    };
    mark(CENTER[0],CENTER[1],0);
    for(const path of paths){
      const pixels=[];
      for(let i=1;i<path.points.length;i++){
        const segment=integerLine(path.points[i-1],path.points[i]);
        pixels.push(...(i===1?segment:segment.slice(1)));
      }
      for(let i=0;i<pixels.length;i++){
        const stage=path.from+Math.floor((path.to-path.from)*i/Math.max(1,pixels.length-1));
        mark(pixels[i][0],pixels[i][1],stage);
      }
    }
    // A few late pixels deepen the impact center without thickening every branch.
    mark(8,7,7);mark(8,9,7);mark(7,8,8);
    const data=new Uint8Array(SIZE*SIZE*4*STAGES),counts=[];
    for(let stage=0;stage<STAGES;stage++){
      let occupied=0;
      for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++){
        if(activation[x+SIZE*y]>stage)continue;
        const offset=(stage*SIZE*SIZE+(SIZE-1-y)*SIZE+x)*4;
        const color=Math.abs(x-CENTER[0])+Math.abs(y-CENTER[1])<=2?DARK:BRANCH;
        data[offset]=color[0];data[offset+1]=color[1];data[offset+2]=color[2];data[offset+3]=255;occupied++;
      }
      counts.push(occupied);
    }
    stageOccupancy=Object.freeze(counts);
    generationCount++;
    cached=Object.freeze({size:SIZE,layers:STAGES,data});
    return cached;
  };

  V.crackTextureInfo=Object.freeze({
    version:1,size:SIZE,layers:STAGES,origin:'bottom-left',
    impactPixel:Object.freeze({x:CENTER[0],y:SIZE-1-CENTER[1]}),
    palette:Object.freeze([Object.freeze(DARK.slice()),Object.freeze(BRANCH.slice())]),
    source:'original authored integer-pixel fracture paths',
    get generationCount(){return generationCount;},
    get stageOccupancy(){return stageOccupancy;}
  });
})();
