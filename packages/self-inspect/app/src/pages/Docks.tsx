import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useState } from 'preact/hooks'

interface DockEntry {
  id: string
  title: string
  type: string
  category?: string
  icon?: string
  when?: string
  url?: string
  clientScript?: { importFrom: string, importName?: string }
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

export function Docks({ rpc }: { rpc: DevframeRpcClient }) {
  const [docks, setDocks] = useState<DockEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    rpc.call('self-inspect:get-docks').then((d: any) => {
      setDocks(d ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [rpc])

  if (loading)
    return <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>

  // Group by category
  const groups = new Map<string, DockEntry[]>()
  for (const dock of docks) {
    const cat = dock.category || 'default'
    if (!groups.has(cat))
      groups.set(cat, [])
    groups.get(cat)!.push(dock)
  }
  const sortedGroups = Array.from(groups.entries())

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {docks.length}
        {' '}
        docks registered
      </div>

      {sortedGroups.map(([category, categoryDocks]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>{category}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              (
              {categoryDocks.length}
              )
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['ID', 'Title', 'Type', 'Details'].map(h => (
                  <th key={h} style={{ padding: '4px 8px', textAlign: 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categoryDocks.map(dock => (
                <tr
                  key={dock.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    opacity: dock.when === 'false' ? 0.4 : 1,
                  }}
                >
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {dock.when && dock.when !== 'false' && (
                      <span title={`when: ${dock.when}`} style={{ marginRight: '4px', color: 'var(--text-muted)' }}>⚑</span>
                    )}
                    {dock.id}
                  </td>
                  <td style={{ padding: '6px 8px' }}>{dock.title}</td>
                  <td style={{ padding: '6px 8px' }}>
                    <Badge text={dock.type} />
                  </td>
                  <td style={{ padding: '6px 8px', fontSize: '12px' }}>
                    {dock.type === 'iframe' && dock.url && (
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-muted)', marginRight: '6px' }}>
                        {dock.url}
                      </span>
                    )}
                    {dock.clientScript && <Badge text="client-script" />}
                    {dock.type !== 'iframe' && !dock.clientScript && <span style={{ color: 'var(--text-faint)' }}>–</span>}
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
