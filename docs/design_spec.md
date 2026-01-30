# LASPA Data Viz - Design Commitment & Spec

## 🎨 Design Commitment: "Urban Command Center"

> [!IMPORTANT]
> **Radical Style Selected**: Technical/Geometric (Neo-Brutalist Lite)
> **Why?**: To reflect "Authority", "Precision", and "Smart City" management. Avoids generic "Soft SaaS" looks.

### 1. Visual Identity
- **Geometry**: **Sharp / Technical (0px - 2px)**.
    - No soft rounded corners (except maybe pills for status).
    - Cards have sharp edges or micro-bevels.
    - Borders are thin (1px) and crisp.
- **Palette**: "Lagos Metro"
    - **Primary**: Deep Forest Green (`#064e3b` - emerald-900 equivalent) - *Authority*.
    - **Secondary/Accent**: Signal Orange (`#f97316` - orange-500) - *Action/Alert*.
    - **Background**: Concrete / Off-White (`#f8fafc` - slate-50).
    - **Contrast**: Jet Black (`#0f172a` - slate-900) for text.
    - **NO PURPLE**.
- **Typography**:
    - **Headings**: **Outfit** (Geometric, Modern, "Smart City" feel).
    - **Body/UI**: **Inter** (Clean, legible).
    - **Data/Numbers**: **JetBrains Mono** or **Inter Tabular** (Precision).

### 2. Layout & Topology
- **The "Betrayal"**: Avoid standard "Left Sidebar + Topbar + White Card" generic layout.
- **Proposed Layout**: **"Floating Command Rail"** + **"Split-Layer Dashboard"**.
    - Navigation is a sharp, detached rail.
    - Dashboard is broken into "Data Lanes" rather than a Bento Grid.
    - **Asymmetric Balance**: Key metrics (Revenue) take 90% dominance in specific views.

### 3. Motion & Depth
- **Depth**: Layered cards with subtle "lift" shadow on hover, but sharp borders always visible.
- **Animation**:
    - **Staggered Entry**: Dashboard widgets load in sequence (100ms delay).
    - **Live Pulse**: Real-time markers (e.g., parking occupancy) pulse slowly.
    - **Interaction**: Sharp hover scaling (1.01x) with instant snap (spring physics).

### 4. Component Strategy
- **Cards**: `border-l-4` colored indicators for category (Revenue=Green, Violation=Red).
- **Charts**: Recharts with customized tooltips (dark mode tooltips even in light mode for contrast).
- **Glassmorphism**: **REJECTED**. Solid, opaque surfaces for maximum readability.

---

## Technical Implementation (Tailwind)
- **Radius**: `rounded-none` or `rounded-sm`.
- **Shadows**: `shadow-sm` for depth, `shadow-md` on hover.
- **Borders**: `border-slate-200`.
