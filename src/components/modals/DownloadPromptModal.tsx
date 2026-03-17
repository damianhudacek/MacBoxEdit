import React from 'react'
import { Download, List } from 'lucide-react'
import { useTranslation } from '../../i18n'

interface DownloadPromptModalProps {
  onDownload: (withPicons: boolean) => void
  onCancel: () => void
}

export const DownloadPromptModal: React.FC<DownloadPromptModalProps> = ({ onDownload, onCancel }) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" style={{ zIndex: 4000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 380, textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>{t('downloadPromptTitle')}</h2>
        <p className="text-muted" style={{ marginBottom: 24, fontSize: 13, lineHeight: 1.5 }}>
          {t('downloadPromptMessage')}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            className="mac-button primary" 
            onClick={() => onDownload(true)} 
            style={{ justifyContent: 'center', padding: '10px 0', fontSize: 13 }}
          >
            <Download size={14} style={{ marginRight: 6 }} /> 
            {t('downloadWithPicons')}
          </button>
          
          <button 
            className="mac-button primary" 
            onClick={() => onDownload(false)} 
            style={{ justifyContent: 'center', padding: '10px 0', fontSize: 13 }}
          >
            <List size={14} style={{ marginRight: 6 }} /> 
            {t('downloadSettingsOnly')}
          </button>
          
          <button 
            className="mac-button" 
            onClick={onCancel} 
            style={{ justifyContent: 'center', marginTop: 8 }}
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
