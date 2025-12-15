//conexion Sequelize a la base de datos
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize(
    process.env.BD_NAME,
    process.env.BD_USER,
    process.env.BD_PASSWORD,
    {
        host: process.env.BD_HOST,
        port: process.env.BD_PORT || 3307,
        dialect: process.env.BD_DIALECT || "mysql",
        logging: false,
    }
);

//probar conexion
export const dbConnection = async () => {
    try{
        await sequelize.authenticate();
        console.log("Conexion a MYSQL exitosa");
    }catch(err){
        console.error("No se pudo conectar a MYSQL:", err.message);
    }
}