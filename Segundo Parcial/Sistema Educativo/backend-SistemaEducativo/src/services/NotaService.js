import { Nota } from "../models/Nota.js";
import { Matricula } from "../models/Matricula.js";
import { Estudiante } from "../models/Estudiante.js";
import { Curso } from "../models/Curso.js";
import { Asignatura } from "../models/Asignatura.js";

// Constantes para cálculos académicos
const ESCALA_MAXIMA = 20;
const PUNTAJE_PARCIAL = 14;
const PUNTAJE_MAXIMO_SEMESTRE = 42;
const PUNTAJE_MINIMO_APROBACION = 28;

// Calcular aporte de una calificación
export const calcularAporte = (calificacion) => {
    return (calificacion / ESCALA_MAXIMA) * PUNTAJE_PARCIAL;
};

// Calcular nota total de un parcial (suma de 4 evaluaciones)
export const calcularNotaParcial = async (matriculaId, parcial) => {
    const parcialNum = parseInt(parcial);

    if (![1, 2, 3].includes(parcialNum)) {
        throw new Error("El parcial debe ser 1, 2 o 3");
    }

    const notas = await Nota.findAll({
        where: { matriculaId, parcial: parcialNum }
    });

    if (notas.length === 0) {
        throw new Error("No hay notas registradas para este parcial");
    }

    const notaParcial = notas.reduce((sum, nota) => sum + nota.aporte, 0);

    return {
        matriculaId,
        parcial: parcialNum,
        notaParcial: Math.min(notaParcial, PUNTAJE_PARCIAL),
        notaMaxima: PUNTAJE_PARCIAL,
        detalles: notas
    };
};

// Calcular promedio del semestre (suma de 3 parciales)
export const calcularPromedioSemestre = async (matriculaId) => {
    const matricula = await Matricula.findByPk(matriculaId);
    if (!matricula) {
        throw new Error("Matrícula no encontrada");
    }

    let promedioTotal = 0;
    const parciales = {};

    for (let parcial = 1; parcial <= 3; parcial++) {
        const notas = await Nota.findAll({
            where: { matriculaId, parcial }
        });

        const notaParcial = notas.reduce((sum, nota) => sum + nota.aporte, 0);
        const parcialNormalizado = Math.min(notaParcial, PUNTAJE_PARCIAL);
        parciales[`parcial${parcial}`] = parcialNormalizado;
        promedioTotal += parcialNormalizado;
    }

    const reprobadoAnticipado = (parciales.parcial1 + parciales.parcial2) < PUNTAJE_MINIMO_APROBACION;

    return {
        matriculaId,
        parciales,
        promedioSemestre: promedioTotal,
        promedioMaximo: PUNTAJE_MAXIMO_SEMESTRE,
        estado: promedioTotal >= PUNTAJE_MINIMO_APROBACION ? "aprobado" : "reprobado",
        reprobadoAnticipado
    };
};

// Obtener estado académico de un estudiante
export const obtenerEstadoAcademico = async (estudianteId, cursoId = null) => {
    const whereClause = {
        estudianteId,
        ...(cursoId && { cursoId })
    };

    const matriculas = await Matricula.findAll({
        where: whereClause,
        include: [
            { model: Curso, as: "curso", include: [{ model: Asignatura, as: "asignatura" }] },
            { model: Nota, as: "notas" }
        ]
    });

    if (matriculas.length === 0) {
        throw new Error("No hay matrículas para este estudiante");
    }

    const estado = matriculas.map(matricula => {
        let promedioTotal = 0;
        const parciales = {};

        for (let parcial = 1; parcial <= 3; parcial++) {
            const notasParcial = (matricula.notas || []).filter(n => n.parcial === parcial);
            const notaParcial = notasParcial.reduce((sum, n) => sum + n.aporte, 0);
            parciales[`parcial${parcial}`] = Math.min(notaParcial, PUNTAJE_PARCIAL);
            promedioTotal += parciales[`parcial${parcial}`];
        }

        return {
            cursoId: matricula.cursoId,
            asignatura: matricula.curso?.asignatura?.nombreAsignatura,
            parciales,
            promedioSemestre: promedioTotal,
            promedioMaximo: PUNTAJE_MAXIMO_SEMESTRE,
            estado: promedioTotal >= PUNTAJE_MINIMO_APROBACION ? "aprobado" : "reprobado"
        };
    });

    return {
        estudianteId,
        estado
    };
};

// Generar reporte académico completo de un estudiante
export const generarReporteAcademico = async (estudianteId) => {
    const estudiante = await Estudiante.findByPk(estudianteId, {
        include: [{
            model: Matricula,
            as: "matriculas",
            include: [{ model: Nota, as: "notas" }, { model: Curso, as: "curso", include: [{ model: Asignatura, as: "asignatura" }] }]
        }]
    });

    if (!estudiante || estudiante.estado === "inactivo") {
        throw new Error("Estudiante no encontrado");
    }

    let aprobadas = 0;
    let reprobadas = 0;
    const detalle = [];

    estudiante.matriculas.forEach(matricula => {
        let promedioTotal = 0;

        for (let parcial = 1; parcial <= 3; parcial++) {
            const notas = (matricula.notas || []).filter(n => n.parcial === parcial);
            const notaParcial = notas.reduce((sum, n) => sum + n.aporte, 0);
            promedioTotal += Math.min(notaParcial, PUNTAJE_PARCIAL);
        }

        const aprobada = promedioTotal >= PUNTAJE_MINIMO_APROBACION;
        if (aprobada) aprobadas++;
        else reprobadas++;

        detalle.push({
            curso: matricula.curso?.asignatura?.nombreAsignatura || matricula.curso?.nrc,
            promedio: promedioTotal,
            promedioMaximo: PUNTAJE_MAXIMO_SEMESTRE,
            estado: aprobada ? "aprobado" : "reprobado"
        });
    });

    return {
        estudiante: estudiante.nombreEstudiante ?? `${estudiante.nombres ?? ""} ${estudiante.apellidos ?? ""}`.trim(),
        cedula: estudiante.cedula,
        resumenSemestre: {
            aprobadas,
            reprobadas,
            total: estudiante.matriculas.length,
            porcentajeAprobacion: estudiante.matriculas.length > 0 
                ? ((aprobadas / estudiante.matriculas.length) * 100).toFixed(2) 
                : "0.00"
        },
        detalle
    };
};
