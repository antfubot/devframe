import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useState } from 'preact/hooks'

interface AuthToken {
  authToken: string
  ua: string
  origin: string
  timestamp: number
}

export function AuthTokens({ rpc }: { rpc: DevframeRpcClient }) {
  const [tokens, setTokens] = useState<AuthToken[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchTokens() {
    setLoading(true)
    try {
      const t = await rpc.call('self-inspect:get-auth-tokens') as AuthToken[]
      setTokens(t ?? [])
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTokens()
  }, [rpc])

  async function revoke(authToken: string) {
    await rpc.call('self-inspect:revoke-auth-token', authToken)
    setTokens(prev => prev.filter(t => t.authToken !== authToken))
  }

  if (loading)
    return <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
        {tokens.length}
        {' '}
        trusted client
        {tokens.length !== 1 ? 's' : ''}
      </div>

      {tokens.length === 0
        ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-faint)', fontSize: '13px' }}>
              No auth tokens found.
            </div>
          )
        : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Auth Token', 'User Agent', 'Origin', 'Trusted At', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '4px 8px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokens.map(token => (
                  <tr key={token.authToken} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', fontSize: '11px' }}>
                      {token.authToken}
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {token.ua || '–'}
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {token.origin || '–'}
                    </td>
                    <td style={{ padding: '6px 8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(token.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <button
                        onClick={() => revoke(token.authToken)}
                        style={{
                          padding: '2px 8px',
                          fontSize: '11px',
                          border: '1px solid var(--danger)',
                          borderRadius: '4px',
                          background: 'transparent',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </div>
  )
}
