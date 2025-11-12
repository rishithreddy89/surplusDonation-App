import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([
    { text: "Hello! I'm your ShareGood donation assistant. I can help you with donating surplus items, tracking donations, understanding food freshness, and navigating the platform. What would you like to know?", sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string, conversationHistory: Array<{ text: string; sender: 'user' | 'bot' }>): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)$/)) {
      return "Hello! 👋 I'm here to help you make a positive impact through donations. You can ask me about:\n\n• How to donate surplus items\n• Food freshness and storage tips\n• Tracking your donations\n• Viewing your impact\n• Platform features\n\nWhat interests you?";
    }
    
    // Check for gratitude
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! 😊 It's wonderful to see people like you making a difference. Is there anything else you'd like to know about donating or using ShareGood?";
    }
    
    // Food freshness queries - detailed responses
    if (lowerMessage.includes('apple')) {
      return "🍎 Apples are quite resilient! Here's what you should know:\n\n• Room temperature: 5-7 days\n• Refrigerator: 4-6 weeks\n• Freezer (sliced): up to 8 months\n\nTip: Store apples away from other fruits as they release ethylene gas. If you have surplus apples, they're perfect for donation! Click 'Add Surplus' to list them and help those in need.";
    }
    
    if (lowerMessage.includes('banana')) {
      return "🍌 Bananas have varying shelf life:\n\n• Green bananas: 5-7 days to ripen\n• Ripe bananas: 2-3 days\n• Refrigerated: up to a week (skin darkens but fruit stays fresh)\n\nDonation tip: NGOs love bananas as they're nutritious and filling! List them in 'Add Surplus' if you have extras.";
    }
    
    if (lowerMessage.match(/vegetable|veggie|carrot|tomato|lettuce|spinach/)) {
      return "🥬 Vegetables vary in freshness:\n\n• Leafy greens: 3-5 days\n• Root vegetables: 1-2 weeks\n• Tomatoes: 5-7 days\n• Carrots: 3-4 weeks\n\nStorage tip: Keep vegetables in the crisper drawer. Have surplus? Fresh vegetables are highly needed by NGOs. Go to 'Add Surplus' to donate!";
    }
    
    if (lowerMessage.match(/bread|bakery|baked goods/)) {
      return "🍞 Baked goods shelf life:\n\n• Room temperature: 2-3 days\n• Refrigerated: 5-7 days\n• Frozen: up to 3 months\n\nFun fact: Day-old bread makes excellent donations! Many shelters and food banks need baked goods. List them in 'Add Surplus' today!";
    }
    
    if (lowerMessage.match(/dairy|milk|cheese|yogurt/)) {
      return "🥛 Dairy product freshness:\n\n• Milk: 5-7 days (refrigerated)\n• Yogurt: 1-2 weeks\n• Hard cheese: 3-4 weeks\n• Soft cheese: 1 week\n\nImportant: Always check expiry dates before donating. Unopened dairy products are great for donation through our platform!";
    }
    
    if (lowerMessage.match(/rice|grain|pasta|dry food/)) {
      return "🌾 Dry foods last longer:\n\n• Rice: 1-2 years (uncooked)\n• Pasta: 1-2 years\n• Canned goods: 1-5 years\n\nThese are perfect for donation! They have long shelf lives and are staple foods. Use 'Add Surplus' to share your extras with those who need them.";
    }
    
    if (lowerMessage.match(/fresh|expir|shelf life|how long/)) {
      return "Food freshness depends on the item type:\n\n• Produce: 3-7 days typically\n• Dairy: 5-14 days\n• Dry goods: months to years\n• Frozen items: 3-12 months\n\nWhen donating, always include the best-before date. This helps NGOs plan distribution effectively. Would you like specific information about any food item?";
    }
    
    // Donation process queries
    if (lowerMessage.match(/how.*donate|how.*add|donate.*how/)) {
      return "Donating is easy! Here's how:\n\n1️⃣ Click 'Add Surplus' in the sidebar\n2️⃣ Fill in item details (type, quantity, condition)\n3️⃣ Add photos and expiry date\n4️⃣ Submit and wait for NGO requests\n5️⃣ Get notified when an NGO needs your items\n6️⃣ Coordinate pickup\n\nYou'll be able to track everything through our platform. Ready to make an impact?";
    }
    
    if (lowerMessage.match(/track|status|where.*donation/)) {
      return "Tracking your donations is simple:\n\n🔍 Go to 'Track Donation' section\n📱 Scan the QR code or enter tracking ID\n📊 See real-time status updates\n🚚 Monitor pickup and delivery\n✅ Confirm receipt\n\nYou'll receive notifications at each stage. Want to track a specific donation now?";
    }
    
    if (lowerMessage.match(/impact|contribution|help|difference/)) {
      return "Your impact matters! 📊\n\nIn your Impact dashboard, you can see:\n\n• Total items donated\n• People helped\n• Equivalent meals provided\n• CO2 emissions saved\n• Your community ranking\n\nEvery donation creates a ripple effect of positive change. Check your 'Impact' section to see your contribution!";
    }
    
    if (lowerMessage.match(/leaderboard|ranking|top donor/)) {
      return "The Leaderboard celebrates our community heroes! 🏆\n\nYou can view:\n\n• Top donors this month\n• Your ranking\n• Total community impact\n• Trending donors\n• Achievement badges\n\nFriendly competition encourages more giving! Check the 'Leaderboard' to see where you stand.";
    }
    
    if (lowerMessage.match(/ngo|organization|charity|who.*receive/)) {
      return "NGOs are our partners in making a difference! 🤝\n\nHow it works:\n\n• Verified NGOs browse available surplus\n• They request items they need\n• You get notified of requests\n• You approve the request\n• Logistics handles pickup and delivery\n\nAll NGOs on our platform are verified to ensure your donations reach those who truly need them. Want to see which NGOs operate in your area?";
    }
    
    if (lowerMessage.match(/pickup|deliver|logistics|transport/)) {
      return "We handle the logistics! 🚚\n\nHere's the process:\n\n1️⃣ After you approve an NGO request\n2️⃣ Logistics partners are notified\n3️⃣ They coordinate pickup time with you\n4️⃣ Items are picked up from your location\n5️⃣ Delivered safely to the NGO\n6️⃣ You receive confirmation\n\nYou can track the entire journey in real-time. No hassle for you!";
    }
    
    if (lowerMessage.match(/what.*donate|type.*item|can i donate/)) {
      return "You can donate various items! 📦\n\n✅ Food items (fresh, packaged, cooked)\n✅ Clothing and textiles\n✅ Medical supplies\n✅ School supplies\n✅ Household items\n✅ Hygiene products\n\n⚠️ Please ensure:\n• Items are in good condition\n• Food is within expiry date\n• Medicines are unexpired and sealed\n\nWhat type of item are you thinking of donating?";
    }
    
    if (lowerMessage.match(/profile|account|settings/)) {
      return "Your profile is your donation hub! 👤\n\nIn the Profile section:\n\n• View your donation history\n• Update contact information\n• Set donation preferences\n• Manage notifications\n• See your achievements\n\nKeeping your profile updated helps us serve you better. Need help with profile settings?";
    }
    
    // Contextual help based on previous conversation
    if (lowerMessage.match(/yes|sure|okay|please|tell me more/)) {
      return "Great! I'm happy to help further. You can ask me about:\n\n• Specific food items and their freshness\n• Step-by-step donation process\n• How to maximize your impact\n• Understanding platform features\n• Any technical questions\n\nWhat would you like to explore?";
    }
    
    if (lowerMessage.match(/no|not now|maybe later/)) {
      return "No problem! I'm here whenever you need help. Feel free to reach out anytime with questions about donations, the platform, or making an impact. Have a wonderful day! 😊";
    }
    
    // Emergency/urgent queries
    if (lowerMessage.match(/urgent|emergency|quick|asap|now/)) {
      return "For urgent donations:\n\n⚡ Mark your surplus as 'Urgent' when adding\n⚡ NGOs prioritize urgent requests\n⚡ Faster matching and pickup\n⚡ Real-time notifications\n\nPerishable items? Set them as urgent to ensure they reach people quickly before expiring. Add them in 'Add Surplus' now!";
    }
    
    // Questions about the platform
    if (lowerMessage.match(/what.*sharegood|about.*platform|how.*work/)) {
      return "ShareGood connects generous donors like you with those in need! 🌟\n\nWe're a platform that:\n\n• Reduces food waste\n• Helps communities\n• Makes donation simple\n• Tracks impact\n• Connects donors, NGOs, and logistics\n\nOur mission: Ensure no surplus goes to waste while helping those in need. Together, we're building a better community!";
    }
    
    // Default intelligent response
    return "That's an interesting question! While I may not have specific information about that, I'm here to help you with:\n\n💡 Donating surplus items\n💡 Food freshness and storage\n💡 Platform navigation\n💡 Tracking donations\n💡 Understanding your impact\n\nCould you rephrase your question or ask about any of these topics? I'm here to help!";
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMsg = message.trim();
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setMessage('');
    setIsTyping(true);

    // Simulate typing delay for more natural conversation
    setTimeout(() => {
      const botResponse = getBotResponse(userMsg, messages);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '50%',
          backgroundColor: '#0066cc',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,102,204,0.4)'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </Button>
      
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '400px',
          height: '600px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#0066cc',
            color: 'white',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            fontWeight: '600',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <MessageCircle size={20} />
            ShareGood Assistant
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            backgroundColor: '#f9fafb'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'fadeIn 0.3s ease-in'
                }}
              >
                <div style={{
                  padding: '12px 16px',
                  borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: msg.sender === 'user' ? '#0066cc' : 'white',
                  color: msg.sender === 'user' ? 'white' : '#1f2937',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxShadow: msg.sender === 'bot' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px 18px 18px 4px',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  color: '#6b7280'
                }}>
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                style={{ 
                  flex: 1,
                  borderRadius: '20px',
                  paddingLeft: '16px'
                }}
              />
              <Button 
                onClick={handleSendMessage}
                size="icon"
                disabled={!message.trim() || isTyping}
                style={{
                  backgroundColor: '#0066cc',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px'
                }}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
