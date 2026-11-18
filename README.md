# Trabajo Práctico 11 – Reemplazo completo de reservas desde la web

## Instalación y ejecución

1. Instalar dependencias:

   ```bash
   npm ci
   ```

2. Crear `.env` a partir de `.env.example` y completar las variables de conexión a MongoDB Atlas. No publicar credenciales ni secretos.

3. Comprobar el proyecto y la conexión:

   ```bash
   npm run check
   node --env-file=.env scripts/comprobar-conexion.js
   ```

4. Iniciar la aplicación:

   ```bash
   node --env-file=.env src/index.js
   ```

## Base de datos

- Motor: MongoDB Atlas (plan Free).
- Base de datos: `reservas_salas_u11`.
- Colección: `reservas`.

## Campos de una reserva

La edición utiliza estos siete campos:

- `estudiante`: texto obligatorio.
- `email`: obligatorio y debe contener `@`.
- `sala`: Sala Norte, Sala Sur o Sala Multimedia.
- `fecha`: fecha de la reserva.
- `turno`: Mañana, Tarde o Noche.
- `personas`: número entero entre 1 y 6.
- `estado`: pendiente o confirmada.

## Rutas

| Método | Ruta                   | Función                                                 |
| ------ | ---------------------- | ------------------------------------------------------- |
| GET    | `/reservas/:id/editar` | Muestra el formulario con los siete campos precargados. |
| POST   | `/reservas/:id/editar` | Valida y guarda el reemplazo completo.                  |
| GET    | `/api/reservas/:id`    | Consulta la reserva para verificar los datos.           |
| PUT    | `/api/reservas/:id`    | Reemplaza los siete campos desde la API.                |

El ID se obtiene de la ruta. El formulario debe enviar los siete campos, aunque solo se modifique uno.

## Redirección después de guardar

Al guardar correctamente desde la web, la aplicación responde con **303 See Other** y redirige a `/reservas` (listado). Si hay datos inválidos, vuelve al formulario de edición con los valores recibidos y un mensaje de error, sin modificar la reserva.

## Pruebas reproducibles

1. Abrir la edición de una reserva y comprobar que los siete campos aparecen precargados.
2. Cambiar `personas` a `4` y `estado` a `confirmada`. Guardar y comprobar la redirección `303` al listado.
3. Consultar `GET /api/reservas/:id` en Postman y verificar el mismo ID y los nuevos valores.
4. Enviar un `PUT /api/reservas/:id` con los siete campos. Comprobar la respuesta `200` y volver a abrir la edición web para verificar los valores.
5. Repetir el PUT omitiendo `estado`. Debe devolver `400` y la reserva debe permanecer sin cambios.
6. Enviar el formulario web con `personas=0`. Debe mostrar HTML `400`, conservar los valores ingresados y no modificar el documento.
7. Probar un ID inválido y otro válido inexistente. Los resultados esperados son `400` y `404`.
8. Cancelar una edición y comprobar que no se guardan cambios. Reiniciar la aplicación y verificar que el último reemplazo válido persiste.

## Verificación

Ejecutar:

```bash
npm run check
```
