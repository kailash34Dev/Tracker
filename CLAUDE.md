# Tracker App - Developer Guidelines

**Important:**
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Core Technologies

- **Framework**: React Native & Expo (v54.0.0+)
- **Navigation**: Expo Router (file-based routing in `app/`)
- **Database**: Drizzle ORM & Expo SQLite (`src/db/`)
- **Animations**: React Native Reanimated & Haptics

## Architecture & Conventions

- **Routing**: `app/` directory uses Expo Router. Follow file-based routing conventions.
- **Components**: `src/components/` contains reusable UI components.
- **Database**: Database schema is in `src/db/schema.ts`. Drizzle migrations go in `drizzle/`.
- **Styling**: Avoid inline styles. Use `StyleSheet.create` with theme tokens from `src/theme/` (`colors`, `spacing`, `typography`).
- **State Management**: Context providers (`src/context/`) and custom hooks (`src/hooks/`) are used to manage database access and timer state.

## Performance Guidelines (CRITICAL)

- The active timer ticks every second. Always use `React.memo` for list items (like `CategoryCard`) and `useCallback` for their handlers to prevent the entire screen from re-rendering every second.
- Always use `useNativeDriver: true` for React Native `Animated` timelines to offload animations to the UI thread.

## Useful Commands

- `npm run start` - Start Expo development server (with Metro)
- `npx expo start -c` - Start Expo and clear Metro bundler cache
- `npx drizzle-kit generate` - Generate SQL migrations from Drizzle schema
- `npm run reset-project` - Reset Expo template (if needed)
