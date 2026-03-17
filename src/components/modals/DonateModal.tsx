import React, { useState, useEffect } from 'react'
import { Coffee, Heart } from 'lucide-react'
import { useTranslation } from '../../i18n'

interface DonateModalProps {
  onClose: (dontShowAgain: boolean) => void
}

export const DonateModal: React.FC<DonateModalProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(3)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [seconds])

  const handleDonate = () => {
    window.enigmaAPI.openExternal('https://www.buymeacoffee.com/huddan')
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 4000 }}>
      <div className="modal-content glass-panel animate-slide-up" style={{ width: 400, textAlign: 'center', padding: '30px 24px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: 16, 
            borderRadius: '50%', 
            background: 'rgba(255, 149, 0, 0.1)', 
            color: 'var(--mac-accent)',
            marginBottom: 16
          }}>
            <Coffee size={48} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{t('donateTitle')}</h2>
          <p className="text-muted" style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>
            {t('donateMessage')}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <button 
            className="mac-button primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            onClick={handleDonate}
          >
            <Heart size={16} /> {t('supportProject')}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            <input 
              type="checkbox" 
              id="dontShowAgain" 
              checked={dontShowAgain} 
              onChange={(e) => setDontShowAgain(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="dontShowAgain" style={{ fontSize: 13, cursor: 'pointer' }}>
              {t('dontShowAgain')}
            </label>
          </div>

          <button 
            className="mac-button" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            onClick={() => onClose(dontShowAgain)}
            disabled={seconds > 0}
          >
            {seconds > 0 ? t('closeWithTimer').replace('{seconds}', seconds.toString()) : t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
