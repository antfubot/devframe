import { defineHubRpcFunction } from '@devframes/hub'
import { getInternalContext } from 'devframe/node/hub-internals'

export const getAuthTokens = defineHubRpcFunction({
  name: 'self-inspect:get-auth-tokens',
  type: 'query',
  jsonSerializable: true,
  setup: (context) => {
    const internal = getInternalContext(context)
    return {
      handler: async () => {
        const trusted = internal.storage.auth.value().trusted
        return Object.values(trusted).filter(x => !!x)
      },
    }
  },
})
