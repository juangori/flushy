// User profile types and options for personalized health insights

export type AgeRange = 'under18' | '18-30' | '31-45' | '46-60' | '60+';
export type BiologicalSex = 'female' | 'male' | 'not-specified';
export type HealthCondition =
  | 'ibs'
  | 'ibd'
  | 'celiac'
  | 'diabetes'
  | 'thyroid'
  | 'pregnant'
  | 'lactose-intolerant'
  | 'none';

export interface UserProfile {
  ageRange?: AgeRange;
  biologicalSex?: BiologicalSex;
  conditions: HealthCondition[];
  profileCompletedAt?: number;
  profileSkipped?: boolean;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  conditions: [],
};

export interface AgeOption {
  id: AgeRange;
  label: string;
  description: string;
}

export interface SexOption {
  id: BiologicalSex;
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export interface ConditionOption {
  id: HealthCondition;
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  description: string;
}

export const AGE_OPTIONS: AgeOption[] = [
  { id: 'under18', label: 'Under 18', description: 'Teen' },
  { id: '18-30', label: '18-30', description: 'Young adult' },
  { id: '31-45', label: '31-45', description: 'Adult' },
  { id: '46-60', label: '46-60', description: 'Middle age' },
  { id: '60+', label: '60+', description: 'Senior' },
];

export const SEX_OPTIONS: SexOption[] = [
  { id: 'female', label: 'Female', icon: 'CircleUser', iconColor: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'male', label: 'Male', icon: 'CircleUser', iconColor: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'not-specified', label: 'Prefer not to say', icon: 'Circle', iconColor: '#6B7280', bgColor: '#F3F4F6' },
];

export const CONDITION_OPTIONS: ConditionOption[] = [
  {
    id: 'ibs',
    label: 'IBS',
    icon: 'RefreshCw',
    iconColor: '#7C3AED',
    bgColor: '#EDE9FE',
    description: 'Irritable Bowel Syndrome',
  },
  {
    id: 'ibd',
    label: 'IBD',
    icon: 'Flame',
    iconColor: '#DC2626',
    bgColor: '#FEE2E2',
    description: "Crohn's or Ulcerative Colitis",
  },
  {
    id: 'celiac',
    label: 'Celiac',
    icon: 'Wheat',
    iconColor: '#CA8A04',
    bgColor: '#FEF9C3',
    description: 'Celiac Disease',
  },
  {
    id: 'diabetes',
    label: 'Diabetes',
    icon: 'Syringe',
    iconColor: '#2563EB',
    bgColor: '#DBEAFE',
    description: 'Type 1 or Type 2',
  },
  {
    id: 'thyroid',
    label: 'Thyroid',
    icon: 'Activity',
    iconColor: '#06B6D4',
    bgColor: '#CFFAFE',
    description: 'Hypo/Hyperthyroidism',
  },
  {
    id: 'pregnant',
    label: 'Pregnant',
    icon: 'Baby',
    iconColor: '#EC4899',
    bgColor: '#FCE7F3',
    description: 'Pregnant or Postpartum',
  },
  {
    id: 'lactose-intolerant',
    label: 'Lactose Intolerant',
    icon: 'Milk',
    iconColor: '#CA8A04',
    bgColor: '#FEF9C3',
    description: 'Dairy sensitivity',
  },
  {
    id: 'none',
    label: 'None of these',
    icon: 'Sparkles',
    iconColor: '#10B981',
    bgColor: '#D1FAE5',
    description: "I'm healthy!",
  },
];

// How conditions affect health expectations
export const CONDITION_EFFECTS: Record<HealthCondition, {
  expectConstipation?: boolean;
  expectLoose?: boolean;
  avoidFiberTips?: boolean;
  specialTips?: string[];
}> = {
  ibs: {
    expectConstipation: true,
    expectLoose: true,
    avoidFiberTips: true,
    specialTips: [
      'IBS can cause alternating patterns - this is normal for your condition.',
      'Low-FODMAP diet may help manage IBS symptoms.',
    ],
  },
  ibd: {
    expectLoose: true,
    avoidFiberTips: true,
    specialTips: [
      'During flares, focus on easily digestible foods.',
      'Track symptoms to identify trigger foods.',
    ],
  },
  celiac: {
    expectLoose: true,
    specialTips: [
      'Even small amounts of gluten can affect your gut.',
      'Check for hidden gluten in sauces and processed foods.',
    ],
  },
  diabetes: {
    specialTips: [
      'Blood sugar fluctuations can affect gut motility.',
      'Stay well hydrated to support digestive health.',
    ],
  },
  thyroid: {
    expectConstipation: true,
    specialTips: [
      'Hypothyroidism often causes slower digestion.',
      'Regular thyroid medication helps maintain gut regularity.',
    ],
  },
  pregnant: {
    expectConstipation: true,
    specialTips: [
      'Constipation is very common during pregnancy.',
      'Gentle movement and hydration can help.',
      'Prenatal vitamins with iron may contribute to constipation.',
    ],
  },
  'lactose-intolerant': {
    expectLoose: true,
    specialTips: [
      'Dairy may be causing digestive issues.',
      'Try lactose-free alternatives.',
    ],
  },
  none: {},
};

// Age-related adjustments
export const AGE_EFFECTS: Record<AgeRange, {
  slowerTransit?: boolean;
  notes?: string;
}> = {
  'under18': { notes: 'Growing bodies may have variable patterns.' },
  '18-30': {},
  '31-45': {},
  '46-60': { slowerTransit: true, notes: 'Digestion may slow slightly.' },
  '60+': { slowerTransit: true, notes: 'Slower transit is common and normal.' },
};
