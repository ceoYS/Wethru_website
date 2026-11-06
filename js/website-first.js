/* WeThru website-first review branch: no background submission or simulated booking. */
(() => {
  'use strict';
  const form = document.getElementById('lead');
  if (!form) return;
  const $ = id => document.getElementById(id);
  const status = $('lead-status');
  const serviceMap = {
    '신규 홈페이지 제작': '홈페이지',
    '기존 홈페이지 리뉴얼': '홈페이지',
    '상담·예약 자동화': '홈페이지'
  };
  const base = 'https://docs.google.com/forms/d/e/1FAIpQLSe_8Xc9hLP-ZKwrajEtZnNgqi7REm-ZXLOg6iqvqXhqhvx7Tg/viewform';
  const bookingPanel = $('booking-panel');
  const bookingMsg = $('booking-msg');
  const bookingSlots = $('booking-slots');
  const bookingSubmit = $('booking-submit');
  let selected = '';
  let slotRequest = 0;
  let turnstileToken = '';
  let turnstileWidget = null;
  const turnstileSiteKey = typeof window.WETHRU_TURNSTILE_SITE_KEY === 'string' ? window.WETHRU_TURNSTILE_SITE_KEY : '';
  async function setupTurnstile() {
    if (!turnstileSiteKey || turnstileWidget !== null) return;
    try {
      if (!window.turnstile) {
        await new Promise((resolve,reject)=>{
          const s=document.createElement('script');
          s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          s.onload=resolve;s.onerror=reject;
          document.head.append(s);
        });
      }
      window.turnstile.ready(()=>{
        turnstileWidget=window.turnstile.render('#booking-turnstile',{
          sitekey:turnstileSiteKey,
          callback:token=>{turnstileToken=token;bookingSubmit.disabled=!(selected&&token);},
          'expired-callback':()=>{turnstileToken='';bookingSubmit.disabled=true;}
        });
      });
    } catch { bookingMsg.textContent='보안 확인을 불러오지 못했습니다. 카카오톡으로 문의해 주세요.'; }
  }
  function details() {
    return {
      tenant: 'wethru',
      kind: $('lead-kind').value.trim(),
      service: $('lead-service').value.trim(),
      url: $('lead-url').value.trim(),
      pain: $('lead-pain').value.trim()
    };
  }
  function setStatus(message) { status.textContent = message; }
  function valid() {
    const d = details();
    if (!d.kind || !d.service) {
      setStatus('업종과 관심 서비스를 선택해 주세요.');
      (!d.kind ? $('lead-kind') : $('lead-service')).focus();
      return false;
    }
    if (d.url && !/^https?:\/\//i.test(d.url)) {
      setStatus('주소는 https://로 시작해 주세요.'); $('lead-url').focus(); return false;
    }
    return true;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const d = details();
    const params = new URLSearchParams({usp: 'pp_url'});
    const serviceValue = serviceMap[d.service];
    if (serviceValue) params.append('entry.2121283377', serviceValue);
    params.set('entry.307446677', [
      '[WeThru 웹사이트 상담 시안 신청]',
      '업종: ' + d.kind,
      '관심 서비스: ' + d.service,
      '현재 채널: ' + (d.url || '미입력'),
      '상담 고민: ' + (d.pain || '미입력')
    ].join('\n'));
    const link = base + '?' + params.toString();
    setStatus('Google Forms가 새 창에서 열립니다. 신청서에서 직접 제출하셔야 실제로 접수됩니다.');
    const win = window.open(link, '_blank', 'noopener,noreferrer');
    if (!win) window.location.href = link;
  });

  // Configure on a separated, access-controlled API origin after backend launch.
  // Empty by default so the draft branch cannot claim that bookings are confirmed.
  const apiBase = typeof window.WETHRU_BOOKING_API_BASE === 'string'
    ? window.WETHRU_BOOKING_API_BASE.replace(/\/$/, '') : '';
  function fmt(iso) {
    return new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',month:'numeric',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
  }
  function availableSlotList(data) {
    const value = data && data.slots;
    if (!Array.isArray(value)) return [];
    return value.filter(s => typeof s === 'string' && !Number.isNaN(Date.parse(s)) && Date.parse(s)>Date.now());
  }
  $('check-slots').addEventListener('click', async () => {
    bookingPanel.hidden = false;
    bookingSlots.replaceChildren();
    bookingSubmit.disabled = true;
    selected = '';
    if (!valid()) { bookingMsg.textContent='업종과 관심 서비스를 먼저 선택해 주세요.';return; }
    if (!apiBase) {
      bookingMsg.textContent = '아직 실예약 기능이 연결되지 않은 개발 시안입니다. 지금은 기존 상담 신청서 또는 카카오톡으로 문의해 주세요.';
      return;
    }
    await setupTurnstile();
    const q=++slotRequest;
    bookingMsg.textContent = '실제 가능한 일정을 조회하고 있습니다.';
    try {
      const res=await fetch(apiBase+'/api/booking?tenant=wethru&action=slots',{credentials:'omit'});
      const out=await res.json();
      if (q!==slotRequest) return;
      if (!res.ok) throw new Error(out.message||'일정 조회 실패');
      const dates=availableSlotList(out).slice(0,30);
      if (!dates.length) {bookingMsg.textContent='지금 예약 가능한 시간이 없습니다. 카카오톡으로 문의해 주세요.';return;}
      bookingMsg.textContent = '원하는 시간을 선택하세요. 예약 요청 후 실제 시스템에서 확인합니다.';
      dates.forEach(iso=>{
        const b=document.createElement('button');
        b.type='button';b.textContent=fmt(iso);b.dataset.iso=iso;b.setAttribute('aria-pressed','false');
        b.addEventListener('click',()=>{
          selected=iso;
          bookingSlots.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
          bookingSubmit.disabled=!turnstileToken;
        });
        bookingSlots.append(b);
      });
    } catch(e){bookingMsg.textContent='일정을 불러오지 못했습니다. 기존 상담 채널을 이용해 주세요.';}
  });
  bookingSubmit.addEventListener('click',async()=>{
    if (!apiBase || !selected || !valid()) return;
    if (!turnstileToken) {bookingMsg.textContent='보안 확인을 완료해 주세요.';return;}
    const name=$('booking-name').value.trim(), email=$('booking-email').value.trim();
    if(name.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      bookingMsg.textContent='예약 안내를 받을 성함과 이메일을 정확히 입력해 주세요.';return;
    }
    if (!$('booking-consent').checked) {bookingMsg.textContent='개인정보 수집·이용 동의를 확인해 주세요.';return;}
    bookingSubmit.disabled=true;
    bookingMsg.textContent='선택한 시간을 예약 시스템에 요청 중입니다.';
    try {
      const res=await fetch(apiBase+'/api/booking?tenant=wethru',{
        method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',
        body:JSON.stringify({...details(),name,email,start:selected,consent:true,turnstileToken})
      });
      const out=await res.json();
      if(!res.ok)throw new Error(out.message||'예약 실패');
      if(out.status==='accepted'){
        bookingMsg.textContent='상담 예약이 확인되었습니다. 예약 안내는 입력한 이메일로 전달됩니다.';
        bookingSlots.replaceChildren();selected='';
      }else if(out.status==='pending'){
        bookingMsg.textContent='예약 요청이 접수됐습니다. 담당자가 확정한 후 안내가 전달됩니다.';
        bookingSlots.replaceChildren();selected='';
      }else throw new Error('예약 상태를 확인할 수 없습니다.');
    }catch(e){
      bookingMsg.textContent='예약 확정 여부를 확인하지 못했습니다. 이메일을 확인한 뒤, 이미 예약됐는지 확인하고 다시 시도해 주세요. 필요하면 카카오톡으로 문의해 주세요.';
      turnstileToken='';
      if(window.turnstile && turnstileWidget!==null) window.turnstile.reset(turnstileWidget);
      bookingSubmit.disabled=true;
    }
  });
})();