// Real UNEB-style question bank for dynamic exam generation.
// Each question has: id, subject, level, topic, difficulty, type, prompt,
// options (for mcq), answer, explanation, marks.

export const SUBJECTS = ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'English'];
export const LEVELS = ['O-Level', 'A-Level', 'UACE'];
export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const questionBank = [
  // ---------- PHYSICS ----------
  {
    id: 'phy-ol-001', subject: 'Physics', level: 'O-Level', topic: 'Mechanics',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'A car accelerates uniformly from rest to 20 m/s in 5 seconds. What is its acceleration?',
    options: ['2 m/s²', '4 m/s²', '5 m/s²', '10 m/s²'],
    answer: '4 m/s²',
    explanation: 'a = (v - u) / t = (20 - 0) / 5 = 4 m/s².'
  },
  {
    id: 'phy-ol-002', subject: 'Physics', level: 'O-Level', topic: 'Mechanics',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'The SI unit of force is the:',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    answer: 'Newton',
    explanation: 'Force is measured in Newtons (N). 1 N = 1 kg·m/s².'
  },
  {
    id: 'phy-ol-003', subject: 'Physics', level: 'O-Level', topic: 'Mechanics',
    difficulty: 'Medium', type: 'numeric', marks: 2,
    prompt: 'A 2 kg object is lifted to a height of 5 m. How much gravitational potential energy does it gain? (g = 10 m/s²) Answer in Joules.',
    answer: 100,
    tolerance: 0.5,
    explanation: 'PE = mgh = 2 × 10 × 5 = 100 J.'
  },
  {
    id: 'phy-ol-004', subject: 'Physics', level: 'O-Level', topic: 'Waves & Sound',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Sound waves travel fastest through which medium?',
    options: ['Vacuum', 'Air', 'Water', 'Steel'],
    answer: 'Steel',
    explanation: 'Sound travels fastest in solids because the particles are tightly packed, allowing vibrations to propagate quickly.'
  },
  {
    id: 'phy-ol-005', subject: 'Physics', level: 'O-Level', topic: 'Electricity',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'Ohm\'s law states that V equals:',
    options: ['I / R', 'I × R', 'R / I', 'I + R'],
    answer: 'I × R',
    explanation: 'V = IR, where V is voltage, I is current, and R is resistance.'
  },
  {
    id: 'phy-ol-006', subject: 'Physics', level: 'O-Level', topic: 'Electricity',
    difficulty: 'Medium', type: 'numeric', marks: 2,
    prompt: 'A circuit has a 12 V battery and a 4 Ω resistor. What is the current in amperes?',
    answer: 3,
    tolerance: 0.05,
    explanation: 'I = V / R = 12 / 4 = 3 A.'
  },
  {
    id: 'phy-ol-007', subject: 'Physics', level: 'O-Level', topic: 'Thermodynamics',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Which of the following is NOT a method of heat transfer?',
    options: ['Conduction', 'Convection', 'Radiation', 'Diffusion'],
    answer: 'Diffusion',
    explanation: 'Heat transfers via conduction, convection, and radiation. Diffusion is the movement of particles from high to low concentration.'
  },
  {
    id: 'phy-al-001', subject: 'Physics', level: 'A-Level', topic: 'Classical Mechanics',
    difficulty: 'Hard', type: 'numeric', marks: 3,
    prompt: 'An object moves in a circle of radius 2 m at a constant speed of 4 m/s. What is the centripetal acceleration in m/s²?',
    answer: 8,
    tolerance: 0.1,
    explanation: 'a = v² / r = (4)² / 2 = 16 / 2 = 8 m/s².'
  },
  {
    id: 'phy-al-002', subject: 'Physics', level: 'A-Level', topic: 'Optics',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'Light passes from air (n=1.0) into glass (n=1.5) at an angle of incidence of 30°. What is the angle of refraction (sin⁻¹(1/3))?',
    options: ['Approximately 19.5°', 'Approximately 30°', 'Approximately 45°', 'Approximately 60°'],
    answer: 'Approximately 19.5°',
    explanation: 'By Snell\'s law: n1·sin(θ1) = n2·sin(θ2) → 1·sin(30°) = 1.5·sin(θ2) → sin(θ2) = 0.5/1.5 = 1/3 → θ2 ≈ 19.47°.'
  },
  {
    id: 'phy-al-003', subject: 'Physics', level: 'A-Level', topic: 'Modern Physics',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'Which scientist proposed that energy is quantized in discrete packets?',
    options: ['Newton', 'Einstein', 'Planck', 'Bohr'],
    answer: 'Planck',
    explanation: 'Max Planck proposed energy quantization in 1900, giving rise to quantum theory: E = hf.'
  },
  {
    id: 'phy-uace-001', subject: 'Physics', level: 'UACE', topic: 'Modern Physics',
    difficulty: 'Hard', type: 'numeric', marks: 3,
    prompt: 'A photon has a frequency of 5 × 10¹⁴ Hz. What is its energy in 10⁻¹⁹ Joules? (h = 6.63 × 10⁻³⁴ J·s) Round to 1 dp.',
    answer: 3.3,
    tolerance: 0.2,
    explanation: 'E = hf = (6.63 × 10⁻³⁴)(5 × 10¹⁴) = 3.315 × 10⁻¹⁹ J ≈ 3.3 × 10⁻¹⁹ J.'
  },

  // ---------- MATHEMATICS ----------
  {
    id: 'mat-ol-001', subject: 'Mathematics', level: 'O-Level', topic: 'Algebra',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'Solve for x: 2x + 5 = 17.',
    options: ['x = 4', 'x = 6', 'x = 8', 'x = 11'],
    answer: 'x = 6',
    explanation: '2x = 17 - 5 = 12, so x = 6.'
  },
  {
    id: 'mat-ol-002', subject: 'Mathematics', level: 'O-Level', topic: 'Algebra',
    difficulty: 'Medium', type: 'numeric', marks: 2,
    prompt: 'If x² - 5x + 6 = 0, what is the larger root?',
    answer: 3,
    tolerance: 0.01,
    explanation: 'Factor: (x - 2)(x - 3) = 0, so x = 2 or x = 3. The larger root is 3.'
  },
  {
    id: 'mat-ol-003', subject: 'Mathematics', level: 'O-Level', topic: 'Geometry & Trigonometry',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'In a right triangle, if one angle is 30° and the hypotenuse is 10, what is the side opposite the 30° angle?',
    options: ['5', '5√2', '5√3', '10'],
    answer: '5',
    explanation: 'sin(30°) = opposite / hypotenuse → opposite = 10 × 0.5 = 5.'
  },
  {
    id: 'mat-ol-004', subject: 'Mathematics', level: 'O-Level', topic: 'Statistics & Probability',
    difficulty: 'Easy', type: 'numeric', marks: 1,
    prompt: 'What is the mean of: 4, 8, 15, 16, 23, 42?',
    answer: 18,
    tolerance: 0.5,
    explanation: 'Sum = 108. Mean = 108 / 6 = 18.'
  },
  {
    id: 'mat-ol-005', subject: 'Mathematics', level: 'O-Level', topic: 'Statistics & Probability',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'A bag contains 3 red and 5 blue marbles. What is the probability of drawing a red marble?',
    options: ['1/8', '3/8', '3/5', '5/8'],
    answer: '3/8',
    explanation: 'P(red) = number of red / total = 3 / (3 + 5) = 3/8.'
  },
  {
    id: 'mat-ol-006', subject: 'Mathematics', level: 'O-Level', topic: 'Calculus Basics',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'What is the derivative of f(x) = 3x² + 2x - 5?',
    options: ['6x + 2', '3x + 2', '6x - 5', '3x² + 2'],
    answer: '6x + 2',
    explanation: 'd/dx(3x²) = 6x; d/dx(2x) = 2; d/dx(-5) = 0. So f\'(x) = 6x + 2.'
  },
  {
    id: 'mat-al-001', subject: 'Mathematics', level: 'A-Level', topic: 'Pure Mathematics',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'What is the modulus of the complex number z = 3 + 4i?',
    options: ['3', '4', '5', '7'],
    answer: '5',
    explanation: '|z| = √(3² + 4²) = √(9 + 16) = √25 = 5.'
  },
  {
    id: 'mat-al-002', subject: 'Mathematics', level: 'A-Level', topic: 'Pure Mathematics',
    difficulty: 'Hard', type: 'numeric', marks: 3,
    prompt: 'Evaluate the integral of (2x + 3) from x = 0 to x = 4.',
    answer: 28,
    tolerance: 0.1,
    explanation: '∫(2x + 3)dx = x² + 3x. Evaluated: (16 + 12) - (0 + 0) = 28.'
  },
  {
    id: 'mat-al-003', subject: 'Mathematics', level: 'A-Level', topic: 'Statistics & Probability',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'For a standard normal distribution, what percentage of values fall within one standard deviation of the mean?',
    options: ['Approximately 50%', 'Approximately 68%', 'Approximately 95%', 'Approximately 99%'],
    answer: 'Approximately 68%',
    explanation: 'The 68-95-99.7 rule: ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ.'
  },
  {
    id: 'mat-uace-001', subject: 'Mathematics', level: 'UACE', topic: 'Applied Mathematics',
    difficulty: 'Hard', type: 'numeric', marks: 3,
    prompt: 'A particle moves so that its position at time t is s(t) = t³ - 6t² + 9t. At what time t > 0 (in seconds) is the velocity zero for the first time?',
    answer: 1,
    tolerance: 0.05,
    explanation: 'v(t) = ds/dt = 3t² - 12t + 9 = 3(t² - 4t + 3) = 3(t - 1)(t - 3). v = 0 at t = 1 or t = 3. First time t > 0 is t = 1 s.'
  },

  // ---------- CHEMISTRY ----------
  {
    id: 'che-ol-001', subject: 'Chemistry', level: 'O-Level', topic: 'Atomic Structure',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'How many protons does a carbon atom have?',
    options: ['4', '6', '8', '12'],
    answer: '6',
    explanation: 'Carbon has atomic number 6, meaning it has 6 protons.'
  },
  {
    id: 'che-ol-002', subject: 'Chemistry', level: 'O-Level', topic: 'Acids & Bases',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'What is the pH of pure water at 25°C?',
    options: ['0', '7', '10', '14'],
    answer: '7',
    explanation: 'Pure water is neutral, with a pH of exactly 7 at 25°C.'
  },
  {
    id: 'che-ol-003', subject: 'Chemistry', level: 'O-Level', topic: 'Stoichiometry',
    difficulty: 'Medium', type: 'numeric', marks: 2,
    prompt: 'How many moles are in 36 g of water (H₂O, M = 18 g/mol)?',
    answer: 2,
    tolerance: 0.05,
    explanation: 'moles = mass / molar mass = 36 / 18 = 2 mol.'
  },
  {
    id: 'che-ol-004', subject: 'Chemistry', level: 'O-Level', topic: 'Periodic Table',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Which group of the periodic table contains the noble gases?',
    options: ['Group 1', 'Group 7', 'Group 0 (or 18)', 'Group 4'],
    answer: 'Group 0 (or 18)',
    explanation: 'Noble gases (He, Ne, Ar, etc.) sit in group 0 (also labelled group 18) and have full outer electron shells.'
  },
  {
    id: 'che-al-001', subject: 'Chemistry', level: 'A-Level', topic: 'Organic Chemistry',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'Which functional group is present in ethanoic acid (CH₃COOH)?',
    options: ['Hydroxyl (-OH)', 'Carbonyl (C=O)', 'Carboxyl (-COOH)', 'Amine (-NH₂)'],
    answer: 'Carboxyl (-COOH)',
    explanation: 'Ethanoic acid contains the carboxylic acid functional group (-COOH).'
  },
  {
    id: 'che-al-002', subject: 'Chemistry', level: 'A-Level', topic: 'Equilibrium',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'According to Le Chatelier\'s principle, increasing pressure on the equilibrium N₂ + 3H₂ ⇌ 2NH₃ will:',
    options: [
      'Shift the equilibrium left',
      'Shift the equilibrium right',
      'Have no effect',
      'Stop the reaction'
    ],
    answer: 'Shift the equilibrium right',
    explanation: 'Increasing pressure shifts equilibrium toward the side with fewer moles of gas. Right side has 2 moles vs left side\'s 4 moles.'
  },

  // ---------- BIOLOGY ----------
  {
    id: 'bio-ol-001', subject: 'Biology', level: 'O-Level', topic: 'Cell Biology',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'Which organelle is known as the "powerhouse of the cell"?',
    options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus'],
    answer: 'Mitochondria',
    explanation: 'Mitochondria produce ATP via cellular respiration, providing energy for the cell.'
  },
  {
    id: 'bio-ol-002', subject: 'Biology', level: 'O-Level', topic: 'Genetics',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Which molecule carries genetic information in most organisms?',
    options: ['Protein', 'Lipid', 'DNA', 'Carbohydrate'],
    answer: 'DNA',
    explanation: 'DNA (deoxyribonucleic acid) stores genetic information in nearly all living organisms.'
  },
  {
    id: 'bio-ol-003', subject: 'Biology', level: 'O-Level', topic: 'Photosynthesis',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Which gas is produced as a by-product of photosynthesis?',
    options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
    answer: 'Oxygen',
    explanation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Oxygen is released as a by-product.'
  },
  {
    id: 'bio-ol-004', subject: 'Biology', level: 'O-Level', topic: 'Human Body',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'How many chambers does a human heart have?',
    options: ['2', '3', '4', '5'],
    answer: '4',
    explanation: 'Human heart has 4 chambers: two atria (upper) and two ventricles (lower).'
  },
  {
    id: 'bio-al-001', subject: 'Biology', level: 'A-Level', topic: 'Genetics',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'In a monohybrid cross between two heterozygous parents (Aa × Aa), what fraction of offspring are expected to be homozygous recessive?',
    options: ['1/4', '1/2', '3/4', '1'],
    answer: '1/4',
    explanation: 'Punnett square gives 1 AA : 2 Aa : 1 aa. So 1/4 are homozygous recessive (aa).'
  },
  {
    id: 'bio-al-002', subject: 'Biology', level: 'A-Level', topic: 'Ecology',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'Approximately what percentage of energy is transferred from one trophic level to the next in a food chain?',
    options: ['1%', '10%', '50%', '90%'],
    answer: '10%',
    explanation: 'The 10% rule: only about 10% of energy is transferred up each trophic level; the rest is lost as heat or used in metabolism.'
  },

  // ---------- ENGLISH ----------
  {
    id: 'eng-ol-001', subject: 'English', level: 'O-Level', topic: 'Grammar',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'Choose the correct sentence:',
    options: [
      'She don\'t like mangoes.',
      'She doesn\'t likes mangoes.',
      'She doesn\'t like mangoes.',
      'She not like mangoes.'
    ],
    answer: 'She doesn\'t like mangoes.',
    explanation: '"Doesn\'t" (third person singular) is followed by the base form of the verb ("like"), not "likes".'
  },
  {
    id: 'eng-ol-002', subject: 'English', level: 'O-Level', topic: 'Vocabulary',
    difficulty: 'Easy', type: 'mcq', marks: 1,
    prompt: 'What is the antonym of "abundant"?',
    options: ['Plentiful', 'Scarce', 'Generous', 'Rich'],
    answer: 'Scarce',
    explanation: '"Abundant" means existing in large quantities; "scarce" means in short supply — direct opposites.'
  },
  {
    id: 'eng-ol-003', subject: 'English', level: 'O-Level', topic: 'Comprehension',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Read: "Despite the heavy rain, the children continued playing outside." What does the word "despite" indicate?',
    options: ['A cause', 'A contrast', 'A condition', 'A result'],
    answer: 'A contrast',
    explanation: '"Despite" introduces a contrast — playing outside happened in spite of the rain.'
  },
  {
    id: 'eng-ol-004', subject: 'English', level: 'O-Level', topic: 'Grammar',
    difficulty: 'Medium', type: 'mcq', marks: 1,
    prompt: 'Identify the correct passive form of: "The teacher marked the books."',
    options: [
      'The books are marked by the teacher.',
      'The books were marked by the teacher.',
      'The books have marked by the teacher.',
      'The books being marked by the teacher.'
    ],
    answer: 'The books were marked by the teacher.',
    explanation: 'Past simple active "marked" → past simple passive "were marked".'
  },
  {
    id: 'eng-al-001', subject: 'English', level: 'A-Level', topic: 'Literature',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: 'In literature, "irony" most accurately refers to:',
    options: [
      'A figure of speech using exaggeration',
      'A contrast between expectation and reality',
      'A direct comparison using "like" or "as"',
      'A repeated sound at the start of words'
    ],
    answer: 'A contrast between expectation and reality',
    explanation: 'Irony involves a discrepancy between what is expected and what actually happens (or is meant).'
  },
  {
    id: 'eng-al-002', subject: 'English', level: 'A-Level', topic: 'Literature',
    difficulty: 'Hard', type: 'mcq', marks: 2,
    prompt: '"All the world\'s a stage, and all the men and women merely players." This is an example of:',
    options: ['Simile', 'Metaphor', 'Personification', 'Onomatopoeia'],
    answer: 'Metaphor',
    explanation: 'A metaphor directly equates one thing to another without "like" or "as". The world IS a stage.'
  }
];

// Build a deterministic exam from a config:
// { subject, level, difficulty, count, topics? }
// Falls back gracefully when filters return too few items.
export function buildExam({ subject, level, difficulty, count = 10, topics = null } = {}) {
  let pool = [...questionBank];

  if (subject) pool = pool.filter(q => q.subject === subject);
  if (level) pool = pool.filter(q => q.level === level);
  if (topics && topics.length > 0) pool = pool.filter(q => topics.includes(q.topic));

  // Difficulty: prefer exact match, then progressively widen.
  if (difficulty) {
    const exact = pool.filter(q => q.difficulty === difficulty);
    if (exact.length >= Math.min(count, 3)) {
      pool = exact;
    } else {
      // Keep current pool (already filtered by subject/level) — widen difficulty.
    }
  }

  // If still not enough, relax the topic filter, then the level, then the subject.
  if (pool.length < count && topics) {
    pool = questionBank.filter(q =>
      (!subject || q.subject === subject) &&
      (!level || q.level === level)
    );
  }
  if (pool.length < count && level) {
    pool = questionBank.filter(q => !subject || q.subject === subject);
  }
  if (pool.length < count) {
    pool = [...questionBank];
  }

  // Deterministic shuffle (seeded by subject+level so results feel stable per session)
  const seed = `${subject || 'mix'}-${level || 'all'}-${difficulty || 'any'}-${Date.now()}`;
  const shuffled = seededShuffle(pool, seed).slice(0, count);

  return shuffled.map((q, idx) => ({ ...q, position: idx + 1 }));
}

// Score a completed exam.
// answers: { [questionId]: userAnswer }
export function scoreExam(questions, answers) {
  let earned = 0;
  let totalMarks = 0;
  const breakdown = [];

  for (const q of questions) {
    totalMarks += q.marks || 1;
    const user = answers[q.id];
    let correct = false;

    if (user === undefined || user === null || user === '') {
      correct = false;
    } else if (q.type === 'numeric') {
      const num = typeof user === 'number' ? user : parseFloat(user);
      const tol = q.tolerance ?? 0.01;
      correct = !Number.isNaN(num) && Math.abs(num - q.answer) <= tol;
    } else {
      correct = String(user).trim() === String(q.answer).trim();
    }

    if (correct) earned += q.marks || 1;

    breakdown.push({
      id: q.id,
      prompt: q.prompt,
      topic: q.topic,
      difficulty: q.difficulty,
      type: q.type,
      userAnswer: user ?? null,
      correctAnswer: q.answer,
      explanation: q.explanation,
      correct,
      marks: q.marks || 1
    });
  }

  const percentage = totalMarks > 0 ? Math.round((earned / totalMarks) * 100) : 0;

  // Per-topic accuracy
  const byTopic = {};
  breakdown.forEach(b => {
    if (!byTopic[b.topic]) byTopic[b.topic] = { correct: 0, total: 0 };
    byTopic[b.topic].total += 1;
    if (b.correct) byTopic[b.topic].correct += 1;
  });
  const topicAccuracy = Object.entries(byTopic).map(([topic, v]) => ({
    topic,
    accuracy: Math.round((v.correct / v.total) * 100),
    correct: v.correct,
    total: v.total
  }));

  return { earned, totalMarks, percentage, breakdown, topicAccuracy };
}

// Tiny seeded shuffle (mulberry32) so the same seed returns the same order.
function seededShuffle(arr, seedStr) {
  const seed = hashString(seedStr);
  let a = seed >>> 0;
  const rand = () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Persistence: store exam attempts in localStorage so users can review later.
const ATTEMPTS_KEY = 'eduPractice_examAttempts';

export function saveAttempt(attempt) {
  const existing = listAttempts();
  existing.unshift(attempt);
  // Cap at most recent 25 attempts
  const capped = existing.slice(0, 25);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(capped));
}

export function listAttempts() {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getAttempt(id) {
  return listAttempts().find(a => a.id === id) || null;
}
