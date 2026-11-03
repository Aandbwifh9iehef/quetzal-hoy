# Cómo cobrar cursos premium en Guatemala

Investigado el 3 de noviembre de 2026. Las comisiones cambian: confirma en el sitio de cada pasarela antes de decidir.

## Resumen en una frase

Para empezar, lo más simple y barato es **Recurrente** (links de pago, sin mensualidad, deposita en 24 horas hábiles). La app ya tiene el flujo listo: solo hay que pegar el link de pago y los códigos en `site.config.json`.

## Pasarelas que operan en Guatemala

| Pasarela | Comisión publicada | Mensualidad | Deposita en | Requisitos | Notas |
|---|---|---|---|---|---|
| **Recurrente** (recurrente.com) | 4.5% por cobro con tarjeta (su calculadora muestra Q4.50 sobre Q100). Algunas fuentes citan además Q2 fijos por transacción: confirmar. | No | 24 h hábiles (gratis) o al instante con comisión | DPI, NIT, cuenta bancaria en Guatemala; emitir FEL por cada cobro. Acepta pequeño contribuyente. | Links de pago, suscripciones, cobros internacionales. La opción más usada por emprendedores. |
| **Cuik** (Banrural) | Se negocia según volumen | Según plan | — | Cuenta en Banrural, patente de comercio | Buena si ya eres cliente de Banrural. |
| **BAC Credomatic e-commerce** | Se negocia | Sí, normalmente | — | Patente de comercio, cuenta en BAC | Pensada para empresas formales con volumen. |
| **Qpaypro / Paggo** | Varía | Varía | — | Patente de comercio | Alternativas locales; comparar comisiones por escrito. |
| **Pagalo** | No publica comisiones | — | — | — | Pedir cotización. |
| **PayPal** | ~5.4% + fijo en cobros internacionales | No | Retirar a Guatemala es limitado | Cuenta de negocio | Sirve para clientes fuera de Guatemala; para el público local no es práctico. |
| **Stripe** | — | — | — | No acepta cuentas de Guatemala | Solo con empresa registrada en otro país (EE. UU., etc.). No recomendado para empezar. |

Dato legal útil: desde septiembre de 2024 la Ley de Tarjetas de Crédito prohíbe cobrar recargo al cliente por pagar con tarjeta (verificar con un contador).

## Impuestos y facturación

- Cada cobro debe tener factura electrónica (**FEL**) emitida desde la Agencia Virtual de la SAT.
- Como pequeño contribuyente pagas 5% de IVA sobre lo facturado y no tienes que presentar ISR mensual. Si superas Q150,000 al año, pasas al régimen general.
- Las pasarelas retienen una parte del IVA cuando pagas con tarjeta (en Recurrente aparece como "Retención de IVA"): queda como crédito en tu declaración.
- Habla con un contador antes del primer cobro: cuesta poco y evita multas.

## El flujo que ya está listo en la app

1. **Marcar un curso como premium:** en `site.config.json` → `cursosPremium`, agrega el id del curso (`"presupuesto"`, `"deudas"` o `"invertir"`).
2. **Activar el cobro:** en `site.config.json` → `premium`:
   - `"activo": true`
   - `"precio": "Q 49"` (solo texto para mostrar)
   - `"urlPago": "https://..."` (el link de pago que te da Recurrente)
   - `"codigosSha256": [...]` (ver paso 3)
3. **Códigos de acceso:** cada persona que paga recibe un código (lo mandas por correo o WhatsApp). La app no guarda los códigos en claro, sino su huella SHA-256. Para generar la huella de un código, por ejemplo `QH-2026-ABCD`:
   ```bash
   node -e "import('./src/premium.js').then(m => console.log(m.sha256Hex('QH-2026-ABCD')))"
   ```
   Pega la huella en `codigosSha256`. Puedes tener varios códigos (uno por persona o uno por mes).
4. **Lo que ve la persona:** si el curso es premium y el cobro está activo, al abrir una lección ve el precio, el botón "Pagar" (abre tu link de pago) y un campo "Ya pagué: escribe tu código". Al escribir un código válido, el curso se desbloquea en ese celular (se guarda en localStorage).
5. **Con `activo: false`** todo sigue gratis, aunque haya cursos en `cursosPremium`. Así puedes preparar todo y encender el cobro cuando quieras.

## Mejora futura (no incluida)

Hoy el desbloqueo depende de un código que tú envías a mano. Cuando haya volumen, Recurrente puede avisar a un webhook del Worker al completarse un pago y generar el código automáticamente; eso requiere guardar correos de clientes (y actualizar la política de privacidad).

## Fuentes

- Recurrente, página principal y calculadora de precios (recurrente.com), consultada el 3 nov 2026.
- Recurrente, "Cómo recibir pagos en línea en Guatemala: guía 2026" (recurrente.com/blog).
- Visionweb, "Pasarelas de pago en Guatemala, guía eCommerce 2026".
- Paginox, "Cobrar con tarjeta en Guatemala 2026".
- Global66, disponibilidad de Stripe por país (46 países, sin Guatemala).
