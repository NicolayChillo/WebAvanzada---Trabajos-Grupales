import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Nota = sequelize.define(
    //Nombre del modelo
    "Nota",
    {
        idNota: { 
            type: DataTypes.INTEGER, 
            primaryKey: true, 
            autoIncrement: true 
        },
        matriculaId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            references: { model: "matriculas", key: "idMatricula" } },
        docenteId: { 
            type: DataTypes.INTEGER, 
            allowNull: true, 
            references: { model: "docentes", key: "idDocente" } 
        },
        porcentaje: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate:{min: 0, max: 100} 
        },
        aporte: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate:{min: 0, max: 100} 
        },
        parcial: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            validate:{min: 1, max: 3} 
        },
        tipoEvaluacion: { 
            type: DataTypes.ENUM("examen", "tarea", "proyecto", "participacion"), 
            allowNull: false 
        },
        calificacion: { 
            type: DataTypes.FLOAT, 
            allowNull: false, 
            validate:{min: 0, max: 20} 
        },
        observaciones: { 
            type: DataTypes.TEXT, 
            allowNull: true 
        },
        fechaEvaluacion: { 
            type: DataTypes.DATEONLY, 
            allowNull: false 
        }
    },
    {
        tableName: "notas",
        timestamps: false,
        paranoid: true
    }
);

export default Nota;