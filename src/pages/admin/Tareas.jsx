import React, { useEffect, useMemo, useState } from 'react';
import { Table, Form, Button, Badge } from 'react-bootstrap';
import WeekRange from '../../components/WeekRange';          
import { useAuth } from '../../context/authContext';          

// ---- Config de tareas (puedes editar nombres, puntos y cupos) ----
const TASKS_MASTER = [
  { id: 'patio',   nombre: 'Patio',            puntos: 3, maxPorSemana: 2 },
  { id: 'cocina',  nombre: 'Cocina',           puntos: 2, maxPorSemana: 7 },
  { id: 'pasillo', nombre: 'Pasillo',          puntos: 2, maxPorSemana: 3 },
  { id: 'bano',    nombre: 'Baño',             puntos: 2, maxPorSemana: 3 },
  { id: 'comunes', nombre: 'Espacios comunes', puntos: 1, maxPorSemana: 4 },
];
const DAYS_SHORT = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

// ===== Helpers de semana (inicio lunes) =====
function startOfWeek(d = new Date()) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const day = (x.getDay() + 6) % 7; // 0=Lun..6=Dom
  x.setDate(x.getDate() - day);
  return x;
}
function endOfWeek(d = new Date()) {
  const s = startOfWeek(d); const e = new Date(s); e.setDate(s.getDate() + 6); return e;
}
function weekKeyFromDate(d = new Date()) {
  const s = startOfWeek(d);
  const year = s.getFullYear();
  const jan1 = new Date(year,0,1);
  const days = Math.floor((s - jan1)/86400000);
  const week = Math.floor((days + ((jan1.getDay()+6)%7))/7) + 1;
  return `${year}-W${String(week).padStart(2,'0')}`;
}
function fmtDM(date) {
  return new Intl.DateTimeFormat('es-CL', { day:'2-digit', month:'short' })
    .format(date).replace('.', '').toLowerCase();
}
function mondayPlusDays(monday, i) {
  const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
}

// Estructura por semana: { [taskId]: (string|null)[] } // 7 posiciones
// string = username de quien tomó; null = libre
function buildEmptyWeek(tasks = TASKS_MASTER) {
  const byTask = {};
  tasks.forEach(t => { byTask[t.id] = Array(7).fill(null); });
  return byTask;
}
function countTaken(weekData, taskId) {
  return (weekData[taskId] || []).filter(v => !!v).length;
}

export default function Tareas() {
  const { user } = useAuth();
  const username = user?.username ?? '';
  const displayName = user?.name ?? username;
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const isAdmin = roles.includes('admin');
  const isArr   = roles.includes('arrendatario');

  // Semana seleccionada (por defecto hoy)
  const [baseDate, setBaseDate] = useState(() => new Date());
  const monday = useMemo(() => startOfWeek(baseDate), [baseDate]);
  const sunday = useMemo(() => endOfWeek(baseDate), [baseDate]);
  const weekKey = useMemo(() => weekKeyFromDate(baseDate), [baseDate]);

  // Datos semanales: { tareaId: (username|null)[] }
  const [weekData, setWeekData] = useState(() => buildEmptyWeek());
  const [tasks] = useState(TASKS_MASTER);

  // Carga al cambiar semana
  useEffect(() => {
    const lsKey = `tareas_semana_${weekKey}`;
    const raw = localStorage.getItem(lsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // Alinear con TASKS_MASTER
        const aligned = {};
        tasks.forEach(t => {
          const arr = parsed[t.id];
          aligned[t.id] = Array.isArray(arr) && arr.length === 7 ? arr : Array(7).fill(null);
        });
        setWeekData(aligned);
      } catch {
        setWeekData(buildEmptyWeek(tasks));
      }
    } else {
      const empty = buildEmptyWeek(tasks);
      setWeekData(empty);
      localStorage.setItem(lsKey, JSON.stringify(empty));
    }
  }, [weekKey, tasks]);

  // Guardar al cambiar datos
  useEffect(() => {
    const lsKey = `tareas_semana_${weekKey}`;
    localStorage.setItem(lsKey, JSON.stringify(weekData));
  }, [weekKey, weekData]);

  // Opciones: semana actual + 9 anteriores
  const weekOptions = useMemo(() => {
    const arr = [];
    let d = startOfWeek(new Date());
    for (let i = 0; i < 10; i++) {
      const k = weekKeyFromDate(d);
      arr.push({ key: k, monday: new Date(d), label: `Semana ${fmtDM(d)} - ${fmtDM(endOfWeek(d))}` });
      d = new Date(d); d.setDate(d.getDate() - 7);
    }
    return arr;
  }, []);

  const handleChangeWeek = (e) => {
    const key = e.target.value;
    const found = weekOptions.find(w => w.key === key);
    if (found) setBaseDate(found.monday);
  };

  // Permisos simples: quién puede tomar/liberar
  const canTake = isArr || isAdmin;
  const canRelease = (asignadoA) => isAdmin || (!!username && asignadoA === username);

  // Tomar tarea
  const handleTake = (taskId, dayIdx) => {
    if (!canTake) return;
    setWeekData(prev => {
      const row = prev[taskId]; if (!row) return prev;
      if (row[dayIdx]) return prev; // ya ocupada
      // validar cupo semanal
      const t = tasks.find(x => x.id === taskId);
      const ya = countTaken(prev, taskId);
      if (ya >= t.maxPorSemana) return prev;

      const next = { ...prev, [taskId]: [...row] };
      next[taskId][dayIdx] = username; // guardamos username
      return next;
    });
  };

  // Liberar tarea
  const handleRelease = (taskId, dayIdx) => {
    setWeekData(prev => {
      const row = prev[taskId]; if (!row) return prev;
      const asignadoA = row[dayIdx];
      if (!asignadoA || !canRelease(asignadoA)) return prev;
      const next = { ...prev, [taskId]: [...row] };
      next[taskId][dayIdx] = null;
      return next;
    });
  };

  return (
    <div>
      <div className="header-section">
        <button className="float-end btn mt-3 btn-success rounded-pill">+ Agregar tarea</button>
        <h1 className="mt-3">
          <i className="bi bi-check2-square me-2" aria-hidden="true"></i> Tareas
        </h1>
        <p className="mb-4 subtitle">
          <i className="bi bi-calendar me-2" aria-hidden="true"></i>
          <WeekRange baseDate={baseDate} />
        </p>
      </div>

      {/* Selector de semana */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <label className="form-label mb-0">Ir a:</label>
        <Form.Select style={{ maxWidth: 280 }} value={weekKey} onChange={handleChangeWeek}>
          {weekOptions.map(w => (
            <option key={w.key} value={w.key}>{w.label}</option>
          ))}
        </Form.Select>
      </div>

      <div className="p-4 bg-white rounded border mt-3">
        <Table striped bordered hover responsive className="mb-0">
          <thead>
            <tr>
              <th>N°</th>
              <th className="text-start">Tareas</th>
              <th>Pts</th>
              {DAYS_SHORT.map((d, i) => (
                <th key={d}>
                  {d}<br />
                  <small className="text-muted">{fmtDM(mondayPlusDays(monday, i))}</small>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {tasks.map(t => {
              const tomas = countTaken(weekData, t.id);
              const restante = Math.max(0, t.maxPorSemana - tomas);
              const row = weekData[t.id] || Array(7).fill(null);

              return (
                <tr key={t.id}>
                  <td><strong>{restante}</strong></td>
                  <td className="text-start">{t.nombre}</td>
                  <td>{t.puntos}</td>

                  {row.map((asignadoA, dayIdx) => {
                    const ocupado = !!asignadoA;
                    const soyYo = asignadoA === username;

                    // si no hay cupo y está libre → deshabilitar checkbox
                    const disableFree = restante <= 0 && !ocupado;

                    return (
                      <td key={`${t.id}-${dayIdx}`}>
                        {ocupado ? (
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <Badge bg={soyYo ? 'success' : 'primary'}>
                              {soyYo ? displayName || asignadoA : asignadoA}
                            </Badge>
                            {(isAdmin || soyYo) && (
                              <Button
                                size="sm"
                                className='rounded-pill pt-0 pb-0'
                                variant="danger"
                                onClick={() => handleRelease(t.id, dayIdx)}
                              >
                                x
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Form.Check
                            type="checkbox"
                            checked={false}
                            onChange={() => handleTake(t.id, dayIdx)}
                            disabled={!canTake || disableFree}
                            aria-label={`Tomar ${t.nombre} el ${DAYS_SHORT[dayIdx]}`}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

