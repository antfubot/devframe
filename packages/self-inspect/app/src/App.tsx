import type { DevframeRpcClient } from 'devframe/client'
import { useEffect, useRef, useState } from 'preact/hooks'
import { AuthTokens } from './pages/AuthTokens'
import { ClientScripts } from './pages/ClientScripts'
import { Docks } from './pages/Docks'
import { RpcFunctions } from './pages/RpcFunctions'
import { SharedState } from './pages/SharedState'
import { connect } from './rpc'

type Tab = 'rpc' | 'docks' | 'scripts' | 'state' | 'auth'

function getInitialTab(): Tab {
  const hash = location.hash.slice(1) as Tab
  return ['rpc', 'docks', 'scripts', 'state', 'auth'].includes(hash) ? hash : 'rpc'
}

const tabs: { id: Tab, label: string }[] = [
  { id: 'rpc', label: 'RPC Functions' },
  { id: 'docks', label: 'Docks' },
  { id: 'scripts', label: 'Client Scripts' },
  { id: 'state', label: 'Shared State' },
  { id: 'auth', label: 'Auth Tokens' },
]

const navStyle: preact.JSX.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid var(--border)',
  height: '36px',
  flexShrink: 0,
  overflowX: 'auto',
}

function tabStyle(active: boolean): preact.JSX.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    padding: '0 12px',
    fontSize: '13px',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
    color: active ? 'var(--text)' : 'var(--text-muted)',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
  }
}

export function App() {
  const [tab, setTab] = useState<Tab>(getInitialTab)
  const [rpc, setRpc] = useState<DevframeRpcClient | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    connect()
      .then((client) => {
        if (mounted.current)
          setRpc(client)
      })
      .catch((e: Error) => {
        if (mounted.current)
          setError(e.message)
      })
    const onHashChange = () => {
      const h = location.hash.slice(1) as Tab
      if (['rpc', 'docks', 'scripts', 'state', 'auth'].includes(h))
        setTab(h)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => {
      mounted.current = false
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])

  function switchTab(id: Tab) {
    setTab(id)
    location.hash = id
  }

  if (error) {
    return (
      <div style={{ padding: '16px', color: 'var(--danger)' }}>
        <strong>Connection error:</strong>
        {' '}
        {error}
      </div>
    )
  }

  if (!rpc) {
    return (
      <div style={{ padding: '16px', color: 'var(--text-muted)' }}>
        Connecting to devframe…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <nav style={navStyle}>
        {tabs.map(t => (
          <button
            key={t.id}
            style={tabStyle(tab === t.id)}
            onClick={() => switchTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'rpc' && <RpcFunctions rpc={rpc} />}
        {tab === 'docks' && <Docks rpc={rpc} />}
        {tab === 'scripts' && <ClientScripts rpc={rpc} />}
        {tab === 'state' && <SharedState rpc={rpc} />}
        {tab === 'auth' && <AuthTokens rpc={rpc} />}
      </div>
    </div>
  )
}
