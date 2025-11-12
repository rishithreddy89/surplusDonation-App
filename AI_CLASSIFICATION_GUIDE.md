# 🤖 AI Classification System - Complete Guide

## Overview

The Surplus Spark Network features an intelligent AI-powered classification system that automatically categorizes donated items using both **image recognition** and **text analysis**. This reduces manual effort for donors and improves data accuracy.

---

## Features

### 1. **Image-Based Classification** 📸
- Upload photos from gallery or capture using camera
- Automatic category detection using Vision Transformer AI
- Smart mapping to surplus categories (food, clothing, educational, medical, other)
- Confidence scores and storage recommendations

### 2. **Text-Based Classification** ✍️
- Real-time category suggestion as users type item names
- Comprehensive keyword database (100+ terms)
- Auto-fill of category and measurement units
- Intelligent fallback mechanisms

### 3. **Smart Suggestions** 💡
- Automatic unit recommendations (kg, pieces, liters)
- Storage condition guidance
- Category confidence indicators
- Manual override options

---

## How It Works

### Image Classification Pipeline

```
User Uploads Image
       ↓
File Validation (type, size)
       ↓
Create Preview
       ↓
Send to Hugging Face Vision API
       ↓
Map AI Predictions → App Categories
       ↓
Update Form (category + unit)
       ↓
Show Storage Recommendations
```

**AI Model Used:** `google/vit-base-patch16-224` (Vision Transformer)

### Text Classification Pipeline

```
User Types Item Name (≥3 characters)
       ↓
Extract Keywords
       ↓
Score Against Category Database
       ↓
Calculate Confidence
       ↓
Suggest Category + Unit
       ↓
Auto-Fill Form Fields
```

---

## Category Mapping

### Food Items
**Keywords:** rice, wheat, flour, vegetable, fruit, meal, bread, milk, egg, meat, fish, dal, grain, oil, etc.
- **Unit:** kg (kilograms)
- **Storage:** Store in cool, dry place. Check expiry date.

### Clothing Items
**Keywords:** cloth, shirt, pant, dress, jacket, shoe, sock, sweater, jean, t-shirt, saree, kurta, etc.
- **Unit:** pieces
- **Storage:** Keep clean and dry. Fold or hang properly.

### Educational Items
**Keywords:** book, notebook, pen, pencil, paper, stationery, school supplies, calculator, backpack, etc.
- **Unit:** pieces
- **Storage:** Keep away from moisture and direct sunlight.

### Medical Items
**Keywords:** medicine, tablet, capsule, syrup, bandage, first aid, sanitizer, mask, glove, etc.
- **Unit:** pieces
- **Storage:** Store as per medical guidelines. Check expiry date.

---

## Usage Guide

### For Donors (Add Surplus Page)

#### Method 1: Upload from Gallery
1. Click the **"Upload from Gallery"** button
2. Select an image from your device
3. Wait for AI classification (2-3 seconds)
4. Review suggested category and unit
5. Modify if needed and continue filling the form

#### Method 2: Use Camera (Mobile)
1. Click the **"Capture Photo"** button
2. Take a photo of the item
3. AI automatically classifies the image
4. Review and confirm suggestions
5. Complete the form

#### Method 3: Type Item Name
1. Start typing the item name (e.g., "Rice")
2. After 3+ characters, AI suggests category
3. Category and unit auto-fill
4. Continue with other details

### Visual Indicators

- **🔄 Classifying...**: AI is processing
- **✓ AI Suggestion**: Classification complete
- **✨ Auto-detected**: Category filled from name
- **⚠️ Please Verify**: Low confidence, manual check needed

---

## Implementation Details

### File Structure

```
frontend/src/
├── lib/
│   └── aiClassification.ts    # Core AI service
└── components/
    └── donor/
        └── AddSurplus.tsx     # UI integration
```

### Key Functions

#### `classifyByImage(imageFile: File)`
```typescript
// Sends image to Hugging Face API
// Returns: ClassificationResult with category, confidence, unit, storage tips
```

#### `classifyByText(text: string)`
```typescript
// Analyzes text for keywords
// Returns: ClassificationResult with category, confidence, unit
```

#### `getStorageRecommendations(category: string)`
```typescript
// Returns: Storage guidelines for the category
```

### Data Types

```typescript
interface ClassificationResult {
  category: 'food' | 'clothing' | 'medical' | 'educational' | 'other';
  confidence: number;          // 0 to 1
  suggestedUnit: string;       // kg, pieces, liters, etc.
  description: string;         // Human-readable result
  storageConditions?: string;  // Storage guidelines
}
```

---

## Configuration

### Environment Variables

Add to `frontend/.env`:
```env
# Hugging Face API (Optional - uses public endpoint by default)
VITE_HUGGING_FACE_API_KEY=your_api_key_here
```

### File Validation Rules

- **Allowed Types:** image/* (jpg, png, jpeg, webp, etc.)
- **Max Size:** 5 MB
- **Recommendations:** Clear, well-lit photos work best

---

## API Integration

### Hugging Face Vision API

**Endpoint:** `https://api-inference.huggingface.co/models/google/vit-base-patch16-224`

**Request:**
```typescript
POST /models/google/vit-base-patch16-224
Content-Type: application/octet-stream
Body: [image binary data]
```

**Response:**
```json
[
  {
    "label": "banana",
    "score": 0.92
  },
  {
    "label": "fruit",
    "score": 0.85
  }
]
```

---

## Fallback Mechanisms

### 1. Image Classification Fails
- Falls back to filename-based classification
- Searches for keywords in image filename
- Shows notification to user

### 2. Text Classification - No Match
- Returns category: "other"
- Prompts user to select manually
- Confidence: 0

### 3. API Unavailable
- Uses local keyword matching only
- Works offline
- Shows "AI classification unavailable" message

---

## Performance Optimization

### Image Upload
- Client-side file validation (instant)
- Preview generation while classifying
- Non-blocking UI updates

### Text Classification
- Debounced on input (waits for 3+ characters)
- Instant keyword matching (no API call)
- Cached results for repeated searches

### API Calls
- Single request per image
- Timeout: 10 seconds
- Retry logic: 1 attempt

---

## User Experience Features

### Loading States
- **Spinner** during image classification
- **"AI Classifying..."** overlay on preview
- **Disabled inputs** during processing

### Feedback Messages
- **Success toast:** Classification complete with details
- **Info toast:** Auto-detected category from name
- **Warning toast:** Low confidence, verify manually
- **Error toast:** File validation failures

### Visual Design
- **AI suggestion card** with Sparkles icon
- **Image preview** with remove button
- **Dual upload buttons** (gallery + camera)
- **Confidence indicator** (hidden in v1, ready for v2)

---

## Testing Guide

### Test Scenarios

#### 1. Food Item Classification
- **Upload Image:** Photo of fruits, vegetables, grains
- **Expected:** Category: Food, Unit: kg
- **Type Name:** "Rice bags", "Fresh tomatoes"
- **Expected:** Auto-detects Food

#### 2. Clothing Item Classification
- **Upload Image:** Photo of shirts, pants, shoes
- **Expected:** Category: Clothing, Unit: pieces
- **Type Name:** "Winter jackets", "School uniforms"
- **Expected:** Auto-detects Clothing

#### 3. Educational Item Classification
- **Upload Image:** Photo of books, notebooks, pens
- **Expected:** Category: Educational, Unit: pieces
- **Type Name:** "Textbooks", "Stationery kit"
- **Expected:** Auto-detects Educational

#### 4. Medical Item Classification
- **Upload Image:** Photo of medicine, masks, first aid
- **Expected:** Category: Medical, Unit: pieces
- **Type Name:** "Hand sanitizer", "Face masks"
- **Expected:** Auto-detects Medical

#### 5. Edge Cases
- **Upload huge file (>5MB):** Error toast, file rejected
- **Upload non-image file:** Error toast, validation fails
- **Type gibberish:** Category: other, manual selection needed
- **API down:** Fallback to filename/keyword matching

---

## Future Enhancements

### Phase 2 Features (Planned)

1. **Expiry Date Prediction**
   - Suggest expiry dates for food items
   - Based on item type and AI analysis

2. **Confidence Score Display**
   - Show confidence percentage
   - Color-coded indicators (high/medium/low)

3. **Multi-Language Support**
   - Hindi, Tamil, Telugu keyword databases
   - Regional food item names

4. **Batch Classification**
   - Upload multiple images at once
   - Bulk category assignment

5. **User Feedback Loop**
   - "Was this classification correct?"
   - Machine learning improvement from corrections

6. **Advanced AI Models**
   - Custom-trained model on Indian food/clothing
   - Better accuracy for regional items

---

## Troubleshooting

### Issue: Classification Always Returns "other"
**Solution:** Check if keywords are present in item name. Try more descriptive names.

### Issue: Image upload fails
**Solution:** 
- Verify file size < 5MB
- Check file type is image/*
- Ensure stable internet connection

### Issue: Camera not opening
**Solution:**
- Grant camera permissions in browser
- Use HTTPS (camera requires secure context)
- Try "Upload from Gallery" as alternative

### Issue: Slow classification
**Solution:**
- Compress images before upload
- Check internet speed
- Hugging Face API may be rate-limited (wait 10s)

---

## Developer Notes

### Adding New Categories

1. Update `categoryKeywords` in `aiClassification.ts`
2. Add mapping logic in `classifyByImage()`
3. Update type definitions for `ClassificationResult`
4. Add category option in `AddSurplus.tsx` Select dropdown

### Customizing AI Model

Replace in `aiClassification.ts`:
```typescript
const API_URL = 'https://api-inference.huggingface.co/models/YOUR_MODEL_HERE';
```

### Monitoring API Usage

Check Hugging Face dashboard for:
- Request count
- Rate limits
- Model availability

---

## Support

For issues or feature requests:
- **GitHub Issues:** [Your repo URL]
- **Email:** support@surplusspark.org
- **Documentation:** This file + inline code comments

---

## Credits

- **AI Model:** Google Vision Transformer (ViT-base-patch16-224)
- **API Provider:** Hugging Face Inference API
- **Implementation:** Surplus Spark Network Team
- **License:** MIT (Check individual component licenses)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready
