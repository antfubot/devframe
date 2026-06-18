import { defineHubRpcFunction } from '@devframes/hub'
import { getInternalContext } from 'devframe/node/hub-internals'

export const revokeAuthTokenRpc = defineHubRpcFunction({
  name: 'self-inspect:revoke-auth-token',
  type: 'action',
  jsonSerializable: true,
  setup: (context) => {
    const internal = getInternalContext(context)
    return {
      handler: async (authToken: string) => {
        await internal.revokeAuthToken(authToken)
      },
    }
  },
})
