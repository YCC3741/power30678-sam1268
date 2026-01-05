import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QTEEvent } from "../types/game";
import { PopupVideo } from "./PopupVideo";

// QTE 時間點設定 - 更密集，同時出現多個
const QTE_EVENTS: QTEEvent[] = [
    // 第一波 - 單個
    { time: 3, key: "", duration: 2500 },
    // 第二波 - 2個同時
    { time: 8, key: "", duration: 2000 },
    { time: 8.1, key: "", duration: 2800 },
    // 第三波 - 3個同時
    { time: 14, key: "", duration: 1800 },
    { time: 14.1, key: "", duration: 2500 },
    { time: 14.2, key: "", duration: 3200 },
    // 第四波 - 2個同時
    { time: 21, key: "", duration: 1500 },
    { time: 21.1, key: "", duration: 2200 },
    // 第五波 - 4個同時
    { time: 28, key: "", duration: 1500 },
    { time: 28.1, key: "", duration: 2000 },
    { time: 28.2, key: "", duration: 2800 },
    { time: 28.3, key: "", duration: 3500 },
    // 第六波 - 3個同時
    { time: 35, key: "", duration: 1200 },
    { time: 35.1, key: "", duration: 1800 },
    { time: 35.2, key: "", duration: 2500 },
    // 最終波 - 4個同時
    { time: 42, key: "", duration: 1000 },
    { time: 42.1, key: "", duration: 1500 },
    { time: 42.2, key: "", duration: 2000 },
    { time: 42.3, key: "", duration: 2800 },
    // 補一個事件以確保可達 20 分
    { time: 42.35, key: "", duration: 2400 },
];

// 干擾影片出現的時間點（秒）- 更密集
const DISTRACTION_TIMES = [5, 10, 16, 22, 30, 37, 44];

// 干擾影片列表
const DISTRACTION_VIDEOS = ["/溝通溝通.mp4", "/哭蕊宿頭.mp4"];

// 失敗時顯示的影片
// const FAIL_VIDEOS = ["/哭蕊宿頭.mp4", "/溝通溝通.mp4"];

const FAIL_VIDEOS = ["/太LOW了.mp4"];
function getRandomLetter(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[Math.floor(Math.random() * letters.length)];
}

function getRandomPosition() {
    return {
        x: 50 + Math.random() * (window.innerWidth - 400),
        y: 50 + Math.random() * (window.innerHeight - 300),
    };
}

interface PopupVideoState {
    id: number;
    src: string;
    x: number;
    y: number;
    showClose: boolean;
}

interface ActiveQTE {
    index: number;
    key: string;
    duration: number;
    startTime: number;
    timeLeft: number;
    position: { x: number; y: number };
    result: "success" | "fail" | null;
}

function getRandomQTEPosition(existingPositions: { x: number; y: number }[]) {
    // 嘗試找一個不重疊的位置
    for (let attempt = 0; attempt < 10; attempt++) {
        const x = 50 + Math.random() * (window.innerWidth - 200);
        const y = 80 + Math.random() * (window.innerHeight - 250);

        const overlaps = existingPositions.some((pos) => Math.abs(pos.x - x) < 140 && Math.abs(pos.y - y) < 140);

        if (!overlaps || existingPositions.length === 0) {
            return { x, y };
        }
    }
    // 如果找不到，就隨機放
    return {
        x: 50 + Math.random() * (window.innerWidth - 200),
        y: 80 + Math.random() * (window.innerHeight - 250),
    };
}

interface QTEGameProps {
    onComplete: () => void;
}

export function QTEGame({ onComplete }: QTEGameProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [activeQTEs, setActiveQTEs] = useState<ActiveQTE[]>([]);
    const [completedQTEs, setCompletedQTEs] = useState<number[]>([]);
    const [triggeredDistractions, setTriggeredDistractions] = useState<number[]>([]);
    const [popupVideos, setPopupVideos] = useState<PopupVideoState[]>([]);
    const [score, setScore] = useState(0);

    const qteTimersRef = useRef<Map<number, { timeout: number; interval: number }>>(new Map());
    const popupIdRef = useRef(0);

    // 初始化 QTE 事件的隨機字母（確保同時出現的 QTE 字母不重複）
    const [qteEvents] = useState(() => {
        const events = QTE_EVENTS.map((e) => ({ ...e, key: "" }));
        // 按時間分組
        const groups: number[][] = [];
        let currentGroup: number[] = [];
        let lastTime = -999;

        events.forEach((e, i) => {
            if (e.time - lastTime > 0.5) {
                if (currentGroup.length > 0) groups.push(currentGroup);
                currentGroup = [i];
            } else {
                currentGroup.push(i);
            }
            lastTime = e.time;
        });
        if (currentGroup.length > 0) groups.push(currentGroup);

        // 為每組分配不重複的字母
        groups.forEach((group) => {
            const usedLetters: string[] = [];
            group.forEach((i) => {
                let letter = getRandomLetter();
                while (usedLetters.includes(letter)) {
                    letter = getRandomLetter();
                }
                usedLetters.push(letter);
                events[i].key = letter;
            });
        });

        return events;
    });

    // 添加彈出影片
    const addPopupVideo = useCallback((src: string, showClose: boolean) => {
        const pos = getRandomPosition();
        const id = popupIdRef.current++;
        setPopupVideos((prev) => [...prev, { id, src, ...pos, showClose }]);
        return id;
    }, []);

    // 移除彈出影片
    const removePopupVideo = useCallback((id: number) => {
        setPopupVideos((prev) => prev.filter((v) => v.id !== id));
    }, []);

    // 處理 QTE 成功
    const handleQTESuccess = useCallback((index: number) => {
        const timers = qteTimersRef.current.get(index);
        if (timers) {
            clearTimeout(timers.timeout);
            clearInterval(timers.interval);
            qteTimersRef.current.delete(index);
        }

        setActiveQTEs((prev) => prev.map((qte) => (qte.index === index ? { ...qte, result: "success" } : qte)));
        setCompletedQTEs((prev) => [...prev, index]);
        // 累積分數，達到 30 分立即過關
        setScore((prev) => {
            const next = prev + 1;
            if (next >= 20) {
                onComplete();
            }
            return next;
        });

        // 移除這個 QTE
        setTimeout(() => {
            setActiveQTEs((prev) => prev.filter((qte) => qte.index !== index));
        }, 300);
    }, []);

    // 處理 QTE 失敗
    const handleQTEFail = useCallback(
        (index: number) => {
            const timers = qteTimersRef.current.get(index);
            if (timers) {
                clearTimeout(timers.timeout);
                clearInterval(timers.interval);
                qteTimersRef.current.delete(index);
            }

            setActiveQTEs((prev) => prev.map((qte) => (qte.index === index ? { ...qte, result: "fail" } : qte)));
            setCompletedQTEs((prev) => [...prev, index]);

            // 隨機彈出失敗影片
            const randomVideo = FAIL_VIDEOS[Math.floor(Math.random() * FAIL_VIDEOS.length)];
            const popupId = addPopupVideo(randomVideo, false);

            // 3秒後自動消失
            setTimeout(() => {
                removePopupVideo(popupId);
            }, 3000);

            // 移除這個 QTE
            setTimeout(() => {
                setActiveQTEs((prev) => prev.filter((qte) => qte.index !== index));
            }, 300);
        },
        [addPopupVideo, removePopupVideo]
    );

    // 監聽影片時間
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime;

            // 檢查是否到達 QTE 時間點
            qteEvents.forEach((event, index) => {
                if (
                    !completedQTEs.includes(index) &&
                    !activeQTEs.some((q) => q.index === index) &&
                    currentTime >= event.time &&
                    currentTime < event.time + 0.3
                ) {
                    // 找一個不重疊的位置
                    const existingPositions = activeQTEs.map((q) => q.position);
                    const position = getRandomQTEPosition(existingPositions);

                    // 添加新的 QTE
                    const newQTE: ActiveQTE = {
                        index,
                        key: event.key,
                        duration: event.duration,
                        startTime: Date.now(),
                        timeLeft: event.duration,
                        position,
                        result: null,
                    };

                    setActiveQTEs((prev) => [...prev, newQTE]);

                    // 倒數計時
                    const intervalId = window.setInterval(() => {
                        setActiveQTEs((prev) =>
                            prev.map((qte) => {
                                if (qte.index === index && qte.result === null) {
                                    const elapsed = Date.now() - qte.startTime;
                                    return { ...qte, timeLeft: Math.max(0, qte.duration - elapsed) };
                                }
                                return qte;
                            })
                        );
                    }, 50);

                    // 超時處理
                    const timeoutId = window.setTimeout(() => {
                        handleQTEFail(index);
                    }, event.duration);

                    qteTimersRef.current.set(index, { timeout: timeoutId, interval: intervalId });
                }
            });

            // 檢查是否到達干擾影片時間點
            DISTRACTION_TIMES.forEach((time, index) => {
                if (!triggeredDistractions.includes(index) && currentTime >= time && currentTime < time + 0.5) {
                    setTriggeredDistractions((prev) => [...prev, index]);
                    // 隨機選擇干擾影片
                    const randomVideo = DISTRACTION_VIDEOS[Math.floor(Math.random() * DISTRACTION_VIDEOS.length)];
                    addPopupVideo(randomVideo, true);
                }
            });
        };

        const handleEnded = () => {
            onComplete();
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("ended", handleEnded);
        };
    }, [qteEvents, completedQTEs, activeQTEs, triggeredDistractions, onComplete, addPopupVideo, handleQTEFail]);

    // 監聽按鍵
    useEffect(() => {
        if (activeQTEs.length === 0) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const pressedKey = e.key.toUpperCase();

            // 找到匹配的 QTE（尚未完成的）
            const matchingQTE = activeQTEs.find((qte) => qte.result === null && qte.key === pressedKey);

            if (matchingQTE) {
                handleQTESuccess(matchingQTE.index);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeQTEs, handleQTESuccess]);

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "#0A0A0F",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ambient glow */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 800,
                    height: 600,
                    background: "radial-gradient(ellipse, rgba(245, 158, 11, 0.04) 0%, transparent 60%)",
                    pointerEvents: "none",
                }}
            />

            {/* Header with badge and title */}
            <div
                style={{
                    position: "absolute",
                    top: 24,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    zIndex: 10,
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "6px 14px",
                        background: "rgba(245, 158, 11, 0.1)",
                        border: "1px solid rgba(245, 158, 11, 0.2)",
                        borderRadius: 9999,
                        fontSize: 13,
                        color: "#F59E0B",
                        fontWeight: 500,
                    }}
                >
                    第二關
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        color: "#FAFAFA",
                        fontSize: 28,
                        fontWeight: 700,
                        fontFamily: '"Space Grotesk", system-ui, sans-serif',
                        letterSpacing: "-0.025em",
                    }}
                >
                    QTE 挑戰
                </motion.h2>
                <div style={{ color: "#D4D4D8", fontSize: 14 }}>
                    分數：<span style={{ color: "#F59E0B", fontWeight: 700 }}>{score}</span> / 20
                </div>
            </div>

            {/* 影片播放器 */}
            <motion.video
                ref={videoRef}
                src="/超負荷挺Toyz.mp4"
                autoPlay
                onLoadedMetadata={() => {
                    if (videoRef.current) videoRef.current.volume = 0.35;
                }}
                style={{
                    maxWidth: "85%",
                    maxHeight: "75%",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            />

            {/* QTE 提示 - 支援多個同時顯示 */}
            <AnimatePresence>
                {activeQTEs.map((qte) => (
                    <motion.div
                        key={qte.index}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        style={{
                            position: "fixed",
                            left: qte.position.x,
                            top: qte.position.y,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            zIndex: 20,
                        }}
                    >
                        <motion.div
                            animate={
                                qte.result === null
                                    ? {
                                          scale: [1, 1.08, 1],
                                          boxShadow: [
                                              "0 0 0 0 rgba(245, 158, 11, 0.5)",
                                              "0 0 0 15px rgba(245, 158, 11, 0)",
                                              "0 0 0 0 rgba(245, 158, 11, 0)",
                                          ],
                                      }
                                    : {}
                            }
                            transition={{ duration: 0.6, repeat: Infinity }}
                            style={{
                                width: 90,
                                height: 90,
                                background:
                                    qte.result === "success"
                                        ? "#22C55E"
                                        : qte.result === "fail"
                                        ? "#1A1A24"
                                        : "#F59E0B",
                                border: qte.result === "fail" ? "1px solid rgba(255,255,255,0.1)" : "none",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 42,
                                fontWeight: 700,
                                fontFamily: '"Space Grotesk", system-ui, sans-serif',
                                color: qte.result === "fail" ? "#71717A" : "#0A0A0F",
                                boxShadow:
                                    qte.result === null
                                        ? "0 0 30px rgba(245, 158, 11, 0.3)"
                                        : qte.result === "success"
                                        ? "0 0 30px rgba(34, 197, 94, 0.3)"
                                        : "none",
                            }}
                        >
                            {qte.result === "success" ? "✓" : qte.result === "fail" ? "✗" : qte.key}
                        </motion.div>

                        {qte.result === null && (
                            <>
                                <div
                                    style={{
                                        marginTop: 10,
                                        color: "#FAFAFA",
                                        fontSize: 14,
                                        fontWeight: 500,
                                        textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                                    }}
                                >
                                    按 <span style={{ color: "#F59E0B", fontWeight: 700 }}>{qte.key}</span>
                                </div>

                                {/* 倒數條 */}
                                <div
                                    style={{
                                        marginTop: 8,
                                        width: 90,
                                        height: 4,
                                        background: "rgba(255,255,255,0.1)",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                    }}
                                >
                                    <motion.div
                                        style={{
                                            height: "100%",
                                            background: qte.timeLeft > 500 ? "#F59E0B" : "#EF4444",
                                            width: `${(qte.timeLeft / qte.duration) * 100}%`,
                                            boxShadow:
                                                qte.timeLeft > 500
                                                    ? "0 0 10px rgba(245, 158, 11, 0.5)"
                                                    : "0 0 10px rgba(239, 68, 68, 0.5)",
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* 彈出的影片 */}
            <AnimatePresence>
                {popupVideos.map((video) => (
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
    );
}
