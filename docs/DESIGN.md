# Design System: Bogie Flow — Climate-Aware Rail Analytics

**Project ID:** 7375917004327909132 (Stitch)

## 1. Visual Theme & Atmosphere

Surgical command-center aesthetic: charcoal surfaces, coral-red accent lines, monospace telemetry readouts. Dense but disciplined — industrial utilitarian, not decorative. No purple gradients, no x-ray wireframe overlays on 3D.

## 2. Color Palette & Roles

| Token | Hex | Role |
|-------|-----|------|
| background / surface | `#121317` | App shell |
| surface-container | `#1e1f23` | Panels |
| surface-container-lowest | `#0d0e12` | Footer, deep wells |
| surface-variant | `#343539` | Borders, bar tracks |
| primary (coral) | `#ffb4aa` | Accent, alerts, active nav |
| primary-container | `#ff5545` | Critical highlights, CTA |
| on-surface | `#e3e2e7` | Body text |
| on-surface-variant | `#e7bdb7` | Labels, sparkline stroke |
| outline-variant | `#5d3f3b` | Borders |
| error-container | `#93000a` | LIVE badge background |
| on-error-container | `#ffdad6` | LIVE badge text |
| healthy | `#22c55e` | Segment OK |
| warning | `#eab308` | Segment warning |
| critical | `#ef4444` / `#FF3B30` | Anomaly sphere, alerts |

## 3. Typography

- **Display / UI:** Hanken Grotesk (600–700 headings, 400 body)
- **Telemetry:** JetBrains Mono — label-caps (12px, 0.1em tracking), data-readout (14px), data-readout-lg (18px)
- **Icons:** Material Symbols Outlined (weight 300)

## 4. Component Stylings

- **Panels:** 2px radius, 1px outline-variant border
- **glass-panel:** gradient 135deg rgba(30,31,35,0.8) → 0.4, backdrop blur 12px
- **glow-active:** box-shadow 0 0 12px rgba(255, 59, 48, 0.4)
- **3D viewport:** Solid Phong materials, slow rotation (~0.002 rad/frame), no mix-blend-screen
- **MetricBar:** Three mono readouts — Peak Amplitude, Fatigue Index, Bearing Temp
- **Charts:** SVG sparkline (moisture), bar chart with coral peak dot (rain)

## 5. Layout

- Left docked sidebar (256px), top bar, scrollable main grid (8+4 columns on xl)
- Fixed footer telemetry strip with STATION_MAP | NETWORK_LOGS | SOP_DOCS
- Four views: Overview, Analysis, Maintenance, Climate
