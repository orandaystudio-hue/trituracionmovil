# Trituración Móvil

Sitio para HostGator actualizado el 12 de octubre de 2026 sobre el último
`index.html` de GitHub, commit `cc6eef24fd3b3fa7d7e0a91067687ab89649c664`.
Este proyecto es independiente de ALZA.

## Publicación

1. Confirma en cPanel > Dominios el directorio raíz de `trituracionmovil.com`.
2. Respalda la versión publicada y extrae el ZIP de esta entrega en esa raíz.
3. Deben quedar `index.html`, `estilos.css`, `interacciones.js`,
   `enviar-cotizacion.php`, `img/` y `fonts/`, sin carpeta adicional.
4. El sitio requiere PHP 7.4 o superior para el formulario. No necesita base
   de datos, WordPress, Node.js ni instalación de paquetes.
5. Abre el dominio, recarga sin caché y prueba una solicitud real para
   comprobar la llegada a `trituracionmovil.mty@gmail.com`, incluido Spam.

**El formulario necesita `enviar-cotizacion.php`: subir únicamente el index
no permite el envío. GitHub Pages no ejecuta PHP; el destino es HostGator.**

## Formulario y correo

El formulario envía nombre, empresa, teléfono, correo, material, cantidad,
ubicación y detalles al correo confirmado `trituracionmovil.mty@gmail.com`.
Nombre, teléfono y autorización de contacto son obligatorios.

El endpoint utiliza el transporte `mail()` del hosting y un remitente del
dominio: `contacto@trituracionmovil.com`. El correo que introduce el visitante
se usa solo como `Reply-To`; no puede cambiar el destinatario o remitente.
No se incluyen claves ni credenciales en el repositorio.

Si HostGator exige una cuenta de correo de origen, crea o configura
`contacto@trituracionmovil.com` en cPanel. Se puede cambiar el remitente
mediante la variable de entorno `TM_MAIL_FROM` con una dirección válida
del dominio. Si el servidor no acepta `mail()`, el formulario muestra un
error y conserva los datos. En ese caso revisa la configuración de envío
con HostGator; no se presenta un fallo como envío exitoso.

Que el servidor acepte el mensaje no confirma su entrega en Gmail. La
prueba real después de publicar comprueba la entrega y la configuración
de correo/DNS del hosting. No se hicieron envíos externos durante QA.

Se validan los campos en el navegador y en PHP. El endpoint limita el tamaño
de solicitud, rechaza encabezados inyectados y orígenes ajenos, incorpora
un campo señuelo y limita intentos repetidos. El control de frecuencia usa
solo un hash de IP y marcas de tiempo en la carpeta temporal del servidor;
no almacena los datos del formulario en el sitio ni en una base de datos.

## Cambios solicitados

- Portada sin camión, con el nombre de la empresa y el nuevo mensaje.
- Seis materiales: documentos, inventario, medios digitales, uniformes,
  publicidad e imagen de empresa, material clínico y artículos de salud.
- Beneficios con supervisión, evidencia, unidades especializadas,
  constancia, ausencia de mínimo y atención personalizada.
- Paso 4: bitácora de conformidad, kilos triturados, área limpia y seguimiento.
- Se retira la sección de cobertura y sus enlaces.
- Preguntas frecuentes con el texto solicitado. Se retiran las preguntas
  de supervisión y duración marcadas con X en la referencia.
- Contacto con captura de datos y botón de envío. Se retiran los distintivos
  del bloque de contacto y el teléfono anterior.
- Único teléfono confirmado: **81 2389 5162**.
- Se conservan el correo y Facebook confirmados; no se activa WhatsApp
  sin confirmación de ese canal.
- Se mantienen fuera todas las fotos de la operación anteriormente retirada.

Los nuevos detalles del servicio proceden de las anotaciones proporcionadas
por el cliente. No se agregan clientes, certificaciones, capacidad operativa
o manejo autorizado de residuos regulados sin respaldo.

## Imágenes

Las fotografías son ilustrativas de materiales; no representan las
instalaciones ni el personal de Trituración Móvil. Las tres imágenes
previamente aprobadas se conservan. Las otras tres tienen licencia de
Pexels para uso en sitios web. Autores y enlaces en `FUENTES-IMAGENES.md`.
La licencia de Manrope está incluida en `fonts/Manrope-OFL.txt`.

Retira del hosting las imágenes y ZIP antiguos que ya no se utilicen,
después de guardar un respaldo privado. La extracción de un ZIP no borra
los archivos anteriores. Esta entrega no incluye fotos de la operación
retirada ni imágenes de camiones.

## Validación

Revisión visual y pruebas en 1440, 1024, 768, 390 y 320 px: imágenes, fuente
local, enlaces, menú, teclado, visor de seis fotos, preguntas frecuentes,
contactos y ausencia de desbordamiento horizontal.

PHP comprobado con un servidor SMTP simulado local: destinatario, contenido,
Reply-To, envío exitoso, fallo de transporte, conservación de datos,
validación, límites de frecuencia y envío sin JavaScript. Sin correos reales.
