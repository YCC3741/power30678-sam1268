import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from './components/Menu'
import { MemoryGame } from './components/MemoryGame'
import { QTEGame } from './components/QTEGame'
import { Complete } from './components/Complete'
import { GameStage } from './types/game'
import { Dialog } from './components/Dialog'

function App() {
  const [stage, setStage] = useState<GameStage>('menu')
  const [showMemoryDialog, setShowMemoryDialog] = useState(false)
  const [showQteDialog, setShowQteDialog] = useState(false)

  const handleStart = () => {
    setStage('memory')
    setShowMemoryDialog(true)
  }

  const handleMemoryComplete = () => {
    setStage('qte')
    setShowQteDialog(true)
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
          {showMemoryDialog ? (
            <Dialog
              title="第一關：記憶配對"
              lines={[
                '點擊卡片找出相同圖案，各配對一組。',
                '全部配對完成即可過關。',
                '配錯會出現惡作劇影片，別被干擾！',
              ]}
              onStart={() => setShowMemoryDialog(false)}
            />
          ) : (
            <MemoryGame onComplete={handleMemoryComplete} />
          )}
        </motion.div>
      )}

      {stage === 'qte' && (
        <motion.div
          key="qte"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {showQteDialog ? (
            <Dialog
              title="第二關：QTE 挑戰"
              lines={[
                '注意畫面出現的英文字母，立刻按下同一鍵。',
                '成功 +1 分，失誤會有干擾彈窗。',
                '累積 30 分立即過關。',
              ]}
              onStart={() => setShowQteDialog(false)}
            />
          ) : (
            <QTEGame onComplete={handleQTEComplete} />
          )}
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
