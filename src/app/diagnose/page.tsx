'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import {
  diagnosePlantHealth,
  type DiagnosePlantHealthOutput,
} from '@/ai/flows/diagnose-plant-health';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  HeartPulse,
  Leaf,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  Thermometer,
  Upload,
  XCircle,
} from 'lucide-react';

export default function DiagnosePage() {
  const { toast } = useToast();
  const [result, setResult] = useState<DiagnosePlantHealthOutput | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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
          title: 'Camera Access Denied',
          description:
            'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

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

  const handleDiagnose = () => {
    if (!imageDataUri) {
      toast({
        variant: 'destructive',
        title: 'No Image',
        description: 'Please capture or upload an image first.',
      });
      return;
    }
    setResult(null);
    startTransition(async () => {
      try {
        const res = await diagnosePlantHealth({ photoDataUri: imageDataUri });
        setResult(res);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Diagnosis Failed',
          description:
            'Something went wrong while analyzing your image. Please try again.',
        });
      }
    });
  };

  const reset = () => {
    setImageDataUri(null);
    setResult(null);
  };

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center gap-8 p-4 py-10 sm:p-8">
      <header className="flex w-full max-w-2xl items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="font-headline text-2xl font-bold tracking-tight text-green-900/90 md:text-3xl">
          Plant Health Diagnosis
        </h1>
        <div className="w-24" />
      </header>

      <main className="w-full max-w-2xl">
        {!imageDataUri && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Capture Plant Image</CardTitle>
              <CardDescription>
                Use your camera to take a picture of the plant you want to
                diagnose.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <AlertTitle>Camera Access Required</AlertTitle>
                  <AlertDescription>
                    Please allow camera access to use this feature. You might
                    need to change permissions in your browser settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                onClick={captureImage}
                disabled={!hasCameraPermission || isPending}
                className="w-full"
                size="lg"
              >
                <Camera className="mr-2" />
                Capture Image
              </Button>
              <div className="relative flex items-center w-full">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-sm text-gray-500">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <Button asChild variant="outline" className="w-full">
                <label htmlFor="file-upload">
                  <Upload className="mr-2" />
                  Upload from Device
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </Button>
            </CardFooter>
          </Card>
        )}

        {imageDataUri && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Your Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={imageDataUri}
                alt="Captured plant"
                className="w-full rounded-md"
              />
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4">
              <Button onClick={reset} variant="outline" disabled={isPending}>
                <RefreshCcw className="mr-2" />
                Retake
              </Button>
              <Button onClick={handleDiagnose} disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderCircle className="mr-2 animate-spin" />
                    Diagnosing...
                  </>
                ) : (
                  <>
                    <HeartPulse className="mr-2" />
                    Diagnose Now
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {isPending && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Our AI is analyzing your plant... This may take a moment.
            </p>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {!result.isPlant ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Not a Plant</AlertTitle>
                <AlertDescription>
                  We could not detect a plant in the image. Please try again
                  with a clearer picture.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf />
                      {result.plantName}
                    </CardTitle>
                    <CardDescription>
                      {result.isHealthy ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="mr-2" /> Appears Healthy
                        </span>
                      ) : (
                        <span className="flex items-center text-amber-600">
                          <XCircle className="mr-2" /> {result.disease}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles />
                      {result.remedy.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-2 pl-5">
                      {result.remedy.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer />
                      {result.careTips.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-2 pl-5">
                      {result.careTips.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
