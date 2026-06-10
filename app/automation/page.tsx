import { redirect } from 'next/navigation'

// The Automation page is now Connect. Permanent redirect for old links
// (emails, bookmarks, docs).
export default function AutomationRedirect() {
  redirect('/connect')
}
