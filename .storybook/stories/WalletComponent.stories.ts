import type { Meta, StoryObj } from '@storybook/vue3'
import WalletComponent from '../components/WalletComponent.vue'

// Decorator for consistent styling
const walletDecorator = () => ({
  template: `
    <div class="wallet-story-container">
      <story />
    </div>
  `,
  style: `
    <style>
      .wallet-story-container {
        padding: 20px;
        max-width: 800px;
        border-radius: 12px;
        margin: 0 auto;
      }

      @media (max-width: 600px) {
        .wallet-story-container {
          padding: 10px;
          margin: 0;
        }
      }
    </style>
  `
})

const meta = {
  title: 'Components/WalletComponent',
  component: WalletComponent,
  tags: ['autodocs'],
  decorators: [walletDecorator],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A simplified wallet component displaying token balance with deposit and withdraw functionality.'
      }
    }
  },
  argTypes: {
    tokenBalance: {
      control: { type: 'number', min: 0, max: 100000, step: 0.01 },
      description: 'Current token balance'
    },
    tokenPrice: {
      control: { type: 'number', min: 0, max: 1, step: 0.0001 },
      description: 'Price per token in USD'
    },
    loading: {
      control: 'boolean',
      description: 'Loading state for the wallet component'
    }
  },
  args: {
    tokenBalance: 1250,
    tokenPrice: 0.0025,
    loading: false
  }
} satisfies Meta<typeof WalletComponent>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default wallet component with mock token balance and standard pricing.'
      }
    }
  }
}

// Large balance variant
export const LargeBalance: Story = {
  args: {
    tokenBalance: 50000.50,
    tokenPrice: 0.0125
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet with a large token balance showing proper number formatting.'
      }
    }
  }
}

// Small balance variant
export const SmallBalance: Story = {
  args: {
    tokenBalance: 25.75,
    tokenPrice: 0.0008
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet with a small token balance demonstrating low-value scenarios.'
      }
    }
  }
}

// High value tokens
export const HighValueTokens: Story = {
  args: {
    tokenBalance: 1000.00,
    tokenPrice: 2.5000
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet with high-value tokens showing significant USD equivalent.'
      }
    }
  }
}

// Zero balance
export const ZeroBalance: Story = {
  args: {
    tokenBalance: 0.00,
    tokenPrice: 0.0025
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty wallet state with zero token balance.'
      }
    }
  }
}

// Loading state
export const Loading: Story = {
  args: {
    tokenBalance: 0,
    tokenPrice: 0,
    loading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet component in loading state while fetching data.'
      }
    }
  }
}

// Micro balance
export const MicroBalance: Story = {
  args: {
    tokenBalance: 0.01,
    tokenPrice: 0.0001
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet with very small token balance showing minimal USD value.'
      }
    }
  }
}

// Mobile responsive view
export const MobileView: Story = {
  args: {
    tokenBalance: 1567.89,
    tokenPrice: 0.0032
  },
  parameters: {
    docs: {
      description: {
        story: 'Wallet component optimized for mobile viewport.'
      }
    },
    viewport: {
      defaultViewport: 'mobile1'
    }
  }
}

// Interactive playground
export const Playground: Story = {
  args: {
    tokenBalance: 1250.75,
    tokenPrice: 0.0025
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground for testing different wallet configurations. Use the controls panel to modify props.'
      }
    }
  }
}
