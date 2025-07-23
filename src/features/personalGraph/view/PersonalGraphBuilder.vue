<template>
  <personal-graph-navigation
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
        <personal-graph-container
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
        </personal-graph-container>
      </q-step>

      <q-step
        :name="2"
        title="Facts"
        caption="What I've done?"
        icon="sym_o_data_check"
        dense
      >
        <personal-graph-container
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
        <personal-graph-container
          text=""
          graph-type="wishlist"
        />
      </q-step>
    </q-stepper>
  </personal-graph-navigation>
</template>
<script setup lang="ts">
import { ref } from 'vue'

import PersonalGraphContainer from "../components/PersonalGraphContainer.vue"
import PersonalGraphNavigation from "../components/PersonalGraphNavigation.vue"

const step = ref(1)

</script>
