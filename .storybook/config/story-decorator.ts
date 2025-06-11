import { onMounted, nextTick } from "vue";
import { setupStoryTheme } from "./theme-setup";

// Story decorator for consistent theme and layout
export const createStoryDecorator = () => {
  return (story: any, context: any) => ({
    components: { story },
    template: '<div class="q-pa-md"><story /></div>',
    setup() {
      onMounted(async () => {
        await nextTick();

        try {
          // Setup theme system and return cleanup function
          const cleanup = setupStoryTheme();

          // Cleanup listener when component unmounts
          return cleanup;
        } catch (error) {
          console.error('Theme initialization failed in decorator:', error);
        }
      });

      return {};
    },
  });
};
