'use client';

import { type CvData } from '@/lib/types';
import { Mail, Phone, Linkedin, Globe, MapPin, Lock } from 'lucide-react';

interface CvPreviewProps {
  data: CvData;
  template: 'classic' | 'modern';
  isPremium?: boolean;
}

export function CvPreview({ data, template, isPremium = false }: CvPreviewProps) {
  const { personalDetails, workExperience, education, skills } = data;

  const renderContent = () => {
    if (template === 'modern') {
      return (
        <div className="p-8 font-sans bg-white text-[#414141] relative">
          {isPremium && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Lock className="h-16 w-16 text-primary/50" />
                <p className="mt-4 text-2xl font-bold text-primary/70">Premium Template</p>
                <p className="text-muted-foreground">Unlock to remove watermark</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1 border-r pr-8 border-gray-200">
              <h1 className="text-4xl font-bold text-primary">{personalDetails.name || 'Your Name'}</h1>
              <p className="text-primary mt-1">{personalDetails.jobTitle || 'Professional Title'}</p>
              
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-1">Contact</h2>
                <div className="space-y-2 text-sm">
                  {personalDetails.email && <p className="flex items-center gap-2"><Mail size={14}/> {personalDetails.email}</p>}
                  {personalDetails.phone && <p className="flex items-center gap-2"><Phone size={14}/> {personalDetails.phone}</p>}
                  {personalDetails.address && <p className="flex items-center gap-2"><MapPin size={14}/> {personalDetails.address}</p>}
                  {personalDetails.linkedin && <p className="flex items-center gap-2"><Linkedin size={14}/> {personalDetails.linkedin}</p>}
                  {personalDetails.website && <p className="flex items-center gap-2"><Globe size={14}/> {personalDetails.website}</p>}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold text-primary border-b-2 border-primary pb-1">Skills</h2>
                <ul className="flex flex-wrap gap-2 mt-2">
                  {skills.map(skill => skill.name && <li key={skill.id} className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">{skill.name}</li>)}
                </ul>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/30 pb-2">Summary</h2>
                <p className="mt-4 text-sm leading-relaxed">{personalDetails.summary || 'A brief professional summary...'}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/30 pb-2">Experience</h2>
                {workExperience.map(exp => exp.jobTitle && (
                  <div key={exp.id} className="mt-4">
                    <h3 className="text-lg font-semibold">{exp.jobTitle}</h3>
                    <p className="text-md font-medium text-gray-600">{exp.company} | {exp.location}</p>
                    <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-2xl font-bold text-primary border-b-2 border-primary/30 pb-2">Education</h2>
                {education.map(edu => edu.degree && (
                  <div key={edu.id} className="mt-4">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <p className="text-md font-medium text-gray-600">{edu.institution} | {edu.location}</p>
                    <p className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</p>
                     <p className="mt-2 text-sm whitespace-pre-wrap">{edu.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Classic Template
    return (
      <div className="p-8 bg-white text-gray-800">
        <header className="text-center border-b pb-4">
          <h1 className="text-4xl font-bold">{personalDetails.name || 'Your Name'}</h1>
          <p className="text-xl mt-1">{personalDetails.jobTitle || 'Professional Title'}</p>
          <div className="flex justify-center gap-x-6 gap-y-1 mt-2 text-sm text-gray-600 flex-wrap">
            {personalDetails.email && <p className="flex items-center gap-1"><Mail size={14}/> {personalDetails.email}</p>}
            {personalDetails.phone && <p className="flex items-center gap-1"><Phone size={14}/> {personalDetails.phone}</p>}
            {personalDetails.address && <p className="flex items-center gap-1"><MapPin size={14}/> {personalDetails.address}</p>}
            {personalDetails.linkedin && <p className="flex items-center gap-1"><Linkedin size={14}/> {personalDetails.linkedin}</p>}
            {personalDetails.website && <p className="flex items-center gap-1"><Globe size={14}/> {personalDetails.website}</p>}
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-2xl font-bold border-b-2 pb-1">Summary</h2>
          <p className="mt-2 text-sm leading-relaxed">{personalDetails.summary || 'A brief professional summary...'}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-bold border-b-2 pb-1">Work Experience</h2>
          {workExperience.map(exp => exp.jobTitle && (
            <div key={exp.id} className="mt-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold">{exp.jobTitle} at {exp.company}</h3>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-sm text-gray-700 italic">{exp.location}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-bold border-b-2 pb-1">Education</h2>
          {education.map(edu => edu.degree &&(
            <div key={edu.id} className="mt-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold">{edu.degree}</h3>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-sm text-gray-700 italic">{edu.institution}, {edu.location}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{edu.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-bold border-b-2 pb-1">Skills</h2>
          <ul className="flex flex-wrap gap-2 mt-2">
            {skills.map(skill => skill.name && <li key={skill.id} className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-md">{skill.name}</li>)}
          </ul>
        </section>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg h-full w-full overflow-auto">
      {renderContent()}
    </div>
  );
}
