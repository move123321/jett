// Source-pixel partition and PSD packaging; restoration artwork is generated separately.
const fs=require('fs'),path=require('path');
const sharp=require('C:/Users/seogh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='outputs/Jett_SD_Live2D_v1',polys=[];
const P=(name,s)=>polys.push({name,points:s.split(' ').map(p=>p.split(',').map(Number))});
P('Leg_R','390,927 595,937 602,1020 569,1197 567,1372 366,1372');
P('Leg_L','595,937 779,917 819,1372 566,1372 569,1197 602,1020');
P('Arm_R','474,766 522,808 487,919 440,980 434,1049 335,1080 318,978 383,882');
P('Arm_L','711,757 766,764 814,902 878,990 894,1070 810,1082 765,997 724,923 680,807');
P('Hood','447,671 535,661 641,661 752,678 777,726 744,797 657,795 531,798 456,766');
P('Neck','554,673 642,673 647,717 555,717');
P('Head_Base','363,344 547,310 714,344 837,494 836,610 781,634 744,661 681,689 606,710 556,696 490,674 444,642 376,621 363,562');
P('Hair_Back','329,223 418,161 594,152 756,163 838,249 879,424 905,626 813,646 744,656 779,565 761,488 675,374 545,352 480,386 449,453 423,540 429,634 345,628 311,471');
P('Hair_Bun','322,0 804,0 815,247 746,243 693,192 618,162 540,167 447,199 369,269');
P('Hair_Front_R','236,397 312,278 435,189 544,165 590,187 581,290 546,373 512,386 481,450 456,493 411,540 356,570 322,634 299,575 218,552 252,469');
P('Hair_Front_L','590,186 683,156 808,199 859,299 890,426 930,519 898,634 843,598 821,550 776,505 743,460 710,417 671,388 636,365 581,375 566,328');
P('Hair_Front_Center','551,273 591,278 641,329 680,416 674,472 650,521 609,566 577,585 616,529 638,474 639,431 626,389 609,374 569,373');
P('Hair_Side_R','409,526 438,498 448,535 439,604 443,697 456,775 478,829 449,811 422,770 410,690 400,609');
P('Hair_Side_L','774,509 804,526 824,576 823,657 805,740 777,800 750,829 771,775 782,705 791,633 778,612');
P('Brow_R','446,478 484,479 527,492 560,508 579,535 549,523 511,509 465,499');
P('Brow_L','638,510 676,494 715,482 752,483 749,501 711,503 674,517 639,535');
P('Eye_R_White','442,518 481,519 526,532 557,552 574,581 548,594 505,595 467,582 445,554');
P('Eye_L_White','648,558 675,535 716,523 757,521 772,548 747,582 710,596 674,595 643,580');
P('Eye_R_Iris','491,540 515,539 538,549 551,567 548,583 532,590 509,590 494,578 489,559');
P('Eye_L_Iris','676,547 698,540 720,541 734,551 732,573 719,587 697,591 677,583 666,568');
P('Eye_R_Lash','433,516 452,523 455,516 471,525 491,524 518,531 544,545 561,561 569,577 550,563 530,551 506,546 478,547 462,547 459,570 448,557 445,540');
P('Eye_L_Lash','643,577 653,555 679,536 705,528 737,526 751,517 755,525 780,519 764,537 760,554 750,571 750,546 726,545 702,547 680,554 660,565');
P('Nose','593,606 618,606 619,633 593,633');
P('Mouth_Closed','576,640 633,640 633,667 576,667');
function inside(x,y,ps){let v=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++){let [a,b]=ps[i],[c,d]=ps[j];if((b>y)!=(d>y)&&x<(c-a)*(y-b)/(d-b)+a)v=!v}return v}
(async()=>{
fs.mkdirSync(root+'/parts',{recursive:true});
const src='outputs/Jett_SD_v1/SD_master.png',{data,info}=await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height;
const labels=new Uint8Array(w*h),entries=[{name:'Body_Base'},...polys],layers=[];
for(let k=0;k<polys.length;k++)for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(inside(x+.5,y+.5,polys[k].points))labels[y*w+x]=k+1;
const joined=Buffer.alloc(data.length);
async function save(name,b,hidden=false){let x0=w,y0=h,x1=-1,y1=-1,count=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(b[(y*w+x)*4+3]){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);count++}if(!count)throw Error('Empty '+name);let file='parts/'+name+'.png';await sharp(b,{raw:{width:w,height:h,channels:4}}).extract({left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}).png().toFile(root+'/'+file);return {name,file,x:x0,y:y0,hidden,pixels:count}}
// Backing is visible only behind the facial features. It does not replace the original visible face.
const backingPath='C:/Users/seogh/.codex/generated_images/01a0e753-0e91-7842-95df-8f771e152508/exec-b160d64d-75f3-4440-bb79-1555d0d74ca3.png';
const back=await sharp(backingPath).resize(w,h,{fit:'fill'}).ensureAlpha().raw().toBuffer(),bb=Buffer.alloc(data.length);
for(let y=480;y<680;y++)for(let x=435;x<780;x++){let n=(y*w+x)*4;if(data[n+3]===255&&['Head_Base','Brow_R','Brow_L','Eye_R_White','Eye_L_White','Eye_R_Iris','Eye_L_Iris','Eye_R_Lash','Eye_L_Lash','Nose','Mouth_Closed'].includes(entries[labels[y*w+x]].name))back.copy(bb,n,n,n+4)}
layers.push(await save('Restore_FacialSkin',bb));
for(let k=0;k<entries.length;k++){let b=Buffer.alloc(data.length);for(let i=0;i<labels.length;i++)if(labels[i]===k&&data[i*4+3]){data.copy(b,i*4,i*4,i*4+4);data.copy(joined,i*4,i*4,i*4+4)}layers.push(await save(entries[k].name,b))}
// Alternate eye/mouth artwork remains hidden until keyed in Cubism.
for(const [name,file,box] of [['Eye_R_Closed','blink.png',[438,537,568,601]],['Eye_L_Closed','blink.png',[645,538,777,601]],['Mouth_Open','talk.png',[576,634,633,680]]]){const alt=await sharp('outputs/Jett_SD_v1/'+file).ensureAlpha().raw().toBuffer(),b=Buffer.alloc(data.length);for(let y=box[1];y<box[3];y++)for(let x=box[0];x<box[2];x++){const i=(y*w+x)*4;alt.copy(b,i,i,i+4)}layers.push(await save(name,b,true))}
for(let i=0;i<data.length;i+=4)if(data[i+3]&& !data.subarray(i,i+4).equals(joined.subarray(i,i+4)))throw Error('source partition mismatch');
fs.copyFileSync(src,root+'/SD_master.png');fs.copyFileSync(backingPath,root+'/restoration_source.png');
fs.writeFileSync(root+'/boundaries.json',JSON.stringify(polys,null,2));
fs.writeFileSync(root+'/layers.json',JSON.stringify({width:w,height:h,psd:'Jett_SD_parts.psd',preview:'assembled_preview.png',cubismCompatible:true,status:'PARTITIONED_ART_NOT_RIGGED',layers},null,2));
fs.writeFileSync(root+'/verification.json',JSON.stringify({sourceVisiblePixelsPartitionedExactly:true,layerCount:layers.length,cubismImportVerified:false,nativeModelCreated:false},null,2));console.log('SD parts:',layers.length);
})().catch(e=>{console.error(e);process.exit(1)});
