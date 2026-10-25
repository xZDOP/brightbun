/**
 * Pure quiz logic and utilities for BRIGHT Dutch Language Exam
 */

export interface ScoreSummary {
  correct: number;
  total: number;
  percentage: number;
  scoreScale: number; // 0.0 - 5.0 Bright Scale
  cefrLevel: string;
}

export function getAudioClipPath(questionId: number): string {
  if (questionId < 1 || questionId > 60) {
    throw new Error(`Invalid listening question id: ${questionId}`);
  }
  return `/audio/q_${questionId}.mp3`;
}

export function calculateBrightScore(correctCount: number, totalQuestions: number): ScoreSummary {
  if (totalQuestions <= 0) {
    return {
      correct: 0,
      total: 0,
      percentage: 0,
      scoreScale: 0.0,
      cefrLevel: 'A1'
    };
  }

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  // Bright score scale is 0.0 - 5.0
  const scoreScale = Math.round((percentage / 20) * 10) / 10;

  let cefrLevel = 'A1';
  if (scoreScale >= 4.5) {
    cefrLevel = 'C1+ / Fluent';
  } else if (scoreScale >= 4.0) {
    cefrLevel = 'C1 / Advanced';
  } else if (scoreScale >= 3.5) {
    cefrLevel = 'B2+ / High Intermediate';
  } else if (scoreScale >= 3.0) {
    cefrLevel = 'B2 / Independent User';
  } else if (scoreScale >= 2.0) {
    cefrLevel = 'B1 / Threshold';
  } else if (scoreScale >= 1.0) {
    cefrLevel = 'A2 / Waystage';
  }

  return {
    correct: correctCount,
    total: totalQuestions,
    percentage,
    scoreScale,
    cefrLevel
  };
}
