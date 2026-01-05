import { motion } from 'framer-motion'

interface CompleteProps {
  onRestart: () => void
}

export function Complete({ onRestart }: CompleteProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0A0F',
        gap: 30,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient celebration glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 800,
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Success badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 20px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: 9999,
          fontSize: 14,
          color: '#22C55E',
          fontWeight: 500,
        }}
      >
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22C55E',
          boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
        }} />
        挑戰成功
      </motion.div>

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        style={{
          width: 120,
          height: 120,
          background: 'rgba(245, 158, 11, 0.15)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 64,
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.2)',
        }}
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          color: '#FAFAFA',
          fontSize: 56,
          fontWeight: 700,
          fontFamily: '"Space Grotesk", system-ui, sans-serif',
          letterSpacing: '-0.025em',
        }}
      >
        挑戰完成！
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          color: '#71717A',
          fontSize: 18,
          textAlign: 'center',
          maxWidth: 400,
        }}
      >
        恭喜你成功完成了所有關卡！
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileHover={{
          scale: 1.02,
          borderColor: 'rgba(255,255,255,0.25)',
          background: 'rgba(255, 255, 255, 0.05)',
        }}
        whileTap={{ scale: 0.98 }}
        onClick={onRestart}
        style={{
          marginTop: 20,
          padding: '16px 48px',
          fontSize: 18,
          fontWeight: 500,
          color: '#FAFAFA',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          cursor: 'pointer',
          transition: 'all 200ms ease-out',
        }}
      >
        再玩一次
      </motion.button>
    </div>
  )
}
