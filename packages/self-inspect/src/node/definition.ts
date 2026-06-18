import type { DevframeHubContext } from '@devframes/hub/node'
import type { DevframeDefinition } from 'devframe/types'
import { clientPublicDir } from '../dirs'
import { rpcFunctions } from './rpc/index'

/**
 * Devframe definition for the Self Inspect panel.
 *
 * Registers RPC functions for inspecting the hub state (docks, RPC
 * functions, shared-state keys, client scripts, auth tokens) and serves
 * a pre-built SPA at the mount path.
 *
 * Mount via your hub setup:
 * ```ts
 * import { mountDevframe } from '@devframes/hub/node'
 * import { selfInspect } from '@devframes/self-inspect'
 *
 * await mountDevframe(ctx, selfInspect(), { dock: { category: 'advanced' } })
 * ```
 */
export function selfInspect(): DevframeDefinition {
  return {
    id: 'devframes-self-inspect',
    name: 'Self Inspect',
    icon: 'ph:stethoscope-duotone',
    cli: {
      distDir: clientPublicDir,
    },
    setup(ctx) {
      // Cast: setup is always called with DevframeHubContext when mounted
      // via mountDevframe — docks is a hub-layer feature.
      const hubCtx = ctx as unknown as DevframeHubContext
      for (const fn of rpcFunctions)
        hubCtx.rpc.register(fn as any)
    },
  }
}
