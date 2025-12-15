import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Matricula = sequelize.define(
	"Matricula",
	{
		idMatricula: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		estudianteId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: { model: "estudiantes", key: "idEstudiante" }
		},
		cursoId: {
			type: DataTypes.INTEGER,
			allowNull: true,
			references: { model: "cursos", key: "idCurso" }
		},
		estado: {
			type: DataTypes.ENUM("activa", "inactiva"),
			allowNull: false,
			defaultValue: "activa"
		},
		fechaMatricula: {
			type: DataTypes.DATEONLY,
			allowNull: false
		}
	},
	{
		tableName: "matriculas",
		timestamps: false,
		paranoid: true
	}
);

export default Matricula;