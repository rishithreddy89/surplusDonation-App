/* AI Classification Service for Surplus Items */

export interface ClassificationResult {
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  confidence: number;
  suggestedUnit: string;
  description: string;
  storageConditions?: string;
}

// Comprehensive keyword database for text-based classification
const categoryKeywords = {
  food: {
    keywords: [
      'rice', 'wheat', 'flour', 'vegetable', 'fruit', 'food', 'meal', 'bread', 'milk',
      'egg', 'meat', 'fish', 'chicken', 'dal', 'grain', 'oil', 'butter', 'cheese',
      'potato', 'onion', 'tomato', 'apple', 'banana', 'orange', 'carrot', 'beans',
      'lentil', 'sugar', 'salt', 'spice', 'tea', 'coffee', 'juice', 'snack',
      'biscuit', 'cookie', 'cake', 'pasta', 'noodle', 'cereal', 'soup', 'sauce',
      'pizza', 'burger', 'sandwich', 'chapati', 'roti', 'paratha', 'dosa', 'idli'
    ],
    unit: 'kg',
    storage: 'Store in cool, dry place. Check expiry date.'
  },
  clothing: {
    keywords: [
      'cloth', 'shirt', 'pant', 'dress', 'jacket', 'shoe', 'sock', 'sweater',
      'jean', 't-shirt', 'saree', 'kurta', 'pajama', 'shorts', 'skirt', 'blouse',
      'coat', 'blazer', 'uniform', 'suit', 'tie', 'scarf', 'hat', 'cap',
      'sandal', 'slipper', 'boot', 'belt', 'glove', 'trouser', 'legging',
      'hoodie', 'cardigan', 'vest', 'underwear', 'nightwear', 'sportswear'
    ],
    unit: 'pieces',
    storage: 'Keep clean and dry. Fold or hang properly.'
  },
  educational: {
    keywords: [
      'book', 'notebook', 'pen', 'pencil', 'copy', 'paper', 'stationery',
      'school', 'study', 'textbook', 'novel', 'magazine', 'dictionary',
      'eraser', 'sharpener', 'ruler', 'compass', 'calculator', 'backpack',
      'bag', 'lunchbox', 'bottle', 'crayon', 'marker', 'highlighter',
      'folder', 'binder', 'scissors', 'glue', 'tape', 'stapler', 'chart',
      'map', 'globe', 'kit', 'lab', 'instrument', 'equipment'
    ],
    unit: 'pieces',
    storage: 'Keep away from moisture and direct sunlight.'
  },
  medical: {
    keywords: [
      'medicine', 'tablet', 'capsule', 'syrup', 'bandage', 'medical',
      'first aid', 'sanitizer', 'mask', 'glove', 'cotton', 'gauze',
      'thermometer', 'syringe', 'injection', 'cream', 'ointment', 'gel',
      'drops', 'spray', 'inhaler', 'vitamin', 'supplement', 'antibiotic',
      'painkiller', 'antiseptic', 'disinfectant', 'surgical', 'diagnostic',
      'equipment', 'device', 'wheelchair', 'crutch', 'walker', 'oxygen'
    ],
    unit: 'pieces',
    storage: 'Store as per medical guidelines. Check expiry date.'
  }
};

/**
 * Classify item based on text (item name or description)
 */
export const classifyByText = (text: string): ClassificationResult => {
  if (!text || text.trim().length < 2) {
    return {
      category: 'other',
      confidence: 0,
      suggestedUnit: 'pieces',
      description: 'Please provide more information'
    };
  }

  const lowerText = text.toLowerCase();
  const scores: { [key: string]: number } = {
    food: 0,
    clothing: 0,
    educational: 0,
    medical: 0
  };

  // Calculate score for each category based on keyword matches
  for (const [category, data] of Object.entries(categoryKeywords)) {
    for (const keyword of data.keywords) {
      if (lowerText.includes(keyword)) {
        scores[category] += 1;
        // Give extra weight to exact word matches
        const words = lowerText.split(/\s+/);
        if (words.includes(keyword)) {
          scores[category] += 0.5;
        }
      }
    }
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return {
      category: 'other',
      confidence: 0,
      suggestedUnit: 'pieces',
      description: 'Could not classify. Please select category manually.',
    };
  }

  const category = Object.keys(scores).find(
    key => scores[key] === maxScore
  ) as keyof typeof categoryKeywords;

  const categoryData = categoryKeywords[category];
  const confidence = Math.min(maxScore / 3, 1); // Normalize confidence

  return {
    category: category as ClassificationResult['category'],
    confidence,
    suggestedUnit: categoryData.unit,
    description: `Auto-detected as ${category}`,
    storageConditions: categoryData.storage
  };
};

/**
 * Classify image using Hugging Face Vision API
 */
export const classifyByImage = async (imageFile: File): Promise<ClassificationResult> => {
  try {
    // Use Hugging Face Inference API for image classification
    const API_URL = 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224';
    
    // Convert file to array buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      throw new Error('Image classification failed');
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      throw new Error('No classification results');
    }

    // Map AI predictions to our categories
    const prediction = results[0];
    const label = prediction.label.toLowerCase();
    const score = prediction.score;

    // Map predicted labels to our categories
    let category: ClassificationResult['category'] = 'other';
    let unit = 'pieces';
    let storage = '';

    if (label.includes('food') || label.includes('fruit') || label.includes('vegetable') ||
        label.includes('meal') || label.includes('bread') || label.includes('rice') ||
        label.includes('banana') || label.includes('apple') || label.includes('orange') ||
        label.includes('pizza') || label.includes('sandwich')) {
      category = 'food';
      unit = 'kg';
      storage = categoryKeywords.food.storage;
    } else if (label.includes('shirt') || label.includes('dress') || label.includes('jean') ||
               label.includes('jacket') || label.includes('shoe') || label.includes('boot') ||
               label.includes('sock') || label.includes('suit') || label.includes('tie')) {
      category = 'clothing';
      unit = 'pieces';
      storage = categoryKeywords.clothing.storage;
    } else if (label.includes('book') || label.includes('notebook') || label.includes('pen') ||
               label.includes('pencil') || label.includes('paper')) {
      category = 'educational';
      unit = 'pieces';
      storage = categoryKeywords.educational.storage;
    } else if (label.includes('medical') || label.includes('pill') || label.includes('medicine') ||
               label.includes('syringe') || label.includes('bandage')) {
      category = 'medical';
      unit = 'pieces';
      storage = categoryKeywords.medical.storage;
    }

    return {
      category,
      confidence: score,
      suggestedUnit: unit,
      description: `AI detected: ${prediction.label} (${Math.round(score * 100)}% confidence)`,
      storageConditions: storage
    };

  } catch (error) {
    console.error('Image classification error:', error);
    
    // Fallback: try to classify based on filename
    const fileName = imageFile.name.toLowerCase();
    return classifyByText(fileName);
  }
};

/**
 * Get storage recommendations based on category
 */
export const getStorageRecommendations = (category: string): string => {
  const data = categoryKeywords[category as keyof typeof categoryKeywords];
  return data?.storage || 'Store in appropriate conditions.';
};

/**
 * Get recommended unit based on category
 */
export const getRecommendedUnit = (category: string): string => {
  const data = categoryKeywords[category as keyof typeof categoryKeywords];
  return data?.unit || 'pieces';
};
