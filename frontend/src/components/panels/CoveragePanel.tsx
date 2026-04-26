"use client"
import { useSentinel } from "@/store/sentinel"

export default function CoveragePanel() {
  const { coveragePct, scene } = useSentinel()
  const analysis = scene?.analysis
  const blindSpots = analysis?.blind_spots ?? []
  const overlapZones = analysis?.overlap_zones ?? 0
  const epCovered = analysis?.entry_points_covered ?? 0
  const epTotal = analysis?.entry_points_total ?? 0

  return (
    <section className="px-5 py-4 space-y-5">
      {/* Hero */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[56px] leading-[0.9] tracking-tight text-text tabular-nums">
            {coveragePct.toFixed(1)}
          </span>
          <span className="font-display italic text-2xl text-dim/80">%</span>
        </div>
        <div className="w-full bg-white/[0.04] rounded-full h-[3px] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${coveragePct}%`,
              background: "linear-gradient(90deg, #89b4fa 0%, #cba6f7 50%, #f5c2e7 100%)",
              boxShadow: "0 0 12px rgba(137,180,250,0.5)",
            }}
          />
        </div>
        <div className="text-[11px] text-dim/80">
          {scene?.floor_area_m2 ?? 0} m² floor · {coveragePct >= 80 ? "well covered" : "needs work"}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden bg-white/[0.04]">
        <Stat label="Entry" value={`${epCovered}/${epTotal}`} />
        <Stat label="Blind" value={blindSpots.length.toString()} />
        <Stat label="Overlap" value={overlapZones.toString()} />
      </div>

      {/* Blind list */}
      {blindSpots.length > 0 && (
        <div className="space-y-1">
          {blindSpots.slice(0, 3).map((bs) => (
            <div
              key={bs.id}
              className="flex items-center gap-2.5 text-[12px] px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  bs.severity === "high"
                    ? "bg-red shadow-[0_0_6px_rgba(243,139,168,0.6)]"
                    : bs.severity === "medium"
                    ? "bg-amber shadow-[0_0_6px_rgba(250,179,135,0.6)]"
                    : "bg-dim"
                }`}
              />
              <span className="text-text/85 truncate">{bs.reason}</span>
              <span className="ml-auto shrink-0 text-dim font-mono text-[10.5px] tabular-nums">{bs.area_m2}m²</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg/40 px-3 py-2.5">
      <div className="text-[10px] text-dim uppercase tracking-[0.1em]">{label}</div>
      <div className="text-[15px] font-semibold text-text tabular-nums mt-0.5">{value}</div>
    </div>
  )
}
