const fs=require('fs');
const path=require('path');
const zlib=require('zlib');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n);return b;};
const i16=n=>{const b=Buffer.alloc(2);b.writeInt16BE(n);return b;};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
const i32=n=>{const b=Buffer.alloc(4);b.writeInt32BE(n);return b;};
const cat=a=>Buffer.concat(a);

async function pack(manifestPath){
 const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
 const base=path.dirname(manifestPath),w=manifest.width,h=manifest.height;
 const records=[],channelsAll=[],composites=[];
 for(const item of manifest.layers){
  const filename=path.resolve(base,item.file);
  const {data,info}=await sharp(filename).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const left=item.x||0,top=item.y||0;
  if(left<0||top<0||left+info.width>w||top+info.height>h)throw Error('Out of canvas '+item.name);
  const planes=[3,0,1,2].map(c=>{const p=Buffer.alloc(info.width*info.height);for(let i=0;i<p.length;i++)p[i]=data[i*4+c];return manifest.cubismCompatible?cat([u16(0),p]):cat([u16(2),zlib.deflateSync(p)]);});
  const name=Buffer.from(item.name,'ascii');let pas=cat([Buffer.from([name.length]),name]);pas=cat([pas,Buffer.alloc((4-pas.length%4)%4)]);
  const extra=cat([u32(0),u32(0),pas]);
  const channelSpecs=cat([-1,0,1,2].map((id,i)=>cat([i16(id),u32(planes[i].length)])));
  records.push(cat([i32(top),i32(left),i32(top+info.height),i32(left+info.width),u16(4),channelSpecs,Buffer.from('8BIMnorm'),Buffer.from([255,0,item.hidden?2:0,0]),u32(extra.length),extra]));
  channelsAll.push(...planes);
  if(!item.hidden)composites.push({input:filename,left,top});
 }
 const preview=await sharp({create:{width:w,height:h,channels:4,background:'#00000000'}}).composite(composites).png().toBuffer();
 fs.writeFileSync(path.resolve(base,manifest.preview),preview);
 const {data}=await sharp(preview).raw().toBuffer({resolveWithObject:true});
 const planes=[0,1,2,3].map(c=>{const b=Buffer.alloc(w*h);for(let i=0;i<b.length;i++)b[i]=data[i*4+c];return b;});
 let li=cat([i16(-records.length),...records,...channelsAll]);if(li.length%2)li=cat([li,Buffer.alloc(1)]);
 const lm=cat([u32(li.length),li,u32(0)]);
 const header=cat([Buffer.from('8BPS'),u16(1),Buffer.alloc(6),u16(4),u32(h),u32(w),u16(8),u16(3)]);
 // A concrete ResolutionInfo resource avoids readers that fail on an empty resource section.
 const resources=manifest.cubismCompatible?cat([Buffer.from('8BIM'),u16(1005),Buffer.alloc(2),u32(16),u32(72*65536),u16(1),u16(1),u32(72*65536),u16(1),u16(1)]):Buffer.alloc(0);
 fs.writeFileSync(path.resolve(base,manifest.psd),cat([header,u32(0),u32(resources.length),resources,u32(lm.length),lm,u16(0),...planes]));
 console.log(JSON.stringify({psd:manifest.psd,layers:records.length,width:w,height:h,preview:manifest.preview}));
}
pack(process.argv[2]).catch(e=>{console.error(e);process.exit(1)});
