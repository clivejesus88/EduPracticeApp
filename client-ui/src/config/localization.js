// Uganda-specific localization configuration

export const ugandaConfig = {
  country: 'Uganda',
  currency: {
    code: 'UGX',
    symbol: 'Shs',
    name: 'Uganda Shilling',
    decimals: 0
  },
  
  examBoard: {
    name: 'UNEB',
    fullName: 'Uganda National Examinations Board',
    website: 'https://www.uneb.ac.ug/'
  },
  
  examLevels: [
    {
      id: 'o-level',
      name: 'O-Level',
      localName: 'UCE - Uganda Certificate of Education',
      grades: '1-9',
      years: ['S.4', 'S.5'],
      description: 'Secondary School Certificate'
    },
    {
      id: 'a-level',
      name: 'A-Level',
      localName: 'UACE - Uganda Advanced Certificate of Education',
      grades: '1-9',
      years: ['S.6', 'S.7'],
      description: 'Advanced Secondary School Certificate'
    },
    {
      id: 'uace',
      name: 'UACE Alternative',
      localName: 'UACE (Alternative)',
      grades: '1-9',
      years: ['Post S.5'],
      description: 'Alternative path to A-Level'
    }
  ],
  
  subjects: {
    core: [
      {
        id: 'english',
        name: 'English Language',
        localName: 'Olungereza'
      },
      {
        id: 'mathematics',
        name: 'Mathematics',
        localName: 'Mathematics'
      },
      {
        id: 'geography',
        name: 'Geography',
        localName: 'Geography'
      },
      {
        id: 'history',
        name: 'History',
        localName: 'Enkola'
      }
    ],
    
    sciences: [
      {
        id: 'physics',
        name: 'Physics',
        localName: 'Physics'
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        localName: 'Chemistry'
      },
      {
        id: 'biology',
        name: 'Biology',
        localName: 'Biology'
      }
    ],
    
    languages: [
      {
        id: 'luganda',
        name: 'Luganda',
        localName: 'Luganda'
      },
      {
        id: 'french',
        name: 'French',
        localName: 'Kifaranga'
      },
      {
        id: 'arabic',
        name: 'Arabic',
        localName: 'Kingereza ky\'Abarabu'
      }
    ]
  },
  
  universities: [
    {
      name: 'Makerere University',
      shortName: 'MAK',
      location: 'Kampala',
      established: 1922,
      website: 'https://www.mak.ac.ug/'
    },
    {
      name: 'Kampala International University',
      shortName: 'KIU',
      location: 'Kampala',
      established: 1993,
      website: 'https://www.kiu.ac.ug/'
    },
    {
      name: 'Makerere University Business School',
      shortName: 'MUBS',
      location: 'Kampala',
      established: 1992,
      website: 'https://www.mubs.ac.ug/'
    },
    {
      name: 'Uganda Martyr\'s University',
      shortName: 'UMU',
      location: 'Nkozi',
      established: 1993,
      website: 'https://www.umu.ac.ug/'
    }
  ],
  
  landmarks: {
    physical: [
      { name: 'Rwenzori Mountains', altitude: '5,109m', district: 'Kasese' },
      { name: 'Murchison Falls', altitude: '43m drop', district: 'Nwoya' },
      { name: 'Lake Victoria', area: '68,800 km²', district: 'Multiple' },
      { name: 'Kilak Hill', altitude: '1,050m', district: 'Pader' }
    ],
    cities: [
      { name: 'Kampala', population: '~1.6M', region: 'Central' },
      { name: 'Jinja', population: '~500K', region: 'Eastern' },
      { name: 'Mbarara', population: '~300K', region: 'Western' },
      { name: 'Masaka', population: '~200K', region: 'Central' }
    ]
  },
  
  academicCalendar: {
    year: 2024,
    terms: [
      {
        name: 'First Term',
        start: 'January',
        end: 'March',
        examWeek: 'Mid-March'
      },
      {
        name: 'Second Term',
        start: 'April',
        end: 'June',
        examWeek: 'Late June'
      },
      {
        name: 'Third Term',
        start: 'August',
        end: 'October',
        examWeek: 'Late October'
      },
      {
        name: 'Fourth Term',
        start: 'November',
        end: 'December',
        examWeek: 'Early December'
      }
    ],
    nationalExams: {
      'O-Level': 'October/November',
      'A-Level': 'May/June',
      'Final A-Level': 'November/December'
    }
  },
  
  paymentMethods: {
    mobile: [
      {
        name: 'MTN Mobile Money',
        code: 'MTN',
        prefix: '*156#',
        provider: 'MTN Uganda'
      },
      {
        name: 'Airtel Money',
        code: 'AIRTEL',
        prefix: '*185#',
        provider: 'Airtel Uganda'
      },
      {
        name: 'Vodafone Cash',
        code: 'VODAFONE',
        prefix: '*322#',
        provider: 'Vodafone Uganda'
      }
    ],
    bank: [
      'Stanbic Bank',
      'Barclays Bank',
      'Standard Chartered Bank',
      'Bank of Uganda Cooperatives'
    ]
  },
  
  numberFormatting: {
    locale: 'ug-UG',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    currencyFormat: 'Shs {value}'
  },
  
  dateFormatting: {
    locale: 'ug-UG',
    format: 'DD/MM/YYYY',
    timezone: 'EAT (East Africa Time, UTC+3)'
  },
  
  timeZone: 'Africa/Kampala',
  
  culturalNotes: {
    greeting: 'Habari! (Hello) / Oli otya? (How are you?)',
    languages: ['Luganda', 'English', 'Swahili'],
    respectfulAddresses: [
      'Sir/Madam',
      'Teacher',
      'Sir/Miss (in educational context)'
    ],
    holidays: [
      { date: '1-Jan', name: 'New Year\'s Day' },
      { date: '8-Mar', name: 'International Women\'s Day' },
      { date: 'Easter Monday', name: 'Easter' },
      { date: '1-May', name: 'Labour Day' },
      { date: '3-June', name: 'Martyrs\' Day' },
      { date: '9-June', name: 'Heroes\' Day' },
      { date: '25-Dec', name: 'Christmas Day' },
      { date: '26-Dec', name: 'Boxing Day' }
    ]
  }
};

// Helper function to format currency
export const formatUGXCurrency = (amount) => {
  return `Shs ${amount.toLocaleString('en-UG', {
    style: 'currency',
    currency: 'UGX',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
};

// Helper function to get exam level info
export const getExamLevelInfo = (levelId) => {
  return ugandaConfig.examLevels.find(level => level.id === levelId.toLowerCase());
};

// Helper function to get subject info
export const getSubjectInfo = (subjectId) => {
  const allSubjects = [
    ...ugandaConfig.subjects.core,
    ...ugandaConfig.subjects.sciences,
    ...ugandaConfig.subjects.languages
  ];
  return allSubjects.find(subject => subject.id === subjectId);
};
