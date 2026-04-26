"use client"
import { useSentinel } from "@/store/sentinel"
import DigitalTwinCoverage from "./DigitalTwinCoverage"
import PointCloudView from "./PointCloudView"
import ThreatPath from "./ThreatPath"
import ImportanceMap from "./ImportanceMap"
import CameraDetailView from "./CameraDetailView"

export default function SceneViewer() {
  const activeTab = useSentinel((s) => s.activeTab)
  const selectedCameraId = useSentinel((s) => s.selectedCameraId)

  return (
    <div className="w-full h-full relative bg-transparent overflow-hidden">
      {activeTab === "digital-twin"   && <DigitalTwinCoverage />}
      {activeTab === "point-cloud"    && <PointCloudView />}
      {activeTab === "threat-path"    && <ThreatPath />}
      {activeTab === "importance-map" && <ImportanceMap />}
      {activeTab === "camera-feeds"   && (
        selectedCameraId
          ? <CameraDetailView />
          : <div className="w-full h-full flex items-center justify-center">
              <p className="text-dim text-sm">Click a camera feed to inspect.</p>
            </div>
      )}
    </div>
  )
}
