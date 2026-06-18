import { defineHubRpcFunction } from '@devframes/hub'

export const getRpcFunctions = defineHubRpcFunction({
  name: 'self-inspect:get-rpc-functions',
  type: 'query',
  jsonSerializable: true,
  agent: {
    description: 'List every RPC function registered on the devframe server, with metadata (name, type, whether it has args/returns schemas, dump, setup, handler). Useful for discovering what functionality the running devtools expose. Read-only.',
    title: 'List RPC functions',
  },
  setup: context => ({
    handler: async () =>
      Array.from(context.rpc.definitions.entries()).map(([name, fn]) => ({
        name,
        type: fn.type ?? 'query',
        cacheable: fn.cacheable ?? false,
        hasArgs: !!fn.args,
        hasReturns: !!fn.returns,
        hasDump: !!fn.dump,
        hasSetup: !!fn.setup,
        hasHandler: !!fn.handler,
      })),
  }),
})
