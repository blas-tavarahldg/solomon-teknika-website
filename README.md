# Solomon Teknika — E-Commerce & Portfolio Website

A production-ready Next.js 14 website showcasing Solomon Teknika's technology venture studio, portfolio companies, and BLAS X framework.

## Overview

Solomon Teknika is a technology-driven venture studio under TAVARA Holdings. This website serves as the primary marketing and information hub for:

- **Portfolio Companies**: Five innovative products (SERBISUYO, PALO FORE, PAMEALYA PLATE, ROLETA, UNIFIED LOCAL CARD)
- **BLAS X Framework**: Proprietary methodology for rapid product development
- **Founder & Company**: Information about Blas Ramos and the team
- **Acquisition Opportunities**: For strategic buyers and partners

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The site will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── globals.css          # Global styles
│   ├── portfolio/
│   │   ├── page.tsx         # Portfolio listing
│   │   └── [slug]/
│   │       └── page.tsx     # Portfolio detail pages
│   ├── model/
│   │   └── page.tsx         # BLAS X Framework page
│   ├── about/
│   │   └── page.tsx         # About & founder bio
│   ├── acquirers/
│   │   └── page.tsx         # For strategic acquirers
│   ├── contact/
│   │   └── page.tsx         # Contact form & information
│   └── api/
│       └── contact/
│           └── route.ts     # Contact form API
├── components/
│   ├── Header.tsx           # Navigation header
│   └── Footer.tsx           # Footer
└── data/
    └── portfolio.ts         # Portfolio apps data
```

## Key Features

### Pages

1. **Homepage** (`/`)
   - Hero section with key messaging
   - Operating metrics showcase
   - Featured portfolio preview
   - BLAS X framework teaser
   - Strategic CTA sections

2. **Portfolio** (`/portfolio`)
   - Grid of all 5 portfolio companies
   - Status badges (LIVE, In Development, Acquired)
   - Phase tracking (Build, Lift, Accelerate, Scale)
   - Market size and key metrics

3. **Portfolio Detail** (`/portfolio/[slug]`)
   - Deep dive into each company
   - Unique value proposition
   - Revenue model explanation
   - Competitive advantages
   - Technology stack
   - BLAS X phase tracker

4. **The Model** (`/model`)
   - Interactive BLAS X framework visualization
   - Phase-by-phase breakdown
   - Economics comparison (traditional vs BLAS X)
   - Key success factors
   - Framework metrics

5. **About** (`/about`)
   - Founder biography (Blas Ramos)
   - Career highlights
   - G.R.E.A.T. values
   - Certifications and credentials
   - Mission and vision
   - TAVARA Holdings connection

6. **For Acquirers** (`/acquirers`)
   - Why acquire Solomon Teknika companies
   - Valuation framework
   - 5-phase acquisition process
   - What acquirers receive
   - Post-acquisition success factors

7. **Contact** (`/contact`)
   - Contact form with validation
   - Direct email contact
   - Alternative contact methods
   - FAQ section
   - Quick links

### Design System

#### Colors
- **Navy**: `#1B2A4A` — Primary dark (headings)
- **Magenta**: `#9B2D7B` — Tech accent
- **Orange**: `#E8611A` — Primary CTA
- **Cream**: `#F0EBE0` — Light text on dark
- **Body Text**: `#B8B8A8` — Standard text
- **Dark BGs**: Multiple shades for depth

#### Typography
- **Headings**: Jost (institutional, clean)
- **Body**: Plus Jakarta Sans (modern geometric)
- **Code**: JetBrains Mono

#### Style
- Dark luxury aesthetic
- Bold typography with generous whitespace
- Smooth transitions and entrance animations
- Inspired by Stripe, Linear, Vercel

## Configuration

### Environment Variables

Create a `.env.local` file (see `.env.example`):

```bash
NEXT_PUBLIC_SITE_URL=https://solomontekniks.com
CONTACT_EMAIL=blas@tavaraholdings.com
```

### Tailwind Configuration

Tailwind is pre-configured with Solomon Teknika brand colors. Extend in `tailwind.config.js`.

### Font Loading

Google Fonts are loaded via `@import` in `globals.css`:
- Jost
- Plus Jakarta Sans
- JetBrains Mono

## API Routes

### POST `/api/contact`

Handles contact form submissions.

**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "company": "string (optional)",
  "subject": "string",
  "message": "string",
  "type": "general|acquisition|partnership|investment|other"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Message received"
}
```

**Note**: Currently logs to console. For production, integrate with SendGrid, Mailgun, or similar email service.

## Deployment to Vercel

### Prerequisites

1. Vercel account (https://vercel.com)
2. GitHub repository containing this code

### Deployment Steps

```bash
# 1. Commit code to GitHub
git add .
git commit -m "Initial Solomon Teknika site"
git push origin main

# 2. On Vercel dashboard:
# - Click "New Project"
# - Select your GitHub repository
# - Leave default settings
# - Click "Deploy"
```

### Configuration

The project includes a `vercel.json` configuration file optimized for Vercel deployment.

## Performance & Optimization

### Lighthouse Targets

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 95+

### Optimization Strategies

- Image optimization with next/image
- Font optimization via next/font
- CSS minification via Tailwind
- JavaScript code splitting
- Dynamic imports for large components
- Responsive images and lazy loading

### Build Output

```bash
npm run build
```

Creates optimized production build in `.next/` directory.

## Maintenance

### Adding a New Portfolio Company

1. Edit `src/data/portfolio.ts`
2. Add new `PortfolioApp` object to `portfolioApps` array
3. Create corresponding detail page (auto-generated from slug)

### Updating Content

- Founder info: `src/app/about/page.tsx`
- Metrics: `src/data/portfolio.ts` and respective pages
- Contact info: `src/app/contact/page.tsx` and `Footer.tsx`

### Adding New Pages

1. Create folder in `src/app/[page-name]/`
2. Add `page.tsx` component
3. Update navigation in `src/components/Header.tsx` if needed

## SEO

All pages include:
- Proper `<title>` and `<meta>` tags
- Open Graph metadata
- Structured data (can be enhanced)
- Mobile viewport optimization
- Canonical URLs

## Privacy & Legal

- Privacy Policy: `public/privacy.html`
- Terms of Service: `public/terms.html`

Links included in footer.

## Support

For questions about deployment or customization:
- Email: blas@tavaraholdings.com

## License

© 2026 Solomon Teknika / TAVARA Holdings. All rights reserved.

---

**Last Updated**: March 2026
**Version**: 1.0.0
