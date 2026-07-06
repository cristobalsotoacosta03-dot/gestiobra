import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToolHeader from './ToolHeader'
import { FLUID_PRESETS, calculatePipeFlow } from '../../lib/engineering'

const inputClass =
  'glass-panel w-full rounded-xl border border-white/5 bg-navy-900/40 px-4 py-3 text-white placeholder:text-slate-500 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30'

const labelClass = 'mb-2 block text-sm font-medium text-slate-300 tracking-wide'

function PipeFlowCalculator() {
  const [flow, setFlow] = useState('')
  const [diameter, setDiameter] = useState('')
  const [length, setLength] = useState('')
  const [fluidKey, setFluidKey] = useState('cold_water')
  const [density, setDensity] = useState(FLUID_PRESETS.cold_water.density)
  const [viscosity, setViscosity] = useState(FLUID_PRESETS.cold_water.viscosity)
  const [result, setResult] = useState(null)

  const handleFluidChange = (event) => {
    const key = event.target.value
    setFluidKey(key)
    const preset = FLUID_PRESETS[key]
    setDensity(preset.density ?? '')
    setViscosity(preset.viscosity ?? '')
  }

  const handleCalculate = (event) => {
    event.preventDefault()
    const flowValue = parseFloat(flow)
    const diameterValue = parseFloat(diameter)
    const lengthValue = parseFloat(length)
    const densityValue = parseFloat(density)
    const viscosityValue = parseFloat(viscosity)

    if (
      [flowValue, diameterValue, lengthValue, densityValue, viscosityValue].some(
        (value) => !Number.isFinite(value) || value <= 0,
      )
    ) {
      return
    }

    setResult(
      calculatePipeFlow({
        flow: flowValue,
        diameter: diameterValue,
        length: lengthValue,
        density: densityValue,
        viscosity: viscosityValue,
      }),
    )
  }

  return (
    <div>
      <ToolHeader
        icon="🌊"
        title="Fluidos y Tuberías"
        description="Pérdida de carga (Darcy-Weisbach) y velocidad de circulación en conducciones."
      />

      <form onSubmit={handleCalculate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="text-left">
          <label htmlFor="flow" className={labelClass}>
            Caudal (m³/h)
          </label>
          <input
            id="flow"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={flow}
            onChange={(event) => setFlow(event.target.value)}
            placeholder="ej. 3.5"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="diameter" className={labelClass}>
            Diámetro interno (mm)
          </label>
          <input
            id="diameter"
            type="number"
            min="0"
            step="0.1"
            inputMode="decimal"
            value={diameter}
            onChange={(event) => setDiameter(event.target.value)}
            placeholder="ej. 25.4"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="length" className={labelClass}>
            Longitud (m)
          </label>
          <input
            id="length"
            type="number"
            min="0"
            step="0.5"
            inputMode="decimal"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            placeholder="ej. 40"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="fluid" className={labelClass}>
            Fluido
          </label>
          <select
            id="fluid"
            value={fluidKey}
            onChange={handleFluidChange}
            className={inputClass}
          >
            {Object.entries(FLUID_PRESETS).map(([key, preset]) => (
              <option key={key} value={key} className="bg-slate-950">
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="text-left">
          <label htmlFor="density" className={labelClass}>
            Densidad (kg/m³)
          </label>
          <input
            id="density"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            value={density}
            onChange={(event) => {
              setFluidKey('custom')
              setDensity(event.target.value)
            }}
            placeholder="ej. 998"
            className={inputClass}
          />
        </div>

        <div className="text-left">
          <label htmlFor="viscosity" className={labelClass}>
            Viscosidad cinemática (mm²/s)
          </label>
          <input
            id="viscosity"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={viscosity}
            onChange={(event) => {
              setFluidKey('custom')
              setViscosity(event.target.value)
            }}
            placeholder="ej. 1.0"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="glass-panel sm:col-span-2 rounded-2xl bg-orange-500 px-8 py-3 text-base font-semibold text-white shadow-xl shadow-orange-500/20 transition-all duration-300 ease-in-out hover:scale-105 hover:bg-orange-400 hover:shadow-orange-500/40"
        >
          Calcular
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.velocity}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
              <p className="text-sm font-medium text-slate-400 tracking-wide">Velocidad</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                {result.velocity.toFixed(3)} <span className="text-base text-slate-500">m/s</span>
              </p>
            </div>
            <div className="glass-panel rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
              <p className="text-sm font-medium text-slate-400 tracking-wide">Pérdida de carga</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                {result.pressureLossBar.toFixed(4)}{' '}
                <span className="text-base text-slate-500">bar</span>
              </p>
            </div>
            <div className="glass-panel sm:col-span-2 rounded-2xl border border-white/5 bg-navy-900/40 p-6 text-left">
              <p className="text-sm font-medium text-slate-400">Detalle del cálculo</p>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 font-mono text-sm tabular-nums text-slate-300 sm:grid-cols-4">
                <dt className="text-slate-500">Re</dt>
                <dd>{result.reynolds.toFixed(0)}</dd>
                <dt className="text-slate-500">Régimen</dt>
                <dd className="capitalize">{result.regime}</dd>
                <dt className="text-slate-500">f</dt>
                <dd>{result.frictionFactor.toFixed(4)}</dd>
                <dt className="text-slate-500">h_f</dt>
                <dd>{result.headLossM.toFixed(3)} m</dd>
              </dl>
              <p className="mt-4 text-xs text-slate-500">
                Darcy-Weisbach + Swamee-Jain (flujo turbulento) o f = 64/Re
                (laminar). Rugosidad interna asumida: 0,045 mm (acero
                comercial).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PipeFlowCalculator
