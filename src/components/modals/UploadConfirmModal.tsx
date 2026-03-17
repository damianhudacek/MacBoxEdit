import React from 'react'
import { Send, User, Globe } from 'lucide-react'
import { useTranslation } from '../../i18n'

interface UploadConfirmModalProps {
  host: string
  user: string
  port: number
  onConfirm: () => void
  onCancel: () => void
}

export const UploadConfirmModal: React.FC<UploadConfirmModalProps> = ({ host, user, port, onConfirm, onCancel }) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--mac-accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Send size={20} />
          </div>
          <h3 style={{ margin: 0 }}>{t('uploadConfirmTitle')}</h3>
        </div>

        <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 20 }}>
          {t('uploadConfirmMessage')}
        </p>

        <div style={{ background: 'var(--mac-sidebar-bg)', border: '1px solid var(--mac-border)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={14} className="text-muted" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>IP Adresa</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{host}:{port}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <User size={14} className="text-muted" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, opacity: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>Užívateľ</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{user}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <button className="mac-button" onClick={onCancel} style={{ minWidth: 100 }}>
            {t('cancel')}
          </button>
          <button className="mac-button primary" onClick={onConfirm} style={{ minWidth: 100 }}>
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
