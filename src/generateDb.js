import path from "path";
import fs from "fs";
import {
  initializeVectorStore,
  createIndex,
  splitIntoChunks,
  addItem,
} from "./db/store.js";
import { initialize, getVehicles } from "./db/vehicleDb.js";

// const importFile = path.join(process.cwd(), "/data/inventory.json");
// const data = JSON.parse(fs.readFileSync(importFile));

await initialize();
const data = await getVehicles();

const index = await initializeVectorStore();
await createIndex(index);

const batches = splitIntoChunks(data, 15);
for (let i = 0; i < batches.length; i++) {
  console.log(`Processing chunk: ${i + 1} of ${batches.length}`);

  await Promise.all(
    batches[i].map(async (row) => {
      const text = `I am looking for a ${row.year} ${row.make} ${row.model}`
      await addItem(index, text, row.vehicleId);
    })
  );
}
