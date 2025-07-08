# CRM React Client

This is the client-side application for the CRM system, built with React and Vite.

## Project Structure

```
client/
  ├── public/                # Static assets (served as-is)
  ├── src/                   # Source code
  │   ├── assets/            # Images, videos, and other static assets
  │   ├── components/        # Reusable UI and feature components
  │   │   ├── attendance/
  │   │   ├── department/
  │   │   ├── forms/
  │   │   ├── profile/
  │   │   ├── ui/
  │   │   └── ...
  │   ├── hooks/             # Custom React hooks
  │   │   ├── department/
  │   │   └── user/
  │   ├── layouts/           # Layout wrappers
  │   ├── pages/             # Route-level components (pages)
  │   ├── services/          # API utilities and service logic
  │   ├── store/             # Redux slices and store configuration
  │   ├── App.jsx            # Main app component
  │   ├── AppLayout.jsx      # App layout wrapper
  │   ├── main.jsx           # App entry point
  │   ├── App.css            # App-level styles
  │   └── index.css          # Global styles
  ├── .gitignore
  ├── eslint.config.js
  ├── index.html
  ├── package.json
  ├── package-lock.json
  ├── vite.config.js
  └── README.md
```

## Conventions & Best Practices

- **Component Organization:**
  - Place reusable UI and feature components in `src/components/`.
  - Use subfolders for logical grouping (e.g., `profile/`, `forms/`).
  - Route-level components go in `src/pages/`.
- **State Management:**
  - Use Redux Toolkit for global state (`src/store/`).
  - Use custom hooks for encapsulating logic (`src/hooks/`).
- **Styling:**
  - Use `App.css` and `index.css` for global/app styles.
  - Prefer CSS modules or styled-components for component-level styles (if used).
- **API Calls:**
  - Centralize API logic in `src/services/`.
- **Assets:**
  - Store images, videos, and static files in `src/assets/`.
- **Testing:**
  - (Recommended) Place tests alongside components or in a `__tests__/` folder.
- **Naming:**
  - Use consistent naming (camelCase for files, PascalCase for components).
- **Linting:**
  - Follow ESLint rules defined in `eslint.config.js`.
- **Documentation:**
  - Keep this README up to date with structure and conventions.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

---

For backend/server setup, see the corresponding server directory.
