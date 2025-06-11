import type { App } from 'vue';
import { createPinia } from "pinia";
import { createStorybookI18n } from "./i18n";
import { setupMockDatabase, setupMockStores, setupAuthMocks } from "./mocks";
import { setupQuasar, registerGlobalComponents } from "./quasar";
import { initializeThemeSystem } from "./theme-setup";

// CSS imports
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/roboto-font/roboto-font.css";
import "quasar/dist/quasar.css";
import "../../src/css/app.scss";
import "uno.css";

// Main setup function for Storybook
export const setupStorybook = (app: App) => {
  // Setup authentication mocks first
  setupAuthMocks();

  // Setup Pinia store
  const pinia = createPinia();
  app.use(pinia);

  // Setup i18n
  const i18n = createStorybookI18n();
  app.use(i18n);

  // Setup Quasar
  setupQuasar(app);

  // Register global components
  registerGlobalComponents(app);

  // Setup mock database
  setupMockDatabase();

  // Setup mock stores
  setupMockStores(app);

  // Initialize theme system
  initializeThemeSystem();
};
