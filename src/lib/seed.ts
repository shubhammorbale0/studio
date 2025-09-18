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
    maize: {
      category: 'Cereal',
      scientific_name: 'Zea mays',
      soil_type: 'Loamy sand to clay loam',
      ph_min: 5.8,
      ph_max: 7.0,
      temp_min: 21,
      temp_max: 27,
      rainfall_min: 500,
      rainfall_max: 800,
      season: 'Kharif',
      fertilizers: 'Basal dose of NPK, with additional nitrogen at knee-high and tasseling stages.',
      irrigation: 'Irrigate at critical stages: tasseling, silking, and grain filling.',
      pests: ['fall armyworm', 'stem borer'],
    },
    sugarcane: {
      category: 'Cash Crop',
      scientific_name: 'Saccharum officinarum',
      soil_type: 'Deep loamy soils',
      ph_min: 6.5,
      ph_max: 7.5,
      temp_min: 20,
      temp_max: 32,
      rainfall_min: 750,
      rainfall_max: 1200,
      season: 'Perennial',
      fertilizers: 'Heavy application of nitrogen, phosphorus, and potassium.',
      irrigation: 'Frequent irrigation is required, especially during the formative phase.',
      pests: ['early shoot borer', 'mealybug'],
    },
    cotton: {
      category: 'Fiber Crop',
      scientific_name: 'Gossypium',
      soil_type: 'Well-drained deep loamy soils',
      ph_min: 5.8,
      ph_max: 8.0,
      temp_min: 21,
      temp_max: 35,
      rainfall_min: 500,
      rainfall_max: 1000,
      season: 'Kharif',
      fertilizers: 'Foliar spray of urea and DAP is beneficial during flowering and boll development.',
      irrigation: 'Irrigate at flowering and boll formation stages.',
      pests: ['bollworm', 'whitefly'],
    },
    soybean: {
      category: 'Oilseed',
      scientific_name: 'Glycine max',
      soil_type: 'Well-drained loam',
      ph_min: 6.0,
      ph_max: 7.5,
      temp_min: 20,
      temp_max: 30,
      rainfall_min: 400,
      rainfall_max: 600,
      season: 'Kharif',
      fertilizers: 'Use of rhizobium culture is recommended. Low nitrogen, higher phosphorus and potassium.',
      irrigation: 'Critical stages are pod initiation and seed filling.',
      pests: ['girdle beetle', 'leaf miner'],
    },
    chickpea: {
      category: 'Pulse',
      scientific_name: 'Cicer arietinum',
      soil_type: 'Light to heavy black soils',
      ph_min: 6.0,
      ph_max: 8.0,
      temp_min: 10,
      temp_max: 25,
      rainfall_min: 300,
      rainfall_max: 500,
      season: 'Rabi',
      fertilizers: 'Starter dose of nitrogen and phosphorus. Rhizobium inoculation is key.',
      irrigation: 'Generally grown as a rainfed crop; one irrigation can be given at pre-flowering stage if needed.',
      pests: ['pod borer', 'wilt'],
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
