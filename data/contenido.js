// Contenido editable del sitio: galería de charlas/clases/eventos y notas del blog.
// Las secciones se muestran solo cuando tienen elementos.
//
// GALERÍA: cada foto debe estar aprobada en assets/img/aprobadas.txt y procesada con
// tools/preparar_fotos.py (sin metadatos y con marca de agua). Orden cronológico.
// "destacada" (último argumento en true) la muestra también en la portada.
//
// NOTAS (blog): copia blog/_plantilla.html como blog/<slug>.html, escribe el artículo
// y agrega una entrada aquí (la más reciente primero). Ejemplo:
//   {
//     slug: "agentes-con-limites",
//     fecha: "2026-11-02",
//     titulo: { es: "Agentes, pero con límites", en: "Agents, with boundaries" },
//     resumen: { es: "Qué controles pongo antes de dar herramientas a un agente.", en: "The controls I set before giving an agent tools." },
//     etiquetas: ["Seguridad", "Agentes"],
//   },

const foto = (src, tipo, fecha, es, en, lugar = "", destacada = false) => ({
  src, tipo, fecha, lugar, destacada,
  titulo: { es, en },
  alt: { es: `Alexander Saravia — ${es}`, en: `Alexander Saravia — ${en}` },
});

window.SITE_CONTENT = {
  galeria: [
    foto("assets/img/proyectos/2019-08-robot-maker.webp", "proyecto", "2019-08", "Primer robot: prototipo maker", "First robot: a maker prototype"),
    foto("assets/img/proyectos/2020-01-estacion-iot-espe.webp", "proyecto", "2020-01", "Estación meteorológica IoT", "IoT weather station", "ESPE", true),
    foto("assets/img/eventos/2020-06-comunidad-grupal.webp", "evento", "2020-06", "Comunidad de IA", "AI community"),
    foto("assets/img/eventos/2021-03-reconocimiento-emprendimiento-espe.webp", "evento", "2021-03", "Reconocimiento a emprendimiento innovador", "Award for innovative entrepreneurship", "ESPE", true),
    foto("assets/img/proyectos/2021-05-laboratorio-edge-ai.webp", "proyecto", "2021-05", "Laboratorio de Edge AI: Jetson y visión 3D", "Edge AI lab: Jetson and 3D vision"),
    foto("assets/img/proyectos/2021-10-prueba-campo-realsense.webp", "proyecto", "2021-10", "Prueba de campo con visión 3D", "Field test with 3D vision", "Intel RealSense"),
    foto("assets/img/charlas/2022-05-nuo-charla.webp", "pitch", "2022-05", "Pitch finalista del concurso de innovación", "Innovation contest finalist pitch", "NUO · top 4 de 265 ideas", true),
    foto("assets/img/clases/2022-07-clase-iot-en-linea.webp", "clase", "2022-07", "Clase en línea de IoT", "Online IoT class"),
    foto("assets/img/charlas/2023-02-epn-camino-ciencia-datos.webp", "charla", "2023-02", "Camino hacia la ciencia de datos", "The path to data science", "", true),
    foto("assets/img/eventos/2023-04-open-data-day-panel.webp", "evento", "2023-04", "Panel: la IA y los datos en Ecuador", "Panel: AI and data in Ecuador", "Open Data Day UIO 2023 · EPN", true),
    foto("assets/img/clases/2023-06-pizarra-ciencia-datos.webp", "clase", "2023-06", "Clase de ciencia de datos", "Data science class", "", true),
    foto("assets/img/clases/2023-06-aula.webp", "clase", "2023-06", "Clase presencial", "In-person class"),
    foto("assets/img/clases/2023-06-aforo.webp", "clase", "2023-06", "Aforo completo", "A full room"),
    foto("assets/img/eventos/2023-10-startup-weekend-mentor.webp", "evento", "2023-10", "Mentor en Startup Weekend", "Startup Weekend mentor", "Techstars Startup Weekend"),
    foto("assets/img/eventos/2023-10-startup-weekend-mentores.webp", "evento", "2023-10", "Equipo de mentores", "Mentor team", "Techstars Startup Weekend"),
    foto("assets/img/eventos/2023-10-techstars-startup-weekend-espe.webp", "evento", "2023-10", "Startup Weekend: Transformación Digital", "Startup Weekend: Digital Transformation", "Techstars · ESPE", true),
    foto("assets/img/charlas/2023-11-ingenieriag-grupo.webp", "charla", "2023-11", "Taller «Empleos del futuro»", "“Jobs of the future” workshop"),
    foto("assets/img/charlas/2023-11-ia-jovenes-profesionales.webp", "charla", "2023-11", "IA y ciencia de datos para jóvenes profesionales", "AI and data science for young professionals", "", true),
    foto("assets/img/clases/2024-03-kruger-open-lab.webp", "clase", "2024-03", "Open Lab: demo de embeddings", "Open Lab: embeddings demo", "Kruger · Open Lab", true),
    foto("assets/img/eventos/2024-06-comunidad-camisetas.webp", "evento", "2024-06", "Comunidad de IA", "AI community"),
    foto("assets/img/eventos/2024-07-gen-ai-day.webp", "evento", "2024-07", "Gen AI Day", "Gen AI Day", "Banco Pichincha · AWS"),
    foto("assets/img/charlas/2024-07-gen-ai-day-escenario.webp", "charla", "2024-07", "Demo en vivo en el Gen AI Day", "Live demo at Gen AI Day", "Banco Pichincha · AWS", true),
    foto("assets/img/eventos/2024-09-dama-ecuador.webp", "evento", "2024-09", "Comunidad de gobierno de datos", "Data governance community", "DAMA Ecuador", true),
    foto("assets/img/eventos/2024-12-entrega-certificados.webp", "evento", "2024-12", "Entrega de certificados", "Certificate ceremony"),
    foto("assets/img/eventos/2024-12-reconocimiento-trofeos.webp", "evento", "2024-12", "Reconocimiento a voluntarios", "Volunteer recognition"),
    foto("assets/img/eventos/2024-12-reconocimiento-saturdays-ai.webp", "evento", "2024-12", "Reconocimiento como voluntario", "Volunteer recognition", "Saturdays.AI Quito", true),
    foto("assets/img/clases/2025-02-puce-taller.webp", "clase", "2025-02", "Taller práctico", "Hands-on workshop", "PUCE"),
    foto("assets/img/charlas/2025-02-puce-gobierno-ia.webp", "charla", "2025-02", "Panel de gobierno de IA", "AI governance panel", "PUCE", true),
    foto("assets/img/eventos/2025-10-aws-community-day.webp", "evento", "2025-10", "AWS Community Day Ecuador", "AWS Community Day Ecuador", "AWS", true),
    foto("assets/img/eventos/2026-04-google-evento.webp", "evento", "2026-04", "Evento de comunidad", "Community event"),
    foto("assets/img/charlas/2026-08-python-quito-ciberseguridad-agentica.webp", "charla", "2026-08", "Taller de ciberseguridad agéntica (OWASP)", "Agentic cybersecurity workshop (OWASP)", "Python Quito", true),
    foto("assets/img/charlas/2026-08-python-quito-ponentes.webp", "charla", "2026-08", "Ponentes del taller", "Workshop speakers", "Python Quito"),
    foto("assets/img/eventos/2026-08-python-quito-grupal.webp", "evento", "2026-08", "Comunidad Python Quito", "Python Quito community", "Python Quito", true),
    // Fuera del código (lugares genéricos a propósito: nada de rutas ni puntos de partida)
    foto("assets/img/personal/2022-12-lagunas-mojanda.webp", "personal", "2022-12", "Páramo de Mojanda", "Mojanda highlands", "Andes · Ecuador"),
    foto("assets/img/personal/2023-09-cascada-andina.webp", "personal", "2023-09", "Bajo la cascada", "Under the waterfall", "Andes · Ecuador"),
    foto("assets/img/personal/2025-06-xc-cotopaxi.webp", "personal", "2025-06", "XC en el páramo", "XC on the páramo", "Cotopaxi"),
    foto("assets/img/personal/2026-05-bosque-polylepis.webp", "personal", "2026-05", "Bosque de polylepis", "Polylepis forest", "Andes · Ecuador"),
    foto("assets/img/personal/2026-05-saratoga-en-vivo.webp", "personal", "2026-05", "Saratoga en vivo", "Saratoga live", "Metal"),
    foto("assets/img/personal/2026-06-arenal-cotopaxi.webp", "personal", "2026-06", "Al pie del glaciar", "Below the glacier", "Cotopaxi"),
    foto("assets/img/personal/2026-07-offroad-antisana.webp", "personal", "2026-07", "Off-road frente al Antisana", "Off-road facing Antisana", "Antisana"),
    foto("assets/img/personal/2026-10-roy-khan-en-vivo.webp", "personal", "2026-10", "Roy Khan en vivo", "Roy Khan live", "Metal"),
  ].sort((a, b) => a.fecha.localeCompare(b.fecha)),
  notas: [],
};
