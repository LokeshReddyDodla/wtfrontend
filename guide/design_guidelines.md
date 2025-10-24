# Weight Loss Tracking Dashboard - Design Guidelines

## Design Approach

**Reference-Based Hybrid Approach**: Drawing inspiration from leading health & fitness applications (Noom, MyFitnessPal, Apple Health, Headspace) combined with modern dashboard principles. The design balances motivation and clarity - making progress tracking feel rewarding while maintaining data legibility.

**Core Principle**: Health tracking should feel empowering, not clinical. Use warmth, encouragement, and celebration of progress throughout the interface.

## Color Palette

### Primary Colors
- **Success Green**: 142 75% 50% (primary action, positive progress)
- **Motivational Purple**: 262 70% 62% (accents, highlights, achievements)
- **Trust Blue**: 217 85% 58% (information, stability)
- **Neutral Gray**: 220 14% 96% (backgrounds), 220 9% 46% (text)

### Semantic Colors
- **Warning Amber**: 38 90% 55% (attention needed, abnormal ranges)
- **Error Red**: 0 72% 60% (critical health indicators)
- **Background Gradient**: Soft multi-hue gradient from white through lavender to pink tints (5 95% 98% → 262 95% 98% → 330 95% 98%)

### Dark Mode
- Background: 222 47% 11%
- Cards: 217 33% 17%
- Text primary: 210 40% 98%
- Text secondary: 215 20% 65%

## Typography

**Font Stack**: Inter (primary), system-ui fallback
- **Hero/H1**: 600 weight, 36-48px
- **Section Headers/H2**: 600 weight, 24-32px
- **Card Titles/H3**: 600 weight, 18-20px
- **Body**: 400 weight, 16px, 1.6 line-height
- **Metrics/Numbers**: 700 weight (for emphasis)
- **Captions**: 500 weight, 14px, uppercase tracking for labels

## Layout System

**Spacing Units**: Consistent use of Tailwind spacing - primarily 4, 6, 8, 12, 16, 20, 24 units (p-4, gap-6, m-8, etc.)

**Container Strategy**:
- Dashboard max-width: 1400px
- Content sections: max-w-7xl
- Cards: Full width within grid, rounded-2xl corners
- Grid layouts: 1 column mobile → 2-3 columns desktop

**Dashboard Structure**:
1. Header/Navigation (sticky, 70px height)
2. Hero Stats Section (metric cards in 2x2 or 3x1 grid)
3. Progress Charts Section (full-width or 2-column)
4. InBody Reports Section (card grid or list)
5. Health Indicators Section (organized by category)
6. Chat Interface (sidebar or bottom sheet)

## Component Library

### Navigation
- Sticky header with logo, patient name, enrollment status badge
- Navigation tabs or sidebar with icons from Lucide React
- Active state: gradient underline or filled background
- User profile dropdown in top-right

### Hero Stats Cards
- Large metric cards with gradient backgrounds (subtle, 5-10% opacity overlays)
- Icon + Label + Large Number + Trend indicator (↑↓)
- Comparison text ("2kg from goal")
- Soft shadow-lg, hover: transform scale(1.02) with transition
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

### Progress Charts
- Recharts library with custom styling
- Area charts with gradient fills (from accent color to transparent)
- Line charts with rounded dots at data points
- Grid lines: subtle (opacity 0.1)
- Tooltips: white cards with shadow, show date + value
- Time range selector tabs (7D, 30D, 90D, All)
- Chart container: white card with p-6, rounded-2xl, shadow-soft

### InBody Report Cards
- Card layout with thumbnail preview (if available) or placeholder icon
- Upload zone: Dashed border, hover state with green accent, drag-drop feedback
- Report metadata: Date badge, processing status (with animated pulse if processing)
- Action buttons: View details, Download (icon buttons or text links)
- List view: Alternating subtle backgrounds for rows

### Health Indicators Display
- Category groupings with collapsible sections
- Individual indicator cards: Icon + Name + Value + Unit + Range bar
- Range visualization: Horizontal bar with normal range highlighted, current value marker
- Color-coded severity: Green (normal), Amber (borderline), Red (abnormal)
- Abnormality badge with level (Mild, Moderate, Severe)
- AI explanation text in muted color below value

### Chat Interface
- Fixed height container (500-600px) with scroll
- Message bubbles: User (green gradient, right-aligned), Assistant (gray, left-aligned)
- Avatar icons for assistant messages
- Input: Large text area with send button (icon), rounded-full
- Typing indicator: Animated dots when AI is responding
- Message timestamps in subtle text
- Sticky input at bottom, messages scroll above

### Forms & Inputs
- Input fields: border-gray-300, focus:ring-2 ring-purple-500
- Labels: font-medium, text-sm, mb-2
- File upload: Drag-drop zone with icon, accepted formats shown
- Buttons: Primary (green gradient), Secondary (outline), Tertiary (ghost)
- Error states: Red border + error message below in red text

### Loading & Empty States
- Skeleton screens: Pulsing gray backgrounds matching card layouts
- Spinners: Circular with green/purple gradient
- Empty states: Large icon (lucide-react), heading, description, CTA button
- "No reports yet" with upload prompt
- "Start chatting" with example questions

## Micro-Interactions

- Button hover: subtle scale(1.05), shadow increase
- Card hover: shadow-medium, subtle lift
- Form focus: smooth ring animation
- Chart hover: crosshair, tooltip fade-in
- Tab switching: smooth underline slide animation
- Success actions: brief green glow + checkmark animation
- Delete/warning: Shake animation on confirm

## Images

**Hero Section**: Optional health-themed abstract imagery (running silhouettes, healthy food composition, fitness equipment) as background with overlay. If used, 40% opacity with gradient overlay.

**InBody Report Thumbnails**: Display extracted report images in cards, 200x280px aspect ratio, rounded corners.

**Empty State Illustrations**: Simple line-art style illustrations for empty reports, no data states - can use placeholder SVG or lucide-react icons at large scale (w-24 h-24).

**Avatar/Profile**: Circular avatar for chat assistant, patient profile in header.

## Accessibility & Responsiveness

- All interactive elements min 44px touch target
- Color contrast ratios meet WCAG AA (4.5:1 text, 3:1 UI)
- Focus indicators clearly visible
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile: Stack all grids to single column, sticky header reduces height
- Charts: Reduce height on mobile, simplify tooltips

## Animation Guidelines

**Use Sparingly**:
- Page transitions: None or simple fade
- Data loading: Skeleton pulse (3s duration)
- Chart rendering: 800ms ease-in-out reveal
- Success feedback: 400ms scale + fade (celebrate milestones)
- Hover states: 150ms transitions

Avoid: Excessive parallax, continuous floating animations, carousel auto-play