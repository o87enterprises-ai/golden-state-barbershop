\# GOLDEN STATE BARBERSHOP - FRONTEND HANDOFF DOCUMENT



\## 🚨 CRITICAL INSTRUCTIONS FOR THE AI ASSISTANT

1\. \*\*The User is a Beginner\*\*: The user is very new to programming. 

2\. \*\*No Snippets\*\*: ALWAYS provide the FULL file contents when asking the user to update a file. Do not use comments like "// rest of the code remains the same". 

3\. \*\*Exact Commands\*\*: ALWAYS provide exact terminal command sequences (PowerShell for Windows) and specify the exact directory to run them in.

4\. \*\*Step-by-Step\*\*: Break down every task into numbered steps. 



\## 🎯 PROJECT OVERVIEW

We are building a premium, $10,000 high-end scrollytelling frontend for \*\*Golden State Barbershop\*\* in Tracy, CA. The aesthetic is dark, gold, and red, heavily utilizing Framer Motion, Lenis smooth scrolling, and 3D visual effects. The backend is already scaffolded (Next.js API routes, Prisma, Stripe, Email).



\## 🛠️ CURRENT TECH STACK

\- \*\*Framework\*\*: Next.js 16.4.2 (Turbopack)

\- \*\*Styling\*\*: Tailwind CSS v3

\- \*\*Animation\*\*: Framer Motion (`motion/react`)

\- \*\*Smooth Scroll\*\*: Lenis (`lenis/react`)

\- \*\*Icons\*\*: Lucide React



\## 📁 DIRECTORY MAP (Key Frontend Files)

```text

C:\\Users\\there\\o87DevMobile\\Specs\\GoldenGate

├── app

│   ├── api/ (Backend routes - DO NOT TOUCH unless requested)

│   ├── globals.css (Tailwind directives, scrollbar styling)

│   ├── layout.tsx (Fonts: Inter + Bebas Neue, Lenis wrapper)

│   └── page.tsx (Imports Navbar, Hero, ScrollVideo, Services)

├── components

│   ├── Hero.tsx (3D mouse-parallax logo, floating animation, CTA buttons)

│   ├── Navbar.tsx (Glassmorphism, mobile menu dropdown)

│   ├── ScrollVideo.tsx (Scroll-scrubbing video background with text fades)

│   ├── Services.tsx (Staggered menu cards with hover glow)

│   └── SmoothScroll.tsx (Lenis wrapper)

├── public

│   ├── logo.png (The 3D metallic bear/barber pole logo)

│   └── clippers.mp4 (Placeholder video for the scroll scrubber)

├── lib

│   └── branding.ts (Contains placeholders for shop info, needs updating)

├── tailwind.config.ts (Brand colors, fonts)

└── tsconfig.json

