import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Asignatura = sequelize.define(
    //Nombre del modelo
    "Asignatura",
    {
        idAsignatura: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        nombreAsignatura: { 
            type: DataTypes.STRING(100),
            allowNull: false
        },
        codigoAsignatura: { 
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        creditos: { 
            type: DataTypes.INTEGER,
            allowNull: false
        },
        nivel: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        estado: {
            type: DataTypes.ENUM("activa", "inactiva"),
            allowNull: false,
            defaultValue: "activa"
        }
    },
    {
        tableName: "asignaturas",
        timestamps: false,
        paranoid: true
    }
);

export default Asignatura;