<template>
  <q-icon :name="icon" />
</template>

<script setup lang="ts">
import { codeExtensions } from "@/shared/utils/values"
import { computed } from "vue"
import { ArtifactMapped } from "@/services/data/supabase/types"

const props = defineProps<{
  artifact: ArtifactMapped
}>()

const icon = computed(() =>
  codeExtensions.includes(props.artifact.name.split(".").pop())
    ? "sym_o_code"
    : "sym_o_description"
)
</script>
