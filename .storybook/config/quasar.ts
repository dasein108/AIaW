import type { App } from 'vue';
import { Quasar, Dialog, Notify, Loading, Dark } from "quasar";
import { materialSymbolsOutlined } from "@quasar/extras";

// Import global components
import AInput from "../../src/shared/components/global/AInput.js";
import VarsInput from "../../src/features/prompt/components/VarsInput.vue";

// Quasar configuration for Storybook
export const setupQuasar = (app: App) => {
  app.use(Quasar, {
    plugins: {
      Dialog,
      Notify,
      Loading,
      Dark,
    },
    iconSet: materialSymbolsOutlined,
    config: {
      dark: false, // Default to light mode
    },
  });
};

// Global component registration
export const registerGlobalComponents = (app: App) => {
  app.component('AInput', AInput);
  app.component('VarsInput', VarsInput);
};
