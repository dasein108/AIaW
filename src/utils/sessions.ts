import { genId } from "./functions"

const id = genId()
const channel = new BroadcastChannel("sessions")

channel.addEventListener("message", ({ data }) => {
  if (data.type === "ping") {
    channel.postMessage({ sessionId: id, type: "pong" })
  }
})

function ping (sessionId: string) {
  return new Promise<boolean>((resolve) => {
    if (sessionId === id) {
      resolve(true)

      return
    }

    channel.postMessage({ sessionId, type: "ping" })
    const timeout = setTimeout(() => {
      channel.removeEventListener("message", listener)
      resolve(false)
    }, 50)
    const listener = ({ data }) => {
      if (data.type === "pong" && data.sessionId === sessionId) {
        clearTimeout(timeout)
        resolve(true)
      }
    }
    channel.addEventListener("message", listener, { once: true })
  })
}

export default { id, ping }
