import React from 'react'
import { Settings, Monitor, ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { useTheme } from '../../ThemeContext'
import type { ReceiverProfile } from '../../types'

interface AppSettingsModalProps {
  defaultPiconAction: 'prompt' | 'always' | 'never'
  setDefaultPiconAction: (a: 'prompt' | 'always' | 'never') => void
  expandReceiverConfig: boolean
  setExpandReceiverConfig: (e: boolean) => void
  profiles: ReceiverProfile[]
  setProfiles: React.Dispatch<React.SetStateAction<ReceiverProfile[]>>
  cfgName: string
  setCfgName: (s: string) => void
  cfgHost: string
  setCfgHost: (s: string) => void
  cfgUser: string
  setCfgUser: (s: string) => void
  cfgPass: string
  setCfgPass: (s: string) => void
  cfgPort: number
  setCfgPort: (n: number) => void
  handleSaveConfigProfile: () => void
  onClose: () => void
  activeProfileId: string | null
}

export const AppSettingsModal: React.FC<AppSettingsModalProps> = ({
  defaultPiconAction, setDefaultPiconAction,
  expandReceiverConfig, setExpandReceiverConfig,
  profiles, setProfiles,
  cfgName, setCfgName,
  cfgHost, setCfgHost,
  cfgUser, setCfgUser,
  cfgPass, setCfgPass,
  cfgPort, setCfgPort,
  handleSaveConfigProfile,
  onClose,
  activeProfileId
}) => {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 450, maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--mac-border)', paddingBottom: 12 }}>
          <Settings size={24} color="var(--mac-accent)" />
          <h2 style={{ margin: 0 }}>{t('settings')}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Theme Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>{t('appearance')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['light', 'dark', 'system'] as const).map((m) => (
                <button
                  key={m}
                  className={`mac-button ${theme === m ? 'primary' : ''}`}
                  onClick={() => setTheme(m)}
                  style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                >
                  {m === 'light' ? t('themeLight') : m === 'dark' ? t('themeDark') : t('themeAuto')}
                </button>
              ))}
            </div>
          </div>

          {/* Picon Download Rule */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--mac-border)', paddingTop: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>{t('piconDownloadRule')}</label>
            <select 
              className="mac-input" 
              value={defaultPiconAction} 
              onChange={e => setDefaultPiconAction(e.target.value as any)}
              style={{ padding: '8px 12px' }}
            >
              <option value="prompt">{t('piconAlwaysAsk')}</option>
              <option value="always">{t('piconAlways')}</option>
              <option value="never">{t('piconNever')}</option>
            </select>
          </div>

          {/* Receiver Configuration Accordion */}
          <div style={{ borderTop: '1px solid var(--mac-border)', paddingTop: 16 }}>
            <button 
              className="mac-button" 
              onClick={() => setExpandReceiverConfig(!expandReceiverConfig)}
              style={{ width: '100%', justifyContent: 'space-between', background: 'transparent', border: 'none', padding: '8px 4px', boxShadow: 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                <Monitor size={14} /> {t('receiverConfig')}
              </div>
              {expandReceiverConfig ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {expandReceiverConfig && (
              <div className="animate-slide-up" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--mac-sidebar-bg)', padding: 12, borderRadius: 8 }}>
                
                {/* Saved Profiles List */}
                {profiles.map(p => (
                  <div key={p.id} className="list-item" style={{ background: 'var(--mac-sidebar-bg)', padding: '6px 12px', marginBottom: 6, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                        {activeProfileId === p.id && (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#28cd41', boxShadow: '0 0 3px #28cd41' }} title="Active Connection" />
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--mac-text)', opacity: 0.6 }}>{p.host}:{p.port || 21} ({p.user})</div>
                    </div>
                    <button 
                      className="mac-button" 
                      style={{ padding: '2px 6px', fontSize: 10 }} 
                      onClick={() => setProfiles(prev => prev.filter(x => x.id !== p.id))}
                    >
                      {t('remove')}
                    </button>
                  </div>
                ))}
                
                {profiles.length === 0 && (
                  <div className="text-muted" style={{ textAlign: 'center', padding: 12, fontSize: 12 }}>
                    {t('noSavedReceivers')}
                  </div>
                )}
                
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.1)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>{t('addReceiver')}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input className="mac-input" placeholder={t('receiverNamePlaceholder')} value={cfgName} onChange={e => setCfgName(e.target.value)} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="mac-input" style={{ flex: 3 }} placeholder={t('ipPlaceholder')} value={cfgHost} onChange={e => setCfgHost(e.target.value)} />
                      <input className="mac-input" style={{ flex: 1 }} type="number" placeholder="Port" value={cfgPort} onChange={e => setCfgPort(parseInt(e.target.value, 10))} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input className="mac-input" placeholder={t('userPlaceholder')} value={cfgUser} onChange={e => setCfgUser(e.target.value)} />
                      <input className="mac-input" type="password" placeholder={t('passPlaceholder')} value={cfgPass} onChange={e => setCfgPass(e.target.value)} />
                    </div>
                    <button 
                      className="mac-button primary" 
                      style={{ marginTop: 4, justifyContent: 'center' }} 
                      onClick={handleSaveConfigProfile} 
                      disabled={!cfgName || !cfgHost}
                    >
                      {t('save')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button 
              className="mac-button primary" 
              onClick={onClose} 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {t('close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
