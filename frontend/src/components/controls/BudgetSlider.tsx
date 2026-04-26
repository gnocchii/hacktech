"use client"
import { useCallback } from "react"
import { useSentinel } from "@/store/sentinel"
import { optimizeImportance } from "@/lib/api"

const MIN = 500
const MAX = 25000

function budgetToLog(v: number) {
  return (Math.log(v) - Math.log(MIN)) / (Math.log(MAX) - Math.log(MIN))
}

function logToBudget(t: number) {
  return Math.round(Math.exp(t * (Math.log(MAX) - Math.log(MIN)) + Math.log(MIN)) / 50) * 50
}

export default function BudgetSlider() {
  const {
    budget, setBudget,
    sceneId, setCameras, setCoveragePct, setSceneAnalysis,
    importanceScore, setImportanceScore,
    optimizing, setOptimizing,
  } = useSentinel()

  const handleSlide = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(logToBudget(Number(e.target.value)))
  }, [setBudget])

  const handleOptimize = useCallback(async () => {
    if (!sceneId || optimizing) return
    setOptimizing(true)
    try {
      const result = await optimizeImportance(sceneId, budget, 12)
      setCameras(result.cameras)
      setCoveragePct(result.score * 100)
      setImportanceScore(result.score)
      setSceneAnalysis({
        entry_points_covered: result.entry_points_covered,
        entry_points_total:   result.entry_points_total,
        blind_spots:          result.blind_spots,
        overlap_zones:        result.overlap_zones,
        total_cost_usd:       result.total_cost_usd,
      })
    } catch (err) {
      console.error("optimize failed", err)
      alert(`Optimize failed: ${err}`)
    } finally {
      setOptimizing(false)
    }
  }, [sceneId, budget, optimizing, setCameras, setCoveragePct, setImportanceScore, setSceneAnalysis, setOptimizing])

  const pct = budgetToLog(budget)
  const pctNum = pct * 100

  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <span className="text-dim text-[11px] uppercase tracking-[0.12em] shrink-0">Budget</span>

      <div className="relative flex-1 h-5 flex items-center group">
        <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-200"
            style={{
              width: `${pctNum}%`,
              background: "linear-gradient(90deg, #89b4fa 0%, #cba6f7 100%)",
              boxShadow: "0 0 10px rgba(137,180,250,0.45)",
            }}
          />
        </div>
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_0_3px_rgba(137,180,250,0.25),0_2px_8px_rgba(0,0,0,0.6)] pointer-events-none transition-transform duration-150 group-hover:scale-110"
          style={{ left: `${pctNum}%` }}
        />
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={pct}
          onChange={handleSlide}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>

      <span className="text-text text-[13px] font-bold shrink-0 w-20 text-right tabular-nums">
        ${budget.toLocaleString()}
      </span>
      <button
        onClick={handleOptimize}
        disabled={optimizing || !sceneId}
        className="glass-btn glass-btn--accent shrink-0"
      >
        {optimizing ? "Optimizing…" : "Optimize"}
      </button>
      {importanceScore > 0 && (
        <span className="text-green text-xs font-bold shrink-0 tabular-nums">
          {(importanceScore * 100).toFixed(1)}%
        </span>
      )}
    </div>
  )
}
