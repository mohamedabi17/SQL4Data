# 🎓 SQL4Data - Interactive SQL Learning Platform

<div align="center">

![SQL4Data](https://img.shields.io/badge/SQL-Learning%20Platform-4B32C3?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)

**Master SQL through interactive exercises with AI-powered feedback**

[🚀 Live Demo](#) • [📖 Documentation](STRIPE_SETUP_GUIDE.md) • [💡 Features](#features) • [🛠️ Setup](#installation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Pricing](#pricing)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**SQL4Data** is a modern, interactive SQL learning platform designed specifically for aspiring data engineers, analysts, and developers. Learn SQL by solving real-world problems with immediate feedback from AI-powered explanations.

### Why SQL4Data?

- 🎯 **Progressive Learning**: 100+ exercises from beginner to expert
- 🤖 **AI-Powered Feedback**: Get intelligent hints and explanations powered by Google Gemini
- 💰 **Affordable Pricing**: Only €4.99/month - accessible to everyone
- 🎮 **Gamified Experience**: Track progress, earn badges, level up
- 🌍 **Multi-language**: English, French, Arabic, Russian support
- 🔒 **Secure & Private**: OAuth authentication with Google/GitHub

---

## ✨ Features

### 🎓 Learning Experience

- **100+ SQL Exercises**: Covering SELECT, JOIN, Subqueries, CTEs, Window Functions, and more
- **Real Databases**: Practice with realistic datasets (Music Store, E-commerce)
- **Instant Validation**: Execute queries and see results in real-time
- **AI Explanations**: Stuck? Get pedagogical hints that guide without spoiling
- **Solution Access**: View optimal solutions after attempting (Premium)
- **Progress Tracking**: Monitor your XP, level, and completed tasks

### 🎮 Gamification

- **XP System**: Earn experience points for solving tasks
- **Level Progression**: Unlock new challenges as you advance
- **Badges & Achievements**: Showcase your SQL mastery
- **Task Locking**: First 5 tasks free, unlock more with XP
- **Leaderboards**: Coming soon!

### 💎 Premium Features (€4.99/month)

- ✅ **Unlimited AI Feedback** (50/day fair use limit)
- ✅ **All 100+ Exercises** unlocked
- ✅ **Unlimited Hints** on every task
- ✅ **Solution Viewer** for all exercises
- ✅ **Ad-Free Experience**
- ✅ **Priority Support**
- ✅ **Offline Access** (coming soon)

### 🆓 Free Tier

- ✅ Access to basic exercises
- ✅ 3 AI feedback requests per day
- ✅ Progress tracking
- ✅ 3 hints per day
- ❌ Limited exercise access
- ❌ No solution viewer

---

## 🛠️ Tech Stack

### Frontend

- **React 18** + **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **i18next** - Internationalization
- **React Aria** - Accessible UI components

### Backend

- **FastAPI** - High-performance Python API framework
- **PostgreSQL** - Robust SQL database
- **SQLAlchemy** - ORM with async support
- **Google Gemini AI** - AI-powered explanations
- **Stripe** - Payment processing
- **OAuth 2.0** - Secure authentication (Google, GitHub)

### DevOps

- **Docker** + **Docker Compose** - Containerization
- **Nginx** - Reverse proxy (production)
- **GitHub Actions** - CI/CD (coming soon)

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Docker** and Docker Compose
- **PostgreSQL** 16+ (or use Docker)

### Quick Start with Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/iDeBugger/sql-trainer.git
cd sql-trainer

# 2. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 3. Start all services
docker compose up -d

# 4. Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

### Manual Installation

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
python -m alembic upgrade head

# Start the server
uvicorn main:app --reload --port 8001
```

#### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Setup

```bash
# Run initial migration
docker exec -i sql4data_postgres psql -U sql4data_user -d sql4data_db < backend/migration_add_users.sql

# Verify database
docker exec -it sql4data_postgres psql -U sql4data_user -d sql4data_db
```

---

## 🎮 Usage

### For Learners

1. **Sign Up**: Create an account or sign in with Google/GitHub
2. **Choose a Task**: Start with beginner exercises
3. **Write SQL**: Use the built-in editor with syntax highlighting
4. **Execute & Learn**: Run your query and see results instantly
5. **Get Feedback**: Need help? Request AI-powered explanations
6. **Track Progress**: Watch your XP grow and level up!

### For Developers

```bash
# Run tests
npm test

# Lint code
npm run lint

# Type check
npm run type-check

# Format code
npm run format
```

---

## 💰 Pricing

### 📦 Pricing Plans

| Feature | Free | Premium (€4.99/mo) |
|---------|------|-------------------|
| **Basic Exercises** | ✅ | ✅ |
| **AI Feedback** | 3/day | 50/day |
| **Hints** | 3/day | Unlimited |
| **All Exercises** | ❌ | ✅ |
| **Solution Viewer** | ❌ | ✅ |
| **Ad-Free** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

### 💎 Special Offer

- **Monthly**: €4.99/month
- **Yearly**: €49.90/year (Save 2 months! Only €4.15/mo)

👉 [Subscribe Now](#) | [Setup Stripe Integration](STRIPE_SETUP_GUIDE.md)

---

## 🏗️ Architecture

```
sql4data/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── blocks/         # Feature-specific components
│   │   ├── store/          # Redux state management
│   │   ├── i18n/           # Translations
│   │   └── assets/         # Static assets
│   └── public/             # Public assets
│
├── backend/
│   ├── main.py             # FastAPI application
│   ├── models.py           # Database models
│   ├── auth/               # Authentication system
│   ├── payment_router.py   # Stripe integration
│   ├── usage_limits.py     # Usage tracking
│   ├── ai_explainer.py     # AI feedback system
│   └── query_executor.py   # SQL execution engine
│
├── database/
│   └── init.sql            # Database schema & seed data
│
└── docker-compose.yml      # Docker orchestration
```

### Key Components

1. **Query Executor**: Safely executes user SQL queries in read-only mode
2. **AI Explainer**: Generates pedagogical hints using Google Gemini
3. **Usage Limits**: Tracks daily AI feedback usage per user
4. **Payment System**: Handles Stripe subscriptions and webhooks
5. **Progress Tracker**: Monitors XP, levels, and completed tasks

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/sql4data_db

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Stripe (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# Security
JWT_SECRET_KEY=your_secret_key_min_32_chars
```

📖 **Full setup guide**: [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md)

---

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd backend
pytest

# E2E tests (coming soon)
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** for AI-powered explanations
- **Stripe** for payment processing
- **Chinook Database** for sample music data
- **React Community** for amazing tools and libraries

---

## 📞 Support

- 📧 Email: support@sql4data.com
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](https://github.com/iDeBugger/sql-trainer/issues)
- 📖 Docs: [Full Documentation](#)

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team/classroom features
- [ ] Custom SQL challenges
- [ ] Video tutorials integration
- [ ] Code review system
- [ ] Community forum
- [ ] API access for educators

---

<div align="center">

**Made with ❤️ by developers, for developers**

[⭐ Star us on GitHub](https://github.com/iDeBugger/sql-trainer) • [🐦 Follow on Twitter](#) • [💼 LinkedIn](#)

</div>
