import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

async function seedDatabase() {
  const cropsCollection = collection(db, 'crops');

  const cropsData = {
    rice: {
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
    },
    wheat: {
      category: 'Cereal',
      scientific_name: 'Triticum aestivum',
      soil_type: 'Loamy',
      ph_min: 6.0,
      ph_max: 7.5,
      temp_min: 10,
      temp_max: 25,
      rainfall_min: 300,
      rainfall_max: 900,
      season: 'Rabi',
      fertilizers: 'Urea top-dressing at 30 & 60 DAS',
      irrigation: 'Critical stages: crown root initiation, heading',
      pests: ['rust', 'aphids'],
    },
  };

  try {
    for (const [cropId, data] of Object.entries(cropsData)) {
      await setDoc(doc(cropsCollection, cropId), data);
      console.log(`Successfully seeded ${cropId} data.`);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
    // The script will exit automatically.
    // We explicitly exit here to ensure it does, and to avoid a lengthy timeout.
    process.exit(0);
});
