'use strict';

// =========================
// Datos base
// =========================
let meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

let diasBase = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Palabras permitidas para salir escribiendo texto
let exitWords = new Set(['salir', 's', 'q']);

// =========================
// Helpers
// =========================
let normalizar = (v) =>
  String(v ?? '')
    .trim()
    .toLowerCase();

// Regla gregoriana: (÷4 y no ÷100) o ÷400
let esBisiesto = (anio) =>
  (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;

let diasDelMes = (anio, mes) => {
  if (mes === 2) return esBisiesto(anio) ? 29 : 28;
  return diasBase[mes - 1];
};

// Pide un entero en rango o permite escribir "salir".
// Retorna: { kind: "number", value } | { kind: "exit" } | { kind: "cancel" }
let pedirEnteroEnRangoOSalir = async (titulo, min, max) => {
  while (true) {
    let res = await Swal.fire({
      title: titulo,
      input: 'text',
      inputPlaceholder: `${min} - ${max} (o escribe "salir")`,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      reverseButtons: true,
      inputValidator: (value) => {
        let s = normalizar(value);

        if (!s) return "Entrada vacía. Ingresa un número o escribe 'salir'.";
        if (exitWords.has(s)) return undefined;

        if (!/^-?\d+$/.test(s))
          return 'Debes ingresar un número entero (sin decimales).';

        let n = Number(s);
        if (!Number.isSafeInteger(n)) return 'Número inválido.';
        if (n < min || n > max)
          return `Fuera de rango. Debe ser entre ${min} y ${max}.`;

        return undefined;
      },
    });

    if (!res.isConfirmed) return { kind: 'cancel' };

    let s = normalizar(res.value);
    if (exitWords.has(s)) return { kind: 'exit' };

    return { kind: 'number', value: Number(s) };
  }
};

let mostrarResultado = async (anio, mes) => {
  let nombreMes = meses[mes - 1];
  let dias = diasDelMes(anio, mes);
  let etiquetaBisiesto = esBisiesto(anio) ? ' (año bisiesto)' : '';

  await Swal.fire({
    icon: 'success',
    title: 'Resultado',
    html: `<div class="text-start">
      <div><strong>${nombreMes}</strong> de <strong>${anio}</strong>${etiquetaBisiesto}</div>
      <div class="mt-2">Tiene <strong>${dias}</strong> días.</div>
    </div>`,
    confirmButtonText: 'Continuar',
    allowOutsideClick: false,
  });
};

let main = async () => {
  while (true) {
    let rAnio = await pedirEnteroEnRangoOSalir('Ingresa el año', 1, 9999);
    if (rAnio.kind !== 'number') break;

    let rMes = await pedirEnteroEnRangoOSalir(
      'Ingresa el número de mes',
      1,
      12
    );
    if (rMes.kind !== 'number') break;

    await mostrarResultado(rAnio.value, rMes.value);
  }

  await Swal.fire({
    icon: 'info',
    title: 'Listo',
    text: 'Programa finalizado.',
    confirmButtonText: 'Cerrar',
  });
};

// =========================
// UI (Bootstrap)
/// =========================
let btnIniciar = document.getElementById('btnIniciar');
let btnDemo = document.getElementById('btnDemo');

btnIniciar.addEventListener('click', () => {
  main();
});

btnDemo.addEventListener('click', async () => {
  await mostrarResultado(2024, 2);
});
