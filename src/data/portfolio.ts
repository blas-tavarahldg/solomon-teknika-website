export interface PortfolioApp {
  slug: string
  name: string
  description: string
  status: 'LIVE' | 'In Development' | 'Acquired'
  marketSize: string
  marketSizeValue: number
  launchDate: string
  website?: string
  tagline: string
  longDescription: string
  uniqueAngle: string
  revenueModel: string
  targetMarket: string
  techStack: string[]
  phase: 'Build' | 'Lift' | 'Accelerate' | 'Scale'
  metrics: Array<{ label: string; value: string }>
  competitiveAdvantage: string[]
}

export const portfolioApps: PortfolioApp[] = [
  {
    slug: 'serbisuyo',
    name: 'SERBISUYO',
    description: 'Home Services Marketplace connecting professionals with homeowners',
    status: 'LIVE',
    marketSize: 'US home services $893B by 2032',
    marketSizeValue: 893,
    launchDate: '2024',
    website: 'https://serbisuyo.com',
    tagline: 'Home Services. Reimagined.',
    longDescription: 'SERBISUYO is a hybrid home services marketplace that combines fixed-price services with competitive bidding. It connects homeowners with vetted service professionals across maintenance, repairs, and home improvement categories.',
    uniqueAngle: 'Hybrid pricing model (fixed + bidding) reduces friction for both sides. Subscription-ready architecture for recurring services.',
    revenueModel: 'Commission on transactions (8-12%), premium professional listings, subscription tiers',
    targetMarket: 'Homeowners aged 25-65 in major US metropolitan areas; Licensed professionals seeking customer flow',
    techStack: ['Next.js', 'React', 'Supabase', 'PayMongo', 'GCash', 'Vercel'],
    phase: 'Lift',
    metrics: [
      { label: 'Status', value: 'LIVE' },
      { label: 'TAM', value: '$893B' },
      { label: 'Phase', value: 'Lift' },
      { label: 'Transaction Model', value: 'Hybrid' },
    ],
    competitiveAdvantage: [
      'Proprietary hybrid pricing algorithm',
      'Built-in quality assurance and reviews',
      'Mobile-first design for field professionals',
      'Real-time matching technology',
    ],
  },
  {
    slug: 'palo-fore',
    name: 'PALO FORE',
    description: 'All-in-one golf lifestyle ecosystem',
    status: 'In Development',
    marketSize: 'Global golf market $100B+',
    marketSizeValue: 100,
    launchDate: 'Q3 2024',
    tagline: 'Golf. Elevated.',
    longDescription: 'PALO FORE is a comprehensive golf platform integrating course discovery, booking, community, scorecard tracking, equipment marketplace, and professional coaching. It aims to unite golfers across all skill levels in a single ecosystem.',
    uniqueAngle: 'First platform to combine course bookings, community, marketplace, and coaching in one app. Exit priority #1 within Solomon Teknika portfolio.',
    revenueModel: 'Booking commissions (10-15%), equipment marketplace fees (5-8%), coaching subscription ($9.99-$29.99/month), premium memberships',
    targetMarket: 'Amateur and semi-professional golfers aged 30-65 globally; Golf course operators; Equipment manufacturers',
    techStack: ['Next.js 14', 'React', 'Supabase', 'Vercel', 'PayMongo'],
    phase: 'Build',
    metrics: [
      { label: 'Status', value: 'In Development' },
      { label: 'Priority', value: '#1 Exit' },
      { label: 'Phase', value: 'Build' },
      { label: 'Exit Priority', value: '#1' },
    ],
    competitiveAdvantage: [
      'Unified ecosystem (no fragmentation across apps)',
      'Community-driven engagement',
      'Professional instructor network',
      'Equipment marketplace integration',
    ],
  },
  {
    slug: 'pamealya-plate',
    name: 'PAMEALYA PLATE',
    description: 'Home-cooked meal subscriptions connecting families with home cooks',
    status: 'In Development',
    marketSize: 'US meal subscription market $12B+ annually',
    marketSizeValue: 12,
    launchDate: 'Q2 2024',
    tagline: '"Pamilya" Meals at Your Door',
    longDescription: 'PAMEALYA PLATE creates a marketplace for authentic, home-cooked meals. Home chefs prepare and deliver traditional cuisines, fostering community while providing income to local food entrepreneurs.',
    uniqueAngle: 'Home-cooked authenticity vs. corporate meal services. "Pamilya" (family) positioning emphasizes trust, cultural connection, and personal touch. Subscription model with flexibility.',
    revenueModel: 'Commission on meal sales (15-20%), delivery fee integration, premium chef subscriptions, corporate catering partnerships',
    targetMarket: 'Health-conscious professionals; Parents seeking authentic cuisines; Immigrant communities; Home food entrepreneurs',
    techStack: ['Next.js', 'React', 'Node.js', 'PostgreSQL', 'Stripe', 'Twilio'],
    phase: 'Build',
    metrics: [
      { label: 'Status', value: 'In Development' },
      { label: 'Market', value: '$12B+' },
      { label: 'Phase', value: 'Build' },
      { label: 'Model', value: 'Subscription' },
    ],
    competitiveAdvantage: [
      'Authenticity-first positioning',
      'Community and cultural connection',
      'Creator economy model (chef incentives)',
      'Flexible subscription with quality guarantees',
    ],
  },
  {
    slug: 'roleta',
    name: 'ROLETA',
    description: 'Raffles and rewards platform optimized for emerging markets',
    status: 'In Development',
    marketSize: 'Asian gaming and rewards market $250B+',
    marketSizeValue: 250,
    launchDate: 'Q4 2024',
    tagline: 'Win. Reward. Celebrate.',
    longDescription: 'ROLETA provides a free-entry raffle and rewards platform compliant with Philippine gambling regulations. Users accumulate points through engagement, brand partnerships, and social sharing to enter raffles.',
    uniqueAngle: 'Free-entry model (no gambling) + rewards creates viral engagement. Built specifically for PH regulatory environment. Entry via points, not cash.',
    revenueModel: 'Brand partnership fees, sponsored raffles, premium rewards catalog, transaction fees on redemptions',
    targetMarket: 'Mobile-first users aged 18-45 in Southeast Asia (primary: Philippines); Brands seeking customer engagement; Retailers',
    techStack: ['Next.js', 'React Native', 'Node.js', 'Firebase', 'Stripe'],
    phase: 'Build',
    metrics: [
      { label: 'Status', value: 'In Development' },
      { label: 'Market Focus', value: 'PH/Asia' },
      { label: 'Phase', value: 'Build' },
      { label: 'Model', value: 'Free-Entry' },
    ],
    competitiveAdvantage: [
      'Compliant with PH gambling regulations',
      'Points-based (no cash gambling)',
      'Viral engagement mechanics',
      'Strong brand partnership potential',
    ],
  },
  {
    slug: 'unified-local-card',
    name: 'UNIFIED LOCAL CARD',
    description: 'Coalition loyalty program aggregating local merchant rewards',
    status: 'In Development',
    marketSize: 'Global loyalty market $500B+ annually',
    marketSizeValue: 500,
    launchDate: 'Q1 2025',
    tagline: 'One Card. All Benefits.',
    longDescription: 'UNIFIED LOCAL CARD is a universal loyalty card system unifying fragmented local merchant programs. Customers earn and redeem points across participating retailers, restaurants, and services without multiple cards.',
    uniqueAngle: 'Consolidation play: customers tired of wallet bloat; merchants gain customer data and frequency. Cross-merchant insights unlock new value.',
    revenueModel: 'Merchant subscription fees ($99-$499/month), transaction fees (2-3%), data analytics premium, B2B insights licensing',
    targetMarket: 'Local merchants (restaurants, retail, services); Frequent consumers; Regional retail chains; SMBs in emerging markets',
    techStack: ['Next.js', 'React Native', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
    phase: 'Build',
    metrics: [
      { label: 'Status', value: 'In Development' },
      { label: 'Market Size', value: '$500B+' },
      { label: 'Phase', value: 'Build' },
      { label: 'Model', value: 'Coalition' },
    ],
    competitiveAdvantage: [
      'Solves wallet fragmentation',
      'Cross-merchant data insights',
      'Scalable merchant acquisition',
      'Regional-first strategy',
    ],
  },
]
