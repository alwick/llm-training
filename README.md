# LLM Training project

## Overview
Load data into vector database using ollama encoding.  Then do searches against the data.

### Using
* Create a data directory at the top level
* Add file `inventory.json` in root of data directory
```
    [
        {
            "id": 7470,
            "search": "2018 Buick LaCrosse Hybrid Premium Buick 2018 LaCrosse 2018 LaCrosse Buick 2018 Buick LaCrosse 2018 1G4ZR5SZ2JU140045"
        },
    ]
```
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