# ⚔️ Espada E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Security Score](https://img.shields.io/badge/Security_Score-9.3%2F10-brightgreen?style=for-the-badge&logo=shield)](./SECURITY_AUDIT_REPORT_FINAL.md)

A modern, secure, and feature-rich e-commerce platform built with cutting-edge technologies. Espada delivers a premium shopping experience with robust admin capabilities, advanced analytics, and enterprise-grade security.

## 🌟 Features

### 🛍️ Customer Experience
- **Modern Product Catalog** - Browse products with advanced filtering and search
- **Smart Shopping Cart** - Persistent cart with real-time updates using Zustand
- **Secure Checkout** - Streamlined checkout process with multiple payment options
- **User Authentication** - Secure sign-up/sign-in with Supabase Auth
- **Account Management** - User profiles, order history, and preferences
- **Wishlist** - Save favorite products for later
- **Responsive Design** - Optimized for all devices and screen sizes
- **Dark/Light Theme** - Toggle between themes with next-themes

### 🔧 Admin Panel
- **Comprehensive Dashboard** - Real-time analytics and key metrics
- **Product Management** - Full CRUD operations for products and categories
- **Order Management** - Track and manage customer orders
- **Customer Management** - View and manage customer accounts
- **Analytics & Reports** - Detailed insights with interactive charts (Recharts)
- **Content Management** - Manage homepage sections and content
- **Settings Panel** - Configure platform settings and preferences
- **Role-Based Access** - Secure admin authentication with JWT

### 🔒 Security Features
- **🛡️ Security Score: 9.3/10** - Independently audited and verified
- **Zero Critical Vulnerabilities** - Comprehensive security scanning passed
- **Supabase Auth Integration** - Industry-standard authentication
- **JWT Token Management** - Secure session handling
- **SQL Injection Protection** - Parameterized queries throughout
- **Environment Security** - Proper secrets management
- **Rate Limiting** - API protection against abuse
- **Role-Based Access Control** - Granular permission system

## 🚀 Tech Stack

### Frontend
- **[Next.js 15.1.0](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 5.8.3](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion 11.15.0](https://www.framer.com/motion/)** - Smooth animations
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[React Hot Toast](https://react-hot-toast.com/)** - Elegant notifications

### Backend & Database
- **[Supabase 2.58.0](https://supabase.com/)** - Backend-as-a-Service with PostgreSQL
- **[Supabase Auth](https://supabase.com/auth)** - Authentication and user management
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Database security

### State Management & Utils
- **[Zustand 5.0.3](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[JSON Web Tokens](https://jwt.io/)** - Secure token-based authentication
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS processing
- **[Autoprefixer](https://autoprefixer.github.io/)** - CSS vendor prefixing

## 🏁 Getting Started

### Prerequisites
- **Node.js** 18.0 or later
- **npm**, **yarn**, or **pnpm**
- **Supabase account** for database and authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/espada-ecommerce.git
   cd espada-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure your environment** (see Environment Setup below)

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_64_character_jwt_secret
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your project credentials** from Settings > API
3. **Set up your database schema** using the provided migrations
4. **Configure Row Level Security** policies for data protection

### JWT Secret Generation

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Project Structure

```
espada-ecommerce/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   ├── checkout/          # Checkout flow
│   └── ...
├── components/            # Reusable React components
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── checkout/         # Checkout components
│   ├── layout/           # Layout components
│   ├── sections/         # Homepage sections
│   └── ui/               # UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── auth/            # Authentication utilities
│   ├── types/           # TypeScript type definitions
│   └── ...
├── public/               # Static assets
├── scripts/              # Database and utility scripts
└── supabase/            # Supabase migrations and config
```

## 🚀 Production Deployment

### Build Optimization

The project is optimized for production with:
- **Static Site Generation (SSG)** for product pages
- **Server-Side Rendering (SSR)** for dynamic content
- **Image optimization** with Next.js Image component
- **Bundle optimization** with automatic code splitting
- **Performance monitoring** with Core Web Vitals

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Other Platforms
- **Netlify** - Connect your Git repository
- **Railway** - One-click deployment
- **DigitalOcean App Platform** - Container deployment

### Environment Variables for Production

Ensure all environment variables are properly set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### Admin Endpoints
- `GET /api/admin/analytics/overview` - Dashboard analytics
- `GET /api/admin/customers` - Customer management
- `GET /api/admin/orders` - Order management
- `POST /api/admin/products` - Product creation
- `PUT /api/admin/products/[id]` - Product updates

### Customer Endpoints
- `GET /api/products` - Product catalog
- `POST /api/checkout` - Process checkout
- `GET /api/customer-profile` - User profile

## 👨‍💼 Admin Panel

### Access Requirements
- Admin role assignment in Supabase
- Valid JWT token for authentication
- Proper permissions for specific actions

### Key Features
- **Real-time Analytics** - Sales, orders, and customer metrics
- **Product Management** - Add, edit, delete products
- **Order Processing** - Track and update order status
- **Customer Support** - View customer details and history
- **Content Management** - Update homepage and marketing content

### Admin Setup
Use the provided scripts to create admin users:
```bash
node scripts/create-admin.js
```

## 🔐 Security

### Security Measures
- **🛡️ Independently Audited** - Security score of 9.3/10
- **Authentication** - Supabase Auth with JWT tokens
- **Authorization** - Role-based access control
- **Data Protection** - Row Level Security policies
- **Input Validation** - Comprehensive input sanitization
- **SQL Injection Prevention** - Parameterized queries only
- **XSS Protection** - Content Security Policy headers
- **HTTPS Enforcement** - Secure data transmission

### Security Best Practices
- Regular security audits and updates
- Environment variable protection
- Secure session management
- Rate limiting on API endpoints
- Proper error handling without information leakage

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run the test suite** (`npm run test`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Coding Standards
- **TypeScript** - Use strict typing
- **ESLint** - Follow the configured rules
- **Prettier** - Format code consistently
- **Conventional Commits** - Use semantic commit messages

### Testing
- Write unit tests for utilities and hooks
- Add integration tests for API endpoints
- Test components with React Testing Library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Supabase Team** - For the excellent backend platform
- **Tailwind CSS** - For the utility-first CSS framework
- **Vercel** - For seamless deployment and hosting

## 📞 Support

For support and questions:
- **Documentation** - Check our comprehensive docs
- **Issues** - Report bugs on GitHub Issues
- **Discussions** - Join our GitHub Discussions
- **Email** - Contact us at support@espada-store.com

---

**Built with ❤️ by the Espada Team**

*Espada - Where style meets technology*
