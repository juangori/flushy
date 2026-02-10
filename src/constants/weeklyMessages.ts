// Weekly Digest motivational messages based on gut health performance

export const WEEKLY_MESSAGES = {
  excellent: [
    "Your gut is thriving!",
    "Excellent week! Keep it up",
    "Smooth sailing this week!",
    "Your body thanks you!",
    "Peak performance this week!",
  ],
  good: [
    "Solid week overall!",
    "You're on the right track!",
    "Good consistency this week!",
    "Nice and steady!",
    "Keep up the good work!",
  ],
  needs_attention: [
    "A bit irregular this week. That's okay!",
    "Some ups and downs - listen to your body",
    "Room for improvement - small changes help!",
    "Not your best week, but tomorrow is new!",
    "Your body is telling you something",
  ],
  low_data: [
    "Not much data this week",
    "Log consistently to see patterns",
    "More logs = better insights!",
    "Track more to understand your body",
  ],
  no_data: [
    "No logs this week",
    "Start tracking to see your progress!",
  ],
};

export interface HealthIndicator {
  label: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export const HEALTH_INDICATORS: Record<string, HealthIndicator> = {
  excellent: {
    label: "Excellent",
    icon: "Sparkles",
    iconColor: "#10B981",
    bgColor: "#D1FAE5",
  },
  good: {
    label: "Good",
    icon: "ThumbsUp",
    iconColor: "#3B82F6",
    bgColor: "#DBEAFE",
  },
  fair: {
    label: "Fair",
    icon: "CircleCheck",
    iconColor: "#F59E0B",
    bgColor: "#FEF3C7",
  },
  needs_attention: {
    label: "Needs attention",
    icon: "HeartPulse",
    iconColor: "#EC4899",
    bgColor: "#FCE7F3",
  },
};

export const STREAK_MESSAGES = {
  short: "Nice streak going!",      // 3-6 days
  medium: "Impressive streak!",     // 7-13 days
  long: "Amazing consistency!",     // 14-29 days
  epic: "Legendary streak!",        // 30+ days
};

export type WeeklyMessageCategory = keyof typeof WEEKLY_MESSAGES;
export type HealthIndicatorType = keyof typeof HEALTH_INDICATORS;
