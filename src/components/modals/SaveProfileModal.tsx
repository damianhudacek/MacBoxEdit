import React from 'react'
import { useTranslation } from '../../i18n'

interface SaveProfileModalProps {
  name: string
  setName: (s: string) => void
  onSave: () => void
  onCancel: () => void
}

export const SaveProfileModal: React.FC<SaveProfileModalProps> = ({
  name, setName, onSave, onCancel
}) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 300 }}>
        <h3 style={{ marginBottom: 4 }}>{t('nameReceiver')}</h3>
        <p className="text-muted" style={{ marginBottom: 12 }}>{t('nameReceiverHelper')}</p>
        <input 
          autoFocus
          className="mac-input" 
          placeholder={t('receiverNamePlaceholder')} 
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && name.trim()) {
              onSave()
            }
            if (e.key === 'Escape') onCancel()
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button 
            className="mac-button" 
            onClick={onCancel} 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('cancel')}
          </button>
          <button 
            className="mac-button primary" 
            disabled={!name.trim()}
            onClick={onSave} 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
