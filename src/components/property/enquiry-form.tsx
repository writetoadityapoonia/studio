'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { submitEnquiry, EnquiryFormState } from '@/lib/actions';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type EnquiryFormValues = z.infer<typeof formSchema>;

type EnquiryFormProps = {
  propertyId: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Sending...' : 'Send Enquiry'}
        </Button>
    );
}

export function EnquiryForm({ propertyId }: EnquiryFormProps) {
  const { toast } = useToast();
  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      message: 'I am interested in this property. Please send me more details.',
    },
    mode: 'onBlur',
  });

  const initialState: EnquiryFormState = { message: '' };
  const [state, dispatch] = useActionState(submitEnquiry, initialState);

  useEffect(() => {
      if (state.message) {
        toast({
          title: state.message.includes('successfully') ? "Enquiry Sent!" : "Error",
          description: state.message.includes('successfully') ? "Thank you for your interest. We will get back to you shortly." : state.message,
          variant: state.message.includes('successfully') ? 'default' : 'destructive'
        });

        if(state.message.includes('successfully')) {
            form.reset();
        }
      }
      if (state.errors) {
        Object.entries(state.errors).forEach(([field, errors]) => {
            if (errors) {
                form.setError(field as keyof EnquiryFormValues, {
                    type: 'manual',
                    message: errors.join(', '),
                });
            }
        });
    }
  }, [state, form, toast]);
  
  const formAction = (formData: FormData) => {
      formData.append('propertyId', propertyId);
      dispatch(formData);
  }

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton />
      </form>
    </Form>
  );
}
