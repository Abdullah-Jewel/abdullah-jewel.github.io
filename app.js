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

})();
