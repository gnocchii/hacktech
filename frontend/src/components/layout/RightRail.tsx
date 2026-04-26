"use client"
import LiveFeedsPanel from "@/components/panels/LiveFeedsPanel"
import AlertsPanel from "@/components/panels/AlertsPanel"
import K2Panel from "@/components/panels/K2Panel"
import CameraPOVPanel from "@/components/panels/CameraPOVPanel"
import BentoCard from "@/components/ui/BentoCard"
import TerminalFrame from "@/components/ui/TerminalFrame"
import { useSentinel } from "@/store/sentinel"

export default function RightRail() {
  const { selectedCameraId } = useSentinel()

  return (
    <aside className="w-[22rem] shrink-0 flex flex-col gap-3 min-h-0">
      {selectedCameraId ? (
        <BentoCard title="Camera POV" className="shrink-0">
          <CameraPOVPanel />
        </BentoCard>
      ) : (
        <>
          <BentoCard title="Live Feeds" action="click to inspect" className="shrink-0">
            <LiveFeedsPanel />
          </BentoCard>

          <TerminalFrame
            title="alerts.log"
            status="tail -f"
            className="shrink-0"
            bodyClassName="overflow-visible"
          >
            <AlertsPanel />
          </TerminalFrame>
        </>
      )}

      <BentoCard
        title="K2 Think v2"
        className="flex-1 min-h-0"
        bodyClassName="flex-1 min-h-0 flex flex-col"
      >
        <K2Panel />
      </BentoCard>
    </aside>
  )
}
