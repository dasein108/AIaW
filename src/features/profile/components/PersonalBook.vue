<template>
  <personal-book-navigation
    :next="step < 3 ? () => { step++ } : undefined"
    :back="step > 1 ? () => { step-- } : undefined"
  >
    <q-stepper
      v-model="step"
      header-nav
      ref="stepper"
      color="primary"
      animated
    >
      <q-step
        :name="1"
        title="My Personality"
        caption="Who am I?"
        icon="sym_o_article_person"
        dense
      >
        <personal-book-container
          text=""
          graph-type="personality"
        >
          <template #actions>
            <div
              flex
              gap-2
              justify-end
              p-2
            >
              <q-btn
                label="Export from Github"
                flat
                dense
                @click="console.log('export from github')"
                icon="sym_o_outbox"
              />
              <q-btn
                label="Export from LinkedIn"
                flat
                dense
                @click="console.log('export from github')"
                icon="sym_o_outbox"
              />
            </div>
          </template>
        </personal-book-container>
      </q-step>

      <q-step
        :name="2"
        title="Facts"
        caption="What I've done?"
        icon="sym_o_data_check"
        dense
      >
        <personal-book-container
          text=""
          graph-type="facts"
        />
      </q-step>

      <q-step
        :name="3"
        title="Wishlist"
        caption="What I want?"
        icon="sym_o_mystery"
        dense
      >
        <personal-book-container
          text=""
          graph-type="wishlist"
        />
      </q-step>
    </q-stepper>
  </personal-book-navigation>
</template>
<script setup lang="ts">
import { experimental_createMCPClient } from 'ai'
import { useQuasar } from 'quasar'
import { onMounted, provide, ref } from 'vue'

import PersonalBookContainer from "./PersonalBookContaner.vue"
import PersonalBookNavigation from "./PersonalBookNavigation.vue"

const $q = useQuasar()

const step = ref(1)
// const stepMap: Record<number, PersonalGraphType> = {
//   0: "personality",
//   1: "facts",
//   2: "wishlist"
// }

const tools = ref<any>(null)

onMounted(async () => {
  await experimental_createMCPClient({
    transport: {
      type: "sse",
      url: "http://localhost:8001/sse"
    }
  }).then(async client => {
    tools.value = await client.tools()
    console.log("---tools2", tools.value)
  }).catch(error => {
    console.error("Error creating MCP client:", error)
    $q.notify({
      message: `Error creating MCP client ${error}`,
      color: "negative"
    })
  })
})

// Provide tools to children
provide('tools', tools)

</script>
