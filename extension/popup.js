// One-click connect: read the UseSession token from the active tab and send it
// to SessionRemind using the user's existing SessionRemind login (cookies are
// included because the extension has host permission for sessionremind.com).
const SR_ORIGIN = 'https://sessionremind.com'

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('connect')
  const status = document.getElementById('status')

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    const onUseSession = tab && /https:\/\/app\.usesession\.com/.test(tab.url || '')

    if (!onUseSession) {
      status.textContent = 'Open app.usesession.com (logged in) in this tab, then click Connect.'
      btn.disabled = true
    } else {
      status.textContent = 'Ready.'
    }

    btn.addEventListener('click', async () => {
      btn.disabled = true
      status.textContent = 'Connecting…'
      try {
        // Read the token from the UseSession page (content scripts/executeScript
        // share the page origin, so localStorage is readable).
        const [{ result: token }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => localStorage.getItem('session-token'),
        })

        if (!token) {
          status.textContent = 'Please log into UseSession first, then try again.'
          btn.disabled = false
          return
        }

        const res = await fetch(`${SR_ORIGIN}/api/usesession/connect`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json().catch(() => ({}))

        if (res.ok) {
          const n = data.sync && typeof data.sync.scheduled === 'number' ? data.sync.scheduled : null
          status.textContent = `✅ Connected${data.businessName ? ' · ' + data.businessName : ''}!` + (n !== null ? ` Scheduled ${n} reminders.` : '')
        } else if (res.status === 401) {
          status.innerHTML = 'Please <a href="' + SR_ORIGIN + '/login" target="_blank">log into SessionRemind</a> in this browser first, then try again.'
          btn.disabled = false
        } else {
          status.textContent = '❌ ' + (data.error || 'Could not connect. Try again.')
          btn.disabled = false
        }
      } catch (e) {
        status.textContent = '❌ ' + (e && e.message ? e.message : 'Something went wrong.')
        btn.disabled = false
      }
    })
  })
})
