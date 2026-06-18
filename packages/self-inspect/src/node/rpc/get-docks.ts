import { defineHubRpcFunction } from '@devframes/hub'

export const getDocks = defineHubRpcFunction({
  name: 'self-inspect:get-docks',
  type: 'query',
  jsonSerializable: true,
  agent: {
    description: 'List every UI dock/panel registered on the devframe hub. Each entry includes id, title, icon, category, and how the dock is rendered (iframe, action, custom-render, launcher). Read-only.',
    title: 'List docks',
  },
  setup: context => ({
    handler: async () => context.docks.values(),
  }),
})
