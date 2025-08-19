import { z } from 'zod';
import { type CvData } from './types';

export const personalDetailsSchema = z.object({
  photo: z.string().optional(),
  name: z.string().min(1, 'Full name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  summary: z.string().min(10, 'Summary should be at least 10 characters').max(1000, 'Summary is too long'),
});

export const workExperienceSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const educationSchema = z.object({
  id: z.string(),
  degree: z.string(),
  institution: z.string(),
  location: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

export const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const cvFormSchema = z.object({
  personalDetails: personalDetailsSchema,
  workExperience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(skillSchema),
});


export const defaultCvData: CvData = {
  personalDetails: {
    photo: '',
    name: 'Your Name',
    jobTitle: 'Professional Title',
    email: 'your.email@example.com',
    phone: '+1 234 567 890',
    address: 'City, Country',
    linkedin: 'https://linkedin.com/in/yourprofile',
    website: 'https://yourportfolio.com',
    summary: 'A brief and compelling professional summary about yourself. Highlight your key skills, experience, and career goals. Tailor this summary to the job you are applying for to catch the recruiter\'s attention.',
  },
  workExperience: [
    {
      id: 'work-1',
      jobTitle: 'Job Title',
      company: 'Company Name',
      location: 'City, Country',
      startDate: 'Jan 2022',
      endDate: 'Present',
      description: '- Describe your responsibilities and achievements in this role.\n- Use bullet points to make your accomplishments clear and easy to read.\n- Quantify your achievements with numbers and data whenever possible (e.g., "Increased sales by 15%").',
    },
    {
      id: 'work-2',
      jobTitle: 'Previous Job Title',
      company: 'Previous Company',
      location: 'City, Country',
      startDate: 'May 2020',
      endDate: 'Dec 2021',
      description: '- Detail your contributions and the skills you developed in this position.\n- Focus on results and the impact you made.',
    },
  ],
  education: [
     {
      id: 'edu-1',
      degree: 'Your Degree or Certificate',
      institution: 'Name of University or Institution',
      location: 'City, Country',
      startDate: 'Sep 2016',
      endDate: 'Jun 2020',
      description: 'Mention any relevant coursework, academic achievements, or honors. You can also include your GPA if it was impressive.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'Skill 1' },
    { id: 'skill-2', name: 'Skill 2' },
    { id: 'skill-3', name: 'Skill 3' },
    { id: 'skill-4', name: 'Skill 4' },
    { id: 'skill-5', name: 'Skill 5' },
    { id: 'skill-6', name: 'Skill 6' },
    { id: 'skill-7', name: 'Skill 7' },
    { id: 'skill-8', name: 'Skill 8' },
  ],
};
