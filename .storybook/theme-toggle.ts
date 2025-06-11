import { Dark } from "quasar";

interface ThemeToggleOptions {
  position?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  size?: string;
  zIndex?: number;
  icons?: {
    light: string;
    dark: string;
  };
  colors?: {
    background?: string;
    color?: string;
  };
}

interface ThemeState {
  current: 'light' | 'dark';
  initialized: boolean;
  userPerfsStore: any;
}

class ThemeToggleManager {
  private state: ThemeState = {
    current: 'light',
    initialized: false,
    userPerfsStore: null
  };

  private options: Required<ThemeToggleOptions>;
  private toggleButton: HTMLElement | null = null;

  constructor(options: ThemeToggleOptions = {}) {
    const defaultOptions = {
      position: { top: '16px', right: '16px' },
      size: '48px',
      zIndex: 999999,
      icons: { light: '🌙', dark: '☀️' },
      colors: {
        background: 'var(--a-pri, #6750a4)',
        color: 'var(--a-on-pri, white)'
      }
    };

    this.options = {
      ...defaultOptions,
      ...options,
      position: {
        ...defaultOptions.position,
        ...options.position
      }
    };
  }

  /**
   * Initialize the theme toggle system
   */
  init(userPerfsStore: any): void {
    this.state.userPerfsStore = userPerfsStore;
    this.applyTheme(false); // Start with light mode
    this.createToggleButton();
  }

  /**
   * Set theme initialization status
   */
  setInitialized(initialized: boolean): void {
    this.state.initialized = initialized;
  }

  /**
   * Apply Material Design 3 theme colors directly
   */
  private applyMaterialTheme(isDark: boolean): void {
    // Material Design 3 color palette
    const lightColors = {
      'pri': '#6750a4',
      'sec': '#625b71',
      'ter': '#7d5260',
      'err': '#ba1a1a',
      'suc': '#386a20',
      'warn': '#825500',
      'pri-dim': '#6750a4',
      'on-pri': '#ffffff',
      'on-sec': '#ffffff',
      'on-ter': '#ffffff',
      'on-err': '#ffffff',
      'pri-c': '#eaddff',
      'sec-c': '#e8def8',
      'ter-c': '#ffd8e4',
      'err-c': '#ffdad6',
      'on-pri-c': '#21005d',
      'on-sec-c': '#1d192b',
      'on-ter-c': '#31111d',
      'on-err-c': '#410002',
      'sur-dim': '#ded8e1',
      'sur': '#fef7ff',
      'sur-bri': '#fef7ff',
      'sur-c-lowest': '#ffffff',
      'sur-c-low': '#f7f2fa',
      'sur-c': '#f1ecf4',
      'sur-c-high': '#ebe6ee',
      'sur-c-highest': '#e6e0e9',
      'on-sur': '#1c1b1f',
      'on-sur-var': '#49454f',
      'out': '#79747e',
      'out-mid': '#938f99',
      'out-var': '#cac4d0',
      'inv-sur': '#313033',
      'inv-on-sur': '#f4eff4',
      'inv-pri': '#d0bcff'
    };

    const darkColors = {
      'pri': '#d0bcff',
      'sec': '#ccc2dc',
      'ter': '#efb8c8',
      'err': '#ffb4ab',
      'suc': '#a6d388',
      'warn': '#ffb951',
      'pri-dim': '#b69df8',
      'on-pri': '#371e73',
      'on-sec': '#332d41',
      'on-ter': '#492532',
      'on-err': '#690005',
      'pri-c': '#4f378b',
      'sec-c': '#4a4458',
      'ter-c': '#633b48',
      'err-c': '#93000a',
      'on-pri-c': '#eaddff',
      'on-sec-c': '#e8def8',
      'on-ter-c': '#ffd8e4',
      'on-err-c': '#ffdad6',
      'sur-dim': '#141218',
      'sur': '#141218',
      'sur-bri': '#3b383e',
      'sur-c-lowest': '#0f0d13',
      'sur-c-low': '#1c1b1f',
      'sur-c': '#211f26',
      'sur-c-high': '#2b2930',
      'sur-c-highest': '#36343b',
      'on-sur': '#e6e0e9',
      'on-sur-var': '#cac4d0',
      'out': '#938f99',
      'out-mid': '#79747e',
      'out-var': '#49454f',
      'inv-sur': '#e6e0e9',
      'inv-on-sur': '#313033',
      'inv-pri': '#6750a4'
    };

    const colors = isDark ? darkColors : lightColors;

    // Apply colors as CSS variables
    Object.keys(colors).forEach((key) => {
      document.documentElement.style.setProperty(`--a-${key}`, colors[key]);
    });

    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", colors['sur-c']);
    }
  }

  /**
   * Apply theme changes to the system
   */
  applyTheme = (isDark: boolean): void => {
    console.log('Applying theme:', isDark ? 'dark' : 'light');
    this.state.current = isDark ? 'dark' : 'light';

    // Update Quasar Dark mode
    Dark.set(isDark);

    // Update user preferences store if available
    if (this.state.userPerfsStore?.data) {
      this.state.userPerfsStore.data.darkMode = isDark;
    }

    // Ensure correct CSS classes
    if (isDark) {
      document.body.classList.add('body--dark');
      document.body.classList.remove('body--light');
    } else {
      document.body.classList.add('body--light');
      document.body.classList.remove('body--dark');
    }

    // Apply Material Design colors directly
    this.applyMaterialTheme(isDark);

    // Update the toggle button appearance
    this.updateToggleButton();

    // Dispatch a custom event for components that might need to react
    window.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme: this.state.current, isDark }
    }));

    // Force update for expansion story containers specifically
    setTimeout(() => {
      const expansionContainers = document.querySelectorAll('.expansion-story-container');
      expansionContainers.forEach(container => {
        const element = container as HTMLElement;
        // Force a style recalculation by temporarily changing and reverting a property
        const originalDisplay = element.style.display;
        element.style.display = 'none';
        element.offsetHeight; // Trigger reflow
        element.style.display = originalDisplay;
      });
    }, 100);

    // Debug CSS variables
    this.debugCSSVariables();
  };

  /**
   * Debug CSS variables to help diagnose theming issues
   */
  private debugCSSVariables(): void {
    const rootStyles = getComputedStyle(document.documentElement);
    const importantVars = [
      '--a-sur', '--a-sur-c', '--a-on-sur', '--a-out', '--a-pri'
    ];

    console.log('CSS Variables after theme change:');
    importantVars.forEach(varName => {
      const value = rootStyles.getPropertyValue(varName).trim();
      console.log(`  ${varName}: ${value || 'NOT SET'}`);
    });

    // Check expansion containers specifically
    const expansionContainers = document.querySelectorAll('.expansion-story-container');
    if (expansionContainers.length > 0) {
      console.log(`Found ${expansionContainers.length} expansion containers`);
      const firstContainer = expansionContainers[0] as HTMLElement;
      const containerStyles = getComputedStyle(firstContainer);
      console.log('Expansion container computed styles:');
      console.log(`  background-color: ${containerStyles.backgroundColor}`);
      console.log(`  border-color: ${containerStyles.borderColor}`);
      console.log(`  color: ${containerStyles.color}`);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme = (): void => {
    const newTheme = this.state.current === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme === 'dark');
  };

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.state.current;
  }

  /**
   * Create the floating toggle button
   */
  private createToggleButton(): void {
    // Remove existing toggle if present
    this.removeToggleButton();

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'custom-theme-toggle';

    // Build position styles
    const positionStyles = Object.entries(this.options.position)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');

    toggle.style.cssText = `
      position: fixed;
      ${positionStyles};
      z-index: ${this.options.zIndex};
      background: ${this.options.colors.background};
      color: ${this.options.colors.color};
      border: none;
      border-radius: 50%;
      width: ${this.options.size};
      height: ${this.options.size};
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      user-select: none;
    `;

    // Add event listeners
    toggle.addEventListener('click', this.toggleTheme);
    toggle.addEventListener('mouseenter', () => {
      toggle.style.transform = 'scale(1.1)';
    });
    toggle.addEventListener('mouseleave', () => {
      toggle.style.transform = 'scale(1)';
    });

    // Add to document
    document.body.appendChild(toggle);
    this.toggleButton = toggle;

    // Update appearance
    this.updateToggleButton();
  }

  /**
   * Update toggle button appearance based on current theme
   */
  private updateToggleButton(): void {
    if (this.toggleButton) {
      const isLight = this.state.current === 'light';
      this.toggleButton.textContent = isLight ? this.options.icons.light : this.options.icons.dark;
      this.toggleButton.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  /**
   * Remove the toggle button from DOM
   */
  removeToggleButton(): void {
    const existing = document.getElementById('custom-theme-toggle');
    if (existing) {
      existing.remove();
    }
    this.toggleButton = null;
  }

  /**
   * Ensure toggle button exists (useful for re-creation after navigation)
   */
  ensureToggleExists(): void {
    if (!document.getElementById('custom-theme-toggle')) {
      this.createToggleButton();
    }
  }

  /**
   * Destroy the theme toggle manager
   */
  destroy(): void {
    this.removeToggleButton();
    this.state.userPerfsStore = null;
    this.state.initialized = false;
  }
}

// Export a singleton instance
export const themeToggle = new ThemeToggleManager();

// Export the class for custom instances
export { ThemeToggleManager };

// Export types
export type { ThemeToggleOptions, ThemeState };
