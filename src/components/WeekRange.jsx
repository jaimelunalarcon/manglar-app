import React, { useMemo } from 'react';

/**
 * Devuelve un objeto { start, end } para la semana de la fecha dada.
 * Por defecto, la semana comienza en LUNES y termina en DOMINGO.
 */
function getWeekRange(date = new Date(), startOn = 'monday') {
  const d = new Date(date);
  // Normaliza al inicio del día en la zona local
  d.setHours(0, 0, 0, 0);

  // JS getDay(): 0=Dom,1=Lun,...6=Sab
  const day = d.getDay();
  const startIdx = startOn === 'sunday' ? 0 : 1; // 'monday' por defecto

  // Delta para retroceder al inicio de semana
  const deltaToStart =
    startOn === 'sunday'
      ? day // si empieza en domingo
      : (day + 6) % 7; // si empieza en lunes

  const start = new Date(d);
  start.setDate(d.getDate() - deltaToStart);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start, end };
}

function fmtDayMon(date, locale = 'es-CL') {
  const df = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' });
  return df.format(date).replace('.', '').toLowerCase();
}

/**
 * Componente:
 * - titlePrefix: texto antes del rango (default "Semana")
 * - startOn: 'monday' | 'sunday'
 * - baseDate: fecha base (por defecto hoy)
 * - render: si quieres control total del render, recibe { start, end, label }
 */
export default function WeekRange({
  titlePrefix = 'Semana',
  startOn = 'monday',
  baseDate,
  render,
}) {
  const { start, end, label } = useMemo(() => {
    const { start, end } = getWeekRange(baseDate, startOn);
    const label = `${fmtDayMon(start)} - ${fmtDayMon(end)}`;
    return { start, end, label };
  }, [baseDate, startOn]);

  if (typeof render === 'function') {
    return render({ start, end, label });
  }

  return (
    <span>
      {titlePrefix} {label}
    </span>
  );
}
