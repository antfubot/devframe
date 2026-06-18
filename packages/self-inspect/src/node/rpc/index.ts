import type { DevframeDockEntry } from '@devframes/hub/types'
import type { ClientScriptInfo } from '../../types'
import { getAuthTokens } from './get-auth-tokens'
import { getClientScripts } from './get-client-scripts'
import { getDocks } from './get-docks'
import { getRpcFunctions } from './get-rpc-functions'
import { getSharedStateKeys } from './get-shared-state-keys'
import { revokeAuthTokenRpc } from './revoke-auth-token'

export { getAuthTokens, getClientScripts, getDocks, getRpcFunctions, getSharedStateKeys, revokeAuthTokenRpc }

export const rpcFunctions = [
  getDocks,
  getRpcFunctions,
  getClientScripts,
  getAuthTokens,
  getSharedStateKeys,
  revokeAuthTokenRpc,
] as const

declare module 'devframe/types' {
  interface DevframeRpcServerFunctions {
    'self-inspect:get-docks': () => Promise<DevframeDockEntry[]>
    'self-inspect:get-rpc-functions': () => Promise<{
      name: string
      type: string
      cacheable: boolean
      hasArgs: boolean
      hasReturns: boolean
      hasDump: boolean
      hasSetup: boolean
      hasHandler: boolean
    }[]>
    'self-inspect:get-client-scripts': () => Promise<ClientScriptInfo[]>
    'self-inspect:get-auth-tokens': () => Promise<{
      authToken: string
      ua: string
      origin: string
      timestamp: number
    }[]>
    'self-inspect:get-shared-state-keys': () => Promise<string[]>
    'self-inspect:revoke-auth-token': (authToken: string) => Promise<void>
  }
}
