import React, { useState, useEffect } from 'react'

// Global cache for picons so we don't ask the main process 10,000 times
const piconCache = new Map<string, string | null>()

export const clearPiconCache = () => {
  piconCache.clear()
}

interface PiconImgProps {
  localDir: string
  reference: string
  fallback: React.ReactNode
}

export const PiconImg: React.FC<PiconImgProps> = ({ localDir, reference, fallback }) => {
  const [src, setSrc] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // If localDir changes, we should probably reset since the files might be different
    setSrc(piconCache.get(`${localDir}:${reference}`) || null)
    setLoaded(piconCache.has(`${localDir}:${reference}`))
  }, [localDir, reference])

  useEffect(() => {
    if (loaded || !localDir) return
    let isMounted = true

    const cacheKey = `${localDir}:${reference}`
    
    window.enigmaAPI.getPicon(localDir, reference).then((base64: string | null) => {
      if (base64) {
        piconCache.set(cacheKey, base64)
      } else {
        // Don't cache permanent failure if it might be a temporary issue (like download in progress)
        // but if it's really missing, we keep it null
        piconCache.set(cacheKey, null)
      }

      if (isMounted) {
        setSrc(base64)
        setLoaded(true)
      }
    })
    return () => { isMounted = false }
  }, [localDir, reference, loaded])

  if (!loaded || !src) return <>{fallback}</>
  return <img src={src} alt="picon" style={{ width: 32, height: 18, objectFit: 'contain' }} />
}
