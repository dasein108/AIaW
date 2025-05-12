<template>
  <q-btn
    icon="sym_o_account_circle"
    @click="onClick"
    :class="{ 'route-active': route.path === '/account' }"
    :label="isLoggedIn ? $t('accountBtn.account') : $t('accountBtn.login')"
  />
</template>

<script setup lang="ts">
import { UserProvider } from '@/services/supabase/userProvider'
import { useQuasar } from 'quasar'
import { inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AuthDialog from './auth/AuthDialog.vue'
const $q = useQuasar()

const router = useRouter()
const route = useRoute()

const { isLoggedIn } = inject<UserProvider>('user')
console.log('isLoggedIn', isLoggedIn.value)
function onClick() {
  if (isLoggedIn.value) {
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
