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
    name: 'Huzaifa Raja',
    jobTitle: 'Full Stack Developer',
    email: 'rajahuzaifa015166@gmail.com',
    phone: '+92 346 5496360',
    address: 'Karachi, Pakistan',
    linkedin: 'https://linkedin.com/in/huzaifa-raja',
    website: 'https://huzaifa.dev',
    summary: 'A passionate Full Stack Developer with expertise in building modern, responsive, and scalable web applications. Proficient in a wide range of technologies including React, Next.js, Node.js, and various cloud platforms. A quick learner and a team player dedicated to writing clean, efficient, and maintainable code.',
  },
  workExperience: [
    {
      id: 'work-1',
      jobTitle: 'Senior Frontend Developer',
      company: 'Innovatech Solutions',
      location: 'Remote',
      startDate: 'Jan 2021',
      endDate: 'Present',
      description: 'Led the development of a new client-facing dashboard using Next.js and TypeScript, improving user engagement by 25%.\n- Collaborated with UX/UI designers to implement responsive and accessible components.\n- Mentored junior developers and conducted code reviews to maintain high code quality standards.',
    },
    {
      id: 'work-2',
      jobTitle: 'Software Engineer',
      company: 'Creative Minds Inc.',
      location: 'Lahore, Pakistan',
      startDate: 'Jun 2019',
      endDate: 'Dec 2020',
      description: 'Developed and maintained features for a large-scale e-commerce platform using React and Redux.\n- Integrated third-party APIs for payment processing and shipping.\n- Wrote unit and integration tests to ensure application stability.',
    },
  ],
  education: [
     {
      id: 'edu-1',
      degree: 'Bachelor of Science in Computer Science',
      institution: 'National University of Computer and Emerging Sciences',
      location: 'Karachi, Pakistan',
      startDate: 'Sep 2015',
      endDate: 'Jun 2019',
      description: 'Graduated with honors. Key coursework included Data Structures, Algorithms, Web Development, and Database Systems. Final year project involved building a real-time chat application.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'React' },
    { id: 'skill-2', name: 'Next.js' },
    { id: 'skill-3', name: 'TypeScript' },
    { id: 'skill-4', name: 'Node.js' },
    { id: 'skill-5', name: 'Tailwind CSS' },
    { id: 'skill-6', name: 'Firebase' },
    { id: 'skill-7', name: 'SQL & NoSQL' },
    { id: 'skill-8', name: 'Git & GitHub' },
  ],
};
