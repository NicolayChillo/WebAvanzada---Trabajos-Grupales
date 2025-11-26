import express from "express"; 
import cors from "cors"; 
import { connectDB } from "./config/mongo.js";
import clienteRoutes from "./routes/cliente.routes.js";

import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas base
app.use('/api/clientes', clienteRoutes);

// Conectar a la DB 
await connectDB();
// Iniciar el servidor con puerto por defecto si no existe la variable de entorno
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));