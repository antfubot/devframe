import { defineHubRpcFunction } from '@devframes/hub'

export const getSharedStateKeys = defineHubRpcFunction({
  name: 'self-inspect:get-shared-state-keys',
  type: 'query',
  jsonSerializable: true,
  agent: {
    description: 'List the keys of all shared-state entries published by the devframe server. Read-only. Combine with the `devframe://state/<key>` MCP resource to inspect values.',
    title: 'List shared-state keys',
  },
  setup: context => ({
    handler: async () => context.rpc.sharedState.keys(),
  }),
})
