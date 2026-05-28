import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

const PAYMENT_LINK = "https://poshpinklogobuilder.netlify.app/?paid=true";
const PRICE = "$47";

const C = {
  hotPink:   "#ff1493",
  bubblegum: "#ff69b4",
  softPink:  "#ffb6c1",
  blush:     "#fbeaf0",
  berry:     "#c2185b",
  plum:      "#4b1528",
  white:     "#ffffff",
  ink:       "#1a0a10",
  inkMid:    "#4a2535",
  inkLight:  "#9a6878",
};

const QUESTIONS = [
  { id:"bizName",   type:"text",   num:"01", q:"What is your business name?",                hint:"This will appear in all 5 of your logo concepts", placeholder:"Enter your business name…" },
  { id:"tagline",   type:"text",   num:"02", q:"Do you have a tagline or slogan?",            hint:"Optional — leave blank if you don't have one yet", placeholder:"e.g. Elevate your brand…" },
  { id:"industry",  type:"single", num:"03", q:"What industry are you in?",                   hint:"Choose the closest match", options:["Beauty & Wellness","Health & Medical","Real Estate","Professional Services","Boutique Retail","Events & Hospitality","Pet Services","Creative & Design","Coaching & Education","Restaurant & Food","Fitness & Sports","Tech & Digital","Other"] },
  { id:"style",     type:"multi",  num:"04", q:"Which logo styles appeal to you?",            hint:"Select all that resonate", options:["Minimalist & clean","Bold & modern","Elegant & luxury","Playful & fun","Vintage & classic","Geometric & structured","Handwritten & organic","Professional & corporate"] },
  { id:"colors",    type:"multi",  num:"05", q:"Which color families do you love?",           hint:"Select your favorites", options:["Soft pinks & blush","Deep burgundy & wine","Black & white","Gold & champagne","Navy & midnight blue","Sage & olive green","Terracotta & rust","Lavender & purple","Teal & turquoise"] },
  { id:"feel",      type:"single", num:"06", q:"What feeling should your logo give people?",  hint:"Choose the most important one", options:["Trustworthy & professional","Luxurious & high-end","Warm & approachable","Bold & energetic","Calm & serene","Creative & unique","Fun & playful","Sophisticated & refined"] },
  { id:"avoid",     type:"multi",  num:"07", q:"Anything you want to avoid?",                 hint:"Select all that apply", options:["Too many colors","Clip art or generic icons","Script/cursive fonts","All caps text","Dark or moody tones","Overly complex designs","Anything too trendy","Nothing — surprise me!"] },
];

const injectStyles = () => {
  if (document.getElementById("plb-styles")) return;
  const s = document.createElement("style");
  s.id = "plb-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+SC:wght@300;400;500;600&family=Raleway:wght@300;400;500;600&display=swap');
    .plb*{box-sizing:border-box;margin:0;padding:0}
    .plb{font-family:'Raleway',sans-serif;background:${C.blush};color:${C.ink};min-height:100vh}
    @keyframes plbUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes plbFade{from{opacity:0}to{opacity:1}}
    @keyframes plbPulse{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes plbSpin{to{transform:rotate(360deg)}}
    .plb-up{animation:plbUp .55s cubic-bezier(.22,.61,.36,1) both}
    .plb-fade{animation:plbFade .4s ease both}
    .plb-pulse{animation:plbPulse 1.8s ease-in-out infinite}
    .plb-opt{display:flex;align-items:center;gap:16px;padding:15px 20px;margin-bottom:9px;cursor:pointer;border:1.5px solid ${C.softPink};background:${C.white};transition:border-color .18s,background .18s}
    .plb-opt:hover,.plb-opt.on{border-color:${C.hotPink};background:${C.blush}}
    .plb-box{width:20px;height:20px;flex-shrink:0;border:1.5px solid ${C.softPink};background:transparent;display:flex;align-items:center;justify-content:center;transition:all .18s}
    .plb-box.on{background:${C.hotPink};border-color:${C.hotPink}}
    .plb-box.circ{border-radius:50%}
    .plb-btn{background:${C.plum};color:${C.white};border:none;font-family:'Cormorant SC',serif;font-size:13px;font-weight:500;letter-spacing:.15em;padding:17px 52px;cursor:pointer;transition:background .2s,transform .12s}
    .plb-btn:hover{background:${C.berry};transform:translateY(-1px)}
    .plb-btn:active{transform:translateY(0)}
    .plb-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
    .plb-btn.hot{background:${C.hotPink}}
    .plb-btn.hot:hover{background:${C.berry}}
    .plb-btn.ghost{background:transparent;border:1px solid ${C.softPink};color:${C.softPink}}
    .plb-input{width:100%;background:transparent;border:none;border-bottom:1.5px solid ${C.bubblegum};padding:14px 0;font-family:'Great Vibes',cursive;font-size:36px;color:${C.ink};outline:none;transition:border-color .2s}
    .plb-input:focus{border-bottom-color:${C.hotPink}}
    .plb-input::placeholder{color:${C.bubblegum};opacity:.6}
    .plb-logo-card{background:${C.white};border:1.5px solid ${C.softPink};padding:32px 24px;text-align:center;transition:border-color .2s,box-shadow .2s;cursor:pointer}
    .plb-logo-card:hover{border-color:${C.hotPink};box-shadow:0 4px 20px rgba(255,20,147,.12)}
    .plb-logo-card.selected{border-color:${C.hotPink};box-shadow:0 4px 20px rgba(255,20,147,.2)}
    .plb-divider{height:1px;background:${C.softPink};margin:28px 0}
  `;
  document.head.appendChild(s);
};

const PPMLogo = () => (
  <div style={{marginBottom:36}}>
    <img src="/logo.png" alt="Posh Pink Marketing" style={{height:52,width:"auto",objectFit:"contain"}}/>
  </div>
);

const Bar = ({cur,tot}) => {
  const pct = Math.round((cur/tot)*100);
  return (
    <div style={{marginBottom:44}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".18em",color:C.inkLight}}>Question {cur} of {tot}</span>
        <span style={{fontFamily:"'Great Vibes',cursive",fontSize:20,color:C.hotPink}}>{pct}%</span>
      </div>
      <div style={{height:2,background:C.softPink,borderRadius:1,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,height:"2px",borderRadius:1,width:`${pct}%`,background:`linear-gradient(90deg,${C.berry},${C.hotPink})`,transition:"width .5s cubic-bezier(.22,.61,.36,1)"}}/>
      </div>
    </div>
  );
};

const Opt = ({label,checked,onToggle,radio}) => (
  <div onClick={onToggle} className={`plb-opt${checked?" on":""}`}>
    <div className={`plb-box${radio?" circ":""}${checked?" on":""}`}>
      {checked && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><polyline points="1,4 4,7 10,1" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
    <span style={{fontFamily:"'Raleway',sans-serif",fontSize:14,color:C.inkMid}}>{label}</span>
  </div>
);

const Spinner = ({msg}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28,padding:"80px 0"}}>
    <div style={{width:48,height:48,border:`2px solid ${C.softPink}`,borderTop:`2px solid ${C.hotPink}`,borderRadius:"50%",animation:"plbSpin 1s linear infinite"}}/>
    <p className="plb-pulse" style={{fontFamily:"'Great Vibes',cursive",fontSize:28,color:C.berry}}>{msg}</p>
  </div>
);

// Generate sophisticated SVG logo from AI data
const buildSVG = (logo, bizName, tagline) => {
  const name = bizName || "Your Brand";
  const short = name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
  const words = name.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length/2)).join(" ");
  const line2 = words.slice(Math.ceil(words.length/2)).join(" ");
  const nameShort = name.length > 18 ? name.slice(0,16)+"." : name;
  const tag = tagline || "";
  const p = logo.primaryColor || C.hotPink;
  const s = logo.secondaryColor || C.plum;
  const a = logo.accentColor || C.softPink;
  const id = Math.random().toString(36).slice(2,8);
  const svgStyle = logo.svgStyle || "badge";

  const styles = {
    badge: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="bg${id}" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="${p}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${s}" stop-opacity="0.08"/>
        </radialGradient>
        <linearGradient id="ring${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}"/>
          <stop offset="50%" stop-color="${a}"/>
          <stop offset="100%" stop-color="${s}"/>
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="130" fill="url(#bg${id})"/>
      <circle cx="150" cy="150" r="128" fill="none" stroke="url(#ring${id})" stroke-width="2.5"/>
      <circle cx="150" cy="150" r="112" fill="none" stroke="${p}" stroke-width="0.7" stroke-dasharray="4,3"/>
      <circle cx="150" cy="150" r="100" fill="none" stroke="${s}" stroke-width="1"/>
      <polygon points="150,18 156,28 150,38 144,28" fill="${p}"/>
      <polygon points="150,262 156,272 150,282 144,272" fill="${p}"/>
      <polygon points="18,150 28,156 38,150 28,144" fill="${p}"/>
      <polygon points="262,150 272,156 282,150 272,144" fill="${p}"/>
      <text x="150" y="138" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="bold" fill="${s}" letter-spacing="4">${short}</text>
      <line x1="80" y1="175" x2="220" y2="175" stroke="${p}" stroke-width="0.8"/>
      <text x="150" y="193" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${s}" letter-spacing="3">${nameShort.toUpperCase()}</text>
      <line x1="80" y1="200" x2="220" y2="200" stroke="${p}" stroke-width="0.8"/>
      ${tag ? `<text x="150" y="218" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="${p}" letter-spacing="2" font-style="italic">${tag}</text>` : ""}
    </svg>`,

    geometric: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180">
      <defs>
        <linearGradient id="geo${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}"/>
          <stop offset="100%" stop-color="${s}"/>
        </linearGradient>
      </defs>
      <polygon points="20,90 52,50 52,130" fill="url(#geo${id})" opacity="0.9"/>
      <polygon points="25,90 50,56 50,124" fill="none" stroke="${a}" stroke-width="1"/>
      <line x1="68" y1="40" x2="68" y2="140" stroke="${p}" stroke-width="1.5"/>
      <text x="82" y="${words.length > 1 ? "82" : "100"}" font-family="Arial,sans-serif" font-size="${name.length > 12 ? "22" : "26"}" font-weight="900" fill="${s}" letter-spacing="2">${line1.toUpperCase()}</text>
      ${words.length > 1 ? `<text x="82" y="112" font-family="Arial,sans-serif" font-size="${name.length > 12 ? "22" : "26"}" font-weight="900" fill="${p}" letter-spacing="2">${line2.toUpperCase()}</text>` : ""}
      <rect x="82" y="122" width="220" height="3" fill="url(#geo${id})" rx="1.5"/>
      ${tag ? `<text x="82" y="142" font-family="Arial,sans-serif" font-size="10" fill="${p}" letter-spacing="3">${tag.toUpperCase()}</text>` : ""}
    </svg>`,

    minimal: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="160" viewBox="0 0 300 160">
      <defs>
        <linearGradient id="min${id}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${p}" stop-opacity="0"/>
          <stop offset="50%" stop-color="${p}" stop-opacity="1"/>
          <stop offset="100%" stop-color="${p}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="150" y1="18" x2="150" y2="38" stroke="${p}" stroke-width="0.8"/>
      <circle cx="150" cy="14" r="3" fill="${p}"/>
      <circle cx="150" cy="42" r="1.5" fill="${a}"/>
      <text x="150" y="${tag ? "82" : "88"}" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${name.length > 14 ? "20" : "24"}" fill="${s}" letter-spacing="3">${name}</text>
      <line x1="40" y1="${tag ? "92" : "98"}" x2="260" y2="${tag ? "92" : "98"}" stroke="url(#min${id})" stroke-width="0.8"/>
      ${tag ? `<text x="150" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="${p}" letter-spacing="4">${tag.toUpperCase()}</text>` : ""}
      <circle cx="32" cy="${tag ? "92" : "98"}" r="3" fill="${p}"/>
      <circle cx="268" cy="${tag ? "92" : "98"}" r="3" fill="${p}"/>
      <circle cx="150" cy="${tag ? "122" : "116"}" r="1.5" fill="${a}"/>
      <line x1="150" y1="${tag ? "126" : "120"}" x2="150" y2="${tag ? "146" : "140"}" stroke="${p}" stroke-width="0.8"/>
      <circle cx="150" cy="${tag ? "150" : "144"}" r="3" fill="${p}"/>
    </svg>`,

    script: `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="scr${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${s}" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <polygon points="160,10 310,100 160,190 10,100" fill="url(#scr${id})"/>
      <polygon points="160,18 298,100 160,182 22,100" fill="none" stroke="${p}" stroke-width="1" stroke-dasharray="5,4"/>
      <text x="160" y="80" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="56" font-weight="bold" fill="${s}" opacity="0.12">${short}</text>
      <text x="160" y="88" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="${name.length > 14 ? "18" : "22"}" fill="${s}" letter-spacing="2">${name}</text>
      <line x1="60" y1="100" x2="100" y2="100" stroke="${p}" stroke-width="1"/>
      <line x1="220" y1="100" x2="260" y2="100" stroke="${p}" stroke-width="1"/>
      <circle cx="55" cy="100" r="2.5" fill="${p}"/>
      <circle cx="265" cy="100" r="2.5" fill="${p}"/>
      ${tag ? `<text x="160" y="120" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="${p}" letter-spacing="3">${tag.toUpperCase()}</text>` : ""}
      <line x1="10" y1="100" x2="30" y2="80" stroke="${a}" stroke-width="0.6"/>
      <line x1="310" y1="100" x2="290" y2="80" stroke="${a}" stroke-width="0.6"/>
    </svg>`,

    monogram: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="220" viewBox="0 0 300 220">
      <defs>
        <linearGradient id="mon${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}"/>
          <stop offset="100%" stop-color="${s}"/>
        </linearGradient>
        <linearGradient id="monbg${id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${p}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${s}" stop-opacity="0.06"/>
        </linearGradient>
      </defs>
      <circle cx="150" cy="100" r="85" fill="url(#monbg${id})"/>
      <circle cx="150" cy="100" r="85" fill="none" stroke="${p}" stroke-width="1.5"/>
      <circle cx="150" cy="100" r="72" fill="none" stroke="${a}" stroke-width="0.6" stroke-dasharray="3,4"/>
      <text x="150" y="126" text-anchor="middle" font-family="Georgia,serif" font-size="88" font-weight="bold" fill="url(#mon${id})" opacity="0.85">${short[0]}</text>
      ${short.length > 1 ? `<text x="178" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="bold" fill="${s}" opacity="0.4">${short[1]}</text>` : ""}
      <rect x="50" y="194" width="200" height="1" fill="${p}" opacity="0.4"/>
      <text x="150" y="212" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="${s}" letter-spacing="4" font-weight="600">${nameShort.toUpperCase()}</text>
    </svg>`
  };

  return styles[svgStyle] || styles.badge;
};


// Logo preview card
const LogoCard = ({logo, index, bizName, tagline, selected, onSelect}) => {
  const svg = buildSVG(logo, bizName, tagline);
  return (
    <div className={`plb-logo-card${selected?" selected":""}`} onClick={()=>onSelect(index)}
      style={{position:"relative"}}>
      {selected && (
        <div style={{position:"absolute",top:10,right:10,width:24,height:24,borderRadius:"50%",background:C.hotPink,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><polyline points="1,4.5 4.5,8 11,1" stroke={C.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      )}
      <p style={{fontFamily:"'Cormorant SC',serif",fontSize:10,letterSpacing:".2em",color:C.berry,marginBottom:16}}>
        CONCEPT {["A","B","C","D","E"][index]}
      </p>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:120,overflow:"hidden"}}
        dangerouslySetInnerHTML={{__html:svg}}/>
      <p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.inkLight,marginTop:16}}>
        {logo.description||""}
      </p>
    </div>
  );
};

// Download SVG file
const downloadSVG = (svg, name, index) => {
  const blob = new Blob([svg], {type:"image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g,"-").toLowerCase()}-logo-concept-${["A","B","C","D","E"][index]}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

// Download all as PDF style guide
const downloadPDF = (logos, bizName, tagline, answers) => {
  const doc = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,H=297,M=16;
  const hexRgb = h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

  // Header
  doc.setFillColor(...hexRgb(C.plum)); doc.rect(0,0,W,40,"F");
  doc.setFillColor(...hexRgb(C.plum)); doc.rect(0,0,4,H,"F");
  doc.setFillColor(...hexRgb(C.blush)); doc.rect(0,40,W,H-40,"F");
  doc.setFont("helvetica","bolditalic"); doc.setFontSize(22); doc.setTextColor(...hexRgb(C.white));
  doc.text((bizName||"Your Brand").slice(0,28), M+2, 20);
  doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.softPink));
  doc.setCharSpace(2); doc.text("POSH PINK LOGO BUILDER — LOGO CONCEPTS", M+2, 30); doc.setCharSpace(0);
  doc.setTextColor(...hexRgb(C.bubblegum));
  doc.text("poshpinkmarketing.com", W-M, 30, {align:"right"});

  let y = 50;

  // Intro
  doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(...hexRgb(C.inkMid));
  doc.text("Your 5 custom logo concepts are shown below. Share these with a designer to bring them to life,", M, y);
  doc.text("or use them directly in Canva by recreating the style that resonates most.", M, y+5);
  y += 16;

  // Color palette from logos
  doc.setDrawColor(...hexRgb(C.softPink)); doc.setLineWidth(0.4); doc.line(M, y-3, W-M, y-3);
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.berry));
  doc.setCharSpace(2); doc.text("YOUR RECOMMENDED COLOR PALETTE", M, y+2); doc.setCharSpace(0);
  y += 10;

  const colors = [logos[0]?.primaryColor, logos[0]?.secondaryColor, logos[0]?.accentColor, logos[1]?.primaryColor].filter(Boolean);
  colors.forEach((hex,i) => {
    try {
      const sx = M + i*34;
      doc.setFillColor(...hexRgb(hex)); doc.rect(sx,y,28,16,"F");
      doc.setFontSize(5); 
      const rgb=hexRgb(hex); const lum=0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2];
      const tc=lum>140?hexRgb(C.inkMid):hexRgb(C.white);
      doc.setTextColor(tc[0],tc[1],tc[2]);
      doc.text(hex, sx+14, y+10, {align:"center"});
    } catch(e){}
  });
  y += 24;

  // Logo concepts — 2 per row
  doc.setDrawColor(...hexRgb(C.softPink)); doc.setLineWidth(0.4); doc.line(M, y-3, W-M, y-3);
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.berry));
  doc.setCharSpace(2); doc.text("LOGO CONCEPTS — STYLE DIRECTIONS", M, y+2); doc.setCharSpace(0);
  y += 10;

  logos.forEach((logo,i) => {
    const col = i%2;
    const bx = M + col*(cbW2+6);
    if(col===0 && i>0) y += 52;
    const cbW2 = (W-M*2-6)/2;
    const bxReal = M + col*((W-M*2-6)/2+6);

    doc.setFillColor(...hexRgb(C.white));
    doc.rect(bxReal, y, (W-M*2-6)/2, 46, "F");
    doc.setDrawColor(...hexRgb(C.softPink));
    doc.rect(bxReal, y, (W-M*2-6)/2, 46);

    // Color accent bar
    try { doc.setFillColor(...hexRgb(logo.primaryColor||C.hotPink)); }
    catch(e){ doc.setFillColor(...hexRgb(C.hotPink)); }
    doc.rect(bxReal, y, (W-M*2-6)/2, 2, "F");

    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.berry));
    doc.setCharSpace(1.5);
    doc.text("CONCEPT "+["A","B","C","D","E"][i], bxReal+(W-M*2-6)/4, y+8, {align:"center"});
    doc.setCharSpace(0);

    doc.setFont("helvetica","italic"); doc.setFontSize(8); doc.setTextColor(...hexRgb(C.plum));
    doc.text((logo.styleName||"").slice(0,24), bxReal+(W-M*2-6)/4, y+17, {align:"center"});

    doc.setFont("helvetica","normal"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.inkLight));
    const dl = doc.splitTextToSize(logo.description||"", (W-M*2-6)/2-8);
    doc.text(dl.slice(0,2), bxReal+4, y+25);

    doc.setFont("helvetica","normal"); doc.setFontSize(6.5); doc.setTextColor(...hexRgb(C.berry));
    doc.text("Fonts: "+(logo.fontStyle||""), bxReal+4, y+40);
  });
  y += 56;

  // Usage tips
  if(y < H-50){
    doc.setDrawColor(...hexRgb(C.softPink)); doc.setLineWidth(0.4); doc.line(M, y-3, W-M, y-3);
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.berry));
    doc.setCharSpace(2); doc.text("NEXT STEPS", M, y+2); doc.setCharSpace(0);
    y += 10;
    const tips = [
      "Share your favorite concept with a graphic designer to recreate as a professional vector file.",
      "Use the color hex codes above to stay consistent across all your marketing materials.",
      "Try recreating your chosen concept in Canva using the style direction as a guide.",
      "Need a full brand kit? Visit poshpinkbrandkitbuilder.netlify.app for colors, fonts & more.",
    ];
    tips.forEach((tip,i) => {
      doc.setFont("helvetica","bolditalic"); doc.setFontSize(8); doc.setTextColor(...hexRgb(C.hotPink));
      doc.text("0"+(i+1), M, y+4);
      doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(...hexRgb(C.inkMid));
      const tl = doc.splitTextToSize(tip, W-M*2-10);
      doc.text(tl, M+9, y+4);
      y += tl.length*4+6;
    });
  }

  // Footer
  doc.setFillColor(...hexRgb(C.plum)); doc.rect(0,H-14,W,14,"F");
  doc.setFont("helvetica","italic"); doc.setFontSize(7); doc.setTextColor(...hexRgb(C.softPink));
  doc.text("Crafted with love by Posh Pink Marketing  ·  poshpinkmarketing.com  ·  info@poshpinkmarketing.com",W/2,H-6,{align:"center"});

  doc.save(`${(bizName||"logo").replace(/\s+/g,"-").toLowerCase()}-logo-concepts.pdf`);
};

// Teaser
const Teaser = ({logos, bizName, tagline, onPay}) => (
  <div className="plb-fade">
    <div style={{background:C.plum,padding:"52px 44px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-80,right:-80,width:260,height:260,borderRadius:"50%",border:`1px solid rgba(255,20,147,.1)`,pointerEvents:"none"}}/>
      <p style={{fontFamily:"'Cormorant SC',serif",fontSize:10,letterSpacing:".28em",color:C.bubblegum,marginBottom:16,opacity:.8}}>Your Logo Concepts</p>
      <h1 style={{fontFamily:"'Great Vibes',cursive",fontSize:52,color:C.white,marginBottom:18,lineHeight:1.1}}>5 Custom Logos,<br/>Just for You</h1>
      <p style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:300,lineHeight:1.95,color:"rgba(251,234,240,.75)",maxWidth:440}}>Your personalized logo concepts are ready. Each one is unique, built around your brand style, colors and personality.</p>
    </div>

    {/* Show first logo as preview */}
    <div style={{background:C.white,padding:"36px 44px 32px",borderBottom:`1px solid ${C.softPink}`}}>
      <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".22em",color:C.berry,marginBottom:20}}>PREVIEW — CONCEPT A</p>
      <div style={{display:"flex",justifyContent:"center",padding:"24px",background:C.blush,border:`1px solid ${C.softPink}`}}>
        <div dangerouslySetInnerHTML={{__html:buildSVG(logos[0],bizName,tagline)}}/>
      </div>
    </div>

    {/* Locked */}
    <div style={{position:"relative"}}>
      <div style={{filter:"blur(5px)",userSelect:"none",pointerEvents:"none",background:C.blush,padding:"32px 44px 28px"}}>
        <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".22em",color:C.berry,marginBottom:20}}>CONCEPTS B — E</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[1,2,3,4].map(i=>(<div key={i} style={{height:120,background:C.white,border:`1px solid ${C.softPink}`,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,color:C.inkLight,letterSpacing:".14em"}}>CONCEPT {["B","C","D","E"][i-1]}</p></div>))}
        </div>
      </div>
      <div style={{position:"absolute",top:0,left:0,right:0,bottom:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(251,234,240,.6)"}}>
        <div style={{textAlign:"center",padding:"36px 40px",background:C.white,border:`1.5px solid ${C.softPink}`,maxWidth:380,boxShadow:"0 8px 40px rgba(75,21,40,.1)"}}>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" style={{marginBottom:14}}><rect x="7" y="15" width="20" height="13" rx="2" stroke={C.hotPink} strokeWidth="1.5" fill="none"/><path d="M11 15v-4a6 6 0 0112 0v4" stroke={C.hotPink} strokeWidth="1.5" strokeLinecap="round" fill="none"/><circle cx="17" cy="21.5" r="1.8" fill={C.hotPink}/></svg>
          <h3 style={{fontFamily:"'Cormorant SC',serif",fontSize:20,color:C.plum,marginBottom:10}}>Unlock All 5 Logo Concepts</h3>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:13,color:C.inkLight,lineHeight:1.9,marginBottom:22}}>Get all 5 unique logo concepts plus a downloadable PDF style guide with color codes, font directions and next steps.</p>
          <button className="plb-btn hot" onClick={onPay} style={{width:"100%",padding:"18px 0",fontSize:"14px",marginBottom:12}}>Unlock All 5 Logos — {PRICE}</button>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.inkLight,letterSpacing:".06em"}}>Secure payment · Instant SVG download</p>
        </div>
      </div>
    </div>
  </div>
);

// Full results
const FullResults = ({logos, bizName, tagline, answers}) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="plb-fade">
      <div style={{background:C.plum,padding:"52px 44px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:260,height:260,borderRadius:"50%",border:`1px solid rgba(255,20,147,.1)`,pointerEvents:"none"}}/>
        <p style={{fontFamily:"'Cormorant SC',serif",fontSize:10,letterSpacing:".28em",color:C.bubblegum,marginBottom:16,opacity:.8}}>Your Logo Concepts</p>
        <h1 style={{fontFamily:"'Great Vibes',cursive",fontSize:52,color:C.white,marginBottom:18,lineHeight:1.1}}>5 Custom Logos,<br/>Just for You</h1>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:300,lineHeight:1.95,color:"rgba(251,234,240,.75)",maxWidth:440}}>Click any concept to select it, then download as SVG or grab the full PDF style guide.</p>
      </div>

      <div style={{background:C.white,padding:"36px 44px 32px",borderBottom:`1px solid ${C.softPink}`}}>
        <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".22em",color:C.berry,marginBottom:8}}>YOUR 5 LOGO CONCEPTS</p>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.inkLight,marginBottom:24,lineHeight:1.8}}>Click a concept to select it, then download as SVG — a professional scalable file you can use anywhere.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {logos.slice(0,4).map((logo,i)=>(
            <LogoCard key={i} logo={logo} index={i} bizName={bizName} tagline={tagline}
              selected={selected===i} onSelect={setSelected}/>
          ))}
        </div>
        {logos[4] && (
          <div style={{maxWidth:"50%",margin:"0 auto"}}>
            <LogoCard logo={logos[4]} index={4} bizName={bizName} tagline={tagline}
              selected={selected===4} onSelect={setSelected}/>
          </div>
        )}
      </div>

      {/* Download section */}
      <div style={{background:C.blush,padding:"36px 44px 32px",borderBottom:`1px solid ${C.softPink}`}}>
        <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".22em",color:C.berry,marginBottom:20}}>DOWNLOAD YOUR LOGOS</p>
        <div style={{display:"grid",gap:10}}>
          {logos.map((logo,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:C.white,border:`1px solid ${C.softPink}`}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:40,height:40,background:logo.primaryColor||C.hotPink,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:"'Raleway',sans-serif",fontWeight:700,fontSize:12,color:C.white}}>{["A","B","C","D","E"][i]}</span>
                </div>
                <div>
                  <p style={{fontFamily:"'Cormorant SC',serif",fontSize:12,color:C.ink,letterSpacing:".08em"}}>{logo.styleName||`Concept ${["A","B","C","D","E"][i]}`}</p>
                  <p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.inkLight}}>{logo.description||""}</p>
                </div>
              </div>
              <button className="plb-btn" onClick={()=>downloadSVG(buildSVG(logo,bizName,tagline),bizName,i)}
                style={{padding:"10px 20px",fontSize:"11px",letterSpacing:".1em"}}>
                ⬇ SVG
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PDF + CTA */}
      <div style={{background:C.plum,padding:"52px 44px",textAlign:"center"}}>
        <p style={{fontFamily:"'Great Vibes',cursive",fontSize:40,color:C.softPink,marginBottom:12}}>Ready to Brand Your Business?</p>
        <p style={{fontFamily:"'Raleway',sans-serif",fontSize:13,fontWeight:300,color:"rgba(251,234,240,.7)",marginBottom:30,maxWidth:380,margin:"0 auto 30px",lineHeight:1.9}}>Download all 5 logos as SVG files, or grab the full PDF style guide with color codes and next steps.</p>
        <button className="plb-btn hot" onClick={()=>downloadPDF(logos,bizName,tagline,answers)} style={{marginBottom:14,minWidth:260}}>
          ⬇ Download PDF Style Guide
        </button>
        <br/>
        <a href="https://poshpinkbrandkitbuilder.netlify.app" style={{textDecoration:"none"}}>
          <button className="plb-btn ghost" style={{marginTop:12}}>Get Your Full Brand Kit Too →</button>
        </a>
        <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".15em",color:C.bubblegum,marginTop:20,opacity:.7}}>info@poshpinkmarketing.com</p>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(()=>{injectStyles();},[]);
  const urlPaid = new URLSearchParams(window.location.search).get("paid")==="true";
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [logos,setLogos]=useState(null);
  const [paid,setPaid]=useState(urlPaid);
  const [error,setError]=useState(null);
  const total=QUESTIONS.length;
  const curQ=QUESTIONS[step-1];

  useEffect(()=>{
    if(urlPaid){
      const r=sessionStorage.getItem("plb_logos");
      const a=sessionStorage.getItem("plb_answers");
      if(r){setLogos(JSON.parse(r));setAnswers(JSON.parse(a||"{}"));setStep(total+2);}
    }
  },[]);

  const ans=(qId,val,type)=>{
    if(type==="text"){setAnswers(p=>({...p,[qId]:val}));return;}
    if(type==="single"){setAnswers(p=>({...p,[qId]:val}));return;}
    setAnswers(p=>{const c=p[qId]||[];return{...p,[qId]:c.includes(val)?c.filter(v=>v!==val):[...c,val]};});
  };

  const canGo=()=>{
    if(!curQ)return false;
    const a=answers[curQ.id];
    if(curQ.type==="text") return curQ.id==="tagline" ? true : (a&&a.trim().length>0);
    if(curQ.type==="single")return !!a;
    return a&&a.length>0;
  };

  const next=()=>{
    if(step<total){setStep(s=>s+1);}
    else{setStep(total+1);generate();}
  };

  const generate=async()=>{
    const biz=answers["bizName"]||"your business";
    const prompt=`You are a professional logo designer and brand strategist. Create 5 unique logo concepts for "${biz}".

Business details:
- Tagline: ${answers["tagline"]||"none"}
- Industry: ${answers["industry"]||"not specified"}
- Style preferences: ${(answers["style"]||[]).join(", ")}
- Color preferences: ${(answers["colors"]||[]).join(", ")}
- Brand feeling: ${answers["feel"]||"not specified"}
- Avoid: ${(answers["avoid"]||[]).join(", ")}

Return ONLY valid JSON (no markdown, no preamble):
{
  "logos": [
    {
      "styleName": "Short 2-3 word style name e.g. Modern Minimal",
      "description": "One sentence describing this logo concept and what makes it unique",
      "primaryColor": "#HEXCODE",
      "secondaryColor": "#HEXCODE",
      "accentColor": "#HEXCODE",
      "fontStyle": "sans-serif OR serif OR script OR slab",
      "svgStyle": "badge OR geometric OR minimal OR script OR monogram"
    }
  ]
}

Rules:
- All 5 concepts must use DIFFERENT svgStyle values (badge, geometric, minimal, script, monogram — one each)
- Colors must match their stated preferences
- Each concept must feel genuinely different from the others
- All hex codes must be valid 6-digit hex values
- Make them feel professional and on-brand for their industry`;

    try{
      const res=await fetch("/.netlify/functions/logo-builder",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt})
      });
      const d=await res.json();
      if(!d.result)throw new Error("Empty");
      const parsed=JSON.parse(d.result.replace(/```json|```/g,"").trim());
      sessionStorage.setItem("plb_logos",JSON.stringify(parsed.logos));
      sessionStorage.setItem("plb_answers",JSON.stringify(answers));
      setLogos(parsed.logos);
      setStep(total+2);
    }catch(e){
      setError("Something went wrong generating your logos. Please try again.");
      setStep(total+2);
    }
  };

  const pay=()=>{ window.location.href=PAYMENT_LINK; };
  const wrap={maxWidth:640,margin:"0 auto",padding:"64px 36px"};

  return (
    <div className="plb" style={{minHeight:"100vh"}}>
      {step===0&&(
        <div className="plb-up" style={wrap}>
          <PPMLogo/>
          <p style={{fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".28em",color:C.berry,marginBottom:20}}>Posh Pink Logo Builder</p>
          <h1 style={{fontFamily:"'Great Vibes',cursive",fontSize:68,color:C.plum,marginBottom:20,lineHeight:1.05}}>Your Perfect Logo,<br/>In Minutes</h1>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:14,fontWeight:300,color:C.inkLight,lineHeight:2,marginBottom:44,maxWidth:420}}>Answer 7 quick questions and get 5 unique, AI-powered logo concepts tailored to your brand — no design skills needed. Download as professional SVG files ready to use anywhere.</p>
          <button className="plb-btn" onClick={()=>setStep(1)}>Build My Logo</button>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.inkLight,marginTop:16,letterSpacing:".1em"}}>About 2 minutes · 5 logo concepts · {PRICE}</p>
        </div>
      )}

      {step>=1&&step<=total&&curQ&&(
        <div key={step} className="plb-up" style={wrap}>
          <PPMLogo/>
          <Bar cur={step} tot={total}/>
          <p style={{fontFamily:"'Great Vibes',cursive",fontSize:22,color:C.hotPink,marginBottom:8}}>{curQ.num}</p>
          <h2 style={{fontFamily:"'Cormorant SC',serif",fontSize:28,fontWeight:400,color:C.ink,marginBottom:8,lineHeight:1.25}}>{curQ.q}</h2>
          <p style={{fontFamily:"'Raleway',sans-serif",fontSize:12,color:C.inkLight,marginBottom:curQ.type==="multi"?6:28}}>{curQ.hint}</p>
          {curQ.type==="multi"&&<p style={{fontFamily:"'Raleway',sans-serif",fontSize:11,color:C.bubblegum,fontStyle:"italic",marginBottom:20}}>You can select more than one.</p>}
          {curQ.type==="text"&&<input className="plb-input" type="text" placeholder={curQ.placeholder} value={answers[curQ.id]||""} autoFocus onChange={e=>ans(curQ.id,e.target.value,"text")} onKeyDown={e=>{if(e.key==="Enter"&&canGo())next();}}/>}
          {(curQ.type==="single"||curQ.type==="multi")&&<div>{curQ.options.map(opt=><Opt key={opt} label={opt} radio={curQ.type==="single"} checked={curQ.type==="single"?answers[curQ.id]===opt:(answers[curQ.id]||[]).includes(opt)} onToggle={()=>ans(curQ.id,opt,curQ.type)}/>)}</div>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:36}}>
            {step>1?<button className="plb-btn" style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Cormorant SC',serif",fontSize:11,letterSpacing:".18em",color:C.inkLight,padding:0}} onClick={()=>setStep(s=>s-1)}>← Back</button>:<div/>}
            <button className="plb-btn" onClick={next} disabled={!canGo()}>{step===total?"Generate My Logos":"Continue"}</button>
          </div>
        </div>
      )}

      {step===total+1&&(<div style={wrap}><PPMLogo/><Spinner msg="Designing your logos…"/></div>)}

      {step===total+2&&(
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{padding:"56px 36px 0"}}>
            <PPMLogo/>
            <p style={{fontFamily:"'Cormorant SC',serif",fontSize:10,letterSpacing:".22em",color:C.inkLight,marginBottom:8}}>Logos created for</p>
            <h2 style={{fontFamily:"'Great Vibes',cursive",fontSize:50,color:C.plum}}>{answers["bizName"]||"Your Brand"}</h2>
            <div className="plb-divider"/>
          </div>
          {error?(
            <div style={{padding:"0 36px 60px",textAlign:"center"}}>
              <p style={{fontFamily:"'Raleway',sans-serif",color:C.inkLight,marginBottom:22}}>{error}</p>
              <button className="plb-btn" onClick={()=>{setError(null);setStep(total);generate();}}>Try Again</button>
            </div>
          ):logos?(
            paid
              ?<FullResults logos={logos} bizName={answers["bizName"]} tagline={answers["tagline"]} answers={answers}/>
              :<Teaser logos={logos} bizName={answers["bizName"]} tagline={answers["tagline"]} onPay={pay}/>
          ):(
            <div style={{padding:"0 36px 60px"}}><Spinner msg="Preparing your logos…"/></div>
          )}
        </div>
      )}
    </div>
  );
}
