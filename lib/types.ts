export type Role = "student" | "organization";
export type OpportunityType = "Internship" | "Volunteer" | "Mentorship" | "Community Project";
export type OpportunityFormat = "Remote" | "Hybrid" | "In person";
export type ExperienceLevel = "Beginner" | "Developing" | "Experienced";
export type OpportunityStatus = "open" | "closed";

export interface Account {
  id: string;
  role: Role;
  username: string;
  password: string;
  displayName: string;
  profileId: string;
  createdAt: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  description: string;
  skills: string[];
  hours?: number;
  evidence?: string;
  verification: "self-entered" | "organization-confirmed" | "verified";
}

export interface StudentProfile {
  id: string;
  accountId: string;
  name: string;
  age: number;
  grade: string;
  zip: string;
  city: string;
  travelMiles: number;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  causes: string[];
  strengths: string[];
  growthAreas: string[];
  opportunityTypes: OpportunityType[];
  formats: OpportunityFormat[];
  preferredPaid: "Paid" | "Unpaid" | "Either";
  experienceLevel: ExperienceLevel;
  availableDays: string[];
  weeklyHours: number;
  jummahAvailability: "Available" | "Needs flexibility" | "Not applicable";
  prayerBreaks: boolean;
  prayerSpace: boolean;
  halalFood: boolean;
  urgentOptIn: boolean;
  flexibility: string;
  transportation: string;
  accommodations: string;
  discoverable: boolean;
  guardianApproval: boolean;
  bio: string;
  freeText: string;
  experiences: ExperienceItem[];
  verifiedServiceHours: number;
  lastUpdated: string;
}

export interface SafetySignals {
  adultSupervision: boolean;
  privacyPolicy: boolean;
  accessibility: boolean;
  accommodationClarity: boolean;
  communityTrust: boolean;
  missionAlignment: boolean;
}

export interface Opportunity {
  id: string;
  orgId: string;
  orgName: string;
  title: string;
  type: OpportunityType;
  description: string;
  skills: string[];
  interests: string[];
  careerGoals: string[];
  location: string;
  zip: string;
  latitude: number;
  longitude: number;
  distanceMiles: number;
  format: OpportunityFormat;
  availableDays: string[];
  commitment: string;
  weeklyHours: number;
  ageMin: number;
  ageMax: number;
  experienceLevel: ExperienceLevel;
  deadline: string;
  createdAt: string;
  paid: boolean;
  compensation: string;
  urgent: boolean;
  prayerBreaks: boolean;
  prayerSpace: boolean;
  halalFood: boolean;
  jummahCompatible: boolean;
  supervision: string;
  applicationSteps: string;
  impact: string;
  verified: boolean;
  status: OpportunityStatus;
  confidence: number;
  missingFields: string[];
  safetySignals: SafetySignals;
}

export interface OrganizationProfile {
  id: string;
  accountId: string;
  name: string;
  website: string;
  email: string;
  mission: string;
  programs: string[];
  audience: string[];
  location: string;
  contactName: string;
  phone: string;
  youthSafety: string;
  privacyStandards: string;
  accommodations: string;
  verified: boolean;
  lastUpdated: string;
}

export interface InterestRecord {
  id: string;
  studentId: string;
  opportunityId: string;
  organizationId: string;
  createdAt: string;
  status: "interested" | "introduction-requested" | "approved" | "declined";
}

export interface Message {
  id: string;
  conversationId: string;
  senderRole: Role;
  senderLabel: string;
  text: string;
  createdAt: string;
  moderation: "clear" | "flagged";
}

export interface Conversation {
  id: string;
  opportunityId: string;
  studentId: string;
  organizationId: string;
  studentInitiated: boolean;
  introductionStatus: "controlled" | "requested" | "approved";
  messages: Message[];
}

export interface OutreachLead {
  id: string;
  businessName: string;
  website: string;
  email: string;
  status: "draft" | "researching" | "needs-review" | "confirmed";
  researchDraft?: Partial<OrganizationProfile> & {
    missingFields?: string[];
    confidence?: number;
    sourceNotes?: string[];
  };
}

export interface MatchBreakdown {
  interests: number;
  skills: number;
  careerGoals: number;
  availability: number;
  eligibility: number;
  locationFormat: number;
  opportunityType: number;
}

export interface MatchResult {
  total: number;
  breakdown: MatchBreakdown;
  explanations: string[];
  cautions: string[];
  confidence: number;
  confidenceInputs: string[];
  missingData: string[];
  eligible: boolean;
  connectionLens: "Core edge" | "Adjacent expansion" | "Rounding opportunity";
}

export interface AppState {
  version: number;
  accounts: Account[];
  students: StudentProfile[];
  organizations: OrganizationProfile[];
  opportunities: Opportunity[];
  interests: InterestRecord[];
  conversations: Conversation[];
  outreachLeads: OutreachLead[];
  savedOpportunityIds: Record<string, string[]>;
  dismissedOpportunityIds: Record<string, string[]>;
  appliedOpportunityIds: Record<string, string[]>;
  lastMatchRefresh: string;
}

export interface Session {
  accountId: string;
  role: Role;
}
