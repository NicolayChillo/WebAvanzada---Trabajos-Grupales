import ClienteClass from '../models/Cliente.js';
import clienteService from '../services/cliente.service.js';
import { Cliente as ClienteModel } from '../models/ClienteSchema.js';

// Funciones de validación reutilizables
const extractDigits = (val) => String(val ?? '').replace(/\D/g, '');
const isValidPhone = (val) => extractDigits(val).length === 10;
const isNonEmptyString = (val) => val !== undefined && String(val).trim() !== '';
const isValidEmail = (email) => {
  if (!isNonEmptyString(email)) return false;
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email));
};

const formatMoney = (val) => {
  const num = Number(val);
  if (Number.isNaN(num)) return '-';
  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatBool = (v) => (v ? 'Sí' : 'No');

// calcular datos del cliente
export const calcular = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, msg: 'Se requiere el parámetro de ruta "id" del cliente' });
    }

    // Obtener cliente existente
    const clienteDoc = await ClienteModel.findById(id);
    if (!clienteDoc) return res.status(404).json({ ok: false, msg: 'Cliente no encontrado' });

    const saldoAnterior = Number(clienteDoc.saldoAnterior);
    const montoCompras = Number(clienteDoc.montoCompras);
    const pagoRealizado = Number(clienteDoc.pagoRealizado);

    if ([saldoAnterior, montoCompras, pagoRealizado].some(v => v === undefined || v === null || isNaN(v))) {
      return res.status(400).json({ ok: false, msg: 'El cliente no tiene los valores financieros necesarios en la base de datos' });
    }

    const cliente = new ClienteClass(saldoAnterior, montoCompras, pagoRealizado);
    const resultado = clienteService.calcularCliente(cliente);

    // Actualizar solo resultado y esMoroso del cliente
    try {
      clienteDoc.resultado = {
        saldoBase: resultado.saldoBase,
        pagoMinimoBase: resultado.pagoMinimoBase,
        esMoroso: resultado.esMoroso,
        interes: resultado.interes,
        multa: resultado.multa,
        saldoActual: resultado.saldoActual,
        pagoMinimo: resultado.pagoMinimo,
        pagoNoIntereses: resultado.pagoNoIntereses
      };
      clienteDoc.esMoroso = resultado.esMoroso;
      await clienteDoc.save();
      return res.json({ ok: true, data: { resultado, cliente: clienteDoc } });
    } catch (saveErr) {
      console.error('No fue posible actualizar el registro en DB:', saveErr.message);
      return res.json({ ok: true, data: { resultado } });
    }
  } catch (err) {
    console.error('Error calcular:', err);
    return res.status(500).json({ ok: false, msg: 'Error interno al calcular datos del cliente' });
  }
};

// crear cliente
export const crearCliente = async (req, res) => {
  try {
    // Validación básica
    const { nombre, email, telefono, direccion, saldoAnterior, montoCompras, pagoRealizado } = req.body;
    const errors = [];
    if (!isNonEmptyString(nombre)) errors.push('El campo "nombre" es obligatorio');
    if (!isNonEmptyString(email)) errors.push('El campo "email" es obligatorio');
    else if (!isValidEmail(email)) errors.push('Formato de email inválido');

    // Validación de teléfono y dirección
    if (!isNonEmptyString(telefono)) errors.push('El campo "telefono" es obligatorio');
    if (!isNonEmptyString(direccion)) errors.push('El campo "direccion" es obligatorio');
    // teléfono: únicamente dígitos y exactamente 10
    if (isNonEmptyString(telefono) && !isValidPhone(telefono)) errors.push('El campo "telefono" debe contener exactamente 10 dígitos');

    // Validar presencia real de los campos financieros
    if (saldoAnterior === undefined || saldoAnterior === '') errors.push('El campo "saldoAnterior" es obligatorio');
    if (montoCompras === undefined || montoCompras === '') errors.push('El campo "montoCompras" es obligatorio');
    if (pagoRealizado === undefined || pagoRealizado === '') errors.push('El campo "pagoRealizado" es obligatorio');

    const nSaldo = Number(saldoAnterior);
    const nMonto = Number(montoCompras);
    const nPago = Number(pagoRealizado);
    if ([nSaldo, nMonto, nPago].some(v => isNaN(v))) errors.push('Los campos financieros deben ser números válidos');
    if ([nSaldo, nMonto, nPago].some(v => v < 0)) errors.push('No se permiten valores negativos en los campos financieros');

    if (errors.length) return res.status(400).json({ ok: false, errors });

    const nuevoCliente = await ClienteModel.create(req.body);
    return res.status(201).json(nuevoCliente);
  } catch (e) {
    console.error('Error al crear el cliente', e.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// obtener todos los clientes
export const obtenerClientes = async (_req, res) => {
  try {
    const clientes = await ClienteModel.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(clientes);
  } catch (e) {
    console.error('Error al obtener los clientes', e.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// obtener cliente por id
export const obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await ClienteModel.findById(req.params.id).lean();
    if (!cliente) return res.status(404).json({ message: 'Cliente no encontrado' });
    return res.status(200).json(cliente);
  } catch (e) {
    console.error('Error al obtener el cliente', e.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// actualizar cliente
export const actualizarCliente = async (req, res) => {
  try {
    const { nombre, email, telefono, direccion, saldoAnterior, montoCompras, pagoRealizado } = req.body;
    const errors = [];
    if (nombre !== undefined && String(nombre).trim() === '') errors.push('El campo "nombre" no puede quedar vacío');
    if (email !== undefined) {
      if (!isNonEmptyString(email)) errors.push('El campo "email" no puede quedar vacío');
      else if (!isValidEmail(email)) errors.push('Formato de email inválido');
    }
    // Si telefono se envía, validar no vacío y 10 dígitos
    if (telefono !== undefined) {
      if (!isNonEmptyString(telefono)) errors.push('El campo "telefono" no puede quedar vacío');
      else if (!isValidPhone(telefono)) errors.push('El campo "telefono" debe contener exactamente 10 dígitos');
    }
    // Si direccion se envía, validar no vacío
    if (direccion !== undefined) {
      if (!isNonEmptyString(direccion)) errors.push('El campo "direccion" no puede quedar vacío');
    }
      // Si los campos financieros se envían, validar que no sean cadenas vacías y sean números no negativos
      const checkField = (fieldValue, fieldName) => {
        if (fieldValue === undefined) return null; // no enviado
        if (fieldValue === '') return `${fieldName} no puede quedar vacío`;
        const num = Number(fieldValue);
        if (isNaN(num)) return `${fieldName} debe ser un número válido`;
        if (num < 0) return `${fieldName} no puede ser negativo`;
        return null;
      };

      const f1 = checkField(saldoAnterior, 'saldoAnterior');
      const f2 = checkField(montoCompras, 'montoCompras');
      const f3 = checkField(pagoRealizado, 'pagoRealizado');
      [f1, f2, f3].forEach(f => { if (f) errors.push(f); });

    if (errors.length) return res.status(400).json({ ok: false, errors });

    const clienteActualizado = await ClienteModel.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!clienteActualizado) return res.status(404).json({ message: 'Cliente no encontrado' });
    return res.status(200).json(clienteActualizado);
  } catch (e) {
    console.error('Error al actualizar el cliente', e.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// eliminar cliente
export const eliminarCliente = async (req, res) => {
  try {
    const clienteEliminado = await ClienteModel.findByIdAndDelete(req.params.id).lean();
    if (!clienteEliminado) return res.status(404).json({ message: 'Cliente no encontrado' });
    return res.status(200).json({ message: 'Cliente eliminado correctamente' });
  } catch (e) {
    console.error('Error al eliminar el cliente', e.message);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// estadisticas
export const estadisticas = async (_req, res) => {
  try {
    const total = await ClienteModel.countDocuments();
    const morosos = await ClienteModel.countDocuments({ esMoroso: true });
    const noMorosos = total - morosos;
    return res.json({ ok: true, data: { total, morosos, noMorosos } });
  } catch (err) {
    console.error('Error estadisticas:', err);
    return res.status(500).json({ ok: false, msg: 'Error interno al calcular estadisticas' });
  }
};

// obtener lista de morosos
export const obtenerMorosos = async (_req, res) => {
  try {
    const morosos = await ClienteModel.find({ esMoroso: true }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(morosos);
  } catch (err) {
    console.error('Error obtenerMorosos:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// obtener lista de no morosos (incluye clientes sin cálculo)
export const obtenerNoMorosos = async (_req, res) => {
  try {
    const noMorosos = await ClienteModel.find({ $or: [{ esMoroso: false }, { esMoroso: { $exists: false } }] }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(noMorosos);
  } catch (err) {
    console.error('Error obtenerNoMorosos:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// exportar PDF
export const exportPDF = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, msg: 'Se requiere el parámetro de ruta "id"' });

    const cliente = await ClienteModel.findById(id).lean();
    if (!cliente) return res.status(404).json({ ok: false, msg: 'Cliente no encontrado' });

    // Generar PDF usando pdfkit
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ margin: 40 });

    // Set headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cliente_${cliente._id}.pdf"`);

    // Pipe PDF al response
    doc.pipe(res);

    const accent = '#5b8def';
    const muted = '#6b7280';

    const addTitle = (title) => {
      doc.moveDown(0.6);
      doc.fillColor('#111').fontSize(14).text(title, { underline: false });
      doc.moveDown(0.2);
    };

    const addRow = (label, value) => {
      const safeVal = value ?? '-';
      const y = doc.y;
      doc.fillColor(muted).fontSize(10).text(label, 40, y, { width: 150 });
      doc.fillColor('#111').fontSize(12).text(String(safeVal), 200, y, { width: 340 });
      doc.moveDown(0.3);
    };

    // Cabecera
    doc.fillColor(accent).fontSize(10).text('Banco Peluche', { align: 'right' });
    doc.fillColor('#111').fontSize(20).text('Ficha del cliente', { align: 'left' });
    doc.moveDown(0.4);
    doc.fillColor(muted).fontSize(11).text('Resumen generado automáticamente con los datos registrados.');
    doc.moveDown(0.8);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor(accent).lineWidth(1).stroke();
    doc.moveDown(0.8);

    addTitle('Datos personales');
    addRow('ID', cliente._id);
    addRow('Nombre', cliente.nombre || '-');
    addRow('Email', cliente.email || '-');
    addRow('Teléfono', cliente.telefono || '-');
    addRow('Dirección', cliente.direccion || '-');

    addTitle('Datos financieros');
    addRow('Saldo anterior', formatMoney(cliente.saldoAnterior));
    addRow('Monto compras', formatMoney(cliente.montoCompras));
    addRow('Pago realizado', formatMoney(cliente.pagoRealizado));

    addTitle('Resultado del cálculo');
    if (cliente.resultado) {
      addRow('Saldo base', formatMoney(cliente.resultado.saldoBase));
      addRow('Interés', formatMoney(cliente.resultado.interes));
      addRow('Multa', formatMoney(cliente.resultado.multa));
      addRow('Saldo actual', formatMoney(cliente.resultado.saldoActual));
      addRow('Pago mínimo', formatMoney(cliente.resultado.pagoMinimo));
      addRow('Pago sin intereses', formatMoney(cliente.resultado.pagoNoIntereses));
      addRow('Es moroso', formatBool(cliente.resultado.esMoroso ?? cliente.esMoroso));
    } else {
      addRow('Resultado', 'No hay cálculo disponible.');
    }

    doc.moveDown(1);
    doc.fillColor(muted).fontSize(10).text('Generado por Banco Peluche', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error('Error exportPDF:', err);
    return res.status(500).json({ ok: false, msg: 'Error al generar PDF' });
  }
};

// exportar XLSX
export const exportXLSX = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ ok: false, msg: 'Se requiere el parámetro de ruta "id"' });

    const cliente = await ClienteModel.findById(id).lean();
    if (!cliente) return res.status(404).json({ ok: false, msg: 'Cliente no encontrado' });

    // Generar hoja con los datos del cliente
    const xlsxModule = await import('xlsx');
    const XLSX = xlsxModule.default || xlsxModule;
    const data = [
      ['Ficha del cliente', 'Banco Peluche'],
      ['Fecha de generación', new Date().toLocaleString('es-MX')],
      [''],
      ['Datos personales', ''],
      ['ID', cliente._id.toString()],
      ['Nombre', cliente.nombre || '-'],
      ['Email', cliente.email || '-'],
      ['Teléfono', cliente.telefono || '-'],
      ['Dirección', cliente.direccion || '-'],
      [''],
      ['Datos financieros', ''],
      ['Saldo anterior', formatMoney(cliente.saldoAnterior)],
      ['Monto compras', formatMoney(cliente.montoCompras)],
      ['Pago realizado', formatMoney(cliente.pagoRealizado)]
    ];

    if (cliente.resultado) {
      data.push([''], ['Resultado del cálculo', '']);
      data.push(['Saldo base', formatMoney(cliente.resultado.saldoBase)]);
      data.push(['Interés', formatMoney(cliente.resultado.interes)]);
      data.push(['Multa', formatMoney(cliente.resultado.multa)]);
      data.push(['Saldo actual', formatMoney(cliente.resultado.saldoActual)]);
      data.push(['Pago mínimo', formatMoney(cliente.resultado.pagoMinimo)]);
      data.push(['Pago sin intereses', formatMoney(cliente.resultado.pagoNoIntereses)]);
      data.push(['Es moroso', formatBool(cliente.resultado.esMoroso ?? cliente.esMoroso)]);
    }

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    ws['!cols'] = [{ wch: 22 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Cliente');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="cliente_${cliente._id}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (err) {
    console.error('Error exportXLSX:', err);
    return res.status(500).json({ ok: false, msg: 'Error al generar Excel' });
  }
};
