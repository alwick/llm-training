import { initializeVectorStore, getSimilarQueries } from "./db/store.js";

let minMatch = 0.15;
const index = await initializeVectorStore();

const findVehiclesForQuery = async (queryText) => {
  const similarUserQueries = await getSimilarQueries(
    index,
    "Find me a 2019 Buick",
    3
  );

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

        console.log(
          "Score:" +
            Number.parseFloat(score.toPrecision(2)) +
            "\nMin score:" +
            minScore +
            `\n result: ${
              minScore <= Number.parseFloat(score.toPrecision(2))
            }\n`
        );

        if (
          !set.has(vector.score) &&
          minScore <= Number.parseFloat(score.toPrecision(2))
        ) {
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

const myQueryText = `the client is looking for a 2017 Buick Verano`;

console.log(await findVehiclesForQuery(myQueryText));
