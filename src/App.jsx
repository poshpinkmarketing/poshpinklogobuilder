import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";

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
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&family=Cormorant+SC:wght@500;600&display=swap');
    .plb*{box-sizing:border-box;margin:0;padding:0}
    .plb{font-family:'Lato',sans-serif;background:#ffffff;color:${C.ink};min-height:100vh}
    @keyframes plbUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
    @keyframes plbFade{from{opacity:0}to{opacity:1}}
    @keyframes plbPulse{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes plbSpin{to{transform:rotate(360deg)}}
    .plb-up{animation:plbUp .55s cubic-bezier(.22,.61,.36,1) both}
    .plb-fade{animation:plbFade .4s ease both}
    .plb-pulse{animation:plbPulse 1.8s ease-in-out infinite}
    .plb-opt{display:flex;align-items:center;gap:16px;padding:16px 20px;margin-bottom:10px;cursor:pointer;border:2px solid #e8e8e8;background:#ffffff;border-radius:8px;transition:border-color .18s,background .18s}
    .plb-opt:hover,.plb-opt.on{border-color:${C.hotPink};background:#fff5fa}
    .plb-box{width:22px;height:22px;flex-shrink:0;border:2px solid #cccccc;background:transparent;display:flex;align-items:center;justify-content:center;transition:all .18s;border-radius:4px}
    .plb-box.on{background:${C.hotPink};border-color:${C.hotPink}}
    .plb-box.circ{border-radius:50%}
    .plb-btn{background:${C.plum};color:#ffffff;border:none;font-family:'Lato',sans-serif;font-size:15px;font-weight:700;letter-spacing:.06em;padding:18px 52px;cursor:pointer;border-radius:8px;transition:background .2s,transform .12s}
    .plb-btn:hover{background:${C.berry};transform:translateY(-1px)}
    .plb-btn:active{transform:translateY(0)}
    .plb-btn:disabled{opacity:.35;cursor:not-allowed;transform:none}
    .plb-btn.hot{background:${C.hotPink}}
    .plb-btn.hot:hover{background:${C.berry}}
    .plb-btn.ghost{background:transparent;border:2px solid rgba(255,255,255,.5);color:#ffffff;border-radius:8px}
    .plb-btn.ghost:hover{background:rgba(255,255,255,.12)}
    .plb-input{width:100%;background:#f8f8f8;border:2px solid #e8e8e8;border-radius:8px;padding:14px 18px;font-family:'Lato',sans-serif;font-size:18px;font-weight:400;color:${C.ink};outline:none;transition:border-color .2s}
    .plb-input:focus{border-color:${C.hotPink};background:#ffffff}
    .plb-input::placeholder{color:#aaaaaa}
    .plb-logo-card{background:#ffffff;border:2px solid #e8e8e8;border-radius:12px;padding:28px 20px;text-align:center;transition:border-color .2s,box-shadow .2s;cursor:pointer}
    .plb-logo-card:hover{border-color:${C.hotPink};box-shadow:0 4px 20px rgba(255,20,147,.12)}
    .plb-logo-card.selected{border-color:${C.hotPink};box-shadow:0 4px 20px rgba(255,20,147,.2)}
    .plb-divider{height:1px;background:#e8e8e8;margin:28px 0}
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
    <div style={{marginBottom:40}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
        <span style={{fontFamily:"'Lato',sans-serif",fontSize:13,fontWeight:600,color:C.inkLight}}>Question {cur} of {tot}</span>
        <span style={{fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:700,color:C.hotPink}}>{pct}%</span>
      </div>
      <div style={{height:4,background:"#e8e8e8",borderRadius:2,position:"relative"}}>
        <div style={{position:"absolute",top:0,left:0,height:"4px",borderRadius:2,width:`${pct}%`,background:`linear-gradient(90deg,${C.berry},${C.hotPink})`,transition:"width .5s cubic-bezier(.22,.61,.36,1)"}}/>
      </div>
    </div>
  );
};

const Opt = ({label,checked,onToggle,radio}) => (
  <div onClick={onToggle} className={`plb-opt${checked?" on":""}`}>
    <div className={`plb-box${radio?" circ":""}${checked?" on":""}`}>
      {checked && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><polyline points="1,4 4,7 10,1" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
    <span style={{fontFamily:"'Lato',sans-serif",fontSize:15,fontWeight:600,color:C.inkMid}}>{label}</span>
  </div>
);

const Spinner = ({msg}) => (
  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28,padding:"80px 0"}}>
    <div style={{width:48,height:48,border:`3px solid #e8e8e8`,borderTop:`3px solid ${C.hotPink}`,borderRadius:"50%",animation:"plbSpin 1s linear infinite"}}/>
    <p className="plb-pulse" style={{fontFamily:"'Lato',sans-serif",fontSize:18,fontWeight:700,color:C.berry}}>{msg}</p>
  </div>
);

const hexRgb = h => [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];

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

const downloadSVG = (svg, name, index) => {
  const blob = new Blob([svg], {type:"image/svg+xml"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/\s+/g,"-").toLowerCase()}-logo-concept-${["A","B","C","D","E"][index]}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};

const downloadPDF = (logos, bizName, tagline, answers) => {
  const doc = new jsPDF({orientation:"portrait",unit:"mm",format:"a4"});
  const W=210,H=297,M=18;
  const PLUM="#4b1528",PINK="#ff69b4",WHITE="#ffffff",TEXT="#4b1528";
  doc.setFillColor(...hexRgb(WHITE)); doc.rect(0,0,W,H,"F");
  doc.setFillColor(...hexRgb(PLUM)); doc.rect(0,0,6,H,"F");
  doc.setFillColor(...hexRgb(PINK)); doc.rect(W-6,0,6,H,"F");
  doc.setDrawColor(...hexRgb(PLUM)); doc.setLineWidth(2); doc.line(0,0,W,0);
  doc.setDrawColor(...hexRgb(PINK)); doc.setLineWidth(2); doc.line(0,H-0.5,W,H-0.5);
  doc.setFillColor(...hexRgb(PLUM)); doc.rect(6,0,W-12,48,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(26); doc.setTextColor(...hexRgb(WHITE));
  doc.text((bizName||"Your Brand").slice(0,28),W/2,22,{align:"center"});
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(PINK));
  doc.text("POSH PINK LOGO BUILDER — BRAND REFERENCE GUIDE",W/2,34,{align:"center"});
  if(tagline){doc.setFont("helvetica","italic"); doc.setFontSize(8); doc.setTextColor(...hexRgb(WHITE)); doc.text(tagline,W/2,42,{align:"center"});}
  let y=58;
  const sec=(label,yy)=>{
    doc.setDrawColor(...hexRgb(PLUM)); doc.setLineWidth(0.8); doc.line(M,yy-3,W/2-2,yy-3);
    doc.setDrawColor(...hexRgb(PINK)); doc.setLineWidth(0.8); doc.line(W/2+2,yy-3,W-M,yy-3);
    doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(PLUM));
    doc.text(label.toUpperCase(),W/2,yy,{align:"center"});
    return yy+9;
  };
  doc.setFont("helvetica","bold"); doc.setFontSize(8.5); doc.setTextColor(...hexRgb(TEXT));
  doc.text("Your 5 logo concepts are available as individual SVG downloads.",W/2,y,{align:"center"});
  doc.text("Use this guide as your brand reference for colors, style and next steps.",W/2,y+6,{align:"center"});
  y+=18;
  y=sec("Your Signature Color Palette",y);
  const cols=[logos[0]?.primaryColor,logos[0]?.secondaryColor,logos[0]?.accentColor,logos[1]?.primaryColor,logos[2]?.primaryColor].filter((c,i,a)=>c&&a.indexOf(c)===i).slice(0,5);
  const swW=28,swH=22,swGap=5,totalSwW=cols.length*(swW+swGap)-swGap,swStartX=(W-totalSwW)/2;
  cols.forEach((hex,i)=>{
    try{
      const sx=swStartX+i*(swW+swGap);
      doc.setFillColor(...hexRgb(hex)); doc.rect(sx,y,swW,swH,"F");
      doc.setDrawColor(...hexRgb(PLUM)); doc.setLineWidth(0.4); doc.rect(sx,y,swW,swH);
      const rgb=hexRgb(hex); const lum=0.299*rgb[0]+0.587*rgb[1]+0.114*rgb[2];
      const tc=lum>140?hexRgb(TEXT):hexRgb(WHITE);
      doc.setTextColor(tc[0],tc[1],tc[2]); doc.setFont("helvetica","bold"); doc.setFontSize(5.5);
      doc.text(hex,sx+swW/2,y+swH-4,{align:"center"});
    }catch(e){}
  });
  y+=swH+10;
  y=sec("Your 5 Logo Style Directions",y);
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(TEXT));
  doc.text("Download your SVG files from the quiz page to see the full designs.",W/2,y,{align:"center"});
  y+=10;
  logos.forEach((logo,i)=>{
    if(y>H-45)return;
    const p=logo.primaryColor||PLUM,rowH=24;
    doc.setFillColor(...hexRgb(WHITE)); doc.rect(M,y,W-M*2,rowH,"F");
    doc.setDrawColor(...hexRgb(PLUM)); doc.setLineWidth(0.4); doc.rect(M,y,W-M*2,rowH);
    try{doc.setFillColor(...hexRgb(p));}catch(e){doc.setFillColor(...hexRgb(PLUM));}
    doc.rect(M,y,3,rowH,"F");
    doc.setFillColor(...hexRgb(PINK)); doc.rect(W-M-3,y,3,rowH,"F");
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(...hexRgb(PLUM));
    doc.text("CONCEPT "+["A","B","C","D","E"][i]+" — "+(logo.styleName||""),W/2,y+8,{align:"center"});
    doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(TEXT));
    const dl=doc.splitTextToSize(logo.description||"",W-M*2-16);
    doc.text(dl[0]||"",W/2,y+16,{align:"center"});
    y+=rowH+4;
  });
  y+=4;
  if(y<H-65){
    y=sec("Your Brand Preferences",y);
    const prefs=[{label:"Industry",val:answers?.industry||""},{label:"Style",val:(answers?.style||[]).join(", ")},{label:"Colors",val:(answers?.colors||[]).join(", ")},{label:"Feeling",val:answers?.feel||""}].filter(p=>p.val);
    prefs.forEach(p=>{
      if(y>H-40)return;
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(TEXT));
      const val=p.val.length>50?p.val.slice(0,48)+"...":p.val;
      doc.text(p.label.toUpperCase()+": "+val,W/2,y+4,{align:"center"});
      y+=9;
    });
    y+=4;
  }
  if(y<H-60){
    y=sec("Next Steps",y);
    const tips=["Download all 5 logo SVGs from your quiz results page.","Share your favorite with a designer to recreate as a polished final file.","Use the hex codes above consistently across all your marketing.","Get your full brand kit at poshpinkbrandkitbuilder.netlify.app"];
    tips.forEach((tip,i)=>{
      if(y>H-28)return;
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(PINK));
      doc.text("0"+(i+1),M+4,y+4);
      doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(TEXT));
      const tl=doc.splitTextToSize(tip,W-M*2-14);
      doc.text(tl,W/2,y+4,{align:"center"});
      y+=tl.length*4.5+6;
    });
  }
  doc.setFillColor(...hexRgb(PLUM)); doc.rect(6,H-18,W-12,18,"F");
  doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.setTextColor(...hexRgb(WHITE));
  doc.text("www.poshpinkmarketing.com",W/2,H-10,{align:"center"});
  doc.setFont("helvetica","bold"); doc.setFontSize(7); doc.setTextColor(...hexRgb(PINK));
  doc.text("hello@poshpinkmarketing.com",W/2,H-4,{align:"center"});
  doc.save(`${(bizName||"logo").replace(/\s+/g,"-").toLowerCase()}-brand-reference.pdf`);
};

const LogoCard = ({logo,index,bizName,tagline,selected,onSelect}) => {
  const svg = buildSVG(logo,bizName,tagline);
  return (
    <div className={`plb-logo-card${selected?" selected":""}`} onClick={()=>onSelect(index)} style={{position:"relative"}}>
      {selected&&(<div style={{position:"absolute",top:10,right:10,width:24,height:24,borderRadius:"50%",background:C.hotPink,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="12" height="9" viewBox="0 0 12 9" fill="none"><polyline points="1,4.5 4.5,8 11,1" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>)}
      <p style={{fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".15em",color:C.berry,marginBottom:16}}>CONCEPT {["A","B","C","D","E"][index]}</p>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",minHeight:120,overflow:"hidden"}} dangerouslySetInnerHTML={{__html:svg}}/>
      <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:600,color:C.inkLight,marginTop:16}}>{logo.description||""}</p>
    </div>
  );
};

const FullResults = ({logos,bizName,tagline,answers}) => {
  const [selected,setSelected]=useState(null);
  return (
    <div className="plb-fade">
      <div style={{background:C.plum,padding:"52px 44px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-80,right:-80,width:260,height:260,borderRadius:"50%",border:`1px solid rgba(255,20,147,.1)`,pointerEvents:"none"}}/>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".25em",color:C.bubblegum,marginBottom:16}}>YOUR LOGO CONCEPTS</p>
        <h1 style={{fontFamily:"'Lato',sans-serif",fontSize:42,fontWeight:900,color:C.white,marginBottom:18,lineHeight:1.1}}>5 Custom Logos,<br/>Just for You</h1>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:15,fontWeight:400,lineHeight:1.8,color:"rgba(251,234,240,.8)",maxWidth:440}}>For best results, download each logo individually as an SVG file, then use the PDF as your brand reference guide.</p>
      </div>
      <div style={{background:C.white,padding:"36px 44px 32px",borderBottom:"1px solid #e8e8e8"}}>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.berry,marginBottom:8}}>YOUR 5 LOGO CONCEPTS</p>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:400,color:"#666666",marginBottom:24,lineHeight:1.7}}>Click any concept to select it, then download as an SVG file — a professional scalable file you can use anywhere.</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
          {logos.slice(0,4).map((logo,i)=>(<LogoCard key={i} logo={logo} index={i} bizName={bizName} tagline={tagline} selected={selected===i} onSelect={setSelected}/>))}
        </div>
        {logos[4]&&(<div style={{maxWidth:"50%",margin:"0 auto"}}><LogoCard logo={logos[4]} index={4} bizName={bizName} tagline={tagline} selected={selected===4} onSelect={setSelected}/></div>)}
      </div>
      <div style={{background:"#f8f8f8",padding:"36px 44px 32px",borderBottom:"1px solid #e8e8e8"}}>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:11,fontWeight:700,letterSpacing:".2em",color:C.berry,marginBottom:20}}>DOWNLOAD YOUR LOGOS</p>
        <div style={{display:"grid",gap:10}}>
          {logos.map((logo,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",background:C.white,border:"1px solid #e8e8e8",borderRadius:8}}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:40,height:40,background:logo.primaryColor||C.hotPink,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:"'Lato',sans-serif",fontWeight:900,fontSize:14,color:C.white}}>{["A","B","C","D","E"][i]}</span>
                </div>
                <div>
                  <p style={{fontFamily:"'Lato',sans-serif",fontSize:13,fontWeight:700,color:C.ink}}>{logo.styleName||`Concept ${["A","B","C","D","E"][i]}`}</p>
                  <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:400,color:"#666666"}}>{logo.description||""}</p>
                </div>
              </div>
              <button className="plb-btn" onClick={()=>downloadSVG(buildSVG(logo,bizName,tagline),bizName,i)} style={{padding:"10px 20px",fontSize:"12px"}}>⬇ SVG</button>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:C.plum,padding:"52px 44px",textAlign:"center"}}>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:32,fontWeight:900,color:C.softPink,marginBottom:12}}>Ready to Brand Your Business?</p>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:400,color:"rgba(251,234,240,.7)",marginBottom:30,maxWidth:420,margin:"0 auto 30px",lineHeight:1.8}}>Download each logo as an SVG file above, then grab the PDF as your brand reference guide with color codes and next steps.</p>
        <button className="plb-btn hot" onClick={()=>downloadPDF(logos,bizName,tagline,answers)} style={{marginBottom:14,minWidth:260}}>⬇ Download PDF Reference Guide</button>
        <br/>
        <a href="https://poshpinkbrandkitbuilder.netlify.app" style={{textDecoration:"none"}}><button className="plb-btn ghost" style={{marginTop:12}}>Get Your Full Brand Kit Too →</button></a>
        <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:600,color:C.bubblegum,marginTop:20}}>hello@poshpinkmarketing.com</p>
      </div>
    </div>
  );
};

export default function App() {
  useEffect(()=>{injectStyles();},[]);
  const [step,setStep]=useState(0);
  const [answers,setAnswers]=useState({});
  const [logos,setLogos]=useState(null);
  const [error,setError]=useState(null);
  const total=QUESTIONS.length;
  const curQ=QUESTIONS[step-1];

  const ans=(qId,val,type)=>{
    if(type==="text"){setAnswers(p=>({...p,[qId]:val}));return;}
    if(type==="single"){setAnswers(p=>({...p,[qId]:val}));return;}
    setAnswers(p=>{const c=p[qId]||[];return{...p,[qId]:c.includes(val)?c.filter(v=>v!==val):[...c,val]};});
  };

  const canGo=()=>{
    if(!curQ)return false;
    const a=answers[curQ.id];
    if(curQ.type==="text")return curQ.id==="tagline"?true:(a&&a.trim().length>0);
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
{"logos":[{"styleName":"Short 2-3 word style name","description":"One sentence describing this logo concept","primaryColor":"#HEXCODE","secondaryColor":"#HEXCODE","accentColor":"#HEXCODE","fontStyle":"sans-serif OR serif OR script OR slab","svgStyle":"badge OR geometric OR minimal OR script OR monogram"}]}
Rules:
- All 5 must use DIFFERENT svgStyle values (badge, geometric, minimal, script, monogram — one each)
- Colors must match their stated preferences
- All hex codes must be valid 6-digit hex values`;
    try{
      const res=await fetch("/.netlify/functions/logo-builder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
      const d=await res.json();
      if(!d.result)throw new Error("Empty");
      const parsed=JSON.parse(d.result.replace(/```json|```/g,"").trim());
      setLogos(parsed.logos);
      setStep(total+2);
    }catch(e){
      setError("Something went wrong generating your logos. Please try again.");
      setStep(total+2);
    }
  };

  const wrap={maxWidth:620,margin:"0 auto",padding:"64px 24px"};

  return (
    <div className="plb" style={{minHeight:"100vh"}}>
      {step===0&&(
        <div className="plb-up" style={wrap}>
          <PPMLogo/>
          <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".2em",color:C.berry,marginBottom:20}}>POSH PINK LOGO BUILDER</p>
          <h1 style={{fontFamily:"'Lato',sans-serif",fontSize:48,fontWeight:900,color:C.plum,marginBottom:20,lineHeight:1.1}}>Your Perfect Logo,<br/>In Minutes</h1>
          <p style={{fontFamily:"'Lato',sans-serif",fontSize:16,fontWeight:400,color:"#555555",lineHeight:1.8,marginBottom:44,maxWidth:420}}>Answer 7 quick questions and get 5 unique, AI-powered logo concepts tailored to your brand. Download as professional SVG files ready to use anywhere.</p>
          <button className="plb-btn" onClick={()=>setStep(1)}>Build My Logo</button>
          <p style={{fontFamily:"'Lato',sans-serif",fontSize:13,fontWeight:600,color:"#999999",marginTop:16}}>About 2 minutes · 5 logo concepts</p>
        </div>
      )}
      {step>=1&&step<=total&&curQ&&(
        <div key={step} className="plb-up" style={wrap}>
          <PPMLogo/>
          <Bar cur={step} tot={total}/>
          <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".15em",color:C.hotPink,marginBottom:10}}>{curQ.num}</p>
          <h2 style={{fontFamily:"'Lato',sans-serif",fontSize:26,fontWeight:900,color:C.ink,marginBottom:10,lineHeight:1.25}}>{curQ.q}</h2>
          <p style={{fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:400,color:"#777777",marginBottom:curQ.type==="multi"?8:28}}>{curQ.hint}</p>
          {curQ.type==="multi"&&<p style={{fontFamily:"'Lato',sans-serif",fontSize:13,fontWeight:700,color:C.hotPink,marginBottom:20}}>Select all that apply</p>}
          {curQ.type==="text"&&<input className="plb-input" type="text" placeholder={curQ.placeholder} value={answers[curQ.id]||""} autoFocus onChange={e=>ans(curQ.id,e.target.value,"text")} onKeyDown={e=>{if(e.key==="Enter"&&canGo())next();}}/>}
          {(curQ.type==="single"||curQ.type==="multi")&&<div>{curQ.options.map(opt=><Opt key={opt} label={opt} radio={curQ.type==="single"} checked={curQ.type==="single"?answers[curQ.id]===opt:(answers[curQ.id]||[]).includes(opt)} onToggle={()=>ans(curQ.id,opt,curQ.type)}/>)}</div>}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:36}}>
            {step>1?<button style={{background:"none",border:"none",cursor:"pointer",fontFamily:"'Lato',sans-serif",fontSize:14,fontWeight:700,color:"#999999",padding:0}} onClick={()=>setStep(s=>s-1)}>← Back</button>:<div/>}
            <button className="plb-btn" onClick={next} disabled={!canGo()}>{step===total?"Generate My Logos":"Continue"}</button>
          </div>
        </div>
      )}
      {step===total+1&&(<div style={wrap}><PPMLogo/><Spinner msg="Designing your logos…"/></div>)}
      {step===total+2&&(
        <div style={{maxWidth:620,margin:"0 auto"}}>
          <div style={{padding:"56px 24px 0"}}>
            <PPMLogo/>
            <p style={{fontFamily:"'Lato',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".15em",color:"#999999",marginBottom:8}}>LOGOS CREATED FOR</p>
            <h2 style={{fontFamily:"'Lato',sans-serif",fontSize:36,fontWeight:900,color:C.plum}}>{answers["bizName"]||"Your Brand"}</h2>
            <div className="plb-divider"/>
          </div>
          {error?(
            <div style={{padding:"0 24px 60px",textAlign:"center"}}>
              <p style={{fontFamily:"'Lato',sans-serif",fontSize:14,color:"#666666",marginBottom:22}}>{error}</p>
              <button className="plb-btn" onClick={()=>{setError(null);setStep(total);generate();}}>Try Again</button>
            </div>
          ):logos?(
            <FullResults logos={logos} bizName={answers["bizName"]} tagline={answers["tagline"]} answers={answers}/>
          ):(
            <div style={{padding:"0 24px 60px"}}><Spinner msg="Preparing your logos…"/></div>
          )}
        </div>
      )}
    </div>
  );
}
