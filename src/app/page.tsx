'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  suggestCropsBasedOnLocation,
  type SuggestCropsBasedOnLocationOutput,
} from '@/ai/flows/suggest-crops-based-on-location';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RecommendationCard } from '@/components/recommendation-card';
import {
  FlaskConical,
  Leaf,
  LoaderCircle,
  Shield,
  Tractor,
  Droplets,
} from 'lucide-react';

const formSchema = z.object({
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters.')
    .max(100, 'Location is too long.'),
});

export default function Home() {
  const [result, setResult] =
    useState<SuggestCropsBasedOnLocationOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      const res = await suggestCropsBasedOnLocation(values);
      setResult(res);
    });
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 p-4 py-10 sm:p-8">
      <header className="text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-green-900/90 md:text-5xl">
          AgriAdvise AI
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your AI-powered guide to smarter farming.
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Get Crop Recommendations
            </CardTitle>
            <CardDescription>
              Enter your location to receive personalized advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Central Valley, California"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Generating Advice...
                    </>
                  ) : (
                    'Get Advice'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <section className="mt-8">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Our AI is analyzing your location... Please wait.
              </p>
            </div>
          )}

          {!isPending && result && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RecommendationCard
                icon={Leaf}
                title="Recommended Crops"
                content={result.recommendedCrops}
              />
              <RecommendationCard
                icon={FlaskConical}
                title="Fertilizer Suggestions"
                content={result.fertilizers}
              />
              <RecommendationCard
                icon={Droplets}
                title="Irrigation Advice"
                content={result.irrigation}
              />
              <RecommendationCard
                icon={Shield}
                title="Pest Management"
                content={result.pestManagement}
              />
            </div>
          )}

          {!isPending && !result && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
              <Tractor className="h-16 w-16 text-gray-400" />
              <h3 className="font-headline text-xl font-semibold">
                Ready to grow?
              </h3>
              <p className="text-muted-foreground">
                Your personalized farming recommendations will appear here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
