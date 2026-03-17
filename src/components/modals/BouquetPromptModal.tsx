import React from 'react'
import { useTranslation } from '../../i18n'

interface BouquetPromptModalProps {
  mode: 'create' | 'rename'
  name: string
  setName: (s: string) => void
  onSave: () => void
  onCancel: () => void
}

export const BouquetPromptModal: React.FC<BouquetPromptModalProps> = ({
  mode, name, setName, onSave, onCancel
}) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" style={{ zIndex: 4000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 300 }}>
        <h3 style={{ marginBottom: 12 }}>
          {mode === 'create' ? 'Create Bouquet' : 'Rename Bouquet'}
        </h3>
        <input 
          autoFocus
          className="mac-input" 
          placeholder="Bouquet Name" 
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') onSave()
            if (e.key === 'Escape') onCancel()
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
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
