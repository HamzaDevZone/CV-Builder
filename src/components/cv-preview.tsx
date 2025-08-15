'use client';

import { type CvData, type Template } from '@/lib/types';
import { Mail, Phone, Linkedin, Globe, MapPin, Lock, User as UserIcon, Star, Briefcase, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { backgroundColors } from '@/context/cv-context';


interface CvPreviewProps {
  data: CvData;
  template: Template;
  accentColor: string;
  backgroundColor: string;
  isPremiumLocked?: boolean;
}

export function CvPreview({ data, template, accentColor, backgroundColor, isPremiumLocked = false }: CvPreviewProps) {
  const { personalDetails, workExperience, education, skills } = data;

  const isDarkBackground = [backgroundColors.dark, backgroundColors.gradient].includes(backgroundColor);

  const cvStyles: CSSProperties = {
    '--accent-color': accentColor,
    '--background-cv': backgroundColor,
    '--foreground-cv': isDarkBackground ? '#ffffff' : '#111827',
    '--secondary-foreground-cv': isDarkBackground ? '#d1d5db' : '#4b5563',
    '--muted-foreground-cv': isDarkBackground ? '#9ca3af' : '#6b7281',
  };
  
  const cvClasses = cn(
    'text-[--foreground-cv] bg-[--background-cv]',
  );

  const renderPremiumLock = () => isPremiumLocked && (
     <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-4">
        <Lock className="h-16 w-16 text-primary/50" style={{ color: 'var(--accent-color)', opacity: 0.5 }} />
        <p className="mt-4 text-2xl font-bold text-primary/70" style={{ color: 'var(--accent-color)', opacity: 0.7 }}>Premium Template</p>
        <p className="text-muted-foreground">Complete payment to unlock and remove this watermark.</p>
    </div>
  );

  const renderContent = () => {
    if (template === 'creative') {
       return (
        <div style={cvStyles} className={cn(cvClasses, "p-8 font-sans font-jakarta flex flex-col min-h-full")}>
          {renderPremiumLock()}
          
          <header className="flex items-center gap-6">
             <div className="w-32 h-32 rounded-full bg-secondary overflow-hidden border-4 shadow-lg flex-shrink-0" style={{ borderColor: 'var(--accent-color)'}}>
              {personalDetails.photo ? (
                <Image src={personalDetails.photo} alt={personalDetails.name} width={128} height={128} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <UserIcon className="w-16 h-16 text-muted-foreground/50"/>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[--foreground-cv]">{personalDetails.name || 'Your Name'}</h1>
              <p className="text-xl text-[--accent-color] font-medium">{personalDetails.jobTitle || 'Professional Title'}</p>
            </div>
          </header>

          <div className="mt-6 border-t-2 pt-4" style={{borderColor: 'var(--accent-color)'}}>
            <p className="text-sm leading-relaxed text-[--secondary-foreground-cv]">{personalDetails.summary || 'A brief professional summary...'}</p>
          </div>
          
          <div className="mt-8 grid grid-cols-12 gap-8 flex-grow">
            {/* Left Column */}
            <div className="col-span-4 space-y-8">
               <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-[--accent-color] mb-3">Contact</h2>
                  <div className="space-y-2 text-sm text-[--secondary-foreground-cv]">
                    {personalDetails.email && <p className="flex items-center gap-2 break-all"><Mail className="text-[--accent-color] flex-shrink-0" size={14}/> <span>{personalDetails.email}</span></p>}
                    {personalDetails.phone && <p className="flex items-center gap-2 break-all"><Phone className="text-[--accent-color] flex-shrink-0" size={14}/> <span>{personalDetails.phone}</span></p>}
                    {personalDetails.address && <p className="flex items-center gap-2 break-all"><MapPin className="text-[--accent-color] flex-shrink-0" size={14}/> <span>{personalDetails.address}</span></p>}
                    {personalDetails.linkedin && <p className="flex items-center gap-2 break-all"><Linkedin className="text-[--accent-color] flex-shrink-0" size={14}/> <span>{personalDetails.linkedin}</span></p>}
                    {personalDetails.website && <p className="flex items-center gap-2 break-all"><Globe className="text-[--accent-color] flex-shrink-0" size={14}/> <span>{personalDetails.website}</span></p>}
                  </div>
                </div>
                <div>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-[--accent-color] mb-3">Skills</h2>
                    <ul className="space-y-1.5">
                        {skills.map(skill => skill.name && (
                            <li key={skill.id} className="flex items-center gap-2">
                                <Star className="text-[--accent-color]" size={14}/>
                                <span className="text-sm font-medium">{skill.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Column */}
            <div className="col-span-8 border-l-2 pl-8 space-y-8" style={{borderColor: 'var(--accent-color)'}}>
                <div>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-[--accent-color] mb-4 flex items-center gap-3"><Briefcase />Experience</h2>
                    <div className="space-y-5">
                    {workExperience.map(exp => exp.jobTitle && (
                        <div key={exp.id}>
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-semibold text-[--foreground-cv]">{exp.jobTitle}</h3>
                            <p className="text-xs font-medium text-[--muted-foreground-cv]">{exp.startDate} - {exp.endDate}</p>
                        </div>
                        <p className="text-md font-medium text-[--secondary-foreground-cv]">{exp.company} | {exp.location}</p>
                        <p className="mt-2 text-sm whitespace-pre-wrap text-[--secondary-foreground-cv]">{exp.description}</p>
                        </div>
                    ))}
                    </div>
                </div>
                 <div>
                    <h2 className="text-lg font-bold uppercase tracking-wider text-[--accent-color] mb-4 flex items-center gap-3"><GraduationCap/>Education</h2>
                    <div className="space-y-5">
                    {education.map(edu => edu.degree && (
                        <div key={edu.id}>
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-lg font-semibold text-[--foreground-cv]">{edu.degree}</h3>
                            <p className="text-xs font-medium text-[--muted-foreground-cv]">{edu.startDate} - {edu.endDate}</p>
                        </div>
                        <p className="text-md font-medium text-[--secondary-foreground-cv]">{edu.institution} | {edu.location}</p>
                            <p className="mt-2 text-sm whitespace-pre-wrap text-[--secondary-foreground-cv]">{edu.description}</p>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (template === 'modern') {
      return (
        <div style={cvStyles} className={cn(cvClasses, "p-8 font-sans font-jakarta grid grid-cols-12 gap-x-10 min-h-full")}>
           {renderPremiumLock()}

          {/* Left Column */}
          <div className="col-span-4 bg-[--accent-color]/5 p-6 rounded-lg flex flex-col items-center text-center">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary overflow-hidden border-4 border-white shadow-lg">
              {personalDetails.photo ? (
                <Image src={personalDetails.photo} alt={personalDetails.name} width={160} height={160} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <UserIcon className="w-16 h-16 md:w-20 md:h-20 text-muted-foreground/50"/>
                </div>
              )}
            </div>
            <div className="mt-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[--foreground-cv]">{personalDetails.name || 'Your Name'}</h1>
                <p className="text-md md:text-lg text-[--accent-color] font-medium">{personalDetails.jobTitle || 'Professional Title'}</p>
            </div>

             <div className="mt-8 w-full text-left">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[--muted-foreground-cv] mb-4 text-center">Contact</h2>
              <div className="space-y-3 text-sm text-[--secondary-foreground-cv]">
                {personalDetails.email && <p className="flex items-start gap-3 break-all"><Mail className="text-[--accent-color] flex-shrink-0 mt-0.5" size={16}/> <span>{personalDetails.email}</span></p>}
                {personalDetails.phone && <p className="flex items-start gap-3 break-all"><Phone className="text-[--accent-color] flex-shrink-0 mt-0.5" size={16}/> <span>{personalDetails.phone}</span></p>}
                {personalDetails.address && <p className="flex items-start gap-3 break-all"><MapPin className="text-[--accent-color] flex-shrink-0 mt-0.5" size={16}/> <span>{personalDetails.address}</span></p>}
                {personalDetails.linkedin && <p className="flex items-start gap-3 break-all"><Linkedin className="text-[--accent-color] flex-shrink-0 mt-0.5" size={16}/> <span>{personalDetails.linkedin}</span></p>}
                {personalDetails.website && <p className="flex items-start gap-3 break-all"><Globe className="text-[--accent-color] flex-shrink-0 mt-0.5" size={16}/> <span>{personalDetails.website}</span></p>}
              </div>
            </div>

            <div className="mt-8 w-full">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[--muted-foreground-cv] mb-4 text-center">Skills</h2>
              <ul className="flex flex-wrap gap-2 justify-center">
                {skills.map(skill => skill.name && <li key={skill.id} className="bg-[--accent-color]/10 text-[--accent-color] text-xs font-medium px-3 py-1 rounded-full">{skill.name}</li>)}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-8 py-6 pr-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[--accent-color] border-b-2 border-[--accent-color]/20 pb-2 mb-3">About Me</h2>
              <p className="text-sm leading-relaxed text-[--secondary-foreground-cv]">{personalDetails.summary || 'A brief professional summary...'}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-[--accent-color] border-b-2 border-[--accent-color]/20 pb-2 mb-3">Experience</h2>
              <div className="space-y-6">
              {workExperience.map(exp => exp.jobTitle && (
                <div key={exp.id}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                    <h3 className="text-lg font-semibold text-[--foreground-cv]">{exp.jobTitle}</h3>
                    <p className="text-xs font-medium text-[--muted-foreground-cv] mt-1 sm:mt-0">{exp.startDate} - {exp.endDate}</p>
                  </div>
                  <p className="text-md font-medium text-[--accent-color]">{exp.company} | {exp.location}</p>
                  <p className="mt-2 text-sm whitespace-pre-wrap text-[--secondary-foreground-cv]">{exp.description}</p>
                </div>
              ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[--accent-color] border-b-2 border-[--accent-color]/20 pb-2 mb-3">Education</h2>
              <div className="space-y-6">
              {education.map(edu => edu.degree && (
                <div key={edu.id}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                    <h3 className="text-lg font-semibold text-[--foreground-cv]">{edu.degree}</h3>
                    <p className="text-xs font-medium text-[--muted-foreground-cv] mt-1 sm:mt-0">{edu.startDate} - {edu.endDate}</p>
                  </div>
                  <p className="text-md font-medium text-[--accent-color]">{edu.institution} | {edu.location}</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap text-[--secondary-foreground-cv]">{edu.description}</p>
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
      <div style={cvStyles} className={cn(cvClasses, "p-4 md:p-8")}>
         <header className="text-center md:text-left md:flex items-center gap-6 border-b pb-4" style={{borderColor: accentColor}}>
          <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-border flex-shrink-0 mx-auto md:mx-0">
             {personalDetails.photo ? (
                <Image src={personalDetails.photo} alt={personalDetails.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-12 h-12 text-muted-foreground/50"/>
                </div>
              )}
          </div>
          <div className="mt-4 md:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: accentColor }}>{personalDetails.name || 'Your Name'}</h1>
            <p className="text-lg md:text-xl mt-1">{personalDetails.jobTitle || 'Professional Title'}</p>
            <div className="flex flex-col md:flex-row gap-x-4 gap-y-1 mt-2 text-sm text-[--muted-foreground-cv] flex-wrap items-center justify-center md:justify-start">
              {personalDetails.email && <p className="flex items-center gap-1"><Mail size={14} style={{ color: accentColor }}/> {personalDetails.email}</p>}
              {personalDetails.phone && <p className="flex items-center gap-1"><Phone size={14} style={{ color: accentColor }}/> {personalDetails.phone}</p>}
              {personalDetails.address && <p className="flex items-center gap-1"><MapPin size={14} style={{ color: accentColor }}/> {personalDetails.address}</p>}
              {personalDetails.linkedin && <p className="flex items-center gap-1"><Linkedin size={14} style={{ color: accentColor }}/> {personalDetails.linkedin}</p>}
              {personalDetails.website && <p className="flex items-center gap-1"><Globe size={14} style={{ color: accentColor }}/> {personalDetails.website}</p>}
            </div>
          </div>
        </header>

        <section className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold border-b-2 pb-1" style={{ color: accentColor, borderColor: accentColor }}>Summary</h2>
          <p className="mt-2 text-sm leading-relaxed">{personalDetails.summary || 'A brief professional summary...'}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold border-b-2 pb-1" style={{ color: accentColor, borderColor: accentColor }}>Work Experience</h2>
          {workExperience.map(exp => exp.jobTitle && (
            <div key={exp.id} className="mt-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                <h3 className="text-lg font-semibold">{exp.jobTitle} at {exp.company}</h3>
                <span className="text-sm text-[--muted-foreground-cv] mt-1 sm:mt-0">{exp.startDate} - {exp.endDate}</span>
              </div>
              <p className="text-sm text-[--secondary-foreground-cv] italic">{exp.location}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{exp.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold border-b-2 pb-1" style={{ color: accentColor, borderColor: accentColor }}>Education</h2>
          {education.map(edu => edu.degree &&(
            <div key={edu.id} className="mt-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-baseline">
                <h3 className="text-lg font-semibold">{edu.degree}</h3>
                <span className="text-sm text-[--muted-foreground-cv] mt-1 sm:mt-0">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="text-sm text-[--secondary-foreground-cv] italic">{edu.institution}, {edu.location}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{edu.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold border-b-2 pb-1" style={{ color: accentColor, borderColor: accentColor }}>Skills</h2>
          <ul className="flex flex-wrap gap-2 mt-2">
            {skills.map(skill => skill.name && <li key={skill.id} className="text-sm px-3 py-1 rounded-md" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>{skill.name}</li>)}
          </ul>
        </section>
      </div>
    );
  };

  return (
    <div className="bg-card shadow-lg h-full w-full overflow-auto">
      {renderContent()}
    </div>
  );
}
