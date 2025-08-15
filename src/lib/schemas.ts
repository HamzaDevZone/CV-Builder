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
    photo: 'https://placehold.co/400x400.png',
    name: 'Ayesha Khan',
    jobTitle: 'Aspiring Web Developer',
    email: 'ayesha.khan@example.com',
    phone: '+92 345 1234567',
    address: 'Karachi, Pakistan',
    linkedin: 'linkedin.com/in/ayeshakhan',
    website: 'ayeshakhan.dev',
    summary: 'A highly motivated and results-oriented aspiring web developer with a strong foundation in front-end and back-end technologies. Eager to leverage academic knowledge and hands-on project experience to build innovative and user-friendly web applications. A quick learner with a passion for problem-solving and a collaborative mindset.',
  },
  workExperience: [
    {
      id: crypto.randomUUID(),
      jobTitle: 'Web Development Intern',
      company: 'Techlogix',
      location: 'Lahore, Pakistan',
      startDate: 'Jun 2023',
      endDate: 'Aug 2023',
      description: '- Assisted in the development of a new e-commerce platform using React and Node.js.\n- Collaborated with the UI/UX team to implement responsive designs and improve user experience.\n- Participated in daily stand-ups and sprint planning sessions.',
    },
  ],
  education: [
    {
      id: crypto.randomUUID(),
      degree: 'Bachelor of Science in Computer Science',
      institution: 'National University of Computer and Emerging Sciences (FAST)',
      location: 'Karachi, Pakistan',
      startDate: 'Sep 2020',
      endDate: 'Jun 2024',
      description: 'Relevant Coursework: Data Structures, Algorithms, Web Development, Database Systems.\nSenior Year Project: Developed a real-time chat application using WebSockets and React.',
    },
  ],
  skills: [
    { id: crypto.randomUUID(), name: 'JavaScript' },
    { id: crypto.randomUUID(), name: 'React' },
    { id: crypto.randomUUID(), name: 'Node.js' },
    { id: crypto.randomUUID(), name: 'Express' },
    { id: crypto.randomUUID(), name: 'MongoDB' },
    { id: crypto.randomUUID(), name: 'HTML5 & CSS3' },
    { id: crypto.randomUUID(), name: 'Git & GitHub' },
  ],
};
