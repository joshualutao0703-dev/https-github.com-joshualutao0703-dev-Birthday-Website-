(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* floating hearts */
  var box = document.getElementById('hearts');
  if(!reduce){
    for(var i=0;i<14;i++){
      var s=document.createElement('span');
      s.textContent = i%3===0 ? '✦' : '♥';
      s.style.left = (Math.random()*100)+'%';
      s.style.fontSize = (14+Math.random()*22)+'px';
      s.style.animationDuration = (14+Math.random()*16)+'s';
      s.style.animationDelay = (-Math.random()*20)+'s';
      box.appendChild(s);
    }
  }

  /* confetti */
  var cv=document.getElementById('confetti'), ctx=cv.getContext('2d'), bits=[], running=false;
  function size(){cv.width=innerWidth;cv.height=innerHeight}
  size(); addEventListener('resize',size);
  var colors=['#6DB6F2','#2878D0','#FFD84D','#7FD6FF','#C9A7FF','#fff','#9FCBFA'];
  function burst(){
    if(reduce) return;
    for(var i=0;i<140;i++){
      bits.push({x:innerWidth/2,y:innerHeight*0.35,vx:(Math.random()-.5)*14,vy:-Math.random()*13-3,
        r:Math.random()*6+3,c:colors[(Math.random()*colors.length)|0],rot:Math.random()*6,vr:(Math.random()-.5)*.4,
        heart:Math.random()<.3});
    }
    if(!running){running=true;requestAnimationFrame(tick)}
  }
  function tick(){
    ctx.clearRect(0,0,cv.width,cv.height);
    bits.forEach(function(b){
      b.vy+=.28;b.x+=b.vx;b.y+=b.vy;b.vx*=.99;b.rot+=b.vr;
      ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);ctx.fillStyle=b.c;
      if(b.heart){ctx.font=(b.r*3)+'px sans-serif';ctx.textAlign='center';ctx.fillText('♥',0,0)}
      else ctx.fillRect(-b.r,-b.r/2,b.r*2,b.r);
      ctx.restore();
    });
    bits=bits.filter(function(b){return b.y<cv.height+30});
    if(bits.length) requestAnimationFrame(tick); else {running=false;ctx.clearRect(0,0,cv.width,cv.height)}
  }

  /* candles */
  var flames=[].slice.call(document.querySelectorAll('.flame'));
  var smoke=document.getElementById('smoke'), letter=document.getElementById('letter');
  var blow=document.getElementById('blow'), relight=document.getElementById('relight'), hint=document.getElementById('hint');

  function check(){
    var allOut = flames.every(function(f){return f.classList.contains('out')});
    if(allOut){
      /* show the message first so nothing else can ever stop it from appearing */
      letter.classList.add('show');
      blow.hidden=true; relight.hidden=false;
      hint.textContent='Your wish is on its way. Happy birthday! 🎂';
      smoke.classList.add('on');
      setTimeout(function(){smoke.classList.remove('on')},1400);
      setTimeout(function(){letter.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})},900);
      try{ burst(); }catch(e){}
      try{ playSong(); }catch(e){}
    }
  }
  flames.forEach(function(f){
    function out(){f.classList.add('out');check()}
    f.addEventListener('click',out);
    f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();out()}});
  });
  blow.addEventListener('click',function(){
    flames.forEach(function(f,i){setTimeout(function(){f.classList.add('out');if(i===flames.length-1)check()},i*180)});
  });
  relight.addEventListener('click',function(){
    flames.forEach(function(f){f.classList.remove('out')});
    letter.classList.remove('show');
    relight.hidden=true; blow.hidden=false;
    hint.textContent='Make another wish, then blow them out again.';
  });

  /* wish jar */
  var wishes=[
    'May your year be full of snacks, naps, and good news.',
    'What If mahal ka nya, pero naunahan ka lang ng iba.',
    'What If pampalipas oras ka lang sa kanya, pero hindi ka niya mahal.',
    'What If May nararamdam din siya para sayo, pero mas pinili niyang tiisin ka kaysa bumalik sayo.',
    'What If hindi naman talaga sya nag bago, sadyang hindi ka lang talaga niya mahal.',
    'What If hindi ka nag kulang, sadyang hindi lang talaga ikaw ang gustong makasama habang buhay.',
    'What If ang pinag darasal mo, sa iba napunta.',
    'What If sa tuwing sinasabi mo na okay kana, ang totoo napapagod ka lang umiyak para sa taong hindi na babalik.',
    'What If nakita nyo ang mga sarili masaya na sa iba .',
    'What If Bumalik Ulit Siya Sayo, kasi napagtanto nya na ikaw lang talaga ang gusto nya, pero huli na kasi may iba ka ng kasama.'
  ];
  var wishEl=document.getElementById('wish'), last=-1;
  document.getElementById('pick').addEventListener('click',function(){
    var n; do{n=(Math.random()*wishes.length)|0}while(n===last);
    last=n; wishEl.textContent=wishes[n];
    wishEl.classList.remove('swap'); void wishEl.offsetWidth; wishEl.classList.add('swap');
  });

  /* birthday song: melody synthesized with Web Audio, so no audio file is needed */
  var songBtn=document.getElementById('song'), actx=null, songTimer=null, playing=false;
  var N={G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99};
  var tune=[
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['C5',1],['B4',2.5],
    ['G4',.75],['G4',.25],['A4',1],['G4',1],['D5',1],['C5',2.5],
    ['G4',.75],['G4',.25],['G5',1],['E5',1],['C5',1],['B4',1],['A4',2.5],
    ['F5',.75],['F5',.25],['E5',1],['C5',1],['D5',1],['C5',3]
  ];
  function tone(freq,t,dur){
    var o=actx.createOscillator(), o2=actx.createOscillator(), g=actx.createGain(), g2=actx.createGain();
    o.type='sine'; o2.type='triangle';
    o.frequency.value=freq; o2.frequency.value=freq*2; g2.gain.value=.25;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(.22,t+.02);
    g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(actx.destination);
    o.start(t); o2.start(t); o.stop(t+dur+.05); o2.stop(t+dur+.05);
  }
  function setSongBtn(on){
    if(!songBtn) return;
    songBtn.textContent = on ? '\u23F9 Stop song' : '\uD83C\uDFB5 Play birthday song';
    songBtn.setAttribute('aria-pressed', on);
  }
  function stopSong(){
    clearTimeout(songTimer);
    if(actx){actx.close();actx=null}
    playing=false; setSongBtn(false);
  }
  function playSong(){
    if(playing) return;
    var AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    actx=new AC(); playing=true; setSongBtn(true);
    var t=actx.currentTime+.1, beat=.5;
    tune.forEach(function(n){ tone(N[n[0]],t,n[1]*beat*1.15); t+=n[1]*beat; });
    songTimer=setTimeout(stopSong,(t-actx.currentTime)*1000+500);
  }
  if(songBtn) songBtn.addEventListener('click',function(){ playing ? stopSong() : playSong(); });

  /* photo booth: camera (or uploaded photos) -> 4-photo strip you can download */
  if(document.getElementById('boothStrip')){
    var $=function(id){return document.getElementById(id)};
    var cam=$('boothCam'), vid=$('boothVideo'), count=$('boothCount'), flash=$('boothFlash'), status=$('boothStatus');
    var startBtn=$('camStart'), snapBtn=$('camSnap'), upBtn=$('boothUploadBtn'), upIn=$('boothUpload');
    var result=$('boothResult'), strip=$('boothStrip'), dl=$('stripDl'), retake=$('stripRetake');
    var stream=null, shots=[];
    var say=function(m){status.textContent=m};
    var wait=function(ms){return new Promise(function(r){setTimeout(r,ms)})};

    async function startCam(){
      if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
        say('The camera is not available here. Try “Upload photos” instead.'); return;
      }
      try{
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:1280},height:{ideal:960}},audio:false});
        vid.srcObject=stream;
        try{await vid.play()}catch(e){}
        cam.hidden=false; startBtn.hidden=true; snapBtn.hidden=false; result.hidden=true;
        say('Get ready and strike a pose!');
      }catch(e){
        say('Could not open the camera. Please allow camera access, or use “Upload photos”.');
      }
    }
    function stopCam(){
      if(stream){stream.getTracks().forEach(function(t){t.stop()});stream=null}
      vid.srcObject=null; cam.hidden=true; snapBtn.hidden=true; startBtn.hidden=false;
    }
    function grab(src,w,h,mirror){           /* center-crop to 4:3 */
      var c=document.createElement('canvas'); c.width=800; c.height=600;
      var x=c.getContext('2d'), s=Math.max(800/w,600/h), dw=w*s, dh=h*s;
      if(mirror){x.translate(800,0);x.scale(-1,1)}
      x.drawImage(src,(800-dw)/2,(600-dh)/2,dw,dh);
      return c;
    }
    async function snap(){
      snapBtn.disabled=true; shots=[];
      for(var i=0;i<4;i++){
        say('Photo '+(i+1)+' of 4');
        for(var n=3;n>=1;n--){
          count.textContent=n; count.classList.remove('tick'); void count.offsetWidth; count.classList.add('tick');
          await wait(900);
        }
        count.textContent='';
        if(!reduce){flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go')}
        shots.push(grab(vid,vid.videoWidth||640,vid.videoHeight||480,true));
        await wait(500);
      }
      stopCam(); snapBtn.disabled=false; buildStrip();
    }
    function rr(x,a,b,w,h,r){x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()}
    function buildStrip(){
      var W=560,P=34,pw=W-2*P,ph=Math.round(pw*0.75),gap=18,top=120,bottom=130,H=top+4*ph+3*gap+bottom;
      strip.width=W; strip.height=H;
      var x=strip.getContext('2d'), g=x.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#9FCBFA'); g.addColorStop(1,'#6DB6F2');
      x.fillStyle=g; x.fillRect(0,0,W,H);
      x.fillStyle='rgba(255,255,255,.25)';
      for(var i=0;i<40;i++){x.beginPath();x.arc((i*97)%W,(i*181)%H,6+(i%3)*3,0,7);x.fill()}
      x.textAlign='center'; x.fillStyle='#fff';
      x.font='700 42px Fredoka, "Trebuchet MS", sans-serif'; x.fillText('Happy Birthday!',W/2,66);
      x.font='500 26px Fredoka, "Trebuchet MS", sans-serif'; x.fillText('Birthday Star \u2665',W/2,102);
      shots.forEach(function(c,k){
        var y=top+k*(ph+gap);
        x.fillStyle='#fff'; rr(x,P-8,y-8,pw+16,ph+16,20); x.fill();
        x.save(); rr(x,P,y,pw,ph,14); x.clip(); x.drawImage(c,P,y,pw,ph); x.restore();
      });
      var fy=top+4*ph+3*gap+52;
      x.fillStyle='#fff'; x.font='500 24px Fredoka, "Trebuchet MS", sans-serif';
      x.fillText(new Date().toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}),W/2,fy);
      x.font='500 22px Fredoka, "Trebuchet MS", sans-serif'; x.fillText('from Someone special \u2665',W/2,fy+36);
      x.font='700 30px sans-serif'; x.fillText('\u2665',34,50); x.fillText('\u2665',W-34,50); x.fillText('\u2726',34,H-30); x.fillText('\u2726',W-34,H-30);
      result.hidden=false; say('Your photo strip is ready! \uD83C\uDF80');
      setTimeout(function(){result.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'})},200);
    }
    function loadImg(file){
      return new Promise(function(res,rej){
        var img=new Image();
        img.onload=function(){URL.revokeObjectURL(img.src);res(img)};
        img.onerror=rej; img.src=URL.createObjectURL(file);
      });
    }
    startBtn.addEventListener('click',startCam);
    snapBtn.addEventListener('click',snap);
    upBtn.addEventListener('click',function(){upIn.click()});
    upIn.addEventListener('change',async function(){
      var files=[].slice.call(upIn.files).slice(0,4);
      if(!files.length) return;
      try{
        stopCam(); shots=[];
        for(var i=0;i<files.length;i++){var im=await loadImg(files[i]); shots.push(grab(im,im.width,im.height,false))}
        while(shots.length<4) shots.push(shots[shots.length%files.length]);
        buildStrip();
      }catch(e){ say('Sorry, one of those photos could not be opened. Try JPG or PNG files.') }
      upIn.value='';
    });
    dl.addEventListener('click',function(){
      strip.toBlob(function(b){
        var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='birthday-photo-strip.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){URL.revokeObjectURL(a.href)},1000);
      },'image/png');
    });
    retake.addEventListener('click',function(){result.hidden=true; startCam()});
  }

  /* birthday memories: tap the film strip to enlarge it; cute placeholders if photo1-3.jpg are missing */
  var filmStrip=document.getElementById('photobooth-strip');
  if(filmStrip){
    var toggleStrip=function(){filmStrip.classList.toggle('enlarged')};
    filmStrip.addEventListener('click',toggleStrip);
    filmStrip.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleStrip()}});
    var filmEmojis=['\uD83C\uDF82','\uD83C\uDF88','\uD83C\uDF81'];
    [].slice.call(filmStrip.querySelectorAll('.film-img')).forEach(function(img,i){
      var fallback=function(){
        if(img.getAttribute('data-fb')) return;
        img.setAttribute('data-fb','1');
        var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#CFE6FF"/><circle cx="20" cy="22" r="6" fill="#fff" opacity=".7"/><circle cx="82" cy="78" r="9" fill="#fff" opacity=".6"/><text x="50" y="66" font-size="46" text-anchor="middle">'+filmEmojis[i%3]+'</text></svg>';
        img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
      };
      img.addEventListener('error',fallback);
      if(img.complete && img.naturalWidth===0) fallback();
    });
  }

})();
