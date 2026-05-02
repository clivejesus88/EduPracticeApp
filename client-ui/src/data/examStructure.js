// Uganda Exam Structure - UNEB Standards
export const examLevels = {
  ALEVEL: {
    id: 'a-level',
    name: 'A-Level',
    description: 'Uganda Advanced Certificate of Education - S.6',
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
      id: 'nile-rapids-energy',
      title: 'Water Flow in Nile Rapids',
      context: 'Calculate kinetic energy and power of water flowing in Murchison Falls.',
      topic: 'Energy & Power',
      examLevel: 'A-Level',
      difficulty: 'Advanced'
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
      id: 'uganda-currency-calculus',
      title: 'Uganda Shilling Exchange Rate Analysis',
      context: 'Use calculus to analyze currency exchange trends (UGX to USD)',
      topic: 'Calculus Applications',
      examLevel: 'A-Level',
      difficulty: 'Advanced'
    }
  ]
};
