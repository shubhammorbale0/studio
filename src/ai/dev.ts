import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-pest-management-strategies.ts';
import '@/ai/flows/suggest-crops.ts';
import '@/ai/flows/suggest-fertilizers-for-recommended-crops.ts';
import '@/ai/flows/advise-on-irrigation-practices.ts';
import '@/ai/flows/diagnose-plant-health.ts';
