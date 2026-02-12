# Website Verification Agent

A modern, automated website validation system. Validate website availability, detect redirects, and verify brand presence at scale with a beautiful, responsive UI.

## ✨ Features

- **Multiple Input Methods**: Manual entry, CSV upload, or bulk paste
- **Real-Time Validation**: Live progress tracking with visual feedback
- **Brand Presence Scoring**: Unique algorithm analyzing title, meta, headings, and content
- **Redirect Detection**: Automatically follows and reports redirect chains
- **Performance Metrics**: Response time tracking for each validation
- **Export Capabilities**: Download results as CSV or JSON
- **Modern UI**: Sleek design with 3D liquid effects and smooth animations
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router and SSR
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D effects
- **React Three Fiber** - React renderer for Three.js

## 🔧 Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/validate
```

## 📖 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Features Overview](FEATURES.md)
- [n8n Workflow Setup](N8N_WORKFLOW.md)
- [Hackathon Strategy](WINNING_STRATEGY.md)

## 🎯 Usage

### CSV Upload (Default)
1. Click "CSV Upload" tab
2. Upload CSV file (format: `company_name,url`)
3. Download sample CSV for reference

### Manual Entry
1. Click "Manual" tab
2. Enter company name and URL
3. Click "Validate"

### Bulk Paste
1. Click "Bulk Paste" tab
2. Paste entries (one per line)
3. Click "Validate All"

## 📊 Brand Presence Algorithm

- **Title Tag** (30 points)
- **Meta Description** (20 points)
- **H1 Headings** (25 points)
- **Body Content** (25 points)

**Total Score**: 0-100%

## 🚢 Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

Add environment variable in Vercel dashboard:
- `NEXT_PUBLIC_N8N_WEBHOOK_URL`

## 📝 License

MIT License

---
