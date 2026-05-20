# Project: AnimeSeason - Expo Mobile App

## Project Context

- **Objective**: Mobile application to check the current season's anime calendar and weekly release schedules.
- **Tech Stack**: React Native (Expo SDK), JavaScript (ES6+), Expo Router.
- **External API**: Jikan API v4 (REST).
- **Design Aesthetic**: Dark Mode by default, catalog-style UI (grid/cards), clean and modern typography.

## Build and Development Commands

- **Install Dependencies**: `npm install`
- **Start Development**: `npx expo start`
- **Clear Cache**: `npx expo start -c`
- **Run Android**: `npx expo run:android`
- **Run iOS**: `npx expo run:ios`

## Code Style & Standards

- **Components**: Functional components using Hooks (`useState`, `useEffect`, `useMemo`).
- **Navigation**: Use `expo-router` (File-based routing).
- **State Management**: Use `Context API` for global states (e.g., theme, favorites); `useState` for local API data.
- **Styling**: Native `StyleSheet` or `Styled Components`. Use a consistent spacing scale.
- **API Handling**: Centralize logic in `services/api.js`. Implement robust error handling and loading states.
- **Naming Conventions**: camelCase for functions/variables; PascalCase for Components; kebab-case for assets.
- **Routing**: Follow Expo Router conventions (`app/index.js`, `app/details/[id].js`).

## Folder Architecture

- `app/`: Routes and screen definitions (Expo Router).
- `components/`: Reusable UI components (AnimeCard, SeasonHeader, LoadingState).
- `services/`: Axios/Fetch configuration and Jikan API endpoints.
- `constants/`: Theme colors (palette), API keys, and layout constants.
- `utils/`: Helper functions for date formatting (converting JST to local Brasília time).
- `hooks/`: Custom hooks for API fetching or device orientation.

## Specific Constraints & Rules

- **Rate Limiting**: Always handle Jikan API 429 errors (Rate Limit) gracefully with retries or user-friendly messaging.
- **Performance**: Prioritize `FlatList` over `ScrollView` for anime lists to ensure smooth mobile performance.
- **Localization**: Ensure all release times are adjusted to the user's local timezone (UTC-3 for Brasília).
- **Imports**: Use absolute paths if configured, otherwise keep relative imports clean.
