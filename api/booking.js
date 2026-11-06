/**
 * WeThru common multi-tenant booking adapter (Vercel Node Function).
 * Requires explicit env configuration. Never simulates confirmed bookings.
 * This file is NOT executed by GitHub Pages.
 *
 * Required:
 * WETHRU_TENANTS_JSON={"wethru":{"eventTypeId":123,"apiKeyEnv":"CAL_API_KEY_WETHRU","origins":["https://wethru.com"]},...}
 * CAL_API_KEY_WETHRU=cal_...
 * TURNSTILE_SECRET_KEY=...
 */
const bad = (res, status, message) => res.status(status).json({message});
const apiUrl='https://api.cal.com/v2';
function tenants() {
  try { const obj=JSON.parse(process.env.WETHRU_TENANTS_JSON || '{}'); return obj && typeof obj==='object'?obj:{}; }
  catch { return {}; }
}
function clean(v,max=120) {return typeof v==='string'?v.trim().slice(0,max):'';}
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&value.length<=254;}
function extractSlots(json){
  const data=json?.data?.slots ?? json?.data ?? json?.slots ?? {};
  const entries=Array.isArray(data)?data:Object.values(data).flatMap(v=>Array.isArray(v)?v:[]);
  return [...new Set(entries.map(v=>typeof v==='string'?v:v?.start).filter(s=>typeof s==='string'&&!Number.isNaN(Date.parse(s))))].sort();
}
async function calRequest(cfg,path,options={}) {
  const token=process.env[cfg.apiKeyEnv];
  if(!token || !/^CAL_API_KEY_[A-Z0-9_]+$/.test(cfg.apiKeyEnv)) throw new Error('missing_cal_config');
  const response=await fetch(apiUrl+path,{
    ...options,
    headers:{'Authorization':'Bearer '+token,'cal-api-version':options.method==='POST'?'2024-08-13':'2024-09-04','Content-Type':'application/json'}
  });
  const out=await response.json().catch(()=>({}));
  if(!response.ok || out.status==='error') throw new Error('cal_api_'+response.status);
  return out;
}
async function slots(cfg) {
  const now=new Date(),end=new Date(now.getTime()+14*86400000);
  const params=new URLSearchParams({
    eventTypeId:String(cfg.eventTypeId),
    start:now.toISOString().slice(0,10),
    end:end.toISOString().slice(0,10),
    timeZone:'Asia/Seoul'
  });
  const out=await calRequest(cfg,'/slots?'+params);
  return extractSlots(out).filter(s=>Date.parse(s)>Date.now()).slice(0,100);
}
async function verifyTurnstile(token,ip) {
  if(!process.env.TURNSTILE_SECRET_KEY || !token) return false;
  const form=new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token});
  if(ip) form.set('remoteip',ip);
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
  const result=await response.json().catch(()=>({success:false}));
  return result.success===true;
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, private');
  const tenant=clean(req.method==='GET'?req.query?.tenant:req.body?.tenant,36);
  const cfg=tenants()[tenant];
  if(!cfg || !Number.isInteger(Number(cfg.eventTypeId)) || !/^CAL_API_KEY_[A-Z0-9_]+$/.test(cfg.apiKeyEnv||'')) return bad(res,503,'예약 시스템이 준비되지 않았습니다.');
  const origin=clean(req.headers.origin,255);
  if(!origin || !Array.isArray(cfg.origins) || !cfg.origins.includes(origin)) return bad(res,403,'허용되지 않은 요청입니다.');
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS')return res.status(204).end();
  if(!['GET','POST'].includes(req.method))return bad(res,405,'허용되지 않은 요청입니다.');
  if(req.method==='GET' && req.query?.action!=='slots')return bad(res,400,'알 수 없는 요청입니다.');
  try {
    if(req.method==='GET')return res.status(200).json({slots:await slots(cfg)});
    const b=req.body || {};
    if(req.headers['content-length'] && Number(req.headers['content-length'])>12000) return bad(res,413,'입력 내용이 너무 깁니다.');
    const name=clean(b.name,80), email=clean(b.email,254),start=clean(b.start,64);
    if(!b.consent || name.length<2 || !validEmail(email)||!start || Number.isNaN(Date.parse(start)))return bad(res,400,'이름, 이메일, 예약시간, 동의가 필요합니다.');
    const when=Date.parse(start);
    if(when<Date.now()+10*60000 || when>Date.now()+15*86400000) return bad(res,400,'예약 가능 범위를 벗어났습니다.');
    // Every booking requires a server-verified captcha. No secret => fail closed.
    const ip=(req.headers['x-forwarded-for']||'').split(',')[0].trim();
    if(!await verifyTurnstile(clean(b.turnstileToken,2048),ip))return bad(res,403,'보안 확인을 완료해 주세요.');
    const possible=await slots(cfg);
    if(!possible.some(x=>Date.parse(x)===when))return bad(res,409,'이미 마감된 시간입니다. 다른 시간을 선택해 주세요.');
    const created=await calRequest(cfg,'/bookings',{
      method:'POST',
      body:JSON.stringify({
        eventTypeId:Number(cfg.eventTypeId),start:new Date(when).toISOString(),
        attendee:{name,email,timeZone:'Asia/Seoul',language:'ko'},
        metadata:{tenant,kind:clean(b.kind,100),service:clean(b.service,100),url:clean(b.url,250),pain:clean(b.pain,500),origin:'wethru-common-engine'}
      })
    });
    const booking=created?.data || {};
    if(!booking.uid)throw new Error('no_booking_confirmation');
    const status=booking.status==='accepted'?'accepted':'pending';
    return res.status(201).json({status,bookingUid:booking.uid});
  } catch(err) {
    // Do not expose provider tokens, private data, raw provider errors.
    console.error('booking_failure',tenant,String(err?.message||'unknown').slice(0,90));
    return bad(res,502,'예약 서비스와 연결하지 못했습니다. 확인 후 다시 시도해 주세요.');
  }
}