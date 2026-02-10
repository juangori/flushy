import { LogEntry } from '../types';
import { PatternType, WELLNESS_TIPS, WellnessTip } from '../constants/wellnessTips';
import { UserProfile, HealthCondition, CONDITION_EFFECTS, AGE_EFFECTS } from '../constants/userProfile';

interface DetectedPattern {
  type: PatternType;
  confidence: number; // 0-1
  relevantEntries: LogEntry[];
  /** If true, this pattern is expected given user's conditions and shouldn't trigger concern */
  isExpected?: boolean;
}

interface PatternDetectionResult {
  patterns: DetectedPattern[];
  recommendedTip: WellnessTip | null;
}

interface ProfileEffects {
  expectConstipation: boolean;
  expectLoose: boolean;
  avoidFiberTips: boolean;
  slowerTransit: boolean;
  conditions: HealthCondition[];
}

/**
 * Compute combined effects from user profile
 */
function getProfileEffects(profile?: UserProfile): ProfileEffects {
  const effects: ProfileEffects = {
    expectConstipation: false,
    expectLoose: false,
    avoidFiberTips: false,
    slowerTransit: false,
    conditions: [],
  };

  if (!profile) return effects;

  // Combine condition effects
  for (const condition of profile.conditions) {
    if (condition === 'none') continue;
    effects.conditions.push(condition);

    const conditionEffect = CONDITION_EFFECTS[condition];
    if (conditionEffect.expectConstipation) effects.expectConstipation = true;
    if (conditionEffect.expectLoose) effects.expectLoose = true;
    if (conditionEffect.avoidFiberTips) effects.avoidFiberTips = true;
  }

  // Apply age effects
  if (profile.ageRange) {
    const ageEffect = AGE_EFFECTS[profile.ageRange];
    if (ageEffect?.slowerTransit) {
      effects.slowerTransit = true;
      effects.expectConstipation = true;
    }
  }

  return effects;
}

const DAYS_TO_ANALYZE = 7;
const MIN_ENTRIES_FOR_PATTERN = 3;

/**
 * Get entries from the last N days
 */
function getRecentEntries(history: LogEntry[], days: number): LogEntry[] {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return history.filter((entry) => entry.createdAt >= cutoff);
}

/**
 * Check for consecutive hard stools (Type 1-2)
 */
function detectConstipationPattern(entries: LogEntry[]): DetectedPattern | null {
  const recentEntries = entries.slice(-5); // Last 5 entries
  const hardStools = recentEntries.filter((e) => e.type <= 2);

  if (hardStools.length >= 2 && hardStools.length / recentEntries.length >= 0.5) {
    return {
      type: 'consecutive_type_1_2',
      confidence: hardStools.length / recentEntries.length,
      relevantEntries: hardStools,
    };
  }
  return null;
}

/**
 * Check for consecutive loose stools (Type 6-7)
 */
function detectDiarrheaPattern(entries: LogEntry[]): DetectedPattern | null {
  const recentEntries = entries.slice(-5);
  const looseStools = recentEntries.filter((e) => e.type >= 6);

  if (looseStools.length >= 2 && looseStools.length / recentEntries.length >= 0.4) {
    return {
      type: 'consecutive_type_6_7',
      confidence: looseStools.length / recentEntries.length,
      relevantEntries: looseStools,
    };
  }
  return null;
}

/**
 * Check for consistent healthy stools (Type 3-4)
 */
function detectHealthyPattern(entries: LogEntry[]): DetectedPattern | null {
  const recentEntries = entries.slice(-7);
  if (recentEntries.length < 5) return null;

  const healthyStools = recentEntries.filter((e) => e.type >= 3 && e.type <= 4);
  const ratio = healthyStools.length / recentEntries.length;

  if (ratio >= 0.7) {
    return {
      type: 'consistent_healthy',
      confidence: ratio,
      relevantEntries: healthyStools,
    };
  }
  return null;
}

/**
 * Check for coffee correlation with loose stools
 */
function detectCoffeeCorrelation(entries: LogEntry[]): DetectedPattern | null {
  const entriesWithCoffee = entries.filter((e) => e.tags.includes('coffee'));
  if (entriesWithCoffee.length < 3) return null;

  const looseWithCoffee = entriesWithCoffee.filter((e) => e.type >= 5);
  const correlation = looseWithCoffee.length / entriesWithCoffee.length;

  if (correlation >= 0.6) {
    return {
      type: 'coffee_correlation',
      confidence: correlation,
      relevantEntries: looseWithCoffee,
    };
  }
  return null;
}

/**
 * Check for stress correlation with unhealthy stools
 */
function detectStressCorrelation(entries: LogEntry[]): DetectedPattern | null {
  const entriesWithStress = entries.filter((e) => e.tags.includes('stressed'));
  if (entriesWithStress.length < 3) return null;

  const unhealthyWithStress = entriesWithStress.filter(
    (e) => e.type <= 2 || e.type >= 6
  );
  const correlation = unhealthyWithStress.length / entriesWithStress.length;

  if (correlation >= 0.5) {
    return {
      type: 'stress_correlation',
      confidence: correlation,
      relevantEntries: unhealthyWithStress,
    };
  }
  return null;
}

/**
 * Check for fiber positive correlation
 */
function detectFiberImprovement(entries: LogEntry[]): DetectedPattern | null {
  const entriesWithFiber = entries.filter((e) => e.tags.includes('high-fiber'));
  if (entriesWithFiber.length < 3) return null;

  const healthyWithFiber = entriesWithFiber.filter(
    (e) => e.type >= 3 && e.type <= 4
  );
  const correlation = healthyWithFiber.length / entriesWithFiber.length;

  if (correlation >= 0.6) {
    return {
      type: 'fiber_improvement',
      confidence: correlation,
      relevantEntries: healthyWithFiber,
    };
  }
  return null;
}

/**
 * Check for no entries in recent days
 */
function detectNoEntriesPattern(
  entries: LogEntry[],
  daysSinceLastEntry: number
): DetectedPattern | null {
  if (daysSinceLastEntry >= 3 && entries.length > 0) {
    return {
      type: 'no_entries_days',
      confidence: Math.min(daysSinceLastEntry / 7, 1),
      relevantEntries: [],
    };
  }
  return null;
}

/**
 * Check if a tip is appropriate given user's profile
 */
function isTipAppropriate(tip: WellnessTip, effects: ProfileEffects): boolean {
  // Filter out aggressive fiber tips for IBS/IBD users
  if (effects.avoidFiberTips) {
    const fiberKeywords = ['fiber', 'whole grains', 'legumes'];
    const tipLower = tip.title.toLowerCase() + ' ' + tip.message.toLowerCase();
    if (fiberKeywords.some(keyword => tipLower.includes(keyword))) {
      return false;
    }
  }

  return true;
}

/**
 * Main pattern detection function
 */
export function detectPatterns(
  history: LogEntry[],
  profile?: UserProfile
): PatternDetectionResult {
  const patterns: DetectedPattern[] = [];
  const recentEntries = getRecentEntries(history, DAYS_TO_ANALYZE);
  const effects = getProfileEffects(profile);

  // Calculate days since last entry
  const lastEntry = history[history.length - 1];
  const daysSinceLastEntry = lastEntry
    ? (Date.now() - lastEntry.createdAt) / (24 * 60 * 60 * 1000)
    : Infinity;

  // Run all pattern detectors (order by priority)
  const noEntriesPattern = detectNoEntriesPattern(history, daysSinceLastEntry);
  if (noEntriesPattern) patterns.push(noEntriesPattern);

  if (recentEntries.length >= MIN_ENTRIES_FOR_PATTERN) {
    // Health concern patterns (high priority)
    const diarrheaPattern = detectDiarrheaPattern(recentEntries);
    if (diarrheaPattern) {
      // Mark as expected if user has conditions that cause loose stools
      if (effects.expectLoose) {
        diarrheaPattern.isExpected = true;
      }
      patterns.push(diarrheaPattern);
    }

    const constipationPattern = detectConstipationPattern(recentEntries);
    if (constipationPattern) {
      // Mark as expected if user has conditions that cause constipation
      if (effects.expectConstipation || effects.slowerTransit) {
        constipationPattern.isExpected = true;
      }
      patterns.push(constipationPattern);
    }

    // Correlation patterns (medium priority)
    const coffeePattern = detectCoffeeCorrelation(recentEntries);
    if (coffeePattern) patterns.push(coffeePattern);

    const stressPattern = detectStressCorrelation(recentEntries);
    if (stressPattern) patterns.push(stressPattern);

    // Positive patterns (lower priority)
    const fiberPattern = detectFiberImprovement(recentEntries);
    if (fiberPattern) patterns.push(fiberPattern);

    const healthyPattern = detectHealthyPattern(recentEntries);
    if (healthyPattern) patterns.push(healthyPattern);
  }

  // Find the best tip based on detected patterns
  let recommendedTip: WellnessTip | null = null;

  if (patterns.length > 0) {
    // Sort patterns by priority and confidence
    // Expected patterns get lower priority (user knows about their condition)
    const sortedPatterns = patterns.sort((a, b) => {
      const priorityOrder: Record<PatternType, number> = {
        consecutive_type_6_7: 1,
        consecutive_type_1_2: 2,
        no_entries_days: 3,
        stress_correlation: 4,
        coffee_correlation: 5,
        hydration_correlation: 6,
        irregular_timing: 7,
        fiber_improvement: 8,
        consistent_healthy: 9,
        morning_routine: 10,
        general: 11,
      };
      // Move expected patterns to lower priority
      const aPriority = (priorityOrder[a.type] || 99) + (a.isExpected ? 50 : 0);
      const bPriority = (priorityOrder[b.type] || 99) + (b.isExpected ? 50 : 0);
      return aPriority - bPriority;
    });

    // Find a tip for the highest priority pattern
    for (const pattern of sortedPatterns) {
      const matchingTips = WELLNESS_TIPS.filter(
        (tip) =>
          tip.patternType === pattern.type &&
          history.length >= tip.minEntriesRequired &&
          isTipAppropriate(tip, effects)
      );

      if (matchingTips.length > 0) {
        // Pick a random tip from matching ones
        recommendedTip =
          matchingTips[Math.floor(Math.random() * matchingTips.length)];
        break;
      }
    }
  }

  // If no pattern-specific tip, use a general tip (with some probability)
  if (!recommendedTip && history.length >= 3 && Math.random() > 0.7) {
    const generalTips = WELLNESS_TIPS.filter(
      (tip) => tip.patternType === 'general' && isTipAppropriate(tip, effects)
    );
    if (generalTips.length > 0) {
      recommendedTip = generalTips[Math.floor(Math.random() * generalTips.length)];
    }
  }

  return { patterns, recommendedTip };
}

/**
 * Get a summary of the user's recent patterns for display
 */
export function getPatternSummary(history: LogEntry[]): string | null {
  const recentEntries = getRecentEntries(history, 7);
  if (recentEntries.length < 3) return null;

  const avgType =
    recentEntries.reduce((sum, e) => sum + e.type, 0) / recentEntries.length;

  if (avgType <= 2.5) {
    return 'Your stools have been on the harder side recently.';
  } else if (avgType >= 5.5) {
    return 'Your stools have been on the looser side recently.';
  } else if (avgType >= 3 && avgType <= 4) {
    return 'Your gut health looks good! Keep it up.';
  }

  return null;
}
