import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from './components/Menu'
import { MemoryGame } from './components/MemoryGame'
import { QTEGame } from './components/QTEGame'
import { Complete } from './components/Complete'
import { GameStage } from './types/game'

function App() {
  const [stage, setStage] = useState<GameStage>('menu')

  const handleStart = () => {
    setStage('memory')
  }

  const handleMemoryComplete = () => {
    setStage('qte')
  }

  const handleQTEComplete = () => {
    setStage('complete')
  }

  const handleRestart = () => {
    setStage('menu')
  }

  return (
    <AnimatePresence mode="wait">
      {stage === 'menu' && (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Menu onStart={handleStart} />
        </motion.div>
      )}

      {stage === 'memory' && (
        <motion.div
          key="memory"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <MemoryGame onComplete={handleMemoryComplete} />
        </motion.div>
      )}

      {stage === 'qte' && (
        <motion.div
          key="qte"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <QTEGame onComplete={handleQTEComplete} />
        </motion.div>
      )}

      {stage === 'complete' && (
        <motion.div
          key="complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Complete onRestart={handleRestart} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
