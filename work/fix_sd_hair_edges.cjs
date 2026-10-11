const fs=require('fs');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='outputs/Jett_SD_Live2D_v1';
(async()=>{
 const m=JSON.parse(fs.readFileSync(root+'/layers.json','utf8'));
 if(m.layers.some(l=>l.name==='Hair_EdgeResidual'))throw Error('Already applied');
 const edge=Buffer.alloc(m.width*m.height*4);
 for(const name of ['Body_Base','Hood']){
  const l=m.layers.find(l=>l.name===name);
  const {data,info}=await sharp(root+'/'+l.file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const X=x+l.x,Y=y+l.y,n=(y*info.width+x)*4;
   const move=name==='Body_Base'?Y<789:Y<740&&(X<467||X>758)&&(data[n]+data[n+1]+data[n+2])/3>110;
   if(move&&data[n+3]){data.copy(edge,(Y*m.width+X)*4,n,n+4);data.fill(0,n,n+4);}
  }
  await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).png().toFile(root+'/'+l.file+'.tmp');
  fs.renameSync(root+'/'+l.file+'.tmp',root+'/'+l.file);
  l.pixels=Array.from(data).filter((v,i)=>i%4===3&&v).length;
 }
 await sharp(edge,{raw:{width:m.width,height:m.height,channels:4}}).png().toFile(root+'/parts/Hair_EdgeResidual.png');
 m.layers.splice(m.layers.findIndex(l=>l.name==='Head_Base'),0,{name:'Hair_EdgeResidual',file:'parts/Hair_EdgeResidual.png',x:0,y:0,hidden:false,pixels:Array.from(edge).filter((v,i)=>i%4===3&&v).length});
 fs.writeFileSync(root+'/layers.json',JSON.stringify(m,null,2));
 console.log('Moved residual hair pixels into separate head layer; existing layer rectangles retained.');
})().catch(e=>{console.error(e);process.exit(1)});
