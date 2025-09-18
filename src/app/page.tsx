'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
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
  Upload,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { translations, soilTypesByLang } from '@/lib/translations';

const formSchema = z.object({
  soilType: z.string().min(2, 'Soil type is required.'),
  soilPh: z.coerce.number().min(0).max(14, 'pH must be between 0 and 14.'),
  temperature: z.coerce.number(),
  rainfall: z.coerce.number(),
  season: z.string().min(2, 'Season is required.'),
  region: z.string().min(2, 'Region is required.'),
});

type Language = 'en' | 'hi' | 'mr';

const seasons = ['Winter', 'Summer', 'Rainy'];

export default function Home() {
  const [result, setResult] = useState<SuggestCropsOutput | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  const t = translations[language];

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

  useEffect(() => {
    if (isCameraDialogOpen) {
      const getCameraPermission = async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          toast({
            variant: 'destructive',
            title: 'Camera Not Supported',
            description:
              'Your browser does not support camera access. Please try on a different browser or device.',
          });
          setHasCameraPermission(false);
          return;
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: t.cameraAccessRequired,
            description: t.allowCameraAccess,
          });
        }
      };

      getCameraPermission();
    } else {
      // Stop camera stream when dialog closes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  }, [isCameraDialogOpen, toast, t]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageDataUri(dataUri);
        setIsCameraDialogOpen(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageDataUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await suggestCrops({ ...values, language, photoDataUri: imageDataUri || undefined });
        setResult(res);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: t.recommendationFailed,
          description: t.recommendationFailedDesc,
        });
      }
    });
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 p-4 py-10 sm:p-8">
      <header className="w-full max-w-2xl text-center">
        <div className="absolute top-4 right-4 w-40">
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue placeholder={t.languageLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
              </SelectContent>
            </Select>
          </div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-green-900/90 md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          {t.subtitle}
        </p>
      </header>

      <main className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {t.cardTitle}
            </CardTitle>
            <CardDescription>
              {t.cardDescription}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.regionLabel}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t.regionPlaceholder}
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
                        <FormLabel>{t.seasonLabel}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.seasonPlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {seasons.map((season) => (
                              <SelectItem key={season} value={season}>
                                {t[season.toLowerCase() as keyof typeof t]}
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
                        <FormLabel>{t.soilTypeLabel}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t.soilTypePlaceholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {soilTypesByLang[language].map((type) => (
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
                        <FormLabel>{t.soilPhLabel}</FormLabel>
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
                        <FormLabel>{t.temperatureLabel}</FormLabel>
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
                        <FormLabel>{t.rainfallLabel}</FormLabel>
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
                </div>
                
                <FormItem>
                  <FormLabel>{t.farmlandImageLabel}</FormLabel>
                  {imageDataUri ? (
                    <div className="relative">
                      <img
                        src={imageDataUri}
                        alt="Farmland"
                        className="w-full h-auto rounded-md border"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => setImageDataUri(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                       <Button asChild variant="outline">
                        <label htmlFor="farm-image-upload" className="cursor-pointer">
                          <Upload className="mr-2" />
                          {t.uploadImage}
                          <input
                            id="farm-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                      </Button>
                      <Dialog open={isCameraDialogOpen} onOpenChange={setIsCameraDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Camera className="mr-2" />
                            {t.useCamera}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t.cameraDialogTitle}</DialogTitle>
                          </DialogHeader>
                          <div className="relative overflow-hidden rounded-md border">
                            <video
                              ref={videoRef}
                              className="w-full aspect-video"
                              autoPlay
                              muted
                              playsInline
                            />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                          {hasCameraPermission === false && (
                            <Alert variant="destructive" className="mt-4">
                              <AlertTitle>{t.cameraAccessRequired}</AlertTitle>
                              <AlertDescription>
                                {t.allowCameraAccess}
                              </AlertDescription>
                            </Alert>
                          )}
                          <DialogFooter>
                            <Button
                              onClick={captureImage}
                              disabled={!hasCameraPermission}
                              className="w-full"
                            >
                              <Camera className="mr-2" />
                              {t.captureImage}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      {t.generatingAdvice}...
                    </>
                  ) : (
                    t.getAdvice
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
                Our AI is analyzing your conditions... Please wait.
              </p>
            </div>
          )}

          {!isPending && result && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <RecommendationCard
                icon={Leaf}
                title={t.recommendedCrops}
                content={result.recommendedCrops}
              />
              <RecommendationCard
                icon={FlaskConical}
                title={t.fertilizerSuggestions}
                content={result.fertilizers}
              />
              <RecommendationCard
                icon={Droplets}
                title={t.irrigationAdvice}
                content={result.irrigation}
              />
              <RecommendationCard
                icon={Shield}
                title={t.pestManagement}
                content={result.pestManagement}
              />
            </div>
          )}

          {!isPending && !result && (
            <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
              <Tractor className="h-16 w-16 text-gray-400" />
              <h3 className="font-headline text-xl font-semibold">
                {t.readyToGrow}
              </h3>
              <p className="text-muted-foreground">
                {t.recommendationsHere}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
