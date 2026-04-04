# HargaRakyat 🛒

> **Smart Grocery Price Tracking & Optimization for Malaysia**
>
> Empowering Malaysian consumers to make informed food shopping decisions through real-time price monitoring, trend analysis, and AI-powered recommendations.

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen?style=for-the-badge&logo=web)](https://gitlauk-hargarakyat.lovable.app)
[![Build Status](https://img.shields.io/badge/Status-Active%20Development-blue?style=for-the-badge)](https://github.com)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase-informational?style=for-the-badge)](https://github.com)

---

## 📑 Quick Navigation

- [About](#-about)
- [Core Features](#-core-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Data Architecture](#-data-architecture)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)

---

## 📌 About

### What is HargaRakyat?

**HargaRakyat** (meaning "*People's Price*" in Malay) is a comprehensive grocery price intelligence platform designed to help Malaysian consumers save money and make smarter shopping decisions. 

**The Problem:** Malaysian families spend significant portions of their budget on groceries without visibility into price trends, store comparisons, or optimal purchase timing. Small price differences compound across weeks and months.

**The Solution:** HargaRakyat aggregates real-time grocery price data from across Malaysia, identifies trends, and provides:
- **Price comparisons** across stores and regions
- **Trend analysis** showing historical price movements
- **AI-powered recommendations** for best shopping times
- **Basket optimization** to find cheapest combinations for your shopping list
- **Geographic insights** to locate best-priced items near you

### Who is it for?

- 👨‍👩‍👧‍👦 **Budget-conscious Malaysian households** managing tight grocery budgets
- 🛍️ **Price-sensitive shoppers** who want to maximize purchasing power
- 📊 **Data-driven consumers** interested in market trends and food economics
- 🏘️ **Community planners** tracking inflation and affordability

---

## ✨ Core Features

| Feature | Description |
|---------|-------------|
| 📊 **Price Tracking & Analytics** | Real-time monitoring of 2000+ grocery items across multiple stores and states |
| 🤖 **AI Chat Advisor** | LLM-powered chatbot providing personalized advice on best buying times, price trends, and savings strategies |
| 🛒 **Grocery Optimizer** | Smart basket calculator that finds the cheapest store combination for your custom shopping list with geolocation support |
| 📈 **Price Forecasting** | Machine learning-driven trend predictions showing near-term price direction (up/down/stable) |
| 🗺️ **Price Map** | Interactive geographic visualization of prices across Malaysian states and store locations |
| 📰 **Market News & Insights** | Curated food/grocery news and market impact analysis |
| 📅 **Best Time to Buy** | Intelligent recommendations for optimal purchase timing based on historical trends and forecasts |
| 💾 **Basket Tracker** | Monitor and manage shopping basket contents with real-time cost calculations |
| 📖 **Historical Analysis** | Year-over-year comparisons and seasonal trend analysis |
| 🏪 **Store Rankings** | Dynamic rankings of stores by overall price competitiveness and specific categories |

---

## 🛠️ Tech Stack

### **Frontend** 🎨
- **Framework:** React 18.3 + TypeScript
- **Build Tool:** Vite (optimized for rapid development and production builds)
- **Styling:** TailwindCSS 3.x with dark mode support
- **UI Components:** Shadcn/UI + Radix UI (accessible, unstyled primitives)
- **Data Visualization:**
  - Recharts 2.15.4 (price charts, trend graphs)
  - Leaflet 1.9.4 + React-Leaflet 4.2.1 (interactive maps)
- **State Management:** TanStack React Query 5.83.0 (server state, caching, synchronization)
- **Forms & Validation:** React Hook Form 7.61 + Zod schema validation
- **Routing:** React Router v6.30 (SPA navigation)
- **Additional Libraries:**
  - Markdown rendering (React-Markdown 10.1)
  - Toast notifications (Sonner 1.7.4)
  - Date utilities (date-fns 3.6)
  - Icon library (Lucide React)

### **Backend & Database** 💾
- **Database:** Supabase (PostgreSQL-based)
  - Real-time sync capabilities
  - Edge Functions for serverless logic
  - Built-in authentication
- **SDK:** @supabase/supabase-js v2.101

### **Hosting & Deployment** 🚀
- **Platform:** [Lovable](https://lovable.dev) — Full-stack development platform

---

## 📂 Project Structure

```
HargaRakyat-PutraHack2026/
├── src/                              # Main application source code
│   ├── components/                   # Reusable React components
│   │   ├── DashboardHome.tsx         # Main dashboard interface
│   │   ├── GroceryOptimizer.tsx      # Shopping list optimizer
│   │   ├── AIChatAdvisor.tsx         # AI chatbot interface
│   │   ├── BestTimeToBuy.tsx         # Purchase timing recommendations
│   │   ├── PriceChart.tsx            # Price visualization
│   │   ├── PriceMap.tsx              # Geographic price view
│   │   ├── PriceForecast.tsx         # Trend forecasting display
│   │   ├── BasketTracker.tsx         # Shopping cart management
│   │   ├── FoodNewsWidget.tsx        # News integration
│   │   ├── YearlyOverview.tsx        # Historical trends
│   │   └── [other components]        # AppHeader, Sidebar, Footer, etc.
│   ├── pages/                        # Route page components
│   │   ├── Dashboard.tsx             # /dashboard route
│   │   ├── Landing.tsx               # / landing page
│   │   ├── News.tsx                  # /news market insights
│   │   └── NotFound.tsx              # 404 page
│   ├── hooks/                        # Custom React hooks
│   │   └── usePriceCatcher.ts        # Data fetching hook
│   ├── lib/                          # Utilities & helpers
│   │   ├── formatters.ts             # Number/date formatting
│   │   ├── geo.ts                    # Geolocation utilities
│   │   └── models.ts                 # TypeScript type definitions
│   ├── integrations/                 # External service clients
│   │   └── supabase.ts               # Database client
│   ├── App.tsx                       # Router configuration
│   ├── main.tsx                      # Application entry point
│   ├── index.css                     # Global styles
│   └── vite-env.d.ts                 # Vite type declarations
│
├── public/                           # Static assets & pre-aggregated data
│   ├── data/                         # Live JSON datasets
│   │   ├── items.json                # Item master (2000+ items)
│   │   ├── premises.json             # Store locations with coordinates
│   │   ├── prices_agg.json           # Current aggregated prices
│   │   ├── prices_agg_jan.json       # January baseline for comparison
│   │   ├── prices_history.json       # Historical stats by item/state
│   │   ├── prices_by_state.json      # State-level aggregates
│   │   ├── prices_yearly.json        # Yearly trend snapshots
│   │   ├── price_forecast.json       # ML predictions & trends
│   │   ├── cheapest_stores.json      # Store price rankings
│   │   └── yearly_overview.json      # Year-over-year analysis
│   ├── images/                       # Image assets
│   └── robots.txt                    # SEO configuration
│
├── price_table_dataset/              # Historical price data (CSVs)
│   ├── pricecatcher_2025-03.csv      # Monthly snapshots
│   ├── pricecatcher_2025-04.csv      # (March 2025 → March 2026)
│   └── [more monthly CSVs...]
│   └── premise_item_lookup/          # Reference tables
│       ├── lookup_item.csv           # Item master reference
│       └── lookup_premise.csv        # Store reference
│
├── analysis/                         # Python analysis & validation scripts
│   ├── detailed_csv_analysis.py      # Data quality checks
│   ├── verify_csv_item_count.py      # Inventory validation
│   ├── compare_averages.py           # Statistical analysis
│   └── [other analysis scripts...]
│
├── supabase/                         # Backend configuration
│   ├── config.toml                   # Supabase project config
│   └── functions/                    # Serverless Edge Functions
│
├── Configuration Files
│   ├── package.json                  # Dependencies & scripts
│   ├── bun.lockb                     # Bun lock file
│   ├── tsconfig.json                 # TypeScript configuration
│   ├── vite.config.ts                # Vite build configuration
│   ├── tailwind.config.ts            # TailwindCSS theme
│   ├── postcss.config.js             # PostCSS plugins
│   ├── vitest.config.ts              # Testing configuration
│   ├── playwright.config.ts          # E2E testing setup
│   ├── eslint.config.js              # Code linting rules
│   └── components.json               # UI component registry

```

### **Key Directories Explained**

| Directory | Purpose |
|-----------|---------|
| `src/components/` | Modular React UI components (dashboard, charts, forms) |
| `src/pages/` | Route-level page components (Landing, Dashboard, News) |
| `public/data/` | Pre-processed JSON files served to frontend (live datasets) |
| `price_table_dataset/` | Raw monthly CSV price snapshots for historical analysis |
| `analysis/` | Python validation scripts ensuring data quality |
| `supabase/` | Database schema and serverless function definitions |

---

## 📊 Data Architecture

### **Data Pipeline**

```
CSV Sources (PriceCatcher)
    ↓
Raw Data (price_table_dataset/*.csv)
    ↓
Python Analysis & Processing (analysis/*.py)
    ↓
Aggregated JSON (public/data/*.json)
    ↓
React Frontend (Chart, Map, Optimizer components)
    ↓
Supabase (Real-time sync & user interactions)
```

### **Data Coverage**

**Time Period:** March 2025 – March 2026 (13 months of continuous tracking)

**Items Tracked:** 2,000+ grocery items across 8 categories:
- 🥬 **Barangan Segar** (Fresh) — Chicken, meat, seafood, vegetables, fruits, eggs
- 🌾 **Barangan Kering** (Dry Goods) — Beans, nuts, spices, dried seafood
- 📦 **Barangan Berbungkus** (Packaged) — Rice, condiments, oils, instant noodles
- 🥤 **Minuman** (Beverages) — Fresh milk, cordials, ready-to-drink
- 🧴 **Produk Kebersihan** (Hygiene) — Personal care, household cleaning
- 👶 **Susu & Barangan Bayi** (Baby) — Infant formula, baby food
- 🍜 **Makanan Siap Masak** (Ready-made) — Cooked rice, noodles
- 🛍️ **Barangan Kedai Serbaneka** (General) — Medicines, cosmetics, snacks

**Premises:** 100+ stores and retail locations across Malaysia with geographic coordinates

**Key Datasets:**
| File | Contains |
|------|----------|
| `items.json` | Item codes, names, units, categories (searchable master) |
| `premises.json` | Store names, locations, coordinates (geolocation data) |
| `prices_agg.json` | Current aggregated prices by item |
| `prices_history.json` | Historical stats: min/max/avg prices by state/time |
| `price_forecast.json` | ML predictions: trend direction, slope, forecasted values |
| `prices_by_state.json` | Regional price variations |
| `cheapest_stores.json` | Store rankings by price competitiveness |

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** 18+ or **Bun** 1.0+
- **Git** for version control
- **Supabase** account (free tier works for development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/HargaRakyat-PutraHack2026.git
   cd HargaRakyat-PutraHack2026
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or: npm install / yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env.local file with:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**
   ```bash
   bun run dev
   # Server runs at http://localhost:8080
   ```

5. **Open in browser**
   - Development: [http://localhost:8080](http://localhost:8080)
   - Live: [https://gitlauk-hargarakyat.lovable.app](https://gitlauk-hargarakyat.lovable.app)

---

## 📜 Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Start Dev** | `bun run dev` | Run Vite dev server with hot reload |
| **Build** | `bun run build` | Optimize production build |
| **Preview** | `bun run preview` | Preview production build locally |
| **Test** | `bun run test` | Run unit & component tests with Vitest |
| **E2E Test** | `bun run test:e2e` | Run end-to-end tests with Playwright |
| **E2E Debug** | `bun run test:e2e:debug` | Debug mode for E2E tests |
| **Lint** | `bun run lint` | Check code quality with ESLint |
| **Type Check** | `bun run type-check` | Verify TypeScript compilation |

### **Example Workflow**

```bash
# 1. Install dependencies
bun install

# 2. Start development server
bun run dev

# 3. In another terminal, run tests
bun run test

# 4. Check for linting issues
bun run lint

# 5. Build for production
bun run build
```

---

### **Technologies & Patterns**

| Pattern | Technology | Why |
|---------|-----------|-----|
| **State Management** | React Query (TanStack) | Efficient server state, automatic caching, sync |
| **Styling** | TailwindCSS | Rapid iteration, consistent design system |
| **Form Handling** | React Hook Form + Zod | Type-safe, performant forms with validation |
| **Data Viz** | Recharts | Responsive, accessible charts without heavy deps |
| **Maps** | Leaflet + React-Leaflet | Lightweight, performant geographic visualization |
| **Backend** | Supabase + Edge Functions | PostgreSQL with serverless compute |

### **Development Framework**

- **Lovable**: Full-stack development platform enabling rapid iteration
- **Vite**: Next-generation frontend build tool (10x faster than webpack)
- **TypeScript**: Type safety across the entire codebase
- **ESLint + Prettier**: Automated code quality enforcement

---

**Made with ❤️ for Malaysian consumers. Empowering smart shopping, one price at a time.**

---

<div align="center">

**[🔝 Back to Top](#hargarakyat-)**

Last Updated: April 2026 | Active Development ✅

by team GitLauk
</div>