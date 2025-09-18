import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

async function seedDatabase() {
  const cropsCollection = collection(db, 'crops');

  const riceData = {
    category: 'Cereal',
    scientific_name: 'Oryza sativa',
    soil_type: 'Clay loam',
    ph_min: 5.5,
    ph_max: 7.5,
    temp_min: 20,
    temp_max: 35,
    rainfall_min: 800,
    rainfall_max: 2000,
    season: 'Kharif',
    fertilizers: 'NPK 10:26:26 before sowing',
    irrigation: 'Maintain 3–5 cm water depth',
    pests: ['stem borer', 'leaf folder'],
  };

  try {
    await setDoc(doc(cropsCollection, 'rice'), riceData);
    console.log('Successfully seeded rice data.');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
    // The script will exit automatically.
    // We explicitly exit here to ensure it does, and to avoid a lengthy timeout.
    process.exit(0);
});
