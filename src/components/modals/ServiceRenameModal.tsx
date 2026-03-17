import React, { useEffect, useRef } from 'react'
import { useTranslation } from '../../i18n'

interface ServiceRenameModalProps {
  currentName: string
  onSave: (newName: string) => void
  onCancel: () => void
}

export function ServiceRenameModal({ currentName, onSave, onCancel }: ServiceRenameModalProps) {
  const { t } = useTranslation()
  const [name, setName] = React.useState(currentName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleSave = () => {
    onSave(name)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content animate-slide-up" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{t('rename')}</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>{t('renameServicePrompt')}</p>
        
        <input 
          ref={inputRef}
          className="mac-input" 
          value={name} 
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('unknownService')}
          style={{ width: '100%', marginBottom: 20 }}
        />

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="mac-button" onClick={onCancel}>{t('cancel')}</button>
          <button className="mac-button primary" onClick={handleSave}>{t('save')}</button>
        </div>
      </div>
    </div>
  )
}
