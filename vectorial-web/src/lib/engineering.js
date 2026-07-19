// Rugosidad interna asumida para tubería de acero comercial (m).
const PIPE_ROUGHNESS_M = 0.000045

export const FLUID_PRESETS = {
  cold_water: { label: 'Agua fría (20 °C)', density: 998, viscosity: 1.004 },
  hot_water: { label: 'Agua caliente (60 °C)', density: 983, viscosity: 0.475 },
  light_oil: { label: 'Aceite ligero (ref.)', density: 900, viscosity: 50 },
  custom: { label: 'Personalizado', density: null, viscosity: null },
}

// Pérdida de carga (Darcy-Weisbach) y velocidad de circulación.
// flow: m³/h · diameter: mm · length: m · density: kg/m³ · viscosity: mm²/s (cSt)
export function calculatePipeFlow({ flow, diameter, length, density, viscosity }) {
  const Q = flow / 3600
  const D = diameter / 1000
  const nu = viscosity / 1e6
  const area = (Math.PI * D ** 2) / 4
  const velocity = Q / area
  const reynolds = (velocity * D) / nu

  let frictionFactor
  let regime
  if (reynolds < 2300) {
    frictionFactor = 64 / reynolds
    regime = 'laminar'
  } else {
    const relRoughness = PIPE_ROUGHNESS_M / D
    frictionFactor =
      0.25 / Math.log10(relRoughness / 3.7 + 5.74 / reynolds ** 0.9) ** 2
    regime = 'turbulento'
  }

  const g = 9.81
  const headLossM = frictionFactor * (length / D) * (velocity ** 2 / (2 * g))
  const pressureLossBar = (density * g * headLossM) / 100000

  return { velocity, reynolds, frictionFactor, regime, headLossM, pressureLossBar }
}

// Diámetros nominales estándar: pulgada -> DN acero (ISO 6708) / cobre (EN 1057).
export const NOMINAL_DIAMETERS = [
  { inch: '1/4"', steelDN: 8, copperMm: 10 },
  { inch: '3/8"', steelDN: 10, copperMm: 12 },
  { inch: '1/2"', steelDN: 15, copperMm: 15 },
  { inch: '3/4"', steelDN: 20, copperMm: 22 },
  { inch: '1"', steelDN: 25, copperMm: 28 },
  { inch: '1 1/4"', steelDN: 32, copperMm: 35 },
  { inch: '1 1/2"', steelDN: 40, copperMm: 42 },
  { inch: '2"', steelDN: 50, copperMm: 54 },
  { inch: '2 1/2"', steelDN: 65, copperMm: 64 },
  { inch: '3"', steelDN: 80, copperMm: 76.1 },
]

// Factores relativos: valor_en_unidad = valor_en_unidad_base * factor
export const PRESSURE_FACTORS = {
  bar: { label: 'bar', factor: 1 },
  kpa: { label: 'kPa', factor: 100 },
  psi: { label: 'psi', factor: 14.5038 },
}

export const FLOW_FACTORS = {
  ls: { label: 'L/s', factor: 1 },
  m3h: { label: 'm³/h', factor: 3.6 },
}

export function convertFromBase(valueInBase, factors) {
  return Object.fromEntries(
    Object.entries(factors).map(([key, { factor }]) => [key, valueInBase * factor]),
  )
}

// Potencia térmica básica por transmisión: Q = U · A · ΔT
export const ENCLOSURE_PRESETS = {
  wall_uninsulated: { label: 'Muro sin aislamiento', u: 1.8 },
  wall_insulated: { label: 'Muro con aislamiento', u: 0.6 },
  roof_insulated: { label: 'Cubierta aislada', u: 0.35 },
  window_double: { label: 'Ventana doble acristalamiento', u: 2.8 },
  custom: { label: 'Personalizado', u: null },
}

export function calculateThermalPower({ area, deltaT, u }) {
  const watts = u * area * deltaT
  return { watts, kilowatts: watts / 1000 }
}
