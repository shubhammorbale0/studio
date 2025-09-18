
'use server';

import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
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

export async function getCropByName(name: string): Promise<Crop | null> {
  const ref = doc(db, "crops", name.toLowerCase());
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Crop;
  }
  return null;
}

export async function getCropsByPH(phValue: number): Promise<Crop[]> {
  const q = query(
    collection(db, "crops"),
    where("ph_min", "<=", phValue),
    where("ph_max", ">=", phValue)
  );
  const snapshot = await getDocs(q);
  const crops: Crop[] = [];
  snapshot.forEach((doc) => {
    crops.push({ id: doc.id, ...doc.data() } as Crop);
  });
  return crops;
}
