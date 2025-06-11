import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import { setupStorybook } from "./config/setup";
import { createStoryDecorator } from "./config/story-decorator";

// Setup Storybook with all configurations
setup(setupStorybook);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    createStoryDecorator(),
  ],
};

export default preview;
