import { motion } from 'framer-motion'

interface MenuProps {
  onStart: () => void
}

export function Menu({ onStart }: MenuProps) {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        gap: 40,
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          color: '#fff',
          fontSize: 64,
          fontWeight: 'bold',
          textShadow: '0 0 30px rgba(255,100,100,0.5)',
          textAlign: 'center',
        }}
      >
        迷因挑戰
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: 24,
          textAlign: 'center',
          maxWidth: 500,
        }}
      >
        第一關：記憶配對
        <br />
        第二關：QTE 挑戰
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onStart}
        style={{
          marginTop: 20,
          padding: '20px 60px',
          fontSize: 28,
          fontWeight: 'bold',
          color: '#fff',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: 15,
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
        }}
      >
        開始遊戲
      </motion.button>
    </div>
  )
}
