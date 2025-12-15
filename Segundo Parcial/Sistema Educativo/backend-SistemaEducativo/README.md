# Sistema Educativo - Backend

## Estructura del Proyecto

```
backend-SistemaEducativo/
├── app.js                  # Punto de entrada de la aplicación
├── package.json
└── src/
    ├── config/
    │   └── database.js     # Configuración de Sequelize
    ├── controllers/        # 6 Controllers con funciones exportadas
    │   ├── CursoController.js
    │   ├── DocenteController.js
    │   ├── EstudianteController.js
    │   ├── MatriculaController.js
    │   ├── NotaController.js
    │   └── UsuarioController.js
    ├── models/             # 7 Modelos de Sequelize
    │   ├── Asignatura.js
    │   ├── Curso.js
    │   ├── Docente.js
    │   ├── Estudiante.js
    │   ├── Matricula.js
    │   ├── Nota.js
    │   ├── Usuario.js
    │   ├── relaciones.js   # Definición de relaciones entre modelos
    │   └── index.js        # Exportación centralizada de modelos
    └── routes/             # 6 Archivos de rutas
        ├── cursos.js
        ├── docentes.js
        ├── estudiantes.js
        ├── matriculas.js
        ├── notas.js
        └── usuarios.js
```

## Cambios Realizados

### 1. Controllers (Patrón de Funciones Exportadas)

Todos los controllers fueron modificados para seguir el patrón de **funciones exportadas** en lugar de clases:

**Antes:**
```javascript
class EstudianteController {
  async crear(req, res) { ... }
}
export default new EstudianteController();
```

**Ahora:**
```javascript
export const crearEstudiante = async (req, res) => { ... };
export const obtenerEstudiantes = async (req, res) => { ... };
export const obtenerEstudiante = async (req, res) => { ... };
```

### 2. Validaciones en Controllers

- Validación completa de campos requeridos
- Validación de unicidad (cédula, email, NRC)
- Validación de rangos (calificaciones 0-20, carga horaria 1-40)
- Validación de existencia de registros relacionados
- Mensajes de error claros y específicos

### 3. Responses Simplificadas

**Antes:**
```javascript
res.json({ success: true, data: estudiante });
```

**Ahora:**
```javascript
res.status(200).json(estudiante);
```

### 4. Routes Actualizadas

Todas las rutas fueron actualizadas para importar funciones individuales:

```javascript
import {
    crearEstudiante,
    obtenerEstudiantes,
    obtenerEstudiante,
    // ...
} from "../controllers/EstudianteController.js";

router.get("/", obtenerEstudiantes);
router.post("/", crearEstudiante);
```

### 5. Eliminación de Archivos Innecesarios

- ✓ API_COMPLETA.md
- ✓ ESTRUCTURA_BACKEND.md
- ✓ RESUMEN_EJECUTIVO.md
- ✓ Services (la lógica ahora está en los controllers)
- ✓ Middleware personalizados
- ✓ Utils helpers

## API Endpoints

### Usuarios
- `POST /api/usuarios` - crear usuario
- `GET /api/usuarios` - obtener todos los usuarios
- `GET /api/usuarios/:id` - obtener usuario por id
- `PUT /api/usuarios/:id` - actualizar usuario
- `DELETE /api/usuarios/:id` - eliminar usuario (soft delete)
- `POST /api/usuarios/login` - login
- `GET /api/usuarios/buscar/:termino` - buscar por email

### Estudiantes
- `POST /api/estudiantes` - crear estudiante
- `GET /api/estudiantes` - obtener todos los estudiantes
- `GET /api/estudiantes/:id` - obtener estudiante por id
- `GET /api/estudiantes/buscar/:termino` - buscar por cédula o nombre
- `PUT /api/estudiantes/:id` - actualizar estudiante
- `DELETE /api/estudiantes/:id` - eliminar estudiante (soft delete)
- `GET /api/estudiantes/:id/notas` - obtener notas del estudiante
- `GET /api/estudiantes/:id/historial` - obtener historial académico

### Docentes
- `POST /api/docentes` - crear docente
- `GET /api/docentes` - obtener todos los docentes
- `GET /api/docentes/:id` - obtener docente por id
- `GET /api/docentes/buscar/:termino` - buscar por cédula, nombre o especialidad
- `PUT /api/docentes/:id` - actualizar docente
- `DELETE /api/docentes/:id` - eliminar docente (verifica cursos asignados)
- `POST /api/docentes/:id/asignar-materia` - asignar curso a docente

### Notas
- `POST /api/notas` - crear nota
- `GET /api/notas` - obtener todas las notas (con filtros)
- `GET /api/notas/:id` - obtener nota por id
- `PUT /api/notas/:id` - actualizar nota
- `DELETE /api/notas/:id` - eliminar nota
- `GET /api/notas/:matriculaId/parcial/:parcial/calcular` - calcular nota por parcial
- `GET /api/notas/:matriculaId/promedio-semestre` - calcular promedio del semestre
- `GET /api/notas/estudiante/:estudianteId/estado` - estado académico por estudiante
- `GET /api/notas/estudiante/:estudianteId/reporte` - generar reporte académico

### Cursos
- `POST /api/cursos` - crear curso
- `GET /api/cursos` - obtener todos los cursos (con filtros)
- `GET /api/cursos/:id` - obtener curso por id
- `GET /api/cursos/buscar/:termino` - buscar por NRC o nombre
- `GET /api/cursos/periodo/:periodo` - obtener cursos por período
- `PUT /api/cursos/:id` - actualizar curso
- `DELETE /api/cursos/:id` - eliminar curso (verifica matrículas)
- `GET /api/cursos/:id/estudiantes` - obtener estudiantes del curso

### Matrículas
- `POST /api/matriculas` - crear matrícula (valida cupo)
- `GET /api/matriculas` - obtener todas las matrículas (con filtros)
- `GET /api/matriculas/:id` - obtener matrícula por id
- `GET /api/matriculas/estudiante/:estudianteId` - matrículas de un estudiante
- `GET /api/matriculas/curso/:cursoId` - matrículas de un curso
- `GET /api/matriculas/curso/:cursoId/resumen` - resumen de cupos
- `PUT /api/matriculas/:id` - actualizar matrícula
- `DELETE /api/matriculas/:id` - eliminar matrícula (verifica notas)

## Lógica de Negocio Implementada

### Sistema de Calificaciones
- **Escala:** 0-20 puntos por evaluación
- **Parciales:** 3 parciales, cada uno vale 14 puntos
- **Evaluaciones por parcial:** 4 (tarea, informe, lección, examen)
- **Ponderaciones:**
  - Tarea: 20%
  - Informe: 20%
  - Lección: 20%
  - Examen: 40%
- **Cálculo automático del aporte:** `(calificacion / 20) * 14`
- **Promedio semestre:** suma de 3 parciales (máximo 42 puntos)
- **Estado:**
  - Aprobado: >= 28 puntos
  - Reprobado: < 28 puntos
  - Reprobado anticipado: P1 + P2 < 28 puntos

### Validaciones de Negocio
- **Estudiante/Docente:** cédula única de 10 dígitos
- **Usuario:** email único
- **Curso:** NRC único, validación de cupo
- **Matrícula:** verifica cupo disponible, estudiante no duplicado
- **Docente:** carga horaria entre 1-40 horas
- **Nota:** calificación entre 0-20

### Soft Delete
- Estudiantes, Docentes y Usuarios usan soft delete (estado: activo/inactivo)
- Cursos usan soft delete (estado: activo/inactivo)
- Matrículas y Notas se eliminan permanentemente solo si no hay dependencias

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar el servidor
npm start

# El servidor estará disponible en http://localhost:3000
```

## Tecnologías Utilizadas

- **Node.js** con **Express.js**
- **Sequelize** como ORM
- **PostgreSQL/MySQL** como base de datos
- **CORS** para manejo de peticiones cross-origin
- **ES Modules** (import/export)

## Notas Importantes

1. Los controllers manejan toda la lógica de negocio directamente
2. No hay capa de services separada
3. Las validaciones están en los controllers
4. Las respuestas son simples y directas (no hay estructura {success, data})
5. Los errores se manejan con try/catch en cada función
6. El código sigue el patrón del ejemplo proporcionado
