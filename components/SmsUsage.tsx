'use client'

import { useState, useEffect } from 'react'

// SMS usage + recent activity. Fetches the signed-in user's analytics; render
// it on its own page (see app/usage) rather than crowding the dashboard.
export default function SmsUsage({ userId }: { userId: string }) {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [activityData, setActivityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsResponse, activityResponse] = await Promise.all([
          fetch('/api/user/sms-analytics'),
          fetch('/api/user/sms-activity'),
        ])

        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json()
          setAnalyticsData(data)
        }

        if (activityResponse.ok) {
          const data = await activityResponse.json()
          setActivityData(data)
        }
      } catch (error) {
        console.error('Failed to fetch SMS analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-card p-6 animate-pulse">
            <div className="h-3 w-20 bg-ink/10 rounded mb-3"></div>
            <div className="h-8 w-16 bg-ink/10 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!analyticsData?.success && !activityData?.success) {
    return (
      <div className="text-center py-6">
        <p className="text-muted text-sm">Unable to load SMS analytics</p>
      </div>
    )
  }

  const { smsAnalytics } = analyticsData || {}
  const { activity } = activityData || {}

  return (
    <div className="space-y-6">
      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline rounded-2xl overflow-hidden border border-hairline">
        <div className="bg-card p-6">
          <p className="eyebrow">SMS Used</p>
          <p className="font-display text-4xl font-semibold text-ink mt-3">
            {activity?.currentUsage || smsAnalytics?.current?.smsUsage || 0}
          </p>
          <p className="font-mono text-xs text-muted mt-1">
            of {activity?.limit || smsAnalytics?.current?.smsLimit || 500}
          </p>
        </div>

        <div className="bg-card p-6">
          <p className="eyebrow">Usage</p>
          <p className="font-display text-4xl font-semibold text-ink mt-3">
            {activity ? Math.round((activity.currentUsage / activity.limit) * 100) : smsAnalytics?.current?.usagePercentage || 0}%
          </p>
          <p className="font-mono text-xs text-muted mt-1">
            {activity ? `${Math.max(0, activity.limit - activity.currentUsage)} left` :
             smsAnalytics?.current?.remainingSms === 'unlimited' ? 'Unlimited' :
             `${smsAnalytics?.current?.remainingSms || 0} left`}
          </p>
        </div>

        <div className="bg-card p-6">
          <p className="eyebrow">Success Rate</p>
          <p className="font-display text-4xl font-semibold text-ink mt-3">
            {activity?.deliveryRate || 0}%
          </p>
          <p className="font-mono text-xs text-muted mt-1">
            {activity?.totalMessages || 0} total messages
          </p>
        </div>
      </div>

      {/* Message Activity (if we have activity data) */}
      {activity && (
        <div className="rounded-2xl border border-hairline bg-card p-6">
          <p className="eyebrow mb-5">Recent Activity</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="eyebrow mb-3">Message Status</p>
              <div className="divide-y divide-hairline">
                <div className="flex justify-between text-sm py-2">
                  <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sent
                  </span>
                  <span className="font-mono text-ink">{activity.messagesByStatus?.sent || 0}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="flex items-center gap-2 text-sky-700 dark:text-sky-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Scheduled
                  </span>
                  <span className="font-mono text-ink">{activity.messagesByStatus?.scheduled || 0}</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                  </span>
                  <span className="font-mono text-ink">{activity.messagesByStatus?.failed || 0}</span>
                </div>
              </div>
            </div>
            <div>
              <p className="eyebrow mb-3">Latest Messages</p>
              <div className="divide-y divide-hairline max-h-60 overflow-y-auto">
                {activity.latestMessages?.slice(0, 5).map((msg: any, idx: number) => (
                  <div key={idx} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{msg.clientName}</div>
                      {msg.sessionTitle && <div className="text-xs text-muted truncate">{msg.sessionTitle}</div>}
                      <div className="text-xs text-muted">
                        {msg.sessionTime ||
                          (msg.scheduledFor
                            ? new Date(msg.scheduledFor).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                            : '')}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 font-mono text-xs uppercase tracking-[0.12em] ${
                      msg.status === 'sent' ? 'text-emerald-700 dark:text-emerald-300' :
                      msg.status === 'scheduled' ? 'text-sky-700 dark:text-sky-300' :
                      'text-red-700 dark:text-red-300'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                )) || <p className="text-sm text-muted py-2">No recent messages</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
