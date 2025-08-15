'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCvContext } from '@/context/cv-context';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Upload, User } from 'lucide-react';

export function PersonalDetailsForm() {
  const form = useFormContext();
  const { cvData, setCvData } = useCvContext();

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        form.setValue('personalDetails.photo', dataUrl);
        // Manually update context as `watch` might not pick it up immediately
        setCvData({ ...cvData, personalDetails: { ...cvData.personalDetails, photo: dataUrl } });
      };
      reader.readAsDataURL(file);
    }
  };

  const photoUrl = form.watch('personalDetails.photo');

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="personalDetails.photo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profile Photo</FormLabel>
            <FormControl>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {photoUrl ? (
                        <Image src={photoUrl} alt="Profile" width={80} height={80} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <Button asChild variant="outline">
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Upload className="mr-2" />
                      Upload
                      <input id="photo-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                  </Button>
                </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalDetails.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalDetails.jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalDetails.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalDetails.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., +92 300 1234567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

       <FormField
        control={form.control}
        name="personalDetails.address"
        render={({ field }) => (
            <FormItem>
            <FormLabel>Address</FormLabel>
            <FormControl>
                <Input placeholder="e.g., Karachi, Pakistan" {...field} />
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />


      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="personalDetails.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile</FormLabel>
              <FormControl>
                <Input placeholder="e.g., linkedin.com/in/johndoe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="personalDetails.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website / Portfolio</FormLabel>
              <FormControl>
                <Input placeholder="e.g., johndoe.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="personalDetails.summary"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Professional Summary</FormLabel>
            <FormControl>
              <Textarea placeholder="Write a brief summary about your professional background..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
