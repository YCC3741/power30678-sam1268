import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 會隨機出現的影片
const GAME_VIDEOS = ['/哭蕊宿頭.mp4', '/溝通溝通.mp4', '/獲得華.mp4', '/MC.mp4']

// 邊界設定
const BOUNDARY_MARGIN = 80 // 邊界距離螢幕邊緣的距離
const VIDEO_SIZE = 150 // 影片大小

interface DraggableVideo {
  id: number
  src: string
  x: number
  y: number
  vx: number // x 方向速度
  vy: number // y 方向速度
}

interface DragGameProps {
  onComplete: () => void
}

export function DragGame({ onComplete }: DragGameProps) {
  const [phase, setPhase] = useState<'intro' | 'playing'>('intro')
  const [score, setScore] = useState(0)
  const [videos, setVideos] = useState<DraggableVideo[]>([])
  const [bonusUsed, setBonusUsed] = useState(false)
  const [showBonusEffect, setShowBonusEffect] = useState(false)
  const introVideoRef = useRef<HTMLVideoElement>(null)
  const bonusAudioRef = useRef<HTMLAudioElement>(null)
  const animationRef = useRef<number>()
  const videoIdRef = useRef(0)

  // 邊界尺寸
  const [boundary, setBoundary] = useState({
    left: BOUNDARY_MARGIN,
    top: BOUNDARY_MARGIN,
    right: window.innerWidth - BOUNDARY_MARGIN,
    bottom: window.innerHeight - BOUNDARY_MARGIN,
  })

  // 更新邊界尺寸
  useEffect(() => {
    const handleResize = () => {
      setBoundary({
        left: BOUNDARY_MARGIN,
        top: BOUNDARY_MARGIN,
        right: window.innerWidth - BOUNDARY_MARGIN,
        bottom: window.innerHeight - BOUNDARY_MARGIN,
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 播放開場影片
  useEffect(() => {
    if (phase === 'intro' && introVideoRef.current) {
      introVideoRef.current.play().catch(() => {})

      const video = introVideoRef.current
      const handleEnded = () => {
        // 影片播完直接開始遊戲
        setPhase('playing')
      }
      video.addEventListener('ended', handleEnded)
      return () => video.removeEventListener('ended', handleEnded)
    }
  }, [phase])


  // 生成新影片（確保在邊界內）
  const spawnVideo = useCallback(() => {
    const id = videoIdRef.current++
    const src = GAME_VIDEOS[Math.floor(Math.random() * GAME_VIDEOS.length)]

    // 計算可用區域（邊界內，留出影片大小的空間）
    const minX = boundary.left + 20
    const maxX = boundary.right - VIDEO_SIZE - 20
    const minY = boundary.top + 80 // 留空間給標題
    const maxY = boundary.bottom - VIDEO_SIZE - 20

    const x = minX + Math.random() * Math.max(0, maxX - minX)
    const y = minY + Math.random() * Math.max(0, maxY - minY)

    const speed = 1.5 + Math.random() * 1.5
    const angle = Math.random() * Math.PI * 2
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed

    return { id, src, x, y, vx, vy }
  }, [boundary])

  // 遊戲開始時生成影片
  useEffect(() => {
    if (phase === 'playing') {
      // 初始生成 3 個影片
      const initialVideos = Array.from({ length: 3 }, () => spawnVideo())
      setVideos(initialVideos)

      // 每 3 秒生成新影片（最多 6 個）
      const spawnInterval = setInterval(() => {
        setVideos(prev => {
          if (prev.length < 6) {
            return [...prev, spawnVideo()]
          }
          return prev
        })
      }, 3000)

      return () => clearInterval(spawnInterval)
    }
  }, [phase, spawnVideo])

  // 影片移動動畫
  useEffect(() => {
    if (phase !== 'playing') return

    const animate = () => {
      setVideos(prev => prev.map(video => {
        let { x, y, vx, vy } = video

        // 更新位置
        x += vx
        y += vy

        // 邊界碰撞檢測（確保在邊界內反彈）
        const minX = boundary.left + 10
        const maxX = boundary.right - VIDEO_SIZE - 10
        const minY = boundary.top + 10
        const maxY = boundary.bottom - VIDEO_SIZE - 10

        if (x <= minX || x >= maxX) {
          vx = -vx
          x = Math.max(minX, Math.min(maxX, x))
        }
        if (y <= minY || y >= maxY) {
          vy = -vy
          y = Math.max(minY, Math.min(maxY, y))
        }

        return { ...video, x, y, vx, vy }
      }))

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, boundary])

  // 檢查影片是否被拉出邊界
  const checkOutOfBounds = useCallback((id: number, x: number, y: number) => {
    const isOutside = x < boundary.left - 50 ||
                      x > boundary.right + 50 ||
                      y < boundary.top - 50 ||
                      y > boundary.bottom + 50

    if (isOutside) {
      // 移除影片並加分
      setVideos(prev => prev.filter(v => v.id !== id))
      setScore(prev => {
        const next = prev + 1
        if (next >= 50) {
          onComplete()
        }
        return next
      })
    }
  }, [boundary, onComplete])

  // 使用 BONUS 道具
  const useBonus = useCallback(() => {
    if (bonusUsed) return
    setBonusUsed(true)

    // 顯示放大絕招效果
    setShowBonusEffect(true)

    // 播放音效
    if (bonusAudioRef.current) {
      bonusAudioRef.current.play().catch(() => {})
    }

    // 清除所有影片並加 10 分
    setTimeout(() => {
      setVideos([])
      setScore(prev => {
        const next = prev + 10
        if (next >= 50) {
          setTimeout(() => onComplete(), 500)
        }
        return next
      })
    }, 300)

    // 隱藏效果
    setTimeout(() => {
      setShowBonusEffect(false)
    }, 1500)
  }, [bonusUsed, onComplete])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#0A0A0F',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 開場影片 */}
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              background: '#0A0A0F',
            }}
          >
            <video
              ref={introVideoRef}
              src="/斗影片.mp4"
              style={{
                maxWidth: '90%',
                maxHeight: '90%',
                borderRadius: 12,
              }}
              playsInline
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* BONUS 音效 */}
      <audio ref={bonusAudioRef} src="/你拉一下啊.mp4" preload="auto" />

      {/* BONUS 放大絕招效果 */}
      <AnimatePresence>
        {showBonusEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 200,
              pointerEvents: 'none',
            }}
          >
            {/* 閃光背景 */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.5], scale: [0, 2, 3] }}
              transition={{ duration: 0.8 }}
              style={{
                position: 'absolute',
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.8) 0%, transparent 70%)',
              }}
            />
            {/* 文字效果 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: '#F59E0B',
                textShadow: '0 0 40px rgba(245, 158, 11, 0.8), 0 0 80px rgba(245, 158, 11, 0.5)',
                fontFamily: '"Space Grotesk", system-ui, sans-serif',
              }}
            >
              BONUS!
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#22C55E',
                textShadow: '0 0 20px rgba(34, 197, 94, 0.6)',
                marginTop: 10,
              }}
            >
              +10 分！
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遊戲畫面 */}
      {phase === 'playing' && (
        <>
          {/* 邊界指示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              left: boundary.left,
              top: boundary.top,
              width: boundary.right - boundary.left,
              height: boundary.bottom - boundary.top,
              border: '3px dashed rgba(245, 158, 11, 0.5)',
              borderRadius: 20,
              pointerEvents: 'none',
              boxShadow: 'inset 0 0 60px rgba(245, 158, 11, 0.1)',
            }}
          />

          {/* 邊界外區域提示 */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#71717A',
              fontSize: 14,
              zIndex: 10,
            }}
          >
            ↑ 把影片拉到這裡 ↑
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#71717A',
              fontSize: 14,
              zIndex: 10,
            }}
          >
            ↓ 把影片拉到這裡 ↓
          </div>

          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: boundary.top + 10,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              zIndex: 10,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 9999,
                fontSize: 13,
                color: '#F59E0B',
                fontWeight: 500,
              }}
            >
              第三關
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                color: '#FAFAFA',
                fontSize: 24,
                fontWeight: 700,
                fontFamily: '"Space Grotesk", system-ui, sans-serif',
              }}
            >
              拉影片挑戰
            </motion.h2>
            <div style={{ color: '#71717A', fontSize: 14 }}>
              分數：<span style={{ color: '#F59E0B', fontWeight: 700 }}>{score}</span> / 50
            </div>
          </div>

          {/* BONUS 按鈕 */}
          {!bonusUsed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
              }}
              whileTap={{ scale: 0.95 }}
              onClick={useBonus}
              style={{
                position: 'absolute',
                bottom: boundary.bottom - 60,
                right: boundary.left + 20,
                padding: '12px 24px',
                fontSize: 16,
                fontWeight: 600,
                color: '#0A0A0F',
                background: '#22C55E',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)',
                zIndex: 20,
              }}
            >
              BONUS +10分
            </motion.button>
          )}

          {/* 可拖拉的影片 */}
          <AnimatePresence>
            {videos.map(video => (
              <DraggableVideoItem
                key={video.id}
                video={video}
                onDragEnd={(x, y) => checkOutOfBounds(video.id, x, y)}
              />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}

// 可拖拉的影片組件
interface DraggableVideoItemProps {
  video: DraggableVideo
  onDragEnd: (x: number, y: number) => void
}

function DraggableVideoItem({ video, onDragEnd }: DraggableVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [])

  // 當不在拖拉時，跟隨 video 的位置
  useEffect(() => {
    if (!isDragging && containerRef.current) {
      containerRef.current.style.transform = `translate(${video.x}px, ${video.y}px)`
    }
  }, [video.x, video.y, isDragging])

  return (
    <motion.div
      ref={containerRef}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        setIsDragging(true)
        dragOffsetRef.current = { x: 0, y: 0 }
      }}
      onDrag={(_, info) => {
        dragOffsetRef.current = { x: info.offset.x, y: info.offset.y }
      }}
      onDragEnd={() => {
        setIsDragging(false)
        const finalX = video.x + dragOffsetRef.current.x
        const finalY = video.y + dragOffsetRef.current.y
        onDragEnd(finalX, finalY)
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.1 : 1,
      }}
      exit={{ opacity: 0, scale: 0 }}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: VIDEO_SIZE,
        height: VIDEO_SIZE,
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'grab',
        border: isDragging ? '3px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isDragging
          ? '0 0 40px rgba(245, 158, 11, 0.4)'
          : '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: isDragging ? 50 : 10,
      }}
      whileTap={{ cursor: 'grabbing' }}
    >
      <video
        ref={videoRef}
        src={video.src}
        loop
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  )
}
