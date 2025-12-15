import express from "express";
import cors from "cors";
import { iniciarRelaciones } from "./src/models/relaciones.js";
import { dbConnection, sequelize } from "./src/config/database.js";

// Importar rutas
import estudiantesRoutes from "./src/routes/estudiantesRoutes.js";
import docentesRoutes from "./src/routes/docentesRoutes.js";
import notasRoutes from "./src/routes/notasRoutes.js";
import usuariosRoutes from "./src/routes/usuariosRoutes.js";
import cursosRoutes from "./src/routes/cursosRoutes.js";
import matriculasRoutes from "./src/routes/matriculasRoutes.js";
import asignaturasRoutes from "./src/routes/asignaturasRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar relaciones de Sequelize
iniciarRelaciones();

// Rutas principales
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api/docentes", docentesRoutes);
app.use("/api/notas", notasRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/cursos", cursosRoutes);
app.use("/api/matriculas", matriculasRoutes);
app.use("/api/asignaturas", asignaturasRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido al Sistema Educativo API"
  });
});

//conectar a la base de datos
await dbConnection();
if (process.env.NODE_ENV !== "production") {
    try {
        await sequelize.sync({ alter: true });
        console.log("Tablas sincronizadas con la base de datos");
    } catch (err) {
        console.error("Error al sincronizar tablas:", err.message);
    }
}
// iniciar el servidor
app.listen(PORT, () => {
    const baseUrl = `http://localhost:${PORT}`;
    console.log(`Servidor corriendo en ${baseUrl}`);
});