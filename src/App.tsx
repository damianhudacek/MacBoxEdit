import React, { useState, useMemo, useEffect } from 'react'
import { Monitor, List, FolderOpen, Search, Plus, Minus, Edit2 } from 'lucide-react'
import './index.css'
import { useTranslation } from './i18n'

import type { Service, Bouquet, ReceiverProfile, BouquetService } from './types'
import { refToKey } from './utils/enigmaUtils'
import { PiconImg, clearPiconCache } from './components/PiconImg'
import { Toolbar } from './components/Toolbar'

// Modals
import { InfoModal } from './components/modals/InfoModal'
import { ConnectModal } from './components/modals/ConnectModal'
import { AppSettingsModal } from './components/modals/AppSettingsModal'
import { SaveProfileModal } from './components/modals/SaveProfileModal'
import { DownloadPromptModal } from './components/modals/DownloadPromptModal'
import { BouquetPromptModal } from './components/modals/BouquetPromptModal'
import { DonateModal } from './components/modals/DonateModal'
import { ServiceRenameModal } from './components/modals/ServiceRenameModal'
import { RestartPromptModal } from './components/modals/RestartPromptModal'
import { UploadConfirmModal } from './components/modals/UploadConfirmModal'

declare global {
  interface Window {
    enigmaAPI: any
  }
}

function App() {
  const { t, language } = useTranslation()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [showAppSettings, setShowAppSettings] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showSaveProfileModal, setShowSaveProfileModal] = useState(false)
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false)
  const [showBouquetPrompt, setShowBouquetPrompt] = useState(false)
  const [showServiceRenameModal, setShowServiceRenameModal] = useState(false)
  const [renamingServiceIdx, setRenamingServiceIdx] = useState<number | null>(null)
  const [showRestartPrompt, setShowRestartPrompt] = useState(false)
  const [showUploadConfirmModal, setShowUploadConfirmModal] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(() => !localStorage.getItem('mbe_hide_donate'))

  const [host, setHost] = useState(() => localStorage.getItem('mbe_host') || '')
  const [user, setUser] = useState(() => localStorage.getItem('mbe_user') || 'root')
  const [password, setPassword] = useState(() => localStorage.getItem('mbe_password') || '')
  const [port, setPort] = useState(() => parseInt(localStorage.getItem('mbe_port') || '21', 10))
  
  useEffect(() => {
    localStorage.setItem('mbe_host', host)
    localStorage.setItem('mbe_user', user)
    localStorage.setItem('mbe_password', password)
    localStorage.setItem('mbe_port', port.toString())
  }, [host, user, password, port])

  // App Settings State
  const [defaultPiconAction, setDefaultPiconAction] = useState<'prompt' | 'always' | 'never'>(() => {
    return (localStorage.getItem('mbe_picon_action') as any) || 'prompt'
  })
  
  useEffect(() => {
    localStorage.setItem('mbe_picon_action', defaultPiconAction)
  }, [defaultPiconAction])
  
  const [status, setStatus] = useState(() => t('disconnected'))
  const [localDir, setLocalDir] = useState('')
  const [newProfileName, setNewProfileName] = useState('')
  
  // Settings Config State
  const [expandReceiverConfig, setExpandReceiverConfig] = useState(false)
  const [cfgName, setCfgName] = useState('')
  const [cfgHost, setCfgHost] = useState('')
  const [cfgUser, setCfgUser] = useState('root')
  const [cfgPass, setCfgPass] = useState('')
  const [cfgPort, setCfgPort] = useState(21)

  const [profiles, setProfiles] = useState<ReceiverProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mbe_profiles')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('mbe_profiles', JSON.stringify(profiles))
  }, [profiles])

  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)

  const handleSaveProfile = () => {
    if (!newProfileName || !host) return
    const newProfile = { id: crypto.randomUUID(), name: newProfileName, host, user, password, port }
    setProfiles(prev => [...prev, newProfile])
    setShowSaveProfileModal(false)
    setNewProfileName('')
  }
  
  const handleSaveConfigProfile = () => {
    if (!cfgName || !cfgHost) return
    const newProfile = { id: crypto.randomUUID(), name: cfgName, host: cfgHost, user: cfgUser, password: cfgPass, port: cfgPort }
    setProfiles(prev => [...prev, newProfile])
    setCfgName('')
    setCfgHost('')
    setCfgPass('')
    setCfgPort(21)
  } 

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowConnectModal(false)
        setShowAppSettings(false)
        setShowInfoModal(false)
        setShowDownloadPrompt(false)
        setShowSaveProfileModal(false)
        setShowBouquetPrompt(false)
        setShowServiceRenameModal(false)
        setShowRestartPrompt(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-show ConnectModal after DonateModal
  useEffect(() => {
    if (!showDonateModal && !localDir) {
      // Small delay for smoother transition
      const timer = setTimeout(() => setShowConnectModal(true), 100)
      return () => clearTimeout(timer)
    }
  }, [showDonateModal, localDir])
  
  const [services, setServices] = useState<Record<string, Service>>({})
  const [bouquets, setBouquets] = useState<Bouquet[]>([])
  const [selectedBouquet, setSelectedBouquet] = useState<string | null>(null)
  
  const [draggedItemIdx, setDraggedItemIdx] = useState<number | null>(null)
  const [dragOverItemIdx, setDragOverItemIdx] = useState<number | null>(null)
  const [dragOverPosition, setDragOverPosition] = useState<'top' | 'bottom'>('top')
  
  const [selectedServiceIndices, setSelectedServiceIndices] = useState<number[]>([])
  const [lastSelectedServiceIdx, setLastSelectedServiceIdx] = useState<number | null>(null)

  const [bouquetPromptMode, setBouquetPromptMode] = useState<'create' | 'rename'>('create')
  const [bouquetPromptName, setBouquetPromptName] = useState('')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'provider'>('name')
  const [serviceMode, setServiceMode] = useState<'tv' | 'radio'>('tv')

  const filteredAndSortedServices = useMemo(() => {
    let result = Object.values(services).filter(s => s.type === serviceMode)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      result = result.filter(s => 
        s.name.toLowerCase().includes(lowerSearch) || 
        (s.provider && s.provider.toLowerCase().includes(lowerSearch))
      )
    }
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      const provA = a.provider || 'ZZZ'
      const provB = b.provider || 'ZZZ'
      if (provA === provB) return a.name.localeCompare(b.name)
      return provA.localeCompare(provB)
    })
    return result
  }, [services, searchTerm, sortBy])

  const executeDownload = async (downloadPicons: boolean) => {
    setShowDownloadPrompt(false)
    setStatus(t('downloadingSettings'))
    clearPiconCache() // Clear memory cache of picons on reload
    console.log(`[App] Starting download: picons=${downloadPicons}`)
    try {
      const res = await window.enigmaAPI.ftpDownload({ host, user, password, port, downloadPicons })
      if (res.success) {
        setStatus(t('parsingSettings'))
        setLocalDir(res.path)
        
        // Find if current config matches any profile to set active
        const matchedProfile = profiles.find(p => p.host === host && p.user === user)
        if (matchedProfile) {
          setActiveProfileId(matchedProfile.id)
        } else {
          setActiveProfileId(null)
        }

        const parsedServices = await window.enigmaAPI.parseLamedb(res.path)
        setServices(parsedServices)
        const parsedBouquets = await window.enigmaAPI.parseBouquets(res.path)
        setBouquets(parsedBouquets)
        setStatus(t('loadedCounts', { services: Object.keys(parsedServices).length, bouquets: parsedBouquets.length }))
      } else {
        console.error('[App] Download failed:', res.error)
        setStatus(t('errorMsg', { error: res.error }))
        setShowConnectModal(true)
      }
    } catch (err: any) {
      console.error('[App] Exception during download:', err)
      setStatus(t('errorMsg', { error: err.message }))
      setShowConnectModal(true)
    }
  }

  const handleConnectAndDownload = () => {
    setShowConnectModal(false)
    if (defaultPiconAction === 'prompt') setShowDownloadPrompt(true)
    else executeDownload(defaultPiconAction === 'always')
  }

  const handleUpload = () => {
    if (!localDir) return
    setShowUploadConfirmModal(true)
  }

  const executeUpload = async () => {
    setShowUploadConfirmModal(false)
    setStatus(t('savingLocally'))
    await window.enigmaAPI.saveBouquets(localDir, bouquets)
    setStatus(t('uploading'))
    const res = await window.enigmaAPI.ftpUpload({ host, user, password, port }, localDir)
    if (res.success) {
      setStatus(t('uploadSuccess'))
      // Trigger a reload of the service list via WebInterface
      console.log('[App] Triggering servicelist reload...')
      await window.enigmaAPI.reloadServicelist({ host, port: 80 }) // Port for WebInterface
      setShowRestartPrompt(true)
    } else {
      setStatus(t('uploadFailed', { error: res.error }))
    }
  }

  const handleRestartGUI = async () => {
    setShowRestartPrompt(false)
    setStatus(t('restarting'))
    const res = await window.enigmaAPI.restartGUI({ host, port: 80 }) // Port for WebInterface is usually 80
    if (res.success) setStatus(t('restartSuccess'))
    else setStatus(t('restartFailed', { error: res.error }))
  }

  const handleExport = async () => {
    if (!localDir) return
    setStatus(t('savingLocally'))
    await window.enigmaAPI.saveBouquets(localDir, bouquets)
    setStatus(t('waitingFolder'))
    const res = await window.enigmaAPI.exportSettings(localDir)
    if (res.success) setStatus(t('saveSuccess', { path: res.path }))
    else if (res.canceled) setStatus(t('saveCanceled'))
    else setStatus(t('saveFailed', { error: res.error }))
  }

  const handleOpenFromMac = async () => {
    setStatus(t('waitingFolder'))
    const res = await window.enigmaAPI.importSettings()
    if (res.success) {
      setStatus(t('parsingSettings'))
      setLocalDir(res.path)
      const parsedServices = await window.enigmaAPI.parseLamedb(res.path)
      setServices(parsedServices)
      const parsedBouquets = await window.enigmaAPI.parseBouquets(res.path)
      setBouquets(parsedBouquets)
      setStatus(t('loadedCounts', { services: Object.keys(parsedServices).length, bouquets: parsedBouquets.length }))
    } else if (res.canceled) setStatus(t('disconnected'))
    else setStatus(t('errorMsg', { error: res.error }))
  }

  const handleDonate = () => window.enigmaAPI.openExternal('https://www.buymeacoffee.com/huddan')

  const handleDropItem = (e: React.DragEvent, targetIndex: number, position: 'top' | 'bottom') => {
    e.preventDefault()
    setDragOverItemIdx(null)
    setDraggedItemIdx(null)
    if (!selectedBouquet) return
    const referencesStr = e.dataTransfer.getData('service-refs')
    const reorderIdxStr = e.dataTransfer.getData('reorder-index')
    let finalDropIndex = position === 'bottom' ? targetIndex + 1 : targetIndex

    setBouquets(prev => prev.map(bq => {
      if (bq.filename === selectedBouquet) {
        const newSvcs = [...bq.services]
        if (reorderIdxStr) {
          const sourceIndex = parseInt(reorderIdxStr, 10)
          if (sourceIndex === finalDropIndex || sourceIndex === finalDropIndex - 1) return bq
          const [movedItem] = newSvcs.splice(sourceIndex, 1)
          if (sourceIndex < finalDropIndex) finalDropIndex--
          newSvcs.splice(finalDropIndex, 0, movedItem)
        } else if (referencesStr) {
          try {
            const references: string[] = JSON.parse(referencesStr)
            const newBouquetServices: BouquetService[] = references.map(ref => ({ reference: ref }))
            newSvcs.splice(finalDropIndex, 0, ...newBouquetServices)
          } catch {}
        }
        return { ...bq, services: newSvcs }
      }
      return bq
    }))
  }

  const handleDragOverItem = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const position = (e.clientY - rect.top) < rect.height / 2 ? 'top' : 'bottom'
    if (dragOverItemIdx !== idx || dragOverPosition !== position) {
      setDragOverItemIdx(idx)
      setDragOverPosition(position)
    }
  }

  const handleDeleteService = (index: number) => {
    if (!selectedBouquet) return
    setBouquets(prev => prev.map(bq => {
      if (bq.filename === selectedBouquet) {
        const newSvcs = [...bq.services]
        newSvcs.splice(index, 1)
        return { ...bq, services: newSvcs }
      }
      return bq
    }))
  }

  const handleRenameService = (index: number) => {
    console.log('[App] Opening Rename Side for index:', index)
    if (!selectedBouquet) return
    setRenamingServiceIdx(index)
    setShowServiceRenameModal(true)
  }

  const handleSaveRenameService = (newName: string) => {
    if (renamingServiceIdx === null || !selectedBouquet) return
    console.log('[App] Saving new name for service:', renamingServiceIdx, '->', newName)
    
    setBouquets(prev => prev.map(b => {
      if (b.filename === selectedBouquet) {
        const newSvcs = [...b.services]
        newSvcs[renamingServiceIdx] = { ...newSvcs[renamingServiceIdx], name: newName.trim() || undefined }
        return { ...b, services: newSvcs }
      }
      return b
    }))
    setShowServiceRenameModal(false)
    setRenamingServiceIdx(null)
  }

  const handleSaveBouquetPrompt = () => {
    const trimmed = bouquetPromptName.trim()
    if (!trimmed) return
    if (bouquetPromptMode === 'create') {
      const ext = serviceMode === 'tv' ? 'tv' : 'radio'
      const safeFilename = `userbouquet.${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_')}.${ext}`
      setBouquets(prev => [...prev, { filename: safeFilename, name: trimmed, services: [], type: serviceMode }])
      setSelectedBouquet(safeFilename)
    } else {
      setBouquets(prev => prev.map(bq => bq.filename === selectedBouquet ? { ...bq, name: trimmed } : bq))
    }
    setShowBouquetPrompt(false)
  }

  // Deselect bouquet if it's not in the current mode
  useEffect(() => {
    if (selectedBouquet) {
      const bq = bouquets.find(b => b.filename === selectedBouquet)
      if (bq && bq.type !== serviceMode) {
        setSelectedBouquet(null)
      }
    }
  }, [serviceMode, bouquets, selectedBouquet])

  useEffect(() => {
    const d = ['Disconnected', 'Getrennt', 'Déconnecté', 'Desconectado', 'Rozłączono']
    if (d.includes(status)) setStatus(t('disconnected'))
  }, [language, t, status])

  const handleServiceClick = (e: React.MouseEvent, idx: number) => {
    if (e.shiftKey && lastSelectedServiceIdx !== null) {
      const start = Math.min(lastSelectedServiceIdx, idx)
      const end = Math.max(lastSelectedServiceIdx, idx)
      const selection = []
      for (let i = start; i <= end; i++) selection.push(i)
      setSelectedServiceIndices(selection)
    } else if (e.metaKey || e.ctrlKey) {
      setSelectedServiceIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
      setLastSelectedServiceIdx(idx)
    } else {
      setSelectedServiceIndices([idx])
      setLastSelectedServiceIdx(idx)
      setShowBouquetPrompt(false)
    }
  }

  const filteredBouquets = bouquets.filter(b => b.type === serviceMode)
  const activeBouquet = bouquets.find(b => b.filename === selectedBouquet)

  const { tvCount, radioCount } = useMemo(() => {
    let tv = 0, radio = 0
    Object.values(services).forEach(s => {
      if (s.type === 'radio') radio++
      else tv++
    })
    return { tvCount: tv, radioCount: radio }
  }, [services])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="titlebar" />
      
      {showSaveProfileModal && <SaveProfileModal name={newProfileName} setName={setNewProfileName} onSave={handleSaveProfile} onCancel={() => setShowSaveProfileModal(false)} />}
      {showInfoModal && <InfoModal onClose={() => setShowInfoModal(false)} />}
      
      {showAppSettings && (
        <AppSettingsModal
          defaultPiconAction={defaultPiconAction} setDefaultPiconAction={setDefaultPiconAction}
          expandReceiverConfig={expandReceiverConfig} setExpandReceiverConfig={setExpandReceiverConfig}
          profiles={profiles} setProfiles={setProfiles}
          cfgName={cfgName} setCfgName={setCfgName}
          cfgHost={cfgHost} setCfgHost={setCfgHost}
          cfgUser={cfgUser} setCfgUser={setCfgUser}
          cfgPass={cfgPass} setCfgPass={setCfgPass}
          cfgPort={cfgPort} setCfgPort={setCfgPort}
          handleSaveConfigProfile={handleSaveConfigProfile}
          onClose={() => setShowAppSettings(false)}
          activeProfileId={activeProfileId}
        />
      )}

      {showConnectModal && (
        <ConnectModal
          host={host} setHost={setHost} user={user} setUser={setUser} 
          pass={password} setPass={setPassword}
          port={port} setPort={setPort}
          profiles={profiles} setProfiles={setProfiles}
          onConnect={handleConnectAndDownload} onClose={() => setShowConnectModal(false)}
          activeProfileId={activeProfileId}
        />
      )}

      {showDownloadPrompt && <DownloadPromptModal onDownload={executeDownload} onCancel={() => setShowDownloadPrompt(false)} />}
      
      {showUploadConfirmModal && (
        <UploadConfirmModal
          host={host} user={user} port={port}
          onConfirm={executeUpload} onCancel={() => setShowUploadConfirmModal(false)}
        />
      )}

      {showBouquetPrompt && (
        <BouquetPromptModal
          mode={bouquetPromptMode} name={bouquetPromptName} setName={setBouquetPromptName}
          onSave={handleSaveBouquetPrompt} onCancel={() => setShowBouquetPrompt(false)}
        />
      )}

      {showServiceRenameModal && renamingServiceIdx !== null && activeBouquet && (
        <ServiceRenameModal 
          currentName={(() => {
            const s = activeBouquet.services[renamingServiceIdx]
            const k = refToKey(s.reference)
            return s.name || (k ? services[k]?.name : t('unknownService'))
          })()}
          onSave={handleSaveRenameService}
          onCancel={() => { setShowServiceRenameModal(false); setRenamingServiceIdx(null); }}
        />
      )}

      {showRestartPrompt && (
        <RestartPromptModal 
          onRestart={handleRestartGUI}
          onCancel={() => setShowRestartPrompt(false)}
        />
      )}

      {showDonateModal && (
        <DonateModal 
          onClose={(dontShow) => {
            if (dontShow) localStorage.setItem('mbe_hide_donate', 'true')
            setShowDonateModal(false)
          }} 
        />
      )}

      <Toolbar
        status={status} localDir={localDir}
        onOpenSettings={() => setShowAppSettings(true)} onOpenConnect={() => setShowConnectModal(true)}
        onReload={handleConnectAndDownload} onUpload={handleUpload}
        onOpenFromMac={handleOpenFromMac} onSaveToMac={handleExport}
        onOpenInfo={() => setShowInfoModal(true)} onDonate={handleDonate}
      />

      <div style={{ padding: '0 16px', margin: '4px 0' }}>
        <div style={{ display: 'inline-flex', background: 'var(--mac-sidebar-bg)', padding: 2, borderRadius: 8, border: '1px solid var(--mac-border)' }}>
          <button 
            className={`mac-button ${serviceMode === 'tv' ? 'primary' : ''}`}
            style={{ padding: '4px 20px', fontSize: 13, border: 'none', boxShadow: 'none' }}
            onClick={() => setServiceMode('tv')}
          >
            {t('tv')}
          </button>
          <button 
            className={`mac-button ${serviceMode === 'radio' ? 'primary' : ''}`}
            style={{ padding: '4px 20px', fontSize: 13, border: 'none', boxShadow: 'none' }}
            onClick={() => setServiceMode('radio')}
          >
            {t('radio')}
          </button>
        </div>
      </div>

      <div className="app-layout">
        <div className="pane">
          <div className="pane-header" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <List size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
              {t('allServices')} ({filteredAndSortedServices.length} / {Object.keys(services).length})
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={12} style={{ position: 'absolute', left: 8, top: 7, color: 'var(--mac-text)', opacity: 0.5 }} />
                <input 
                  className="mac-input" style={{ paddingLeft: 24, paddingRight: 8, paddingTop: 4, paddingBottom: 4, fontSize: 11 }}
                  placeholder={t('searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="mac-input" style={{ width: 'auto', padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}
                value={sortBy} onChange={e => setSortBy(e.target.value as 'name' | 'provider')}
              >
                <option value="name">{t('sortName')}</option>
                <option value="provider">{t('sortProvider')}</option>
              </select>
            </div>
          </div>
          <div className="pane-content">
            {filteredAndSortedServices.map((srv, idx) => (
              <div 
                key={srv.reference} className={`list-item ${selectedServiceIndices.includes(idx) ? 'selected' : ''}`}
                onClick={(e) => handleServiceClick(e, idx)}
                draggable
                onDragStart={(e) => {
                  let draggedRefs = []
                  if (selectedServiceIndices.includes(idx)) {
                    draggedRefs = selectedServiceIndices.map(i => filteredAndSortedServices[i].fullReference || filteredAndSortedServices[i].reference)
                  } else {
                    setSelectedServiceIndices([idx]); setLastSelectedServiceIdx(idx)
                    draggedRefs = [srv.fullReference || srv.reference]
                  }
                  e.dataTransfer.setData('service-refs', JSON.stringify(draggedRefs))
                  e.dataTransfer.effectAllowed = 'copy'
                }}
              >
                <PiconImg localDir={localDir} reference={srv.fullReference || srv.reference} fallback={<Monitor size={12} className="text-muted" />} />
                <span style={{flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginLeft: 6 }}>{srv.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 80 }}>
                  <span className="text-muted" style={{fontSize: 10}}>{srv.provider}</span>
                  {srv.frequency && (
                    <span className="text-muted" style={{fontSize: 9, opacity: 0.7}}>
                      {srv.frequency} MHz {srv.polarization} {srv.symbolRate}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {filteredAndSortedServices.length === 0 && Object.keys(services).length > 0 && <div className="text-muted" style={{textAlign: 'center', padding: 40}}>{t('noServices')}</div>}
          </div>
        </div>

        <div className="pane" style={{ flex: 0.7 }}>
          <div className="pane-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><FolderOpen size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />{t('bouquets')}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className="mac-button" style={{ padding: '2px 4px' }} onClick={() => { setBouquetPromptMode('create'); setBouquetPromptName(''); setShowBouquetPrompt(true) }} title="Create Bouquet"><Plus size={12} /></button>
              <button className="mac-button" style={{ padding: '2px 4px' }} disabled={!selectedBouquet} onClick={() => { const b = bouquets.find(x => x.filename === selectedBouquet); if (b) { setBouquetPromptMode('rename'); setBouquetPromptName(b.name); setShowBouquetPrompt(true) } }} title="Rename Bouquet"><Edit2 size={12} /></button>
              <button className="mac-button" style={{ padding: '2px 4px' }} disabled={!selectedBouquet} onClick={() => { if (confirm('Delete?')) { setBouquets(p => p.filter(x => x.filename !== selectedBouquet)); setSelectedBouquet(null) } }} title="Delete Bouquet"><Minus size={12} /></button>
            </div>
          </div>
          <div className="pane-content">
            {filteredBouquets.map(bq => (
              <div key={bq.filename} className={`list-item ${selectedBouquet === bq.filename ? 'selected' : ''}`} onClick={() => setSelectedBouquet(bq.filename)}><FolderOpen size={14} className="text-muted" />{bq.name}</div>
            ))}
          </div>
        </div>

        <div className="pane">
          <div className="pane-header">{activeBouquet ? t('channelsIn', { name: activeBouquet.name }) : t('selectBouquet')}{activeBouquet && <span className="text-muted" style={{marginLeft: 8}}>({activeBouquet.services.length})</span>}</div>
          <div 
            className="pane-content" onDragOver={(e) => { e.preventDefault(); if (e.target === e.currentTarget) setDragOverItemIdx(null) }}
            onDrop={(e) => { if (e.target === e.currentTarget && activeBouquet) handleDropItem(e, activeBouquet.services.length || 0, 'top') }}
            style={{ minHeight: '100%', paddingBottom: 60 }}
          >
            {activeBouquet?.services.map((bqSvc, idx) => {
              const ref = bqSvc.reference
              const key = refToKey(ref); const srv = key ? services[key] : undefined
              const displayName = bqSvc.name || (srv ? srv.name : t('unknownService'))
              const isOver = dragOverItemIdx === idx; const borderTop = isOver && dragOverPosition === 'top' ? '2px solid var(--mac-accent)' : 'none'; const borderBottom = isOver && dragOverPosition === 'bottom' ? '2px solid var(--mac-accent)' : 'none'; const opacity = draggedItemIdx === idx ? 0.5 : 1
              return (
                <div 
                  key={`${ref}-${idx}`} className="list-item" draggable
                  onDragStart={(e) => { e.dataTransfer.setData('reorder-index', idx.toString()); e.dataTransfer.effectAllowed = 'move'; setDraggedItemIdx(idx) }}
                  onDragEnd={() => setDraggedItemIdx(null)} onDragOver={(e) => handleDragOverItem(e, idx)} onDragLeave={() => setDragOverItemIdx(null)} onDrop={(e) => handleDropItem(e, idx, dragOverPosition)}
                  style={{ display: 'flex', justifyContent: 'space-between', borderTop, borderBottom, opacity }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden'}}><span className="text-muted" style={{width: 24, fontSize: 10}}>{idx + 1}</span><PiconImg localDir={localDir} reference={ref} fallback={<Monitor size={12} className="text-muted" />} /><span style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 12, fontWeight: bqSvc.name ? 600 : 400 }}>{displayName}</span></div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="mac-button" style={{padding: '2px 6px', fontSize: 10}} onClick={(e) => { e.stopPropagation(); handleRenameService(idx); }}>{t('rename')}</button>
                    <button className="mac-button" style={{padding: '2px 6px', fontSize: 10}} onClick={(e) => { e.stopPropagation(); handleDeleteService(idx); }}>{t('remove')}</button>
                  </div>
                </div>
              )
            })}
            {!activeBouquet && <div className="text-muted" style={{textAlign: 'center', marginTop: 40}}>{t('selectBouquetLeft')}</div>}
            {activeBouquet && activeBouquet.services.length === 0 && <div className="text-muted" style={{textAlign: 'center', marginTop: 40}}>{t('dragAndDrop')}</div>}
          </div>
        </div>
      </div>

      <div className="status-bar">
        <div className="status-item" style={{ flex: 1, overflow: 'hidden' }}>
          {status.includes('EHOSTUNREACH') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ff3b30' }}>
              <span style={{ fontWeight: 500 }}>{t('networkPermissionHelp')}</span>
              <button className="mac-button" style={{ padding: '2px 8px', fontSize: 10 }} onClick={() => window.enigmaAPI.openNetworkSettings()}>
                {t('openSettings')}
              </button>
            </div>
          ) : (
            <>
              <div className="status-dot" style={{ background: status.includes('Úspešne') || status.includes('Success') ? '#34c759' : status.includes('zlyhalo') || status.includes('Failed') ? '#ff3b30' : '#007aff' }} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{status || t('ready')}</span>
            </>
          )}
        </div>
        <div className="status-item" style={{ borderLeft: '1px solid var(--mac-border)', paddingLeft: 12 }}>
          <span style={{ opacity: 0.9 }}>{t('connectedTo', { name: profiles.find(p => p.id === activeProfileId)?.name || host || '---' })}</span>
        </div>
        <div className="status-item" style={{ borderLeft: '1px solid var(--mac-border)', paddingLeft: 12 }}>
          <div className="status-dot" style={{ background: '#ff3b30' }} />
          <span>{t('tv')}: <b>{tvCount}</b></span>
        </div>
        <div className="status-item">
          <div className="status-dot" style={{ background: '#ff9500' }} />
          <span>{t('radio')}: <b>{radioCount}</b></span>
        </div>
        {activeBouquet && (
          <div className="status-item" style={{ marginLeft: 'auto' }}>
            <span>{t('inBouquet')}: <b>{activeBouquet.services.length}</b></span>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
