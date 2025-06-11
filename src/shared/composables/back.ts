import { useRouter } from "vue-router"

export function useBack (defaultTo = "/") {
  const router = useRouter()

  return () =>
    history.state.back ? router.back() : defaultTo && router.replace(defaultTo)
}
