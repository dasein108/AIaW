import { Json } from './database.types'

const jsonToObject = (json: Json): Record<string, any> => {
  if (
    typeof json === 'object' &&
    json !== null
  ) {
    return json as unknown as object
  }
  return {}
}

export { jsonToObject }
