import MainLayout from "layouts/MainLayout.vue"
import ErrorNotFound from "pages/ErrorNotFound.vue"
import { i18n } from "src/boot/i18n"
import AccountPage from "src/pages/AccountPage.vue"
import AssistantsPage from "src/pages/AssistantsPage.vue"
import ChatsPage from "src/features/chats/pages/ChatsPage.vue"
import EmptyPage from "src/pages/EmptyPage.vue"
import PluginsPage from "src/pages/PluginsPage.vue"
import SetProvider from "src/pages/SetProvider.vue"
import WorkspacePage from "src/pages/WorkspacePage.vue"
import AssistantsMarket from "src/views/AssistantsMarket.vue"
import AssistantView from "src/views/AssistantView.vue"
import ChatSettings from "src/features/chats/views/ChatSettings.vue"
import ChatView from "src/features/chats/views/ChatView.vue"
import CustomProvider from "src/views/CustomProvider.vue"
import DialogView from "src/views/DialogView.vue"
import PluginAdjust from "src/views/PluginAdjust.vue"
import PluginSettings from "src/views/PluginSettings.vue"
import PluginsMarket from "src/views/PluginsMarket.vue"
import SettingsView from "src/views/SettingsView.vue"
import ShortcutKeys from "src/views/ShortcutKeys.vue"
import WorkspaceIndex from "src/views/WorkspaceIndex.vue"
import WorkspaceSettings from "src/views/WorkspaceSettings.vue"
import { RouteRecordRaw } from "vue-router"
import CyberlinksPage from "../pages/CyberlinksPage.vue"
import SettingsPage from "../pages/SettingsPage.vue"

const { t } = i18n.global

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "/workspaces/:workspaceId/",
        component: WorkspacePage,
        props: (route) => ({ id: route.params.workspaceId }),
        children: [
          { path: "", component: WorkspaceIndex },
          { path: "settings", component: WorkspaceSettings },
          {
            path: "dialogs/:dialogId",
            component: DialogView,
            props: (route) => ({ id: route.params.dialogId }),
          },
          {
            path: "chats/:chatId",
            component: ChatView,
            props: (route) => ({ id: route.params.chatId }),
          },

          {
            path: "assistants/:assistantId",
            component: AssistantView,
            props: (route) => ({ id: route.params.assistantId }),
          },
          {
            path: "assistants/:assistantId/plugins/:pluginId",
            component: PluginAdjust,
            props: (route) => ({
              id: route.params.pluginId,
              assistantId: route.params.assistantId,
            }),
          },
        ],
      },
      {
        path: "/settings/",
        component: SettingsPage,
        children: [
          {
            path: "",
            component: SettingsView,
            meta: { title: t("routes.settings") },
          },
          {
            path: "shortcut-keys",
            component: ShortcutKeys,
            meta: { title: t("routes.shortcutKeys") },
          },
          { path: "providers/:id", component: CustomProvider, props: true },
        ],
      },
      {
        path: "/plugins/",
        component: PluginsPage,
        children: [
          {
            path: "",
            component: PluginsMarket,
            meta: { title: t("routes.pluginsMarket") },
          },
          {
            path: ":pluginId",
            component: PluginSettings,
            props: (route) => ({ id: route.params.pluginId }),
          },
        ],
      },
      {
        path: "/assistants/",
        component: AssistantsPage,
        children: [
          {
            path: "",
            component: AssistantsMarket,
            meta: { title: t("routes.assistantsMarket") },
          },
          {
            path: ":assistantId",
            component: AssistantView,
            props: (route) => ({ id: route.params.assistantId }),
          },
          {
            path: ":assistantId/plugins/:pluginId",
            component: PluginAdjust,
            props: (route) => ({
              id: route.params.pluginId,
              assistantId: route.params.assistantId,
            }),
          },
        ],
      },
      {
        path: "/chats/",
        component: ChatsPage,
        children: [
          // { path: '', component: ChatView, meta: { title: t('routes.chatsMarket') } }
          {
            path: ":chatId/settings",
            component: ChatSettings,
            props: (route) => ({ id: route.params.chatId }),
          },
          {
            path: ":chatId",
            component: ChatView,
            props: (route) => ({ id: route.params.chatId }),
          },
        ],
      },
      { path: "/set-provider", component: SetProvider },
      {
        path: "/account",
        component: AccountPage,
        meta: { title: t("routes.account"), requiresAuth: true },
      },
      {
        path: "/cyberlinks",
        component: CyberlinksPage,
        meta: { title: t("routes.cyberlinks") },
      },
      { path: "/", component: EmptyPage },

      // Always leave this as last one,
      // but you can also remove it
      {
        path: "/:catchAll(.*)*",
        component: ErrorNotFound,
        props: {
          drawerToggle: true,
          timeout: 0,
        },
      },
    ],
  },
]

export default routes
