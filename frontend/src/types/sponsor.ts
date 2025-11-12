// Sponsor types and interfaces

export type SponsorType = 'corporate' | 'delivery' | 'coupon';

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  type: SponsorType;
  description: string;
  website?: string;
  active: boolean;
  featured?: boolean;
}

export interface SponsorshipBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface SponsorshipTier {
  type: SponsorType;
  title: string;
  subtitle: string;
  benefits: SponsorshipBenefit[];
  ctaText: string;
}
