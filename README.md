# Hacktech 2026

**event:** Hacktech 2026 @ Caltech (Pasadena), Fri-Sun 2026-04-24 → 2026-04-26
**venue:** Avery House, 293 S Holliston Ave, Pasadena CA 91106
**team (4):** Melody · Alex Li · Suhaan · James (Suhaan's friend, joined Apr 23/24)
**status as of Apr 24 (flight day):** scope locked, build Fri 9pm → Sun 9am

---

## pitch (opening)

Physical security is a **$120B+ global market** (MarketsandMarkets), projected past **$200B by end of decade**. Video surveillance alone is **>50%** of it (Grand View Research). And yet — most commercial camera failures aren't bad equipment. They're **bad placement** (Hoosier Security).

The numbers: **779,542 U.S. burglaries in 2024** — one every 51 seconds. **$3.4B in personal property lost** annually (The Zebra). Homes without a system are **300% more likely** to be hit. **83% of would-be burglars check for cameras first** (Deep Sentinel).

Cameras work as deterrents — **when placed correctly**. They usually aren't. The placement errors that show up *after* an incident: cameras pointed at sky/ground, back doors with no coverage, parking lots that can't read plates, cameras blocked by signage or shelving (Wirednm). Mistakes nobody notices until they pull footage and find the blind spot has been there since day one.

Professional consultation costs real money: **$1,500 for small business → $50,000+ for campus deployments** (Get Safe and Sound), **40–70% labor**. Residential averages **$1,292** (Angi). And after you pay, the design is **static** — doesn't adapt when you rearrange furniture, add an entrance, or grow the space.

**Sentinel** is the security architect that ships with the building. Scan the space → live digital twin → K2 reasons about coverage, sunlight, threat models → placement updates as your space does.

---

## project: **Sentinel — Indoor Physical-Security Architect**

### the spatial task current models fail at

LLMs cannot do **3D FOV coverage + adversarial visibility reasoning**. Ask GPT/Claude/K2 "given these wall coordinates, place 4 cameras to cover 95% of floor area + see every door" → wrong answer, hallucinated coords, no occlusion modeling, no raycasting.

**Our solution:** externalize the geometric substrate (streaming pointcloud + raycast + A*) and let K2 reason *semantically* on top — "vault matters more than bathroom, prioritize exit observation, this leaves a blind spot exploitable by insider class." K2 becomes the reasoning glue between the spatial substrate and adversarial outcome. Honest "current models fail → tractable" story.

### inputs → outputs

- **input**: video (live phone scan / pre-recorded / ScanNet scene render)
- **pipeline**: video → streaming 3D reconstruction → pointcloud → K2 semantic placement reasoning → A* adversarial threat models → K2 iterates → motion-detection layer overlays
- **output**: sensor placement (cameras + motion + glass-break + door sensors) with coverage map, adversarial test results, K2 reasoning chain, live human-tracking overlay

### pipeline (the four-stage story for the pitch)

1. **video → 3D point cloud** — structure-from-motion (SfM) + depth estimation reconstructs a full 3D model of the space from a walkthrough video. **No LiDAR, no special hardware — just your phone camera.**
2. **point cloud → spatial understanding** — a segmentation model identifies walls, doors, windows, ceilings, hallways, entry points, and obstructions. It understands what's a room, what's a corridor, and where the vulnerable access points are.
3. **spatial model → K2 reasoning** — K2 Think V2 is the core brain. It receives the full spatial understanding and reasons through optimal placement using physics, geometry, and security domain knowledge: FOV calculations, overlapping coverage zones, lighting conditions, entry-point prioritization, sight-line obstruction analysis, and cost minimization (fewest cameras for maximum coverage).
4. **placement → simulated camera views** — for each recommended position, we render the actual view *from* that camera: angle, coverage, what it would see. **You see through the eyes of your future security system before buying a single camera.**

This is the spine of the pitch. Each stage is a distinct demo beat with its own visual moment.

### 5-min demo arc (revised — no heist, no motion detection, no priority zones)

1. **cold open** — pitch numbers on screen ($120B market, 779k burglaries, 83% check first, $1,292 avg residential install, "design is static"). Sentinel wordmark resolves. (25s)
2. **input video plays** — pre-recorded phone walkthrough of the space (Avery House interior or ScanNet scene). short, 6–8s clip. judge sees raw input. (15s)
3. **3D reconstruction streams in** — pointcloud builds live from the video, particles drifting into place. (20s)
4. **spatial understanding overlay** — segmentation model lights up walls / doors / windows / entry points in distinct colors. labels animate in (`6 entry points · 2 windows · 1 corridor`). (20s)
5. **K2 auto-optimization** — no manual zone marking. K2 reasoning panel streams: prioritizing entry points, minimizing camera count, accounting for sight-lines. cameras spawn one-by-one with FOV cones sweeping in. coverage % climbs to ~94%. (45s)
6. **budget slider drag** — judge slides $500 → $25k, cameras spawn/despawn live, coverage % animates, K2 streams tradeoffs (*"at $2,400, dropping CAM-03 for two CAM-Lite raises entry coverage 4/6 → 6/6"*). settle at a mid-tier number. (40s)
7. **camera POV preview** — click CAM-01 node, side panel renders the simulated view *from* that camera (angle, FOV, what it actually sees). click CAM-03, swap. *"see through the eyes of your future system before buying a single camera."* (30s)
8. **lighting time-lapse** — scrub 24h, sun sweeps through windows, glare warning fires on CAM-04 at 14:00–16:30, K2 recommends HDR schedule + one IR swap. accept → twin updates, lighting risk panel goes green. (45s)
9. **coverage map tab** — toggle to top-down heatmap. one blind-spot pulses. click it → K2 explains why it's acceptable (low-priority zone, cost-vs-coverage tradeoff). honesty beat. (20s)
10. **closing** — pitch callback: *"professional consultation: $1,500 + two weeks. Sentinel: 90 seconds. And when you rearrange the space — re-scan, re-reason."* (15s)
11. Q&A. (45s)

**total: ~5:00**

---

---

## UI (Sentinel dashboard)

Reference frame: dark monospace dashboard, central 3D twin, rails of telemetry left/right. Mockup locked.

**left rail — analysis**
- **Coverage Analysis** — single % readout + bar (e.g. 94.2%) — big, hero number
- **Entry Points Covered** — `n / total` (every door/window enumerated by twin)
- **Blind Spots Detected** — count, click to fly camera to spot
- **Overlap Zones** — count (redundant coverage = wasted budget)
- **Cameras list** — per-camera card: name, type (Dome 4K / Bullet 2K / Dome WDR / Dome IR / PTZ), FOV°, status dot (green/amber/red). Click → selects in twin, isolates FOV cone.
- **Lighting Risk** — time window (e.g. 14:00–16:30), glare-affected cameras flagged, night-coverage % (IR-equipped cams)

**center — 3D twin**
- floorplan extruded, camera positions as glowing nodes, FOV cones rendered as volumetric translucent wedges (color = status)
- tabs along bottom: **Digital Twin · Point Cloud · Coverage Map · Threat Path**
  - *Digital Twin* — clean architectural view
  - *Point Cloud* — raw streaming reconstruction (Suhaan's StreamVGGT output)
  - *Coverage Map* — top-down heatmap, ground-plane density shader
  - *Threat Path* — A* attacker traces overlaid, breach points pulse

**right rail — live ops**
- **Live Feeds** — 2×n grid of camera tiles with timestamp + REC dot. One tile shows OBSTRUCTION callout (red dashed box).
- **Alerts** — active count badge. Cards: obstruction detected, glare warning (with ETA: "in 23 min"), coverage re-analysis complete. Severity icon + timestamp.
- **K2 Think V2 panel** — streaming reasoning text, fixed at bottom right. Live token stream, monospace, cyan accents. Example: *"Lighting simulation: Western sun at 14:00–16:30 creates glare on CAM-04. At 15:45, shadow from interior wall creates 2.1m² blind spot in zone B. Recommend HDR mode activation via automated schedule."*

**top bar** — `SENTINEL` wordmark, status pills: `● 7 Cameras Online · ● K2 Think V2 Active · ● 1 Alert`

---

## new feature scaffolds

### lighting / solar simulation (ship this — strong demo moment)
Using window positions + orientations from the 3D twin, K2 simulates sun arc through the space across a 24h cycle.
- **detects**: glare windows, shadow blind spots, dark corners at dusk
- **recommends**: supplemental lighting placement, IR-capable cameras for low-light positions, HDR-mode scheduling per camera
- **viz**: 24h time-lapse scrubber along the twin's bottom edge — drag to advance time, watch shadows sweep, FOV cones change color (green→amber→red) as conditions degrade. Hour markers, sunrise/sunset notches.
- **K2 prompt hook**: "given window normals {…}, latitude {…}, date, list time-windows where each camera underperforms; suggest mitigation per camera (move / IR / HDR / supplemental light)."

### budget slider (ship this — interactive judging moment)
Horizontal slider docked along the bottom of the twin. Drag → placement re-optimizes live.
- **range**: $500 → $50k (log scale), with notches at SMB / mid-market / campus tiers
- **as you drag**: cameras spawn/despawn with particle birth-burst, FOV cones fade in/out, coverage % readout animates, K2 reasoning panel streams the tradeoff (*"At $2,400, dropping CAM-03 (loading dock) for two CAM-Lite at side entrances raises entry-point coverage from 4/6 to 6/6 but reduces back-zone dwell capture."*)
- **cost-per-coverage curve** — small inline chart showing diminishing returns, vertical line marks current budget
- **lock toggle** — pin must-have cameras (e.g. server room) so they don't get pruned when budget drops

### "what-if" mode — live geometry edits
Drag a wall, add a doorway, place a shelf → twin re-runs raycast, K2 re-reasons. The static-design problem from the pitch, solved visually. Optional stretch — only ship if Sat night ahead of schedule.

### threat-path replay
Click a threat model (burglar / insider / pro) → A* path animates through the space as a particle trail. Camera FOV cones flash green when they catch the attacker, red on breach. Scrub timeline to inspect any frame.

### privacy zones (auto-detected)
Twin segments rooms semantically (bathroom, breakroom, private office). K2 auto-masks these from coverage objective and warns if a placed camera's FOV intersects. Compliance angle for the Cybersecurity track.

### compliance overlay (stretch)
Toggle: HIPAA / PCI / GDPR. Twin highlights zones with regulatory placement constraints (e.g. PCI: cameras over POS but not capturing keypad). Cheap to slide-deck even if not built.

### insurance discount estimator (slide-only acceptable)
Given placement plan → estimated insurance premium reduction. "Plan saves $2,400/yr — pays for itself in 8 months." Pitch ammunition.

### cable / mount feasibility (cut unless trivial)
Flag cameras placed where mounting is implausible (glass walls, drop ceilings without backing). Low effort if the twin already has wall-material labels.

### multi-floor stacking (stretch)
Z-axis scrub to navigate floors. Probably overscope for 36hr.

**ship priority**: lighting sim ⭐⭐⭐ · budget slider ⭐⭐⭐ · threat-path replay ⭐⭐⭐ (already in arc) · privacy zones ⭐⭐ · what-if edits ⭐⭐ · everything else slide-only.

---

## tech stack

| layer                       | tech                                                                                                                             | owner |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **input**                   | ScanNet (primary, ~1500 indoor scans) + live phone capture (demo magic) + Avery/Bechtel fallback                                 |       |
| **3D reconstruction**       | open-source streaming single-cam model — likely **StreamVGGT** (Yinghao Xu co-author, specs match LinkedIn post). Verify Fri AM. |       |
| **geometry + optimization** | 3D raycast on pointcloud + A* adversarial w/ 3 threat-model cost functions                                                       |       |
| **reasoning core**          | K2 Think V2 — semantic placement prompts + adversarial-iteration loop, cached                                                    |       |
| **motion detection**        | YOLOv8/v10 person detection on video, projected to 3D as pointcloud overlay                                                      |       |
| **viz**                     | Three.js + Melody's particle shaders (8 distinct uses, one base shader)                                                          |       |

### 3 threat models
- **burglar** — opportunistic, no interior knowledge, avoids sensor-dense zones
- **insider** — knows layout + sensor positions, disables one then exfils
- **professional** — tools (glass-cut, grappling), systematic, longest time budget

### Ironsite API
Use unknown — Melody to investigate at Sat 6pm Ironsite fireside. Burn credits in critical path once known (likely as object/material labeler on video frames, or reasoning-API alternative to K2). Track entry: still strong on "spatial task models fail" framing even without API integration; integration upgrades it from ⭐⭐⭐ → ⭐⭐⭐⭐.

---

## ux / visual direction

**aesthetic**: Anduril-website-elegant + Mehretu layered linework + Hicks textural density + Blade Runner 2049 atmospheric. Code-as-art, NOT SaaS-dashboard.

**design language locked**:
- type: monospace (Berkeley/JetBrains/IBM Plex), lowercase body, tabular figures
- palette: `#0a0a0a` ground / off-white pointcloud / `#00d4ff` FOV-cyan / vault-red / exit-green / amber for "locked" confidence
- motion: easeOutExpo, gravity > spring, nothing bounces
- sound (optional): low drone + camera-clicks + breach-alarm sweep. no score.

**8 particle-shader uses, one base shader**:
1. pointcloud render (confidence gradient)
2. FOV cones (volumetric dust-motes inside)
3. coverage heatmap (ground-plane density)
4. sensor shockwave (radial burst on trigger)
5. attacker motion-blur trail
6. camera birth-spawn burst
7. motion-detection ghost-particles
8. cold-open ambient drift

Coherence lever: every visual reads as "same particle system, different params." Syntaxesia move.

**hero frame** (design backwards from this): mid-heist, 3 FOV cones lit with dust-motes, one firing red shockwave, Mehretu-dense pointcloud behind, terminal log mid-stream, motion-detection ghost-bbox foreground.

**avoid**: flat SaaS, glowy-RGB "AI", Y2K retro, animated logo reveals, glitch overlays everywhere (only on breach), music score, floating emojis.

---

## prize tracks (single submission, up to 7)

| track | prize | fit |
|---|---|---|
| **Ironsite** | $10k/$5k/$2.5k | ⭐⭐⭐ "spatial task current models fail" — direct |
| **IFM K2 Think V2** | reMarkable | ⭐⭐⭐ reasoning-core product |
| **Cybersecurity/Safety** | NuPhy keyboard | ⭐⭐⭐ literal name match |
| **Not So Sexy** | Whoop | ⭐⭐⭐ B2B physical security |
| **Palohouse** | $20k SAFE + 10-day hackerhouse | ⭐⭐⭐ credible startup vector |
| **Best Use of AI** | Mac Mini M4 | ⭐⭐⭐ multi-modal (3D recon + reasoning + detection) |
| **Creativity** | MX Master | ⭐⭐⭐ particle-shader heist viz |

**opt out**: YC, Listen Labs, Sideshift.

---

## differentiators vs SIQUR (Catapult 2026 winner — direct precedent)

1. **K2 semantic-priority reasoning** (vs SIQUR's OR-Tools CP-SAT solver)
2. **Multi-threat-model adversarial** (3 distinct attacker classes)
3. **Self-improvement iteration loop** (K2 red-teams its own design)
4. **No LiDAR, no floor plan** — single-cam streaming reconstruction
5. **Live motion-detection surveillance layer** (vs SIQUR's post-hoc Watchman)

---

## team split

- **Suhaan** — input + reconstruction model (StreamVGGT verification) + ground-plane extraction
- **Alex** — geometry/raycasting + A* threat models + Three.js viz + breach FX. Ramp: 30min pointcloud-101 from Suhaan Fri 9-9:30pm
- **James** — YOLO motion detection + 3D projection overlay
- **Melody** — K2 prompts + iteration loop + particle shaders + demo narrative + pitch + hero-frame design

**contingency Sat 12pm**: if Alex behind on geometry → Suhaan absorbs raycasting, Alex shifts to UI/animation. If James behind on motion detection → drop layer, keep in slides only.

---

## schedule

**Fri 4/24**: 3-5pm check-in · 5-6:30pm opening · 7:30-9pm IFM K2 workshop (mandatory) · **9pm hack starts**
**Sat 4/25**: 6-7pm Ironsite fireside (Melody attend — ask about API + judging) · night = polish
**Sun 4/26**: 9am submit · 10-12pm Round 1 · 1-1:30pm Round 2 (if finalist) · 2pm closing

---

## urgent Fri pre-9pm

- [ ] Suhaan: verify StreamVGGT repo + license + hardware reqs + output format from LinkedIn post
- [ ] Suhaan: pre-cache 3 ScanNet scenes locally
- [ ] Melody: IFM WhatsApp join → K2 API key
- [ ] Melody: K2 design + adversarial prompts drafted on flight (5hr offline window)
- [ ] All: pre-install Node + Three.js + PyTorch + ultralytics, git clones ready

## fallback hierarchy
live scan → pre-recorded video → ScanNet pre-baked pointcloud (bulletproof)

---

## success definitions

- **min**: working demo + submit + Round 1
- **target**: 1+ prize
- **stretch**: Ironsite ($10k cash) OR Palohouse ($20k SAFE + house)
- **moonshot**: 3+ prizes stacked
