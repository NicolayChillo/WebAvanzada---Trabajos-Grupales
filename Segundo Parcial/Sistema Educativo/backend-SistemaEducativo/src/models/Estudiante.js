import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Estudiante = sequelize.define(
    //Nombre del modelo
    "Estudiante",
    {
        idEstudiante: { 
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
        nombreEstudiante: { 
            type: DataTypes.STRING(100), 
            allowNull: false 
        },
        cedula: { 
            type: DataTypes.STRING(10), 
            allowNull: false, 
            unique: true, 
            validate: { len: [10, 10], isNumeric: true } 
        },
        fechaNacimiento: {  
            type: DataTypes.DATEONLY, 
            allowNull: false 
        },
        direccion: { 
            type: DataTypes.STRING(200), 
            allowNull: false 
        },
        telefono: { 
            type: DataTypes.STRING(10), 
            allowNull: false, 
            validate: { len: [10, 10], isNumeric: true } 
        },
        foto: { 
            type: DataTypes.STRING(200), 
            allowNull: true 
        },
        estado: { 
            type: DataTypes.ENUM("activo", "inactivo"), 
            allowNull: false, 
            defaultValue: "activo" 
        }
    },
    {
        tableName: "estudiantes",
        timestamps: false,
        paranoid: true
    }
);

export default Estudiante;