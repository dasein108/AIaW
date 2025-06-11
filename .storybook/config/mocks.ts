import type { App } from 'vue';

// Mock IndexedDB for testing environment
export const setupMockDatabase = () => {
  if (!window.indexedDB) {
    const mockDB = {
      reactives: {
        get: () => Promise.resolve(null),
        put: () => Promise.resolve(),
        add: () => Promise.resolve()
      }
    };
    (window as any).__STORYBOOK_DB_MOCK__ = mockDB;
  }
};

// Mock store providers for components that need them
export const setupMockStores = (app: App) => {
  app.provide('userPerfs', {
    dialogScrollBtn: true,
    enableShortcutKey: true,
    scrollUpKeyV2: 'ArrowUp',
    scrollDownKeyV2: 'ArrowDown',
    scrollTopKey: 'Home',
    scrollBottomKey: 'End',
    switchPrevKeyV2: 'ArrowLeft',
    switchNextKeyV2: 'ArrowRight',
    switchFirstKey: 'Home',
    switchLastKey: 'End',
    regenerateCurrKey: 'r',
    editCurrKey: 'e',
    focusDialogInputKey: 'f'
  });
};

// Mock the user login callback to prevent auth-related issues
export const setupAuthMocks = () => {
  // Mock useUserLoginCallback globally
  if (typeof window !== 'undefined') {
    (window as any).useUserLoginCallback = (callback: Function) => {
      // In Storybook, we don't need to wait for user login
      // Call the callback immediately or after a short delay
      setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.warn('Mock login callback error:', error);
        }
      }, 50);
    };
  }
};
