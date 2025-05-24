<template>
  <q-btn
    icon="sym_o_account_circle"
    @click="onClick"
    :class="{ 'route-active': route.path === '/account' }"
    :label="uersStore.isLoggedIn ? $t('accountBtn.account') : $t('accountBtn.login')"
  />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import AuthDialog from './auth/AuthDialog.vue'
import { useUserStore } from 'src/stores/user'
import { watch } from 'vue'
const $q = useQuasar()

const router = useRouter()
const route = useRoute()

const uersStore = useUserStore()

console.log('isLoggedIn', uersStore.isLoggedIn)
function onClick() {
  if (uersStore.isLoggedIn) {
    router.push('/account')
  } else {
    $q.dialog({
      component: AuthDialog
    }).onOk(() => {
      console.log('OOK')
    })
  }
}
</script>

<style scoped>

</style>
