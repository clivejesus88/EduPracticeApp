// Uganda Exam Structure - UNEB Standards
export const examLevels = {
  OLEVEL: {
    id: 'o-level',
    name: 'O-Level (UCE)',
    description: 'Uganda Certificate of Education - S.4 & S.5',
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'Beginner to Intermediate'
  },
  ALEVEL: {
    id: 'a-level',
    name: 'A-Level',
    description: 'Uganda Advanced Certificate of Education - S.6 & S.7',
    color: 'from-purple-500 to-pink-500',
    difficulty: 'Intermediate to Advanced'
  },
  UACE: {
    id: 'uace',
    name: 'UACE',
    description: 'Uganda Advanced Certificate of Education (Alternative)',
    color: 'from-rose-500 to-orange-500',
    difficulty: 'Advanced'
  }
};

export const physicsTopics = {
  OLEVEL: [
    {
      id: 'mechanics-olevel',
      name: 'Mechanics',
      subtopics: ['Kinematics', 'Dynamics', 'Energy', 'Momentum', 'Simple Machines'],
      questions: 24,
      difficulty: 'Beginner'
    },
    {
      id: 'waves-olevel',
      name: 'Waves & Sound',
      subtopics: ['Simple Harmonic Motion', 'Sound Waves', 'Light Waves', 'Refraction'],
      questions: 18,
      difficulty: 'Intermediate'
    },
    {
      id: 'heat-olevel',
      name: 'Thermodynamics',
      subtopics: ['Temperature', 'Heat Transfer', 'Gas Laws', 'Calorimetry'],
      questions: 16,
      difficulty: 'Intermediate'
    },
    {
      id: 'electricity-olevel',
      name: 'Electricity & Magnetism',
      subtopics: ['Electric Circuits', 'Electrostatics', 'Magnetic Fields', 'Electromagnetic Induction'],
      questions: 20,
      difficulty: 'Intermediate'
    }
  ],
  ALEVEL: [
    {
      id: 'mechanics-alevel',
      name: 'Classical Mechanics',
      subtopics: ['Circular Motion', 'Gravitation', 'Elasticity', 'Fluid Mechanics'],
      questions: 28,
      difficulty: 'Intermediate'
    },
    {
      id: 'optics-alevel',
      name: 'Optics',
      subtopics: ['Lenses', 'Mirrors', 'Wave Optics', 'Interference & Diffraction'],
      questions: 22,
      difficulty: 'Advanced'
    },
    {
      id: 'modern-alevel',
      name: 'Modern Physics',
      subtopics: ['Nuclear Physics', 'Atomic Structure', 'Quantum Mechanics', 'Relativity'],
      questions: 26,
      difficulty: 'Advanced'
    }
  ]
};

export const mathematicsTopics = {
  OLEVEL: [
    {
      id: 'algebra-olevel',
      name: 'Algebra',
      subtopics: ['Linear Equations', 'Quadratic Equations', 'Indices & Surds', 'Sequences & Series'],
      questions: 28,
      difficulty: 'Beginner'
    },
    {
      id: 'geometry-olevel',
      name: 'Geometry & Trigonometry',
      subtopics: ['2D Geometry', '3D Geometry', 'Trigonometric Ratios', 'Sine & Cosine Rules'],
      questions: 24,
      difficulty: 'Intermediate'
    },
    {
      id: 'calculus-olevel',
      name: 'Calculus Basics',
      subtopics: ['Limits', 'Differentiation', 'Integration', 'Applications'],
      questions: 20,
      difficulty: 'Intermediate'
    },
    {
      id: 'stats-olevel',
      name: 'Statistics & Probability',
      subtopics: ['Data Analysis', 'Probability', 'Distributions', 'Hypothesis Testing'],
      questions: 16,
      difficulty: 'Beginner'
    }
  ],
  ALEVEL: [
    {
      id: 'pure-math-alevel',
      name: 'Pure Mathematics',
      subtopics: ['Complex Numbers', 'Matrices', 'Vectors', 'Proof by Induction'],
      questions: 32,
      difficulty: 'Advanced'
    },
    {
      id: 'applied-alevel',
      name: 'Applied Mathematics',
      subtopics: ['Mechanics', 'Optimization', 'Numerical Methods', 'Differential Equations'],
      questions: 28,
      difficulty: 'Advanced'
    },
    {
      id: 'stats-alevel',
      name: 'Statistics & Probability',
      subtopics: ['Distribution Theory', 'Correlation & Regression', 'Chi-squared Tests', 'Confidence Intervals'],
      questions: 26,
      difficulty: 'Advanced'
    }
  ]
};

// Uganda-specific practice scenarios
export const ugandaContextScenarios = {
  physics: [
    {
      id: 'kampala-entebbe-physics',
      title: 'Car on Kampala-Entebbe Highway',
      context: 'A car travels from Kampala to Entebbe (approximately 40km). Calculate acceleration and final velocity.',
      topic: 'Kinematics',
      examLevel: 'O-Level',
      difficulty: 'Beginner'
    },
    {
      id: 'lake-victoria-buoyancy',
      title: 'Boat Floating on Lake Victoria',
      context: 'A wooden boat floats on Lake Victoria. Calculate buoyant force and density.',
      topic: 'Mechanics - Buoyancy',
      examLevel: 'O-Level',
      difficulty: 'Intermediate'
    },
    {
      id: 'nile-rapids-energy',
      title: 'Water Flow in Nile Rapids',
      context: 'Calculate kinetic energy and power of water flowing in Murchison Falls.',
      topic: 'Energy & Power',
      examLevel: 'A-Level',
      difficulty: 'Advanced'
    },
    {
      id: 'solar-radiation-uganda',
      title: 'Solar Radiation in Uganda',
      context: 'Calculate solar intensity at different times of year in Uganda.',
      topic: 'Thermodynamics',
      examLevel: 'O-Level',
      difficulty: 'Intermediate'
    },
    {
      id: 'uganda-altitude-pressure',
      title: 'Atmospheric Pressure at Rwenzori Mountains',
      context: 'Calculate pressure changes at different altitudes (Rwenzori: 5,109m)',
      topic: 'Gas Laws',
      examLevel: 'A-Level',
      difficulty: 'Advanced'
    }
  ],
  mathematics: [
    {
      id: 'kampala-population-growth',
      title: 'Kampala Population Growth',
      context: 'Kampala population grows at ~3.5% annually. Calculate population after 10 years.',
      topic: 'Exponential Functions',
      examLevel: 'O-Level',
      difficulty: 'Beginner'
    },
    {
      id: 'uganda-market-economics',
      title: 'Local Market Economics',
      context: 'Analyze profit/loss in a local market scenario (buying and selling prices)',
      topic: 'Algebra & Percentages',
      examLevel: 'O-Level',
      difficulty: 'Beginner'
    },
    {
      id: 'makerere-university-admissions',
      title: 'Makerere University Admissions Statistics',
      context: 'Analyze admission statistics using probability and statistics concepts',
      topic: 'Statistics & Probability',
      examLevel: 'O-Level',
      difficulty: 'Intermediate'
    },
    {
      id: 'uganda-road-distance',
      title: 'Uganda Road Network Geometry',
      context: 'Calculate distances and angles between major cities (Kampala, Jinja, Masaka, Mbarara)',
      topic: 'Trigonometry',
      examLevel: 'O-Level',
      difficulty: 'Intermediate'
    },
    {
      id: 'uganda-currency-calculus',
      title: 'Uganda Shilling Exchange Rate Analysis',
      context: 'Use calculus to analyze currency exchange trends (UGX to USD)',
      topic: 'Calculus Applications',
      examLevel: 'A-Level',
      difficulty: 'Advanced'
    }
  ]
};
