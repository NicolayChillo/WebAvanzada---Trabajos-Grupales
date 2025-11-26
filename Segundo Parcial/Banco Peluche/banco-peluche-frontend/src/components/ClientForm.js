import { useState, useEffect } from 'react';
import { createClient, updateClient, calculateClient } from '../services/api';

export default function ClientForm({ onCreated, editId, initial, onUpdated, onCancel }) {
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    saldoAnterior: '',
    montoCompras: '',
    pagoRealizado: ''
  });

  useEffect(() => {
    if (initial) {
      setForm({
        nombre: initial.nombre || '',
        email: initial.email || '',
        telefono: initial.telefono || '',
        direccion: initial.direccion || '',
        saldoAnterior: initial.saldoAnterior ?? '',
        montoCompras: initial.montoCompras ?? '',
        pagoRealizado: initial.pagoRealizado ?? ''
      });
    }
  }, [initial]);

  const onChange = (e) => {
    const { name, value } = e.target;
    // prevenir valores negativos en campos numéricos específicos
    const numericFields = ['saldoAnterior', 'montoCompras', 'pagoRealizado'];
    if (numericFields.includes(name)) {
      const v = value === '' ? '' : Number(value);
      if (v !== '' && !isNaN(v) && v < 0) {
        // alerta inmediata y no actualizar el estado con el valor negativo
        alert('No se permiten valores negativos en los campos financieros');
        return;
      }
    }
    // Para teléfono, permitir solo dígitos (facilita validación de 10 dígitos)
    if (name === 'telefono') {
      const onlyDigits = value.replace(/\D/g, '');
      setForm({ ...form, [name]: onlyDigits });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const submit = async (e) => {
    e.preventDefault();
    // Validaciones cliente-side
    if (String(form.telefono).trim() === '') {
      alert('El campo teléfono es obligatorio');
      return;
    }
    const telefonoDigits = String(form.telefono).replace(/\D/g, '');
    if (telefonoDigits.length !== 10) {
      alert('El teléfono debe contener exactamente 10 dígitos');
      return;
    }
    if (String(form.direccion).trim() === '') {
      alert('El campo dirección es obligatorio');
      return;
    }

    const payload = {
      nombre: form.nombre,
      email: form.email,
      telefono: form.telefono,
      direccion: form.direccion,
      saldoAnterior: Number(form.saldoAnterior || 0),
      montoCompras: Number(form.montoCompras || 0),
      pagoRealizado: Number(form.pagoRealizado || 0)
    };
    try {
      if (editId) {
        await updateClient(editId, payload);
        if (onUpdated) onUpdated();
      } else {
        // Crear cliente
        const created = await createClient(payload);

        // Intentar obtener el id del cliente creado (según respuesta del backend)
        const id = created && (created._id || (created.data && created.data._id));

        // Si se creó correctamente, ejecutar el cálculo automáticamente
        if (id) {
          try {
            await calculateClient(id);
          } catch (calcErr) {
            console.error('Error al calcular automáticamente después de crear cliente', calcErr);
          }
        }

        // Resetear formulario y notificar al padre
        setForm({ nombre: '', email: '', telefono: '', direccion: '', saldoAnterior: '', montoCompras: '', pagoRealizado: '' });
        if (onCreated) onCreated();
      }
    } catch (err) {
      console.error('Error creating/updating client', err);
      alert('Error al crear/actualizar cliente');
    }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h3>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
      <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={onChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={onChange} type="email" />
      <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={onChange} />
      <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={onChange} />
      <div className="row">
        <input name="saldoAnterior" placeholder="Saldo anterior" value={form.saldoAnterior} onChange={onChange} type="number" />
        <input name="montoCompras" placeholder="Monto compras" value={form.montoCompras} onChange={onChange} type="number" />
        <input name="pagoRealizado" placeholder="Pago realizado" value={form.pagoRealizado} onChange={onChange} type="number" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn primary" type="submit">{editId ? 'Actualizar cliente' : 'Crear cliente'}</button>
        {editId && <button type="button" className="btn" onClick={() => { if (onCancel) onCancel(); }}>Cancelar</button>}
      </div>
    </form>
  );
}
