import type { Meta, StoryObj } from '@storybook/vue3'
import { ref, provide } from 'vue'
import { action } from '@storybook/addon-actions'
import { fn } from '@storybook/test'
import { vueRouter } from 'storybook-vue3-router'
import ArtifactsExpansion from '../../src/components/ArtifactsExpansion.vue'

// Simple routes for the router
const routes = [
  {
    path: '/',
    name: 'home',
    component: { template: '<div>Home</div>' }
  },
  {
    path: '/workspaces/:workspaceId/artifacts/:artifactId',
    name: 'artifact',
    component: { template: '<div>Artifact</div>' }
  }
]

// Mock the stores and composables
const mockWorkspace = {
  id: 'workspace-1',
  name: 'My Workspace',
  avatar: { type: 'icon', icon: 'sym_o_folder' },
  type: 'workspace',
  parentId: 'root',
  vars: {},
  indexContent: '',
  listOpen: {
    dialogs: true,
    assistants: true,
    artifacts: true,
    chats: true
  }
}

const mockArtifacts = [
  {
    id: 'artifact-1',
    name: 'main.py',
    workspaceId: 'workspace-1',
    versions: [
      {
        date: new Date('2024-01-15'),
        text: 'print("Hello, World!")\n\ndef main():\n    print("This is a Python script")'
      }
    ],
    currIndex: 0,
    readable: true,
    writable: true,
    open: true,
    language: 'python',
    tmp: 'print("Hello, World!")\n\ndef main():\n    print("This is a Python script")'
  },
  {
    id: 'artifact-2',
    name: 'styles.css',
    workspaceId: 'workspace-1',
    versions: [
      {
        date: new Date('2024-01-14'),
        text: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}'
      }
    ],
    currIndex: 0,
    readable: true,
    writable: true,
    open: false,
    language: 'css',
    tmp: 'body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}'
  },
  {
    id: 'artifact-3',
    name: 'component.vue',
    workspaceId: 'workspace-1',
    versions: [
      {
        date: new Date('2024-01-13'),
        text: '<template>\n  <div class="component">\n    <h1>{{ title }}</h1>\n  </div>\n</template>'
      }
    ],
    currIndex: 0,
    readable: true,
    writable: true,
    open: false,
    language: 'vue',
    tmp: '<template>\n  <div class="component">\n    <h1>{{ title }}</h1>\n  </div>\n</template>'
  },
  {
    id: 'artifact-4',
    name: 'README.md',
    workspaceId: 'workspace-1',
    versions: [
      {
        date: new Date('2024-01-12'),
        text: '# Project Documentation\n\nThis is a sample README file for the project.\n\n## Features\n\n- Feature 1\n- Feature 2'
      }
    ],
    currIndex: 0,
    readable: true,
    writable: true,
    open: true,
    language: 'markdown',
    tmp: '# Project Documentation\n\nThis is a sample README file for the project.\n\n## Features\n\n- Feature 1\n- Feature 2'
  }
]

// Simple decorator with reusable styles
const ExpansionDecorator = () => ({
  template: `
    <div class="expansion-story-container" style="
      width: 350px;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid var(--a-out, #79747e);
      background-color: var(--a-sur-c, var(--a-sur, #fff));
      color: var(--a-on-sur, #000);
      transition: all 0.3s ease;
    ">
      <story/>
    </div>
  `
})

const meta = {
  title: 'Expansions/ArtifactsExpansion',
  component: ArtifactsExpansion,
  decorators: [ExpansionDecorator],
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An expansion panel component that displays a list of artifacts with search functionality. Features a collapsible header with upload and create buttons, and contains artifact items with icons and menus.'
      }
    }
  },
  argTypes: {}
} satisfies Meta<typeof ArtifactsExpansion>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [vueRouter(routes)],
  parameters: {
    docs: {
      description: {
        story: 'Default state of the ArtifactsExpansion component with artifacts list'
      }
    }
  },
  render: (args) => ({
    components: { ArtifactsExpansion },
    setup() {
      // Provide mocked dependencies
      provide('workspace', ref(mockWorkspace))
      provide('artifacts', ref(mockArtifacts))

      // Mock the composables and functions
      const mockComposables = {
        useCloseArtifact: () => ({
          closeArtifact: action('closeArtifact')
        }),
        useCreateArtifact: () => ({
          createArtifact: action('createArtifact')
        }),
        caselessIncludes: (text: string, search: string) =>
          text.toLowerCase().includes(search.toLowerCase()),
        getFileExt: (filename: string) => {
          const ext = filename.split('.').pop()
          return ext || 'text'
        },
        isTextFile: () => Promise.resolve(true)
      }

      return {
        args,
        mockComposables
      }
    },
    template: '<ArtifactsExpansion v-bind="args" />'
  })
}

export const EmptyArtifactsList: Story = {
  decorators: [vueRouter(routes)],
  parameters: {
    docs: {
      description: {
        story: 'ArtifactsExpansion component with no artifacts in the workspace'
      }
    }
  },
  render: (args) => ({
    components: { ArtifactsExpansion },
    setup() {
      // Provide mocked dependencies with empty artifacts
      provide('workspace', ref(mockWorkspace))
      provide('artifacts', ref([]))

      return {
        args
      }
    },
    template: '<ArtifactsExpansion v-bind="args" />'
  })
}

export const DarkTheme: Story = {

  parameters: {
    docs: {
      description: {
        story: 'ArtifactsExpansion component with dark theme styling'
      }
    }
  },
  render: (args) => ({
    components: { ArtifactsExpansion },
    setup() {
      // Provide mocked dependencies with empty artifacts for dark theme demo
      provide('workspace', ref(mockWorkspace))
      provide('artifacts', ref([]))

      return {
        args
      }
    },
    template: '<ArtifactsExpansion v-bind="args" />'
  })
}
