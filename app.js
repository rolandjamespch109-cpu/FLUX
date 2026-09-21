let user = JSON.parse(localStorage.getItem("fluxUser") || "null");

let xp = Number(localStorage.getItem("fluxXP") || 0);

let records =
  JSON.parse(localStorage.getItem("fluxRecords") || "{}");

let reducedMotion =
  localStorage.getItem("fluxMotion") === "1";

let haptics =
  localStorage.getItem("fluxHaptic") !== "0";

let cleanup = null;


function save(){

  localStorage.setItem("fluxXP",xp);

  localStorage.setItem(
    "fluxRecords",
    JSON.stringify(records)
  );

  if(user){

    localStorage.setItem(
      "fluxUser",
      JSON.stringify(user)
    );

  }

}


function show(id){

  document.querySelectorAll(".screen")
    .forEach(screen=>{
      screen.classList.toggle(
        "active",
        screen.id === id
      );
    });

  updateUI();

}


function enterFlux(){

  show("hub");

}


function closeGame(){

  if(cleanup){

    cleanup();
    cleanup=null;

  }

  show("hub");

}


function vibrate(ms=10){

  if(haptics && navigator.vibrate){

    navigator.vibrate(ms);

  }

}


function toast(message){

  const t=document.getElementById("toast");

  t.textContent=message;

  t.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer=setTimeout(()=>{

    t.classList.remove("show");

  },1800);

}


function addXP(amount){

  const oldLevel=
    Math.floor(xp/100)+1;

  xp+=amount;

  const newLevel=
    Math.floor(xp/100)+1;

  save();

  updateUI();

  if(newLevel>oldLevel){

    toast("LEVEL UP · "+newLevel);

    vibrate(40);

  }

}


function updateUI(){

  const name=
    user?.display || "Flux Player";

  const username=
    user?.username || "player";

  const level=
    Math.floor(xp/100)+1;

  const current=
    xp%100;


  document.getElementById("welcome")
    .textContent=
    `Welcome, ${name}.`;

  document.getElementById("profileName")
    .textContent=name;

  document.getElementById("profileHandle")
    .textContent="@"+username;

  document.getElementById("avatar")
    .textContent=
    name.charAt(0).toUpperCase();


  document.getElementById("level")
    .textContent=level;

  document.getElementById("profileLevel")
    .textContent=level;

  document.getElementById("profileXP")
    .textContent=xp;

  document.getElementById("records")
    .textContent=
    Object.keys(records).length;


  document.getElementById("xpText")
    .textContent=
    `${current} / 100 XP`;

  document.getElementById("xpBar")
    .style.width=
    current+"%";


  document.getElementById("username")
    .value=
    user?.username || "";

  document.getElementById("displayName")
    .value=
    user?.display || "";


  document.getElementById("motion")
    .textContent=
    reducedMotion ? "ON" : "OFF";

  document.getElementById("motion")
    .classList.toggle(
      "on",
      reducedMotion
    );

  document.getElementById("haptic")
    .textContent=
    haptics ? "ON" : "OFF";

  document.getElementById("haptic")
    .classList.toggle(
      "on",
      haptics
    );

  document.body.classList.toggle(
    "reduced",
    reducedMotion
  );

}


function saveAccount(){

  const username=
    document.getElementById("username")
      .value
      .trim()
      .replace(/\s+/g,"")
      .toLowerCase();

  const display=
    document.getElementById("displayName")
      .value
      .trim();


  if(username.length<3){

    toast("Username needs 3+ characters.");

    return;

  }

  if(display.length<2){

    toast("Enter a display name.");

    return;

  }


  user={
    username,
    display
  };

  save();

  addXP(10);

  toast("PROFILE SAVED");

  show("profile");

}


function resetAccount(){

  user=null;

  localStorage.removeItem("fluxUser");

  toast("ACCOUNT RESET");

  updateUI();

}


function toggleMotion(){

  reducedMotion=!reducedMotion;

  localStorage.setItem(
    "fluxMotion",
    reducedMotion ? "1" : "0"
  );

  updateUI();

}


function toggleHaptic(){

  haptics=!haptics;

  localStorage.setItem(
    "fluxHaptic",
    haptics ? "1" : "0"
  );

  updateUI();

}


function openGame(type){

  if(cleanup){

    cleanup();
    cleanup=null;

  }

  show("game");

  const names={

    gravity:"GRAVITY PLAYGROUND",

    blob:"LIQUID BLOB",

    colour:"COLOUR LAB",

    spiral:"HYPNOTIC SPIRAL",

    reaction:"REACTION RUSH"

  };

  document.getElementById("gameName")
    .textContent=
    names[type] || "EXPERIENCE";


  if(type==="gravity")
    cleanup=gravity();

  if(type==="blob")
    cleanup=blob();

  if(type==="colour")
    cleanup=colour();

  if(type==="spiral")
    cleanup=spiral();

  if(type==="reaction")
    cleanup=reaction();

}


function gameShell(title,description){

  const area=
    document.getElementById("gameArea");

  area.innerHTML=`

    <div class="gamePage">

      <span class="eyebrow">
        FLUX EXPERIENCE
      </span>

      <h1>${title}</h1>

      <p>${description}</p>

      <div id="mount"></div>

    </div>

  `;

  return document.getElementById("mount");

}


/* GRAVITY */

function gravity(){

  const mount=
    gameShell(
      "Gravity Playground",
      "Move around the field and bend the particles."
    );


  mount.innerHTML=`

    <div class="canvasBox">

      <canvas id="gravityCanvas"></canvas>

      <div class="gameInfo">

        <span class="pill">
          ENERGY <b id="gravityScore">0</b>
        </span>

        <span class="pill">
          MOVE TO CONTROL
        </span>

      </div>

    </div>

  `;


  const canvas=
    document.getElementById(
      "gravityCanvas"
    );

  const ctx=
    canvas.getContext("2d");

  let W,H,dpr;

  let x=0,y=0;

  let score=0;

  let animation;


  const particles=
    Array.from(
      {length:30},
      ()=>({

        x:Math.random()*800,

        y:Math.random()*500,

        vx:(Math.random()-.5)*1.5,

        vy:(Math.random()-.5)*1.5,

        r:2+Math.random()*4

      })
    );


  function resize(){

    dpr=
      window.devicePixelRatio || 1;

    W=canvas.clientWidth;

    H=canvas.clientHeight;

    canvas.width=W*dpr;

    canvas.height=H*dpr;

    ctx.setTransform(
      dpr,0,0,dpr,0,0
    );

    if(!x){

      x=W/2;
      y=H/2;

    }

  }


  function move(e){

    const r=
      canvas.getBoundingClientRect();

    x=e.clientX-r.left;

    y=e.clientY-r.top;

  }


  canvas.addEventListener(
    "pointermove",
    move
  );


  canvas.addEventListener(
    "pointerdown",
    ()=>{

      score++;

      document.getElementById(
        "gravityScore"
      ).textContent=score;

      addXP(2);

      vibrate();

    }
  );


  function draw(){

    ctx.clearRect(0,0,W,H);


    particles.forEach(p=>{

      const dx=x-p.x;

      const dy=y-p.y;

      const distance=
        Math.max(
          35,
          Math.hypot(dx,dy)
        );

      const force=
        18/(distance*distance);


      p.vx+=dx*force;

      p.vy+=dy*force;

      p.vx*=.992;

      p.vy*=.992;

      p.x+=p.vx;

      p.y+=p.vy;


      if(p.x<-20)p.x=W+20;

      if(p.x>W+20)p.x=-20;

      if(p.y<-20)p.y=H+20;

      if(p.y>H+20)p.y=-20;


      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI*2
      );

      ctx.fillStyle=
        "rgba(120,225,255,.8)";

      ctx.fill();

    });


    ctx.beginPath();

    ctx.arc(
      x,
      y,
      25,
      0,
      Math.PI*2
    );

    ctx.strokeStyle=
      "rgba(140,110,255,.35)";

    ctx.stroke();


    animation=
      requestAnimationFrame(draw);

  }


  resize();

  window.addEventListener(
    "resize",
    resize
  );

  draw();


  return ()=>{

    cancelAnimationFrame(animation);

    window.removeEventListener(
      "resize",
      resize
    );

  };

}


/* LIQUID BLOB */

function blob(){

  const mount=
    gameShell(
      "Liquid Blob",
      "Drag the creature around. Pull harder to stretch it."
    );


  mount.innerHTML=`

    <div class="canvasBox">

      <canvas id="blobCanvas"></canvas>

      <div class="gameInfo">

        <span class="pill">
          ENERGY <b id="blobEnergy">0</b>
        </span>

        <span class="pill">
          DRAG ME
        </span>

      </div>

    </div>

  `;


  const canvas=
    document.getElementById(
      "blobCanvas"
    );

  const ctx=
    canvas.getContext("2d");

  let W,H,dpr;

  let x=0,y=0;

  let tx=0,ty=0;

  let dragging=false;

  let animation;


  function resize(){

    dpr=
      window.devicePixelRatio || 1;

    W=canvas.clientWidth;

    H=canvas.clientHeight;

    canvas.width=W*dpr;

    canvas.height=H*dpr;

    ctx.setTransform(
      dpr,0,0,dpr,0,0
    );

    if(!x){

      x=W/2;
      y=H/2;
      tx=x;
      ty=y;

    }

  }


  function position(e){

    const r=
      canvas.getBoundingClientRect();

    tx=e.clientX-r.left;

    ty=e.clientY-r.top;

  }


  canvas.addEventListener(
    "pointerdown",
    e=>{

      dragging=true;

      position(e);

      vibrate();

    }
  );


  canvas.addEventListener(
    "pointermove",
    e=>{

      if(dragging)
        position(e);

    }
  );


  canvas.addEventListener(
    "pointerup",
    ()=>dragging=false
  );


  canvas.addEventListener(
    "pointercancel",
    ()=>dragging=false
  );


  function draw(){

    x+=(tx-x)*.16;

    y+=(ty-y)*.16;


    const energy=
      Math.min(
        100,
        Math.hypot(tx-x,ty-y)*2
      );


    document.getElementById(
      "blobEnergy"
    ).textContent=
      Math.round(energy);


    ctx.clearRect(0,0,W,H);


    ctx.save();

    ctx.translate(x,y);


    const stretch=
      1+energy/180;


    ctx.scale(
      stretch,
      1-energy/300
    );


    const gradient=
      ctx.createRadialGradient(
        -30,-35,5,
        0,0,110
      );


    gradient.addColorStop(
      0,
      "#e1fbff"
    );

    gradient.addColorStop(
      .4,
      "#819dff"
    );

    gradient.addColorStop(
      1,
      "#7138ff"
    );


    ctx.fillStyle=gradient;

    ctx.beginPath();


    const time=
      Date.now()/500;


    for(let i=0;i<80;i++){

      const angle=
        i/80*Math.PI*2;

      const radius=
        78+
        Math.sin(angle*5+time)*7+
        Math.sin(angle*9-time)*4;


      ctx.lineTo(
        Math.cos(angle)*radius,
        Math.sin(angle)*radius
      );

    }


    ctx.closePath();

    ctx.fill();

    ctx.restore();


    animation=
      requestAnimationFrame(draw);

  }


  resize();

  window.addEventListener(
    "resize",
    resize
  );

  draw();


  return ()=>{

    cancelAnimationFrame(animation);

  };

}


/* COLOUR LAB */

function colour(){

  const mount=
    gameShell(
      "Colour Lab",
      "Build your own FLUX atmosphere."
    );


  mount.innerHTML=`

    <div id="colourPreview"
         class="colour"></div>

    <div class="sliders">

      <label>
        RED
        <input id="red"
               type="range"
               min="0"
               max="255"
               value="110">
      </label>

      <label>
        GREEN
        <input id="green"
               type="range"
               min="0"
               max="255"
               value="90">
      </label>

      <label>
        BLUE
        <input id="blue"
               type="range"
               min="0"
               max="255"
               value="255">
      </label>

    </div>

  `;


  function update(){

    const r=
      document.getElementById("red").value;

    const g=
      document.getElementById("green").value;

    const b=
      document.getElementById("blue").value;


    document.getElementById(
      "colourPreview"
    ).style.background=

      `radial-gradient(
        circle at 30% 30%,
        rgb(${r},${g},${b}),
        #050507 70%
      )`;

  }


  ["red","green","blue"]
    .forEach(id=>{

      document.getElementById(id)
        .addEventListener(
          "input",
          update
        );

    });


  update();

  return ()=>{};

}


/* SPIRAL */

function spiral(){

  const mount=
    gameShell(
      "Hypnotic Spiral",
      "Move around the field and bend the flow."
    );


  mount.innerHTML=`

    <div class="canvasBox">
      <canvas id="spiralCanvas"></canvas>
    </div>

  `;


  const canvas=
    document.getElementById(
      "spiralCanvas"
    );

  const ctx=
    canvas.getContext("2d");

  let W,H,dpr;

  let mx=0,my=0;

  let animation;


  function resize(){

    dpr=
      window.devicePixelRatio || 1;

    W=canvas.clientWidth;

    H=canvas.clientHeight;

    canvas.width=W*dpr;

    canvas.height=H*dpr;

    ctx.setTransform(
      dpr,0,0,dpr,0,0
    );

  }


  canvas.addEventListener(
    "pointermove",
    e=>{

      const r=
        canvas.getBoundingClientRect();

      mx=e.clientX-r.left;

      my=e.clientY-r.top;

    }
  );


  function draw(){

    ctx.fillStyle=
      "rgba(5,5,7,.22)";

    ctx.fillRect(
      0,0,W,H
    );


    const cx=
      W/2+
      (mx-W/2)*.12;

    const cy=
      H/2+
      (my-H/2)*.12;


    for(let i=0;i<150;i++){

      const angle=
        i*.23+
        Date.now()/4000;

      const radius=
        i*1.7;


      const px=
        cx+
        Math.cos(angle)*radius;

      const py=
        cy+
        Math.sin(angle)*radius;


      ctx.fillStyle=
        `hsla(
          ${220+i*.7},
          90%,
          70%,
          ${1-i/170}
        )`;


      ctx.fillRect(
        px,
        py,
        2,
        2
      );

    }


    animation=
      requestAnimationFrame(draw);

  }


  resize();

  window.addEventListener(
    "resize",
    resize
  );

  draw();


  return ()=>{

    cancelAnimationFrame(animation);

  };

}


/* REACTION RUSH */

function reaction(){

  const mount=
    gameShell(
      "Reaction Rush",
      "Wait for the signal. Tap as fast as possible."
    );


  mount.innerHTML=`

    <div class="reaction">

      <button id="reactionButton">
        WAIT
      </button>

    </div>

  `;


  const button=
    document.getElementById(
      "reactionButton"
    );


  let ready=false;

  let start=0;

  let timer;


  timer=setTimeout(()=>{

    ready=true;

    start=performance.now();

    button.textContent="TAP";

    button.style.background="#fff";

    button.style.color="#050507";

    vibrate(25);

  },1200+Math.random()*2500);


  function click(){

    if(!ready){

      clearTimeout(timer);

      toast("TOO EARLY");

      return;

    }


    const time=
      Math.round(
        performance.now()-start
      );


    button.textContent=
      time+" MS";


    button.style.background="";

    button.style.color="";


    if(
      !records.reaction ||
      time<records.reaction
    ){

      records.reaction=time;

      save();

    }


    addXP(
      Math.max(
        5,
        Math.round(100-time/10)
      )
    );


    toast(
      time+" MS · RECORD SAVED"
    );


    ready=false;

  }


  button.addEventListener(
    "click",
    click
  );


  return ()=>{

    clearTimeout(timer);

    button.removeEventListener(
      "click",
      click
    );

  };

}


/* SURPRISE */

function surprise(){

  const games=[
    "gravity",
    "blob",
    "colour",
    "spiral",
    "reaction"
  ];


  const pick=
    games[
      Math.floor(
        Math.random()*games.length
      )
    ];


  toast(
    "FLUX CHOSE "+pick.toUpperCase()
  );


  setTimeout(
    ()=>openGame(pick),
    500
  );

}


updateUI();
