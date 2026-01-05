import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QTEEvent } from '../types/game'
import { PopupVideo } from './PopupVideo'

// QTE 時間點設定
const QTE_EVENTS: QTEEvent[] = [
  { time: 5, key: '', duration: 2000 },
  { time: 12, key: '', duration: 1800 },
  { time: 20, key: '', duration: 1500 },
  { time: 30, key: '', duration: 1500 },
  { time: 40, key: '', duration: 1200 },
]

// 干擾影片出現的時間點（秒）
const DISTRACTION_TIMES = [8, 18, 28, 38]

// 失敗時顯示的影片
const FAIL_VIDEOS = ['/哭蕊宿頭.mp4', '/溝通溝通.mp4']

function getRandomLetter(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  return letters[Math.floor(Math.random() * letters.length)]
}

function getRandomPosition() {
  return {
    x: 50 + Math.random() * (window.innerWidth - 400),
    y: 50 + Math.random() * (window.innerHeight - 300),
  }
}

interface PopupVideoState {
  id: number
  src: string
  x: number
  y: number
  showClose: boolean
}

interface QTEGameProps {
  onComplete: () => void
}

export function QTEGame({ onComplete }: QTEGameProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentQTE, setCurrentQTE] = useState<(QTEEvent & { index: number }) | null>(null)
  const [qteKey, setQteKey] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [completedQTEs, setCompletedQTEs] = useState<number[]>([])
  const [triggeredDistractions, setTriggeredDistractions] = useState<number[]>([])
  const [popupVideos, setPopupVideos] = useState<PopupVideoState[]>([])
  const [qteResult, setQteResult] = useState<'success' | null>(null)

  const qteTimeoutRef = useRef<number>()
  const qteIntervalRef = useRef<number>()
  const popupIdRef = useRef(0)

  // 初始化 QTE 事件的隨機字母
  const [qteEvents] = useState(() =>
    QTE_EVENTS.map(e => ({ ...e, key: getRandomLetter() }))
  )

  // 添加彈出影片
  const addPopupVideo = useCallback((src: string, showClose: boolean) => {
    const pos = getRandomPosition()
    const id = popupIdRef.current++
    setPopupVideos(prev => [...prev, { id, src, ...pos, showClose }])
    return id
  }, [])

  // 移除彈出影片
  const removePopupVideo = useCallback((id: number) => {
    setPopupVideos(prev => prev.filter(v => v.id !== id))
  }, [])

  // 監聽影片時間
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime

      // 檢查是否到達 QTE 時間點
      qteEvents.forEach((event, index) => {
        if (
          !completedQTEs.includes(index) &&
          currentTime >= event.time &&
          currentTime < event.time + 0.3 &&
          !currentQTE
        ) {
          // 顯示 QTE（不暫停影片）
          setCurrentQTE({ ...event, index })
          setQteKey(event.key)
          setTimeLeft(event.duration)

          // 倒數計時
          const startTime = Date.now()
          qteIntervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTime
            const remaining = event.duration - elapsed
            setTimeLeft(Math.max(0, remaining))
          }, 50)

          // 超時處理
          qteTimeoutRef.current = window.setTimeout(() => {
            handleQTEFail(index)
          }, event.duration)
        }
      })

      // 檢查是否到達干擾影片時間點
      DISTRACTION_TIMES.forEach((time, index) => {
        if (
          !triggeredDistractions.includes(index) &&
          currentTime >= time &&
          currentTime < time + 0.5
        ) {
          setTriggeredDistractions(prev => [...prev, index])
          addPopupVideo('/溝通溝通.mp4', true)
        }
      })
    }

    const handleEnded = () => {
      onComplete()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [qteEvents, completedQTEs, currentQTE, triggeredDistractions, onComplete, addPopupVideo])

  // 監聽按鍵
  useEffect(() => {
    if (!currentQTE) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === qteKey) {
        handleQTESuccess()
      } else if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        handleQTEFail(currentQTE.index)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentQTE, qteKey])

  const handleQTESuccess = useCallback(() => {
    if (!currentQTE) return
    clearTimeout(qteTimeoutRef.current)
    clearInterval(qteIntervalRef.current)
    setCompletedQTEs(prev => [...prev, currentQTE.index])
    setQteResult('success')

    setTimeout(() => {
      setCurrentQTE(null)
      setQteResult(null)
    }, 300)
  }, [currentQTE])

  const handleQTEFail = useCallback((index: number) => {
    clearTimeout(qteTimeoutRef.current)
    clearInterval(qteIntervalRef.current)
    setCompletedQTEs(prev => [...prev, index])
    setCurrentQTE(null)

    // 隨機彈出失敗影片
    const randomVideo = FAIL_VIDEOS[Math.floor(Math.random() * FAIL_VIDEOS.length)]
    const popupId = addPopupVideo(randomVideo, false)

    // 3秒後自動消失
    setTimeout(() => {
      removePopupVideo(popupId)
    }, 3000)
  }, [addPopupVideo, removePopupVideo])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          top: 20,
          color: '#fff',
          fontSize: 28,
          fontWeight: 'bold',
          zIndex: 10,
        }}
      >
        第二關：QTE 挑戰
      </motion.h2>

      {/* 影片播放器 */}
      <motion.video
        ref={videoRef}
        src="/超負荷挺Toyz.mp4"
        autoPlay
        style={{
          maxWidth: '90%',
          maxHeight: '80%',
          borderRadius: 10,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* QTE 提示 */}
      <AnimatePresence>
        {currentQTE && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'absolute',
              top: 100,
              right: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 20,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(255,100,100,0.7)',
                  '0 0 0 20px rgba(255,100,100,0)',
                  '0 0 0 0 rgba(255,100,100,0)',
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{
                width: 120,
                height: 120,
                background: qteResult === 'success'
                  ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                  : 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                borderRadius: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 56,
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {qteResult === 'success' ? '✓' : qteKey}
            </motion.div>

            {!qteResult && (
              <>
                <div
                  style={{
                    marginTop: 15,
                    color: '#fff',
                    fontSize: 20,
                    fontWeight: 'bold',
                    textShadow: '0 0 10px rgba(0,0,0,0.8)',
                  }}
                >
                  快按 {qteKey}！
                </div>

                {/* 倒數條 */}
                <div
                  style={{
                    marginTop: 10,
                    width: 120,
                    height: 8,
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: timeLeft > 500 ? '#4ade80' : '#ef4444',
                      width: `${(timeLeft / currentQTE.duration) * 100}%`,
                    }}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 彈出的影片 */}
      <AnimatePresence>
        {popupVideos.map(video => (
          <PopupVideo
            key={video.id}
            src={video.src}
            x={video.x}
            y={video.y}
            showCloseButton={video.showClose}
            onClose={() => removePopupVideo(video.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
