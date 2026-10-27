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
function show(n){cur=(n+items.length)%items.length;var it=items[cur];lbi.classList.remove('zoomed');lb.classList.remove('zm');lbi.src=it.dataset.full;lbi.alt=it.dataset.cap||'';lbc.textContent=it.dataset.cap||'';lb.hidden=false;document.body.style.overflow='hidden'}
function hide(){lb.hidden=true;lbi.removeAttribute('src');document.body.style.overflow=''}
items.forEach(function(it,k){it.addEventListener('click',function(){show(k)})});
$('.lb-x').addEventListener('click',hide);$('.lb-p').addEventListener('click',function(){show(cur-1)});$('.lb-nx').addEventListener('click',function(){show(cur+1)});
lb.addEventListener('click',function(e){if(e.target===lb)hide()});
lbi.addEventListener('click',function(e){e.stopPropagation();var z=lbi.classList.toggle('zoomed');lb.classList.toggle('zm',z)});
addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')hide();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
lb.addEventListener('touchstart',function(e){lsx=e.touches[0].clientX},{passive:true});
lb.addEventListener('touchend',function(e){if(lsx===null)return;var dx=e.changedTouches[0].clientX-lsx;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));lsx=null},{passive:true});
history.scrollRestoration&&(history.scrollRestoration='manual');
addEventListener('popstate',function(){if(!lb.hidden)hide()});

/* ---------- BACKGROUND: DOM floaters (no canvas, so nothing can smear) ---------- */
(function(){
var host=$('#bg');if(!host)return;
var EQ=['V = IR','\u2207\u00b7E = \u03c1/\u03b5\u2080','\u2207\u00d7E = \u2212\u2202B/\u2202t','\u2207\u00b7B = 0','\u03a3I = 0  (KCL)','\u03a3V = 0  (KVL)','Z = R + j\u03c9L','P = VI cos \u03c6','f\u2080 = 1/(2\u03c0\u221aLC)','\u03c4 = RC','v = L di/dt','i = C dv/dt','E = \u00bdCV\u00b2','F = q(E + v\u00d7B)','Y = A\u00b7B + C'];
var SYM={res:'M2 12h8l2-7 4 14 4-14 4 14 2-7h8',cap:'M2 12h14M16 3v18M24 3v18M24 12h14',ind:'M2 12h6a4 4 0 0 1 8 0 4 4 0 0 1 8 0 4 4 0 0 1 8 0h6',dio:'M2 12h12M14 4v16l12-8zM26 4v16M26 12h12',gnd:'M20 2v10M8 12h24M13 18h14M18 24h4',bat:'M2 12h14M16 3v18M23 7v10M23 12h15'};
var keys=Object.keys(SYM);
var n=window.innerWidth<700?9:15,ns=window.innerWidth<700?4:7,frag=document.createDocumentFragment();
function r(a,b){return a+Math.random()*(b-a)}
for(var i=0;i<n;i++){var e=document.createElement('span');e.className='fl';e.textContent=EQ[i%EQ.length];
 e.style.cssText='left:'+r(2,88).toFixed(1)+'%;font-size:'+r(12,18).toFixed(0)+'px;animation-duration:'+r(38,70).toFixed(0)+'s;animation-delay:-'+r(0,70).toFixed(0)+'s;--o:'+r(.12,.2).toFixed(2);frag.appendChild(e)}
for(var j=0;j<ns;j++){var d=document.createElement('span');d.className='fl fs';
 d.innerHTML='<svg viewBox="0 0 40 24" width="'+r(44,70).toFixed(0)+'" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="'+SYM[keys[j%keys.length]]+'"/></svg>';
 d.style.cssText='left:'+r(2,90).toFixed(1)+'%;animation-duration:'+r(45,80).toFixed(0)+'s;animation-delay:-'+r(0,80).toFixed(0)+'s;--o:'+r(.14,.22).toFixed(2);frag.appendChild(d)}
host.appendChild(frag);
})();
})();
