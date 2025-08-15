'use client';

import { type CvData } from '@/lib/types';
import { Mail, Phone, Linkedin, Globe, MapPin, Lock, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

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
        <div className="p-8 font-sans bg-white text-gray-800 relative font-jakarta">
          {isPremium && (
             <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Lock className="h-16 w-16 text-primary/50" />
                <p className="mt-4 text-2xl font-bold text-primary/70">Premium Template</p>
                <p className="text-muted-foreground">Unlock to remove watermark</p>
            </div>
          )}
          <div className="grid grid-cols-12 gap-10">
            <div className="col-span-4 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-lg -mt-24">
                {personalDetails.photo ? (
                  <Image src={personalDetails.photo} alt={personalDetails.name} width={160} height={160} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <UserIcon className="w-20 h-20 text-muted-foreground/50"/>
                  </div>
                )}
              </div>
              <div className="text-center mt-4">
                 <h1 className="text-3xl font-bold text-gray-900">{personalDetails.name || 'Your Name'}</h1>
                 <p className="text-lg text-primary font-medium">{personalDetails.jobTitle || 'Professional Title'}</p>
              </div>

              <div className="mt-8 w-full">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Contact</h2>
                <div className="space-y-3 text-sm text-gray-600">
                  {personalDetails.email && <p className="flex items-center gap-3"><Mail className="text-primary" size={16}/> {personalDetails.email}</p>}
                  {personalDetails.phone && <p className="flex items-center gap-3"><Phone className="text-primary" size={16}/> {personalDetails.phone}</p>}
                  {personalDetails.address && <p className="flex items-center gap-3"><MapPin className="text-primary" size={16}/> {personalDetails.address}</p>}
                  {personalDetails.linkedin && <p className="flex items-center gap-3"><Linkedin className="text-primary" size={16}/> {personalDetails.linkedin}</p>}
                  {personalDetails.website && <p className="flex items-center gap-3"><Globe className="text-primary" size={16}/> {personalDetails.website}</p>}
                </div>
              </div>

              <div className="mt-8 w-full">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Skills</h2>
                <ul className="flex flex-wrap gap-2">
                  {skills.map(skill => skill.name && <li key={skill.id} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full">{skill.name}</li>)}
                </ul>
              </div>
            </div>

            <div className="col-span-8">
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">About Me</h2>
                <p className="text-sm leading-relaxed text-gray-600">{personalDetails.summary || 'A brief professional summary...'}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Experience</h2>
                <div className="space-y-6">
                {workExperience.map(exp => exp.jobTitle && (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-lg font-semibold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-xs font-medium text-gray-500">{exp.startDate} - {exp.endDate}</p>
                    </div>
                    <p className="text-md font-medium text-primary">{exp.company} | {exp.location}</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600">{exp.description}</p>
                  </div>
                ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Education</h2>
                <div className="space-y-6">
                {education.map(edu => edu.degree && (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-xs font-medium text-gray-500">{edu.startDate} - {edu.endDate}</p>
                    </div>
                    <p className="text-md font-medium text-primary">{edu.institution} | {edu.location}</p>
                     <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600">{edu.description}</p>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-24 bg-primary/80 absolute bottom-0 left-0"></div>
        </div>
      );
    }

    // Classic Template
    return (
      <div className="p-8 bg-white text-gray-800">
         <header className="text-center border-b pb-4 flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border flex-shrink-0">
             {personalDetails.photo ? (
                <Image src={personalDetails.photo} alt={personalDetails.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-muted-foreground/50"/>
                </div>
              )}
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold">{personalDetails.name || 'Your Name'}</h1>
            <p className="text-xl mt-1">{personalDetails.jobTitle || 'Professional Title'}</p>
            <div className="flex gap-x-4 gap-y-1 mt-2 text-sm text-gray-600 flex-wrap">
              {personalDetails.email && <p className="flex items-center gap-1"><Mail size={14}/> {personalDetails.email}</p>}
              {personalDetails.phone && <p className="flex items-center gap-1"><Phone size={14}/> {personalDetails.phone}</p>}
              {personalDetails.address && <p className="flex items-center gap-1"><MapPin size={14}/> {personalDetails.address}</p>}
              {personalDetails.linkedin && <p className="flex items-center gap-1"><Linkedin size={14}/> {personalDetails.linkedin}</p>}
              {personalDetails.website && <p className="flex items-center gap-1"><Globe size={14}/> {personalDetails.website}</p>}
            </div>
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
    <div className="bg-white shadow-lg h-full w-full overflow-auto rounded-lg">
      {renderContent()}
    </div>
  );
}
