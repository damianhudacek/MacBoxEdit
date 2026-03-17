import React from 'react'
import { Info, X } from 'lucide-react'
import { useTranslation } from '../../i18n'

interface InfoModalProps {
  onClose: () => void
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
  const { t } = useTranslation()

  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 400, padding: 0, overflow: 'hidden' }}>
        <div className="modal-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--mac-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} />
            <h3 style={{ margin: 0 }}>{t('infoTitle')}</h3>
          </div>
          <button className="mac-button" onClick={onClose} style={{ padding: 4, height: 'auto', minWidth: 'auto' }}>
            <X size={16} />
          </button>
        </div>
        
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: '70vh' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--mac-accent)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 32, fontWeight: 'bold' }}>
              MBE
            </div>
            <h2 style={{ margin: '0 0 4px' }}>MacBoxEdit</h2>
            <div className="text-muted" style={{ fontSize: 11, marginBottom: 12 }}>{t('infoVersion')}</div>
            <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 8px' }}>
              {t('infoDescription')}
            </p>
            <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.5, margin: 0 }}>
              {t('infoAppDetailed')}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Permission Guide */}
            <div style={{ background: 'rgba(255, 149, 0, 0.1)', border: '1px solid rgba(255, 149, 0, 0.3)', padding: 16, borderRadius: 12 }}>
              <h4 style={{ margin: '0 0 8px', color: '#ff9500', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Info size={14} /> {t('infoPermissionTitle')}
              </h4>
              <p style={{ fontSize: 12, lineHeight: 1.4, margin: '0 0 12px' }}>
                {t('infoPermissionGuide')}
              </p>
              <button 
                className="mac-button" 
                style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '6px' }}
                onClick={() => window.enigmaAPI.openNetworkSettings()}
              >
                {t('openSettings')}
              </button>
            </div>

            {/* Contact */}
            <div style={{ background: 'var(--mac-sidebar-bg)', padding: 16, borderRadius: 12, border: '1px solid var(--mac-border)' }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, opacity: 0.6 }}>{t('infoContact')}</p>
              <a href="mailto:macboxedit@gmail.com" style={{ color: 'var(--mac-accent)', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                macboxedit@gmail.com
              </a>
            </div>
          </div>
        </div>
        
        <div style={{ padding: 12, borderTop: '1px solid var(--mac-border)', textAlign: 'right' }}>
          <button className="mac-button primary" onClick={onClose} style={{ minWidth: 80, justifyContent: 'center' }}>
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
