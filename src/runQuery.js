import { initializeVectorStore, getSimilarQueries } from "./db/store.js";
import { getVehicles, initialize } from "./db/vehicleDb.js";

let minMatch = 0.02;
const index = await initializeVectorStore();

const findVehiclesForQuery = async (queryText) => {
  const similarUserQueries = await getSimilarQueries(index, queryText, 5);

  const set = new Set();

  if (
    !similarUserQueries ||
    !similarUserQueries.length ||
    !similarUserQueries[0]?.score
  ) {
    console.log("No similar queries returned.");
    return [];
  } else {
    let vehicleIds = "";

    similarUserQueries.forEach((vector) => {
      if (!vector) {
        console.log("No vectors received.");
      } else {
        let score = vector.score;

        if (score < 0) {
          score = score * -1;
        }

        const numString = score.toString();
        const decimalPart = numString.split(".")[1];

        // Check if there are exactly 3 decimal places
        if (decimalPart && decimalPart.length >= 3) {
          console.log("Boosting all scores by 100%");
          score = score * 10;
        }

        if (!minMatch || minMatch >= 1) {
          minMatch = 0.15;
        }

        let minScore = minMatch;
        const myScore = Number.parseFloat(score.toPrecision(2));
        console.log(`Score: ${myScore}`);
        console.log(`Min score: ${minScore}`);
        console.log(`result: ${minScore <= myScore}`);

        if (!set.has(vector.score) && minScore <= myScore) {
          set.add(vector.score);
          console.log("_______________________");
          console.log(
            `\nScore: [${vector.score}] Vehicle Id: ${vector.item.metadata.vehicleId}\n`
          );

          vehicleIds += `${vector.item.metadata.vehicleId},`;
        }
      }
    });

    return `( ${vehicleIds.substring(0, vehicleIds.lastIndexOf(","))} )`;
  }
};

export const runVehicleQuery = async (queryText) => {
  // const myQueryText = JSON.stringify({year: 2016, make: "Buick"});
  // const myQueryText = "I am looking for a 2017 Buick";
  const vehicleIds = await findVehiclesForQuery(queryText);

  if ( vehicleIds.indexOf(',') > 0 ) {
    await initialize();
    const dbVehicles = await getVehicles(vehicleIds);
    console.log(dbVehicles);
    return dbVehicles;
  }

  return []
};
