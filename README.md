# LLM Training project

## Overview
Load data into vector database using ollama encoding.  Then do searches against the data.

### Using
* Create a data directory at the top level
* Add file `inventory.json` in root of data directory
* Install npm modules
```
npm i
```
* Load data
```
npm run buildDb
```
* Query data
```
npm run query
```