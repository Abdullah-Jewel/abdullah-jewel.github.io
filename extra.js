(function(){
'use strict';
var $=function(s,c){return (c||document).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var coarse=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
var lowEnd=coarse&&((navigator.deviceMemory&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=4));
var TAU=Math.PI*2,root=document.documentElement;
function store(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){return null}}

/* ================= BOOT SEQUENCE + HERO REVEAL ================= */
var started=false;
function ready(){if(started)return;started=true;root.classList.add('ready');scramble()}
function boot(){
  if(reduce||store('amj_boot')){ready();return}
  var b=document.createElement('div');b.className='boot mono';b.setAttribute('aria-hidden','true');
  b.innerHTML='<div class="boot-box"><div id="bl"></div><div class="boot-bar"><i id="bb"></i></div><div class="boot-skip">TAP TO SKIP</div></div>';
  document.body.appendChild(b);
  var L=[['> AMJ-OS v1.0 booting…',''],['> probing ESP-32 ............','OK'],['> loading mathematics ......','OK'],['> calibrating curiosity .....','OK'],['> hello, world.','']],i=0,box=$('#bl',b),bar=$('#bb',b),done=false;
  function finish(){if(done)return;done=true;store('amj_boot','1');bar.style.width='100%';b.classList.add('out');setTimeout(function(){b.remove()},700);ready()}
  (function step(){if(done)return;if(i>=L.length){setTimeout(finish,320);return}
    var d=document.createElement('div');d.className='ln';d.innerHTML=L[i][0]+(L[i][1]?' <span class="ok">'+L[i][1]+'</span>':'');box.appendChild(d);i++;bar.style.width=(i/L.length*100)+'%';setTimeout(step,270)})();
  b.addEventListener('click',finish);addEventListener('keydown',finish,{once:true});
}
/* name decode */
function scramble(){
  var el=$('#name');if(!el||reduce)return;var txt=el.textContent,chars='01ABCDEFabcdef#<>/{}=+∑∫πΩ',spans=[];
  el.setAttribute('aria-label',txt);el.textContent='';
  txt.split('').forEach(function(c){var s=document.createElement('span');s.className='sc';s.textContent=c;s.setAttribute('aria-hidden','true');el.appendChild(s);spans.push(s)});
  requestAnimationFrame(function(){ // freeze widths so the layout never jumps
    spans.forEach(function(s){if(s.textContent===' ')return;s.style.width=s.getBoundingClientRect().width+'px'})
    var t0=performance.now(),dur=1500;
    (function tick(t){var p=(t-t0)/dur;
      spans.forEach(function(s,k){var lock=(k/spans.length)*.7+.15;
        if(p>=lock){if(!s.classList.contains('lock')){s.textContent=txt[k];s.classList.add('lock')}}
        else if(txt[k]!==' ')s.textContent=chars[(Math.random()*chars.length)|0]});
      if(p<1.05)requestAnimationFrame(tick);else el.textContent=txt})(t0)});
}
boot();

/* ================= LIVE CLOCK ================= */
(function(){var c=$('#clock');if(!c)return;var f;try{f=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Dhaka'})}catch(e){return}
  function t(){c.textContent='Hathazari, Chattogram · '+f.format(new Date())+' BST'}t();setInterval(t,20000)})();

/* ================= HERO PCB TRACES WITH CURRENT PULSES ================= */
(function(){
  var cv=$('#pcb');if(!cv)return;var cx=cv.getContext('2d'),off=document.createElement('canvas'),ox=off.getContext('2d'),W=0,H=0,tr=[],vis=true,run=false,last=0,hero=$('#hero');
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  var D=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
  function build(){
    var r=hero.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,lowEnd?1:1.5);W=r.width;H=r.height;
    cv.width=off.width=W*dpr;cv.height=off.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);ox.setTransform(dpr,0,0,dpr,0,0);
    var g=38,n=lowEnd?8:(W<700?10:20),R=rng(11),gx=Math.floor(W/g),gy=Math.floor(H/g);tr=[];
    for(var i=0;i<n;i++){
      var x=Math.floor(R()*gx)*g,y=Math.floor(R()*gy)*g,d=(R()*4|0)*2,pts=[[x,y]],ok=true;
      for(var s=0;s<7;s++){
        var len=(2+(R()*5|0))*g,v=D[d],L=v[0]&&v[1]?len*.7:len,nx=x+v[0]*L,ny=y+v[1]*L;
        if(nx<-20||ny<-20||nx>W+20||ny>H+20)break;x=nx;y=ny;pts.push([x,y]);
        d=(d+(R()<.5?1:-1)+8)%8; if(s%2===1)d=(d+(d%2?(R()<.5?1:-1):0)+8)%8;
      }
      if(pts.length<3)continue;
      var cum=[0],tot=0;for(var k=1;k<pts.length;k++){tot+=Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]);cum.push(tot)}
      tr.push({p:pts,c:cum,t:tot,o:R()*tot,sp:50+R()*90,col:R()<.28?'180,83,9':'29,78,216'});
    }
    ox.clearRect(0,0,W,H);ox.lineJoin='round';
    tr.forEach(function(t){
      ox.strokeStyle='rgba(29,78,216,.16)';ox.lineWidth=1.6;ox.beginPath();t.p.forEach(function(q,k){k?ox.lineTo(q[0],q[1]):ox.moveTo(q[0],q[1])});ox.stroke();
      [t.p[0],t.p[t.p.length-1]].forEach(function(q){ox.fillStyle='#fff';ox.strokeStyle='rgba(29,78,216,.4)';ox.lineWidth=1.4;ox.beginPath();ox.arc(q[0],q[1],4.5,0,TAU);ox.fill();ox.stroke();ox.beginPath();ox.arc(q[0],q[1],1.4,0,TAU);ox.fillStyle='rgba(29,78,216,.55)';ox.fill()})});
  }
  function at(t,d){d=((d%t.t)+t.t)%t.t;var k=1;while(k<t.c.length-1&&t.c[k]<d)k++;var a=t.p[k-1],b=t.p[k],u=(d-t.c[k-1])/(t.c[k]-t.c[k-1]||1);return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}
  function frame(ts){
    if(!vis||document.hidden){run=false;return}requestAnimationFrame(frame);
    if(ts-last<(coarse?33:16))return;var dt=Math.min((ts-last)/1000,.1);last=ts;
    cx.clearRect(0,0,W,H);cx.drawImage(off,0,0,W,H);
    tr.forEach(function(t){t.o+=t.sp*dt;var tail=70,N=9;
      for(var k=0;k<N;k++){var a=at(t,t.o-tail+tail*k/N),b=at(t,t.o-tail+tail*(k+1)/N);
        cx.strokeStyle='rgba('+t.col+','+((k+1)/N*.8)+')';cx.lineWidth=1+k/N*1.6;cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke()}
      var h=at(t,t.o);cx.fillStyle='rgba('+t.col+',1)';if(!coarse){cx.shadowColor='rgb('+t.col+')';cx.shadowBlur=8}cx.beginPath();cx.arc(h[0],h[1],2.8,0,TAU);cx.fill();cx.shadowBlur=0})}
  function start(){if(!run&&vis&&!reduce){run=true;requestAnimationFrame(frame)}}
  build();if(reduce){cx.drawImage(off,0,0,W,H)}else start();
  var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){build();if(reduce)cx.drawImage(off,0,0,W,H)},200)});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)start()});
  if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis)start()},{threshold:0}).observe(hero);
})();

/* ================= STORY TIMELINE (scroll-energised circuit) ================= */
(function(){
  var tl=$('#tl');if(!tl)return;var nodes=$$('.tl-node',tl),fill=$('#tlFill'),tick=false;
  function upd(){tick=false;var r=tl.getBoundingClientRect(),vh=innerHeight,anchor=vh*.55,p=(anchor-r.top)/r.height;p=Math.max(0,Math.min(1,p));
    tl.style.setProperty('--p',p.toFixed(4));tl.classList.toggle('on',p>0&&p<1);
    var tipY=r.top+p*r.height;
    nodes.forEach(function(n){var nr=n.getBoundingClientRect();n.classList.toggle('lit',nr.top+nr.height/2<=tipY+4&&p>0)})}
  function q(){if(!tick){tick=true;requestAnimationFrame(upd)}}
  addEventListener('scroll',q,{passive:true});addEventListener('resize',q);upd();
  if(reduce)nodes.forEach(function(n){n.classList.add('lit')});
})();

/* ================= QUOTES ================= */
(function(){
  var stage=$('#qstage');if(!stage)return;
  var Q=[
   ['The impediment to action advances action. What stands in the way becomes the way.','Marcus Aurelius','Meditations · Rome, c. 170 CE'],
   ['He who has a why to live can bear almost any how.','Friedrich Nietzsche','Twilight of the Idols · Germany, 1889'],
   ['The unexamined life is not worth living.','Socrates','As recorded by Plato in the Apology · Athens, 399 BCE'],
   ['Those who cannot remember the past are condemned to repeat it.','George Santayana','The Life of Reason · 1905'],
   ['Faith is the bird that feels the light and sings when the dawn is still dark.','Rabindranath Tagore','Stray Birds · 1916'],
   ['The important thing is not to stop questioning. Curiosity has its own reason for existing.','Albert Einstein','LIFE magazine interview · 1955'],
   ['We are a way for the cosmos to know itself.','Carl Sagan','Cosmos · 1980'],
   ['It is not that we have a short time to live, but that we waste a lot of it.','Seneca','On the Shortness of Life · Rome, c. 49 CE'],
   ['Indeed, with hardship comes ease.','The Qur\u2019an','Surah Ash-Sharh 94:5\u20136'],
   ['We must have perseverance and above all confidence in ourselves. We must believe that we are gifted for something, and that this thing must be attained.','Marie Curie','As recalled in Madame Curie by Eve Curie \u00b7 1937'],
   ['\u09ac\u09b2 \u09ac\u09c0\u09b0 \u2014 \u09ac\u09b2 \u0989\u09a8\u09cd\u09a8\u09a4 \u09ae\u09ae \u09b6\u09bf\u09b0!','Kazi Nazrul Islam','\u201cSay, hero, say: my head is held high!\u201d \u00b7 Bidrohi (The Rebel), 1922','bn'],
   ['Genius is one percent inspiration and ninety-nine percent perspiration.','Thomas Edison','Harper\u2019s Monthly \u00b7 1932'],
   ['Dream, dream, dream. Dreams transform into thoughts, and thoughts result in action.','A. P. J. Abdul Kalam','Indian scientist and President \u00b7 from his speeches']
  ],dots=$('#qdots'),bar=$('#qbar'),els=[],ds=[],cur=0,timer=null,DUR=9000,t0=0,raf=0,vis=false;
  Q.forEach(function(q,i){
    var d=document.createElement('div');d.className='q'+(q[3]==='bn'?' bn':'');if(q[3]==='bn')d.setAttribute('lang','bn');
    var p=document.createElement('p');q[0].split(' ').forEach(function(w,k){var s=document.createElement('span');s.className='w';s.style.setProperty('--i',k);s.textContent=w;p.appendChild(s);p.appendChild(document.createTextNode(' '))});
    var c=document.createElement('cite');c.innerHTML='— '+q[1]+'<span>'+q[2]+'</span>';d.appendChild(p);d.appendChild(c);stage.appendChild(d);els.push(d);
    var dot=document.createElement('i');dot.addEventListener('click',function(){go(i,true)});dots.appendChild(dot);ds.push(dot)});
  function go(n,manual){els[cur].classList.remove('on');ds[cur].classList.remove('on');cur=(n+Q.length)%Q.length;els[cur].classList.add('on');ds[cur].classList.add('on');t0=performance.now()}
  function loop(t){if(!vis||document.hidden){raf=0;return}raf=requestAnimationFrame(loop);var p=(t-t0)/DUR;bar.style.transform='scaleX('+Math.min(p,1)+')';if(p>=1)go(cur+1)}
  $('#qprev').addEventListener('click',function(){go(cur-1)});$('#qnext').addEventListener('click',function(){go(cur+1)});
  go(0);
  var tall=0;els.forEach(function(e){e.classList.add('on');tall=Math.max(tall,e.offsetHeight);e.classList.remove('on')});els[0].classList.add('on');stage.style.minHeight=tall+'px';
  addEventListener('resize',function(){tall=0;els.forEach(function(e){var w=e.classList.contains('on');e.classList.add('on');e.style.position='relative';tall=Math.max(tall,e.offsetHeight);e.style.position='';if(!w)e.classList.remove('on')});stage.style.minHeight=tall+'px'});
  if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis&&!raf&&!reduce){t0=performance.now();raf=requestAnimationFrame(loop)}},{threshold:.25}).observe($('#qwrap'));
})();

/* ================= FULL-STORY READER ================= */
(function(){
  var rd=$('#reader');if(!rd)return;var sc=$('#rdScroll'),prog=$('#rdProg'),openBtn=$('#openReader'),x=$('#rdClose'),isOpen=false,io=null,last=null;
  function lang(l){rd.dataset.lang=l;$$('.lang-sw button',rd).forEach(function(b){b.classList.toggle('on',b.dataset.l===l)});try{localStorage.setItem('amj_lang',l)}catch(e){}
    sc.scrollTo({top:0,behavior:'auto'});observe()}
  function observe(){if(io)io.disconnect();var items=$$('.lang:not([hidden]) .ch, .lang.bn p',rd).filter(function(n){return n.offsetParent!==null});
    if(!('IntersectionObserver' in window)){items.forEach(function(n){n.classList.add('in')});return}
    io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{root:sc,threshold:.12,rootMargin:'0px 0px -6% 0px'});items.forEach(function(n){io.observe(n)})}
  function open(e){
    last=document.activeElement;var r=openBtn.getBoundingClientRect();
    rd.style.setProperty('--ox',(e&&e.clientX?e.clientX:r.left+r.width/2)+'px');rd.style.setProperty('--oy',(e&&e.clientY?e.clientY:r.top+r.height/2)+'px');
    rd.hidden=false;rd.classList.remove('closing');void rd.offsetWidth;rd.classList.add('open');document.body.style.overflow='hidden';isOpen=true;
    try{var sl=localStorage.getItem('amj_lang');if(sl==='bn'||sl==='en')rd.dataset.lang=sl}catch(_){}
    $$('.lang-sw button',rd).forEach(function(b){b.classList.toggle('on',b.dataset.l===rd.dataset.lang)});
    sc.scrollTop=0;prog.style.transform='scaleX(0)';observe();history.pushState({reader:1},'');setTimeout(function(){x.focus({preventScroll:true})},700)}
  function close(fromPop){if(!isOpen)return;isOpen=false;rd.classList.remove('open');rd.classList.add('closing');document.body.style.overflow='';
    setTimeout(function(){rd.hidden=true;rd.classList.remove('closing');if(last&&last.focus)last.focus({preventScroll:true})},480);
    if(!fromPop&&history.state&&history.state.reader)history.back()}
  openBtn.addEventListener('click',open);x.addEventListener('click',function(){close(false)});
  addEventListener('popstate',function(){if(isOpen)close(true)});
  addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close(false)});
  $$('.lang-sw button',rd).forEach(function(b){b.addEventListener('click',function(){lang(b.dataset.l)})});
  var tk=false;sc.addEventListener('scroll',function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;var m=sc.scrollHeight-sc.clientHeight;prog.style.transform='scaleX('+(m>0?sc.scrollTop/m:0)+')'})},{passive:true});
  $$('a[href="#story"]').forEach(function(a){a.addEventListener('click',function(){})});
})();

/* ================= OHM'S LAW LIVE CIRCUIT ================= */
(function(){
  var svg=$('#ccSvg');if(!svg)return;var path=$('#ccPath'),g=$('#ccDots'),lamp=$('#ccLamp'),tR=$('#ccR'),tI=$('#ccI'),tP=$('#ccP'),ns='http://www.w3.org/2000/svg';
  var L=path.getTotalLength(),N=20,dots=[],Rs=[12,6,24,8,16],ri=0,R=12,Rt=12,V=12,vis=true,last=0,acc=0,run=false;
  for(var i=0;i<N;i++){var c=document.createElementNS(ns,'circle');c.setAttribute('r','3.4');c.setAttribute('fill','#1d4ed8');g.appendChild(c);dots.push({e:c,d:i/N*L})}
  function place(){dots.forEach(function(o){var p=path.getPointAtLength(((o.d%L)+L)%L);o.e.setAttribute('cx',p.x.toFixed(1));o.e.setAttribute('cy',p.y.toFixed(1))})}
  function text(){var I=V/R;tR.textContent='R = '+Math.round(R)+' Ω';tI.textContent=I.toFixed(2)+' A';tP.textContent=(V*I).toFixed(0)+' W';lamp.setAttribute('fill','rgba(255,190,40,'+Math.min(.85,I/3.2).toFixed(2)+')')}
  place();text();if(reduce)return;
  setInterval(function(){ri=(ri+1)%Rs.length;Rt=Rs[ri]},3200);
  function frame(ts){if(!vis||document.hidden){run=false;return}requestAnimationFrame(frame);
    var dt=Math.min((ts-last)/1000,.1);last=ts;R+=(Rt-R)*Math.min(dt*2.2,1);
    var sp=(V/R)*34;dots.forEach(function(o){o.d+=sp*dt});place();acc+=dt;if(acc>.1){acc=0;text()}}
  function go(){if(!run&&vis){run=true;last=performance.now();requestAnimationFrame(frame)}}
  go();document.addEventListener('visibilitychange',function(){if(!document.hidden)go()});
  if('IntersectionObserver' in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting;if(vis)go()},{threshold:0}).observe(svg);
})();
})();

/* ---------- Idea Lab tabs ---------- */
(function(){
var tabs=[].slice.call(document.querySelectorAll('#lab [role=tab]'));if(!tabs.length)return;
function sel(t,f){tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;var p=document.getElementById(x.getAttribute('aria-controls'));if(p)p.hidden=!on});if(f)t.focus();t.scrollIntoView&&t.scrollIntoView({block:'nearest',inline:'center'})}
tabs.forEach(function(t,i){t.addEventListener('click',function(){sel(t)});t.addEventListener('keydown',function(e){var k=e.key,n=null;if(k==='ArrowRight')n=tabs[(i+1)%tabs.length];if(k==='ArrowLeft')n=tabs[(i-1+tabs.length)%tabs.length];if(n){e.preventDefault();sel(n,true)}})});
})();
