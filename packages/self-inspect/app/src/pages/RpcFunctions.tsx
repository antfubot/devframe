import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useState } from 'preact/hooks'

interface RpcFunctionInfo {
  name: string
  type: string
  cacheable: boolean
  hasArgs: boolean
  hasReturns: boolean
  hasDump: boolean
  hasSetup: boolean
  hasHandler: boolean
}

const TYPE_COLORS: Record<string, string> = {
  query: '#6366f1',
  action: '#f59e0b',
  static: '#22c55e',
  event: '#ec4899',
}

function Badge({ text }: { text: string }) {
  const color = TYPE_COLORS[text]
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: '4px',
      fontSize: '11px',
      fontFamily: 'monospace',
      background: color ? `${color}22` : 'var(--badge-bg)',
      color: color ?? 'var(--badge-text)',
      border: `1px solid ${color ? `${color}44` : 'var(--border)'}`,
    }}
    >
      {text}
    </span>
  )
}

function getNamespace(name: string): string {
  const parts = name.split(':')
  return parts.length <= 1 ? '(other)' : parts.slice(0, -1).join(':')
}

function getShortName(name: string): string {
  const parts = name.split(':')
  return parts.at(-1)!
}

export function RpcFunctions({ rpc }: { rpc: DevframeRpcClient }) {
  const [functions, setFunctions] = useState<RpcFunctionInfo[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    rpc.call('self-inspect:get-rpc-functions').then((fns: any) => {
      setFunctions(fns ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [rpc])

  const filtered = search
    ? functions.filter(fn => fn.name.toLowerCase().includes(search.toLowerCase()))
    : functions

  // Group by namespace
  const groups = new Map<string, RpcFunctionInfo[]>()
  for (const fn of filtered) {
    const ns = getNamespace(fn.name)
    if (!groups.has(ns))
      groups.set(ns, [])
    groups.get(ns)!.push(fn)
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))

  const typeStats = functions.reduce<Record<string, number>>((acc, fn) => {
    acc[fn.type] = (acc[fn.type] || 0) + 1
    return acc
  }, {})

  if (loading)
    return <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Filter functions…"
          value={search}
          onInput={e => setSearch((e.target as HTMLInputElement).value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '4px 8px',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontSize: '13px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>
            {functions.length}
            {' '}
            total
          </span>
          {Object.entries(typeStats).map(([type, count]) => (
            <span key={type}>
              <Badge text={type} />
              {' '}
              {count}
            </span>
          ))}
        </div>
      </div>

      {sortedGroups.map(([ns, fns]) => (
        <div key={ns} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', marginTop: '8px' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{ns}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-faint)' }}>
              (
              {fns.length}
              )
            </span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Type', 'Cacheable', 'Schema', 'Dump'].map(h => (
                  <th key={h} style={{ padding: '4px 8px', textAlign: h === 'Cacheable' || h === 'Schema' || h === 'Dump' ? 'center' : 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fns.map(fn => (
                <tr key={fn.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '12px' }} title={fn.name}>
                    {getShortName(fn.name)}
                  </td>
                  <td style={{ padding: '6px 8px' }}>
                    <Badge text={fn.type} />
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: fn.cacheable ? 'var(--success)' : 'var(--text-faint)' }}>
                    {fn.cacheable ? '✓' : '–'}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                    {fn.hasArgs || fn.hasReturns
                      ? (
                          <span style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            {fn.hasArgs && <Badge text="args" />}
                            {fn.hasReturns && <Badge text="returns" />}
                          </span>
                        )
                      : <span style={{ color: 'var(--text-faint)' }}>–</span>}
                  </td>
                  <td style={{ padding: '6px 8px', textAlign: 'center', color: fn.hasDump ? 'var(--success)' : 'var(--text-faint)' }}>
                    {fn.hasDump ? '✓' : '–'}
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
