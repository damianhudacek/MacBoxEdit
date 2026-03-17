import React from 'react'
import { Settings, Monitor, Download, Upload, FolderOpen, Globe, Info, Coffee } from 'lucide-react'
import { useTranslation } from '../i18n'

interface ToolbarProps {
  status: string
  localDir: string
  onOpenSettings: () => void
  onOpenConnect: () => void
  onReload: () => void
  onUpload: () => void
  onOpenFromMac: () => void
  onSaveToMac: () => void
  onOpenInfo: () => void
  onDonate: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({
  status, localDir, 
  onOpenSettings, onOpenConnect, onReload, onUpload, onOpenFromMac, onSaveToMac, onOpenInfo, onDonate
}) => {
  const { t, language, setLanguage } = useTranslation()

  return (
    <div 
      className="toolbar-hide-scrollbar"
      style={{ 
        marginTop: 40, padding: '0 12px', height: 60, display: 'flex', alignItems: 'center', gap: 8, 
        borderBottom: '1px solid var(--mac-border)', background: 'var(--mac-sidebar-bg)',
        flexShrink: 0, overflowX: 'auto', whiteSpace: 'nowrap'
      }}
    >
      <button className="mac-button toolbar-btn" onClick={onOpenSettings}>
        <Settings size={16} /> <span className="hide-on-small">{t('settings')}</span>
      </button>
      <button className="mac-button toolbar-btn" onClick={onOpenConnect}>
        <Monitor size={16} /> <span className="hide-on-small">{t('connections')}</span>
      </button>
      <button className="mac-button toolbar-btn" onClick={onReload}>
        <Download size={16} /> <span className="hide-on-small">{t('reload')}</span>
      </button>
      <button className="mac-button primary toolbar-btn" onClick={onUpload} disabled={!localDir}>
        <Upload size={16} /> <span className="hide-on-small">{t('sendToBox')}</span>
      </button>
      <button className="mac-button toolbar-btn" onClick={onOpenFromMac}>
        <FolderOpen size={16} /> <span className="hide-on-small">{t('openFromMac')}</span>
      </button>
      <button className="mac-button toolbar-btn" onClick={onSaveToMac} disabled={!localDir}>
        <FolderOpen size={16} /> <span className="hide-on-small">{t('saveToMac')}</span>
      </button>
      
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 20 }}>
        <span className="hide-on-small" style={{ fontSize: 12, color: 'var(--mac-text)', opacity: 0.6, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          {status}
        </span>
      </div>

      {/* Language Switcher */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Globe size={16} className="text-muted" />
        <select 
          className="mac-input"
          style={{ width: 'auto', padding: '4px 20px 4px 8px', fontSize: 11, cursor: 'pointer', background: 'transparent', border: '1px solid transparent' }}
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
          <option value="fr">FR</option>
          <option value="es">ES</option>
          <option value="pl">PL</option>
          <option value="sk">SK</option>
        </select>
      </div>

      <button className="mac-button toolbar-btn" onClick={onOpenInfo} title={t('infoTitle')} style={{ minWidth: '40px' }}>
        <Info size={16} />
      </button>

      <button 
        className="mac-button toolbar-btn" 
        onClick={onDonate}
        style={{ 
          background: 'linear-gradient(135deg, #FFDD00 0%, #FBB034 100%)', 
          color: '#333', 
          border: 'none',
          fontWeight: 600,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Coffee size={16} /> <span>{t('buyMeACoffee')}</span>
      </button>
    </div>
  )
}
