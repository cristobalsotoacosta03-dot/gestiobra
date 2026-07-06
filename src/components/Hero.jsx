import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { cn } from '../lib/cn'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(26,54,93,0.3),_transparent_60%)]" />

      <motion.div
        className="relative max-w-6xl mx-auto px-6 py-32 text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          variants={item}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white"
        >
          La plataforma definitiva para instaladores industriales.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-6 max-w-2xl mx-auto text-lg text-slate-400 tracking-wide"
        >
          Automatiza cálculos técnicos y legalizaciones, ahorrando horas de
          gestión administrativa en cada obra.
        </motion.p>

        <motion.div variants={item} className="mt-10">
          <Link
            to="/sandbox"
            className={cn(
              'inline-block rounded-2xl bg-orange-500 px-8 py-4 text-base font-semibold text-white',
              'shadow-xl shadow-orange-500/20 transition-all duration-300 ease-in-out',
              'hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40',
            )}
          >
            Acceder a Engineering Sandbox
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero
