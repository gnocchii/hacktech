"use client"
import { useEffect, useState } from "react"

const DEMO_ALERTS = [
  { id: "a1", severity: "warning", title: "Obstruction Detected", body: "CAM-03 FOV partially blocked — verify mount", time: "02:14:07" },
  { id: "a2", severity: "info",    title: "Glare Warning",         body: "CAM-04 glare in 23 min (14:00–16:30)",     time: "13:37:42" },
  { id: "a3", severity: "success", title: "Re-analysis Complete",  body: "Coverage re-computed after budget change",  time: "13:35:18" },
  { id: "a4", severity: "info",    title: "K2 Think v2",           body: "Agent ready — 5 cameras synced",            time: "13:32:01" },
]

// Two-color palette: blue for info/warn/critical, green for success/ready
const SEV_TAG: Record<string, { label: string; color: string }> = {
  critical: { label: "ALERT", color: "text-cyan" },
  warning:  { label: "WARN ", color: "text-cyan" },
  info:     { label: "INFO ", color: "text-cyan" },
  success:  { label: "OK   ", color: "text-green" },
}

export default function AlertsPanel() {
  const [now, setNow] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setNow(nowStamp())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <section className="px-4 pb-4 space-y-1.5">
      {DEMO_ALERTS.map((a) => {
        const tag = SEV_TAG[a.severity] ?? SEV_TAG.info
        return (
          <div key={a.id} className="term-line">
            <span className="term-time">[{a.time}]</span>
            <span className={`term-tag ${tag.color}`}>{tag.label}</span>
            <span className="term-msg">
              <span className="text-text">{a.title}</span>
              <span className="text-dim"> — {a.body}</span>
            </span>
          </div>
        )
      })}
      <div className="term-line" suppressHydrationWarning>
        <span className="term-time">[{now ?? "--:--:--"}]</span>
        <span className="term-tag text-green">READY</span>
        <span className="term-msg text-dim">Awaiting next event<span className="k2-cursor">▊</span></span>
      </div>
    </section>
  )
}

function nowStamp() {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":")
}
