import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Docente = sequelize.define(
    //Nombre del modelo
    "Docente",
    {
        idDocente: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        usuarioId: { 
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true, 
            references: { model: "usuarios", key: "idUsuario" } 
        },
        nombreDocente: {  
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        titulo: { 
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        especialidad: { 
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        cargaHoraria: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        }
    },
    {
        tableName: "docentes",
        timestamps: false,
        paranoid: true
    }
);

export default Docente;