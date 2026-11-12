# ARTBAN · Mi caja

Herramienta personal en español para caja registradora, costos de impresión 3D y escenarios de TikTok. Aplicación estática sin dependencias externas. No ejecuta cobros ni se conecta a las plataformas.

## Acceso y privacidad
El despliegue Sites tiene acceso exclusivo del propietario mediante autenticación de la plataforma. El código por sí mismo no incluye autenticación: **no publicar este HTML en GitHub Pages como si fuera privado**. El respaldo del código en la rama `herramientas/caja-personal` del repositorio ODA es público; no contiene ventas, credenciales ni datos privados. Las ventas se guardan solamente en localStorage de cada navegador. Respaldar/restaurar JSON desde Historial permite trasladarlas entre dispositivos.

## Uso
1. Costos: introducir material y horas del lote, piezas buenas, potencia promedio y tarifa eléctrica; mano de obra y acabados por pieza. Enviar el costo y precio sugerido a Caja o TikTok.
2. Caja: agregar varios productos, IVA incluido o adicional, descuentos y costos. Elegir efectivo, transferencia o Point; ajustar tasa base y MSI. Registrar la venta después de cobrar externamente. Imprimir un ticket no fiscal.
3. TikTok: ajustar comisión y su IVA, cargo por artículo, afiliado, SFP, envío adicional, publicidad y retenciones. El precio objetivo conserva estos ajustes. No contempla devoluciones o liquidaciones complejas.
4. Historial: consultar, imprimir, respaldar y restaurar. Borrar un registro local no revierte ningún cobro.

## Cálculos
Importes monetarios finales redondeados a centavos. IVA incluido = total - total/(1+tasa). Point = total × (tasa base + MSI), más IVA sobre dicha comisión. Disponible en caja = venta - comisión con IVA - costos - IVA de venta, antes de ISR y sin acreditamientos.
Costos: material, energía (W/1000 × h × $/kWh), desgaste y reserva de fallos prorrateados entre piezas; sumar mano de obra, pintura, primer, acabado, empaque y otros por pieza. Precio sugerido = costo × (1+recargo) × 1.16.
TikTok: depósito = venta con IVA - comisiones - envío - retenciones. Disponible = depósito - costos - publicidad - (IVA venta - IVA retenido). No resta dos veces retenciones. Sin acreditamientos ni ajuste anual/mensual de ISR. Simulación de un solo producto con varias unidades, IVA 16%.

Las tasas son ejemplos editables consultados el 2026-11-10. La guía de TikTok y el artículo 113-A publicado por SAT difieren en ISR; el ejemplo de 2.5% sin IVA debe verificarse contra la constancia de la cuenta, no se afirma como tasa legal definitiva. La interfaz contiene enlaces a las fuentes oficiales y explica bases y límites.

## Validación
`node test.cjs` comprueba IVA incluido/adicional, descuentos, exentos, comisiones Point/MSI, costo por lote, tarifas TikTok, topes SFP, retenciones sin duplicación y rechazo de respaldos inválidos. Se verificaron también interacciones en navegador.

## Desglose de terminal por producto
La caja y el historial muestran comisión, IVA de comisión, cargo total y neto de cada renglón. Se reparte el cargo del cobro proporcionalmente a los importes con IVA después de descuentos. Se asignan centavos por restos mayores para que la suma coincida exactamente con el total de la terminal. Para cantidades mayores a uno se muestra el promedio por pieza. El historial antiguo se calcula con sus comisiones guardadas. El ticket del cliente conserva únicamente sus importes de compra.
