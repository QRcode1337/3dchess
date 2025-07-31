# 3D Chess Project

A 3D chess game built with Next.js, React, Three.js, and TypeScript.

## 🚀 Quick Start

The main project is located in the `chess-3d/` directory.

```bash
# Navigate to the project directory
cd chess-3d

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```text
3dchess/
├── chess-3d/           # Main Next.js application
│   ├── app/           # Next.js 13+ app directory
│   ├── components/    # React components
│   ├── lib/          # Utility libraries
│   ├── hooks/        # Custom React hooks
│   ├── types/        # TypeScript type definitions
│   └── package.json  # Project dependencies
└── README.md         # This file
```

## 🔧 Recent Updates

✅ **Security Fixes**: All dependabot vulnerabilities resolved  
✅ **Three.js Upgrade**: Updated to v0.170.0 with proper ES modules  
✅ **React 19 Support**: Compatible with the latest React version  
✅ **TypeScript**: Full type safety with @types/three  

For detailed information about the dependabot fixes, see `chess-3d/README-DEPENDABOT-FIXES.md`.

## 🎮 Features

- 3D chess board with Three.js graphics
- Interactive piece movement
- Modern React hooks for game state
- Responsive design with Tailwind CSS
- TypeScript for type safety

## 🛠 Development

Make sure you're in the `chess-3d/` directory when running any npm/pnpm commands:

```bash
cd chess-3d
pnpm dev    # Start development server
```

The application will be available at `http://localhost:3000`.
