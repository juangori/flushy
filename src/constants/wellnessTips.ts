// Wellness tips with scientific backing for pattern-based recommendations

export type PatternType =
  | 'consecutive_type_1_2'      // Hard stools (constipation)
  | 'consecutive_type_6_7'      // Loose stools (diarrhea)
  | 'irregular_timing'          // Inconsistent bowel habits
  | 'no_entries_days'           // No logs for several days
  | 'consistent_healthy'        // Good pattern (types 3-4)
  | 'coffee_correlation'        // Coffee tag appears with loose stools
  | 'stress_correlation'        // Stress tag appears with unhealthy stools
  | 'fiber_improvement'         // Fiber tag correlates with healthy stools
  | 'hydration_correlation'     // Dehydration patterns
  | 'morning_routine'           // Consistent morning patterns
  | 'general';                  // General wellness tips

export interface WellnessTip {
  id: string;
  patternType: PatternType;
  title: string;
  message: string;
  icon: string;        // Lucide icon name
  iconColor: string;   // Icon color
  bgColor: string;     // Background color
  source?: string;
  sourceUrl?: string;
  priority: 'high' | 'medium' | 'low';
  minEntriesRequired: number;
}

export const WELLNESS_TIPS: WellnessTip[] = [
  // Constipation tips (Type 1-2)
  {
    id: 'constipation_hydration',
    patternType: 'consecutive_type_1_2',
    title: 'Stay Hydrated',
    message: 'Your recent logs suggest harder stools. Drinking 8+ glasses of water daily can help soften stool and improve regularity.',
    icon: 'Droplets',
    iconColor: '#0EA5E9',
    bgColor: '#E0F2FE',
    source: 'Mayo Clinic',
    sourceUrl: 'https://www.mayoclinic.org/diseases-conditions/constipation/symptoms-causes/syc-20354253',
    priority: 'high',
    minEntriesRequired: 3,
  },
  {
    id: 'constipation_fiber',
    patternType: 'consecutive_type_1_2',
    title: 'Fiber Power',
    message: 'Adding more fiber (fruits, vegetables, whole grains) can help. Aim for 25-30g daily for better bowel movements.',
    icon: 'Salad',
    iconColor: '#16A34A',
    bgColor: '#DCFCE7',
    source: 'Harvard Health',
    sourceUrl: 'https://www.health.harvard.edu/blog/should-i-be-eating-more-fiber-2019022115927',
    priority: 'high',
    minEntriesRequired: 3,
  },
  {
    id: 'constipation_movement',
    patternType: 'consecutive_type_1_2',
    title: 'Move Your Body',
    message: 'Physical activity stimulates intestinal contractions. Even a 15-minute walk can help improve digestion.',
    icon: 'Footprints',
    iconColor: '#059669',
    bgColor: '#D1FAE5',
    source: 'Gastroenterology Research',
    priority: 'medium',
    minEntriesRequired: 4,
  },

  // Diarrhea tips (Type 6-7)
  {
    id: 'diarrhea_hydration',
    patternType: 'consecutive_type_6_7',
    title: 'Replace Fluids',
    message: 'Loose stools can lead to dehydration. Drink water, clear broths, or oral rehydration solutions to stay balanced.',
    icon: 'GlassWater',
    iconColor: '#0891B2',
    bgColor: '#CFFAFE',
    source: 'WHO Guidelines',
    priority: 'high',
    minEntriesRequired: 2,
  },
  {
    id: 'diarrhea_brat',
    patternType: 'consecutive_type_6_7',
    title: 'Gentle Foods',
    message: 'Consider easily digestible foods like bananas, rice, applesauce, and toast (BRAT diet) until things settle.',
    icon: 'Apple',
    iconColor: '#DC2626',
    bgColor: '#FEE2E2',
    source: 'Cleveland Clinic',
    priority: 'medium',
    minEntriesRequired: 2,
  },
  {
    id: 'diarrhea_triggers',
    patternType: 'consecutive_type_6_7',
    title: 'Identify Triggers',
    message: 'Track what you eat before loose stools. Common triggers include dairy, caffeine, and artificial sweeteners.',
    icon: 'Search',
    iconColor: '#7C3AED',
    bgColor: '#EDE9FE',
    source: 'Johns Hopkins Medicine',
    priority: 'medium',
    minEntriesRequired: 3,
  },

  // Irregular timing
  {
    id: 'irregular_routine',
    patternType: 'irregular_timing',
    title: 'Establish a Routine',
    message: 'Your bowel habits seem irregular. Try going at the same time daily—your body loves predictability!',
    icon: 'Clock',
    iconColor: '#EA580C',
    bgColor: '#FFEDD5',
    source: 'Gut Health Studies',
    priority: 'low',
    minEntriesRequired: 7,
  },

  // No entries for days
  {
    id: 'no_entries_check',
    patternType: 'no_entries_days',
    title: 'How Are You Doing?',
    message: "We haven't seen a log in a while. Regular tracking helps identify patterns that matter for your health.",
    icon: 'Hand',
    iconColor: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'low',
    minEntriesRequired: 0,
  },

  // Healthy pattern celebration
  {
    id: 'healthy_streak',
    patternType: 'consistent_healthy',
    title: 'Great Job!',
    message: 'Your recent logs show healthy Type 3-4 stools. Whatever you\'re doing, keep it up!',
    icon: 'Star',
    iconColor: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'low',
    minEntriesRequired: 5,
  },
  {
    id: 'healthy_maintain',
    patternType: 'consistent_healthy',
    title: 'Consistency Wins',
    message: 'A healthy gut thrives on routine. Maintain your fiber intake and hydration for continued success.',
    icon: 'Trophy',
    iconColor: '#F59E0B',
    bgColor: '#FEF3C7',
    priority: 'low',
    minEntriesRequired: 7,
  },

  // Tag correlations
  {
    id: 'coffee_loose',
    patternType: 'coffee_correlation',
    title: 'Coffee Connection',
    message: 'We noticed caffeine appears often with looser stools. Coffee can speed up digestion in some people.',
    icon: 'Coffee',
    iconColor: '#92400E',
    bgColor: '#FEF3C7',
    source: 'European Journal of Gastroenterology',
    priority: 'medium',
    minEntriesRequired: 5,
  },
  {
    id: 'stress_effect',
    patternType: 'stress_correlation',
    title: 'Stress & Digestion',
    message: 'Your logs show stress may be affecting your gut. The brain-gut connection is real—try relaxation techniques.',
    icon: 'Brain',
    iconColor: '#EC4899',
    bgColor: '#FCE7F3',
    source: 'Harvard Medical School',
    sourceUrl: 'https://www.health.harvard.edu/diseases-and-conditions/the-gut-brain-connection',
    priority: 'medium',
    minEntriesRequired: 4,
  },
  {
    id: 'fiber_positive',
    patternType: 'fiber_improvement',
    title: 'Fiber Is Working!',
    message: 'Days with fiber intake correlate with healthier stools in your log. Great dietary choice!',
    icon: 'Salad',
    iconColor: '#16A34A',
    bgColor: '#DCFCE7',
    priority: 'low',
    minEntriesRequired: 5,
  },

  // General tips (shown when no specific pattern detected)
  {
    id: 'general_water',
    patternType: 'general',
    title: 'Hydration Reminder',
    message: 'Drinking enough water is key to digestive health. Aim for 8 glasses throughout the day.',
    icon: 'Droplets',
    iconColor: '#0EA5E9',
    bgColor: '#E0F2FE',
    priority: 'low',
    minEntriesRequired: 0,
  },
  {
    id: 'general_fiber',
    patternType: 'general',
    title: 'Fiber Facts',
    message: 'Most adults only get half the recommended fiber. Add one extra serving of vegetables today!',
    icon: 'Leaf',
    iconColor: '#16A34A',
    bgColor: '#DCFCE7',
    priority: 'low',
    minEntriesRequired: 0,
  },
  {
    id: 'general_movement',
    patternType: 'general',
    title: 'Keep Moving',
    message: 'Regular exercise supports healthy digestion. Even short walks after meals can help.',
    icon: 'Footprints',
    iconColor: '#059669',
    bgColor: '#D1FAE5',
    priority: 'low',
    minEntriesRequired: 0,
  },
  {
    id: 'general_sleep',
    patternType: 'general',
    title: 'Rest Well',
    message: 'Poor sleep can affect gut health. Aim for 7-9 hours for optimal digestive function.',
    icon: 'Moon',
    iconColor: '#6366F1',
    bgColor: '#E0E7FF',
    source: 'Sleep Foundation',
    priority: 'low',
    minEntriesRequired: 0,
  },
  {
    id: 'general_probiotics',
    patternType: 'general',
    title: 'Gut Friendly Foods',
    message: 'Fermented foods like yogurt, kefir, and kimchi contain beneficial probiotics for gut health.',
    icon: 'Milk',
    iconColor: '#CA8A04',
    bgColor: '#FEF9C3',
    priority: 'low',
    minEntriesRequired: 0,
  },
];

// Cooldown periods in milliseconds
export const TIP_COOLDOWNS = {
  sameTip: 7 * 24 * 60 * 60 * 1000,        // 7 days before showing same tip
  anyTip: 24 * 60 * 60 * 1000,              // 24 hours minimum between any tips
  afterDismiss: 3 * 24 * 60 * 60 * 1000,    // 3 days after user dismisses
  snooze: 12 * 60 * 60 * 1000,              // 12 hours for snooze
} as const;

// Short disclaimer for tip cards
export const WELLNESS_DISCLAIMER =
  'General wellness info only, not medical advice. Consult a doctor for health concerns.';

// Trusted sources we reference
export const WELLNESS_SOURCES = [
  { name: 'Mayo Clinic', url: 'https://www.mayoclinic.org' },
  { name: 'Harvard Health', url: 'https://www.health.harvard.edu' },
  { name: 'Cleveland Clinic', url: 'https://my.clevelandclinic.org' },
  { name: 'Johns Hopkins Medicine', url: 'https://www.hopkinsmedicine.org' },
  { name: 'Bristol Royal Infirmary', url: 'https://www.uhbw.nhs.uk' },
  { name: 'World Gastroenterology Organisation', url: 'https://www.worldgastroenterology.org' },
] as const;

// Full legal disclaimer for settings/about
export const FULL_DISCLAIMER = {
  title: 'Health Information Disclaimer',
  sections: [
    {
      heading: 'Not Medical Advice',
      content: 'The wellness tips and information provided in Flushy are for general informational and educational purposes only. They are not intended as, and should not be considered, medical advice, diagnosis, or treatment recommendations.',
    },
    {
      heading: 'Consult Healthcare Professionals',
      content: 'If you have a chronic condition (such as IBS, IBD, diabetes, or thyroid disorders), are pregnant, or have any health concerns, please consult with a qualified healthcare provider. Only a licensed medical professional can provide personalized medical advice.',
    },
    {
      heading: 'Trusted Sources',
      content: 'Our wellness information is compiled from reputable medical institutions including Mayo Clinic, Harvard Health, Cleveland Clinic, Johns Hopkins Medicine, Bristol Royal Infirmary (creators of the Bristol Stool Scale), and World Gastroenterology Organisation guidelines.',
    },
  ],
};

// Privacy statement
export const PRIVACY_STATEMENT = {
  title: 'Your Privacy',
  mainMessage: 'All your data stays on your device.',
  details: [
    'We do not collect, store, or transmit any of your health data',
    'Your logs, profile, and settings are stored locally on your device only',
    'We have no servers that receive your personal information',
    'If you delete the app, all your data is permanently removed',
  ],
};
