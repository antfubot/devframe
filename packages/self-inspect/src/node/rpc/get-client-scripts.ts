import type { ClientScriptInfo } from '../../types'
import { defineHubRpcFunction } from '@devframes/hub'

export const getClientScripts = defineHubRpcFunction({
  name: 'self-inspect:get-client-scripts',
  type: 'query',
  jsonSerializable: true,
  agent: {
    description: 'List client-side scripts attached to UI docks (actions, custom renderers, and iframe clientScripts). Read-only — returns the script import metadata, not execution state.',
    title: 'List client scripts',
  },
  setup: context => ({
    handler: async () => {
      const scripts: ClientScriptInfo[] = []
      for (const dock of context.docks.values()) {
        if (dock.type === 'action') {
          scripts.push({
            dockId: dock.id,
            dockTitle: dock.title,
            dockType: dock.type,
            script: dock.action,
          })
        }
        else if (dock.type === 'custom-render') {
          scripts.push({
            dockId: dock.id,
            dockTitle: dock.title,
            dockType: dock.type,
            script: dock.renderer,
          })
        }
        else if (dock.type === 'iframe' && dock.clientScript) {
          scripts.push({
            dockId: dock.id,
            dockTitle: dock.title,
            dockType: dock.type,
            script: dock.clientScript,
          })
        }
      }
      return scripts
    },
  }),
})
