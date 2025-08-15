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
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  workExperience: [],
  education: [],
  skills: [{ id: 'initial-skill', name: '' }],
};
