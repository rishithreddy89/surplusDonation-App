# Complaints & Feedback System - Quick Start

## ✅ Implementation Complete!

### What's Been Added

#### 1. **Backend Implementation**
- ✅ **Models**: Complaint.ts, Feedback.ts with full schema
- ✅ **Controllers**: complaintController.ts, feedbackController.ts with CRUD operations
- ✅ **Routes**: complaintRoutes.ts, feedbackRoutes.ts with authentication
- ✅ **AI Content Moderation**: contentModeration.ts with NLP-based profanity detection
- ✅ **Server Integration**: All routes registered in server.ts

#### 2. **Frontend Implementation**
- ✅ **API Functions**: Complete API client in lib/api.ts
- ✅ **UI Components**:
  - `SubmitComplaint.tsx` - Universal complaint submission dialog
  - `SubmitFeedback.tsx` - Universal feedback submission dialog
  - `SupportCenter.tsx` - User-facing support center page
  - `ComplaintsManagement.tsx` - Admin management dashboard
- ✅ **Routes**: Added to all dashboard types (Donor, NGO, Logistics, Admin)
- ✅ **Navigation**: Support Center links added to all sidebar menus

### Features Overview

#### For All Users (Donor, NGO, Logistics)
- 📝 Submit complaints with proof attachments
- ⭐ Share feedback with ratings (1-5 stars)
- 📊 Track status of submissions
- 🔍 Filter and search submissions
- 💬 View admin responses

#### For Admins
- 📈 View statistics and metrics
- 🔧 Manage all complaints and feedback
- ✅ Update complaint status
- 💬 Add responses and notes
- 📊 Filter by multiple criteria

#### AI Content Moderation
- 🚫 Blocks profanity and inappropriate language
- 🔍 Detects leet speak obfuscation
- 📈 Calculates toxicity scores
- ⚠️ Provides user-friendly error messages
- ✨ Real-time validation

### How to Access

#### Users:
1. Navigate to your dashboard
2. Click **"Support Center"** in the sidebar
3. Click **"Submit Complaint"** or **"Share Feedback"**
4. Fill in the form (content will be automatically moderated)
5. Track your submissions in the tabs

#### Admin:
1. Navigate to admin dashboard
2. Click **"Complaints & Feedback"** in the sidebar
3. View overview statistics
4. Switch between Complaints and Feedback tabs
5. Click **"Manage"** or **"Review"** to take action
6. Add responses and update status

### Quick Examples

#### Submit Complaint Button Anywhere:
```tsx
import SubmitComplaint from '@/components/ui/SubmitComplaint';

<SubmitComplaint
  relatedTo={{ type: 'surplus', id: itemId }}
  onSuccess={() => refetch()}
/>
```

#### Submit Feedback Button:
```tsx
import SubmitFeedback from '@/components/ui/SubmitFeedback';

<SubmitFeedback
  relatedTo={{ type: 'delivery', id: deliveryId }}
  onSuccess={() => refetch()}
/>
```

### Content Moderation Examples

#### ✅ Allowed:
- "The service was excellent and very professional"
- "I had a great experience with the delivery"
- "This could be improved by adding more features"

#### ❌ Blocked:
- Any profanity or inappropriate language
- Aggressive or abusive content
- Leet speak variations of banned words
- Content with high toxicity scores

### API Endpoints Available

#### Complaints:
- `POST /api/complaints` - Submit complaint
- `GET /api/complaints/my-complaints` - Get user complaints
- `GET /api/complaints/all` - Get all (Admin)
- `PUT /api/complaints/:id/status` - Update status (Admin)
- `GET /api/complaints/stats` - Get statistics (Admin)

#### Feedback:
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback/my-feedback` - Get user feedback
- `GET /api/feedback/all` - Get all (Admin)
- `GET /api/feedback/public` - Get public feedback
- `PUT /api/feedback/:id/helpful` - Mark helpful
- `PUT /api/feedback/:id/review` - Review (Admin)
- `GET /api/feedback/stats` - Get statistics (Admin)

### Next Steps to Deploy

1. **Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**: MongoDB will automatically create collections on first use

4. **Test the Feature**:
   - Login as any user role
   - Go to Support Center
   - Submit a complaint/feedback
   - Login as admin
   - View and manage submissions

### Files Created/Modified

#### Backend:
- ✅ `src/models/Complaint.ts` (NEW)
- ✅ `src/models/Feedback.ts` (NEW)
- ✅ `src/utils/contentModeration.ts` (NEW)
- ✅ `src/controllers/complaintController.ts` (NEW)
- ✅ `src/controllers/feedbackController.ts` (NEW)
- ✅ `src/routes/complaintRoutes.ts` (NEW)
- ✅ `src/routes/feedbackRoutes.ts` (NEW)
- ✅ `src/server.ts` (MODIFIED - added routes)

#### Frontend:
- ✅ `src/lib/api.ts` (MODIFIED - added API functions)
- ✅ `src/components/ui/SubmitComplaint.tsx` (NEW)
- ✅ `src/components/ui/SubmitFeedback.tsx` (NEW)
- ✅ `src/components/ui/SupportCenter.tsx` (NEW)
- ✅ `src/components/admin/ComplaintsManagement.tsx` (NEW)
- ✅ `src/components/DashboardLayout.tsx` (MODIFIED - added menu items)
- ✅ `src/pages/dashboards/DonorDashboard.tsx` (MODIFIED - added route)
- ✅ `src/pages/dashboards/NGODashboard.tsx` (MODIFIED - added route)
- ✅ `src/pages/dashboards/LogisticsDashboard.tsx` (MODIFIED - added route)
- ✅ `src/pages/dashboards/AdminDashboard.tsx` (MODIFIED - added route)

#### Documentation:
- ✅ `COMPLAINTS_FEEDBACK_GUIDE.md` (NEW - Full documentation)
- ✅ `COMPLAINTS_FEEDBACK_QUICKSTART.md` (NEW - This file)

### Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend compiles without errors
- [ ] User can submit complaint
- [ ] Content moderation blocks inappropriate words
- [ ] User can submit feedback with rating
- [ ] User can view their submissions
- [ ] Admin can view all complaints/feedback
- [ ] Admin can update complaint status
- [ ] Admin can add responses
- [ ] Statistics display correctly
- [ ] Filters work properly
- [ ] Proof URLs are displayed and clickable

### Troubleshooting

**Backend not starting:**
- Check MongoDB connection
- Verify all dependencies installed
- Check PORT in .env file

**Frontend errors:**
- Clear node_modules and reinstall
- Check API_URL in .env file
- Verify backend is running

**Content not being blocked:**
- Check backend logs
- Review contentModeration.ts
- Verify API responses

**Can't see Support Center:**
- Clear browser cache
- Check user authentication
- Verify route configuration

### Support

For detailed documentation, see: `COMPLAINTS_FEEDBACK_GUIDE.md`

---

**Status**: ✅ **READY FOR TESTING**

All features have been implemented with:
- ✅ AI-powered content moderation
- ✅ Full CRUD operations
- ✅ Role-based access control
- ✅ Proof attachments
- ✅ Real-time filtering
- ✅ Admin management dashboard
- ✅ User-friendly UI
- ✅ Comprehensive documentation
