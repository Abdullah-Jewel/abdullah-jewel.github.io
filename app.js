(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
var lowEnd=coarse&&((navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4));
var TAU=Math.PI*2;
$('#yr').textContent=new Date().getFullYear();

/* ---------- NAV ---------- */
var nav=$('#nav'),burger=$('#burger'),menu=$('#menu'),prog=$('#progress');
burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''});
$$('#menu a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('open');burger.setAttribute('aria-expanded',false);document.body.style.overflow=''})});
var secs=$$('main section[id]'),links=$$('#menu a'),sy=0,ticking=false;
function onScroll(){
  sy=window.scrollY||0;
  if(!ticking){ticking=true;requestAnimationFrame(function(){
    nav.classList.toggle('stuck',sy>20);
    var h=document.documentElement.scrollHeight-innerHeight;
    prog.style.transform='scaleX('+(h>0?sy/h:0)+')';
    var cur='';secs.forEach(function(s){if(s.getBoundingClientRect().top<innerHeight*.4)cur=s.id});
    links.forEach(function(a){a.classList.toggle('act',a.getAttribute('href')==='#'+cur)});
    ticking=false})}
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- REVEAL + COUNTERS ---------- */
var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);$$('[data-count]',e.target).forEach(count)}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'}):null;
$$('.reveal').forEach(function(el,i){if(io)io.observe(el);else el.classList.add('in')});
function count(el){var n=+el.dataset.count,t0=null;if(reduce){el.textContent=n;return}
  (function step(t){if(!t0)t0=t;var p=Math.min((t-t0)/1200,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)})(performance.now())}
$$('[data-count]').forEach(function(el){if(!io)el.textContent=el.dataset.count});

/* ---------- TYPED ROLES ---------- */
var roles=['EEE student at CUET','Embedded systems tinkerer','Builder of PlanCraft 3D','Lifelong learner of physics'],ri=0,ci=0,del=false,te=$('#typed');
if(reduce){te.textContent=roles[0]}else{(function tick(){var w=roles[ri];ci+=del?-1:1;te.textContent=w.slice(0,ci);var d=del?35:75;
  if(!del&&ci===w.length){del=true;d=1600}else if(del&&ci===0){del=false;ri=(ri+1)%roles.length;d=350}setTimeout(tick,d)})()}

/* ---------- POINTER GLOW + TILT (desktop only) ---------- */
if(!coarse){
  var glow=$('#glow');addEventListener('pointermove',function(e){glow.style.transform='translate3d('+(e.clientX-210)+'px,'+(e.clientY-210)+'px,0)'},{passive:true});
  $$('[data-tilt]').forEach(function(el){
    el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      el.style.transform='perspective(900px) rotateY('+(x*6)+'deg) rotateX('+(-y*6)+'deg)';el.style.transition='transform .08s'});
    el.addEventListener('pointerleave',function(){el.style.transform='';el.style.transition='transform .5s'})});
}

/* ---------- SLIDERS ---------- */
$$('.slider').forEach(function(s){
  var sl=$$('.slide',s),dots=$('.dots',s),i=0,timer,sx=null;
  sl.forEach(function(_,k){var d=document.createElement('i');if(!k)d.className='on';dots.appendChild(d)});
  var ds=$$('i',dots);
  function go(n){sl[i].classList.remove('on');ds[i].classList.remove('on');i=(n+sl.length)%sl.length;sl[i].classList.add('on');ds[i].classList.add('on')}
  function auto(){clearInterval(timer);if(!reduce)timer=setInterval(function(){go(i+1)},4200)}
  $('.prev',s).addEventListener('click',function(){go(i-1);auto()});
  $('.next',s).addEventListener('click',function(){go(i+1);auto()});
  s.addEventListener('touchstart',function(e){sx=e.touches[0].clientX},{passive:true});
  s.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40){go(i+(dx<0?1:-1));auto()}sx=null},{passive:true});
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){es[0].isIntersecting?auto():clearInterval(timer)},{threshold:.3}).observe(s)}
});

/* ---------- LIGHTBOX ---------- */
var lb=$('#lb'),lbi=$('#lb-img'),lbc=$('#lb-cap'),items=$$('[data-full]'),cur=0,lsx=null;
function show(n){cur=(n+items.length)%items.length;var it=items[cur];lbi.src=it.dataset.full;lbi.alt=it.dataset.cap||'';lbc.textContent=it.dataset.cap||'';lb.hidden=false;document.body.style.overflow='hidden'}
function hide(){lb.hidden=true;lbi.removeAttribute('src');document.body.style.overflow=''}
items.forEach(function(it,k){it.addEventListener('click',function(){show(k)})});
$('.lb-x').addEventListener('click',hide);$('.lb-p').addEventListener('click',function(){show(cur-1)});$('.lb-nx').addEventListener('click',function(){show(cur+1)});
lb.addEventListener('click',function(e){if(e.target===lb)hide()});
addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')hide();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
lb.addEventListener('touchstart',function(e){lsx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){if(lsx===null)return;var dx=e.changedTouches[0].clientX-lsx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));lsx=null},{passive:true});
history.scrollRestoration&&(history.scrollRestoration='manual');
addEventListener('popstate',function(){if(!lb.hidden)hide()});

/* ---------- BACKGROUND: three-phase waves + drifting equations ---------- */
var bg=$('#bg'),bx=bg.getContext('2d'),W=0,H=0,dpr=1,vis=true,last=0;
var eqs=['e^{iπ}+1=0','∇·E=ρ/ε₀','∇×B=μ₀J+μ₀ε₀∂E/∂t','iħ∂ψ/∂t=Ĥψ','V=IR','Z=R+jX','F(ω)=∫f(t)e^{−iωt}dt','E=mc²','ΔxΔp≥ħ/2','P=VI cosφ','sin²θ+cos²θ=1','Σ 1/n²=π²/6','ds²=−c²dt²+dx²','T=2π√(L/g)'];
var drift=eqs.map(function(t,i){return{t:t,x:Math.random(),y:Math.random(),s:.00002+Math.random()*.00004,a:.05+Math.random()*.08,sz:12+Math.random()*8}});
if(lowEnd)drift=drift.slice(0,6);
function size(){dpr=Math.min(window.devicePixelRatio||1,lowEnd?1:1.5);W=innerWidth;H=innerHeight;bg.width=W*dpr;bg.height=H*dpr;bx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener('resize',size);
document.addEventListener('visibilitychange',function(){vis=!document.hidden;if(vis)requestAnimationFrame(frame)});
var cols=['61,232,255','139,123,255','255,179,71'];
function waves(t){
  var step=coarse?12:6,par=sy*.12;
  for(var k=0;k<3;k++){
    var ph=k*TAU/3,base=H*(.5+.12*Math.sin(t*.00007+k))-par*(.3+k*.12);
    for(var layer=0;layer<2;layer++){
      bx.beginPath();
      for(var x=0;x<=W+step;x+=step){
        var u=x/W*TAU*(layer?1.6:1.1)+t*.0004*(layer?-1.3:1)+ph;
        var y=base+Math.sin(u)*(layer?38:70)+Math.sin(u*3)*(layer?6:12)/3;
        x===0?bx.moveTo(x,y):bx.lineTo(x,y)}
      bx.strokeStyle='rgba('+cols[k]+','+(layer?.07:.15)+')';bx.lineWidth=layer?1:1.6;bx.stroke();
    }
    // travelling charge dot on the main wave
    var px=((t*.00004+k/3)%1)*W,pu=px/W*TAU*1.1+t*.0004+ph,py=base+Math.sin(pu)*70+Math.sin(pu*3)*4;
    bx.beginPath();bx.arc(px,py,3,0,TAU);bx.fillStyle='rgba('+cols[k]+',.9)';bx.shadowColor='rgba('+cols[k]+',1)';bx.shadowBlur=12;bx.fill();bx.shadowBlur=0;
  }
}
function symbols(t){
  bx.textBaseline='middle';
  for(var i=0;i<drift.length;i++){var d=drift[i];d.x-=d.s;if(d.x<-.3)d.x=1.1;
    var y=(d.y*H+Math.sin(t*.0003+i)*14)-sy*.04*(1+i%3*.4);y=((y%H)+H)%H;
    bx.font=d.sz+'px JetBrains Mono, monospace';bx.fillStyle='rgba(160,200,255,'+d.a+')';bx.fillText(d.t,d.x*W,y)}
}
function frame(t){
  if(!vis)return;requestAnimationFrame(frame);
  if(t-last<(coarse?33:16))return;last=t;
  bx.clearRect(0,0,W,H);waves(t);symbols(t)}
if(reduce){waves(2000);symbols(0)}else requestAnimationFrame(frame);

/* ---------- HERO: Fourier epicycles drawing a square wave ---------- */
var running=false,ec=$('#epi'),ex=ec.getContext('2d'),EW=0,EH=0,trace=[],N=5,et=0,eVis=true,hEl=$('#harm'),nLast=0;
function esize(){var r=ec.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);EW=r.width;EH=r.height;ec.width=EW*d;ec.height=EH*d;ex.setTransform(d,0,0,d,0,0)}
esize();addEventListener('resize',esize);
if('IntersectionObserver' in window)new IntersectionObserver(function(es){var v=es[0].isIntersecting;var was=eVis;eVis=v;if(v&&!was&&!running)requestAnimationFrame(eframe)}).observe(ec);
function eframe(ts){
  if(!eVis){running=false;return}running=true;if(!reduce)requestAnimationFrame(eframe);
  et+=.028;
  if(ts-nLast>3500){nLast=ts;N=N>=9?1:N+2;hEl.textContent='n = '+N;trace.length=0}
  ex.clearRect(0,0,EW,EH);
  var cx=EH*.5,cy=EH/2,sc=EH*.30,x=cx,y=cy;
  // grid
  ex.strokeStyle='rgba(61,232,255,.07)';ex.lineWidth=1;ex.beginPath();
  for(var gx=0;gx<EW;gx+=24){ex.moveTo(gx,0);ex.lineTo(gx,EH)}for(var gy=0;gy<EH;gy+=24){ex.moveTo(0,gy);ex.lineTo(EW,gy)}ex.stroke();
  ex.strokeStyle='rgba(61,232,255,.25)';ex.beginPath();ex.moveTo(0,cy);ex.lineTo(EW,cy);ex.stroke();
  for(var k=1;k<=N;k+=2){
    var r=sc*4/(Math.PI*k),nx=x+r*Math.cos(k*et),ny=y-r*Math.sin(k*et);
    ex.strokeStyle='rgba(139,123,255,.55)';ex.lineWidth=1;ex.beginPath();ex.arc(x,y,r,0,TAU);ex.stroke();
    ex.strokeStyle='rgba(255,179,71,.9)';ex.beginPath();ex.moveTo(x,y);ex.lineTo(nx,ny);ex.stroke();
    x=nx;y=ny}
  trace.unshift(y);var maxL=Math.floor((EW-EH)/1.6);if(trace.length>maxL)trace.pop();
  var ox=EH*.5+sc*1.6+8;
  ex.strokeStyle='rgba(255,179,71,.5)';ex.beginPath();ex.moveTo(x,y);ex.lineTo(ox,y);ex.stroke();
  var gr=ex.createLinearGradient(ox,0,ox+maxL*1.6,0);gr.addColorStop(0,'#3de8ff');gr.addColorStop(1,'rgba(61,232,255,0)');ex.strokeStyle=gr;ex.lineWidth=2;ex.shadowColor='#3de8ff';ex.shadowBlur=8;ex.beginPath();
  for(var i=0;i<trace.length;i++){var px=ox+i*1.6;i?ex.lineTo(px,trace[i]):ex.moveTo(px,trace[i])}ex.stroke();ex.shadowBlur=0;
  ex.fillStyle='#ffb347';ex.beginPath();ex.arc(x,y,3.2,0,TAU);ex.fill();
}
requestAnimationFrame(eframe);
})();
