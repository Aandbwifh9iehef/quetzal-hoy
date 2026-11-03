# Declaraciones para Google Play Console — Quetzal Hoy

Respuestas listas para cada sección de "Configuración de la app". Copia tal cual.

## Política de privacidad

URL: `https://hoy.compoundclub.fyi/privacidad`

## Acceso a la app

**Todas las funciones están disponibles sin restricciones** (no hay inicio de sesión).

## Anuncios

**No, mi app no contiene anuncios.** (Los patrocinios, si los hay, son contenido etiquetado dentro de la web, no anuncios de una red publicitaria. Si algún día se integra una red de anuncios, cambiar a "Sí".)

## Clasificación de contenido (cuestionario IARC)

- Categoría: **Utilidad, productividad, comunicación u otros**.
- Violencia, sexualidad, lenguaje, sustancias, juegos de azar simulados: **No** a todo.
- ¿Permite interactuar o intercambiar contenido con otros usuarios? **No**.
- ¿Comparte la ubicación del usuario? **No**.
- ¿Permite comprar bienes digitales? **No** (cambiar a Sí si se activa premium).
- Resultado esperado: **PEGI 3 / Para todos**.

## Público objetivo y contenido

- Grupo de edad objetivo: **18 años o más**. (El contenido no es para niños; no se dirige a menores.)
- ¿La app podría atraer a niños sin querer? **No**.

## Seguridad de datos

- ¿Tu app recopila o comparte alguno de los tipos de datos requeridos? **No**.
  - No hay cuentas, no se piden nombre, correo ni teléfono.
  - El avance de los cursos y el desbloqueo premium se guardan solo en el dispositivo (localStorage) y no se envían.
  - La analítica es Cloudflare Web Analytics, sin cookies ni identificadores; los contadores de eventos
    (instalaciones, cursos, compartir) son totales anónimos sin ningún dato del usuario.
- ¿Los datos se encriptan en tránsito? **Sí** (HTTPS).
- ¿Puede el usuario solicitar que se eliminen sus datos? **No aplica** (no se recopilan).

## Funciones financieras

Google pregunta si la app ofrece funciones financieras. Responder:

- ¿Tu app ofrece alguna función financiera? **Sí** → marcar únicamente:
  - **"Otras funciones financieras"** → describir: *"Información y educación financiera: tipo de cambio
    publicado por el Banco de Guatemala, indicadores económicos oficiales, noticias económicas resumidas,
    comparación informativa de tasas publicadas por bancos y cooperativas, calculadoras de ahorro y cursos
    gratuitos. La app no gestiona dinero, no ofrece préstamos, no permite invertir ni intermedia pagos."*
- Préstamos personales: **No**.
- Criptomonedas / intercambio: **No**.
- Banca, pagos, billetera, transferencias, remesas: **No**.
- Inversión / corretaje / asesoría: **No** (solo información general; se aclara en el aviso legal).

## App gubernamental

**No.**

## Noticias

¿Es una app de noticias? **No** (la sección de noticias es resúmenes con enlace a los medios; la app no es un medio).

## Salud

**No** aplica.

## Prueba cerrada obligatoria (cuentas personales nuevas)

Google exige a los desarrolladores individuales nuevos una prueba cerrada con **al menos 12 testers durante
14 días seguidos** antes de publicar en producción. Pasos: Pruebas → Prueba cerrada → crear lista de testers
(correos de Google) → subir el .aab → enviar el enlace de prueba a los testers → esperar 14 días →
"Solicitar acceso a producción" y responder el cuestionario breve.
