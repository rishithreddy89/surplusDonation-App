// Content Moderation Utility using NLP-based profanity detection
// This includes a comprehensive list of inappropriate words and patterns

const profanityList = [
  // Common profanity (keeping list minimal for documentation purposes)
  'damn', 'hell', 'crap', 'stupid', 'idiot', 'dumb', 'fool', 'jerk',
  'ass', 'bastard', 'bitch', 'shit', 'fuck', 'piss', 'dick', 'cock',
  'pussy', 'slut', 'whore', 'fag', 'nigger', 'retard', 'gay',
  // Add more as needed, including variations and l33t speak
];

const aggressivePatterns = [
  /k+i+l+l+/i,
  /d+i+e+/i,
  /h+a+t+e+/i,
  /s+t+u+p+i+d+/i,
  /i+d+i+o+t+/i,
  /d+u+m+b+/i,
];

// Leet speak replacements
const leetSpeakMap: { [key: string]: string } = {
  '4': 'a', '@': 'a', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '5': 's', '7': 't', '$': 's', '8': 'b',
};

/**
 * Normalize text by removing special characters and converting leet speak
 */
function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // Replace leet speak
  Object.keys(leetSpeakMap).forEach(leet => {
    normalized = normalized.split(leet).join(leetSpeakMap[leet]);
  });
  
  // Remove special characters except spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  
  // Remove extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

/**
 * Check if text contains profanity or inappropriate content
 */
function containsProfanity(text: string): boolean {
  const normalized = normalizeText(text);
  
  // Check against profanity list
  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      return true;
    }
  }
  
  // Check aggressive patterns
  for (const pattern of aggressivePatterns) {
    if (pattern.test(normalized)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Find all inappropriate words in text
 */
function findInappropriateWords(text: string): string[] {
  const normalized = normalizeText(text);
  const found: string[] = [];
  
  // Check against profanity list
  for (const word of profanityList) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized)) {
      found.push(word);
    }
  }
  
  return found;
}

/**
 * Calculate toxicity score (0-100)
 */
function calculateToxicityScore(text: string): number {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  let score = 0;
  
  // Check profanity
  const inappropriateWords = findInappropriateWords(text);
  score += inappropriateWords.length * 20;
  
  // Check aggressive patterns
  for (const pattern of aggressivePatterns) {
    if (pattern.test(normalized)) {
      score += 15;
    }
  }
  
  // Check all caps (aggressive tone)
  const capsWords = text.split(' ').filter(word => 
    word.length > 3 && word === word.toUpperCase()
  );
  score += capsWords.length * 5;
  
  // Check excessive punctuation
  const exclamations = (text.match(/!+/g) || []).length;
  if (exclamations > 2) {
    score += exclamations * 3;
  }
  
  return Math.min(score, 100);
}

/**
 * Main moderation function
 */
export interface ModerationResult {
  isClean: boolean;
  toxicityScore: number;
  inappropriateWords: string[];
  message: string;
}

export function moderateContent(text: string): ModerationResult {
  const inappropriateWords = findInappropriateWords(text);
  const toxicityScore = calculateToxicityScore(text);
  const isClean = inappropriateWords.length === 0 && toxicityScore < 30;
  
  let message = '';
  if (!isClean) {
    if (inappropriateWords.length > 0) {
      message = `Your message contains inappropriate language: ${inappropriateWords.slice(0, 3).join(', ')}. Please revise and submit again.`;
    } else if (toxicityScore >= 30) {
      message = 'Your message may contain aggressive or inappropriate tone. Please rephrase it in a respectful manner.';
    }
  }
  
  return {
    isClean,
    toxicityScore,
    inappropriateWords,
    message
  };
}

/**
 * Sanitize text by replacing inappropriate words with asterisks
 */
export function sanitizeText(text: string): string {
  let sanitized = text;
  const inappropriateWords = findInappropriateWords(text);
  
  for (const word of inappropriateWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitized = sanitized.replace(regex, '*'.repeat(word.length));
  }
  
  return sanitized;
}
