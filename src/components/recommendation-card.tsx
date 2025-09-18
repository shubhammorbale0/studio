'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideProps } from 'lucide-react';

interface RecommendationCardProps {
  icon: FC<LucideProps>;
  title: string;
  content: string;
}

export function RecommendationCard({
  icon: Icon,
  title,
  content,
}: RecommendationCardProps) {
  // Simple check to format list-like content
  const formattedContent = content.includes('\n- ') ? (
    <ul className="list-inside list-disc space-y-2">
      {content
        .split('\n')
        .filter((item) => item.trim().length > 0)
        .map((item, index) => (
          <li key={index} className="pl-2">
            {item.replace(/^- /, '')}
          </li>
        ))}
    </ul>
  ) : (
    <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
  );

  return (
    <Card className="flex h-full flex-col shadow-md transition-shadow hover:shadow-xl">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <div className="flex-shrink-0 rounded-lg bg-accent/20 p-3">
          <Icon className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-grow">
          <CardTitle className="font-headline text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        {formattedContent}
      </CardContent>
    </Card>
  );
}
