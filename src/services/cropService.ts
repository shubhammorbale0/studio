
'use server';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Crop {
  id: string;
  category: string;
  scientific_name: string;
  soil_type: string;
  ph_min: number;
  ph_max: number;
  temp_min: number;
  temp_max: number;
  rainfall_min: number;
  rainfall_max: number;
  season: string;
  fertilizers: string;
  irrigation: string;
  pests: string[];
}

export async function getCrops(): Promise<Crop[]> {
  const querySnapshot = await getDocs(collection(db, "crops"));
  const crops: Crop[] = [];
  querySnapshot.forEach((doc) => {
    crops.push({ id: doc.id, ...doc.data() } as Crop);
  });
  console.log('Fetched crops:', crops);
  return crops;
}
