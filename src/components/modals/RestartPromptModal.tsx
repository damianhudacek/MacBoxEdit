import { useTranslation } from '../../i18n'

interface RestartPromptModalProps {
  onRestart: () => void
  onCancel: () => void
}

export function RestartPromptModal({ onRestart, onCancel }: RestartPromptModalProps) {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content animate-slide-up" style={{ width: 400 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>{t('restartPromptTitle')}</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
          {t('restartPromptMessage')}
        </p>

        <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: 10 }}>
          <button className="mac-button" onClick={onCancel}>{t('cancel')}</button>
          <button className="mac-button primary" onClick={onRestart}>{t('restartNow')}</button>
        </div>
      </div>
    </div>
  )
}
