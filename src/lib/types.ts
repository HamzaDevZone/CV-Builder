
export interface PersonalDetails {
  photo?: string;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface CvData {
  personalDetails: PersonalDetails;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
}

export type Template = 
  | 'classic' 
  | 'modern' 
  | 'creative'
  // Standard templates
  | 'professional'
  | 'minimalist'
  | 'executive'
  // Premium templates
  | 'elegant'
  | 'bold'
  | 'academic'
  | 'tech'
  | 'designer'
  // Executive templates
  | 'corporate'
  | 'artistic'
  | 'sleek'
  | 'vintage'
  | 'premium-plus'
  // Platinum templates
  | 'platinum'
  | 'luxe'
  | 'visionary'
  | 'prestige'
  | 'avant-garde'
  ;

export interface Payment {
    username: string;
    userEmail: string;
    transactionId: string;
    templateId: Template;
    status: 'pending' | 'approved';
    timestamp: Date;
    receiptDataUrl?: string;
}

export interface User {
  username: string;
  email: string;
  firstSeen: Date;
}

export interface Ad {
  id: string;
  brandName: string;
  offer: string;
  linkUrl: string;
  imageUrl: string;
  createdAt: Date;
}
