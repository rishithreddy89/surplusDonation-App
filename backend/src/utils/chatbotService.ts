import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const SYSTEM_PROMPT = `You are a helpful AI assistant for the Surplus Spark Network, a platform that connects food donors with NGOs and people in need. Your role is to help donors with:

1. **Donation Process**: Guide users on how to donate surplus food, clothing, medical supplies, educational materials, etc.
2. **Platform Navigation**: Help users understand how to use the platform features
3. **Impact Tracking**: Explain how they can track their donation impact
4. **Best Practices**: Provide tips on food safety, packaging, and donation timing
5. **Categories**: Food, Clothing, Medical, Educational, and Other supplies

Key Platform Features:
- Donors can list surplus items with details (quantity, expiry, location)
- NGOs can claim available surplus items
- Logistics partners handle pickup and delivery
- Real-time tracking of donations
- Impact dashboard showing lives helped
- Leaderboard for top donors
- Aadhaar verification for trust and security

Important Guidelines:
- Be helpful, friendly, and encouraging
- Prioritize food safety and timely donations
- Encourage regular donation habits
- Explain the social impact of donations
- Keep responses concise but informative
- If asked about technical issues, guide users to contact support

You should NOT:
- Provide medical or legal advice
- Make promises about specific NGOs or outcomes
- Share personal information
- Handle financial transactions
- Make political or religious statements

Always maintain a positive, supportive tone and celebrate the donor's contribution to reducing waste and helping those in need.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const getChatbotResponse = async (
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return getFallbackResponse(userMessage);
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('Chatbot error:', error.message);
    return getFallbackResponse(userMessage);
  }
};

// Fallback responses when OpenAI is not configured
const getFallbackResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('donate') || lowerMessage.includes('how to')) {
    return `To donate surplus items:
1. Click "Add Donation" button
2. Fill in item details (title, category, quantity)
3. Add location and expiry date if applicable
4. Submit and wait for NGO claims
5. Track your donation impact on the dashboard

Categories: Food, Clothing, Medical, Educational, Other`;
  }

  if (lowerMessage.includes('track') || lowerMessage.includes('impact')) {
    return `You can track your donation impact through:
- Impact Dashboard: See total donations, items donated, and lives helped
- Tracking Page: View real-time status of each donation
- Leaderboard: Compare your impact with other donors

Every donation makes a difference! 🌟`;
  }

  if (lowerMessage.includes('verify') || lowerMessage.includes('aadhaar')) {
    return `Aadhaar verification ensures trust and security:
- Required for all donors before first donation
- One-time OTP verification process
- Your Aadhaar is securely hashed and masked
- Helps prevent fraud and builds NGO trust

Complete verification from your Profile page.`;
  }

  if (lowerMessage.includes('food') || lowerMessage.includes('expiry')) {
    return `Food Donation Guidelines:
✅ Check expiry dates - donate before expiration
✅ Pack items properly to maintain freshness
✅ Mention any allergens or dietary info
✅ Specify storage requirements (refrigerated, frozen, etc.)
✅ Donate fresh produce within 24-48 hours

Help reduce food waste while feeding those in need! 🍽️`;
  }

  if (lowerMessage.includes('ngo') || lowerMessage.includes('claim')) {
    return `When you list a donation:
1. NGOs in your area receive notifications
2. Interested NGOs can claim your donation
3. You receive a notification for approval
4. Accept the request you prefer
5. Logistics partner coordinates pickup
6. NGO confirms receipt upon delivery

Your generosity directly helps communities! 💚`;
  }

  return `Welcome to Surplus Spark Network! I'm here to help you make impactful donations.

Common questions I can help with:
📦 How to donate surplus items
📊 Tracking your donation impact
✅ Aadhaar verification process
🍽️ Food donation guidelines
🏢 How NGOs claim donations
🏆 Leaderboard and achievements

What would you like to know?`;
};

export const getSuggestedQuestions = (): string[] => {
  return [
    'How do I donate surplus food?',
    'What categories can I donate?',
    'How do I track my donation impact?',
    'What are food safety guidelines?',
    'How does Aadhaar verification work?',
    'How do NGOs claim my donations?',
  ];
};
