# 🚀 Website Verification Agent - Hackathon Solution

A modern, automated website validation system that checks availability, detects redirects, and verifies brand presence at scale.

## ✨ Features

### Multiple Input Methods
- 📝 **Manual Entry** - Single website validation
- 📄 **CSV Upload** - Bulk validation from spreadsheet
- 📋 **Bulk Paste** - Quick paste of multiple entries

### Real-Time Validation
- ⚡ Live progress indicators
- 🎯 Status tracking (pending → processing → complete)
- 📊 Visual feedback with animations

### Comprehensive Analysis
- ✅ Website availability check
- 🔄 Redirect detection and chain following
- 🎨 Brand presence scoring (0-100%)
- ⏱️ Response time measurement

### Export & Reporting
- 💾 Export results to CSV
- 📦 Export results to JSON
- 📈 Visual statistics dashboard

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **n8n** - Workflow automation backend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- n8n instance running (or use mock API)

### Installation

```bash
cd frontend
npm install
```

### Configuration

1. Copy environment variables:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your n8n webhook URL:
```
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/validate
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

## 📋 n8n Workflow Setup

See [N8N_WORKFLOW.md](./N8N_WORKFLOW.md) for detailed workflow configuration.

### Quick Setup
1. Import the n8n workflow JSON
2. Configure webhook endpoint
3. Test with sample URLs
4. Update frontend environment variable

## 🎯 How It Works

### Frontend Flow
1. User inputs company name and URL
2. Frontend sends request to n8n webhook
3. Real-time status updates displayed
4. Results shown with visual indicators

### Backend Flow (n8n)
1. Receive webhook request
2. Fetch website with HTTP request
3. Detect redirects
4. Parse HTML content
5. Calculate brand presence score
6. Return structured response

### Brand Presence Algorithm
- **Title Tag** (30 pts) - Company name in page title
- **Meta Description** (20 pts) - Company name in description
- **H1 Tags** (25 pts) - Company name in headings
- **Body Content** (25 pts) - Company name frequency

## 📊 Project Structure

```
frontend/
├── app/
│   ├── api/validate/      # Mock API endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── ValidationDashboard.tsx  # Main dashboard
│   ├── InputSection.tsx         # Input methods
│   ├── ResultsSection.tsx       # Results display
│   ├── ResultCard.tsx           # Individual result
│   ├── AnimatedButton.tsx       # Animated button
│   └── FadeIn.tsx              # Fade animation
├── lib/
│   ├── api.ts            # API integration
│   ├── export.ts         # Export utilities
│   └── utils.ts          # Helper functions
└── public/
    ├── grid.svg          # Background pattern
    └── sample-companies.csv  # Test data
```

## 🎨 Design Philosophy

- **Automation Theme** - Dark UI with blue/cyan accents
- **Real-Time Feedback** - Users always know what's happening
- **Progressive Disclosure** - Simple by default, powerful when needed
- **Accessibility** - Keyboard navigation, screen reader support

## 🏆 Hackathon Strategy

See [WINNING_STRATEGY.md](./WINNING_STRATEGY.md) for:
- Demo script
- Competitive advantages
- Judging criteria alignment
- Post-hackathon roadmap

## 🧪 Testing

### Manual Testing
1. Use sample CSV file: `/sample-companies.csv`
2. Test with known URLs (Google, GitHub, etc.)
3. Test error cases (invalid URLs)

### Test Cases
- ✅ Valid URL with no redirect
- ✅ URL with redirect chain
- ✅ Invalid/unreachable URL
- ✅ Slow-loading website
- ✅ Batch processing (10+ URLs)

## 🔧 Configuration

### Environment Variables
- `NEXT_PUBLIC_N8N_WEBHOOK_URL` - n8n webhook endpoint

### Customization
- Update colors in `tailwind.config.ts`
- Modify brand scoring in n8n workflow
- Adjust timeout values in API calls

## 📈 Future Enhancements

- [ ] Scheduled monitoring
- [ ] Email/Slack notifications
- [ ] Historical data tracking
- [ ] Trend analysis charts
- [ ] Public API
- [ ] Team collaboration
- [ ] Mobile app

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

## 📄 License

MIT License - feel free to use for your own projects

## 🙏 Acknowledgments

- Next.js team for amazing framework
- n8n for workflow automation
- Framer Motion for smooth animations

---

Built with ❤️ for the hackathon
