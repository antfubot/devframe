import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useState } from 'preact/hooks'

export function SharedState({ rpc }: { rpc: DevframeRpcClient }) {
  const [keys, setKeys] = useState<string[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [value, setValue] = useState<unknown>(undefined)
  const [editText, setEditText] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [stateLoading, setStateLoading] = useState(false)
  const [showInternal, setShowInternal] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    rpc.call('self-inspect:get-shared-state-keys').then((k: any) => {
      setKeys(k ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [rpc])

  useEffect(() => {
    if (!selectedKey) {
      setValue(undefined)
      setEditText('')
      return
    }
    setStateLoading(true)
    rpc.call('devframe:rpc:server-state:get', selectedKey).then((v: any) => {
      setValue(v)
      setEditText(JSON.stringify(v, null, 2))
      setStateLoading(false)
    }).catch(() => setStateLoading(false))
  }, [selectedKey, rpc])

  async function saveState() {
    if (!selectedKey)
      return
    try {
      const parsed = JSON.parse(editText)
      setSaveError(null)
      await rpc.call('devframe:rpc:server-state:set', selectedKey, parsed, `si-${Date.now()}`)
      setValue(parsed)
    }
    catch (e) {
      setSaveError((e as Error).message)
    }
  }

  const filteredKeys = showInternal
    ? keys
    : keys.filter(k => !k.startsWith('devframe:') && !k.startsWith('__'))

  if (loading)
    return <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            {filteredKeys.length}
            {' '}
            shared states
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px' }}>
            <input
              type="checkbox"
              checked={showInternal}
              onChange={e => setShowInternal((e.target as HTMLInputElement).checked)}
            />
            Internal
          </label>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredKeys.map(key => (
            <button
              key={key}
              onClick={() => setSelectedKey(key)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '6px 12px',
                borderBottom: '1px solid var(--border)',
                fontSize: '12px',
                fontFamily: 'monospace',
                background: selectedKey === key ? 'var(--bg-hover)' : 'transparent',
                color: selectedKey === key ? 'var(--primary)' : 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                wordBreak: 'break-all',
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {!selectedKey && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-faint)', fontSize: '13px' }}>
            Select a shared state to inspect
          </div>
        )}
        {selectedKey && stateLoading && (
          <div style={{ padding: '16px', color: 'var(--text-muted)' }}>Loading…</div>
        )}
        {selectedKey && !stateLoading && value !== undefined && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{selectedKey}</span>
              <button
                onClick={saveState}
                style={{
                  padding: '3px 10px',
                  fontSize: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
            {saveError && (
              <div style={{ fontSize: '12px', color: 'var(--danger)' }}>{saveError}</div>
            )}
            <textarea
              value={editText}
              onInput={e => setEditText((e.target as HTMLTextAreaElement).value)}
              style={{
                flex: 1,
                minHeight: '300px',
                fontFamily: 'monospace',
                fontSize: '12px',
                padding: '8px',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                background: 'var(--bg-secondary)',
                color: 'var(--text)',
                resize: 'vertical',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
