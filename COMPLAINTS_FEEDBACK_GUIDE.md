# Complaints & Feedback System with AI Content Moderation

## Overview
This feature provides a comprehensive complaints and feedback management system with AI-powered content moderation using Natural Language Processing (NLP) to prevent inappropriate language.

## Features

### 1. **AI Content Moderation**
- **Profanity Detection**: Automatically detects and blocks inappropriate words
- **Leet Speak Detection**: Identifies obfuscated profanity (e.g., "h3ll0" → "hello")
- **Toxicity Scoring**: Calculates toxicity level (0-100) based on language patterns
- **Aggressive Tone Detection**: Identifies excessive caps, punctuation, and aggressive patterns
- **Real-time Validation**: Content is validated before submission

### 2. **Complaint Management System**

#### For All Users (Donor, NGO, Logistics):
- **Submit Complaints** with:
  - Title and detailed description
  - Category (Service, Delivery, Quality, Behavior, Technical, Other)
  - Priority levels (Low, Medium, High, Critical)
  - Up to 5 proof URLs (screenshots, documents, images)
  - Optional relation to specific items/tasks
- **Track Complaints**:
  - View all submitted complaints
  - Real-time status updates (Pending, In Progress, Resolved, Closed)
  - Filter by status and category
  - See admin responses
- **Proof Attachments**: Add evidence URLs to support complaints

#### For Admin:
- **Centralized Dashboard**:
  - View all complaints from all users
  - Filter by status, priority, category, and user role
  - Statistical overview (total, pending, resolved, resolution rate)
- **Complaint Management**:
  - Review complaint details and evidence
  - Add admin responses
  - Update status (Pending → In Progress → Resolved → Closed)
  - Track resolution metrics

### 3. **Feedback System**

#### For All Users:
- **Share Feedback** with:
  - Type (General, Feature Request, Improvement, Appreciation, Bug Report)
  - Star rating (1-5 stars)
  - Title and detailed description
  - Optional proof URLs
  - Choose visibility (Public/Private)
- **View Feedback History**:
  - All submitted feedback with ratings
  - Admin notes and review status
  - Filter by type
  - See helpful votes on public feedback

#### For Admin:
- **Feedback Analytics**:
  - Total feedback count
  - Average rating across all feedback
  - Breakdown by type and rating
  - Unreviewed feedback count
- **Review Management**:
  - Add internal admin notes
  - Mark as reviewed
  - Filter by type, rating, and review status

### 4. **Content Moderation Engine**

#### Detection Capabilities:
```typescript
// Profanity List (extensible)
- Common inappropriate words
- Variations and misspellings
- Leet speak conversions (4→a, @→a, 3→e, etc.)

// Pattern Detection
- Aggressive patterns (kill, hate, etc. with repeated chars)
- All caps detection
- Excessive punctuation
```

#### Moderation Process:
1. **Normalize Text**: Convert leet speak and remove special characters
2. **Check Profanity List**: Match against comprehensive word list
3. **Pattern Analysis**: Check for aggressive patterns
4. **Toxicity Scoring**: Calculate overall toxicity score
5. **Rejection**: Block submission if inappropriate content detected
6. **User Feedback**: Provide specific error messages

#### Example Usage:
```typescript
import { moderateContent } from '@/utils/contentModeration';

const result = moderateContent(userInput);

if (!result.isClean) {
  // Block submission
  return {
    success: false,
    message: result.message,
    inappropriateWords: result.inappropriateWords
  };
}
```

## API Endpoints

### Complaints API
```
POST   /api/complaints              - Submit a complaint
GET    /api/complaints/my-complaints - Get user's complaints
GET    /api/complaints/all          - Get all complaints (Admin)
PUT    /api/complaints/:id/status   - Update complaint status (Admin)
GET    /api/complaints/stats        - Get complaint statistics (Admin)
```

### Feedback API
```
POST   /api/feedback                - Submit feedback
GET    /api/feedback/my-feedback    - Get user's feedback
GET    /api/feedback/all            - Get all feedback (Admin)
GET    /api/feedback/public         - Get public feedback (All users)
PUT    /api/feedback/:id/helpful    - Mark feedback as helpful
PUT    /api/feedback/:id/review     - Review feedback (Admin)
GET    /api/feedback/stats          - Get feedback statistics (Admin)
```

## User Interface

### Navigation
- **All Users**: Support Center menu item in dashboard sidebar
- **Admin**: Complaints & Feedback menu item for management dashboard

### Complaint Submission Flow
1. Click "Submit Complaint" button
2. Fill in complaint details (all fields validated for inappropriate content)
3. Select category and priority
4. Optionally add proof URLs
5. Submit (content is moderated in real-time)
6. Receive confirmation or content warning

### Feedback Submission Flow
1. Click "Share Feedback" button
2. Select feedback type
3. Rate experience (1-5 stars)
4. Write title and description
5. Optionally add supporting materials
6. Choose visibility (Public/Private)
7. Submit (content is moderated)

### Admin Management Interface
1. **Dashboard Overview**:
   - Key metrics cards (total, pending, resolved, average rating)
   - Quick filters for status and priority
2. **Complaint Management**:
   - List view with status badges
   - Click "Manage" to view details
   - Add response and update status
   - View proof evidence
3. **Feedback Management**:
   - List view with star ratings
   - Filter by type and rating
   - Click "Review" to add notes
   - Mark as reviewed

## Database Models

### Complaint Model
```typescript
{
  userId: ObjectId,
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin',
  title: string,
  description: string,
  category: 'service' | 'delivery' | 'quality' | 'behavior' | 'technical' | 'other',
  priority: 'low' | 'medium' | 'high' | 'critical',
  status: 'pending' | 'in-progress' | 'resolved' | 'closed',
  relatedTo: { type, id }, // Optional
  proofUrls: string[],
  adminResponse: string,
  adminId: ObjectId,
  resolvedAt: Date,
  timestamps: true
}
```

### Feedback Model
```typescript
{
  userId: ObjectId,
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin',
  type: 'general' | 'feature-request' | 'improvement' | 'appreciation' | 'bug-report',
  rating: number, // 1-5
  title: string,
  description: string,
  relatedTo: { type, id }, // Optional
  proofUrls: string[],
  isPublic: boolean,
  helpful: number,
  adminReviewed: boolean,
  adminNotes: string,
  timestamps: true
}
```

## Security Features

### Content Moderation
- All user-generated content (title, description, responses) is moderated
- Both backend and frontend validation
- Extensible profanity list
- Pattern-based detection for variations

### Access Control
- Users can only view their own complaints/feedback
- Admins have full access to all submissions
- Update permissions restricted to admins
- Proper authentication checks on all endpoints

### Data Validation
- Input length limits (title: 200 chars, description: 2000 chars)
- URL validation for proof attachments
- Required field validation
- Type checking on all inputs

## Usage Examples

### Submitting a Complaint
```tsx
import SubmitComplaint from '@/components/ui/SubmitComplaint';

// Basic usage
<SubmitComplaint onSuccess={() => refetch()} />

// With context (related to specific item)
<SubmitComplaint
  relatedTo={{
    type: 'surplus',
    id: surplusItemId
  }}
  onSuccess={() => refetch()}
/>

// Custom trigger
<SubmitComplaint
  trigger={
    <Button variant="destructive">Report Issue</Button>
  }
  onSuccess={() => refetch()}
/>
```

### Submitting Feedback
```tsx
import SubmitFeedback from '@/components/ui/SubmitFeedback';

// Basic usage
<SubmitFeedback onSuccess={() => refetch()} />

// With context
<SubmitFeedback
  relatedTo={{
    type: 'delivery',
    id: deliveryId
  }}
  onSuccess={() => refetch()}
/>
```

### Admin Management
```tsx
import ComplaintsManagement from '@/components/admin/ComplaintsManagement';

// In admin routes
<Route path="complaints" element={<ComplaintsManagement />} />
```

## Best Practices

### For Users
1. **Be Specific**: Provide detailed descriptions
2. **Add Evidence**: Include proof URLs when possible
3. **Choose Correct Category**: Helps with faster resolution
4. **Use Appropriate Language**: System will reject inappropriate content
5. **Follow Up**: Check status updates regularly

### For Admins
1. **Timely Responses**: Address complaints promptly
2. **Clear Communication**: Provide detailed responses
3. **Proper Categorization**: Review priority levels
4. **Track Metrics**: Monitor resolution rates
5. **Review Feedback**: Extract valuable insights

## Extension Points

### Adding New Profanity Words
Edit `backend/src/utils/contentModeration.ts`:
```typescript
const profanityList = [
  // Add new words here
  'newword1', 'newword2'
];
```

### Custom Toxicity Rules
Modify `calculateToxicityScore()` function to add custom scoring rules

### New Complaint Categories
Update models and UI select options:
```typescript
// In Complaint.ts model
category: {
  type: String,
  enum: ['service', 'delivery', 'quality', 'behavior', 'technical', 'other', 'new-category']
}
```

### New Feedback Types
Update Feedback model enum values similarly

## Performance Considerations

- **Indexing**: MongoDB indexes on userId, status, priority for fast queries
- **Pagination**: Limit returned results (currently showing all, consider pagination for large datasets)
- **Caching**: Consider caching public feedback
- **Real-time Updates**: Use WebSockets for live status updates (future enhancement)

## Future Enhancements

1. **Advanced NLP**: Integrate with ML models for better sentiment analysis
2. **Automated Routing**: Auto-assign complaints to appropriate departments
3. **Email Notifications**: Notify users of status changes
4. **Analytics Dashboard**: Trend analysis and insights
5. **Multi-language Support**: Content moderation in multiple languages
6. **Image Upload**: Direct image upload instead of URLs
7. **Reply Threading**: Allow conversation threads on complaints
8. **SLA Tracking**: Track response time and resolution time
9. **Export Reports**: Export complaints/feedback data

## Troubleshooting

### Content Blocked Incorrectly
- Review profanity list for false positives
- Adjust toxicity score threshold
- Consider context-aware detection

### Missing Complaints/Feedback
- Check authentication token
- Verify API endpoints are accessible
- Check MongoDB indexes
- Review error logs

### Performance Issues
- Implement pagination
- Add database indexes
- Consider caching strategies
- Monitor API response times

## Support

For issues or questions:
1. Check system logs: `/dashboard/admin/logs`
2. Review complaint statistics: `/dashboard/admin/complaints`
3. Contact development team for technical issues
