import type { ClientScriptEntry } from '@devframes/hub/types'

export interface ClientScriptInfo {
  dockId: string
  dockTitle: string
  dockType: string
  script: ClientScriptEntry
}
