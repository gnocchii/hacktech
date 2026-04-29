"use client"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSentinelUploads } from "@/hooks/useSentinelUploads"
import StaggeredText from "@/components/react-bits/staggered-text"
import ParticleText from "@/components/react-bits/particle-text"
import GlitchText from "@/components/react-bits/glitch-text"
import DecryptedText from "@/components/DecryptedText"

// ASCIIText injects a <style> tag with @import + a hardcoded radial-gradient
// on the <pre> overlay. The @import causes a Next.js SSR hydration mismatch,
// and the gradient bleeds magenta/orange/yellow over our white wordmark.
// Dynamic-import with ssr:false to dodge hydration; the gradient itself is
// neutralized by overrides in globals.css scoped to .sh-hero-ascii-wrap.
const ASCIIText = dynamic(() => import("@/components/ASCIIText"), { ssr: false })

const TITLE = "sentinel"
const SUBTITLE = "reasoned surveillance."

export default function SentinelHero() {
  const router = useRouter()
  const { scene, sceneId, feedsFbxUrl, uploading, handleUpload, handleUploadFbx } = useSentinelUploads()
  const routedRef = useRef(false)
  const arrivedReadyRef = useRef(Boolean(sceneId && feedsFbxUrl))

  useEffect(() => {
    if (arrivedReadyRef.current) return
    if (sceneId && feedsFbxUrl && !routedRef.current) {
      routedRef.current = true
      router.push("/twin")
    }
  }, [sceneId, feedsFbxUrl, router])

  return (
    <div className="sh-hero">
      <div className="sh-hero-ascii-wrap">
        <ASCIIText
          text={TITLE}
          asciiFontSize={5}
          textFontSize={280}
          planeBaseHeight={9}
          textColor="#ffffff"
          enableWaves
        />
      </div>

      {/* STASHED — typed-particle title (toggle to true to switch back) */}
      {false && (
        <div className="sh-hero-particle-wrap">
          <ParticleText
            text={TITLE}
            fontFamily='"Helvetica Neue", Helvetica, Arial, sans-serif'
            fontWeight={700}
            colors={["#ffffff"]}
            backgroundColor="transparent"
            particleSize={2}
            particleGap={4}
            asciiChars="@#%&8BWMXxoc/\\:;|*+=-,. "
            asciiGlyphSize={11}
            autoFit
            typed
            typedStaggerMs={130}
            typedFadeMs={70}
            entryDelay={1100}
          />
        </div>
      )}

      <GlassPanel
        scene={scene}
        feedsFbxUrl={feedsFbxUrl}
        uploading={uploading}
        handleUpload={handleUpload}
        handleUploadFbx={handleUploadFbx}
      />
    </div>
  )
}

type GlassPanelProps = {
  scene: ReturnType<typeof useSentinelUploads>["scene"]
  feedsFbxUrl: string | null
  uploading: boolean
  handleUpload: (file: File) => void | Promise<void>
  handleUploadFbx: (file: File) => void
}

function GlassPanel({ scene, feedsFbxUrl, uploading, handleUpload, handleUploadFbx }: GlassPanelProps) {
  const [m, setM] = useState({ x: "50%", y: "50%" })
  const fileRef = useRef<HTMLInputElement>(null)
  const fbxRef = useRef<HTMLInputElement>(null)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setM({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px` })
  }
  const onLeave = () => setM({ x: "50%", y: "50%" })

  const usdzReady = !!scene
  const fbxReady = !!feedsFbxUrl

  return (
    <>
      {/* Liquid-glass distortion filter — referenced by .sh-glass-filter via
          `filter: url(#sh-glass-distortion)`. Scoped SVG so it doesn't bleed
          into other instances. */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="sh-glass-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurredNoise" />
            <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div
        className="sh-glass-panel"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ ["--mx" as any]: m.x, ["--my" as any]: m.y }}
      >
        <div className="sh-glass-filter" />
        <div className="sh-glass-overlay" />
        <div className="sh-glass-specular" />

        <div className="sh-glass-content">
          <input
            ref={fileRef}
            type="file"
            accept=".usdz"
            className="sh-glass-panel-file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
              e.target.value = ""
            }}
          />
          <input
            ref={fbxRef}
            type="file"
            accept=".fbx"
            className="sh-glass-panel-file"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUploadFbx(file)
              e.target.value = ""
            }}
          />

          <div className="sh-glass-row">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={`sh-glass-pill ${usdzReady ? "is-ready" : ""}`}
            >
              <span className="sh-glass-pill-prefix">›</span>
              <span className="sh-glass-pill-label">
                {uploading ? "parsing…" : usdzReady ? "usdz loaded" : "upload usdz"}
              </span>
            </button>
            <button
              type="button"
              onClick={() => fbxRef.current?.click()}
              className={`sh-glass-pill ${fbxReady ? "is-ready" : ""}`}
              title="Textured FBX rendered in Camera Feeds + Point Cloud tabs"
            >
              <span className="sh-glass-pill-prefix">›</span>
              <span className="sh-glass-pill-label">
                {fbxReady ? "fbx loaded" : "upload fbx"}
              </span>
            </button>
          </div>

          <p className="sh-glass-foot">
            read the{" "}
            <a
              href="https://github.com/gnocchii/sentinel"
              target="_blank"
              rel="noopener noreferrer"
              className="sh-glass-foot-link"
            >
              github
            </a>
            {" "}or{" "}
            <a
              href="https://devpost.com/software/sentinel-qkt9cn?ref_content=user-portfolio&ref_feature=in_progress"
              target="_blank"
              rel="noopener noreferrer"
              className="sh-glass-foot-link"
            >
              devpost
            </a>
            !
          </p>
        </div>
      </div>
    </>
  )
}
