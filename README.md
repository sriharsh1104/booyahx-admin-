# BooyahX Admin Dashboard

A modern admin dashboard built with Vite, React, TypeScript, and SCSS, integrated with the BooyahX Backend API.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with TypeScript
- 🎨 **SCSS** - Modular styling with variables and mixins
- 🔐 **Authentication** - Login and protected routes
- 📦 **Code Splitting** - Route-based lazy loading
- 🏗️ **Clean Architecture** - Separated UI and business logic
- 🔌 **API Integration** - Axios-based API client with interceptors

## Project Structure

```
booyahx-admin/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── _variables.scss      # SCSS variables
│   │       ├── _mixins.scss         # SCSS mixins
│   │       └── dashboard.scss       # Global styles
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.tsx        # UI component
│   │   │   ├── Dashboard.logic.ts   # Business logic
│   │   │   └── Dashboard.scss       # Component styles
│   │   ├── Auth/
│   │   │   └── Login/
│   │   │       ├── Login.tsx
│   │   │       ├── Login.logic.ts
│   │   │       └── Login.scss
│   │   └── common/                  # Shared components
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance
│   │   │   ├── auth.api.ts          # Auth endpoints
│   │   │   ├── health.api.ts        # Health endpoints
│   │   │   └── index.ts
│   │   └── types/
│   │       └── api.types.ts         # TypeScript types
│   ├── hooks/
│   │   └── useApi.ts                # Custom API hook
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── App.tsx                      # Main app with routing
│   └── main.tsx                     # Entry point
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Component Pattern

Each feature component follows this structure:
- **ComponentName.tsx** - Pure UI component (presentation layer)
- **ComponentName.logic.ts** - Business logic, API calls, state management
- **ComponentName.scss** - Component-specific styles

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.gaminghuballday.buzz

# API Request Timeout (optional, default: 10000ms)
VITE_API_TIMEOUT=10000

# Application Title (optional, default: booyahx-admin)
VITE_APP_TITLE=booyahx-admin
```

**Required:**
- `VITE_API_BASE_URL` - Backend API base URL

**Optional:**
- `VITE_API_TIMEOUT` - API request timeout in milliseconds (default: 10000)
- `VITE_APP_TITLE` - Application title (default: booyahx-admin)

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The project is configured to work with the BooyahX Backend API:

- **Base URL**: `https://api.gaminghuballday.buzz`
- **Authentication**: Bearer token stored in localStorage
- **Endpoints**:
  - `/api/auth/login` - Admin login
  - `/api/auth/profile` - Get admin profile
  - `/health` - Health check

## Path Aliases

The project uses path aliases for cleaner imports:

- `@components/*` → `src/components/*`
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@hooks/*` → `src/hooks/*`
- `@assets/*` → `src/assets/*`
- `@/*` → `src/*`

## Routing

- `/` - Redirects to dashboard
- `/login` - Login page
- `/dashboard` - Protected dashboard (requires authentication)

## Styling

- Global styles: `src/assets/styles/dashboard.scss`
- Component styles: Each component has its own `.scss` file
- Variables and mixins are imported in each component's SCSS file

## Code Splitting

Routes are lazy-loaded using React.lazy() for optimal performance:

```typescript
const Login = lazy(() => import('@components/Auth/Login/Login'));
const Dashboard = lazy(() => import('@components/Dashboard/Dashboard'));
```

## License

MIT
