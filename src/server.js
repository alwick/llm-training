import express from 'express';
import { runVehicleQuery } from './runQuery.js';

const app = express();

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

app.use(express.json()); // for parsing application/json

app.post("/getVehicles", async (req, res, next) => {
 const query = req.body.query;
 const vehicles = await runVehicleQuery(query)

 res.json({"vehicles": vehicles});
});