const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

async function yahoo(symbol, range="3mo") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`;
  const r = await fetch(url, {headers: {"User-Agent":"Aktien-Waechter/1.0"}});
  if (!r.ok) throw new Error(`Yahoo HTTP ${r.status}`);
  const j = await r.json();
  const result = j?.chart?.result?.[0];
  if (!result) throw new Error("No market data");
  const q = result.indicators.quote[0];
  const closes = q.close.filter(x => Number.isFinite(x));
  const last = closes.at(-1);
  const sma20 = closes.length ? closes.slice(-20).reduce((a,b)=>a+b,0)/Math.min(20,closes.length) : null;
  const sma50 = closes.length ? closes.slice(-50).reduce((a,b)=>a+b,0)/Math.min(50,closes.length) : null;
  return {
    symbol, price:last, currency:result.meta.currency,
    exchange:result.meta.exchangeName, marketState:result.meta.marketState,
    timestamp:result.meta.regularMarketTime || null,
    closes, sma20, sma50,
    above20:last>sma20, above50:last>sma50
  };
}

app.get("/api/quote/:symbol", async (req,res)=>{
  try { res.json(await yahoo(req.params.symbol)); }
  catch(e) { res.status(502).json({error:e.message}); }
});

app.get("/api/quotes", async (req,res)=>{
  const symbols=String(req.query.symbols||"QBTS,CA1.DE").split(",").map(s=>s.trim()).filter(Boolean);
  const out={};
  await Promise.all(symbols.map(async s=>{
    try { out[s]=await yahoo(s); } catch(e) { out[s]={error:e.message}; }
  }));
  res.json(out);
});

app.get("/api/news/:symbol", async (req,res)=>{
  try {
    const symbol=encodeURIComponent(req.params.symbol);
    const rss=`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`;
    const r=await fetch("https://api.rss2json.com/v1/api.json?rss_url="+encodeURIComponent(rss));
    if(!r.ok) throw new Error(`News HTTP ${r.status}`);
    const j=await r.json();
    res.json((j.items||[]).slice(0,10).map(x=>({title:x.title,link:x.link,date:x.pubDate,description:x.description})));
  } catch(e) { res.status(502).json({error:e.message}); }
});

app.get("/api/health",(req,res)=>res.json({ok:true,time:new Date().toISOString()}));

app.get("/{*splat}",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

app.listen(PORT,()=>console.log(`Aktien-Wächter V7 läuft auf http://localhost:${PORT}`));
