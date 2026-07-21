# Tracker App - Developer Guidelines

**Important:**
Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Core Technologies

- **Framework**: React Native & Expo (v54.0.0+)
- **Navigation**: Expo Router (file-based routing in `app/`)
- **Database**: Drizzle ORM & Expo SQLite (`src/db/`)
- **Animations**: React Native Reanimated & Haptics
- **State Management**: Zustand (`src/store/`)

## Architecture & Conventions

- **Routing**: `app/` directory uses Expo Router. Follow file-based routing conventions.
- **Components**: `src/components/` contains reusable UI components.
- **Database**: Database schema is in `src/db/schema.ts`. Drizzle migrations go in `drizzle/`.
- **Styling**: Avoid inline styles. Use `StyleSheet.create` with theme tokens from `src/theme/` (`colors`, `spacing`, `typography`). Strictly follow [DESIGN.md](./DESIGN.md) for all visual styling, UX patterns, and component anatomy.
- **State Management**: Zustand is used for global state management (e.g. `src/store/useTimerStore.ts`). Context providers (`src/context/`) and custom hooks (`src/hooks/`) are used to manage database access.

## Performance Guidelines (CRITICAL)

- **Timer State Rendering**: The active timer ticks every second. To prevent massive tree re-renders, **never** destructure the entire store (`const { elapsedSeconds } = useTimerStore()`). **Always** use specific Zustand selectors (e.g. `const elapsedSeconds = useTimerStore(state => state.elapsedSeconds)`) inside leaf components (like `ActiveTimerBar` or `TaskItem`). 
- **Memoization**: Always use `React.memo` for list items (like `TaskCard` and `TaskItem`) and `useCallback` for their handlers. For `React.memo` to work properly with Zustand, ensure list items only subscribe to state changes if they are the "active" item.
- **Animations**: Use `useNativeDriver: true` for React Native `Animated` timelines, or prefer `react-native-reanimated` to offload animations to the UI thread.
- **Component Extractions**: Be wary of duplicating heavy animated components. Extract things like `TimerPill` or `WheelItem` into memoized subcomponents to reduce recreation of animation interpolations.

## Useful Commands

- `npm run start` - Start Expo development server (with Metro)
- `npx expo start -c` - Start Expo and clear Metro bundler cache
- `npx drizzle-kit generate` - Generate SQL migrations from Drizzle schema
- `npm run reset-project` - Reset Expo template (if needed)
- `npm run lint` - Run ESLint

## Drizzle Migration Fixes (CRITICAL)

After running `npx drizzle-kit generate`, you **must** manually patch the generated `.sql` files in `drizzle/`:

1. **`DEFAULT false` bug**: `drizzle-kit` generates `DEFAULT false` for `integer` columns with `{ mode: 'boolean' }` and `.default(false)`. SQLite does not accept `false` as a default value — it must be `DEFAULT 0`. Find and replace all `DEFAULT false` → `DEFAULT 0` (and `DEFAULT true` → `DEFAULT 1`).

2. **`IF NOT EXISTS`**: Add `IF NOT EXISTS` to all `CREATE TABLE` and `CREATE INDEX` statements. Without this, migrations will crash if the tables already exist on the device from a prior run (e.g. `CREATE TABLE tasks` → `CREATE TABLE IF NOT EXISTS tasks`).
