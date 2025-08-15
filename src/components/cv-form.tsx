'use client';

import { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useCvContext } from '@/context/cv-context';
import { cvFormSchema } from '@/lib/schemas';
import { PersonalDetailsForm } from './forms/personal-details-form';
import { WorkExperienceForm } from './forms/work-experience-form';
import { EducationForm } from './forms/education-form';
import { SkillsForm } from './forms/skills-form';
import { User, Briefcase, GraduationCap, Star } from 'lucide-react';

export function CvForm() {
  const { cvData, setCvData } = useCvContext();

  const form = useForm<z.infer<typeof cvFormSchema>>({
    resolver: zodResolver(cvFormSchema),
    defaultValues: cvData,
  });

  const watchedData = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      setCvData(value as any);
    });
    return () => subscription.unsubscribe();
  }, [form, setCvData]);


  return (
    <FormProvider {...form}>
      <form className="space-y-6">
        <Accordion type="multiple" defaultValue={['personal_details']} className="w-full">
          <AccordionItem value="personal_details" className="bg-card border-none rounded-lg shadow-sm mb-4">
            <AccordionTrigger className="p-4 font-semibold text-lg hover:no-underline">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                Personal Details
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <PersonalDetailsForm />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="work_experience" className="bg-card border-none rounded-lg shadow-sm mb-4">
            <AccordionTrigger className="p-4 font-semibold text-lg hover:no-underline">
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                Work Experience
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <WorkExperienceForm />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="education" className="bg-card border-none rounded-lg shadow-sm mb-4">
            <AccordionTrigger className="p-4 font-semibold text-lg hover:no-underline">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                Education
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <EducationForm />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="skills" className="bg-card border-none rounded-lg shadow-sm">
            <AccordionTrigger className="p-4 font-semibold text-lg hover:no-underline">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-primary" />
                Skills
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 pt-0">
              <SkillsForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </FormProvider>
  );
}
