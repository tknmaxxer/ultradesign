export const widths = Object.freeze([390, 768, 1440]);

export const criteria = Object.freeze({
  hierarchy: "Clear reading order, emphasis, grouping, and useful information density.",
  spacing_consistency: "Coherent rhythm, repeated spacing relationships, and aligned edges within and across sections.",
  visual_consistency: "Repeated buttons, cards, fields, and navigation share coherent anatomy, color, and states (a visual component-reuse proxy, not proof of source-code reuse).",
  responsive: "Useful composition without clipping or unreadably compressed content at all three supplied widths.",
  polish: "Deliberate, coherent typography, color, surfaces and details that fit this product's task and content; complete presentation of required content. Originality alone is not quality.",
});

const delivery = `Deliver a finished, self-contained index.html with browser-native HTML/CSS/JavaScript and optional local assets. Implement the requested interactions, keyboard focus, accessible labels and reduced motion. Preserve any existing design tokens. Keep working notes out of the rendered page.`;

export const tasks = Object.freeze([
  {
    id: "dashboard",
    title: "Operations dashboard",
    brief: `Build the Overview dashboard for Northstar, a small-team subscription analytics product. The primary user is an operations lead checking business health before a daily standup. Show a sidebar with Overview, Revenue, Customers, Reports, and Settings; a header with "Good morning, Alex", a date range selector (Last 30 days initially; Last 7 days; Last 90 days), and Export control; four KPI cards (MRR $48,250, +12.8%; Active customers 1,284, +8.2%; Churn 2.4%, -0.6%; Net revenue $42,180, +9.4%); a revenue trend covering Jan-Jun ($28k, $31k, $30k, $37k, $41k, $48k); acquisition breakdown (Organic 48%, Referral 32%, Paid 20%); and a recent invoices table with exactly these columns and rows: Invoice, Customer, Date, Amount, Status; INV-1048, Acme Studio, Jun 18 2026, $1,200, Paid; INV-1047, Orbit Labs, Jun 17 2026, $840, Pending; INV-1046, Cedar Works, Jun 16 2026, $2,400, Paid; INV-1045, Lumen Co, Jun 15 2026, $480, Overdue; INV-1044, Finch Design, Jun 14 2026, $960, Paid. Search filters invoice rows, date range updates the displayed period without inventing different KPI values, and Export downloads the currently visible invoices as CSV. Make the mobile layout genuinely usable, not a scaled desktop canvas.`,
    seed: "",
  },
  {
    id: "landing",
    title: "Product landing page",
    brief: `Build the public landing page for Fieldnote, a calm shared workspace for independent research teams. Explain the promise "Turn scattered findings into shared understanding." Include navigation (Product, How it works, Pricing), a hero with "Start your workspace" and "See how it works" CTAs, and a product preview showing project "Neighborhood mobility", notes "Interview: daily commute", "Bus stop observations", and "Route map", with insight "Reliability matters more than speed". Include these feature headings and descriptions: Capture anywhere - Save interviews, links, and notes in one place; Connect the evidence - Link observations to the questions they answer; Share the story - Publish a clear synthesis your team can build on. Process: 1 Capture your material; 2 Find the connections; 3 Share what matters. Pricing: Solo $12/month (1 workspace, unlimited notes, private sharing); Team $29/member/month (unlimited workspaces, shared library, team permissions). Use exactly these explicitly illustrative testimonials, not implied verified customer endorsements: "Our notes finally tell one story." - Maya Chen, Independent researcher; "I can see the evidence behind every decision." - Jonas Reed, Product lead; "Sharing findings feels like part of the work, not another project." - Priya Shah, Research consultant. FAQ: "Can I import existing notes?" / "Yes. Import Markdown and plain-text notes."; "Can I keep a workspace private?" / "Yes. Workspaces are private until you choose to share."; "Can I cancel anytime?" / "Yes. Cancel from settings before your next billing date." Footer: Fieldnote, Privacy, Terms, Contact. CTA opens a labeled email-signup dialog with email validation and success copy "You're on the list. We'll be in touch."; FAQ expands/collapses; navigation scrolls to real sections. No additional logos, metrics, quotes, or sections. Aim for a memorable, credible product identity rather than a generic gradient template.`,
    seed: "",
  },
  {
    id: "settings",
    title: "Account settings",
    brief: `Implement the account Settings screen for Harbor, a project-management application, preserving the supplied brand tokens and existing header. Include navigation for Profile, Notifications, and Security, with Profile initially selected. Profile contains avatar initials AM, editable full name "Alex Morgan", email "alex@example.com", role "Product designer", timezone "America/New_York" (other options Europe/London and Asia/Seoul), and bio "Designing useful tools for thoughtful teams." Save changes validates email and shows "Changes saved", while Cancel restores saved values. Notifications contains toggles with these initial states: Product updates off, Weekly digest on, Security alerts on. Security includes Two-factor authentication initially off and these exact sessions: "Chrome on macOS - Brooklyn, US - Current session"; "Safari on iPhone - Brooklyn, US - Active 2 hours ago"; "Firefox on Windows - Boston, US - Active 3 days ago". The two noncurrent sessions each have a Sign out action that removes the row and announces "Session signed out". Include a clearly separated Delete account area with a confirmation dialog, "This permanently deletes your account and projects.", Cancel, and Delete account controls; confirmation only shows "Account deletion requested" without a network request. Keep forms readable and navigation usable on mobile. Preserve the existing 4px grid, colors, and radius system rather than replacing them.`,
    seed: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Harbor Settings</title>
<style>:root{--brand:#245c50;--ink:#182b27;--muted:#61736d;--surface:#fff;--canvas:#f3f6f4;--line:#dce5df;--space:4px;--radius:12px}*{box-sizing:border-box}body{margin:0;background:var(--canvas);color:var(--ink);font-family:system-ui,sans-serif}.app-header{height:64px;background:var(--surface);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 24px}.brand{color:var(--brand);font-weight:750;font-size:20px}.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--brand);color:white;font-size:13px}</style></head>
<body><header class="app-header"><span class="brand">Harbor</span><span class="avatar" aria-label="Alex Morgan">AM</span></header><main id="app"></main></body></html>
`,
  },
  {
    id: "mobile",
    title: "Mobile daily planner",
    brief: `Build Today for Daymark, a mobile-first daily planner for people balancing work and personal routines. Show "Good morning, Alex", Tuesday, May 19, 2026, and a date strip May 18-24 with May 19 initially selected. Progress starts "3 of 6 complete". Use exactly these tasks: Morning - 07:30 Morning walk (Personal, complete), 09:00 Review design proposal (Work, complete), 10:30 Team check-in (Work, complete); Afternoon - 13:00 Draft launch checklist (Work, incomplete), 16:30 Pick up groceries (Personal, incomplete); Evening - 20:00 Read for 20 minutes (Personal, incomplete). Include Add task, an All/Work/Personal filter (All initially), and navigation Today/Upcoming/Profile. Completing a task updates progress; filters change visible tasks; Add task opens a labeled form with Title, Time, Category and Add task submit, validates a non-empty title, and adds the task. Date selection updates the selected date and shows "No tasks planned" for other days. Upcoming contains "Dentist appointment - Wed, May 20 at 10:00". Profile shows Alex Morgan and "Personal workspace". Today's reminder also reads "Dentist appointment tomorrow at 10:00"; daily note is "Leave room for a little fresh air." Make touch targets comfortable at 390px and adapt intentionally to tablet/desktop without stretching a phone layout edge to edge. Use motion only where it helps users understand state, and respect reduced-motion preferences.`,
    seed: "",
  },
]);

export function briefFor(task) {
  return `${task.brief}\n\n${delivery}`;
}
