const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const base=path.resolve('outputs/Live2D_original_exact_v1'),out=path.resolve('outputs/Live2D_motion_v2');
const sourceDir='C:/Users/seogh/.codex/generated_images/01a0e753-0e91-7842-95df-8f771e152508';
const sources={skin:'exec-51d03c7f-35f2-4f54-813f-1c1138c5092a.png',eyes:'exec-7311aacb-06b1-4ff3-a684-242263ef5cb8.png',mouth:'exec-4f9a4e8c-4544-4c21-abb0-1da614a94b53.png'};
if(fs.existsSync('work/skin_repair_path.txt'))sources.skin=fs.readFileSync('work/skin_repair_path.txt','utf8').trim();
const polygon=(x,y,ps)=>{let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){const [a,b]=ps[i],[c,d]=ps[j];if(((b>y)!=(d>y))&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;};
const points=s=>s.split(' ').map(p=>p.split(',').map(Number));
(async()=>{
 fs.mkdirSync(path.join(out,'parts'),{recursive:true});fs.mkdirSync(path.join(out,'restoration_sources'),{recursive:true});
 const m=JSON.parse(fs.readFileSync(path.join(base,'layers.json'),'utf8')),W=m.width,H=m.height,N=W*H;
 fs.copyFileSync(path.join(base,'original.png'),path.join(out,'original.png'));
 for(const [k,file]of Object.entries(sources))fs.copyFileSync(path.isAbsolute(file)?file:path.join(sourceDir,file),path.join(out,'restoration_sources',k+'.png'));
 const raw={};for(const l of m.layers){fs.copyFileSync(path.join(base,l.file),path.join(out,l.file));raw[l.name]=await sharp(path.join(out,l.file)).ensureAlpha().raw().toBuffer();}
 const union=names=>{const a=Buffer.alloc(N);for(const n of names)for(let i=0;i<N;i++)a[i]=Math.max(a[i],raw[n][i*4+3]);return a;};
 const put=async(name,data)=>{await sharp(data,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(out,'parts',name+'.png'));return {name,file:'parts/'+name+'.png',x:0,y:0};};
 const headOutline=points('90,52 94,31 104,15 112,8 241,8 249,14 256,16 259,29 253,45 262,55 273,62 288,79 289,92 292,103 295,126 303,146 309,165 311,182 321,211 305,202 295,188 292,197 300,230 305,267 301,301 295,336 289,361 265,361 266,330 250,324 218,335 213,361 106,361 95,352 89,330 87,289 85,255 84,238 78,218 74,203 59,222 43,234 50,217 60,194 41,207 54,179 46,185 61,158 67,144 54,151 66,128 80,105 83,96 91,80 104,66 111,59 101,55 103,41 97,51');
 const bodyOutline=points('0,283 82,250 104,277 110,340 213,361 219,324 254,288 278,294 306,320 305,361 0,361');
 const headRest=Buffer.alloc(N*4),bodyRest=Buffer.alloc(N*4),bg=raw.Background_Unassigned_Original;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;if(!bg[i+3])continue;const dst=polygon(x+.5,y+.5,headOutline)?headRest:polygon(x+.5,y+.5,bodyOutline)?bodyRest:null;if(dst){bg.copy(dst,i,i,i+4);bg.fill(0,i,i+4);}}
 for(const [name,b]of [['Head_EdgeResidual',headRest],['Body_EdgeResidual',bodyRest]]){raw[name]=b;m.layers.push(await put(name,b));}
 await put('Background_Unassigned_Original',bg);
 // Move residual eyeliner/lip edge pixels out of static skin into feature contexts.
 const contexts=[['Eye_R_Context','116,201 137,206 151,210 169,223 172,233 158,236 138,233 123,226 117,213','Eye_R_'],['Eye_L_Context','210,223 226,218 245,217 267,222 268,230 259,239 238,247 223,244 211,238','Eye_L_'],['Mouth_Context','153,287 174,286 190,290 207,299 205,309 186,316 168,311 153,301','Mouth_']];
 for(const [name,outline,prefix]of contexts){const b=Buffer.alloc(N*4),ps=points(outline);for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!polygon(x+.5,y+.5,ps))continue;const i=(y*W+x)*4;for(const l of m.layers){if(l.name.startsWith(prefix)||l.name.startsWith('Hair_'))continue;const r=raw[l.name];if(r[i+3]){r.copy(b,i,i,i+4);r.fill(0,i,i+4);}}}raw[name]=b;m.layers.push(await put(name,b));}
 for(const l of m.layers)await put(l.name,raw[l.name]);
 const masked=(data,mask)=>{const b=Buffer.from(data);for(let i=0;i<N;i++)b[i*4+3]=Math.round(b[i*4+3]*mask[i]/255);return b;};
 const skin=await sharp(path.join(out,'restoration_sources/skin.png')).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
 const headNames=m.layers.map(l=>l.name).filter(n=>!/^(Background|Hood_|Outfit_|Body_)/.test(n));
 const restores=[await put('Restore_Skin',masked(skin,union(headNames)))];
 const hairNames=headNames.filter(n=>n.startsWith('Hair_')||n==='Head_EdgeResidual');const hairMask=union(hairNames),eroded=Buffer.alloc(N);
 for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++){let ok=255;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)ok=Math.min(ok,hairMask[(y+dy)*W+x+dx]);eroded[y*W+x]=ok;}
 const original=await sharp(path.join(out,'original.png')).ensureAlpha().raw().toBuffer();
 restores.push(await put('Restore_HairOverlap',masked(original,eroded)));
 const eyes=await sharp(path.join(out,'restoration_sources/eyes.png')).resize(W,H,{fit:'fill'}).ensureAlpha().raw().toBuffer();
 for(const s of ['L','R']){const mask=union(['White','Iris','Pupil','Highlight'].map(n=>'Eye_'+s+'_'+n));restores.push(await put('Restore_EyeWhite_'+s,masked(eyes,mask)));const a=Buffer.alloc(N*4,255);for(let i=0;i<N;i++)a[i*4+3]=mask[i];await put('EyeMask_'+s,a);}
 const mouth=await sharp(path.join(out,'restoration_sources/mouth.png')).trim().resize(40,19,{fit:'fill'}).ensureAlpha().raw().toBuffer();
 const mouthBuffers={Restore_MouthInside:Buffer.alloc(N*4),Restore_TeethUpper:Buffer.alloc(N*4),Restore_Tongue:Buffer.alloc(N*4)};
 for(let y=0;y<19;y++)for(let x=0;x<40;x++){const i=(y*40+x)*4,r=mouth[i],g=mouth[i+1],b=mouth[i+2];const key=y<7&&Math.min(r,g,b)>115?'Restore_TeethUpper':y>9&&r>105&&g>45?'Restore_Tongue':'Restore_MouthInside';mouth.copy(mouthBuffers[key],((y+295)*W+x+159)*4,i,i+4);}
 const inner=[];for(const [name,b]of Object.entries(mouthBuffers))inner.push({...await put(name,b),hidden:true});
 const layers=[m.layers[0],...restores,...m.layers.slice(1),...inner];
 const manifest={width:W,height:H,psd:'Jett_restored_motion_layers.psd',preview:'neutral_exact.png',status:'HIDDEN_RESTORATION_PLUS_SOURCE_PIXELS_MOTION_PROOF',sourceVisiblePixelsUnchanged:true,restorationGenerated:true,layers};
 fs.writeFileSync(path.join(out,'layers.json'),JSON.stringify(manifest,null,2));
 const assets={width:W,height:H,layers:m.layers,images:{}};
 for(const l of [...layers,...['L','R'].map(s=>({name:'EyeMask_'+s,file:'parts/EyeMask_'+s+'.png'})),{name:'Original',file:'original.png'}])assets.images[l.name]='data:image/png;base64,'+fs.readFileSync(path.join(out,l.file)).toString('base64');
 const player=fs.readFileSync('work/rig_player.js','utf8');
 const html=`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>제트 · 원본 보존 동작 확인</title><style>*{box-sizing:border-box}body{background:#111722;color:#edf1f8;font:14px/1.6 system-ui,sans-serif;margin:0}main{max-width:1120px;margin:auto;padding:24px}h1{font-size:24px;margin:0}p,small{color:#afbbcf}.grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:24px;margin-top:20px}canvas{width:100%;height:auto;background:#252c3a;border-radius:12px}aside{background:#1d2737;border-radius:12px;padding:16px}label{display:block;margin:7px 0}label span{display:flex;justify-content:space-between}input[type=range]{width:100%;accent-color:#83c2e9}button{border:1px solid #536883;background:#2d405a;color:white;padding:9px 12px;border-radius:7px;cursor:pointer;margin:3px}audio{width:100%;height:35px;margin-top:9px}input[type=file]{max-width:100%;margin:8px 0}output{color:#91cbe9;font-variant-numeric:tabular-nums}.status{color:#a3ddc5;margin:8px 0}.toggles{display:flex;gap:12px;flex-wrap:wrap}.notice{border-left:3px solid #6a91b9;padding-left:12px}details{margin-top:12px}@media(max-width:800px){.grid{grid-template-columns:1fr}main{padding:16px}}</style><main><h1>제트 · 원본 보존 동작 확인</h1><p>보이는 그림은 원본 그대로, 움직일 때 드러나는 안쪽만 보완했습니다.</p><div class="grid"><section><canvas id="portrait"></canvas><div class="status" id="state">이미지 준비 중…</div><button id="reset">원본 자세로 초기화</button><button id="compare">누르는 동안 원본 보기</button><div class="toggles"><label><input type="checkbox" id="auto">자동 깜빡임</label><label><input type="checkbox" id="physics">머리·후드 흔들림</label><label><input type="checkbox" id="follow">포인터 따라 시선</label><label><input type="checkbox" id="speech">말하기 동작</label></div><p class="notice">이 화면은 파츠 움직임을 확인하는 브라우저용 2D 리그입니다. Cubism 모델 파일은 아닙니다. 고개 좌우·상하는 작은 이동으로 근사하며 큰 회전과 실제 원근 변형은 아직 적용하지 않았습니다.</p><details><summary>오디오 립싱크</summary><button id="mic">마이크 립싱크</button><input id="audioFile" type="file" accept="audio/*"><audio id="audio" controls></audio><small id="audioStatus">마이크 또는 선택한 오디오의 음량으로 입을 움직입니다. 파일은 외부로 전송하지 않습니다.</small></details></section><aside><div id="controls"></div><button id="export">현재 값 저장</button><small>좌우 표기는 캐릭터 기준입니다. 현재 원본은 341×361px로, 화면에서는 확대해 보입니다.</small></aside></div></main><script>const ASSET_DATA=${JSON.stringify(assets)};${player}</script></html>`;
 fs.writeFileSync(path.join(out,'동작_확인.html'),html);
 console.log(JSON.stringify({psdLayers:layers.length,sourceLayers:m.layers.length,restorationLayers:restores.length+inner.length,output:out}));
})().catch(e=>{console.error(e);process.exit(1)});
