import { Sequelize, QueryTypes } from "sequelize";
import connection from '../../config.js'

const sequelize = new Sequelize(
  connection.database,
  connection.user,
  connection.password,
  {
    host: connection.host,
    dialect: "mysql",
  }
);

export const initialize = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export const getVehicles = async (ids) => {
  try {
    const vehicles = await sequelize.query(
      `select 
            i.id as vehicleId, 
            i.year, 
            m.name as make, 
            mo.name as model, 
            t.name as trim,
            i.mileage,
            i.vin
        from inventory i
        JOIN make m on m.id = i.make_id 
        join model mo on mo.id = i.model_id 
        join trim t on t.id = i.trim_id 
        where i.status_id = 1
        ${ids ? `AND i.id IN ${ids}`: ''};`,
      {
        type: QueryTypes.SELECT,
      }
    );

    return vehicles;
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
