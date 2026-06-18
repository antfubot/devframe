import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useState } from 'preact/hooks'

interface ClientScriptInfo {
  dockId: string
  dockTitle: string
  dockType: string
  script: {
    importFrom: string
    importName?: string
  }
}

function Badge({ text }: { text: string }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      background: 'var(--badge-bg)',
      color: 'var(--badge-text)',
      border: '1px solid var(--border)',
    }}
    >
      {text}
    </span>
  )
}

function shortPath(path: string): string {
  const parts = path.split('/')
  if (parts.length <= 3)
    return path
  return `.../${parts.slice(-3).join('/')}`
}

export function ClientScripts({ rpc }: { rpc: DevframeRpcClient }) {
  const [scripts, setScripts] = useState<ClientScriptInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    rpc.call('self-inspect:get-client-scripts').then((s: any) => {
      setScripts(s ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [rpc])

  if (loading)
    return <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>

  if (scripts.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: '13px' }}>
        No client scripts registered.
      </div>
    )
  }

  // Group by dock type
  const groups = new Map<string, ClientScriptInfo[]>()
  for (const script of scripts) {
    const type = script.dockType
    if (!groups.has(type))
      groups.set(type, [])
    groups.get(type)!.push(script)
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {scripts.length}
        {' '}
        client scripts registered
      </div>

      {sortedGroups.map(([type, typeScripts]) => (
        <div key={type} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '8px' }}>
            <Badge text={type} />
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              (
              {typeScripts.length}
              )
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Dock ID', 'Dock Title', 'Import From', 'Import Name'].map(h => (
                  <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {typeScripts.map(script => (
                <tr key={script.dockId} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {script.dockId}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{script.dockTitle}</td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={script.script.importFrom}>
                    {shortPath(script.script.importFrom)}
                  </td>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {script.script.importName ?? 'default'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
