
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";

const preferencesSchema = z.object({
  venue_type: z.enum(["indoor", "outdoor", "both"]),
  favorite_sports: z.array(z.string()).min(1, "Please select at least one sport"),
  preferred_timing: z.array(z.string()).min(1, "Please select at least one timing"),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

interface PreferencesFormProps {
  onComplete: () => void;
  sports: Array<{ id: string; name: string }>;
}

export function PreferencesForm({ onComplete, sports }: PreferencesFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      venue_type: "both",
      favorite_sports: [],
      preferred_timing: [],
    },
  });

  const onSubmit = async (data: PreferencesFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Store just the string identifiers for preferred timing, not the actual time values
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          venue_type: data.venue_type,
          favorite_sports: data.favorite_sports,
          preferred_timing: data.preferred_timing,
        });

      if (preferencesError) throw preferencesError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ has_set_preferences: true })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "Preferences saved",
        description: "Your preferences have been saved successfully.",
      });
      
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="venue_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Venue Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="indoor" />
                    <FormLabel className="font-normal">Indoor</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="outdoor" />
                    <FormLabel className="font-normal">Outdoor</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="both" />
                    <FormLabel className="font-normal">Both</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="favorite_sports"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favorite Sports</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-4">
                  {sports.map((sport) => (
                    <div key={sport.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={sport.id}
                        value={sport.id}
                        checked={field.value.includes(sport.id)}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            e.target.checked
                              ? [...field.value, value]
                              : field.value.filter((v) => v !== value)
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={sport.id} className="text-sm">
                        {sport.name}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferred_timing"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Timings</FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "morning", label: "Morning (6 AM - 12 PM)" },
                    { id: "afternoon", label: "Afternoon (12 PM - 4 PM)" },
                    { id: "evening", label: "Evening (4 PM - 8 PM)" },
                    { id: "night", label: "Night (8 PM - 11 PM)" },
                  ].map((timing) => (
                    <div key={timing.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={timing.id}
                        value={timing.id}
                        checked={field.value.includes(timing.id)}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            e.target.checked
                              ? [...field.value, value]
                              : field.value.filter((v) => v !== value)
                          );
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label htmlFor={timing.id} className="text-sm">
                        {timing.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </Form>
  );
}
