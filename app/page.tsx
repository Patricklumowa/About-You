"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// Fixed lyrics data with proper timing
const lyricsData = [
  { type: "verse", text: "In whispered moments", duration: 3000 },
  { type: "verse", text: "When silence speaks", duration: 3000 },
  { type: "verse", text: "I find your shadow", duration: 3400 },
  { type: "verse", text: "In memories deep", duration: 3200 },
  { type: "verse", text: "The echoes linger", duration: 3000 },
  { type: "verse", text: "Of what we were", duration: 3400 },
  { type: "verse", text: "Before the distance", duration: 3200 },
  { type: "verse", text: "Made hearts unsure", duration: 3600 },
  { type: "chorus", text: "Do you remember?", duration: 4000 },
  { type: "chorus", text: "The way we used to be", duration: 4200 },
  { type: "chorus", text: "Do you remember?", duration: 4000 },
  { type: "chorus", text: "When you belonged to me", duration: 4500 },
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
  maxLife: number
  type: "star" | "aurora" | "dust"
  phase: number
  baseOpacity: number
}

export default function FixedLyricsExperience() {
  const [currentLine, setCurrentLine] = useState(-1)
  const [hasStarted, setHasStarted] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  // Initialize particles once
  const initializeParticles = useCallback(() => {
    const particles: Particle[] = []
    const particleCount = Math.min(150, Math.max(50, window.innerWidth / 10))

    for (let i = 0; i < particleCount; i++) {
      const type = Math.random() < 0.4 ? "star" : Math.random() < 0.7 ? "aurora" : "dust"
      const baseOpacity = Math.random() * 0.6 + 0.2

      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * (type === "dust" ? 0.2 : 0.08),
        vy: (Math.random() - 0.5) * (type === "dust" ? 0.2 : 0.08),
        size: type === "star" ? Math.random() * 1.2 + 0.3 : Math.random() * 2.5 + 0.8,
        color:
          type === "star"
            ? "#ffffff"
            : type === "aurora"
              ? ["#40e0d0", "#8a2be2", "#483d8b", "#191970", "#4169e1"][Math.floor(Math.random() * 5)]
              : "#87ceeb",
        opacity: baseOpacity,
        baseOpacity,
        life: Math.random() * 1000,
        maxLife: 2000 + Math.random() * 3000,
        type,
        phase: Math.random() * Math.PI * 2,
      })
    }

    particlesRef.current = particles
  }, [])

  // Optimized canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    let isAnimating = true

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2) // Limit DPR for performance
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + "px"
      canvas.style.height = window.innerHeight + "px"
      ctx.scale(dpr, dpr)

      // Reinitialize particles on resize
      initializeParticles()
    }

    resizeCanvas()
    initializeParticles()

    const animate = () => {
      if (!isAnimating) return

      timeRef.current += 0.005

      const { innerWidth: width, innerHeight: height } = window

      // Optimized background rendering
      const bgGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2,
      )

      const timeOffset = timeRef.current * 0.3
      bgGradient.addColorStop(0, `rgba(15, 15, 35, ${0.98 + Math.sin(timeOffset) * 0.02})`)
      bgGradient.addColorStop(0.4, `rgba(25, 25, 50, ${0.95 + Math.cos(timeOffset * 1.1) * 0.03})`)
      bgGradient.addColorStop(0.8, `rgba(20, 30, 60, ${0.92 + Math.sin(timeOffset * 0.7) * 0.04})`)
      bgGradient.addColorStop(1, `rgba(10, 15, 30, ${0.9 + Math.cos(timeOffset * 0.5) * 0.05})`)

      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Optimized aurora layers
      for (let layer = 0; layer < 3; layer++) {
        const layerTime = timeRef.current + layer * 0.4
        const intensity = 0.06 - layer * 0.012

        const auroraGradient = ctx.createLinearGradient(
          Math.sin(layerTime * 0.2) * width * 0.15 + width * 0.25,
          Math.cos(layerTime * 0.15) * height * 0.1 + height * 0.3,
          Math.cos(layerTime * 0.25) * width * 0.2 + width * 0.75,
          Math.sin(layerTime * 0.2) * height * 0.15 + height * 0.7,
        )

        auroraGradient.addColorStop(0, `rgba(64, 224, 208, ${intensity * (0.7 + Math.sin(layerTime) * 0.15)})`)
        auroraGradient.addColorStop(0.3, `rgba(138, 43, 226, ${intensity * (0.5 + Math.cos(layerTime * 1.2) * 0.15)})`)
        auroraGradient.addColorStop(0.6, `rgba(72, 61, 139, ${intensity * (0.6 + Math.sin(layerTime * 0.9) * 0.12)})`)
        auroraGradient.addColorStop(1, `rgba(25, 25, 112, ${intensity * (0.4 + Math.cos(layerTime * 0.7) * 0.12)})`)

        ctx.fillStyle = auroraGradient
        ctx.fillRect(0, 0, width, height)
      }

      // Optimized particle rendering
      const particles = particlesRef.current
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i]

        // Update particle
        particle.life += 1
        if (particle.life > particle.maxLife) {
          particle.life = 0
          particle.x = Math.random() * width
          particle.y = Math.random() * height
          particle.vx = (Math.random() - 0.5) * (particle.type === "dust" ? 0.2 : 0.08)
          particle.vy = (Math.random() - 0.5) * (particle.type === "dust" ? 0.2 : 0.08)
        }

        // Natural movement
        particle.phase += 0.015
        particle.x += particle.vx + Math.sin(particle.phase) * 0.08
        particle.y += particle.vy + Math.cos(particle.phase * 0.8) * 0.06

        // Boundary wrapping
        if (particle.x < -5) particle.x = width + 5
        else if (particle.x > width + 5) particle.x = -5
        if (particle.y < -5) particle.y = height + 5
        else if (particle.y > height + 5) particle.y = -5

        // Render particle
        const lifeRatio = Math.max(0, 1 - particle.life / particle.maxLife)
        const timeOpacity = 0.7 + Math.sin(timeRef.current * 1.5 + particle.phase) * 0.3
        const currentOpacity = particle.baseOpacity * lifeRatio * timeOpacity

        if (currentOpacity < 0.01) continue // Skip nearly invisible particles

        ctx.save()
        ctx.globalAlpha = currentOpacity

        if (particle.type === "star") {
          const twinkle = 0.6 + Math.sin(timeRef.current * 3 + particle.phase) * 0.4
          ctx.fillStyle = particle.color
          ctx.shadowBlur = 8 * twinkle
          ctx.shadowColor = particle.color
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * twinkle, 0, Math.PI * 2)
          ctx.fill()
        } else if (particle.type === "aurora") {
          const pulse = 0.7 + Math.sin(timeRef.current * 2 + particle.phase) * 0.3
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 3 * pulse,
          )
          gradient.addColorStop(0, particle.color)
          gradient.addColorStop(0.7, particle.color.replace(")", ", 0.2)").replace("rgb", "rgba"))
          gradient.addColorStop(1, "transparent")
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 3 * pulse, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = particle.color
          ctx.globalAlpha = currentOpacity * 0.5
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      isAnimating = false
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [initializeParticles])

  // Fixed lyrics progression with proper cleanup
  useEffect(() => {
    if (!hasStarted || isComplete) return

    const progressLyrics = () => {
      const nextIndex = currentLine + 1

      if (nextIndex >= lyricsData.length) {
        setIsComplete(true)
        return
      }

      const duration = lyricsData[nextIndex]?.duration || 3000

      timeoutRef.current = setTimeout(() => {
        setCurrentLine(nextIndex)
      }, duration)
    }

    if (currentLine === -1) {
      // Start with first lyric
      timeoutRef.current = setTimeout(() => {
        setCurrentLine(0)
      }, 1000)
    } else {
      progressLyrics()
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [hasStarted, currentLine, isComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const startExperience = useCallback(() => {
    setHasStarted(true)
    setCurrentLine(-1)
    setIsComplete(false)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-midnight select-none">
      {/* Optimized Aurora Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ willChange: "auto" }} />

      {/* Atmospheric Overlay */}
      <div className="absolute inset-0 z-1 aurora-overlay" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        {/* Enhanced Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16 md:mb-24"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-8xl font-extralight text-white mb-2 md:mb-4 tracking-[0.2em] md:tracking-[0.3em] relative title-glow"
            animate={{
              textShadow: [
                "0 0 30px rgba(255, 255, 255, 0.4)",
                "0 0 50px rgba(173, 216, 230, 0.6)",
                "0 0 30px rgba(255, 255, 255, 0.4)",
              ],
            }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            About You
            <motion.div
              className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-cyan-400/8 via-transparent to-purple-400/8 blur-xl md:blur-2xl"
              animate={{
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-blue-200/70 font-extralight tracking-[0.3em] md:tracking-[0.4em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 2 }}
          >
            The 1975
          </motion.p>
        </motion.div>

        {/* Enhanced Lyrics Display */}
        <div className="max-w-4xl md:max-w-5xl w-full text-center mb-12 md:mb-20">
          <div className="h-32 sm:h-40 md:h-48 flex items-center justify-center relative px-4">
            <AnimatePresence mode="wait">
              {hasStarted && currentLine >= 0 && !isComplete && (
                <motion.div
                  key={currentLine}
                  initial={{
                    opacity: 0,
                    y: 60,
                    scale: 0.8,
                    filter: "blur(20px)",
                    rotateX: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    rotateX: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -60,
                    scale: 0.8,
                    filter: "blur(20px)",
                    rotateX: -15,
                  }}
                  transition={{
                    duration: 1.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className={`${
                    lyricsData[currentLine]?.type === "chorus"
                      ? "text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-100 to-purple-200 chorus-glow"
                      : "text-xl sm:text-2xl md:text-4xl lg:text-5xl font-extralight text-blue-50/90 verse-glow"
                  } leading-relaxed tracking-wide relative transform-gpu text-center`}
                >
                  {lyricsData[currentLine]?.text}

                  {/* Enhanced background effects */}
                  {lyricsData[currentLine]?.type === "chorus" ? (
                    <>
                      <motion.div
                        className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-cyan-400/4 via-purple-400/6 to-pink-400/4 blur-2xl md:blur-3xl rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="absolute -inset-8 sm:-inset-10 md:-inset-12 bg-gradient-to-r from-blue-400/2 via-purple-400/3 to-cyan-400/2 blur-3xl md:blur-[40px] rounded-full"
                        animate={{
                          scale: [1.1, 1.4, 1.1],
                          opacity: [0.2, 0.4, 0.2],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                    </>
                  ) : (
                    <motion.div
                      className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-blue-400/2 via-cyan-400/3 to-blue-400/2 blur-xl md:blur-2xl rounded-full"
                      animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.2, 0.35, 0.2],
                      }}
                      transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    />
                  )}

                  {/* Floating particles around text */}
                  <motion.div
                    className="absolute -inset-12 sm:-inset-16 pointer-events-none"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white/20 rounded-full"
                        style={{
                          left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 35}%`,
                          top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 35}%`,
                        }}
                        animate={{
                          opacity: [0.2, 0.6, 0.2],
                          scale: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.3,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Single Button */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: -40 }}
              transition={{ delay: 3, duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.button
                onClick={startExperience}
                className="px-8 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-blue-900/15 to-purple-900/15 backdrop-blur-md border border-blue-300/15 text-blue-100 font-extralight text-base sm:text-lg rounded-full hover:from-blue-800/25 hover:to-purple-800/25 transition-all duration-700 shadow-lg hover:shadow-blue-500/15 relative overflow-hidden button-glow"
                whileHover={{
                  scale: 1.03,
                  y: -3,
                }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/8 to-purple-400/8"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <span className="relative z-10 tracking-wider">Do you remember?</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .bg-midnight {
          background: radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        }

        .aurora-overlay {
          background: linear-gradient(
            135deg,
            rgba(64, 224, 208, 0.025) 0%,
            rgba(138, 43, 226, 0.04) 25%,
            rgba(72, 61, 139, 0.03) 50%,
            rgba(65, 105, 225, 0.045) 75%,
            rgba(25, 25, 112, 0.025) 100%
          );
          background-size: 400% 400%;
          animation: aurora-flow 16s ease-in-out infinite;
        }

        @keyframes aurora-flow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.6;
          }
          25% {
            background-position: 100% 0%;
            opacity: 0.8;
          }
          50% {
            background-position: 100% 100%;
            opacity: 0.4;
          }
          75% {
            background-position: 0% 100%;
            opacity: 0.7;
          }
        }

        .title-glow {
          text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);
        }

        .chorus-glow {
          text-shadow: 
            0 0 30px rgba(173, 216, 230, 0.5), 
            0 0 60px rgba(138, 43, 226, 0.3),
            0 0 90px rgba(64, 224, 208, 0.2);
          animation: chorus-pulse 4s ease-in-out infinite;
        }

        @keyframes chorus-pulse {
          0%, 100% {
            text-shadow: 
              0 0 30px rgba(173, 216, 230, 0.5), 
              0 0 60px rgba(138, 43, 226, 0.3),
              0 0 90px rgba(64, 224, 208, 0.2);
            transform: scale(1);
          }
          50% {
            text-shadow: 
              0 0 40px rgba(173, 216, 230, 0.7), 
              0 0 80px rgba(138, 43, 226, 0.5),
              0 0 120px rgba(64, 224, 208, 0.4);
            transform: scale(1.01);
          }
        }

        .verse-glow {
          text-shadow: 0 0 20px rgba(173, 216, 230, 0.4), 0 0 40px rgba(255, 255, 255, 0.2);
          animation: verse-float 5s ease-in-out infinite;
        }

        @keyframes verse-float {
          0%, 100% {
            transform: translateY(0px);
            text-shadow: 0 0 20px rgba(173, 216, 230, 0.4), 0 0 40px rgba(255, 255, 255, 0.2);
          }
          50% {
            transform: translateY(-3px);
            text-shadow: 0 0 25px rgba(173, 216, 230, 0.6), 0 0 50px rgba(255, 255, 255, 0.3);
          }
        }

        .button-glow {
          box-shadow: 0 0 20px rgba(100, 200, 255, 0.1);
        }

        .button-glow:hover {
          box-shadow: 0 0 30px rgba(100, 200, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
