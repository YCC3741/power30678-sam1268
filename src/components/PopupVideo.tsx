import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'

interface PopupVideoProps {
  src: string
  x: number
  y: number
  onClose?: () => void
  showCloseButton?: boolean
}

export function PopupVideo({ src, x, y, onClose, showCloseButton = false }: PopupVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex: 1000,
        borderRadius: 10,
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
      }}
    >
      {showCloseButton && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 5,
            right: 5,
            width: 30,
            height: 30,
            background: 'rgba(255,0,0,0.9)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            fontSize: 18,
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          X
        </button>
      )}
      <video
        ref={videoRef}
        src={src}
        loop
        playsInline
        style={{
          width: 300,
          height: 'auto',
          display: 'block',
        }}
      />
    </motion.div>
  )
}
