import { Sponsor, SponsorshipTier } from '@/types/sponsor';

// Mock sponsors data - can be replaced with API calls later
export const mockSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'TechCorp India',
    logo: 'https://via.placeholder.com/150x60/4F46E5/FFFFFF?text=TechCorp',
    type: 'corporate',
    description: 'Leading technology company supporting food security',
    website: 'https://example.com',
    active: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Green Logistics',
    logo: 'https://via.placeholder.com/150x60/10B981/FFFFFF?text=GreenLog',
    type: 'delivery',
    description: 'Eco-friendly delivery partner',
    website: 'https://example.com',
    active: true,
    featured: true,
  },
  {
    id: '3',
    name: 'RewardsMart',
    logo: 'https://via.placeholder.com/150x60/F59E0B/FFFFFF?text=RewardsMart',
    type: 'coupon',
    description: 'Providing exclusive coupons for volunteers',
    website: 'https://example.com',
    active: true,
    featured: true,
  },
];

export const sponsorshipTiers: SponsorshipTier[] = [
  {
    type: 'corporate',
    title: 'Corporate Sponsorships & CSR Partners',
    subtitle: 'Build your brand while making a social impact',
    benefits: [
      {
        title: 'Homepage Banner Visibility',
        description: 'Your logo featured prominently on our homepage banner',
        icon: 'Award',
      },
      {
        title: 'About Section Recognition',
        description: 'Featured in our about section and partner showcase',
        icon: 'Building',
      },
      {
        title: 'Donation Card Branding',
        description: 'Display "Powered by [Your Brand]" on donation cards',
        icon: 'Tag',
      },
      {
        title: 'CSR Impact Reports',
        description: 'Detailed quarterly reports showcasing your social impact',
        icon: 'FileText',
      },
      {
        title: 'Media Coverage',
        description: 'Joint press releases and social media mentions',
        icon: 'Megaphone',
      },
    ],
    ctaText: 'Become a Corporate Partner',
  },
  {
    type: 'delivery',
    title: 'Delivery Sponsors (Logistics Partners)',
    subtitle: 'Support transportation and last-mile delivery',
    benefits: [
      {
        title: 'Dashboard Branding',
        description: 'Logo displayed on volunteer and logistics dashboards',
        icon: 'Truck',
      },
      {
        title: 'Sponsored Delivery Tags',
        description: 'All deliveries tagged as "Sponsored by [Your Brand]"',
        icon: 'Package',
      },
      {
        title: 'Route Optimization Access',
        description: 'Utilize our platform for efficient delivery management',
        icon: 'Map',
      },
      {
        title: 'Priority Support',
        description: 'Dedicated support for logistics coordination',
        icon: 'Headphones',
      },
      {
        title: 'Performance Analytics',
        description: 'Track your sponsored deliveries and impact metrics',
        icon: 'BarChart',
      },
    ],
    ctaText: 'Sponsor Deliveries',
  },
  {
    type: 'coupon',
    title: 'Coupon & Reward Sponsors',
    subtitle: 'Reward volunteers with exclusive offers',
    benefits: [
      {
        title: 'Rewards Dashboard Display',
        description: 'Your brand featured in the volunteer rewards section',
        icon: 'Gift',
      },
      {
        title: 'Social Share Integration',
        description: 'Brand visibility on social media share cards',
        icon: 'Share2',
      },
      {
        title: 'Exclusive Offers Platform',
        description: 'Distribute coupons directly to active volunteers',
        icon: 'Ticket',
      },
      {
        title: 'Volunteer Engagement',
        description: 'Connect with motivated, socially-conscious audience',
        icon: 'Users',
      },
      {
        title: 'Redemption Analytics',
        description: 'Track coupon usage and customer acquisition',
        icon: 'TrendingUp',
      },
    ],
    ctaText: 'Provide Rewards',
  },
];

// Helper functions
export const getSponsorsByType = (type: string) => {
  return mockSponsors.filter((sponsor) => sponsor.type === type && sponsor.active);
};

export const getFeaturedSponsors = () => {
  return mockSponsors.filter((sponsor) => sponsor.featured && sponsor.active);
};

export const getCorporateSponsors = () => getSponsorsByType('corporate');
export const getDeliverySponsors = () => getSponsorsByType('delivery');
export const getCouponSponsors = () => getSponsorsByType('coupon');
