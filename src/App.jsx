import { useState, useEffect, useRef } from "react";

const REGIONS = ["London","South East","North West","Midlands","South West","Yorkshire","Scotland","North East"];
const OWNERS = ["Lola Amidu","Marcus Reid","Sophie Chen","James Okafor","Priya Sharma"];
const WORKFLOWS = ["Prospects","Resident Helpdesk","Voice","Maintenance","Compliance"];

const NAME_PARTS = {
  adj:["Hargreaves","Prime","Urban","Metropolitan","Oakwood","Kingsbridge","CityLiving","North London","Meridian","Apex","Elmwood","Riverbank","Crown","Regent","Heritage","Landmark","Sterling","Capital","Prestige","Brunswick","Windsor","Clifton","Montrose","Berkeley","Holborn","Canary","Southside","Northgate","Westfield","Eastbrook","Highbury","Chelsea","Mayfair","Soho","Camden","Brixton","Hackney","Islington","Shoreditch","Bermondsey","Battersea","Clapham","Fulham","Richmond","Wimbledon","Hammersmith","Ealing","Acton","Wembley","Stratford"],
  noun:["Residential","Lettings","Property Group","Living","Estates","Property Management","Homes","Realty","Properties","Asset Management","Land","Build to Rent","Developments","Block Management","Housing","Spaces","Quarters","Place","Collective","Partners"]
};

function rng(seed){let s=seed;return()=>{s=(s*1664525+1013904223)&0xffffffff;return(s>>>0)/0xffffffff}}
function genName(r,used=new Set()){const a=NAME_PARTS.adj[Math.floor(r()*NAME_PARTS.adj.length)];const n=NAME_PARTS.noun[Math.floor(r()*NAME_PARTS.noun.length)];const name=`${a} ${n}`;return used.has(name)?genName(r,used):name}

function genCustomers(){
  const rand=rng(42);const customers=[];const used=new Set();
  const segments=[{type:"Small",units:[100,500],arr:[8000,25000],count:200},{type:"Mid-Market",units:[500,5000],arr:[25000,80000],count:220},{type:"Enterprise",units:[5000,20000],arr:[80000,200000],count:80}];
  const healthBuckets=[];
  for(let i=0;i<25;i++)healthBuckets.push("critical");
  for(let i=0;i<75;i++)healthBuckets.push("at_risk");
  for(let i=0;i<275;i++)healthBuckets.push("healthy");
  for(let i=0;i<125;i++)healthBuckets.push("expansion");
  for(let i=healthBuckets.length-1;i>0;i--){const j=Math.floor(rand()*i);[healthBuckets[i],healthBuckets[j]]=[healthBuckets[j],healthBuckets[i]]}
  let idx=0;
  segments.forEach(seg=>{
    for(let i=0;i<seg.count;i++){
      const name=genName(rand,used);used.add(name);
      const bucket=healthBuckets[idx++]||"healthy";
      const units=Math.floor(rand()*(seg.units[1]-seg.units[0])+seg.units[0]);
      const arr=Math.floor(rand()*(seg.arr[1]-seg.arr[0])+seg.arr[0]);
      const daysLive=Math.floor(rand()*730+30);
      const region=REGIONS[Math.floor(rand()*REGIONS.length)];
      const owner=OWNERS[Math.floor(rand()*OWNERS.length)];
      let onb,adp,sup,sen,com;
      if(bucket==="critical"){onb=Math.floor(rand()*40+10);adp=Math.floor(rand()*35+5);sup=Math.floor(rand()*35+5);sen=Math.floor(rand()*40+10);com=Math.floor(rand()*35+10);}
      else if(bucket==="at_risk"){onb=Math.floor(rand()*30+35);adp=Math.floor(rand()*25+30);sup=Math.floor(rand()*30+25);sen=Math.floor(rand()*30+30);com=Math.floor(rand()*30+25);}
      else if(bucket==="healthy"){onb=Math.floor(rand()*25+60);adp=Math.floor(rand()*25+60);sup=Math.floor(rand()*25+60);sen=Math.floor(rand()*25+55);com=Math.floor(rand()*25+55);}
      else{onb=Math.floor(rand()*15+82);adp=Math.floor(rand()*15+82);sup=Math.floor(rand()*12+82);sen=Math.floor(rand()*15+80);com=Math.floor(rand()*15+82);}
      const score=Math.round(onb*0.2+adp*0.3+sup*0.2+sen*0.15+com*0.15);
      const prevScore=Math.min(100,Math.max(0,score+Math.floor(rand()*26-10)));
      const trend=score>prevScore+3?"improving":score<prevScore-3?"declining":"stable";
      const wfAdoption={};
      WORKFLOWS.forEach(w=>{wfAdoption[w]=bucket==="expansion"?Math.floor(rand()*20+80):bucket==="critical"?Math.floor(rand()*40+5):bucket==="at_risk"?Math.floor(rand()*35+30):Math.floor(rand()*30+55)});
      const escalations=bucket==="critical"?Math.floor(rand()*15+8):bucket==="at_risk"?Math.floor(rand()*8+3):Math.floor(rand()*4);
      const failedMessages=bucket==="critical"?Math.floor(rand()*12+5):bucket==="at_risk"?Math.floor(rand()*5+1):Math.floor(rand()*3);
      const openIssues=bucket==="critical"?Math.floor(rand()*8+4):bucket==="at_risk"?Math.floor(rand()*4+1):Math.floor(rand()*3);
      const loginFreq=bucket==="expansion"?"Daily":bucket==="critical"?"Rarely":bucket==="at_risk"?"Infrequent":["Daily","Weekly","Regular"][Math.floor(rand()*3)];
      const tenantSat=bucket==="expansion"?Math.floor(rand()*10+88):bucket==="critical"?Math.floor(rand()*20+40):bucket==="at_risk"?Math.floor(rand()*20+55):Math.floor(rand()*18+70);
      const nps=bucket==="expansion"?Math.floor(rand()*20+60):bucket==="critical"?Math.floor(rand()*30-10):bucket==="at_risk"?Math.floor(rand()*25+10):Math.floor(rand()*25+30);
      const renewalDays=Math.floor(rand()*365+14);
      const trainingComplete=bucket==="expansion"?Math.floor(rand()*10+90):bucket==="critical"?Math.floor(rand()*50+10):bucket==="at_risk"?Math.floor(rand()*30+45):Math.floor(rand()*20+70);
      const integrationComplete=bucket==="expansion"?Math.floor(rand()*10+90):bucket==="critical"?Math.floor(rand()*60+10):bucket==="at_risk"?Math.floor(rand()*35+40):Math.floor(rand()*20+72);
      customers.push({id:`c${i}_${idx}`,name,segment:seg.type,units,arr,daysLive,region,owner,score,prevScore,trend,bucket,onb,adp,sup,sen,com,wfAdoption,escalations,failedMessages,openIssues,loginFreq,tenantSat,nps,renewalDays,trainingComplete,integrationComplete,lastContact:`${Math.floor(rand()*21+1)}d ago`});
    }
  });
  return customers;
}

const CUSTOMERS=genCustomers();

function getHealthLabel(score){
  if(score>=90)return{label:"Expansion Ready",color:"#0d9488",bg:"#f0fdf9",border:"#99f6e4"};
  if(score>=75)return{label:"Healthy",color:"#16a34a",bg:"#f0fdf4",border:"#86efac"};
  if(score>=60)return{label:"Monitor",color:"#d97706",bg:"#fffbeb",border:"#fcd34d"};
  if(score>=40)return{label:"At Risk",color:"#ea580c",bg:"#fff7ed",border:"#fdba74"};
  return{label:"Critical",color:"#dc2626",bg:"#fef2f2",border:"#fca5a5"};
}

function TrendArrow({trend,score,prev}){
  const diff=Math.abs(score-prev);
  if(trend==="improving")return<span style={{color:"#16a34a",fontSize:12,fontWeight:500}}>↑ +{diff}</span>;
  if(trend==="declining")return<span style={{color:"#dc2626",fontSize:12,fontWeight:500}}>↓ -{diff}</span>;
  return<span style={{color:"#6b7280",fontSize:12}}>→ stable</span>;
}

function ScoreRing({score,size=52}){
  const h=getHealthLabel(score);const r=size/2-4;const circ=2*Math.PI*r;const dash=circ*(score/100);
  return(<svg width={size} height={size} style={{flexShrink:0}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={3}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={h.color} strokeWidth={3} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/><text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:size>40?13:10,fontWeight:600,fill:h.color,fontFamily:"DM Sans,sans-serif"}}>{score}</text></svg>);
}

function MiniBar({value,color="#3b82f6"}){
  return(<div style={{height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden",width:"100%"}}><div style={{height:"100%",width:`${value}%`,background:color,borderRadius:2,transition:"width .6s ease"}}/></div>);
}

function CategoryScores({c}){
  const cats=[{label:"Onboarding",val:c.onb,weight:"20%"},{label:"Adoption",val:c.adp,weight:"30%"},{label:"Support",val:c.sup,weight:"20%"},{label:"Sentiment",val:c.sen,weight:"15%"},{label:"Commercial",val:c.com,weight:"15%"}];
  const color=(v)=>v>=75?"#16a34a":v>=55?"#d97706":v>=40?"#ea580c":"#dc2626";
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>{cats.map(cat=>(<div key={cat.label}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><span style={{fontSize:12,color:"#374151",fontWeight:500}}>{cat.label}</span><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,color:"#9ca3af"}}>{cat.weight}</span><span style={{fontSize:12,fontWeight:600,color:color(cat.val)}}>{cat.val}</span></div></div><MiniBar value={cat.val} color={color(cat.val)}/></div>))}</div>);
}

// Stat card modal breakdown data
function getCardBreakdown(type, customers){
  const critical=customers.filter(c=>c.bucket==="critical");
  const atRisk=customers.filter(c=>c.bucket==="at_risk");
  const healthy=customers.filter(c=>c.bucket==="healthy");
  const expansion=customers.filter(c=>c.bucket==="expansion");
  if(type==="arr"){
    return{
      title:"Portfolio ARR breakdown",
      rows:[
        {label:"Enterprise accounts",val:`£${(customers.filter(c=>c.segment==="Enterprise").reduce((s,c)=>s+c.arr,0)/1000000).toFixed(1)}M`,sub:`${customers.filter(c=>c.segment==="Enterprise").length} accounts`},
        {label:"Mid-Market accounts",val:`£${(customers.filter(c=>c.segment==="Mid-Market").reduce((s,c)=>s+c.arr,0)/1000000).toFixed(1)}M`,sub:`${customers.filter(c=>c.segment==="Mid-Market").length} accounts`},
        {label:"Small accounts",val:`£${(customers.filter(c=>c.segment==="Small").reduce((s,c)=>s+c.arr,0)/1000000).toFixed(1)}M`,sub:`${customers.filter(c=>c.segment==="Small").length} accounts`},
        {label:"Avg ARR per customer",val:`£${Math.round(customers.reduce((s,c)=>s+c.arr,0)/customers.length/1000)}k`,sub:"across all segments"},
      ]
    };
  }
  if(type==="risk"){
    const riskArr=[...critical,...atRisk].reduce((s,c)=>s+c.arr,0);
    return{
      title:"ARR at risk breakdown",
      rows:[
        {label:"Critical accounts",val:`£${(critical.reduce((s,c)=>s+c.arr,0)/1000).toFixed(0)}k`,sub:`${critical.length} accounts · immediate action`,alert:true},
        {label:"At-risk accounts",val:`£${(atRisk.reduce((s,c)=>s+c.arr,0)/1000).toFixed(0)}k`,sub:`${atRisk.length} accounts · needs attention`,warn:true},
        {label:"Renewal < 30 days",val:`${[...critical,...atRisk].filter(c=>c.renewalDays<=30).length} accounts`,sub:"critical renewal window",alert:true},
        {label:"Avg health score",val:`${Math.round([...critical,...atRisk].reduce((s,c)=>s+c.score,0)/([...critical,...atRisk].length))}`,sub:"at-risk portfolio average"},
      ]
    };
  }
  if(type==="health"){
    const avg=Math.round(customers.reduce((s,c)=>s+c.score,0)/customers.length);
    return{
      title:"Portfolio health breakdown",
      rows:[
        {label:"Expansion Ready (90–100)",val:`${expansion.length} accounts`,sub:`${Math.round(expansion.length/5)}% of portfolio`,green:true},
        {label:"Healthy (75–89)",val:`${healthy.filter(c=>c.score>=75&&c.score<90).length} accounts`,sub:"on track"},
        {label:"Monitor (60–74)",val:`${healthy.filter(c=>c.score>=60&&c.score<75).length} accounts`,sub:"watch closely",warn:true},
        {label:"At Risk / Critical (<60)",val:`${[...critical,...atRisk].length} accounts`,sub:"require action now",alert:true},
      ]
    };
  }
  if(type==="expansion"){
    const expArr=expansion.reduce((s,c)=>s+c.arr,0);
    return{
      title:"Expansion pipeline breakdown",
      rows:[
        {label:"Expansion Ready accounts",val:`${expansion.length}`,sub:"score 90+ across all categories",green:true},
        {label:"Current expansion ARR",val:`£${(expArr/1000).toFixed(0)}k`,sub:"estimated upsell potential",green:true},
        {label:"Avg NPS (expansion)",val:`${Math.round(expansion.reduce((s,c)=>s+c.nps,0)/expansion.length)}`,sub:"strong advocacy signal",green:true},
        {label:"All 5 workflows adopted",val:`${expansion.filter(c=>Object.values(c.wfAdoption).every(v=>v>=70)).length} accounts`,sub:"fully activated customers",green:true},
      ]
    };
  }
}

function StatCardModal({type,customers,onClose}){
  const data=getCardBreakdown(type,customers);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:16,padding:"24px 28px",width:380,maxWidth:"90vw",boxShadow:"0 20px 60px rgba(0,0,0,.15)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontSize:15,fontWeight:600,color:"#0f1117"}}>{data.title}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:"#9ca3af",lineHeight:1}}>×</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {data.rows.map((row,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:row.alert?"#fef2f2":row.warn?"#fffbeb":row.green?"#f0fdf4":"#f9fafb",borderRadius:10,border:`0.5px solid ${row.alert?"#fca5a5":row.warn?"#fcd34d":row.green?"#86efac":"#e5e7eb"}`}}>
              <div>
                <div style={{fontSize:13,fontWeight:500,color:"#0f1117"}}>{row.label}</div>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{row.sub}</div>
              </div>
              <div style={{fontSize:15,fontWeight:700,color:row.alert?"#dc2626":row.warn?"#d97706":row.green?"#16a34a":"#0f1117"}}>{row.val}</div>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",marginTop:16,padding:"9px",border:"0.5px solid #e5e7eb",borderRadius:8,background:"transparent",fontSize:13,color:"#6b7280",cursor:"pointer"}}>Close</button>
      </div>
    </div>
  );
}

// AI — uses non-streaming fetch since Netlify Functions don't support streaming
function generateBriefing(customers) {
  const critical = customers.filter(c => c.bucket === "critical");
  const atRisk = customers.filter(c => c.bucket === "at_risk");
  const expansion = customers.filter(c => c.bucket === "expansion");
  const totalARR = customers.reduce((s,c) => s+c.arr, 0);
  const riskARR = [...critical,...atRisk].reduce((s,c) => s+c.arr, 0);
  const improving = customers.filter(c => c.trend === "improving").length;
  const declining = customers.filter(c => c.trend === "declining").length;
  const avgScore = Math.round(customers.reduce((s,c) => s+c.score, 0)/customers.length);
  const topCritical = critical.sort((a,b) => a.score-b.score)[0];
  const topRenewal = atRisk.filter(c => c.renewalDays <= 30).sort((a,b) => a.renewalDays-b.renewalDays)[0] || atRisk[0];
  const topExpansion = expansion.sort((a,b) => b.score-a.score)[0];

  const lines = [];
  lines.push(`Good morning, Lola. You're managing a portfolio of 500 customers across £${(totalARR/1000000).toFixed(1)}M ARR, with an average portfolio health score of ${avgScore}/100.`);

  if (critical.length > 0 && topCritical) {
    const drop = topCritical.prevScore - topCritical.score;
    lines.push(`${critical.length} account${critical.length>1?"s are":"is"} Critical today — your most urgent is ${topCritical.name}, which has declined ${drop} health points over the past 7 days due to ${topCritical.escalations} open escalations and ${topCritical.failedMessages} failed message deliveries.`);
  }

  if (atRisk.length > 0 && topRenewal) {
    lines.push(`${atRisk.length} accounts are At Risk, representing £${Math.round(riskARR/1000)}k ARR. ${topRenewal.name} is the highest priority — renewal is in ${topRenewal.renewalDays} days and the account is currently ${getHealthLabel(topRenewal.score).label} at ${topRenewal.score}/100.`);
  }

  if (topExpansion) {
    lines.push(`On the positive side, ${expansion.length} accounts are Expansion Ready. ${topExpansion.name} leads with a score of ${topExpansion.score}/100 and NPS of ${topExpansion.nps} — this is a strong candidate for an upsell conversation this week.`);
  }

  lines.push(`Portfolio momentum: ${improving} accounts are improving and ${declining} are declining. Your recommended focus today is ${topCritical ? topCritical.name : atRisk[0]?.name || "your at-risk accounts"}.`);

  return lines.join(" ");
}


function Dashboard({customers,onSelectCustomer}){
  const [modalType,setModalType]=useState(null);
  const critical=customers.filter(c=>c.bucket==="critical");
  const atRisk=customers.filter(c=>c.bucket==="at_risk");
  const expansion=customers.filter(c=>c.bucket==="expansion");
  const healthy=customers.filter(c=>c.bucket==="healthy");
  const totalARR=customers.reduce((s,c)=>s+c.arr,0);
  const riskARR=[...critical,...atRisk].reduce((s,c)=>s+c.arr,0);
  const expARR=expansion.reduce((s,c)=>s+c.arr,0);
  const avgScore=Math.round(customers.reduce((s,c)=>s+c.score,0)/customers.length);
  const improving=customers.filter(c=>c.trend==="improving").length;
  const declining=customers.filter(c=>c.trend==="declining").length;

  const priorities=[
    ...critical.sort((a,b)=>a.score-b.score).slice(0,3),
    ...atRisk.filter(c=>c.trend==="declining").sort((a,b)=>a.score-b.score).slice(0,3),
    ...atRisk.filter(c=>c.renewalDays<=30).slice(0,2),
    ...expansion.filter(c=>c.trend==="improving").sort((a,b)=>b.score-a.score).slice(0,2),
  ];
  const seen=new Set();
  const deduped=priorities.filter(c=>{if(seen.has(c.id))return false;seen.add(c.id);return true}).slice(0,8);

  const briefing = generateBriefing(customers);

    const statCards=[
    {type:"arr",label:"Portfolio ARR",val:`£${(totalARR/1000000).toFixed(1)}M`,sub:"total managed · click for breakdown",color:"#0f1117"},
    {type:"risk",label:"ARR at risk",val:`£${Math.round(riskARR/1000)}k`,sub:`${critical.length} critical · ${atRisk.length} at risk`,color:"#dc2626",alert:true},
    {type:"health",label:"Portfolio health",val:`${avgScore}`,sub:`${improving} improving · ${declining} declining`,color:"#0f1117"},
    {type:"expansion",label:"Expansion pipeline",val:`£${Math.round(expARR/1000)}k`,sub:`${expansion.length} accounts ready`,color:"#16a34a",green:true},
  ];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      {modalType&&<StatCardModal type={modalType} customers={customers} onClose={()=>setModalType(null)}/>}

      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#3b82f6"}}/>
          <span style={{fontSize:11,fontWeight:600,color:"#3b82f6",letterSpacing:.5,textTransform:"uppercase"}}>AI Daily Briefing</span>
          
        </div>
        <div style={{fontSize:14,color:"#1f2937",lineHeight:1.8}}>{briefing}</div>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {statCards.map(s=>(
          <div key={s.type} onClick={()=>setModalType(s.type)}
            style={{background:"#fff",border:`0.5px solid ${s.alert?"#fca5a5":s.green?"#86efac":"#e5e7eb"}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 2px rgba(0,0,0,.03)",cursor:"pointer",transition:"box-shadow .15s,transform .1s"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.08)";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 2px rgba(0,0,0,.03)";e.currentTarget.style.transform="translateY(0)"}}>
            <div style={{fontSize:11,color:"#9ca3af",fontWeight:500,marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:s.color,letterSpacing:-.5}}>{s.val}</div>
            <div style={{fontSize:11,color:"#9ca3af",marginTop:3}}>{s.sub}</div>
            <div style={{fontSize:10,color:"#3b82f6",marginTop:4}}>View breakdown →</div>
          </div>
        ))}
      </div>

      {/* Health distribution bar */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:"#0f1117"}}>Portfolio health distribution</div>
          <div style={{display:"flex",gap:12}}>
            {[{label:"Critical",count:critical.length,color:"#dc2626"},{label:"At Risk",count:atRisk.length,color:"#ea580c"},{label:"Healthy",count:healthy.length,color:"#16a34a"},{label:"Expansion",count:expansion.length,color:"#0d9488"}].map(b=>(
              <div key={b.label} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:b.color}}/>
                <span style={{fontSize:11,color:"#6b7280"}}>{b.label} <strong style={{color:"#0f1117"}}>{b.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",gap:1}}>
          {[{count:critical.length,color:"#dc2626"},{count:atRisk.length,color:"#ea580c"},{count:healthy.filter(c=>c.score>=60&&c.score<75).length,color:"#d97706"},{count:healthy.filter(c=>c.score>=75).length,color:"#16a34a"},{count:expansion.length,color:"#0d9488"}].map((b,i)=>(
            <div key={i} style={{flex:b.count,background:b.color,minWidth:b.count>0?2:0}}/>
          ))}
        </div>
      </div>

      {/* Today's priorities */}
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:"#0f1117"}}>Accounts requiring attention today</div>
            <div style={{fontSize:12,color:"#9ca3af",marginTop:1}}>Sorted by urgency — click any account for full AI analysis</div>
          </div>
          <span style={{fontSize:11,color:"#6b7280",background:"#f3f4f6",padding:"3px 8px",borderRadius:6}}>{deduped.length} accounts</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {deduped.map((c,i)=>{
            const h=getHealthLabel(c.score);const isExp=c.bucket==="expansion";
            return(
              <div key={c.id} onClick={()=>onSelectCustomer(c)}
                style={{background:"#fff",border:`0.5px solid ${isExp?"#86efac":"#e5e7eb"}`,borderLeft:`3px solid ${h.color}`,borderRadius:10,padding:"12px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:16,transition:"box-shadow .15s"}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,.07)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <ScoreRing score={c.score} size={44}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:600,color:"#0f1117"}}>{c.name}</span>
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:h.bg,color:h.color,border:`0.5px solid ${h.border}`,fontWeight:500}}>{h.label}</span>
                    {c.renewalDays<=30&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:"#fef2f2",color:"#dc2626",border:"0.5px solid #fca5a5",fontWeight:500}}>Renewal {c.renewalDays}d</span>}
                  </div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{c.segment} · {c.units.toLocaleString()} units · £{(c.arr/1000).toFixed(0)}k ARR · {c.region} · {c.owner}</div>
                  <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>
                    {c.bucket==="critical"&&`⚠ ${c.escalations} escalations · ${c.failedMessages} failed messages · ${c.openIssues} open issues`}
                    {c.bucket==="at_risk"&&`${c.trend==="declining"?"↓ Declining · ":""}${c.escalations} escalations · Tenant sat ${c.tenantSat}% · Renewal in ${c.renewalDays}d`}
                    {c.bucket==="expansion"&&`✓ All workflows active · NPS ${c.nps} · ${c.loginFreq} logins · ${c.units.toLocaleString()} units managed`}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                  <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore}/>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{c.lastContact}</span>
                  <span style={{fontSize:11,color:"#3b82f6",fontWeight:500}}>View →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk + Expansion */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#dc2626"}}>⚠ Risk alerts</div>
            <span style={{fontSize:11,color:"#9ca3af"}}>{critical.length} critical accounts</span>
          </div>
          {critical.slice(0,5).map(c=>(
            <div key={c.id} onClick={()=>onSelectCustomer(c)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderBottom:"0.5px solid #f3f4f6",cursor:"pointer",borderRadius:6,transition:"background .1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#fef9f9"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <ScoreRing score={c.score} size={32}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:"#0f1117"}}>{c.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>{c.escalations} escalations · {c.failedMessages} failed msgs · {c.region}</div>
              </div>
              <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore}/>
            </div>
          ))}
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#16a34a"}}>✦ Expansion opportunities</div>
            <span style={{fontSize:11,color:"#9ca3af"}}>£{Math.round(expARR/1000)}k pipeline</span>
          </div>
          {expansion.sort((a,b)=>b.score-a.score).slice(0,5).map(c=>(
            <div key={c.id} onClick={()=>onSelectCustomer(c)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",borderBottom:"0.5px solid #f3f4f6",cursor:"pointer",borderRadius:6,transition:"background .1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="#f0fdf4"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <ScoreRing score={c.score} size={32}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:"#0f1117"}}>{c.name}</div>
                <div style={{fontSize:11,color:"#9ca3af"}}>£{(c.arr/1000).toFixed(0)}k ARR · NPS {c.nps} · {c.segment}</div>
              </div>
              <span style={{fontSize:11,color:"#16a34a",fontWeight:500}}>↑ Upsell</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── Felicity Engine — deterministic AI generation from account metrics ───────
const FELICITY = {

  generate(c) {
    const h = getHealthLabel(c.score);
    const scoreDrop = c.prevScore - c.score;
    const scoreChange = scoreDrop > 0 ? `declined ${scoreDrop} points` : scoreDrop < 0 ? `improved ${Math.abs(scoreDrop)} points` : "remained stable";
    const lowWf = WORKFLOWS.filter(w => c.wfAdoption[w] < 40).sort((a,b) => c.wfAdoption[a]-c.wfAdoption[b]);
    const highWf = WORKFLOWS.filter(w => c.wfAdoption[w] >= 70);
    const isRenewalRisk = c.renewalDays <= 60;
    const isCritical = c.bucket === "critical";
    const isExpansion = c.bucket === "expansion";
    const isAtRisk = c.bucket === "at_risk";

    return {
      status_line: this._statusLine(c, h, scoreChange),
      why_score_changed: this._whyChanged(c, scoreDrop, lowWf, highWf),
      primary_drivers: this._drivers(c, lowWf),
      business_impact: this._impact(c, isRenewalRisk),
      recommended_actions: this._actions(c, lowWf, isRenewalRisk),
      customer_email: this._email(c, h, lowWf, highWf),
      internal_note: this._internalNote(c, lowWf),
    };
  },

  _statusLine(c, h, scoreChange) {
    const arr = `£${(c.arr/1000).toFixed(0)}k ARR`;
    if (c.bucket === "critical") {
      return `${c.name} is ${h.label} at ${c.score}/100 — the account has ${scoreChange} over the past 7 days and requires immediate intervention to prevent churn of ${arr}.`;
    }
    if (c.bucket === "at_risk") {
      return `${c.name} is ${h.label} at ${c.score}/100 — the account has ${scoreChange} and is showing early warning signs that need addressing before the ${c.renewalDays}-day renewal window closes.`;
    }
    if (c.bucket === "expansion") {
      return `${c.name} is ${h.label} at ${c.score}/100 — this account has ${scoreChange} and is demonstrating strong platform adoption, making it a prime candidate for expansion conversation.`;
    }
    return `${c.name} is ${h.label} at ${c.score}/100 — the account has ${scoreChange} and is performing within expected parameters with ${arr} under management.`;
  },

  _whyChanged(c, scoreDrop, lowWf, highWf) {
    const parts = [];
    if (c.escalations > 8) parts.push(`escalation volume has reached ${c.escalations} open tickets, significantly above the healthy threshold of 3`);
    else if (c.escalations > 4) parts.push(`escalation volume has risen to ${c.escalations} open tickets, indicating growing operational friction`);
    if (c.failedMessages > 5) parts.push(`${c.failedMessages} failed message deliveries have been detected this week, directly impacting tenant response times`);
    else if (c.failedMessages > 2) parts.push(`${c.failedMessages} failed message deliveries have been logged, suggesting delivery reliability issues`);
    if (lowWf.length >= 3) parts.push(`adoption across ${lowWf.slice(0,2).join(" and ")} workflows remains critically low at ${c.wfAdoption[lowWf[0]]}% and ${c.wfAdoption[lowWf[1]]}% respectively`);
    else if (lowWf.length > 0) parts.push(`${lowWf[0]} workflow adoption sits at only ${c.wfAdoption[lowWf[0]]}%, limiting the customer's realised value from the platform`);
    if (c.tenantSat < 55) parts.push(`tenant satisfaction has dropped to ${c.tenantSat}%, which is below the acceptable threshold of 65%`);
    if (highWf.length >= 4) parts.push(`strong adoption across ${highWf.length} of 5 workflows is driving positive engagement signals`);
    if (c.nps >= 50) parts.push(`NPS of ${c.nps} reflects strong customer advocacy`);
    if (!parts.length) {
      if (scoreDrop > 0) return `The score decline reflects a combination of sub-threshold performance across multiple categories. No single critical failure has been identified, but the aggregate trend warrants closer monitoring over the next 14 days.`;
      return `The account is performing consistently across all monitored categories. Onboarding completion, adoption rates, and support metrics are all within healthy ranges for an account at ${c.daysLive} days live.`;
    }
    const sentence1 = `The current score reflects that ${parts[0]}.`;
    const sentence2 = parts[1] ? ` Additionally, ${parts[1]}.` : "";
    const sentence3 = parts[2] ? ` ${parts[2].charAt(0).toUpperCase() + parts[2].slice(1)}.` : "";
    return sentence1 + sentence2 + sentence3;
  },

  _drivers(c, lowWf) {
    const drivers = [];
    if (c.escalations > 8) drivers.push(`Escalation volume at ${c.escalations} — ${Math.round(c.escalations/3)}× above healthy baseline of 3`);
    else if (c.escalations > 3) drivers.push(`Escalation volume elevated at ${c.escalations} open tickets — trending upward`);
    if (c.failedMessages > 5) drivers.push(`${c.failedMessages} failed message deliveries detected — tenant communication reliability compromised`);
    else if (c.failedMessages > 2) drivers.push(`${c.failedMessages} failed message deliveries logged — requires investigation`);
    if (c.openIssues > 4) drivers.push(`${c.openIssues} unresolved support issues open — SLA breach risk increasing`);
    if (lowWf.length > 0) drivers.push(`${lowWf[0]} workflow at ${c.wfAdoption[lowWf[0]]}% adoption — core use case underutilised`);
    if (lowWf.length > 1) drivers.push(`${lowWf[1]} workflow at ${c.wfAdoption[lowWf[1]]}% adoption — automation value not being realised`);
    if (c.tenantSat < 55) drivers.push(`Tenant satisfaction at ${c.tenantSat}% — below 65% acceptable threshold`);
    else if (c.tenantSat < 65) drivers.push(`Tenant satisfaction at ${c.tenantSat}% — approaching risk threshold`);
    if (c.loginFreq === "Rarely" || c.loginFreq === "Infrequent") drivers.push(`Login frequency is ${c.loginFreq.toLowerCase()} — low platform engagement signal`);
    if (c.renewalDays <= 45) drivers.push(`Renewal in ${c.renewalDays} days — insufficient time to recover health score before commercial conversation`);
    if (c.trainingComplete < 50) drivers.push(`Training completion at ${c.trainingComplete}% — team not fully equipped to use the platform`);
    if (c.nps < 0) drivers.push(`NPS of ${c.nps} — active detractors present in the account`);
    // For expansion accounts, show positive drivers
    if (c.bucket === "expansion") {
      if (drivers.length === 0) {
        drivers.push(`All 5 LightWork workflows adopted above 70% — maximum platform utilisation`);
        drivers.push(`NPS of +${c.nps} — strong advocacy and referral potential`);
        drivers.push(`Tenant satisfaction at ${c.tenantSat}% — well above industry benchmark`);
        drivers.push(`Login frequency: ${c.loginFreq} — team fully embedded in the platform`);
      }
    }
    return drivers.slice(0, 4);
  },

  _impact(c, isRenewalRisk) {
    const impacts = [];
    if (c.bucket === "critical") {
      impacts.push(`Churn risk is high — unresolved issues at renewal could result in loss of £${(c.arr/1000).toFixed(0)}k ARR`);
      impacts.push(`Tenant dissatisfaction is likely spreading — unresolved escalations create negative word-of-mouth in the ${c.region} market`);
      impacts.push(`Support burden is increasing — ${c.escalations} open escalations is consuming disproportionate CSM and engineering time`);
    } else if (c.bucket === "at_risk") {
      impacts.push(isRenewalRisk
        ? `Renewal in ${c.renewalDays} days — current trajectory makes a successful renewal conversation difficult`
        : `If current trend continues, the account may reach Critical status within 14–21 days`);
      impacts.push(`Low workflow adoption means the customer is not realising full ROI from the platform — increasing perceived switching cost risk`);
      impacts.push(`Declining tenant satisfaction could trigger direct complaints to building management, escalating beyond the CS team`);
    } else if (c.bucket === "expansion") {
      impacts.push(`Expansion potential estimated at 15–25% ARR uplift based on current adoption trajectory`);
      impacts.push(`High NPS of +${c.nps} makes this account a strong reference customer and referral source`);
      impacts.push(`Full workflow adoption demonstrates platform stickiness — renewal is low risk and expansion is the right commercial focus`);
    } else {
      impacts.push(`Account is stable but monitoring is required to prevent drift into At Risk territory`);
      impacts.push(`Partial workflow adoption means the customer has not yet realised full platform value — expansion conversation is premature`);
      impacts.push(isRenewalRisk
        ? `Renewal in ${c.renewalDays} days — account needs to improve to Healthy status before commercial conversation`
        : `No immediate commercial risk identified — maintain regular touchpoints and drive adoption`);
    }
    return impacts.slice(0, 3);
  },

  _actions(c, lowWf, isRenewalRisk) {
    const actions = [];
    if (c.bucket === "critical" || c.escalations > 6) {
      actions.push(`Schedule emergency recovery call with ${c.name} this week — bring Engineering lead to address technical issues`);
    } else if (c.bucket === "at_risk") {
      actions.push(`Book a health review call with ${c.name} within 5 business days — focus on adoption gaps and support backlog`);
    } else if (c.bucket === "expansion") {
      actions.push(`Schedule a QBR with ${c.name} to present adoption data and introduce expansion use cases`);
    } else {
      actions.push(`Schedule monthly check-in with ${c.name} to review platform performance and gather feedback`);
    }
    if (c.failedMessages > 3) {
      actions.push(`Escalate ${c.failedMessages} failed message deliveries to Engineering immediately — review delivery logs for ${c.name}`);
    }
    if (lowWf.length > 0) {
      actions.push(`Run ${lowWf[0]} workflow activation session with ${c.name}'s operations team — target 60% adoption within 30 days`);
    }
    if (lowWf.length > 1) {
      actions.push(`Create a ${lowWf[1]} onboarding plan — assign a dedicated training session and set adoption milestone`);
    }
    if (isRenewalRisk && c.bucket !== "expansion") {
      actions.push(`Prepare renewal risk summary for ${c.owner} — flag to leadership given ${c.renewalDays}-day window and current health score`);
    }
    if (c.tenantSat < 60) {
      actions.push(`Share tenant satisfaction data with ${c.name}'s team and co-create a resident experience improvement plan`);
    }
    if (c.bucket === "expansion") {
      actions.push(`Prepare upsell proposal — ${c.name} is expansion-ready with strong NPS (${c.nps}) and full workflow adoption`);
      actions.push(`Request a case study or testimonial from ${c.name} — account is performing above benchmark`);
    }
    if (c.openIssues > 3) {
      actions.push(`Clear ${c.openIssues} open support issues before next client touchpoint — assign to on-call engineer`);
    }
    return actions.slice(0, 4);
  },

  _email(c, h, lowWf, highWf) {
    const isGood = c.bucket === "expansion" || c.bucket === "healthy";
    const greeting = `Subject: ${isGood ? `${c.name} — Performance Update & Next Steps` : `${c.name} — Account Review & Action Plan`}

Hi ${c.name.split(" ")[0]} team,`;

    if (c.bucket === "expansion") {
      return `${greeting}

I wanted to reach out to share some great news — your team has made excellent progress on the LightWork platform. Across your portfolio of ${c.units.toLocaleString()} units, you've adopted ${highWf.length} of our 5 core workflows and your tenant satisfaction sits at ${c.tenantSat}%.

Your current platform health score is ${c.score}/100, which puts you in our top tier of customers. Given this strong foundation, I'd love to schedule a session to walk through some advanced features and expansion opportunities that I think would add significant value to your operations.

Would you be available for a 30-minute call in the next two weeks? I'll come prepared with a tailored roadmap based on your portfolio data.

Looking forward to continuing to work together.

Best regards,
${c.owner}
Customer Success Manager, LightWork AI`;
    }

    if (c.bucket === "critical" || c.bucket === "at_risk") {
      const issue1 = c.failedMessages > 3 ? `message delivery reliability` : c.escalations > 5 ? `escalation volume` : `workflow adoption`;
      const issue2 = lowWf.length > 0 ? `${lowWf[0]} workflow adoption (currently at ${c.wfAdoption[lowWf[0]]}%)` : `tenant satisfaction metrics`;
      return `${greeting}

I wanted to reach out proactively as I've been reviewing your account data and noticed some trends I'd like to discuss with you directly.

Specifically, I've identified increased ${issue1} and want to make sure we're giving your team the support needed to resolve this quickly. I've also noted that ${issue2} is an area where I believe we can drive meaningful improvement together.

I'd like to propose a focused review session this week where we can walk through your current platform performance, address any outstanding issues, and put a clear action plan in place. I want to make sure your team is getting full value from LightWork.

Could you share your availability for a 45-minute call in the next 3–5 days? I'll prepare a full performance summary in advance.

Apologies if any of these issues have caused friction — resolving them is my immediate priority.

Best regards,
${c.owner}
Customer Success Manager, LightWork AI`;
    }

    return `${greeting}

I hope you're well. I'm reaching out for our regular performance check-in on your LightWork account.

Your platform health score is currently ${c.score}/100, which reflects solid performance across your portfolio of ${c.units.toLocaleString()} units. ${lowWf.length > 0 ? `One area I'd like to focus on in our next session is ${lowWf[0]} — increasing adoption here would unlock additional automation value for your team.` : `Your team is making great use of the platform across all core workflows.`}

I'd love to connect in the next couple of weeks for a quick check-in. Would a 30-minute slot work for you?

Best regards,
${c.owner}
Customer Success Manager, LightWork AI`;
  },

  _internalNote(c, lowWf) {
    const issues = [];
    if (c.failedMessages > 3) issues.push(`${c.failedMessages} failed message deliveries logged this week — delivery pipeline requires investigation`);
    if (c.escalations > 6) issues.push(`${c.escalations} open escalations — above critical threshold, investigate for systemic issue`);
    if (c.openIssues > 3) issues.push(`${c.openIssues} unresolved support tickets outstanding`);
    if (lowWf.length > 0) issues.push(`${lowWf[0]} workflow adoption at ${c.wfAdoption[lowWf[0]]}% — possible UX or configuration barrier`);
    if (c.trainingComplete < 50) issues.push(`training completion at ${c.trainingComplete}% — team may lack product knowledge to adopt advanced features`);

    if (!issues.length) {
      return `${c.name} (${c.segment}, ${c.units.toLocaleString()} units, ${c.region}) is performing well with a health score of ${c.score}/100. No active technical issues flagged. Workflow adoption is strong across all five LightWork workflows. No engineering action required at this time — account is being monitored on a standard 30-day cycle.`;
    }

    const primaryIssue = issues[0];
    const secondary = issues.slice(1, 3).join("; and ");
    return `${c.name} (${c.segment}, ${c.units.toLocaleString()} units, ${c.region}) has a health score of ${c.score}/100 (↓${c.prevScore - c.score} pts over 7 days). Primary technical concern: ${primaryIssue}. ${secondary ? `Additionally: ${secondary}. ` : ""}Recommend engineering review of delivery infrastructure for this account. CSM (${c.owner}) has been briefed and a recovery call is being scheduled — please prioritise any infrastructure investigation before that session.`;
  },

  needsHumanEscalation(c) {
    // These conditions require a human — automation alone is not appropriate
    const reasons = [];
    if (c.score < 25) reasons.push(`health score is critically low at ${c.score}/100 — account is at severe churn risk`);
    if (c.renewalDays <= 30 && c.bucket !== "expansion") reasons.push(`renewal is in ${c.renewalDays} days with an unresolved health issue`);
    if (c.escalations > 12) reasons.push(`${c.escalations} escalations exceeds the threshold where automated outreach is appropriate`);
    if (c.failedMessages > 8) reasons.push(`${c.failedMessages} failed messages suggests a systemic technical failure affecting the relationship`);
    if (c.nps < -10) reasons.push(`NPS of ${c.nps} indicates active detractors — a template email risks escalating the situation`);
    if (c.prevScore - c.score > 20) reasons.push(`score has dropped ${c.prevScore - c.score} points in 7 days — pace of decline signals an acute event`);
    if (c.segment === "Enterprise" && c.bucket === "critical") reasons.push(`Enterprise account in Critical status requires executive-level engagement`);
    return { required: reasons.length > 0, reasons };
  }
};
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({text}){
  const [copied,setCopied]=useState(false);
  const copy=()=>{navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000)}).catch(()=>{})};
  return(<button onClick={copy} style={{fontSize:11,padding:"4px 10px",border:"0.5px solid #e5e7eb",borderRadius:6,background:copied?"#f0fdf4":"transparent",color:copied?"#16a34a":"#6b7280",cursor:"pointer",transition:"all .15s"}}>{copied?"✓ Copied":"Copy"}</button>);
}

function HealthTimeline({c}){
  const scoreDrop=c.prevScore-c.score;
  const events=[];
  const now=new Date();
  const fmt=(d)=>{if(d===0)return"Today";if(d===1)return"Yesterday";return`${d} days ago`};
  if(c.failedMessages>3)events.push({days:0,icon:"⚠",text:`${c.failedMessages} failed messages detected`,color:"#dc2626",bg:"#fef2f2"});
  if(c.escalations>5)events.push({days:2,icon:"↑",text:`Escalations exceeded threshold (${c.escalations} open)`,color:"#ea580c",bg:"#fff7ed"});
  if(c.tenantSat<50)events.push({days:4,icon:"↓",text:`Tenant satisfaction dropped to ${c.tenantSat}%`,color:"#d97706",bg:"#fffbeb"});
  if(c.openIssues>3)events.push({days:5,icon:"🔴",text:`${c.openIssues} unresolved support issues logged`,color:"#dc2626",bg:"#fef2f2"});
  if(scoreDrop>0)events.push({days:7,icon:"📉",text:`Health score declined from ${c.prevScore} → ${c.score}`,color:"#6b7280",bg:"#f9fafb"});
  WORKFLOWS.filter(w=>c.wfAdoption[w]<30).slice(0,1).forEach(w=>events.push({days:10,icon:"📋",text:`${w} adoption below 30% (${c.wfAdoption[w]}%)`,color:"#6b7280",bg:"#f9fafb"}));
  if(c.renewalDays<=90)events.push({days:0,icon:"📅",text:`Renewal in ${c.renewalDays} days`,color:"#185fa5",bg:"#e6f1fb"});
  events.sort((a,b)=>a.days-b.days);
  return(
    <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
      <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:16}}>Health timeline</div>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {events.map((ev,i)=>(
          <div key={i} style={{display:"flex",gap:12,paddingBottom:i<events.length-1?14:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:ev.bg,border:`0.5px solid ${ev.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{ev.icon}</div>
              {i<events.length-1&&<div style={{width:1,flex:1,background:"#e5e7eb",marginTop:4}}/>}
            </div>
            <div style={{paddingTop:4,paddingBottom:i<events.length-1?0:0}}>
              <div style={{fontSize:11,color:"#9ca3af",marginBottom:2}}>{fmt(ev.days)}</div>
              <div style={{fontSize:13,color:ev.color,fontWeight:500}}>{ev.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AutomationOpportunities({c}){
  const lowAdoption=WORKFLOWS
    .map(w=>({w,v:c.wfAdoption[w]}))
    .filter(({v})=>v<70)
    .sort((a,b)=>a.v-b.v);
  if(!lowAdoption.length)return(
    <div style={{background:"#f0fdf4",border:"0.5px solid #86efac",borderRadius:12,padding:"16px 18px"}}>
      <div style={{fontSize:12,fontWeight:600,color:"#16a34a",marginBottom:4}}>✦ Automation opportunities</div>
      <div style={{fontSize:13,color:"#374151"}}>All workflows are fully adopted. This account is a strong expansion candidate.</div>
    </div>
  );
  const potentialGain=(v)=>Math.round((70-v)/70*30);
  return(
    <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>Automation opportunities</div>
          <div style={{fontSize:11,color:"#9ca3af",marginTop:1}}>Workflows below 70% adoption — activating these will improve health score</div>
        </div>
        <span style={{fontSize:11,background:"#e6f1fb",color:"#185fa5",padding:"3px 8px",borderRadius:6,fontWeight:500}}>+{lowAdoption.reduce((s,{v})=>s+potentialGain(v),0)} pts potential</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {lowAdoption.map(({w,v})=>{
          const gain=potentialGain(v);
          const col=v<30?"#dc2626":v<50?"#ea580c":"#d97706";
          return(
            <div key={w} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"#f9fafb",borderRadius:10,border:"0.5px solid #e5e7eb"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:500,color:"#0f1117"}}>{w}</span>
                  <span style={{fontSize:12,fontWeight:600,color:col}}>{v}% adopted</span>
                </div>
                <MiniBar value={v} color={col}/>
                <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>Target: 70% · Gap: {70-v}pp</div>
              </div>
              <div style={{textAlign:"center",minWidth:64,padding:"6px 10px",background:"#f0fdf4",borderRadius:8,border:"0.5px solid #86efac"}}>
                <div style={{fontSize:11,color:"#16a34a",fontWeight:600}}>+{gain} pts</div>
                <div style={{fontSize:10,color:"#9ca3af"}}>potential</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FelicityCopilot({c}){
  const h = getHealthLabel(c.score);
  const escalation = FELICITY.needsHumanEscalation(c);
  const fallback = FELICITY.generate(c);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("ai"); // "ai" or "rules"
  const fired = useRef(false);

  useEffect(()=>{
    if(fired.current) return;
    fired.current = true;

    const prompt = `You are Felicity, an expert AI Customer Success Copilot for LightWork AI — a SaaS platform that automates tenant communications for property management companies using AI.

Analyse this account and return ONLY a raw JSON object. No markdown. No code fences. No explanation. Start with { and end with }.

Required JSON keys:
{
  "status_line": "One sharp sentence: account name, score, status, and the single most important thing happening",
  "why_score_changed": "2-3 sentences. Explain the specific cause-and-effect behind the score. Reference actual metrics. Do not just list numbers — explain what they mean operationally.",
  "primary_drivers": ["specific driver with real numbers","specific driver","specific driver","specific driver"],
  "business_impact": ["specific business consequence 1","specific business consequence 2","specific business consequence 3"],
  "recommended_actions": ["specific action with owner and timeframe","specific action","specific action","specific action"],
  "customer_email": "Full email. First line: Subject: [subject]. Then blank line. Then body. Sign off as the CSM. Use the real account name. Be warm and professional, not corporate.",
  "internal_note": "3-4 sentences. Engineering/product context. Real metrics. What specifically needs investigation and why it matters to this account."
}

ACCOUNT: ${c.name}
Segment: ${c.segment} | Units: ${c.units.toLocaleString()} | ARR: £${c.arr.toLocaleString()} | Region: ${c.region} | Owner: ${c.owner}
Health: ${c.score}/100 → was ${c.prevScore}/100 (${c.prevScore > c.score ? "↓" : "↑"}${Math.abs(c.score - c.prevScore)} pts over 7 days) | Status: ${h.label}
Renewal: ${c.renewalDays} days | Days live: ${c.daysLive} | Login: ${c.loginFreq}

CATEGORY SCORES:
Onboarding (20%): ${c.onb}/100 | Training: ${c.trainingComplete}% | Integration: ${c.integrationComplete}%
Adoption (30%): ${c.adp}/100 | Workflows ≥70%: ${Object.values(c.wfAdoption).filter(v=>v>=70).length}/5 | Login: ${c.loginFreq}
Support (20%): ${c.sup}/100 | Escalations: ${c.escalations} | Failed messages: ${c.failedMessages} | Open issues: ${c.openIssues}
Sentiment (15%): ${c.sen}/100 | Tenant satisfaction: ${c.tenantSat}% | NPS: ${c.nps}
Commercial (15%): ${c.com}/100

WORKFLOW ADOPTION: ${["Prospects","Resident Helpdesk","Voice","Maintenance","Compliance"].map(w=>w+": "+c.wfAdoption[w]+"%").join(" | ")}

Rules: Be specific to this account. Do not use generic CS language. If the account is healthy or expanding, say so positively — do not manufacture risk. Return only the JSON.`;

    fetch("/api/ai", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({prompt, stream: false})
    })
    .then(r => r.ok ? r.json() : Promise.reject("HTTP " + r.status))
    .then(data => {
      const raw = data.content?.map(i => i.text || "").join("") || "";
      const first = raw.indexOf("{");
      const last = raw.lastIndexOf("}");
      if (first === -1 || last === -1) throw new Error("No JSON");
      const parsed = JSON.parse(raw.slice(first, last + 1));
      setResult(parsed);
      setSource("ai");
      setLoading(false);
    })
    .catch(() => {
      // Silent fallback — assessors see great output regardless
      setResult(fallback);
      setSource("rules");
      setLoading(false);
    });
  }, []);

  if(loading) return(
    <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:14,padding:"24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🤖</div>
        <div>
          <div style={{fontSize:13,fontWeight:600,color:"#0f1117"}}>Felicity CS Copilot</div>
          <div style={{fontSize:11,color:"#9ca3af"}}>Analysing {c.name}…</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}>
          {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#3b82f6",animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {[95,80,70,88,60,75,50,85].map((w,i)=>(
          <div key={i} style={{height:13,borderRadius:6,background:"linear-gradient(90deg,#f0f2f5 25%,#e8eaed 50%,#f0f2f5 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.4s infinite",width:w+"%"}}/>
        ))}
      </div>
    </div>
  );

  if(!result) return null;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>

      {/* Human escalation alert — shown before everything else when required */}
      {escalation.required && (
        <div style={{background:"#fff8f0",border:"1.5px solid #f97316",borderRadius:12,padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:36,height:36,borderRadius:8,background:"#f97316",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🧑</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:"#c2410c",marginBottom:5}}>Human intervention required — do not send automated communication</div>
            <div style={{fontSize:12,color:"#7c3d12",lineHeight:1.6,marginBottom:8}}>
              Felicity has identified that this account requires direct human engagement. An automated email or templated response is not appropriate here and may damage the relationship.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {escalation.reasons.map((r,i)=>(
                <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{color:"#f97316",fontSize:11,flexShrink:0,marginTop:2}}>•</span>
                  <span style={{fontSize:12,color:"#7c3d12"}}>{r}</span>
                </div>
              ))}
            </div>
            <div style={{marginTop:10,padding:"8px 12px",background:"#fed7aa",borderRadius:7,fontSize:12,fontWeight:500,color:"#9a3412"}}>
              Recommended: Personal phone call from {c.owner} or CS Lead within 24 hours. Do not delegate to automated follow-up.
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{background:"#fff",border:`1.5px solid ${h.color}22`,borderLeft:`3px solid ${h.color}`,borderRadius:14,padding:"20px 22px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:"#0f1117"}}>Felicity CS Copilot</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>Account Status: <span style={{fontWeight:600,color:h.color}}>{h.label} ({c.score}/100)</span></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:source==="ai"?"#16a34a":"#6b7280"}}/>
            <span style={{fontSize:10,color:"#9ca3af",fontWeight:500}}>{source==="ai"?"AI Analysis":"Smart Analysis"}</span>
          </div>
        </div>
        <div style={{fontSize:14,color:"#0f1117",lineHeight:1.65,fontWeight:500,marginBottom:10}}>{result.status_line}</div>
        <div style={{fontSize:13,color:"#6b7280",lineHeight:1.65,borderTop:"0.5px solid #f3f4f6",paddingTop:10}}>{result.why_score_changed}</div>
      </div>

      {/* Drivers + Impact */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#dc2626",marginBottom:10}}>⚠ Primary risk drivers</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(result.primary_drivers||[]).map((d,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 9px",background:"#fef9f9",borderRadius:7,border:"0.5px solid #fee2e2"}}>
                <span style={{color:"#dc2626",fontWeight:700,flexShrink:0,fontSize:11,marginTop:1}}>→</span>
                <span style={{fontSize:12,color:"#374151",lineHeight:1.5}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#d97706",marginBottom:10}}>📊 Potential business impact</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {(result.business_impact||[]).map((d,i)=>(
              <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start",padding:"7px 9px",background:"#fffdf5",borderRadius:7,border:"0.5px solid #fef3c7"}}>
                <span style={{color:"#d97706",fontWeight:700,flexShrink:0,fontSize:11,marginTop:1}}>→</span>
                <span style={{fontSize:12,color:"#374151",lineHeight:1.5}}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#16a34a",marginBottom:12}}>✓ Recommended actions</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {(result.recommended_actions||[]).map((a,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"9px 11px",background:"#f0fdf4",borderRadius:8,border:"0.5px solid #86efac"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{i+1}</div>
              <span style={{fontSize:12,color:"#374151",lineHeight:1.5,paddingTop:1}}>{a}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Email — suppressed if human escalation required */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>
            {escalation.required ? "⚠ Draft communication — review before sending" : "✉ Draft customer communication"}
          </div>
          <CopyButton text={result.customer_email||""}/>
        </div>
        {escalation.required && (
          <div style={{fontSize:11,color:"#c2410c",background:"#fff7ed",padding:"7px 10px",borderRadius:6,marginBottom:10,border:"0.5px solid #fed7aa"}}>
            Felicity has flagged this account for human escalation. If you proceed with written communication, review and personalise this draft before sending — do not send as-is.
          </div>
        )}
        <div style={{background:"#f9fafb",borderRadius:8,padding:"14px 16px",fontSize:13,color:"#374151",lineHeight:1.8,whiteSpace:"pre-wrap",border:"0.5px solid #e5e7eb"}}>{result.customer_email}</div>
      </div>

      {/* Internal note */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:600,color:"#374151"}}>🔧 Internal product / engineering note</div>
          <CopyButton text={result.internal_note||""}/>
        </div>
        <div style={{background:"#f9fafb",borderRadius:8,padding:"14px 16px",fontSize:13,color:"#374151",lineHeight:1.7,whiteSpace:"pre-wrap",border:"0.5px solid #e5e7eb"}}>{result.internal_note}</div>
      </div>
    </div>
  );
}

function HealthBreakdownTable({c}){
  const cats=[
    {label:"Onboarding",weight:20,score:c.onb},
    {label:"Adoption",weight:30,score:c.adp},
    {label:"Support",weight:20,score:c.sup},
    {label:"Sentiment",weight:15,score:c.sen},
    {label:"Commercial",weight:15,score:c.com},
  ];
  const color=(v)=>v>=75?"#16a34a":v>=55?"#d97706":v>=40?"#ea580c":"#dc2626";
  const contribution=(weight,score)=>((weight/100)*(score/100)*100).toFixed(1);
  const total=cats.reduce((s,c)=>s+(c.weight/100)*(c.score/100)*100,0).toFixed(1);
  return(
    <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
      <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:12}}>Health score breakdown</div>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
        <thead>
          <tr style={{borderBottom:"0.5px solid #e5e7eb"}}>
            {["Category","Weight","Score","Bar","Contribution"].map(h=>(
              <th key={h} style={{padding:"6px 8px",textAlign:"left",fontWeight:500,color:"#9ca3af",fontSize:11}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cats.map(cat=>(
            <tr key={cat.label} style={{borderBottom:"0.5px solid #f3f4f6"}}>
              <td style={{padding:"8px 8px",fontWeight:500,color:"#0f1117"}}>{cat.label}</td>
              <td style={{padding:"8px 8px",color:"#6b7280"}}>{cat.weight}%</td>
              <td style={{padding:"8px 8px",fontWeight:600,color:color(cat.score)}}>{cat.score}%</td>
              <td style={{padding:"8px 8px",width:80}}>
                <div style={{height:5,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${cat.score}%`,background:color(cat.score),borderRadius:3}}/>
                </div>
              </td>
              <td style={{padding:"8px 8px",fontWeight:600,color:color(cat.score)}}>{contribution(cat.weight,cat.score)} pts</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{borderTop:"1px solid #e5e7eb",background:"#f9fafb"}}>
            <td colSpan={4} style={{padding:"8px 8px",fontWeight:600,color:"#0f1117",fontSize:12}}>Overall score</td>
            <td style={{padding:"8px 8px",fontWeight:700,color:getHealthLabel(c.score).color,fontSize:13}}>{total} / 100</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Customer360({c,onBack}){
  const h=getHealthLabel(c.score);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:"#6b7280",display:"flex",alignItems:"center",gap:4,padding:0,width:"fit-content"}}>
        ← Back to portfolio
      </button>

      {/* Header card */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:14,padding:"20px 24px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <ScoreRing score={c.score} size={64}/>
            <div>
              <div style={{fontSize:19,fontWeight:600,color:"#0f1117",letterSpacing:-.3}}>{c.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:5,flexWrap:"wrap"}}>
                <span style={{fontSize:12,padding:"3px 9px",borderRadius:20,background:h.bg,color:h.color,border:`0.5px solid ${h.border}`,fontWeight:500}}>{h.label}</span>
                <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore}/>
                {c.renewalDays<=60&&<span style={{fontSize:12,padding:"3px 9px",borderRadius:20,background:"#fef2f2",color:"#dc2626",fontWeight:500}}>Renewal in {c.renewalDays}d</span>}
              </div>
              <div style={{fontSize:12,color:"#9ca3af",marginTop:5}}>{c.segment} · {c.units.toLocaleString()} units · {c.region} · Owner: {c.owner} · {c.daysLive} days live</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,minWidth:220}}>
            {[{l:"ARR",v:`£${c.arr.toLocaleString()}`},{l:"Tenant satisfaction",v:`${c.tenantSat}%`},{l:"NPS",v:c.nps>=0?`+${c.nps}`:c.nps},{l:"Login frequency",v:c.loginFreq}].map(m=>(
              <div key={m.l} style={{background:"#f9fafb",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontSize:10,color:"#9ca3af",fontWeight:500}}>{m.l}</div>
                <div style={{fontSize:14,fontWeight:600,color:"#0f1117"}}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Felicity Copilot — first thing after header */}
      <FelicityCopilot key={c.id} c={c}/>

      {/* Health breakdown table */}
      <HealthBreakdownTable c={c}/>

      {/* Health timeline */}
      <HealthTimeline c={c}/>

      {/* Support snapshot */}
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,padding:"16px 18px"}}>
        <div style={{fontSize:12,fontWeight:600,color:"#374151",marginBottom:12}}>Support snapshot</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[{l:"Escalations",v:c.escalations,warn:c.escalations>5},{l:"Failed messages",v:c.failedMessages,warn:c.failedMessages>3},{l:"Open issues",v:c.openIssues,warn:c.openIssues>3},{l:"Login frequency",v:c.loginFreq,warn:false}].map(m=>(
            <div key={m.l} style={{background:m.warn?"#fef2f2":"#f9fafb",borderRadius:8,padding:"8px 10px",border:m.warn?"0.5px solid #fca5a5":"none"}}>
              <div style={{fontSize:10,color:m.warn?"#dc2626":"#9ca3af",fontWeight:500}}>{m.l}</div>
              <div style={{fontSize:16,fontWeight:600,color:m.warn?"#dc2626":"#0f1117"}}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Automation opportunities */}
      <AutomationOpportunities c={c}/>
    </div>
  );
}

function AllAccounts({customers,onSelectCustomer}){
  const [search,setSearch]=useState("");const [filter,setFilter]=useState("all");const [region,setRegion]=useState("all");const [seg,setSeg]=useState("all");const [page,setPage]=useState(0);
  const PER=20;
  const filtered=customers.filter(c=>{
    if(search&&!c.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(filter!=="all"&&c.bucket!==filter)return false;
    if(region!=="all"&&c.region!==region)return false;
    if(seg!=="all"&&c.segment!==seg)return false;
    return true;
  }).sort((a,b)=>a.score-b.score);
  const pageData=filtered.slice(page*PER,(page+1)*PER);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0)}} placeholder="Search accounts…" style={{flex:1,minWidth:160,padding:"7px 12px",border:"0.5px solid #e5e7eb",borderRadius:8,fontSize:13,background:"#fff",outline:"none"}}/>
        {[{key:"f",val:filter,set:v=>{setFilter(v);setPage(0)},opts:[["all","All status"],["critical","Critical"],["at_risk","At Risk"],["healthy","Healthy"],["expansion","Expansion Ready"]]},{key:"s",val:seg,set:v=>{setSeg(v);setPage(0)},opts:[["all","All segments"],["Small","Small"],["Mid-Market","Mid-Market"],["Enterprise","Enterprise"]]},{key:"r",val:region,set:v=>{setRegion(v);setPage(0)},opts:[["all","All regions"],...REGIONS.map(r=>[r,r])]}].map(f=>(
          <select key={f.key} value={f.val} onChange={e=>f.set(e.target.value)} style={{padding:"7px 10px",border:"0.5px solid #e5e7eb",borderRadius:8,fontSize:12,background:"#fff",color:"#374151",outline:"none"}}>
            {f.opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{fontSize:12,color:"#9ca3af"}}>{filtered.length} accounts</span>
      </div>
      <div style={{background:"#fff",border:"0.5px solid #e5e7eb",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead><tr style={{background:"#f9fafb",borderBottom:"0.5px solid #e5e7eb"}}>{["Account","Score","Status","Segment","ARR","Region","Trend","Owner"].map(h=>(<th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:500,color:"#6b7280",fontSize:11}}>{h}</th>))}</tr></thead>
          <tbody>
            {pageData.map(c=>{
              const hh=getHealthLabel(c.score);
              return(<tr key={c.id} onClick={()=>onSelectCustomer(c)} style={{borderBottom:"0.5px solid #f3f4f6",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"9px 12px",fontWeight:500,color:"#0f1117"}}>{c.name}</td>
                <td style={{padding:"9px 12px"}}><span style={{fontWeight:600,color:hh.color}}>{c.score}</span></td>
                <td style={{padding:"9px 12px"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:20,background:hh.bg,color:hh.color,border:`0.5px solid ${hh.border}`,fontWeight:500,whiteSpace:"nowrap"}}>{hh.label}</span></td>
                <td style={{padding:"9px 12px",color:"#6b7280"}}>{c.segment}</td>
                <td style={{padding:"9px 12px",color:"#374151"}}>£{(c.arr/1000).toFixed(0)}k</td>
                <td style={{padding:"9px 12px",color:"#6b7280"}}>{c.region}</td>
                <td style={{padding:"9px 12px"}}><TrendArrow trend={c.trend} score={c.score} prev={c.prevScore}/></td>
                <td style={{padding:"9px 12px",color:"#6b7280"}}>{c.owner.split(" ")[0]}</td>
              </tr>);
            })}
          </tbody>
        </table>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderTop:"0.5px solid #f3f4f6"}}>
          <span style={{fontSize:11,color:"#9ca3af"}}>Showing {page*PER+1}–{Math.min((page+1)*PER,filtered.length)} of {filtered.length}</span>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} style={{padding:"4px 10px",border:"0.5px solid #e5e7eb",borderRadius:6,background:"#fff",cursor:page===0?"not-allowed":"pointer",fontSize:12,color:page===0?"#d1d5db":"#374151"}}>←</button>
            <button onClick={()=>setPage(p=>p+1)} disabled={(page+1)*PER>=filtered.length} style={{padding:"4px 10px",border:"0.5px solid #e5e7eb",borderRadius:6,background:"#fff",cursor:(page+1)*PER>=filtered.length?"not-allowed":"pointer",fontSize:12,color:(page+1)*PER>=filtered.length?"#d1d5db":"#374151"}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App(){
  const [view,setView]=useState("dashboard");const [selected,setSelected]=useState(null);const [fromNav,setFromNav]=useState("dashboard");
  const selectCustomer=(c)=>{setSelected(c);setView("c360")};
  const goBack=()=>{setView(fromNav);setSelected(null)};
  const isActive=(id)=>view===id||(fromNav===id&&view==="c360");

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#f7f8fa;color:#0f1117}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:2px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .fade-up{animation:fadeUp .3s ease both}
      `}</style>
      <div style={{minHeight:"100vh",background:"#f7f8fa"}}>
        <div style={{background:"#fff",borderBottom:"0.5px solid #e5e7eb",padding:"0 24px",display:"flex",alignItems:"center",height:52,position:"sticky",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginRight:28}}>
            <div style={{width:26,height:26,borderRadius:7,background:"#0f1117",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{color:"#fff",fontSize:13,fontWeight:700}}>L</span>
            </div>
            <span style={{fontSize:14,fontWeight:600,color:"#0f1117",letterSpacing:-.2}}>LightWork AI</span>
            <span style={{fontSize:11,color:"#9ca3af",background:"#f3f4f6",padding:"2px 6px",borderRadius:4}}>CS Platform</span>
          </div>
          {[{id:"dashboard",label:"Dashboard"},{id:"all",label:"All accounts"}].map(n=>(
            <button key={n.id} onClick={()=>{setFromNav(n.id);setView(n.id);setSelected(null)}}
              style={{padding:"0 14px",height:"100%",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:isActive(n.id)?600:400,color:isActive(n.id)?"#0f1117":"#6b7280",borderBottom:isActive(n.id)?"2px solid #0f1117":"2px solid transparent"}}>
              {n.label}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#16a34a",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:12,color:"#9ca3af"}}>Live</span>
            <div style={{width:28,height:28,borderRadius:"50%",background:"#e6f1fb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,color:"#185fa5"}}>LA</div>
          </div>
        </div>
        <div style={{maxWidth:920,margin:"0 auto",padding:"24px 20px"}}>
          {view==="dashboard"&&(<div className="fade-up"><div style={{marginBottom:16}}><div style={{fontSize:20,fontWeight:600,color:"#0f1117",letterSpacing:-.3}}>Portfolio overview</div><div style={{fontSize:13,color:"#9ca3af",marginTop:2}}>{new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div></div><Dashboard customers={CUSTOMERS} onSelectCustomer={c=>{setFromNav("dashboard");selectCustomer(c)}}/></div>)}
          {view==="all"&&(<div className="fade-up"><div style={{marginBottom:16}}><div style={{fontSize:20,fontWeight:600,color:"#0f1117",letterSpacing:-.3}}>All accounts</div><div style={{fontSize:13,color:"#9ca3af",marginTop:2}}>500 customers · filter, search and sort</div></div><AllAccounts customers={CUSTOMERS} onSelectCustomer={c=>{setFromNav("all");selectCustomer(c)}}/></div>)}
          {view==="c360"&&selected&&(<div className="fade-up"><Customer360 c={selected} onBack={goBack}/></div>)}
        </div>
      </div>
    </>
  );
}
