import { useState, useEffect, useRef } from "react";

const REGIONS = ["London","South East","North West","Midlands","South West","Yorkshire","Scotland","North East"];
const OWNERS = ["Lola Amidu","Marcus Reid","Sophie Chen","James Okafor","Priya Sharma"];
const WORKFLOWS = ["Prospects","Resident Helpdesk","Voice","Maintenance","Compliance"];

const NAME_PARTS = {
  adj:["Hargreaves","Prime","Urban","Metropolitan","Oakwood","Kingsbridge","CityLiving","North London","Meridian","Apex","Elmwood","Riverbank","Crown","Regent","Heritage","Landmark","Sterling","Capital","Prestige","Brunswick","Windsor","Clifton","Montrose","Berkeley","Holborn","Canary","Southside","Northgate","Westfield","Eastbrook","Highbury","Chelsea","Mayfair","Soho","Camden","Brixton","Hackney","Islington","Shoreditch","Bermondsey","Battersea","Clapham","Fulham","Richmond","Wimbledon","Hammersmith","Ealing","Acton","Wembley","Stratford"],
  noun:["Residential","Lettings","Property Group","Living","Estates","Property Management","Homes","Realty","Properties","Asset Management","Land","Build to Rent","Developments","Block Management","Housing","Spaces","Quarters","Place","Collective","Partners"]
};

function rng(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function genName(r, used = new Set()) {
  const a = NAME_PARTS.adj[Math.floor(r() * NAME_PARTS.adj.length)];
  const n = NAME_PARTS.noun[Math.floor(r() * NAME_PARTS.noun.length)];
  const name = `${a} ${n}`;
  return used.has(name) ? genName(r, used) : name;
}

function genCustomers() {
  const rand = rng(42);
  const customers = [];
  const used = new Set();
  const segments = [
    { type: "Small", units: [100, 500], arr: [8000, 25000], count: 200 },
    { type: "Mid-Market", units: [500, 5000], arr: [25000, 80000], count: 220 },
    { type: "Enterprise", units: [5000, 20000], arr: [80000, 200000], count: 80 }
  ];
  const healthBuckets = [];
  for (let i = 0; i < 25; i++) healthBuckets.push("critical");
  for (let i = 0; i < 75; i++) healthBuckets.push("at_risk");
  for (let i = 0; i < 275; i++) healthBuckets.push("healthy");
  for (let i = 0; i < 125; i++) healthBuckets.push("expansion");
  for (let i = healthBuckets.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * i);
    [healthBuckets[i], healthBuckets[j]] = [healthBuckets[j], healthBuckets[i]];
  }

  let idx = 0;
  segments.forEach(seg => {
    for (let i = 0; i < seg.count; i++) {
      const name = genName(rand, used); used.add(name);
      const bucket = healthBuckets[idx++] || "healthy";
      const units = Math.floor(rand() * (seg.units[1] - seg.units[0]) + seg.units[0]);
      const arr = Math.floor(rand() * (seg.arr[1] - seg.arr[0]) + seg.arr[0]);
      const daysLive = Math.floor(rand() * 730 + 30);
      const region = REGIONS[Math.floor(rand() * REGIONS.length)];
      const owner = OWNERS[Math.floor(rand() * OWNERS.length)];

      let onb, adp, sup, sen, com;
      if (bucket === "critical") {
        onb = Math.floor(rand() * 40 + 10); adp = Math.floor(rand() * 35 + 5);
        sup = Math.floor(rand() * 35 + 5); sen = Math.floor(rand() * 40 + 10); com = Math.floor(rand() * 35 + 10);
      } else if (bucket === "at_risk") {
        onb = Math.floor(rand() * 30 + 35); adp = Math.floor(rand() * 25 + 30);
        sup = Math.floor(rand() * 30 + 25); sen = Math.floor(rand() * 30 + 30); com = Math.floor(rand() * 30 + 25);
      } else if (bucket === "healthy") {
        onb = Math.floor(rand() * 25 + 60); adp = Math.floor(rand() * 25 + 60);
        sup = Math.floor(rand() * 25 + 60); sen = Math.floor(rand() * 25 + 55); com = Math.floor(rand() * 25 + 55);
      } else {
        onb = Math.floor(rand() * 15 + 82); adp = Math.floor(rand() * 15 + 82);
        sup = Math.floor(rand() * 12 + 82); sen = Math.floor(rand() * 15 + 80); com = Math.floor(rand() * 15 + 82);
      }

      const score = Math.round(onb * 0.2 + adp * 0.3 + sup * 0.2 + sen * 0.15 + com * 0.15);
      const prevScore = Math.min(100, Math.max(0, score + Math.floor(rand() * 26 - 10)));
      const trend = score > prevScore + 3 ? "improving" : score < prevScore - 3 ? "declining" : "stable";

      const wfAdoption = {};
      WORKFLOWS.forEach(w => {
        wfAdoption[w] = bucket === "expansion" ? Math.floor(rand() * 20 + 80)
          : bucket === "critical" ? Math.floor(rand() * 40 + 5)
          : bucket === "at_risk" ? Math.floor(rand() * 35 + 30)
          : Math.floor(rand() * 30 + 55);
      });

      const escalations = bucket === "critical" ? Math.floor(rand() * 15 + 8) : bucket === "at_risk" ? Math.floor(rand() * 8 + 3) : Math.floor(rand() * 4);
      const failedMessages = bucket === "critical" ? Math.floor(rand() * 12 + 5) : bucket === "at_risk" ? Math.floor(rand() * 5 + 1) : Math.floor(rand() * 3);
      const openIssues = bucket === "critical" ? Math.floor(rand() * 8 + 4) : bucket === "at_risk" ? Math.floor(rand() * 4 + 1) : Math.floor(rand() * 3);
      const loginFreq = bucket === "expansion" ? "Daily" : bucket === "critical" ? "Rarely" : bucket === "at_risk" ? "Infrequent" : ["Daily", "Weekly", "Regular"][Math.floor(rand() * 3)];
      const tenantSat = bucket === "expansion" ? Math.floor(rand() * 10 + 88) : bucket === "critical" ? Math.floor(rand() * 20 + 40) : bucket === "at_risk" ? Math.floor(rand() * 20 + 55) : Math.floor(rand() * 18 + 70);
      const nps = bucket === "expansion" ? Math.floor(rand() * 20 + 60) : bucket === "critical" ? Math.floor(rand() * 30 - 10) : bucket === "at_risk" ? Math.floor(rand() * 25 + 10) : Math.floor(rand() * 25 + 30);
      const renewalDays = Math.floor(rand() * 365 + 14);
      const trainingComplete = bucket === "expansion" ? Math.floor(rand() * 10 + 90) : bucket === "critical" ? Math.floor(rand() * 50 + 10) : bucket === "at_risk" ? Math.floor(rand() * 30 + 45) : Math.floor(rand() * 20 + 70);
      const integrationComplete = bucket === "expansion" ? Math.floor(rand() * 10 + 90) : bucket === "critical" ? Math.floor(rand() * 60 + 10) : bucket === "at_risk" ? Math.floor(rand() * 35 + 40) : Math.floor(rand() * 20 + 72);

      customers.push({
        id: `c${i}_${idx}`, name, segment: seg.type, units, arr, daysLive, region, owner,
        score, prevScore, trend, bucket,
        onb, adp, sup, sen, com,
        wfAdoption, escalations, failedMessages, openIssues, loginFreq, tenantSat, nps,
        renewalDays, trainingComplete, integrationComplete,
        lastContact: `${Math.floor(rand() * 21 + 1)}d ago`
      });
    }
  });
  return customers;
}

const CUSTOMERS = genCustomers();

function getHealthLabel(score) {
  if (score >= 90) return { label: "Expansion Ready", color: "#0d9488", bg: "#f0fdf9", border: "#99f6e4" };
  if (score >= 75) return { label: "Healthy", color: "#16a34a", bg: "#f0fdf4", border: "#86efac" };
  if (score >= 60) return { label: "Monitor", color: "#d97706", bg: "#fffbeb", border: "#fcd34d" };
  if (score >= 40) return { label: "At Risk", color: "#ea580c", bg: "#fff7ed", border: "#fdba74" };
  return { label: "Critical", color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" };
}

function TrendArrow({ trend, score, prev }) {
  const diff = Math.abs(score - prev);
  if (trend === "improving") return <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 500 }}>↑ +{diff}</span>;
  if (trend === "declining") return <span style={{ color: "#dc2626", fontSize: 12, fontWeight: 500 }}>↓ -{diff}</span>;
  return <span style={{ color: "#6b7280", fontSize: 12 }}>→ stable</span>;
}

function ScoreRing({ score, size = 52 }) {
  const h = getHealthLabel(score);
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const dash = circ * (score / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={3} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={h.color} strokeWidth={3}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2+1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: size > 40 ? 13 : 10, fontWeight: 600, fill: h.color, fontFamily: "DM Sans,sans-serif" }}>{score}</text>
    </svg>
  );
}

function MiniBar({ value, color = "#3b82f6" }) {
  return (
    <div style={{ height: 4, background: "#f3f4f6", borderRadius: 2, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 2, transition: "width .6s ease" }} />
    </div>
  );
}

function CategoryScores({ c }) {
  const cats = [
    { label: "Onboarding", val: c.onb, weight: "20%" },
    { label: "Adoption", val: c.adp, weight: "30%" },
    { label: "Support", val: c.sup, weight: "20%" },
    { label: "Sentiment", val: c.sen, weight: "15%" },
    { label: "Commercial", val: c.com, weight: "15%" },
  ];
  const color = (v) => v >= 75 ? "#16a34a" : v >= 55 ? "#d97706" : v >= 40 ? "#ea580c" : "#dc2626";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {cats.map(cat => (
        <div key={cat.label}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{cat.label}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{cat.weight}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: color(cat.val) }}>{cat.val}</span>
            </div>
          </div>
          <MiniBar value={cat.val} color={color(cat.val)} />
        </div>
      ))}
    </div>
  );
}

// ── AI Streamer — calls /api/ai (Netlify function) ──────────────────────────
function AIStreamer({ prompt }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setText(""); setDone(false);
    (async () => {
      try {
        const r = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, stream: true })
        });
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "";
        while (true) {
          const { done: d, value } = await reader.read();
          if (d || cancelled) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop();
          for (const line of lines) {
            if (line.startsWith("data:")) {
              const data = line.slice(5).trim();
              if (data === "[DONE]") continue;
              try {
                const j = JSON.parse(data);
                if (j.delta?.text) setText(t => t + j.delta.text);
              } catch {}
            }
          }
        }
        if (!cancelled) setDone(true);
      } catch {
        if (!cancelled) setText("Unable to generate insight. Check your ANTHROPIC_API_KEY environment variable in Netlify.");
      }
    })();
    return () => { cancelled = true; };
  }, [prompt]);

  return (
    <div style={{ fontSize: 13, lineHeight: 1.75, color: "#1f2937", whiteSpace: "pre-wrap" }}>
      {text}
      {!done && (
        <span style={{
          display: "inline-block", width: 2, height: 14,
          background: "#3b82f6", marginLeft: 2, verticalAlign: "middle",
          animation: "pulse 1s infinite"
        }} />
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ customers, onSelectCustomer }) {
  const critical = customers.filter(c => c.bucket === "critical");
  const atRisk = customers.filter(c => c.bucket === "at_risk");
  const expansion = customers.filter(c => c.bucket === "expansion");
  const totalARR = customers.reduce((s, c) => s + c.arr, 0);
  const riskARR = [...critical, ...atRisk].reduce((s, c) => s + c.arr, 0);
  const expARR = expansion.reduce((s, c) => s + c.arr, 0);
  const avgScore = Math.round(customers.reduce((s, c) => s + c.score, 0) / customers.length);

  const priorities = [
    ...critical.sort((a, b) => a.score - b.score).slice(0, 3),
    ...atRisk.filter(c => c.trend === "declining").sort((a, b) => a.score - b.score).slice(0, 3),
    ...atRisk.filter(c => c.renewalDays <= 30).slice(0, 2),
    ...expansion.filter(c => c.trend === "improving").sort((a, b) => b.score - a.score).slice(0, 2),
  ];
  const seen = new Set();
  const deduped = priorities.filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }).slice(0, 8);

  const briefPrompt = `You are an AI copilot for a Customer Success Manager named Lola at LightWork AI, a property management automation platform.

Write a concise morning briefing (4-6 sentences) for Lola using this data:
- Total customers: 500
- Critical accounts: ${critical.length} (e.g. ${critical.slice(0, 2).map(c => c.name).join(", ")})
- At-risk accounts: ${atRisk.length}
- ARR at risk: £${Math.round(riskARR / 1000)}k
- Expansion opportunities: ${expansion.length} accounts, £${Math.round(expARR / 1000)}k pipeline
- Portfolio health: ${avgScore}/100
- Top critical account: ${critical[0]?.name} — score ${critical[0]?.score}, declined ${Math.abs((critical[0]?.score || 0) - (critical[0]?.prevScore || 0))} points, ${critical[0]?.escalations} escalations, ${critical[0]?.failedMessages} failed messages
- Top renewal risk: ${atRisk.filter(c => c.renewalDays <= 30)[0]?.name || atRisk[0]?.name} — renewal in ${atRisk.filter(c => c.renewalDays <= 30)[0]?.renewalDays || atRisk[0]?.renewalDays} days
- Top expansion: ${expansion[0]?.name} — score ${expansion[0]?.score}

Start with "Good morning, Lola." Be specific with account names and numbers. Plain English, conversational, actionable. No bullet points — flowing prose only.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* AI Briefing */}
      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", letterSpacing: .5, textTransform: "uppercase" }}>AI Daily Briefing</span>
        </div>
        <AIStreamer prompt={briefPrompt} />
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[
          { label: "Portfolio ARR", val: `£${(totalARR / 1000000).toFixed(1)}M`, sub: "total managed" },
          { label: "ARR at risk", val: `£${Math.round(riskARR / 1000)}k`, sub: `${critical.length + atRisk.length} accounts`, alert: true },
          { label: "Portfolio health", val: `${avgScore}`, sub: "avg score /100" },
          { label: "Expansion pipeline", val: `£${Math.round(expARR / 1000)}k`, sub: `${expansion.length} accounts`, green: true },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 2px rgba(0,0,0,.03)" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: s.alert ? "#dc2626" : s.green ? "#16a34a" : "#0f1117", letterSpacing: -.5 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Priority accounts */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f1117" }}>Accounts requiring attention today</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>Sorted by urgency — click any account for full AI analysis</div>
          </div>
          <span style={{ fontSize: 11, color: "#6b7280", background: "#f3f4f6", padding: "3px 8px", borderRadius: 6 }}>{deduped.length} accounts</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {deduped.map((c, i) => {
            const h = getHealthLabel(c.score);
            const isExp = c.bucket === "expansion";
            return (
              <div key={c.id} onClick={() => onSelectCustomer(c)}
                style={{ background: "#fff", border: `0.5px solid ${isExp ? "#86efac" : "#e5e7eb"}`, borderLeft: `3px solid ${h.color}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, transition: "box-shadow .15s", animationDelay: `${i * 0.04}s` }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 3px 12px rgba(0,0,0,.07)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                <ScoreRing score={c.score} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#0f1117" }}>{c.name}</span>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: h.bg, color: h.color, border: `0.5px solid ${h.border}`, fontWeight: 500 }}>{h.label}</span>
                    {c.renewalDays <= 30 && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", border: "0.5px solid #fca5a5", fontWeight: 500 }}>Renewal {c.renewalDays}d</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{c.segment} · {c.units.toLocaleString()} units · £{(c.arr / 1000).toFixed(0)}k ARR · {c.region}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                    {c.bucket === "critical" && `⚠ ${c.escalations} escalations · ${c.failedMessages} failed messages · ${c.openIssues} open issues`}
                    {c.bucket === "at_risk" && `${c.trend === "declining" ? "↓ Declining · " : ""}${c.escalations} escalations · Tenant sat ${c.tenantSat}%`}
                    {c.bucket === "expansion" && `✓ All workflows active · NPS ${c.nps} · ${c.loginFreq} logins`}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore} />
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{c.lastContact}</span>
                  <span style={{ fontSize: 11, color: "#3b82f6" }}>View →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk + Expansion */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#dc2626", marginBottom: 12 }}>⚠ Risk alerts</div>
          {critical.slice(0, 4).map(c => (
            <div key={c.id} onClick={() => onSelectCustomer(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "0.5px solid #f3f4f6", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef9f9"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <ScoreRing score={c.score} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#0f1117" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.escalations} escalations · {c.failedMessages} failed msgs</div>
              </div>
              <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore} />
            </div>
          ))}
        </div>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", marginBottom: 12 }}>✦ Expansion opportunities</div>
          {expansion.sort((a, b) => b.score - a.score).slice(0, 4).map(c => (
            <div key={c.id} onClick={() => onSelectCustomer(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "0.5px solid #f3f4f6", cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <ScoreRing score={c.score} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#0f1117" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>£{(c.arr / 1000).toFixed(0)}k ARR · NPS {c.nps}</div>
              </div>
              <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 500 }}>↑ Upsell</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Customer 360 ─────────────────────────────────────────────────────────────
function Customer360({ c, onBack }) {
  const h = getHealthLabel(c.score);
  const workflowAdopted = Object.values(c.wfAdoption).filter(v => v >= 70).length;

  const aiPrompt = `You are an expert Customer Success AI Copilot for LightWork AI, a property management automation platform.

Generate a structured health analysis for this account. Plain English only. No jargon. Be specific and actionable.

Account: ${c.name}
Segment: ${c.segment} | Units: ${c.units.toLocaleString()} | ARR: £${c.arr.toLocaleString()} | Region: ${c.region}
Health Score: ${c.score}/100 (was ${c.prevScore}, trend: ${c.trend})
Status: ${h.label}
Days live: ${c.daysLive} | Owner: ${c.owner}

Category scores:
- Onboarding (20%): ${c.onb}/100 — Training: ${c.trainingComplete}%, Integration: ${c.integrationComplete}%
- Adoption (30%): ${c.adp}/100 — Workflows adopted: ${workflowAdopted}/5 — Login: ${c.loginFreq}
- Support (20%): ${c.sup}/100 — Escalations: ${c.escalations}, Failed messages: ${c.failedMessages}, Open issues: ${c.openIssues}
- Sentiment (15%): ${c.sen}/100 — Tenant satisfaction: ${c.tenantSat}%, NPS: ${c.nps}
- Commercial (15%): ${c.com}/100 — Renewal in: ${c.renewalDays} days

Workflow adoption: ${WORKFLOWS.map(w => `${w}: ${c.wfAdoption[w]}%`).join(", ")}

Write EXACTLY this structure using these headers:

## Health Summary
2-3 sentences explaining the overall situation. Start with the account name and current score.

## Top Risk Drivers
3 bullet points (starting with •) for the most important risk factors.

## Recommended Actions
3 numbered actions (1, 2, 3) the CSM should take this week. Be specific.

## Suggested Customer Message
A short professional message the CSM can send to the client today. Warm and proactive.

## Internal Product Note
2-3 sentences for the product/engineering team about technical issues at this account.`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 12, padding: 0 }}>
          ← Back to portfolio
        </button>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <ScoreRing score={c.score} size={60} />
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#0f1117", letterSpacing: -.3 }}>{c.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 20, background: h.bg, color: h.color, border: `0.5px solid ${h.border}`, fontWeight: 500 }}>{h.label}</span>
                  <TrendArrow trend={c.trend} score={c.score} prev={c.prevScore} />
                  {c.renewalDays <= 60 && <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 20, background: "#fef2f2", color: "#dc2626", fontWeight: 500 }}>Renewal in {c.renewalDays}d</span>}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>{c.segment} · {c.units.toLocaleString()} units · {c.region} · Owner: {c.owner}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minWidth: 200 }}>
              {[
                { l: "ARR", v: `£${c.arr.toLocaleString()}` },
                { l: "Days live", v: c.daysLive },
                { l: "Tenant sat", v: `${c.tenantSat}%` },
                { l: "NPS", v: c.nps },
              ].map(m => (
                <div key={m.l} style={{ background: "#f9fafb", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}>{m.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f1117" }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Health breakdown</div>
          <CategoryScores c={c} />
        </div>
        <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Workflow adoption</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {WORKFLOWS.map(w => {
              const v = c.wfAdoption[w];
              const col = v >= 70 ? "#16a34a" : v >= 50 ? "#d97706" : "#dc2626";
              return (
                <div key={w}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: "#374151" }}>{w}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: col }}>{v}%</span>
                  </div>
                  <MiniBar value={v} color={col} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 12 }}>Support snapshot</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {[
            { l: "Escalations", v: c.escalations, warn: c.escalations > 5 },
            { l: "Failed messages", v: c.failedMessages, warn: c.failedMessages > 3 },
            { l: "Open issues", v: c.openIssues, warn: c.openIssues > 3 },
            { l: "Login frequency", v: c.loginFreq, warn: false },
          ].map(m => (
            <div key={m.l} style={{ background: m.warn ? "#fef2f2" : "#f9fafb", borderRadius: 8, padding: "8px 10px", border: m.warn ? "0.5px solid #fca5a5" : "none" }}>
              <div style={{ fontSize: 10, color: m.warn ? "#dc2626" : "#9ca3af", fontWeight: 500 }}>{m.l}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: m.warn ? "#dc2626" : "#0f1117" }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#3b82f6", letterSpacing: .5, textTransform: "uppercase" }}>AI Copilot Analysis</span>
        </div>
        <AIStreamer key={c.id} prompt={aiPrompt} />
      </div>
    </div>
  );
}

// ── All Accounts ─────────────────────────────────────────────────────────────
function AllAccounts({ customers, onSelectCustomer }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [region, setRegion] = useState("all");
  const [seg, setSeg] = useState("all");
  const [page, setPage] = useState(0);
  const PER = 20;

  const filtered = customers.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== "all" && c.bucket !== filter) return false;
    if (region !== "all" && c.region !== region) return false;
    if (seg !== "all" && c.segment !== seg) return false;
    return true;
  }).sort((a, b) => a.score - b.score);

  const pageData = filtered.slice(page * PER, (page + 1) * PER);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search accounts…"
          style={{ flex: 1, minWidth: 160, padding: "7px 12px", border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, background: "#fff", outline: "none" }} />
        {[
          { key: "f", val: filter, set: v => { setFilter(v); setPage(0); }, opts: [["all","All status"],["critical","Critical"],["at_risk","At Risk"],["healthy","Healthy"],["expansion","Expansion Ready"]] },
          { key: "s", val: seg, set: v => { setSeg(v); setPage(0); }, opts: [["all","All segments"],["Small","Small"],["Mid-Market","Mid-Market"],["Enterprise","Enterprise"]] },
          { key: "r", val: region, set: v => { setRegion(v); setPage(0); }, opts: [["all","All regions"], ...REGIONS.map(r => [r, r])] },
        ].map(f => (
          <select key={f.key} value={f.val} onChange={e => f.set(e.target.value)}
            style={{ padding: "7px 10px", border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 12, background: "#fff", color: "#374151", outline: "none" }}>
            {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{filtered.length} accounts</span>
      </div>
      <div style={{ background: "#fff", border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
              {["Account", "Score", "Status", "Segment", "ARR", "Region", "Trend", "Owner"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, color: "#6b7280", fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map(c => {
              const hh = getHealthLabel(c.score);
              return (
                <tr key={c.id} onClick={() => onSelectCustomer(c)} style={{ borderBottom: "0.5px solid #f3f4f6", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "9px 12px", fontWeight: 500, color: "#0f1117" }}>{c.name}</td>
                  <td style={{ padding: "9px 12px" }}><span style={{ fontWeight: 600, color: hh.color }}>{c.score}</span></td>
                  <td style={{ padding: "9px 12px" }}><span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 20, background: hh.bg, color: hh.color, border: `0.5px solid ${hh.border}`, fontWeight: 500, whiteSpace: "nowrap" }}>{hh.label}</span></td>
                  <td style={{ padding: "9px 12px", color: "#6b7280" }}>{c.segment}</td>
                  <td style={{ padding: "9px 12px", color: "#374151" }}>£{(c.arr / 1000).toFixed(0)}k</td>
                  <td style={{ padding: "9px 12px", color: "#6b7280" }}>{c.region}</td>
                  <td style={{ padding: "9px 12px" }}><TrendArrow trend={c.trend} score={c.score} prev={c.prevScore} /></td>
                  <td style={{ padding: "9px 12px", color: "#6b7280" }}>{c.owner.split(" ")[0]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "0.5px solid #f3f4f6" }}>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>Showing {page * PER + 1}–{Math.min((page + 1) * PER, filtered.length)} of {filtered.length}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              style={{ padding: "4px 10px", border: "0.5px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: page === 0 ? "not-allowed" : "pointer", fontSize: 12, color: page === 0 ? "#d1d5db" : "#374151" }}>←</button>
            <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PER >= filtered.length}
              style={{ padding: "4px 10px", border: "0.5px solid #e5e7eb", borderRadius: 6, background: "#fff", cursor: (page + 1) * PER >= filtered.length ? "not-allowed" : "pointer", fontSize: 12, color: (page + 1) * PER >= filtered.length ? "#d1d5db" : "#374151" }}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [fromNav, setFromNav] = useState("dashboard");

  const selectCustomer = (c) => { setSelected(c); setView("c360"); };
  const goBack = () => { setView(fromNav); setSelected(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f7f8fa; color: #0f1117; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 2px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .3s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f7f8fa" }}>
        {/* Nav */}
        <div style={{ background: "#fff", borderBottom: "0.5px solid #e5e7eb", padding: "0 24px", display: "flex", alignItems: "center", height: 52, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 28 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>L</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0f1117", letterSpacing: -.2 }}>LightWork AI</span>
            <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>CS Platform</span>
          </div>
          {[{ id: "dashboard", label: "Dashboard" }, { id: "all", label: "All accounts" }].map(n => (
            <button key={n.id} onClick={() => { setFromNav(n.id); setView(n.id); setSelected(null); }}
              style={{ padding: "0 14px", height: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: (view === n.id || fromNav === n.id && view === "c360") ? 600 : 400, color: (view === n.id || fromNav === n.id && view === "c360") ? "#0f1117" : "#6b7280", borderBottom: (view === n.id || fromNav === n.id && view === "c360") ? "2px solid #0f1117" : "2px solid transparent" }}>
              {n.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16a34a", animation: "pulse 2s infinite" }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Live</span>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e6f1fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: "#185fa5" }}>LA</div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px" }}>
          {view === "dashboard" && (
            <div className="fade-up">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#0f1117", letterSpacing: -.3 }}>Portfolio overview</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
              <Dashboard customers={CUSTOMERS} onSelectCustomer={c => { setFromNav("dashboard"); selectCustomer(c); }} />
            </div>
          )}
          {view === "all" && (
            <div className="fade-up">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: "#0f1117", letterSpacing: -.3 }}>All accounts</div>
                <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>500 customers · filter, search and sort</div>
              </div>
              <AllAccounts customers={CUSTOMERS} onSelectCustomer={c => { setFromNav("all"); selectCustomer(c); }} />
            </div>
          )}
          {view === "c360" && selected && (
            <div className="fade-up">
              <Customer360 c={selected} onBack={goBack} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
