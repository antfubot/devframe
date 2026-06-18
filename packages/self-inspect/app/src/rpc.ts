import type { DevframeRpcClient } from 'devframe/client'
import { connectDevframe } from 'devframe/client'

export type { DevframeRpcClient }

export async function connect(): Promise<DevframeRpcClient> {
  return connectDevframe()
}
