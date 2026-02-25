'use client';

import { useEffect, useMemo, useState } from 'react';

interface TemplateItem {
  id: string;
  name: string;
  description: string | null;
  version: string;
  isActive: boolean;
}

const SAMPLE_PAYLOAD = {
  contrato: {
    ciudad_firma: 'Santiago',
    fecha_inicio: '2026-03-01',
  },
  arrendadora: {
    razon_social: 'Hommie SpA',
    rut: '76123456-7',
    domicilio: 'Av. Providencia 123',
    email: 'contacto@hommie.cl',
    cuenta: { banco: 'Banco de Chile', tipo: 'Corriente', numero: '12345678', email_pago: 'pagos@hommie.cl' },
    personeria: { fecha: '2026-01-01', notaria: 'Notaría Demo', ciudad: 'Santiago', notario_nombre: 'Juan Demo' },
    representante: { nombre: 'María Pérez', rut: '12345678-5', nacionalidad: 'Chilena', estado_civil: 'Soltera', profesion: 'Ingeniera' },
  },
  propietario: { nombre: 'Pedro Soto', rut: '11111111-1' },
  arrendatario: {
    nombre: 'Carlos Díaz',
    rut: '22222222-2',
    nacionalidad: 'Chilena',
    estado_civil: 'Soltero',
    email: 'carlos@example.com',
    telefono: '+56912345678',
    domicilio: 'Calle Falsa 123',
  },
  inmueble: { condominio: 'Condominio Demo', direccion: 'Dirección 123', comuna: 'Providencia', ciudad: 'Santiago', numero_depto: '1203' },
  renta: { monto_clp: 650000, monto_uf: 16.75, dia_limite_pago: 5, mes_primer_reajuste: 'Marzo' },
  garantia: { monto_total_clp: 650000, pago_inicial_clp: 650000, cuotas: [] },
  flags: { hay_aval: false, mascota_permitida: false, depto_amoblado: false },
  declaraciones: { fondos_origen_texto: 'Ingresos por trabajo dependiente.' },
};

export default function AdminContractsPage() {
  const [token, setToken] = useState('');
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templateId, setTemplateId] = useState('');
  const [payloadText, setPayloadText] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [validation, setValidation] = useState<any | null>(null);
  const [issueResult, setIssueResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  useEffect(() => {
    const saved = window.localStorage.getItem('admin_api_token');
    if (saved) setToken(saved);
  }, []);

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token.trim()) {
      h.Authorization = `Bearer ${token.trim()}`;
      h['x-admin-token'] = token.trim();
    }
    return h;
  }, [token]);

  async function loadTemplates() {
    setErrorText('');
    try {
      const response = await fetch('/api/templates', { headers });
      const data = await response.json();
      if (!response.ok) {
        setErrorText(data.message ?? data.error ?? 'No se pudieron cargar templates');
        return;
      }
      setTemplates(data.templates ?? []);
      const active = (data.templates ?? []).find((x: TemplateItem) => x.isActive);
      if (active) setTemplateId(active.id);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Error cargando templates');
    }
  }

  async function onValidate() {
    setLoading(true);
    setErrorText('');
    setIssueResult(null);
    try {
      const payload = JSON.parse(payloadText);
      const response = await fetch('/api/contracts/validate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ templateId, payload }),
      });
      const data = await response.json();
      setValidation(data);
      if (!response.ok) {
        setErrorText(data.message ?? 'Validación falló');
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Error validando');
    } finally {
      setLoading(false);
    }
  }

  async function onIssue() {
    setLoading(true);
    setErrorText('');
    try {
      const payload = JSON.parse(payloadText);
      const response = await fetch('/api/contracts/issue', {
        method: 'POST',
        headers,
        body: JSON.stringify({ templateId, payload }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorText(data.message ?? 'Emisión falló');
        return;
      }
      setIssueResult(data);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Error emitiendo contrato');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
      <h1>Emitir contrato</h1>
      <p>UI mínima MVP: token Bearer + template activo + payload JSON.</p>

      <section style={{ marginBottom: 16 }}>
        <label htmlFor="api-token">Bearer token admin/editor</label>
        <input
          id="api-token"
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            window.localStorage.setItem('admin_api_token', e.target.value);
          }}
          style={{ width: '100%', padding: 8, marginTop: 4 }}
        />
      </section>

      <section style={{ marginBottom: 16 }}>
        <button type="button" onClick={loadTemplates} disabled={loading}>Cargar templates</button>
        <div style={{ marginTop: 8 }}>
          <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} style={{ minWidth: 420, padding: 8 }}>
            <option value="">Selecciona template</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} | {t.version} {t.isActive ? '(activo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section style={{ marginBottom: 16 }}>
        <label htmlFor="payload-json">Payload JSON</label>
        <textarea
          id="payload-json"
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          rows={24}
          style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, marginTop: 6 }}
        />
      </section>

      <section style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" disabled={loading || !templateId} onClick={onValidate}>Validar</button>
        <button type="button" disabled={loading || !templateId || !validation?.valid} onClick={onIssue}>Emitir</button>
      </section>

      {errorText ? (
        <pre style={{ color: '#b00020', background: '#ffecec', padding: 12 }}>{errorText}</pre>
      ) : null}

      {validation ? (
        <section>
          <h2>Resultado validación</h2>
          <pre style={{ background: '#f4f4f4', padding: 12, overflowX: 'auto' }}>{JSON.stringify(validation, null, 2)}</pre>
        </section>
      ) : null}

      {issueResult ? (
        <section>
          <h2>Contrato emitido</h2>
          <pre style={{ background: '#f4f4f4', padding: 12, overflowX: 'auto' }}>{JSON.stringify(issueResult, null, 2)}</pre>
          {issueResult.pdfUrl ? (
            <p>
              <a href={issueResult.pdfUrl} target="_blank" rel="noreferrer">Abrir PDF firmado URL</a>
            </p>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
