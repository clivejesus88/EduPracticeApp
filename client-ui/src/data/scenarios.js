// Detailed Practice Scenarios for Uganda Context
// These scenarios incorporate Uganda-specific examples and real-world applications

export const physicsScenarios = {
  mechanics: [
    {
      id: 'pk-003',
      title: 'Murchison Falls Water Power',
      examLevel: 'A-Level',
      topic: 'Energy & Power',
      difficulty: 'Advanced',
      scenario: `Murchison Falls (also known as Kabarega Falls) drops water 43 meters. Approximately 300 m³ of water flows per second over the falls.

      Given:
      - Height of falls = 43 m
      - Volume of water per second = 300 m³/s
      - Density of water = 1000 kg/m³
      - g = 9.8 m/s²
      
      Calculate:
      a) Mass of water falling per second
      b) Gravitational potential energy lost per second
      c) Power available from the falls
      d) If efficiency is 85%, power available for electricity generation`,
      
      hints: [
        'Mass = density × volume',
        'Potential energy = mgh',
        'Power = Energy / time',
        'Useful power = efficiency × total power'
      ],
      
      solution: {
        mass_per_second: '300,000 kg',
        potential_energy: '126,900,000 J',
        power: '126.9 MW',
        useful_power: '107.9 MW'
      }
    }
  ],
  
  thermodynamics: [
    {
      id: 'pt-001',
      title: 'Solar Radiation in Uganda',
      examLevel: 'A-Level',
      topic: 'Thermodynamics',
      difficulty: 'Intermediate',
      scenario: `Uganda receives intense solar radiation throughout the year due to its equatorial location. A house in Kampala with a flat roof of area 100 m² receives solar radiation.

      Given:
      - Solar radiation intensity = 1000 W/m² (average)
      - Roof area = 100 m²
      - Specific heat capacity of water = 4200 J/kg·K
      - Density of water = 1000 kg/m³
      
      A water tank on the roof contains 5000 liters of water.
      
      Calculate:
      a) Total solar power received by the roof
      b) Energy absorbed in 1 hour (assume 70% absorption)
      c) Temperature increase of water in 1 hour`,
      
      hints: [
        'Power = Intensity × Area',
        'Energy = Power × Time',
        'Heat absorbed = Absorbed energy × efficiency',
        'Q = mcΔT'
      ],
      
      solution: {
        solar_power: '100,000 W (100 kW)',
        energy_per_hour: '252,000,000 J (252 MJ)',
        temp_increase: '12 K (°C)'
      }
    },
    {
      id: 'pt-002',
      title: 'Rwenzori Mountains Atmospheric Pressure',
      examLevel: 'A-Level',
      topic: 'Gas Laws',
      difficulty: 'Advanced',
      scenario: `The Rwenzori Mountains (Mountains of the Moon) have a peak elevation of 5,109 m. Scientists are studying atmospheric pressure changes with altitude.

      Given:
      - Atmospheric pressure at sea level = 101,325 Pa
      - Temperature at sea level = 288 K (15°C)
      - Mountain peak altitude = 5,109 m
      - Temperature at peak ≈ 260 K (-13°C)
      - Air density at sea level = 1.225 kg/m³
      
      Using the barometric formula or ideal gas law:
      
      Calculate:
      a) Atmospheric pressure at the summit
      b) Ratio of pressures (summit/sea level)
      c) Density of air at the summit`,
      
      hints: [
        'Pressure decreases exponentially with altitude',
        'Use ideal gas law: PV = nRT or P = ρRT/M',
        'Consider temperature change with altitude'
      ],
      
      solution: {
        summit_pressure: '≈ 54,000 Pa',
        pressure_ratio: '≈ 0.53 (about 53% of sea level)',
        summit_density: '≈ 0.65 kg/m³'
      }
    }
  ],
  
  electricity: [
    {
      id: 'pe-001',
      title: 'Household Electrical Circuit Safety',
      examLevel: 'A-Level',
      topic: 'Electricity & Magnetism',
      difficulty: 'Intermediate',
      scenario: `A household in Uganda has the following electrical devices connected:
      - Lights: 5 bulbs × 40W = 200W
      - Kettle: 2000W
      - TV: 150W
      - Refrigerator: 400W
      
      The household mains supply is 230V with a circuit breaker rated at 20A.
      
      Given:
      - Voltage = 230V
      - Current limit = 20A
      
      Calculate:
      a) Maximum power the circuit can handle
      b) Total power when all devices are on
      c) Current drawn when all devices are on
      d) Will the circuit breaker trip? Why?`,
      
      hints: [
        'Power = Voltage × Current (P = VI)',
        'Maximum power = Voltage × Current limit',
        'Total power = Sum of all device powers',
        'Actual current = Total power / Voltage'
      ],
      
      solution: {
        max_power: '4600 W',
        total_power: '2750 W',
        total_current: '11.96 A',
        breaker_trips: 'No, because 11.96A < 20A'
      }
    }
  ]
};

export const mathematicsScenarios = {
  algebra: [],
  
  geometry: [
    {
      id: 'mg-001',
      title: 'Uganda Road Network Distances',
      examLevel: 'A-Level',
      topic: 'Trigonometry & Coordinates',
      difficulty: 'Intermediate',
      scenario: `Using a map of Uganda with coordinates:
      - Kampala: (0.3, 32.6)
      - Jinja: (0.4, 33.2)
      - Masaka: (-1.3, 31.7)
      - Mbarara: (-2.6, 30.6)

      (Coordinates are latitude, longitude)

      Assuming 1 degree ≈ 111 km on the ground

      Calculate:
      a) Distance from Kampala to Jinja
      b) Distance from Kampala to Masaka
      c) Distance from Kampala to Mbarara
      d) Which city is closest to Kampala?`,

      hints: [
        'Use distance formula: d = √[(Δx)² + (Δy)²]',
        'Convert degrees to km using 1° ≈ 111 km',
        'Calculate displacement in both x and y directions'
      ],

      solution: {
        kampala_jinja: '≈ 85 km',
        kampala_masaka: '≈ 135 km',
        kampala_mbarara: '≈ 260 km',
        closest_city: 'Jinja'
      }
    }
  ],
  
  statistics: [
    {
      id: 'ms-001',
      title: 'UNEB Advanced Exam Results Analysis',
      examLevel: 'A-Level',
      topic: 'Statistics & Data Analysis',
      difficulty: 'Intermediate',
      scenario: `A school analyzed A-Level Physics exam results for 120 students:

      Scores:
      - 0-20: 5 students
      - 21-40: 12 students
      - 41-60: 28 students
      - 61-80: 40 students
      - 81-100: 35 students

      Calculate:
      a) Mean score (use midpoints of ranges)
      b) Median score
      c) Mode class
      d) Standard deviation
      e) What percentage of students scored above 60?`,

      hints: [
        'Use midpoints: 10, 30.5, 50.5, 70.5, 90.5',
        'Mean = Σ(midpoint × frequency) / total students',
        'Median is the score of the 60th and 61st student',
        'Mode is the class with highest frequency'
      ],

      solution: {
        mean_score: '≈ 63.2',
        median_score: '≈ 65',
        mode_class: '61-80',
        std_dev: '≈ 23.5',
        above_60_percent: '62.5%'
      }
    }
  ]
};

// Combine all scenarios
export const allScenarios = {
  physics: physicsScenarios,
  mathematics: mathematicsScenarios
};

// Export by exam level
export const scenariosByLevel = {
  'a-level': {
    physics: [physicsScenarios.mechanics[2], physicsScenarios.thermodynamics[1]],
    mathematics: mathematicsScenarios.geometry.concat(mathematicsScenarios.statistics)
  }
};
