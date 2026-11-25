---
name: System specimen
version: alpha
colors:
  canvas: "#f7f8fa"
  surface: "#ffffff"
  text: "#182333"
  muted: "#48576b"
  action: "#174ea6"
  onAction: "#ffffff"
  error: "#a51d2d"
typography:
  body:
    fontFamily: system-ui, sans-serif
    fontSize: 16px
    lineHeight: 1.5
spacing:
  small: 0.5rem
  medium: 1rem
  large: 1.5rem
rounded:
  control: 0.5rem
motion:
  duration:
    instant: 70ms
    quick: 110ms
    short: 150ms
    medium: 240ms
    long: 400ms
    signature: 700ms
  easing:
    productive:
      standard: cubic-bezier(0.2, 0, 0, 1)
      entrance: cubic-bezier(0, 0, 0.38, 0.9)
      exit: cubic-bezier(0.2, 0, 1, 0.9)
    expressive:
      standard: cubic-bezier(0.4, 0.14, 0.3, 1)
      entrance: cubic-bezier(0, 0, 0.3, 1)
      exit: cubic-bezier(0.4, 0.14, 1, 1)
---
# Design contract (DESIGN.md)

Copy this file to `DESIGN.md` and derive its values and rules from the approved
direction in the [system stage](../../prompts/06-system.md). The front matter is
a working specimen, not an approved brand. Keep values here; generate CSS,
TypeScript and the Storybook catalog with `design-tokens`.

## Task and direction

- Audience / task / completion:
- Route and adjacent surfaces:
- Scope / existing-system migration boundary:
- Primary action and first-glance priority:
- Selected pattern notes and adaptation decisions:

## Layout

| Width or transition | Region order / alignment | Reflow or density change | Primary action location | Observable acceptance |
| --- | --- | --- | --- | --- |

## System

| Role (color, type, spacing, radius, elevation, motion) | Token reference | Use | Existing/new or justified exception |
| --- | --- | --- | --- |

- Spacing increment, scope and exceptions:
- Surface, divider and grouping rules:
- Alignment grid (bounds, tracks, gutters, edges or baselines):
- Type roles (family, size / weight / line-height, responsive changes):
- Density targets per width (row height, line length or visible content):

## Component contract (repeat)

**Name / responsibility / existing primitive or implementation path:**

- When to use / when not to use:
- Source type/API link and Storybook docs link (do not copy prop signatures):
- Supported composition and extension points:

| Data requirement | Source of data | Content bounds or missing value | State owner |
| --- | --- | --- | --- |

| Slot or region | Tokens, hierarchy and alignment | Responsive behavior |
| --- | --- | --- |

| Variant or state | Trigger / behavior | Visual and accessible feedback | Check and condition |
| --- | --- | --- | --- |

- Keyboard, focus and semantics:
- Motion trigger and reduced-motion outcome:
- Example fixture and route/story:

## Shared change ownership

- Lead responsible for token and component changes:
- Affected components, patterns and routes:
- Reuse, extend or keep product-local, with the task that requires it:
- Migration of existing consumers and removal of obsolete uses:
- Linked story/test evidence and owner decision:

## Verification matrix

| Flow or decision | Setup, viewport and input | Expected result | Evidence to collect |
| --- | --- | --- | --- |

## State matrix

Record every reachable component and section state. A state that cannot occur
gets a reason, not a dummy story. Each reachable state links to its own Storybook
story; core-task stories include a `play` function and recovery assertions.

| Component / section | Normal | Hover | Focus | Disabled | Loading | Empty | Error / recovery | Permission | Story IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Imagery rules

- Role per section: image, scene, product UI, illustration, data or deliberate typography.
- Subject, medium, lighting and grading derived from the approved direction:
- Desktop/mobile crop, focal point, aspect ratio and text-safe area:
- Alternative text, decorative treatment and loading priority:
- Asset IDs and source/licence/prompt/model provenance in `assets.json`:
- Fallback image and its accessible equivalent when video or WebGL is unavailable:

## Motion language

The six `motion.duration.*` tokens above are the only duration scale.
`motion.easing.productive.*` serves frequent task feedback;
`motion.easing.expressive.*` serves the one or two signature sequences.
Convert generated milliseconds to seconds at the library boundary when needed.
Keep repeated daily interactions below 150 ms and exits faster than entrances.

Choreograph one focal point at a time. Stagger by reading hierarchy, not DOM
order. State the trigger, interruption/reversal behavior, focus continuity,
touch/mobile behavior and completion event for every sequence. Reduced motion
must preserve information and task completion without spatial travel.

Name two or three behaviours from the brand idea. For each, record a concrete
reduced-motion substitute and link its Storybook specimen and approved animatic.

| Named brand behaviour | Brand idea / user effect | Trigger and duration/easing tokens | Choreography and interruption | Reduced-motion substitute | Specimen / animatic |
| --- | --- | --- | --- | --- | --- |

## Scene budget

Use real-time 3D only when interaction or a changing viewpoint needs it.
Record the target device before implementation; software-rendered lab FPS is
not device evidence. Keep primary content and actions usable without WebGL.

| Scene / asset ID | Target device and browser | FPS floor | Maximum texture size | Fallback image / alt | Load budget | Lab evidence | Device evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
