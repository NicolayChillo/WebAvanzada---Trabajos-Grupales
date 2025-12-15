import { Matricula } from "../models/Matricula.js";
import { Curso } from "../models/Curso.js";
import { Estudiante } from "../models/Estudiante.js";
import { Op } from "sequelize";

// Validar disponibilidad de cupo en un curso
export const validarCupoDisponible = async (cursoId, excluirMatriculaId = null) => {
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
        throw new Error("Curso no encontrado");
    }

    const whereClause = { cursoId };
    if (excluirMatriculaId) {
        whereClause.id = { [Op.ne]: excluirMatriculaId };
    }

    const matriculasActuales = await Matricula.count({ where: whereClause });

    if (matriculasActuales >= curso.cupo) {
        throw new Error("No hay cupo disponible en este curso");
    }

    return {
        cupoDisponible: curso.cupo - matriculasActuales,
        cupoTotal: curso.cupo
    };
};

// Obtener resumen estadístico de matrículas de un curso
export const obtenerResumenMatriculas = async (cursoId) => {
    const curso = await Curso.findByPk(cursoId);
    if (!curso) {
        throw new Error("Curso no encontrado");
    }

    const matriculados = await Matricula.count({ where: { cursoId } });
    const disponibles = curso.cupo - matriculados;
    const porcentajeOcupacion = ((matriculados / curso.cupo) * 100).toFixed(2);

    return {
        cursoId,
        nombreCurso: curso.nombreCurso,
        cupoTotal: curso.cupo,
        matriculados,
        disponibles,
        porcentajeOcupacion: `${porcentajeOcupacion}%`
    };
};
