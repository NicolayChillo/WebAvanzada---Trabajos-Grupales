import { Usuario } from "./Usuario.js";
import { Estudiante } from "./Estudiante.js";
import { Docente } from "./Docente.js";
import { Asignatura } from "./Asignatura.js";
import { Curso } from "./Curso.js";
import { Matricula } from "./Matricula.js";
import { Nota } from "./Nota.js";

export const iniciarRelaciones = () => {
    // Usuario - Estudiante (1:1)
    Usuario.hasOne(Estudiante, { foreignKey: "usuarioId", onDelete: "CASCADE", onUpdate: "CASCADE" });
    Estudiante.belongsTo(Usuario, { foreignKey: "usuarioId", onDelete: "CASCADE", onUpdate: "CASCADE" });

    // Usuario - Docente (1:1)
    Usuario.hasOne(Docente, { foreignKey: "usuarioId", onDelete: "CASCADE", onUpdate: "CASCADE" });
    Docente.belongsTo(Usuario, { foreignKey: "usuarioId", onDelete: "CASCADE", onUpdate: "CASCADE" });

    // Docente - Curso (1:N)
    Docente.hasMany(Curso, { foreignKey: "docenteId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "cursos" });
    Curso.belongsTo(Docente, { foreignKey: "docenteId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "docente" });

    // Asignatura - Curso (1:N)
    Asignatura.hasMany(Curso, { foreignKey: "asignaturaId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "cursos" });
    Curso.belongsTo(Asignatura, { foreignKey: "asignaturaId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "asignatura" });

    // Estudiante - Matricula (1:N)
    Estudiante.hasMany(Matricula, { foreignKey: "estudianteId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "matriculas" });
    Matricula.belongsTo(Estudiante, { foreignKey: "estudianteId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "estudiante" });

    // Curso - Matricula (1:N)
    Curso.hasMany(Matricula, { foreignKey: "cursoId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "matriculas" });
    Matricula.belongsTo(Curso, { foreignKey: "cursoId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "curso" });

    // Matricula - Nota (1:N)
    Matricula.hasMany(Nota, { foreignKey: "matriculaId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "notas" });
    Nota.belongsTo(Matricula, { foreignKey: "matriculaId", onDelete: "RESTRICT", onUpdate: "CASCADE", as: "matricula" });

    // Docente - Nota (1:N)
    Docente.hasMany(Nota, { foreignKey: "docenteId", onDelete: "SET NULL", onUpdate: "CASCADE", as: "notas" });
    Nota.belongsTo(Docente, { foreignKey: "docenteId", onDelete: "SET NULL", onUpdate: "CASCADE", as: "docente" });
};

export default iniciarRelaciones;
