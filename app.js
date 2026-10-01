const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const blankPositions=()=>Object.fromEntries(POSITIONS.map(p=>[p.key,[]]));
const state={
  phase:'home',
  round1Groups:[],round1Index:0,round1Selections:[],round1Winners:[],round1Losers:[],round1Signature:'',
  round2Groups:[],round2Index:0,round2Selections:[],round2Winners:[],round2Losers:[],
  revived:[],finalGroups:[],finalIndex:0,finalSelections:[],finalNine:[],finalSignature:'',
  activePosition:'leader',positions:blankPositions(),focusIndex:4,teamName:''
};
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function chunk(a,n){const out=[];for(let i=0;i<a.length;i+=n)out.push(a.slice(i,i+n));return out}
function setTheme(theme){document.body.dataset.theme=theme}
function showScreen(name,theme=name){$$('.screen').forEach(s=>s.classList.remove('active'));$(`#screen-${name}`).classList.add('active');setTheme(theme);window.scrollTo({top:0,behavior:'instant'})}
function cardHTML(p,selected=false){return `<article class="candidate-card ${selected?'selected':''}" data-id="${p.id}"><img src="${p.image}" alt="${p.name}" loading="eager"><div class="name">${p.name}</div></article>`}
function renderHero(){const picks=shuffle(CANDIDATES).slice(0,4);$('#hero-stack').innerHTML=picks.map(p=>`<figure><img src="${p.image}" alt=""></figure>`).join('')}
function resetState(){Object.assign(state,{phase:'home',round1Groups:chunk(shuffle(CANDIDATES),4),round1Index:0,round1Selections:[],round1Winners:[],round1Losers:[],round1Signature:'',round2Groups:[],round2Index:0,round2Selections:[],round2Winners:[],round2Losers:[],revived:[],finalGroups:[],finalIndex:0,finalSelections:[],finalNine:[],finalSignature:'',activePosition:'leader',positions:blankPositions(),focusIndex:4,teamName:''})}
function computeRound(groups,selections){const winners=[],losers=[];groups.forEach((g,i)=>{const ids=new Set(selections[i]||[]);g.forEach(p=>(ids.has(p.id)?winners:losers).push(p))});return{winners,losers}}
function signature(arr){return arr.map(x=>x.id).sort().join('|')}
const QUOTES={
  general:[
    '故事开始的时候，他们还只是练习室里的小孩。','原来真的有人，可以被镜头记录着一点一点长大。','第一次见面的时候，谁也不知道故事会写这么久。','你看到的不是结果，是他的好多年。','少年人的故事，本来就应该写得慢一点。','有些故事的开头，只是一间小小的练习室。','小时候的愿望，后来真的变成了舞台。','不是突然长大，是我们刚好看过他的每一个阶段。','下一次见面，又会比这一次长大一点。','从练习室，到更大的舞台。','小时候说过的话，长大以后要记得实现。','以前站在最后一排的小孩，也会有走到最前面的一天。','镜头留下来的，是少年时代只有一次的证据。','那时候还不知道，原来以后真的会有很多人认识你。','很多年前种下的小小愿望，现在正在慢慢发芽。','从籍籍无名，到拥有自己的名字。','少年没有一夜长大，只是镜头替我们保存了过程。','陪伴最神奇的地方，是回头的时候才发现已经走了这么远。','练习室的镜子，见过他们最普通的样子。','后来站上舞台的人，也曾经只是角落里认真练习的小孩。','以前总觉得未来很远，后来未来真的来了。','故事一直往前走，所以每一次同框都会成为从前。','少年时代很短，好在有人替他们记录。','镜头不会永远停在十六岁。','长大原来是一件一边得到，一边告别的事情。','小时候总想快点长大，后来才发现小时候只有一次。','原来很多年以后，我们还会记得他小时候的样子。','有人离开，有人留下，但练习室的灯还是会亮。','这一页翻过去，他们就又长大了一点。'
  ],
  pick:['六十个人的故事，最后只留下九个名字。','这一轮留下谁，由你决定。','总有人要告别，但现在还没到说再见的时候。','再看一眼，也许下一页就见不到了。','有时候所谓选择，只是留下更舍不得的那个。','九个位置很少，喜欢的人却很多。','如果一定要选，那就选你最舍不得放走的人。'],
  revival:['被淘汰不代表故事结束了。','幸好，有些告别还有反悔的机会。','这一次，把想留下的人带回来。'],
  final:['最后九个位置，要留给谁？','故事写到这里，已经没有容易的选择了。','从六十个人里一路走到这里，已经很远了。','名单越来越短，故事却越来越长。'],
  result:['好了，现在是你的九个人。']
};
let lastQuote='';
function randomQuote(kind='general'){
  const specific=QUOTES[kind]||[], pool=kind==='general'?QUOTES.general:[...specific,...QUOTES.general];
  const choices=pool.filter(q=>q!==lastQuote), q=choices[Math.floor(Math.random()*choices.length)]||pool[0]||'';
  lastQuote=q; return `“${q}”`;
}
function setStageQuote(kind){$('#stage-desc').textContent=randomQuote(kind);$('#coverage-text').textContent=''}
function bindPickCards(need,preselected,onNext){let selected=[...preselected];const btn=$('#next-pick-btn'),count=$('#selection-count');const update=()=>{count.textContent=`已选择 ${selected.length} / ${need}`;btn.disabled=selected.length!==need};const sync=()=>{$$('#card-grid .candidate-card').forEach(c=>c.classList.toggle('selected',selected.includes(c.dataset.id)))};$$('#card-grid .candidate-card').forEach(c=>c.onclick=()=>{const id=c.dataset.id;if(selected.includes(id)){selected=selected.filter(x=>x!==id)}else if(selected.length<need){selected.push(id)}else{selected=[...selected.slice(0,need-1),id]}sync();update()});btn.onclick=()=>onNext([...selected]);sync();update()}
function setBackEnabled(enabled){$('#back-pick-btn').disabled=!enabled}
function startGame(){resetState();state.phase='round1';showScreen('pick','round1');renderRound1()}
function renderRound1(){state.phase='round1';setTheme('round1');const g=state.round1Groups[state.round1Index],need=2,pre=state.round1Selections[state.round1Index]||[];$('#stage-kicker').textContent='01 / FIRST STAGE';$('#stage-name').textContent='初舞台';$('#stage-rule').textContent='4选2';setStageQuote('pick');$('#progress-text').textContent=`${state.round1Index+1} / ${state.round1Groups.length}`;$('#card-grid').innerHTML=g.map(p=>cardHTML(p,pre.includes(p.id))).join('');setBackEnabled(state.round1Index>0);bindPickCards(need,pre,ids=>{state.round1Selections[state.round1Index]=ids;state.round1Index++;if(state.round1Index<state.round1Groups.length){renderRound1();return}const r=computeRound(state.round1Groups,state.round1Selections);state.round1Winners=r.winners;state.round1Losers=r.losers;initRound2()})}
function initRound2(){const sig=signature(state.round1Winners);if(!state.round2Groups.length||sig!==state.round1Signature){state.round2Groups=chunk(shuffle(state.round1Winners),4);state.round2Selections=[];state.round2Index=0;state.round1Signature=sig}else state.round2Index=Math.min(state.round2Index,state.round2Groups.length-1);state.phase='round2';showScreen('pick','round2');renderRound2()}
function renderRound2(){state.phase='round2';setTheme('round2');const g=state.round2Groups[state.round2Index],need=Math.ceil(g.length/2),pre=state.round2Selections[state.round2Index]||[];$('#stage-kicker').textContent='02 / NEXT STAGE';$('#stage-name').textContent='晋级赛';$('#stage-rule').textContent=`${g.length}选${need}`;setStageQuote('pick');$('#progress-text').textContent=`${state.round2Index+1} / ${state.round2Groups.length}`;$('#card-grid').innerHTML=g.map(p=>cardHTML(p,pre.includes(p.id))).join('');setBackEnabled(true);bindPickCards(need,pre,ids=>{state.round2Selections[state.round2Index]=ids;state.round2Index++;if(state.round2Index<state.round2Groups.length){renderRound2();return}const r=computeRound(state.round2Groups,state.round2Selections);state.round2Winners=r.winners;state.round2Losers=r.losers;initRevival()})}
function goBackPick(){if(state.phase==='round1'){if(state.round1Index>0){state.round1Index--;renderRound1()}return}if(state.phase==='round2'){if(state.round2Index>0){state.round2Index--;renderRound2()}else{state.round1Index=state.round1Groups.length-1;state.phase='round1';renderRound1()}return}if(state.phase==='final'){if(state.finalIndex>0){state.finalIndex--;renderFinalPick()}else initRevival()}}
function initRevival(){const r=computeRound(state.round2Groups,state.round2Selections);state.round2Winners=r.winners;state.round2Losers=r.losers;state.phase='revival';showScreen('revival','revival');renderRevival()}
function revivalPool(){const r=computeRound(state.round2Groups,state.round2Selections);return r.losers.length?r.losers:[...state.round2Losers]}
function renderRevival(){const pool=revivalPool();$('#revival-quote').textContent=randomQuote('revival');$('#revival-pool-count').textContent=pool.length;$('#revival-count').textContent=`已复活 ${state.revived.length} / 3`;$('#revival-grid').innerHTML=pool.map(p=>`<article class="battle-card ${state.revived.some(x=>x.id===p.id)?'revived':''}" data-id="${p.id}"><img src="${p.image}" alt="${p.name}" loading="lazy"><div class="name">${p.name}</div></article>`).join('');$$('#revival-grid .battle-card').forEach(c=>c.onclick=()=>{const p=pool.find(x=>x.id===c.dataset.id),on=state.revived.some(x=>x.id===p.id);if(on)state.revived=state.revived.filter(x=>x.id!==p.id);else if(state.revived.length<3)state.revived.push(p);renderRevival()});$('#finish-revival-btn').disabled=state.revived.length!==3}
function initFinalPick(){const pool=[...state.round2Winners,...state.revived],sig=signature(pool);if(!state.finalGroups.length||sig!==state.finalSignature){state.finalGroups=chunk(shuffle(pool),2);state.finalSelections=[];state.finalIndex=0;state.finalNine=[];state.finalSignature=sig}else state.finalIndex=Math.min(state.finalIndex,state.finalGroups.length-1);state.phase='final';showScreen('pick','final');renderFinalPick()}
function renderFinalPick(){state.phase='final';setTheme('final');const g=state.finalGroups[state.finalIndex],pre=state.finalSelections[state.finalIndex]||[];$('#stage-kicker').textContent='04 / FINAL PICK';$('#stage-name').textContent='最终席位';$('#stage-rule').textContent='2选1';setStageQuote('final');$('#progress-text').textContent=`${state.finalIndex+1} / ${state.finalGroups.length}`;$('#card-grid').innerHTML=g.map(p=>cardHTML(p,pre.includes(p.id))).join('');setBackEnabled(true);bindPickCards(1,pre,ids=>{state.finalSelections[state.finalIndex]=ids;state.finalIndex++;if(state.finalIndex<state.finalGroups.length){renderFinalPick();return}const r=computeRound(state.finalGroups,state.finalSelections);state.finalNine=r.winners;initPositions()})}
function initPositions(){showScreen('position','position');renderPositions()}
function renderPositions(){
  $('#position-list').innerHTML=POSITIONS.map(p=>`<button class="position-btn ${state.activePosition===p.key?'active':''}" data-key="${p.key}"><span>${p.label}</span><small>${p.hint}</small></button>`).join('');
  const cur=POSITIONS.find(p=>p.key===state.activePosition), current=state.positions[state.activePosition];
  $('#position-tip').textContent=`${cur.label} · ${cur.hint} · 已选 ${current.length}`;
  $('#position-members').innerHTML=state.finalNine.map(p=>`<article class="position-member ${current.includes(p.id)?'active':''}" data-id="${p.id}"><img src="${p.image}" alt="${p.name}"><div class="name">${p.name}</div></article>`).join('');
  $$('.position-btn').forEach(b=>b.onclick=()=>{state.activePosition=b.dataset.key;renderPositions()});
  $$('.position-member').forEach(c=>c.onclick=()=>{const id=c.dataset.id,pos=POSITIONS.find(p=>p.key===state.activePosition),a=state.positions[state.activePosition];if(a.includes(id)){state.positions[state.activePosition]=a.filter(x=>x!==id)}else if(a.length<pos.max){state.positions[state.activePosition]=[...a,id]}else if(pos.max===1){state.positions[state.activePosition]=[id]}renderPositions()});
  $('#finish-position-btn').disabled=false;
  const tagged=Object.values(state.positions).reduce((n,a)=>n+a.length,0);
  $('#position-validation').textContent=tagged?'定位随你安排，想留白也完全可以。':'定位是加分项，不想分也可以直接成团。';
}
function tagList(p){return POSITIONS.filter(pos=>state.positions[pos.key].includes(p.id)).map(pos=>pos.label)}
function memberHTML(p,i){const tags=tagList(p);return `<article class="final-member" data-index="${i}"><span class="seat-no">0${i+1}</span><img src="${p.image}" alt="${p.name}"><h3>${p.name}</h3><div class="tags">${(tags.length?tags:['成员']).map(t=>`<span>${t}</span>`).join('')}</div></article>`}
function updateTeamName(value){state.teamName=value.trim();$('#team-name-count').textContent=`${value.length} / 18`;$('#result-team-title').textContent=state.teamName||'你的楼娱限定团';$('#download-poster').download=`${state.teamName||'我的楼娱限定团'}_FINAL9.png`}
function renderResult(){showScreen('result','result');$('#result-sub').textContent=randomQuote('result');state.focusIndex=4;$('#team-name-input').value=state.teamName;updateTeamName(state.teamName);$('#final-grid').innerHTML=state.finalNine.map(memberHTML).join('');$$('.final-member').forEach(card=>card.onclick=()=>{if($('#showcase').classList.contains('fan-mode')){state.focusIndex=Number(card.dataset.index);layoutFan()}});setView('fan')}
function circularOffset(i,focus,n){let d=i-focus;if(d>n/2)d-=n;if(d<-n/2)d+=n;return d}
function layoutFan(){const n=state.finalNine.length,mobile=window.innerWidth<=820,step=mobile?window.innerWidth*.17:112,yStep=mobile?7:11,rotStep=mobile?2.7:3.2,scaleStep=mobile?.065:.055;$$('.final-member').forEach((c,i)=>{const d=circularOffset(i,state.focusIndex,n),a=Math.abs(d);c.style.setProperty('--tx',`${d*step}px`);c.style.setProperty('--ty',`${a*yStep}px`);c.style.setProperty('--rot',`${d*rotStep}deg`);c.style.setProperty('--scale',String(1-a*scaleStep));c.style.zIndex=String(20-a);c.style.opacity=String(1-a*.09);c.classList.toggle('focused',i===state.focusIndex)});const p=state.finalNine[state.focusIndex],tags=tagList(p);$('#focus-name').textContent=`${p.name}${tags.length?' · '+tags.join(' / '):''}`}
function shiftFocus(step){state.focusIndex=(state.focusIndex+step+state.finalNine.length)%state.finalNine.length;layoutFan()}
function setView(v){const fan=v==='fan';$('#showcase').className=`showcase ${fan?'fan-mode':'grid-mode'}`;$('#fan-view-btn').classList.toggle('active',fan);$('#grid-view-btn').classList.toggle('active',!fan);$('#focus-name').style.visibility=fan?'visible':'hidden';$('#gesture-hint').style.visibility=fan?'visible':'hidden';if(fan)layoutFan()}
let touchX=null,dragX=null,wheelLock=false;
$('#showcase').addEventListener('touchstart',e=>{touchX=e.touches[0].clientX},{passive:true});
$('#showcase').addEventListener('touchend',e=>{if(touchX===null)return;const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>36)shiftFocus(dx<0?1:-1);touchX=null},{passive:true});
$('#showcase').addEventListener('wheel',e=>{if(!$('#showcase').classList.contains('fan-mode')||wheelLock)return;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(delta)<5)return;e.preventDefault();wheelLock=true;shiftFocus(delta>0?1:-1);setTimeout(()=>wheelLock=false,260)},{passive:false});
$('#showcase').addEventListener('pointerdown',e=>{if(!$('#showcase').classList.contains('fan-mode'))return;dragX=e.clientX;$('#showcase').setPointerCapture?.(e.pointerId)});
$('#showcase').addEventListener('pointerup',e=>{if(dragX===null)return;const dx=e.clientX-dragX;if(Math.abs(dx)>34)shiftFocus(dx<0?1:-1);dragX=null});
function loadImg(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}
function roundRect(ctx,x,y,w,h,r){const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath()}
async function makePoster(){const W=1080,H=1440,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#f7f8fb');grad.addColorStop(.5,'#edf1f7');grad.addColorStop(1,'#e8e5f1');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(93,103,125,.28)';ctx.lineWidth=2;ctx.strokeRect(28,28,W-56,H-56);ctx.textAlign='center';ctx.fillStyle='#15191e';ctx.font='italic 36px Georgia';ctx.fillText('09  ·  LIMITED DEBUT LINE-UP',W/2,72);ctx.font='500 59px "Songti SC","STSong",serif';ctx.fillText(state.teamName||'你的楼娱限定团',W/2,142);ctx.fillStyle='#7d8791';ctx.font='16px Arial';ctx.fillText('YOUR FINAL 9 · PICKED BY YOU',W/2,181);const margin=50,gap=16,cardW=(W-margin*2-gap*2)/3,cardH=350,imgH=259,startY=222;for(let i=0;i<9;i++){const p=state.finalNine[i],col=i%3,row=Math.floor(i/3),x=margin+col*(cardW+gap),y=startY+row*(cardH+gap);ctx.save();ctx.fillStyle='rgba(255,255,255,.94)';roundRect(ctx,x,y,cardW,cardH,10);ctx.fill();ctx.strokeStyle='rgba(125,136,147,.35)';ctx.stroke();ctx.clip();try{const safeSrc=(typeof POSTER_IMAGES!=='undefined'&&POSTER_IMAGES[p.id])||p.image;const im=await loadImg(safeSrc);const ir=im.width/im.height,tr=cardW/imgH;let sx=0,sy=0,sw=im.width,sh=im.height;if(ir>tr){sw=im.height*tr;sx=(im.width-sw)/2}else{sh=im.width/tr;sy=(im.height-sh)/2}ctx.drawImage(im,sx,sy,sw,sh,x,y,cardW,imgH)}catch(e){ctx.fillStyle='#e7e9eb';ctx.fillRect(x,y,cardW,imgH)}ctx.restore();ctx.fillStyle='#fff';ctx.font='italic 15px Georgia';ctx.textAlign='left';ctx.fillText(`0${i+1}`,x+12,y+22);ctx.fillStyle='#17191d';ctx.font='600 23px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(p.name,x+15,y+imgH+33);const tags=tagList(p);ctx.fillStyle='#747e88';ctx.font='14px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText((tags.length?tags:['成员']).join(' · '),x+15,y+imgH+62)}ctx.textAlign='center';ctx.fillStyle='#7f8891';ctx.font='13px Arial';ctx.fillText('SDFJ LIMITED GROUP · FINAL 9',W/2,H-36);return c}
async function exportPoster(){const tip=$('#save-tip');tip.textContent='正在排版你的成团海报…';try{const canvas=await makePoster();const url=canvas.toDataURL('image/png');$('#poster-preview').src=url;$('#download-poster').href=url;$('#poster-modal').classList.add('open');$('#poster-modal').setAttribute('aria-hidden','false');tip.textContent='好了，海报已经生成。'}catch(e){console.error(e);tip.textContent='这次没生成成功，刷新后再试一次。'}}
$('#start-btn').onclick=startGame;$('#back-pick-btn').onclick=goBackPick;$('#back-revival-btn').onclick=()=>{state.revived=[];state.round2Index=state.round2Groups.length-1;showScreen('pick','round2');renderRound2()};$('#finish-revival-btn').onclick=initFinalPick;$('#back-position-btn').onclick=()=>{state.positions=blankPositions();state.finalIndex=state.finalGroups.length-1;showScreen('pick','final');renderFinalPick()};$('#finish-position-btn').onclick=renderResult;$('#fan-view-btn').onclick=()=>setView('fan');$('#grid-view-btn').onclick=()=>setView('grid');$('#fan-prev').onclick=()=>shiftFocus(-1);$('#fan-next').onclick=()=>shiftFocus(1);$('#restart-btn').onclick=()=>{resetState();renderHero();showScreen('home','home')};$('#save-btn').onclick=exportPoster;$('#close-modal').onclick=()=>{$('#poster-modal').classList.remove('open');$('#poster-modal').setAttribute('aria-hidden','true')};$('#poster-modal').onclick=e=>{if(e.target===$('#poster-modal'))$('#close-modal').click()};
$('#team-name-input').addEventListener('input',e=>updateTeamName(e.target.value));
window.addEventListener('resize',()=>{if($('#screen-result').classList.contains('active')&&$('#showcase').classList.contains('fan-mode'))layoutFan()});
renderHero();

// V2.8 poster renderer: preserve the complete portrait while keeping each card visually full.
function drawPortraitFit(ctx,im,x,y,w,h){
  const cover=Math.max(w/im.width,h/im.height),cw=im.width*cover,ch=im.height*cover;
  ctx.save();ctx.filter='blur(20px)';ctx.globalAlpha=.22;ctx.drawImage(im,x+(w-cw)/2,y+(h-ch)/2,cw,ch);ctx.restore();
  const contain=Math.min(w/im.width,h/im.height),dw=im.width*contain,dh=im.height*contain;
  ctx.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
}
makePoster=async function(){
  const W=1080,H=1560,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
  const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,'#f7f8fb');grad.addColorStop(.5,'#edf1f7');grad.addColorStop(1,'#e8e5f1');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(93,103,125,.28)';ctx.lineWidth=2;ctx.strokeRect(28,28,W-56,H-56);ctx.textAlign='center';ctx.fillStyle='#15191e';ctx.font='italic 36px Georgia';ctx.fillText('09  ·  LIMITED DEBUT LINE-UP',W/2,72);ctx.font='500 59px "Songti SC","STSong",serif';ctx.fillText(state.teamName||'你的楼娱限定团',W/2,142);ctx.fillStyle='#7d8791';ctx.font='16px Arial';ctx.fillText('YOUR FINAL 9 · PICKED BY YOU',W/2,181);
  const margin=50,gap=16,cardW=(W-margin*2-gap*2)/3,cardH=390,imgH=300,startY=222;
  for(let i=0;i<9;i++){
    const p=state.finalNine[i],col=i%3,row=Math.floor(i/3),x=margin+col*(cardW+gap),y=startY+row*(cardH+gap);
    ctx.save();ctx.fillStyle='rgba(255,255,255,.94)';roundRect(ctx,x,y,cardW,cardH,10);ctx.fill();ctx.strokeStyle='rgba(125,136,147,.35)';ctx.stroke();ctx.clip();
    try{const safeSrc=(typeof POSTER_IMAGES!=='undefined'&&POSTER_IMAGES[p.id])||p.image;const im=await loadImg(safeSrc);ctx.fillStyle='#edf0f5';ctx.fillRect(x,y,cardW,imgH);drawPortraitFit(ctx,im,x,y,cardW,imgH)}catch(e){ctx.fillStyle='#e7e9eb';ctx.fillRect(x,y,cardW,imgH)}
    ctx.restore();ctx.fillStyle='#fff';ctx.font='italic 15px Georgia';ctx.textAlign='left';ctx.fillText(`0${i+1}`,x+12,y+22);ctx.fillStyle='#17191d';ctx.font='600 23px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(p.name,x+15,y+imgH+33);const tags=tagList(p);ctx.fillStyle='#747e88';ctx.font='14px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText((tags.length?tags:['成员']).join(' · '),x+15,y+imgH+62);
  }
  ctx.textAlign='center';ctx.fillStyle='#7f8891';ctx.font='13px Arial';ctx.fillText('SDFJ LIMITED GROUP · FINAL 9',W/2,H-36);return c;
};

// Stop browsers from applying the native blue selection/drag overlay to portrait cards.
document.addEventListener('dragstart',e=>{if(e.target instanceof HTMLImageElement)e.preventDefault()});
document.addEventListener('selectstart',e=>{if(e.target.closest?.('.candidate-card,.battle-card,.position-member,.final-member,.hero-stack,.showcase'))e.preventDefault()});
document.addEventListener('pointerup',e=>{if(e.target.closest?.('.candidate-card,.battle-card,.position-member,.final-member,.hero-stack,.showcase'))window.getSelection?.()?.removeAllRanges()});
