<template>
  <q-btn
    icon="sym_o_more_vert"
    round
    flat
    dense
    text="sec xs"
    un-size="32px"
    :title="t('messageItem.more')"
  >
    <q-menu>
      <q-list>
        <menu-item
          icon="sym_o_code"
          :label="t('messageItem.showSourceCode')"
          @click="emit('toggle-source-code')"
          :class="{ 'route-active': sourceCodeMode }"
        />
        <menu-item
          icon="sym_o_edit"
          :label="t('messageItem.directEdit')"
          @click="emit('edit')"
        />
        <menu-item
          icon="sym_o_format_quote"
          :label="t('messageItem.quote')"
          @click="emit('quote')"
        />
        <menu-item
          icon="sym_o_info"
          :label="t('messageItem.moreInfo')"
          @click="emit('more-info')"
        />
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import MenuItem from '@shared/components/menu/MenuItem.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  sourceCodeMode?: boolean
}>()

const emit = defineEmits<{
  'toggle-source-code': []
  'edit': []
  'quote': []
  'more-info': []
}>()
</script>
