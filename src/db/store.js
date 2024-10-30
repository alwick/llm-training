// import { Pinecone } from '@pinecone-database/pinecone';
import path from "path";
import fs from "fs";
import axios from "axios";
import { LocalIndex } from "vectra";

const api = axios.create({
  baseURL: 'http://localhost:11434/api',
  headers: { "Content-Type": "application/json" },
  timeout: 5000,
});

// const pc = new Pinecone({
//   apiKey: '76facc33-e878-4341-a6dd-507b409eabcf'
// });

const loadData = async () => {
  const indexName = "quickstart";

  await pc.createIndex({
    name: indexName,
    dimension: 3072, // Replace with your model dimensions
    metric: "cosine", // Replace with your model metric
    spec: {
      serverless: {
        cloud: "aws",
        region: "us-east-1",
      },
    },
  });
};

export const initializeVectorStore = async () => {
  const indexPath = path.join(process.cwd(), "/data/index");

  // Ensure directory exists
  if (!fs.existsSync(indexPath)) {
    fs.mkdirSync(indexPath, { recursive: true });
  }

  //Setting up vectra vector db data store locally
  const index = new LocalIndex(indexPath);
  const indexFilePath = path.join(indexPath, "index.json");

  console.log("File Path to index.json: ", indexFilePath);

  return index;
};

export const createIndex = async (index) => {
  if (!(await index.isIndexCreated())) {
    await index.createIndex();
  }
};

//Get vector data for an input using locally run model via ollama
export const getEmbedding = async (query) => {
  try {
    const response = await api.post("/embed", {
      model: "llama3.2",
      input: query,
    });

    // This is an ollamaResponse
    return response.data.embeddings;
  } catch (error) {
    console.error("Error: " + error);
    return [];
  }
};

// Helper function to split content into chunks
export const splitIntoChunks = (lines, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    chunks.push(lines.slice(i, i + chunkSize));
  }
  return chunks;
};

//Add item to vector db
const addItemToVectorStore = async (index, vector, id) => {
  await index.insertItem({
    vector, // Each vector is an array of numbers (number[])
    metadata: { vehicleId: id },
  });
};

export const addItem = async (index, text, vehicleId) => {
  try {
  // get ollama data
  const embedding = await getEmbedding(text);

  // add to vector store
  await addItemToVectorStore(index, embedding[0], vehicleId);
  }
  catch(error) {
    console.log(`Error adding item: ${error.message}`)
  }
};

const queryVectorStore = async (
  index,
  fileContent,
  matchesLimit = 3,
  debug = true
) => {
  try {
    let embeddings = await getEmbedding(fileContent);

    if (embeddings.length === 0) {
      console.log(
        "Error occurred while retrieving vector data - querying item function"
      );
      return [];
    }

    if (Array.isArray(embeddings[0])) {
      embeddings = embeddings[0];
    }

    const results = await index.queryItems(embeddings, matchesLimit);

    if (debug) {
      results.forEach((result) =>
        console.log(`[${result.score}] ${result.item.metadata.vehicleId}`)
      );
    }

    return results;
  } catch (error) {
    console.log("An error occurred while querying vector store.", error.message);
    return [];
  }
};

export const getSimilarQueries = async (index, query, minMatch = 3) => {
  try {
    return await queryVectorStore(
      index,
      query.toLowerCase(),
      minMatch
    );
  } catch (error) {
    console.error(
      "An error occurred while getting similar queries. Path: ",
      " error: ",
      error
    );
  }
};