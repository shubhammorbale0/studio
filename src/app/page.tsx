'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  suggestCrops,
  type SuggestCropsOutput,
} from '@/ai/flows/suggest-crops';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RecommendationCard } from '@/components/recommendation-card';
import {
  FlaskConical,
  Leaf,
  LoaderCircle,
  Shield,
  Tractor,
  Droplets,
  Camera,
} from 'lucide-react';

const formSchema = z.object({
  soilType: z.string().min(2, 'Soil type is required.'),
  soilPh: z.coerce.number().min(0).max(14, 'pH must be between 0 and 14.'),
  temperature: z.coerce.number(),
  rainfall: z.coerce.number(),
  season: z.string().min(2, 'Season is required.'),
  region: z.string().min(2, 'Region is required.'),
});

const soilTypes = [
  'Alluvial',
  'Black',
  'Red and Yellow',
  'Laterite',
  'Arid',
  'Saline',
  'Peaty',
  'Forest and Mountain',
];

const seasons = ['Winter', 'Summer', 'Rainy'];

export default function Home() {
  const [result, setResult] = useState<SuggestCropsOutput | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      soilType: '',
      soilPh: 7.0,
      temperature: 25,
      rainfall: 500,
      season: '',
      region: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      const res = await suggestCrops(values);
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
              New! Diagnose Plant Health
            </CardTitle>
            <CardDescription>
              Use your camera to identify plant diseases and get expert advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/diagnose" passHref>
              <Button className="w-full" size="lg">
                <Camera className="mr-2" />
                Start Diagnosis
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Get Crop Recommendations
            </CardTitle>
            <CardDescription>
              Enter your farm's conditions to receive personalized advice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Punjab"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {seasons.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soil Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a soil type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {soilTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soilPh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soil pH</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Temperature (°C)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rainfall"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Rainfall (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full"
                  >
                    {isPending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Generating Advice...
                      </>
                    ) : (
                      'Get Advice'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <section className="mt-8">
          {isPending && (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
              <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Our AI is analyzing your conditions... Please wait.
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
            <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
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
