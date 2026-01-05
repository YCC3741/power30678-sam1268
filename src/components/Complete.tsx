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
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        gap: 30,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          fontSize: 100,
        }}
      >
        🎉
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          color: '#fff',
          fontSize: 56,
          fontWeight: 'bold',
          textShadow: '0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        挑戰完成！
      </motion.h1>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRestart}
        style={{
          marginTop: 30,
          padding: '15px 50px',
          fontSize: 24,
          fontWeight: 'bold',
          color: '#11998e',
          background: '#fff',
          border: 'none',
          borderRadius: 10,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        再玩一次
      </motion.button>
    </div>
  )
}
