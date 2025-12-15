import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Curso = sequelize.define(
    //Nombre del modelo
    "Curso",
    {
        idCurso: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true 
        },
        asignaturaId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "asignaturas", key: "idAsignatura" }
        },
        docenteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "docentes", key: "idDocente" }
        },
        nrc: { 
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },
        periodoAcademico: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        cupoMaximo: { 
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "cursos",
        timestamps: false,
        paranoid: true
    }
);

export default Curso;