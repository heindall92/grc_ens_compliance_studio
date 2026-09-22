/* Casos de ejemplo adicionales (ficticios, uso docente). TechServ se construye aparte desde el Excel del profesor.
 * Cada caso cuenta una historia distinta para que el auditor encuentre problemas distintos. */
'use strict';

const RESP = { 'org': 'Responsable de Seguridad', 'op.pl': 'Responsable de Seguridad', 'op.acc': 'Responsable del Sistema', 'op.ext': 'Responsable de Seguridad',
  'op.nub': 'Responsable del Sistema', 'op.exp': 'Responsable del Sistema', 'op.cont': 'Responsable del Sistema', 'op.mon': 'Responsable de Seguridad',
  'mp.if': 'Servicios Generales', 'mp.per': 'Recursos Humanos', 'mp.eq': 'Responsable del Sistema', 'mp.com': 'Responsable del Sistema',
  'mp.si': 'Responsable del Sistema', 'mp.sw': 'Responsable del Sistema', 'mp.info': 'Responsable de la Información', 'mp.s': 'Responsable del Sistema' };

module.exports.RESP = RESP;
module.exports.CASES = [
  {
    id: 'ayuntamiento', icono: 'landmark', sector: 'Administración local',
    titulo: 'Ayuntamiento de Valdemora',
    resumen: 'Municipio de 38.000 habitantes con sede electrónica, padrón y tributos. Migró el correo a la nube pero su SoA excluye los servicios en la nube, y su continuidad depende de una Diputación sin un análisis de impacto que lo respalde.',
    retos: ['Exclusión indebida de op.nub.1', 'Análisis de impacto sin plan', 'Servidor tributario sin soporte'],
    proyecto: { organizacion: 'Ayuntamiento de Valdemora (ficticio)', sistema: 'Administración electrónica municipal', codigoAR: 'AR-VAL-2026', codigoSoA: 'SOA-VAL-2026' },
    herramientas: { IDP: 'Active Directory', SIEM: 'SIEM del SOC provincial', CLOUD: 'Microsoft 365', BACKUP: 'Veeam', EDR: 'EDR provincial', ITSM: 'GLPI', CPD: 'CPD de la Diputación', WAF: 'WAF de la Diputación', MAIL: 'Exchange Online' },
    portada: { 'Fecha de emisión': '12/03/2026', 'Elaborada por': 'Ana Beltrán Ruiz – Responsable de Seguridad', 'Aprobada por': 'Comité de Seguridad Municipal – acta 2026/02', 'Firma (art. 28.2 RD 311/2022)': 'Firmado electrónicamente por la Responsable de Seguridad – 12/03/2026', 'Próxima revisión': 'Anual (03/2027)' },
    categorizacion: [
      { tipo: 'Servicio', id: 'S-01', nombre: 'Sede electrónica y registro general', responsable: 'Secretaría General', D: 'MEDIO', I: 'MEDIO', C: 'BAJO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Servicio', id: 'S-02', nombre: 'Gestión tributaria y recaudación', responsable: 'Intervención y Tesorería', D: 'BAJO', I: 'MEDIO', C: 'MEDIO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Información', id: 'I-01', nombre: 'Padrón municipal de habitantes', responsable: 'Estadística', D: 'BAJO', I: 'MEDIO', C: 'MEDIO', A: 'BAJO', T: 'MEDIO' },
      { tipo: 'Información', id: 'I-02', nombre: 'Expedientes de servicios sociales', responsable: 'Concejalía de Servicios Sociales', D: 'BAJO', I: 'MEDIO', C: 'MEDIO', A: 'MEDIO', T: 'MEDIO' }
    ],
    soa: {
      'op.nub.1': { aplica: 'NO', estado: 'No aplica', pct: null, justificacion: 'NO APLICA: el Ayuntamiento no utiliza servicios en la nube.', evidencias: '—' },
      'op.cont.1': { estado: 'Planificada', pct: 0, observaciones: 'Pendiente de coordinar con la Diputación.' },
      'op.mon.3': { estado: 'Parcial', pct: 0.6, observaciones: 'PTR-2026-03: casos de uso de correlación con el SOC provincial (T4 2026).' },
      'mp.sw.1': { estado: 'Parcial', pct: 0.5, observaciones: 'PTR-2026-05: guía de desarrollo seguro para los proveedores de aplicaciones municipales.' },
      'op.exp.10': { evidencias: '' },
      'op.pl.2': { responsable: '' },
      'op.exp.4': { aplica: 'SÍ (compensada)', estado: 'Parcial (compensada)', pct: 0.8, mc_ref: 'MC-01', observaciones: 'Servidor tributario heredado: ver MC-01.' }
    },
    refuerzosNo: [['op.acc.6', 'R5']],
    compensatorias: [
      { id: 'MC-01', medida: 'op.exp.4 Mantenimiento y actualizaciones de seguridad', ambito: 'Servidor de la aplicación tributaria heredada (Windows Server 2012 R2, sin soporte del fabricante).', limitaciones: 'El proveedor de la aplicación no certifica versiones actuales del sistema operativo hasta la migración prevista en 2027.', objetivo: 'Evitar la explotación de vulnerabilidades conocidas en sistemas sin parches.', riesgo: 'Explotación de vulnerabilidades del sistema operativo (R-005, R-006).', definicion: '1) Aislamiento en VLAN dedicada con acceso solo desde la aplicación web; 2) parcheo virtual en el WAF de la Diputación; 3) EDR con política reforzada; 4) monitorización específica en el SIEM provincial; 5) migración a la nueva plataforma tributaria (PTR-2026-07).', validacion: 'Escaneo de vulnerabilidades trimestral y prueba de intrusión anual del segmento.', mantenimiento: 'Revisión trimestral en el Comité de Seguridad hasta la migración.', aprobacion: 'Comité de Seguridad Municipal – acta 2026/02' }
    ],
    apetito: 'M',
    activos: [
      { id: 'ACT-001', nombre: 'Sede electrónica municipal', tipo: '[essential.service]', soporta: ['S-01'], descripcion: 'Portal de trámites con Cl@ve y registro electrónico', valoracion: { D: 7, I: 7, C: 5, A: 7, T: 6 } },
      { id: 'ACT-002', nombre: 'Base de datos de padrón y tributos', tipo: '[D]', soporta: ['I-01', 'S-02'], descripcion: 'BBDD compartida por padrón, tributos y recaudación', valoracion: { D: 5, I: 8, C: 8, A: 5, T: 6 } },
      { id: 'ACT-003', nombre: 'Servidor de la aplicación tributaria', tipo: '[SW]', soporta: ['S-02'], descripcion: 'Aplicación heredada sobre sistema operativo sin soporte', valoracion: { D: 6, I: 7, C: 6, A: 4, T: 4 } },
      { id: 'ACT-004', nombre: 'Microsoft 365 (correo y documentos)', tipo: '[S]', soporta: ['S-01', 'I-02'], descripcion: 'Correo y documentación de servicios sociales', valoracion: { D: 6, I: 6, C: 7, A: 6, T: 5 } },
      { id: 'ACT-005', nombre: 'Personal municipal', tipo: '[P]', soporta: ['S-01', 'S-02'], descripcion: '240 empleados con acceso a sistemas', valoracion: { D: 5, I: 5, C: 6, A: 4, T: 3 } }
    ],
    amenazas: [
      { id: 'R-001', activoId: 'ACT-001', codigo: '[A.24]', prob: 'M', deg: { D: 100, I: 0, C: 0, A: 0, T: 0 } },
      { id: 'R-002', activoId: 'ACT-001', codigo: '[A.5]', prob: 'M', deg: { D: 0, I: 50, C: 50, A: 80, T: 40 } },
      { id: 'R-003', activoId: 'ACT-002', codigo: '[A.11]', prob: 'M', deg: { D: 0, I: 40, C: 90, A: 0, T: 30 } },
      { id: 'R-004', activoId: 'ACT-002', codigo: '[A.18]', prob: 'B', deg: { D: 100, I: 50, C: 0, A: 0, T: 0 } },
      { id: 'R-005', activoId: 'ACT-003', codigo: '[E.20]', prob: 'A', deg: { D: 50, I: 60, C: 60, A: 0, T: 0 } },
      { id: 'R-006', activoId: 'ACT-003', codigo: '[A.22]', prob: 'M', deg: { D: 50, I: 70, C: 70, A: 0, T: 0 } },
      { id: 'R-007', activoId: 'ACT-004', codigo: '[A.5]', prob: 'A', deg: { D: 0, I: 50, C: 80, A: 70, T: 0 } },
      { id: 'R-008', activoId: 'ACT-004', codigo: '[E.19]', prob: 'M', deg: { D: 0, I: 0, C: 80, A: 0, T: 0 } },
      { id: 'R-009', activoId: 'ACT-005', codigo: '[A.30]', prob: 'A', deg: { D: 0, I: 50, C: 80, A: 40, T: 0 } },
      { id: 'R-010', activoId: 'ACT-005', codigo: '[E.7]', prob: 'M', deg: { D: 30, I: 30, C: 30, A: 0, T: 0 } }
    ],
    salvaguardas: [
      { id: 'SAL-001', codigo: 'S.www', nombre: 'WAF de la Diputación', madurez: 'L3', reduceProb: 60, reduceImp: 40, cubre: ['R-001', 'R-002'] },
      { id: 'SAL-002', codigo: 'H.IA', nombre: 'Cl@ve y doble factor para administradores', madurez: 'L3', reduceProb: 60, reduceImp: 10, cubre: ['R-002', 'R-007'] },
      { id: 'SAL-003', codigo: 'H.AC', nombre: 'Perfiles por rol en padrón y tributos', madurez: 'L3', reduceProb: 70, reduceImp: 20, cubre: ['R-003'] },
      { id: 'SAL-004', codigo: 'D.A', nombre: 'Copias Veeam con copia inmutable', madurez: 'L4', reduceProb: 0, reduceImp: 80, cubre: ['R-004'] },
      { id: 'SAL-005', codigo: 'H.VM', nombre: 'Parcheo mensual', madurez: 'L2', reduceProb: 50, reduceImp: 20, cubre: ['R-005'] },
      { id: 'SAL-006', codigo: 'COM.DS', nombre: 'VLAN aislada para el servidor heredado (MC-01)', madurez: 'L3', reduceProb: 50, reduceImp: 40, cubre: ['R-005', 'R-006'] },
      { id: 'SAL-007', codigo: 'H.tools.AV', nombre: 'EDR provincial', madurez: 'L3', reduceProb: 60, reduceImp: 30, cubre: ['R-006'] },
      { id: 'SAL-008', codigo: 'PS.AT', nombre: 'Concienciación anual', madurez: 'L1', reduceProb: 50, reduceImp: 30, cubre: ['R-009', 'R-010'] },
      { id: 'SAL-009', codigo: 'H.tools.DLP', nombre: 'Etiquetas de sensibilidad en Microsoft 365', madurez: 'L2', reduceProb: 50, reduceImp: 40, cubre: ['R-008'] },
      { id: 'SAL-010', codigo: 'IP.SPP', nombre: 'Cortafuegos perimetral', madurez: 'L4', reduceProb: 50, reduceImp: 30, cubre: ['R-001', 'R-003'] }
    ],
    hallazgos: [
      { id: 'H-01', titulo: 'Phishing simulado: 27 % de clics y 9 % de credenciales entregadas', categoria: 'PHISHING', cvss: 7.5, activoId: 'ACT-005', estado: 'abierto', fuente: 'Campaña de concienciación 2026 (ejemplo)' },
      { id: 'H-02', titulo: 'Servidor tributario con sistema operativo sin soporte y 14 CVE críticas', categoria: 'OUTDATED', cvss: 9.8, activoId: 'ACT-003', estado: 'abierto', fuente: 'Escaneo de vulnerabilidades (ejemplo)' },
      { id: 'H-03', titulo: 'Acceso de empleados a la sede sin límite de intentos', categoria: 'BRUTE', cvss: 7.3, activoId: 'ACT-001', estado: 'abierto', fuente: 'Pentest externo 2026 (ejemplo)' },
      { id: 'H-04', titulo: 'Copias sin prueba de restauración en los últimos 12 meses', categoria: 'BACKUP', cvss: 6.5, activoId: 'ACT-002', estado: 'abierto', fuente: 'Auditoría interna (ejemplo)' },
      { id: 'H-05', titulo: 'Buzón compartido con reenvío automático a una cuenta externa', categoria: 'INFOLEAK', cvss: 5.3, activoId: 'ACT-004', estado: 'cerrado', fuente: 'Revisión de Microsoft 365 (ejemplo)' }
    ]
  },
  {
    id: 'universidad', icono: 'graduation', sector: 'Universidad pública',
    titulo: 'Universidad del Litoral',
    resumen: 'Universidad pública con secretaría virtual, campus virtual y datos de investigación. Tiene un plan de adecuación en marcha, bien documentado pero lleno de medidas parciales, y una red de laboratorios difícil de segmentar.',
    retos: ['8 medidas parciales con PTR', 'Compensatoria sin aprobar', 'IDOR en certificados'],
    proyecto: { organizacion: 'Universidad del Litoral (ficticia)', sistema: 'Servicios académicos y de investigación', codigoAR: 'AR-UL-2026', codigoSoA: 'SOA-UL-2026' },
    herramientas: { IDP: 'directorio universitario con SSO SAML', SIEM: 'Wazuh', CLOUD: 'Google Workspace for Education', BACKUP: 'Bacula', EDR: 'Microsoft Defender', ITSM: 'OTRS', CPD: 'CPD del campus norte', WAF: 'ModSecurity', MAIL: 'Google Workspace' },
    portada: { 'Fecha de emisión': '20/05/2026', 'Elaborada por': 'Javier Ortiz Luna – Responsable de Seguridad', 'Aprobada por': 'Comité de Seguridad TIC – sesión 2/2026', 'Firma (art. 28.2 RD 311/2022)': 'Firmado electrónicamente – 20/05/2026', 'Próxima revisión': 'Anual (05/2027)' },
    categorizacion: [
      { tipo: 'Servicio', id: 'S-01', nombre: 'Secretaría virtual (matrícula y expedientes)', responsable: 'Vicerrectorado de Estudiantes', D: 'MEDIO', I: 'MEDIO', C: 'MEDIO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Servicio', id: 'S-02', nombre: 'Campus virtual', responsable: 'Vicerrectorado de Transformación Digital', D: 'MEDIO', I: 'MEDIO', C: 'BAJO', A: 'BAJO', T: 'BAJO' },
      { tipo: 'Servicio', id: 'S-03', nombre: 'Emisión de títulos y certificados', responsable: 'Secretaría General', D: 'BAJO', I: 'MEDIO', C: 'BAJO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Información', id: 'I-01', nombre: 'Expedientes académicos', responsable: 'Secretaría General', D: 'BAJO', I: 'MEDIO', C: 'MEDIO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Información', id: 'I-02', nombre: 'Datos de investigación con financiación pública', responsable: 'Vicerrectorado de Investigación', D: 'BAJO', I: 'MEDIO', C: 'MEDIO', A: 'BAJO', T: 'BAJO' }
    ],
    soa: {
      'op.exp.3': { estado: 'Parcial', pct: 0.7, observaciones: 'PTR-UL-01: líneas base de configuración para servidores Linux (T4 2026).' },
      'op.mon.2': { estado: 'Parcial', pct: 0.5, observaciones: 'PTR-UL-02: cuadro de mando de indicadores (T1 2027).' },
      'op.mon.3': { estado: 'Parcial', pct: 0.6, observaciones: 'PTR-UL-03: casos de uso en Wazuh.' },
      'mp.sw.1': { estado: 'Parcial', pct: 0.6, observaciones: 'PTR-UL-04: SAST en los desarrollos propios.' },
      'op.exp.6': { estado: 'Parcial', pct: 0.8, observaciones: 'PTR-UL-05: protección frente a código dañino en servidores Linux.' },
      'op.pl.4': { estado: 'Parcial', pct: 0.6, observaciones: 'PTR-UL-06: capacidad del campus virtual en periodos de matrícula.' },
      'mp.eq.3': { estado: 'Parcial', pct: 0.75, observaciones: 'PTR-UL-07: MDM para portátiles del PDI.' },
      'mp.s.2': { estado: 'Parcial', pct: 0.7, observaciones: 'PTR-UL-08: pruebas de seguridad periódicas de las aplicaciones web.' },
      'mp.info.2': { estado: 'Parcial', pct: 1 },
      'mp.com.4': { aplica: 'SÍ (compensada)', estado: 'Parcial (compensada)', pct: 0.8, mc_ref: 'MC-01' }
    },
    refuerzosNo: [],
    compensatorias: [
      { id: 'MC-01', medida: 'mp.com.4 Separación de flujos de información en la red', ambito: 'Red de laboratorios de investigación compartida por varios departamentos.', limitaciones: 'Equipamiento científico que requiere comunicación directa con servidores de proveedores externos.', objetivo: 'Separar los flujos de la investigación de los de gestión.', riesgo: 'Acceso no autorizado desde la red de laboratorios (R-006, R-007).', definicion: '1) Control de acceso a red (NAC) con perfiles por equipo; 2) microsegmentación en el cortafuegos del campus; 3) túneles dedicados para proveedores; 4) monitorización en Wazuh.', validacion: 'Prueba de intrusión interna semestral.', mantenimiento: 'Revisión semestral.', aprobacion: '' }
    ],
    apetito: 'M',
    activos: [
      { id: 'ACT-001', nombre: 'Secretaría virtual', tipo: '[essential.service]', soporta: ['S-01', 'S-03'], descripcion: 'Matrícula, expedientes y certificados en línea', valoracion: { D: 6, I: 7, C: 6, A: 7, T: 6 } },
      { id: 'ACT-002', nombre: 'Base de datos de expedientes', tipo: '[D]', soporta: ['I-01'], descripcion: 'Expedientes de 32.000 estudiantes', valoracion: { D: 5, I: 8, C: 7, A: 6, T: 6 } },
      { id: 'ACT-003', nombre: 'Campus virtual (Moodle)', tipo: '[SW]', soporta: ['S-02'], descripcion: 'Plataforma docente con más de 60 plugins', valoracion: { D: 6, I: 5, C: 4, A: 4, T: 3 } },
      { id: 'ACT-004', nombre: 'Red de laboratorios', tipo: '[COM]', soporta: ['I-02'], descripcion: 'Red compartida por grupos de investigación', valoracion: { D: 5, I: 6, C: 6, A: 3, T: 3 } },
      { id: 'ACT-005', nombre: 'PDI y PAS con privilegios', tipo: '[P]', soporta: ['S-01', 'I-01'], descripcion: 'Personal con acceso a gestión académica', valoracion: { D: 4, I: 5, C: 6, A: 5, T: 3 } }
    ],
    amenazas: [
      { id: 'R-001', activoId: 'ACT-001', codigo: '[A.11]', prob: 'M', deg: { D: 0, I: 40, C: 80, A: 0, T: 30 } },
      { id: 'R-002', activoId: 'ACT-001', codigo: '[A.24]', prob: 'M', deg: { D: 90, I: 0, C: 0, A: 0, T: 0 } },
      { id: 'R-003', activoId: 'ACT-002', codigo: '[A.15]', prob: 'B', deg: { D: 0, I: 100, C: 0, A: 0, T: 0 } },
      { id: 'R-004', activoId: 'ACT-002', codigo: '[E.19]', prob: 'M', deg: { D: 0, I: 0, C: 70, A: 0, T: 0 } },
      { id: 'R-005', activoId: 'ACT-003', codigo: '[E.20]', prob: 'A', deg: { D: 40, I: 50, C: 40, A: 0, T: 0 } },
      { id: 'R-006', activoId: 'ACT-004', codigo: '[A.11]', prob: 'M', deg: { D: 30, I: 50, C: 80, A: 0, T: 0 } },
      { id: 'R-007', activoId: 'ACT-004', codigo: '[A.14]', prob: 'B', deg: { D: 0, I: 0, C: 70, A: 0, T: 0 } },
      { id: 'R-008', activoId: 'ACT-005', codigo: '[A.30]', prob: 'A', deg: { D: 0, I: 40, C: 70, A: 30, T: 0 } },
      { id: 'R-009', activoId: 'ACT-005', codigo: '[E.7]', prob: 'M', deg: { D: 30, I: 30, C: 30, A: 0, T: 0 } }
    ],
    salvaguardas: [
      { id: 'SAL-001', codigo: 'S.www', nombre: 'ModSecurity delante de la secretaría', madurez: 'L2', reduceProb: 60, reduceImp: 40, cubre: ['R-001', 'R-002'] },
      { id: 'SAL-002', codigo: 'H.IA', nombre: 'SSO SAML con doble factor', madurez: 'L4', reduceProb: 60, reduceImp: 10, cubre: ['R-001'] },
      { id: 'SAL-003', codigo: 'H.AC', nombre: 'Perfiles por rol en la secretaría', madurez: 'L3', reduceProb: 70, reduceImp: 20, cubre: ['R-001', 'R-003'] },
      { id: 'SAL-004', codigo: 'D.A', nombre: 'Copias Bacula con copia externa', madurez: 'L3', reduceProb: 0, reduceImp: 80, cubre: ['R-003'] },
      { id: 'SAL-005', codigo: 'H.VM', nombre: 'Actualización de Moodle y plugins', madurez: 'L2', reduceProb: 60, reduceImp: 20, cubre: ['R-005'] },
      { id: 'SAL-006', codigo: 'COM.DS', nombre: 'NAC y microsegmentación de laboratorios (MC-01)', madurez: 'L3', reduceProb: 50, reduceImp: 40, cubre: ['R-006', 'R-007'] },
      { id: 'SAL-007', codigo: 'PS.AT', nombre: 'Formación en seguridad para PDI y PAS', madurez: 'L3', reduceProb: 50, reduceImp: 30, cubre: ['R-008', 'R-009'] },
      { id: 'SAL-008', codigo: 'H.tools.LA', nombre: 'Wazuh', madurez: 'L3', reduceProb: 30, reduceImp: 30, cubre: ['R-001', 'R-004'] },
      { id: 'SAL-009', codigo: 'S.A', nombre: 'Balanceo y autoescalado', madurez: 'L3', reduceProb: 30, reduceImp: 60, cubre: ['R-002'] }
    ],
    hallazgos: [
      { id: 'H-01', titulo: 'IDOR en la descarga de certificados académicos', categoria: 'IDOR', cvss: 8.6, activoId: 'ACT-001', estado: 'abierto', fuente: 'Pentest de la secretaría virtual (ejemplo)' },
      { id: 'H-02', titulo: 'Plugin del campus virtual con ejecución remota de código', categoria: 'OUTDATED', cvss: 9.1, activoId: 'ACT-003', estado: 'abierto', fuente: 'Escaneo de vulnerabilidades (ejemplo)' },
      { id: 'H-03', titulo: 'Red de laboratorios alcanzable desde la wifi de invitados', categoria: 'NETSEG', cvss: 7.1, activoId: 'ACT-004', estado: 'abierto', fuente: 'Pentest interno (ejemplo)' },
      { id: 'H-04', titulo: 'XSS reflejado en el buscador de la secretaría', categoria: 'XSS', cvss: 6.1, activoId: 'ACT-001', estado: 'cerrado', fuente: 'Pentest de la secretaría virtual (ejemplo)' }
    ]
  },
  {
    id: 'hospital', icono: 'hospital', sector: 'Sanidad pública',
    titulo: 'Hospital Comarcal Sierra Norte',
    resumen: 'Hospital de un servicio autonómico de salud, con historia clínica electrónica, imagen médica y equipos de electromedicina heredados. La trazabilidad es ALTA, las copias no están aisladas frente a ransomware y hay una medida marcada como compensada sin ficha que la respalde.',
    retos: ['Compensada sin registro de MC', 'Copias sin inmutabilidad', 'Electromedicina sin segmentar'],
    proyecto: { organizacion: 'Hospital Comarcal Sierra Norte (ficticio)', sistema: 'Sistemas de información clínica', codigoAR: 'AR-HSN-2026', codigoSoA: 'SOA-HSN-2026' },
    herramientas: { IDP: 'directorio del Servicio de Salud', SIEM: 'SOC del Servicio de Salud', CLOUD: 'nube privada autonómica', BACKUP: 'Commvault', EDR: 'EDR corporativo', ITSM: 'Remedy', CPD: 'CPD autonómico', WAF: 'WAF corporativo', MAIL: 'correo corporativo' },
    portada: { 'Fecha de emisión': '10/01/2026', 'Elaborada por': 'Lucía Serrano Gil – Responsable de Seguridad', 'Aprobada por': 'Comité de Seguridad de la Información – acta 01/2026', 'Firma (art. 28.2 RD 311/2022)': 'Firmado electrónicamente – 10/01/2026', 'Próxima revisión': 'Anual (01/2027)' },
    categorizacion: [
      { tipo: 'Servicio', id: 'S-01', nombre: 'Historia clínica electrónica', responsable: 'Dirección Médica', D: 'ALTO', I: 'ALTO', C: 'ALTO', A: 'MEDIO', T: 'ALTO' },
      { tipo: 'Servicio', id: 'S-02', nombre: 'Citación y admisión', responsable: 'Dirección de Gestión', D: 'MEDIO', I: 'MEDIO', C: 'MEDIO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Servicio', id: 'S-03', nombre: 'Imagen médica (PACS)', responsable: 'Servicio de Radiodiagnóstico', D: 'ALTO', I: 'ALTO', C: 'ALTO', A: 'MEDIO', T: 'MEDIO' },
      { tipo: 'Información', id: 'I-01', nombre: 'Datos de salud de pacientes', responsable: 'Dirección Médica', D: 'MEDIO', I: 'ALTO', C: 'ALTO', A: 'MEDIO', T: 'ALTO' }
    ],
    soa: {
      'mp.eq.4': { aplica: 'SÍ (compensada)', estado: 'Parcial (compensada)', pct: 0.7, mc_ref: 'MC-02', observaciones: 'Equipos de electromedicina.' },
      'op.exp.4': { aplica: 'SÍ (compensada)', estado: 'Parcial (compensada)', pct: 0.8, mc_ref: 'MC-01' },
      'op.mon.3': { estado: 'Parcial', pct: 0.7, observaciones: 'PTR-HSN-01: integración de alertas de electromedicina en el SOC.' },
      'op.cont.3': { estado: 'Parcial', pct: 0.5, observaciones: 'PTR-HSN-02: simulacro de caída de la historia clínica.' }
    },
    refuerzosNo: [['op.exp.8', 'R5']],
    compensatorias: [
      { id: 'MC-01', medida: 'op.exp.4 Mantenimiento y actualizaciones de seguridad', ambito: 'Modalidades de imagen (TAC, resonancia) con sistema operativo embebido certificado por el fabricante.', limitaciones: 'El marcado CE del equipo impide aplicar parches no validados por el fabricante.', objetivo: 'Evitar la explotación de vulnerabilidades conocidas.', riesgo: 'Manipulación y código dañino en equipos de electromedicina (R-005, R-006).', definicion: '1) Segmentación en VLAN de electromedicina; 2) listas blancas de comunicaciones con el PACS; 3) monitorización pasiva de la red clínica; 4) parches validados por el fabricante en ventanas trimestrales.', validacion: 'Revisión trimestral de reglas y prueba de intrusión anual.', mantenimiento: 'Revisión trimestral en el Comité.', aprobacion: 'Comité de Seguridad de la Información – acta 01/2026' }
    ],
    apetito: 'B',
    activos: [
      { id: 'ACT-001', nombre: 'Historia clínica electrónica', tipo: '[essential.service]', soporta: ['S-01'], descripcion: 'Aplicación asistencial usada por 1.100 profesionales', valoracion: { D: 9, I: 9, C: 9, A: 7, T: 9 } },
      { id: 'ACT-002', nombre: 'Base de datos clínica', tipo: '[D]', soporta: ['I-01'], descripcion: 'Datos de salud de 180.000 pacientes', valoracion: { D: 8, I: 9, C: 10, A: 7, T: 9 } },
      { id: 'ACT-003', nombre: 'Red de electromedicina y modalidades', tipo: '[HW]', soporta: ['S-03'], descripcion: 'TAC, resonancia, ecógrafos y monitores', valoracion: { D: 9, I: 8, C: 7, A: 5, T: 4 } },
      { id: 'ACT-004', nombre: 'Servidor PACS', tipo: '[SW]', soporta: ['S-03'], descripcion: 'Almacenamiento y visualización de imagen', valoracion: { D: 8, I: 8, C: 8, A: 5, T: 5 } },
      { id: 'ACT-005', nombre: 'Repositorio de copias de seguridad', tipo: '[Media]', soporta: ['I-01'], descripcion: 'Copias en disco en el mismo dominio', valoracion: { D: 9, I: 8, C: 9, A: 0, T: 0 } },
      { id: 'ACT-006', nombre: 'Personal sanitario y administrativo', tipo: '[P]', soporta: ['S-01', 'S-02'], descripcion: 'Usuarios de la historia clínica', valoracion: { D: 6, I: 6, C: 8, A: 5, T: 5 } }
    ],
    amenazas: [
      { id: 'R-001', activoId: 'ACT-001', codigo: '[A.11]', prob: 'M', deg: { D: 0, I: 50, C: 100, A: 0, T: 40 } },
      { id: 'R-002', activoId: 'ACT-001', codigo: '[A.24]', prob: 'B', deg: { D: 100, I: 0, C: 0, A: 0, T: 0 } },
      { id: 'R-003', activoId: 'ACT-002', codigo: '[A.19]', prob: 'M', deg: { D: 0, I: 0, C: 100, A: 0, T: 0 } },
      { id: 'R-004', activoId: 'ACT-002', codigo: '[A.15]', prob: 'B', deg: { D: 0, I: 100, C: 0, A: 0, T: 0 } },
      { id: 'R-005', activoId: 'ACT-003', codigo: '[A.8]', prob: 'A', deg: { D: 80, I: 60, C: 40, A: 0, T: 0 } },
      { id: 'R-006', activoId: 'ACT-003', codigo: '[A.22]', prob: 'M', deg: { D: 60, I: 70, C: 50, A: 0, T: 0 } },
      { id: 'R-007', activoId: 'ACT-004', codigo: '[E.20]', prob: 'M', deg: { D: 50, I: 50, C: 50, A: 0, T: 0 } },
      { id: 'R-008', activoId: 'ACT-005', codigo: '[A.18]', prob: 'M', deg: { D: 100, I: 60, C: 0, A: 0, T: 0 } },
      { id: 'R-009', activoId: 'ACT-006', codigo: '[A.30]', prob: 'A', deg: { D: 0, I: 40, C: 80, A: 40, T: 0 } },
      { id: 'R-010', activoId: 'ACT-006', codigo: '[E.19]', prob: 'M', deg: { D: 0, I: 0, C: 70, A: 0, T: 0 } },
      { id: 'R-011', activoId: 'ACT-003', codigo: '[I.5]', prob: 'M', deg: { D: 70, I: 0, C: 0, A: 0, T: 0 } }
    ],
    salvaguardas: [
      { id: 'SAL-001', codigo: 'H.AC', nombre: 'Control de acceso por rol a la historia clínica', madurez: 'L4', reduceProb: 70, reduceImp: 20, cubre: ['R-001', 'R-003'] },
      { id: 'SAL-002', codigo: 'H.IA', nombre: 'Tarjeta profesional con PIN', madurez: 'L4', reduceProb: 60, reduceImp: 10, cubre: ['R-001'] },
      { id: 'SAL-003', codigo: 'H.tools.LA', nombre: 'Auditoría de accesos a la historia clínica', madurez: 'L4', reduceProb: 40, reduceImp: 30, cubre: ['R-001', 'R-003', 'R-004'] },
      { id: 'SAL-004', codigo: 'H.tools.AV', nombre: 'EDR en puestos (no en modalidades)', madurez: 'L3', reduceProb: 60, reduceImp: 30, cubre: ['R-005'] },
      { id: 'SAL-005', codigo: 'COM.DS', nombre: 'VLAN de electromedicina', madurez: 'L2', reduceProb: 50, reduceImp: 40, cubre: ['R-005', 'R-006'] },
      { id: 'SAL-006', codigo: 'H.VM', nombre: 'Gestión de vulnerabilidades', madurez: 'L3', reduceProb: 60, reduceImp: 20, cubre: ['R-007'] },
      { id: 'SAL-007', codigo: 'D.A', nombre: 'Copias Commvault', madurez: 'L3', reduceProb: 0, reduceImp: 80, cubre: ['R-008'] },
      { id: 'SAL-008', codigo: 'PS.AT', nombre: 'Formación en ciberseguridad sanitaria', madurez: 'L2', reduceProb: 50, reduceImp: 30, cubre: ['R-009', 'R-010'] },
      { id: 'SAL-009', codigo: 'HW.A', nombre: 'Redundancia de modalidades críticas', madurez: 'L3', reduceProb: 30, reduceImp: 70, cubre: ['R-011'] },
      { id: 'SAL-010', codigo: 'S.A', nombre: 'Alta disponibilidad de la historia clínica', madurez: 'L4', reduceProb: 30, reduceImp: 70, cubre: ['R-002'] }
    ],
    hallazgos: [
      { id: 'H-01', titulo: 'Repositorio de copias accesible con credenciales de dominio y sin inmutabilidad', categoria: 'BACKUP', cvss: 9.0, activoId: 'ACT-005', estado: 'abierto', fuente: 'Evaluación de resiliencia ante ransomware (ejemplo)' },
      { id: 'H-02', titulo: 'Modalidades de imagen alcanzables desde la red de usuarios', categoria: 'NETSEG', cvss: 8.3, activoId: 'ACT-003', estado: 'abierto', fuente: 'Pentest interno (ejemplo)' },
      { id: 'H-03', titulo: 'Servidor PACS con componente DICOM vulnerable', categoria: 'OUTDATED', cvss: 8.1, activoId: 'ACT-004', estado: 'abierto', fuente: 'Escaneo de vulnerabilidades (ejemplo)' },
      { id: 'H-04', titulo: 'Credenciales por defecto en la consola de un ecógrafo', categoria: 'DEFCREDS', cvss: 7.4, activoId: 'ACT-003', estado: 'abierto', fuente: 'Pentest interno (ejemplo)' },
      { id: 'H-05', titulo: 'Phishing simulado: 12 % de clics', categoria: 'PHISHING', cvss: 6.0, activoId: 'ACT-006', estado: 'abierto', fuente: 'Campaña de concienciación (ejemplo)' },
      { id: 'H-06', titulo: 'TLS 1.0 en la pasarela de mensajería clínica', categoria: 'TLS', cvss: 5.9, activoId: 'ACT-001', estado: 'cerrado', fuente: 'Pentest externo (ejemplo)' }
    ]
  },
  {
    id: 'saas', icono: 'cloud', sector: 'Proveedor SaaS',
    titulo: 'CitaFácil Cloud',
    resumen: 'Startup de 14 personas que ofrece cita previa en la nube a ayuntamientos. Categoría BÁSICA, pero su SoA está sin firmar, lleva más de un año sin revisarse y declara medidas que no le exigen. Su API deja ver citas de otros clientes.',
    retos: ['SoA sin firma ni revisión', 'Sobrecumplimiento sin justificar', 'Aislamiento entre clientes roto'],
    proyecto: { organizacion: 'CitaFácil Cloud, S.L. (ficticia)', sistema: 'Plataforma SaaS de cita previa', codigoAR: 'AR-CF-2025', codigoSoA: 'SOA-CF-2025' },
    herramientas: { IDP: 'Google Workspace', SIEM: 'registro centralizado del proveedor cloud', CLOUD: 'AWS (región España)', BACKUP: 'instantáneas automáticas', EDR: 'antimalware gestionado', ITSM: 'Jira', CPD: 'región cloud secundaria', WAF: 'AWS WAF', MAIL: 'Google Workspace' },
    portada: { 'Fecha de emisión': '15/06/2025', 'Elaborada por': 'Marcos Vidal – CTO', 'Aprobada por': 'Dirección', 'Firma (art. 28.2 RD 311/2022)': '', 'Próxima revisión': '—' },
    categorizacion: [
      { tipo: 'Servicio', id: 'S-01', nombre: 'Servicio de cita previa', responsable: 'Ayuntamientos clientes', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO' },
      { tipo: 'Información', id: 'I-01', nombre: 'Datos de contacto de la ciudadanía', responsable: 'Ayuntamientos clientes', D: 'BAJO', I: 'BAJO', C: 'BAJO', A: 'BAJO', T: 'BAJO' }
    ],
    sobrecumplimiento: 3,
    soa: {
      'op.exp.7': { responsable: '' },
      'op.exp.4': { estado: 'Parcial', pct: 0.6, observaciones: 'PTR-CF-01: gestión de dependencias vulnerables en el ciclo de integración continua.' }
    },
    refuerzosNo: [],
    compensatorias: [],
    apetito: 'M',
    activos: [
      { id: 'ACT-001', nombre: 'API de cita previa', tipo: '[essential.service]', soporta: ['S-01'], descripcion: 'API multiempresa usada por 46 ayuntamientos', valoracion: { D: 4, I: 4, C: 4, A: 3, T: 3 } },
      { id: 'ACT-002', nombre: 'Base de datos de citas', tipo: '[D]', soporta: ['I-01'], descripcion: 'Nombre, teléfono y correo de la ciudadanía', valoracion: { D: 3, I: 4, C: 5, A: 2, T: 2 } },
      { id: 'ACT-003', nombre: 'Consola de la cuenta cloud', tipo: '[S]', soporta: ['S-01'], descripcion: 'Acceso de administración a toda la infraestructura', valoracion: { D: 5, I: 5, C: 5, A: 5, T: 4 } },
      { id: 'ACT-004', nombre: 'Equipo de desarrollo', tipo: '[P]', soporta: ['S-01'], descripcion: '9 personas con acceso a producción', valoracion: { D: 3, I: 4, C: 4, A: 3, T: 2 } }
    ],
    amenazas: [
      { id: 'R-001', activoId: 'ACT-001', codigo: '[A.11]', prob: 'M', deg: { D: 0, I: 40, C: 70, A: 0, T: 0 } },
      { id: 'R-002', activoId: 'ACT-001', codigo: '[A.24]', prob: 'M', deg: { D: 80, I: 0, C: 0, A: 0, T: 0 } },
      { id: 'R-003', activoId: 'ACT-002', codigo: '[E.19]', prob: 'M', deg: { D: 0, I: 0, C: 60, A: 0, T: 0 } },
      { id: 'R-004', activoId: 'ACT-003', codigo: '[A.5]', prob: 'M', deg: { D: 0, I: 60, C: 60, A: 90, T: 0 } },
      { id: 'R-005', activoId: 'ACT-004', codigo: '[A.30]', prob: 'M', deg: { D: 0, I: 30, C: 50, A: 0, T: 0 } },
      { id: 'R-006', activoId: 'ACT-003', codigo: '[E.2]', prob: 'M', deg: { D: 50, I: 40, C: 40, A: 0, T: 0 } }
    ],
    salvaguardas: [
      { id: 'SAL-001', codigo: 'H.AC', nombre: 'Autorización por cliente en la API', madurez: 'L2', reduceProb: 70, reduceImp: 20, cubre: ['R-001'] },
      { id: 'SAL-002', codigo: 'S.www', nombre: 'AWS WAF', madurez: 'L3', reduceProb: 60, reduceImp: 40, cubre: ['R-001', 'R-002'] },
      { id: 'SAL-003', codigo: 'H.IA', nombre: 'Doble factor en la consola cloud', madurez: 'L4', reduceProb: 70, reduceImp: 10, cubre: ['R-004'] },
      { id: 'SAL-004', codigo: 'D.C', nombre: 'Cifrado en reposo', madurez: 'L4', reduceProb: 50, reduceImp: 60, cubre: ['R-003'] },
      { id: 'SAL-005', codigo: 'PS.AT', nombre: 'Formación de incorporación', madurez: 'L2', reduceProb: 50, reduceImp: 30, cubre: ['R-005'] },
      { id: 'SAL-006', codigo: 'SW.CM', nombre: 'Infraestructura como código con revisión', madurez: 'L3', reduceProb: 50, reduceImp: 30, cubre: ['R-006'] },
      { id: 'SAL-007', codigo: 'S.A', nombre: 'Autoescalado', madurez: 'L3', reduceProb: 30, reduceImp: 60, cubre: ['R-002'] }
    ],
    hallazgos: [
      { id: 'H-01', titulo: 'IDOR en la API: un ayuntamiento puede consultar las citas de otro', categoria: 'IDOR', cvss: 8.1, activoId: 'ACT-001', estado: 'abierto', fuente: 'Pentest de la API (ejemplo)' },
      { id: 'H-02', titulo: 'Claves de acceso cloud publicadas en el repositorio de código', categoria: 'INFOLEAK', cvss: 7.5, activoId: 'ACT-003', estado: 'abierto', fuente: 'Revisión de secretos (ejemplo)' },
      { id: 'H-03', titulo: 'Inicio de sesión del panel sin limitación de intentos', categoria: 'BRUTE', cvss: 5.3, activoId: 'ACT-001', estado: 'abierto', fuente: 'Pentest de la API (ejemplo)' }
    ]
  }
];
