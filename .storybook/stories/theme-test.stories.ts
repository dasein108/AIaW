import type { Meta, StoryObj } from '@storybook/vue3'
import { defineComponent, onMounted, ref, onUnmounted } from 'vue'

const ThemeTestComponent = defineComponent({
  name: 'ThemeTest',
  setup() {
    const themeStatus = ref('Loading...')
    const themeColors = ref<Record<string, string>>({})
    const currentTheme = ref('light')

    const updateThemeInfo = () => {
      // Check if theme variables are set
      const computedStyle = getComputedStyle(document.documentElement)
      const colors = [
        'pri', 'sec', 'ter', 'err', 'suc', 'warn',
        'on-pri', 'on-sec', 'on-ter', 'on-err',
        'sur', 'sur-c', 'on-sur', 'out'
      ]

      const foundColors: Record<string, string> = {}
      let hasColors = false

      colors.forEach(color => {
        const value = computedStyle.getPropertyValue(`--a-${color}`).trim()
        if (value) {
          foundColors[color] = value
          hasColors = true
        }
      })

      themeColors.value = foundColors
      themeStatus.value = hasColors ? 'Theme loaded successfully!' : 'Theme variables not found'

      // Check current theme from body classes
      if (document.body.classList.contains('body--dark')) {
        currentTheme.value = 'dark'
      } else {
        currentTheme.value = 'light'
      }
    }

    const handleThemeChange = (event: any) => {
      console.log('Theme changed event received:', event.detail)
      setTimeout(updateThemeInfo, 100)
    }

    onMounted(() => {
      updateThemeInfo()

      // Listen for theme changes
      window.addEventListener('theme-changed', handleThemeChange)
      window.addEventListener('storybook-theme-updated', handleThemeChange)

      // Update every second to catch changes
      const interval = setInterval(updateThemeInfo, 1000)

      onUnmounted(() => {
        clearInterval(interval)
        window.removeEventListener('theme-changed', handleThemeChange)
        window.removeEventListener('storybook-theme-updated', handleThemeChange)
      })
    })

    return { themeStatus, themeColors, currentTheme }
  },
  template: `
    <div style="padding: 20px;">
      <h2>Theme Toggle Test</h2>
      <p><strong>Status:</strong> {{ themeStatus }}</p>
      <p><strong>Current Theme:</strong> {{ currentTheme }}</p>

      <div style="margin: 20px 0;">
        <h3>Theme Colors Preview</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
          <div
            v-for="(color, name) in themeColors"
            :key="name"
            :style="{
              backgroundColor: color,
              color: name.includes('on-') ? 'inherit' : (name.includes('pri') || name.includes('sec') ? 'white' : 'black'),
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid var(--a-out, #ccc)'
            }"
          >
            <strong>{{ name }}:</strong><br>
            {{ color }}
          </div>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h3>Component Examples</h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <div
            style="
              background: var(--a-pri, #6750a4);
              color: var(--a-on-pri, white);
              padding: 10px 20px;
              border-radius: 4px;
            "
          >
            Primary Button
          </div>
          <div
            style="
              background: var(--a-sur-c, #f1ecf4);
              color: var(--a-on-sur, #1c1b1f);
              padding: 10px 20px;
              border-radius: 4px;
              border: 1px solid var(--a-out, #79747e);
            "
          >
            Surface Container
          </div>
          <div
            style="
              background: var(--a-err, #ba1a1a);
              color: var(--a-on-err, white);
              padding: 10px 20px;
              border-radius: 4px;
            "
          >
            Error Button
          </div>
        </div>
      </div>

      <p style="margin-top: 20px; padding: 10px; background: var(--a-sur-c, #f1ecf4); border-radius: 4px;">
        <strong>Instructions:</strong> Look for the floating toggle button in the top-right corner of this page.
        Click it to switch between light and dark themes. The colors and components above should update automatically.
      </p>
    </div>
  `
})

const meta: Meta<typeof ThemeTestComponent> = {
  title: 'Theme/Theme Toggle Test',
  component: ThemeTestComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Test component to verify theme toggle functionality in Storybook.'
      }
    }
  }
}

export default meta
type Story = StoryObj<typeof ThemeTestComponent>

export const Default: Story = {
  render: () => ({
    components: { ThemeTestComponent },
    template: '<ThemeTestComponent />'
  })
}
