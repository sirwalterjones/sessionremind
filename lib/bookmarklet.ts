// Single source of truth for the one-time "Connect to SessionRemind"
// bookmarklet. Used by the Connect page and the post-payment welcome wizard so
// the two flows can never drift apart.
//
// Self-contained bookmarklet: injects a small branded SessionRemind modal
// into the UseSession page (no native alert). CSP-safe — built with
// createElement + style.cssText, never innerHTML with style attrs. It reads
// the UseSession session token from localStorage and POSTs it (with the
// short-lived pairing `code`) back to `${origin}/api/usesession/connect-token`.
export function buildConnectorBookmarklet(origin: string, code: string): string {
  return (
    `javascript:(function(){` +
    `function box(icon,clr,title,msg,auto){var e=document.getElementById('srm');if(e)e.remove();` +
    `var w=document.createElement('div');w.id='srm';w.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:2147483647;background:#fff;color:#141414;font-family:-apple-system,Segoe UI,Roboto,sans-serif;border:1px solid #ECEAE4;border-radius:14px;box-shadow:0 16px 50px rgba(0,0,0,.18);padding:16px 18px;min-width:300px;max-width:380px;display:flex;gap:12px;align-items:flex-start';` +
    `var i=document.createElement('div');i.textContent=icon;i.style.cssText='flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:'+clr+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;line-height:1';` +
    `var c=document.createElement('div');c.style.cssText='flex:1';` +
    `var h=document.createElement('div');h.textContent=title;h.style.cssText='font-weight:600;font-size:14px;margin-bottom:2px';` +
    `var p=document.createElement('div');p.textContent=msg;p.style.cssText='font-size:13px;color:#5F5B54;line-height:1.45';` +
    `c.appendChild(h);c.appendChild(p);` +
    `var x=document.createElement('button');x.textContent='\\u00d7';x.style.cssText='background:none;border:none;font-size:20px;color:#9A958C;cursor:pointer;line-height:1;padding:0;margin-left:4px';x.onclick=function(){w.remove()};` +
    `w.appendChild(i);w.appendChild(c);w.appendChild(x);document.body.appendChild(w);if(auto)setTimeout(function(){w.remove()},6000);}` +
    `var t=localStorage.getItem('session-token');` +
    // No token: either we're not on UseSession at all (open it in a new tab and
    // tell them to sign in + click again there), or we're on UseSession but
    // signed out (just prompt sign-in).
    `if(!t){` +
    `if(location.hostname.indexOf('usesession.com')===-1){` +
    `window.open('https://app.usesession.com/','_blank');` +
    `box('\\u2192','#d97706','Opening UseSession\\u2026','We opened UseSession in a new tab. Sign in there if you need to, then click this bookmark again from that tab.');` +
    `}else{` +
    `box('!','#d97706','Sign in first','Sign in to UseSession, then click this bookmark again.');` +
    `}return;}` +
    `box('\\u2026','#8A857C','SessionRemind','Connecting your account\\u2026');` +
    `fetch('${origin}/api/usesession/connect-token',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:'${code}',token:t})}).then(function(r){return r.json()}).then(function(d){` +
    `if(d.success){box('\\u2713','#16a34a','Connected!',(d.sync&&typeof d.sync.scheduled==='number'?'Scheduled '+d.sync.scheduled+' reminder(s). ':'')+'You can close this tab.',true);}` +
    `else{box('\\u00d7','#dc2626','Could not connect',d.error||'Something went wrong.');}` +
    `}).catch(function(e){box('\\u00d7','#dc2626','Error',String(e));});})();`
  )
}
