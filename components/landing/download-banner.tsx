'use client'

import { motion } from 'framer-motion'
import { Smartphone } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'

export function DownloadBanner() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <section id="download" className="landing-section relative overflow-hidden">
      {/* Red gradient background */}
      <div className="absolute inset-0 bg-linear-to-r from-brand-red-light to-brand-red" />

      {/* Animated noise/glow effects */}
      <motion.div
        className="absolute top-0 right-0 w-125 h-125 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
        animate={shouldReduceMotion ? { opacity: 0.35 } : { scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: shouldReduceMotion ? 0 : Infinity }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
        animate={shouldReduceMotion ? { opacity: 0.25 } : { scale: [1.15, 1, 1.15], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: shouldReduceMotion ? 0 : Infinity }}
      />

      <div className="landing-container py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left: Copy */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="landing-title mb-4 text-3xl sm:text-4xl lg:text-5xl">
              Don&apos;t just watch. <span className="text-white/90">Ride.</span>
            </h2>
            <p className="landing-copy mt-0 max-w-lg text-white/80">
              Download Revvie and join thousands of riders building their legacy on the
              road.
            </p>
          </motion.div>

          {/* Center: QR Code + store buttons */}
          <motion.div
            className="flex w-full flex-col items-center gap-6 sm:w-auto sm:flex-row sm:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* QR Code */}
            <div className="hidden sm:flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-white rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                {/* QR code placeholder using SVG pattern */}
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* QR-code-like pattern */}
                    {/* Top-left finder */}
                    <rect
                      x="5"
                      y="5"
                      width="25"
                      height="25"
                      rx="3"
                      fill="none"
                      stroke="#121212"
                      strokeWidth="4"
                    />
                    <rect x="11" y="11" width="13" height="13" rx="2" fill="#121212" />
                    {/* Top-right finder */}
                    <rect
                      x="70"
                      y="5"
                      width="25"
                      height="25"
                      rx="3"
                      fill="none"
                      stroke="#121212"
                      strokeWidth="4"
                    />
                    <rect x="76" y="11" width="13" height="13" rx="2" fill="#121212" />
                    {/* Bottom-left finder */}
                    <rect
                      x="5"
                      y="70"
                      width="25"
                      height="25"
                      rx="3"
                      fill="none"
                      stroke="#121212"
                      strokeWidth="4"
                    />
                    <rect x="11" y="76" width="13" height="13" rx="2" fill="#121212" />
                    {/* Data modules */}
                    {[
                      [35, 8],
                      [42, 8],
                      [49, 8],
                      [56, 8],
                      [35, 15],
                      [49, 15],
                      [63, 15],
                      [8, 35],
                      [15, 35],
                      [22, 35],
                      [35, 35],
                      [42, 35],
                      [56, 35],
                      [63, 35],
                      [70, 35],
                      [84, 35],
                      [8, 42],
                      [35, 42],
                      [49, 42],
                      [63, 42],
                      [77, 42],
                      [84, 42],
                      [8, 49],
                      [22, 49],
                      [35, 49],
                      [42, 49],
                      [56, 49],
                      [70, 49],
                      [84, 49],
                      [8, 56],
                      [15, 56],
                      [35, 56],
                      [49, 56],
                      [63, 56],
                      [77, 56],
                      [8, 63],
                      [22, 63],
                      [35, 63],
                      [42, 63],
                      [56, 63],
                      [70, 63],
                      [84, 63],
                      [35, 70],
                      [49, 70],
                      [56, 70],
                      [63, 70],
                      [77, 70],
                      [35, 77],
                      [42, 77],
                      [63, 77],
                      [70, 77],
                      [84, 77],
                      [35, 84],
                      [49, 84],
                      [56, 84],
                      [77, 84],
                      [84, 84],
                    ].map(([x, y], i) => (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width="5"
                        height="5"
                        rx="1"
                        fill="#121212"
                      />
                    ))}
                    {/* Center logo */}
                    <rect x="40" y="40" width="20" height="20" rx="4" fill="#c83737" />
                    <text
                      x="50"
                      y="54"
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                      fontWeight="bold"
                    >
                      ⚡
                    </text>
                  </svg>
                </div>
              </div>
              <span className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Scan to Download
              </span>
            </div>

            {/* Store buttons */}
            <div className="flex w-full flex-col gap-3 sm:w-auto">
              <a
                href="/signup"
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-black bg-black px-6 py-4 text-white shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">
                    Download on
                  </div>
                  <div className="text-sm font-bold -mt-0.5">App Store</div>
                </div>
              </a>
              <a
                href="/signup"
                className="flex w-full items-center gap-3 rounded-2xl border-2 border-black bg-black px-6 py-4 text-white shadow-[4px_4px_0px_rgba(0,0,0,0.5)] transition-all duration-300 hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-1.414l2.937 1.696c.776.449.776 1.573 0 2.022l-2.937 1.696-2.598-2.598 2.598-2.816zM5.864 2.658L16.8 9.025l-2.302 2.302L5.864 2.658z" />
                </svg>
                <div>
                  <div className="text-[10px] text-white/60 uppercase tracking-wider">
                    Get it on
                  </div>
                  <div className="text-sm font-bold -mt-0.5">Google Play</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Right: Floating phone icon */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="w-24 h-24 rounded-3xl bg-black border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.5)] flex items-center justify-center"
              animate={shouldReduceMotion ? { y: 0, rotate: 0 } : { y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
            >
              <Smartphone className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
