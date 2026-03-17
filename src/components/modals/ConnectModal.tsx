import { Monitor } from 'lucide-react'
import { useTranslation } from '../../i18n'
import type { ReceiverProfile } from '../../types'

interface ConnectModalProps {
  host: string
  setHost: (s: string) => void
  user: string
  setUser: (s: string) => void
  pass: string
  setPass: (s: string) => void
  port: number
  setPort: (n: number) => void
  profiles: ReceiverProfile[]
  setProfiles: React.Dispatch<React.SetStateAction<ReceiverProfile[]>>
  onConnect: () => void
  onClose: () => void
  activeProfileId: string | null
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  host, setHost, user, setUser, pass, setPass, port, setPort, profiles, setProfiles, onConnect, onClose, activeProfileId
}) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Monitor size={48} color="var(--mac-accent)" />
          <h2 style={{ marginTop: 12 }}>{t('connectToReceiver')}</h2>
          <p className="text-muted">{t('enterFtpDetails')}</p>
        </div>
        
        {profiles.length > 0 && (
          <div style={{ marginBottom: 16, textAlign: 'left' }}>
            <label className="text-muted" style={{ fontSize: 11, marginBottom: 8, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('savedReceivers')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflowY: 'auto' }}>
              {profiles.map(p => (
                <div 
                  key={p.id} 
                  className={`list-item ${host === p.host ? 'selected' : ''}`}
                  style={{ padding: '6px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--mac-sidebar-bg)', borderRadius: 6, border: '1px solid var(--mac-border)', cursor: 'pointer' }}
                  onClick={() => {
                    setHost(p.host)
                    setUser(p.user)
                    setPass(p.password || '')
                    setPort(p.port || 21)
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--mac-text)' }}>{p.name}</div>
                      {activeProfileId === p.id && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28cd41', boxShadow: '0 0 4px #28cd41' }} />
                      )}
                    </div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{p.host}:{p.port || 21}</div>
                  </div>
                  <button 
                    className="mac-button" 
                    style={{ padding: '2px 6px', fontSize: 10 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setProfiles(prev => prev.filter(x => x.id !== p.id))
                    }}
                  >
                    {t('remove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="mac-input" style={{ flex: 3 }} placeholder={t('ipPlaceholder')} value={host} onChange={e => setHost(e.target.value)} />
            <input className="mac-input" style={{ flex: 1 }} type="number" placeholder="Port" value={port} onChange={e => setPort(parseInt(e.target.value, 10))} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="mac-input" placeholder={t('userPlaceholder')} value={user} onChange={e => setUser(e.target.value)} />
            <input className="mac-input" type="password" placeholder={t('passPlaceholder')} value={pass} onChange={e => setPass(e.target.value)} />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="mac-button" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
            {t('cancel')}
          </button>
          <button className="mac-button primary" onClick={onConnect} style={{ flex: 1.5, justifyContent: 'center' }}>
            {t('connectAndDownload')}
          </button>
        </div>
      </div>
    </div>
  )
}
