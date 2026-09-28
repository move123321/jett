// Lossless source-pixel assignment to editable PSD layers. No repainting/resampling.
const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve('outputs/Live2D_original_exact_v1');
const polys=[];
const add=(name,points,note)=>polys.push({name,points:points.map(p=>p.split(',').map(Number)),note});
const P=(name,points,note='원본에서 보이는 픽셀만 분리. 가려진 부분 복원 필요.')=>add(name,points.split(' '),note);

// Lower drawing and skin, then foreground parts. L/R are the character's sides.
P('Hood_Back','0,283 23,272 55,261 82,253 113,263 132,305 258,283 279,292 307,319 309,361 0,361');
P('Outfit_VisibleBottom','0,338 23,347 37,361 274,361 251,342 229,340 218,326 109,331 98,345 111,361 0,361');
P('Hood_Rim_R','0,282 23,271 54,261 82,251 94,257 68,260 37,270 3,287');
P('Hood_Front_R','0,311 12,322 22,341 37,350 70,354 89,350 99,361 24,361 10,346 0,344');
P('Hood_Front_L','224,320 247,321 273,332 302,350 303,361 263,361 240,344 213,339');
P('Neck_Base','115,279 145,304 193,313 221,292 218,324 210,361 124,361 106,345');
P('Face_Base','132,157 153,139 180,134 200,141 215,166 242,192 254,226 249,257 234,282 218,306 199,324 179,337 167,339 155,333 139,320 124,302 115,280 106,254 102,224 109,188');
P('Ear_R','88,179 98,178 109,197 113,225 103,247 90,238 82,222 77,204 78,191');
P('Ear_L','251,225 266,220 264,246 253,266 239,276');
P('Hair_Back_R','103,170 112,184 110,220 108,261 100,295 91,279 85,246 84,214');
P('Hair_Back_L','261,136 283,151 289,183 290,228 280,266 259,311 250,307 257,284 264,246 269,205');
P('Hair_Bun','92,49 94,34 104,17 112,9 242,9 252,15 259,25 257,36 253,47 244,52 226,53 202,47 180,49 156,51 132,60 109,58 101,44');
P('Hair_Crown','89,79 104,65 123,54 145,49 168,47 182,37 199,32 225,32 246,43 263,57 276,66 287,81 291,110 286,126 272,139 256,125 235,114 204,102 180,94 153,100 127,108 104,108 81,117');
P('Hair_Front_R_Outer','49,157 67,133 83,109 105,91 123,79 141,73 155,75 172,92 163,113 147,135 131,153 109,174 89,189 69,209 45,232 63,203 75,180 64,186 39,205 54,181 63,164');
P('Hair_Front_R_Inner','92,139 112,114 131,94 148,87 162,91 173,107 166,122 152,140 139,153 130,176 121,189 116,214 114,186 106,196 101,205 109,179 121,153 104,166 80,180');
P('Hair_Front_L_Main','181,86 199,76 220,77 244,86 263,99 278,121 288,143 299,175 310,194 321,211 303,202 291,189 279,174 287,209 287,235 279,224 271,208 266,194 259,165 245,146 229,133 215,122 198,115');
P('Hair_Front_Center','165,104 177,94 189,94 203,105 210,122 215,143 215,165 209,188 198,212 185,228 174,237 185,219 193,197 201,174 202,151 197,137 181,133 166,139 153,147 160,126');
P('Hair_Front_L_Inner','213,111 229,114 243,126 254,144 262,168 267,198 268,227 263,249 253,265 241,280 233,283 245,268 252,248 253,218 249,188 242,163 231,142 217,133');
P('Hair_Side_R','101,186 108,200 104,233 102,271 100,310 100,337 107,358 107,361 94,361 89,336 86,302 88,266 90,232 92,209');
P('Hair_Side_L','273,172 280,186 282,211 284,242 283,269 280,301 278,328 278,349 283,361 268,361 265,350 266,322 270,291 272,260 273,228');
P('Hair_Side_L_Outer','290,214 298,245 300,278 296,309 290,339 288,361 283,361 286,329 290,297 293,267');
P('Brow_R','119,188 129,190 143,195 156,201 170,209 180,214 176,220 164,213 149,206 135,200 122,197');
P('Brow_L','209,217 218,213 229,210 245,209 260,212 261,217 249,217 235,216 223,220 212,223');
P('Eye_R_White','123,210 135,210 150,213 160,219 167,226 158,229 144,229 133,224 127,218');
P('Eye_L_White','216,229 227,225 239,225 250,227 257,230 250,237 238,242 225,240 218,236');
P('Eye_R_Iris','138,211 149,212 154,217 153,224 149,228 142,227 137,222 137,216');
P('Eye_L_Iris','228,225 239,225 244,228 244,234 239,239 232,240 227,236 226,231');
P('Eye_R_Pupil','143,214 148,215 149,219 147,222 143,221 142,218');
P('Eye_L_Pupil','232,228 237,228 239,231 237,235 233,236 231,232');
P('Eye_R_Highlight','141,213 145,213 146,217 142,218');
P('Eye_L_Highlight','230,226 234,226 235,230 231,231');
P('Eye_R_LashUpper','115,199 122,204 134,208 149,211 159,217 169,224 171,229 166,227 157,220 148,217 137,214 127,214 121,211');
P('Eye_L_LashUpper','210,231 216,225 228,222 241,222 253,225 264,224 268,225 260,230 253,232 244,229 233,228 222,231 215,235');
P('Eye_R_LashLower','124,217 131,224 140,228 151,229 163,227 166,229 155,232 143,231 134,228 127,223');
P('Eye_L_LashLower','215,234 223,239 233,241 243,238 254,234 253,237 243,242 232,244 223,242 216,237');
P('Nose_Shading','181,253 191,254 196,267 203,273 199,280 188,284 178,279 175,273');
P('Mouth_LipUpper','155,293 167,292 176,291 183,294 191,294 201,301 195,303 183,299 170,298 160,297');
P('Mouth_LipLower','158,297 170,298 183,299 198,302 189,310 178,311 167,306');
P('Mouth_Line','157,293 167,295 178,296 188,299 199,300 203,303 197,303 187,301 176,299 167,298 158,296');

function inside(x,y,points){let flag=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const [xi,yi]=points[i],[xj,yj]=points[j];if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))flag=!flag;}return flag;}

(async()=>{
 fs.mkdirSync(path.join(root,'parts'),{recursive:true});
 const input=path.resolve('outputs/REFERENCE_original.png');
 const {data,info}=await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const w=info.width,h=info.height, labels=new Uint16Array(w*h);
 for(let k=0;k<polys.length;k++)for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inside(x+.5,y+.5,polys[k].points))labels[y*w+x]=k+1;
 const entries=[{name:'Background_Unassigned_Original',note:'원본 배경 및 미분류 경계 픽셀. 합성 외관 보존용. 모델 가져오기 전 제외.'},...polys];
 const layers=[]; const rejoined=Buffer.alloc(data.length);
 for(let k=0;k<entries.length;k++){
  const buf=Buffer.alloc(data.length);let count=0;
  for(let i=0;i<labels.length;i++)if(labels[i]===k){data.copy(buf,i*4,i*4,i*4+4);data.copy(rejoined,i*4,i*4,i*4+4);count++;}
  if(!count)throw Error('Empty layer '+entries[k].name);
  const file='parts/'+entries[k].name+'.png';
  await sharp(buf,{raw:{width:w,height:h,channels:4}}).png().toFile(path.join(root,file));
  layers.push({name:entries[k].name,file,x:0,y:0,pixels:count,note:entries[k].note});
 }
 if(!data.equals(rejoined))throw Error('Pixel mismatch');
 fs.copyFileSync(input,path.join(root,'original.png'));
 const manifest={width:w,height:h,psd:'Jett_ORIGINAL_pixels_layers.psd',preview:'reassembled_exact.png',status:'VISIBLE_SOURCE_PIXELS_ONLY_NOT_RIG_READY',sourcePixelsUnchanged:true,generatedImageUsed:false,layers};
 fs.writeFileSync(path.join(root,'layers.json'),JSON.stringify(manifest,null,2));
 fs.writeFileSync(path.join(root,'boundaries.json'),JSON.stringify(polys,null,2));
 console.log(JSON.stringify({width:w,height:h,nonemptyLayers:layers.length,coveredPixels:labels.length,pixelIdentityVerified:true}));
})().catch(e=>{console.error(e);process.exit(1)});
