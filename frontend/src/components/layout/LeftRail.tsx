"use client"
import CoveragePanel from "@/components/panels/CoveragePanel"
import CameraListPanel from "@/components/panels/CameraListPanel"
import LightingPanel from "@/components/panels/LightingPanel"
import ScanUploadPanel from "@/components/panels/ScanUploadPanel"
import BentoCard from "@/components/ui/BentoCard"

export default function LeftRail() {
  return (
    <aside className="w-[19rem] shrink-0 flex flex-col gap-3 min-h-0">
      <BentoCard title="Coverage" className="shrink-0">
        <CoveragePanel />
      </BentoCard>

      <BentoCard
        title="Cameras"
        className="shrink min-h-0"
        bodyClassName="overflow-y-auto scroll-thin min-h-0 flex-1"
      >
        <CameraListPanel />
      </BentoCard>

      <BentoCard title="Lighting" className="shrink-0">
        <LightingPanel />
      </BentoCard>

      <BentoCard
        title="LiDAR Scan"
        className="flex-1 min-h-0"
        bodyClassName="overflow-y-auto scroll-thin min-h-0 flex-1"
      >
        <ScanUploadPanel />
      </BentoCard>
    </aside>
  )
}
