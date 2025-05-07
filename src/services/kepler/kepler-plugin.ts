import { Plugin } from '@/utils/types'
import { Object as TObject } from '@sinclair/typebox'
import { getLocalStorageWalletState } from './KeplerWallet'

export const keplerPlugin: Plugin = {
  id: 'kepler-plugin',
  type: 'builtin',
  available: true,
  apis: [{
    type: 'tool',
    name: 'my-address',
    description: 'My Kepler wallet address',
    prompt: 'Use this tool to obtain current address of the wallet',
    parameters: TObject({}),
    async execute() {
      const state = getLocalStorageWalletState()
      return [{
        type: 'text',
        contentText: state.isConnected ? state.address : 'Not connected'
      }]
    }
  }],
  fileparsers: [],
  settings: TObject({}),
  title: 'Kepler Plugin',
  description: 'Kepler helper utilities'
}
