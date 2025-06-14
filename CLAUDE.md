# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Framework & Architecture
- **Framework**: Project is built with Quasar Framework (Vue 3-based)
- **Component Library**: Use Quasar UI components (`q-*` components) whenever possible
- **Structure**: Feature-based modular architecture
- **State Management**: Pinia stores with persisted state

## Commands
- Build: `pnpm run build` or `quasar build`
- Development: `pnpm run dev` or `quasar dev`
- Lint: `pnpm run lint` or `pnpm run eslint:fix` to auto-fix issues
- Test: `pnpm test` or `jest [testFilePath]` for a single test
- Storybook: `pnpm run storybook`
- Type Check: `vue-tsc --noEmit`

## Code Style
- **Imports**: Order - builtin, external, internal, parent, sibling, index (alphabetized)
- **Types**: Use TypeScript, explicit return types for exported functions
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Component structure**: Vue 3 Composition API with `<script setup lang="ts">`
- **Quasar usage**: Use Quasar directives (v-close-popup, v-ripple) and plugins
- **Error handling**: Use try/catch blocks with appropriate error logging
- **Line spacing**: Add blank lines before functions, if statements, and returns
- **Formatting**: ESLint with Vue 3 strongly-recommended and TypeScript recommended rules
- **Documentation**: Add JSDoc comments for public APIs and complex functions

## Quasar-specific Guidelines
- Use Quasar's responsive classes for layout (col-*, q-pa-*, etc.)
- Leverage Quasar's built-in features like dark mode support
- Follow Quasar's material design patterns for consistent UI
- Use Quasar's utility functions and helpers when available