import { useUserPerfsStore } from "../../src/stores/user-perfs";
import { themeToggle } from "../theme-toggle";

// Create a mock user preferences store for Storybook
const createMockUserPerfsStore = () => {
  return {
    data: {
      darkMode: false,
      themeHue: 300,
      // Add other properties as needed
    },
    ready: true
  };
};

// Initialize theme system for Storybook
export const initializeThemeSystem = () => {
  try {
    let userPerfsStore;

    // Try to use the real store, fallback to mock if it fails
    try {
      userPerfsStore = useUserPerfsStore();
    } catch (error) {
      console.warn('Failed to initialize real user preferences store, using mock:', error);
      userPerfsStore = createMockUserPerfsStore();
    }

    // Initialize the theme toggle system with a short delay
    setTimeout(() => {
      themeToggle.init(userPerfsStore);
      themeToggle.setInitialized(true);
    }, 100);

  } catch (error) {
    console.error('Error initializing theme system:', error);
    // Initialize with mock data as fallback
    const mockStore = createMockUserPerfsStore();
    setTimeout(() => {
      themeToggle.init(mockStore);
      themeToggle.setInitialized(true);
    }, 100);
  }
};

// Theme setup for individual stories
export const setupStoryTheme = () => {
  try {
    // Set theme toggle as initialized
    themeToggle.setInitialized(true);

    // Ensure toggle button exists
    themeToggle.ensureToggleExists();

    // Create theme change handler
    const handleThemeChange = (event: CustomEvent) => {
      console.log('Story received theme change:', event.detail);
      // Force a re-render by dispatching another event after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('storybook-theme-updated', {
          detail: event.detail
        }));
      }, 50);
    };

    // Add event listener for theme changes
    window.addEventListener('theme-changed', handleThemeChange as EventListener);

    // Return cleanup function
    return () => {
      window.removeEventListener('theme-changed', handleThemeChange as EventListener);
    };
  } catch (error) {
    console.error('Theme initialization failed in decorator:', error);
    return () => {}; // Return empty cleanup function
  }
};
