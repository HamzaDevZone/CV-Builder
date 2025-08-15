'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { PlusCircle, XCircle } from 'lucide-react';

export function SkillsForm() {
  const form = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'skills',
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if(form.getValues(`skills.${index}.name`)){
          append({ id: crypto.randomUUID(), name: '' });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {fields.map((item, index) => (
          <div key={item.id} className="relative">
            <FormField
              control={form.control}
              name={`skills.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                      placeholder="e.g., React" 
                      {...field} 
                      onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {index > 0 && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                >
                    <XCircle className="h-4 w-4" />
                </Button>
            )}
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ id: crypto.randomUUID(), name: '' })}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Skill
      </Button>
    </div>
  );
}
