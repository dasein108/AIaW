<template>
  <div
    class="voice-recognition"
    pl-2
  >
    <q-btn-dropdown
      :color="isListening ? 'red' : 'primary'"
      round
      flat
      dense
      :aria-pressed="isListening"
      split
      @click="toggleListening"
      size="md"
    >
      <template #label>
        <div
          class="row items-center no-wrap"
          mr-2
        >
          <q-icon
            left
            :name="isListening ? 'sym_o_mic' : 'sym_o_keyboard_voice'"
          />
          <div class="text-center">
            {{ currentLangLabel }}
          </div>
        </div>
      </template>
      <q-list>
        <q-item
          v-for="opt in langOptions"
          :key="opt.value"
          clickable
          @click="selectLang(opt.value)"
          v-close-popup
        >
          <q-item-section>{{ opt.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { ref, watch, onMounted, onBeforeUnmount, computed, defineExpose } from 'vue'

import { localData } from "@/shared/utils/localData"

const $q = useQuasar()
const langOptions = [
  { label: 'EN', value: 'en-US' },
  { label: 'RU', value: 'ru-RU' },
  { label: 'ES', value: 'es-ES' },
  { label: 'ZH', value: 'zh-CN' },
  { label: 'ID', value: 'id-ID' },
  { label: 'KO', value: 'ko-KR' },
  { label: 'DE', value: 'de-DE' },
  { label: 'FR', value: 'fr-FR' },
  { label: 'PT', value: 'pt-PT' },
  { label: 'IT', value: 'it-IT' },
  { label: 'JA', value: 'ja-JP' },
  { label: 'AR', value: 'ar-SA' },
  { label: 'HI', value: 'hi-IN' },
  { label: 'TH', value: 'th-TH' },
  { label: 'NL', value: 'nl-NL' },
  { label: 'PL', value: 'pl-PL' },
  { label: 'RO', value: 'ro-RO' },
  { label: 'SV', value: 'sv-SE' },
  { label: 'TR', value: 'tr-TR' },
  { label: 'VI', value: 'vi-VN' },
]

const userLang = navigator.language || navigator.languages?.[0] || "en-US"

const selectedLang = ref(localData.voiceLanguage || userLang)
const isListening = ref(false)
const inputValue = defineModel<string>('inputValue', { required: true })
const initialInputValue = ref('')
let recognition: any = null

const currentLangLabel = computed(() => {
  const found = langOptions.find(opt => opt.value === selectedLang.value)

  return found ? found.label : selectedLang.value
})

function selectLang(val: string) {
  selectedLang.value = val
  localData.voiceLanguage = selectedLang.value = val
}

function createRecognition() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  if (!SpeechRecognition) return null

  const rec = new SpeechRecognition()

  rec.continuous = true
  rec.interimResults = true
  rec.lang = selectedLang.value
  rec.onresult = (event: any) => {
    let fullText = ""
    // Accumulate all results (interim and final) into fullText
    for (let i = 0; i < event.results.length; ++i) {
      fullText += event.results[i][0].transcript
    }
    inputValue.value = initialInputValue.value + " " + fullText
  }
  rec.onerror = (e) => {
    $q.notify({
      message: `Voice recognition error '${e.error}'`,
      color: "negative",
      icon: "sym_o_error",
    })
    stopListening()
  }
  rec.onend = () => {
    if (isListening.value) {
      rec.start() // restart for continuous listening
    }
  }

  return rec
}

function startListening() {
  initialInputValue.value = inputValue.value || ""

  if (isListening.value) return

  if (!recognition) recognition = createRecognition()

  if (!recognition) return

  recognition.lang = selectedLang.value
  recognition.start()
  isListening.value = true
}

function stopListening() {
  if (!isListening.value) return

  if (recognition) recognition.stop()

  isListening.value = false
}

defineExpose({ stopListening, startListening })

function toggleListening() {
  if (isListening.value) {
    stopListening()
  } else {
    startListening()
  }
}

watch(selectedLang, (lang) => {
  if (isListening.value && recognition) {
    stopListening()
    setTimeout(startListening, 200)
  }
})

onMounted(() => {
  window.addEventListener('beforeunload', stopListening)
})
onBeforeUnmount(() => {
  stopListening()
  window.removeEventListener('beforeunload', stopListening)
})
</script>
