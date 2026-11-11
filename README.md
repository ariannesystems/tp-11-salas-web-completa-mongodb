# TRABAJO PRÁCTICO N.º 10 --- Consultas de reservas paso a paso

Proyecto realizado a partir de una copia funcional del **Trabajo
Práctico N.º 09**, ampliada para incorporar consultas de reservas
mediante filtros, ordenamiento, paginación y selección de campos,
utilizando Node.js, Express, Mongoose y MongoDB.

## Descripción

El objetivo de este trabajo práctico es ampliar las consultas de
reservas sin modificar los documentos almacenados.

La API permite consultar las reservas aplicando diferentes criterios:

-   Filtrar por sala.
-   Ordenar por estudiante o por cantidad de personas.
-   Paginar los resultados.
-   Limitar la cantidad de campos devueltos por la consulta.
-   Obtener metadatos sobre el resultado, como la página actual, el
    límite, el total de registros y la cantidad de páginas.

Las consultas se realizan mediante solicitudes `GET`. No modifican ni
eliminan las reservas almacenadas en MongoDB.

## Origen del proyecto

Este trabajo se desarrolla a partir de una copia del **Trabajo Práctico
N.º 09 --- CRUD - Actualización y eliminación de reservas de salas**.

Se conserva la estructura general del proyecto, las operaciones CRUD,
las validaciones, las vistas HTML y la organización por capas.

La nueva versión incorpora funcionalidades de consulta sin modificar el
funcionamiento de las operaciones anteriores.

**Repositorio:** [https://github.com/ariannesystems/tp-10-salas-consultas-mongodb.git]

## Requisitos y entorno

-   **Node.js:** 24.19.0.
-   **npm:** 12.2.1.
-   **Base de datos:** MongoDB Atlas.
-   **Plan:** Atlas Free M0.
-   **Base:** `reservas_salas_u10`.
-   **Colección:** `reservas`.
-   **Puerto local:** `3000`.
-   **DNS:** se conserva la configuración externa y el ajuste DNS
    autorizado de los trabajos prácticos anteriores. No se incluyen
    credenciales ni la URI real.

Para preparar el proyecto, instalar las dependencias y crear un archivo
`.env` privado a partir de la plantilla `.env.example`.

La conexión a MongoDB Atlas se configura localmente, sin publicar
credenciales ni información sensible en el repositorio.

## Instalación y configuración

1.  Clonar o copiar el proyecto en la carpeta de trabajo
    correspondiente.
2.  Instalar las dependencias:

``` bash
npm ci
```

3.  Crear el archivo `.env` a partir de `.env.example`.
4.  Configurar la conexión a MongoDB Atlas utilizando la base
    `reservas_salas_u10`.
5.  Comprobar la configuración y la conexión:

``` bash
npm run check
node --env-file=.env scripts/comprobar-conexion.js
```

6.  Iniciar el servidor:

``` bash
node --env-file=.env src/index.js
```

La aplicación queda disponible en:

``` text
http://localhost:3000
```

No es necesaria una instalación local de MongoDB, ya que se utiliza
MongoDB Atlas.

### Variables de entorno

Ejemplo de la estructura del archivo `.env.example`:

``` env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST/reservas_salas_u10?retryWrites=true&w=majority
```

Los valores `USUARIO`, `CLAVE` y `HOST` son marcadores ilustrativos.
Deben reemplazarse localmente por los datos de conexión
correspondientes.

El archivo `.env` contiene información privada y no debe subirse al
repositorio.

## Organización por capas

El proyecto mantiene una arquitectura organizada por responsabilidades:

-   **Rutas:** reciben las solicitudes HTTP y las dirigen al middleware
    o controlador correspondiente.
-   **Middleware y validaciones:** comprueban los datos recibidos y
    rechazan entradas inválidas.
-   **Controladores:** interpretan los parámetros de la solicitud,
    coordinan las operaciones y construyen las respuestas HTTP.
-   **Servicios:** aplican las operaciones de consulta y preparan los
    datos obtenidos de MongoDB.
-   **Modelo:** define el esquema de Mongoose y la interacción con
    MongoDB.
-   **Vistas y archivos públicos:** mantienen el formulario, el listado,
    el detalle y la ruta `/estado`.

La implementación de las nuevas consultas se concentra principalmente
en:

-   `src/servicios/reservas-mongo.js`
-   `src/controladores/reservas.js`

Se amplía el método `consultar` del servicio y se modifica `listarApi`
del controlador para interpretar los parámetros de consulta.

Se conserva el método `listar` para las vistas HTML y el método `contar`
para la ruta `/estado`.

## API

La API conserva las operaciones CRUD del TP 09 e incorpora las nuevas
opciones de consulta en el listado.

  -----------------------------------------------------------------------
  Método                  Ruta                    Comportamiento
  ----------------------- ----------------------- -----------------------
  `POST`                  `/api/reservas`         Crea una reserva.
                                                  Responde `201` e
                                                  incluye `Location`.

  `GET`                   `/api/reservas`         Devuelve reservas con
                                                  filtros, ordenamiento,
                                                  paginación y selección
                                                  de campos.

  `GET`                   `/api/reservas/:id`     Devuelve una reserva o
                                                  `404` si no existe.

  `PUT`                   `/api/reservas/:id`     Reemplaza una reserva
                                                  completa.

  `PATCH`                 `/api/reservas/:id`     Modifica parcialmente
                                                  los campos permitidos.

  `DELETE`                `/api/reservas/:id`     Elimina físicamente una
                                                  reserva.
  -----------------------------------------------------------------------

### Consulta del listado

La ruta principal de consultas es:

``` http
GET /api/reservas
```

Los parámetros se envían mediante la URL y pueden combinarse siempre que
sean válidos.

### 1. Filtro por sala

Permite consultar únicamente las reservas correspondientes a una sala
determinada.

Parámetro:

``` text
sala
```

Valores utilizados:

-   `Sala Norte`
-   `Sala Sur`
-   `Sala Multimedia`

Ejemplo:

``` http
GET /api/reservas?sala=Sala%20Norte
```

El filtro utiliza coincidencia exacta después de eliminar los espacios
iniciales y finales del texto.

Si no se envía `sala`, se consideran todas las reservas.

Si una sala no tiene reservas, la API responde `200` con un arreglo
vacío dentro de `datos`. No se eliminan documentos ni se devuelve `404`.

### 2. Ordenamiento

Permite establecer el orden en el que se presentan las reservas.

Parámetro:

``` text
orden
```

Opciones permitidas:

  -----------------------------------------------------------------------
  Valor                               Comportamiento
  ----------------------------------- -----------------------------------
  `estudiante`                        Orden ascendente por estudiante. Es
                                      el valor predeterminado.

  `personas-asc`                      Orden ascendente por cantidad de
                                      personas.

  `personas-desc`                     Orden descendente por cantidad de
                                      personas.
  -----------------------------------------------------------------------

En todos los casos se utiliza `_id` en orden ascendente como criterio
secundario para resolver empates.

Ejemplos:

``` http
GET /api/reservas?orden=estudiante
```

``` http
GET /api/reservas?orden=personas-asc
```

``` http
GET /api/reservas?orden=personas-desc
```

El ordenamiento modifica únicamente la presentación de los resultados.
No modifica los valores guardados en MongoDB.

### 3. Paginación

La paginación permite dividir el resultado de una consulta en grupos de
registros.

Parámetros:

  Parámetro   Descripción                               Valor predeterminado
  ----------- ----------------------------------------- ----------------------
  `pagina`    Número de página solicitada.              `1`
  `limite`    Cantidad máxima de reservas por página.   `2`

Restricciones:

-   `pagina`: número entero entre `1` y `1000`.
-   `limite`: número entero entre `1` y `20`.

Ejemplo:

``` http
GET /api/reservas?pagina=1&limite=2
```

Para calcular el desplazamiento se utiliza:

``` javascript
const salto = (pagina - 1) * limite;
```

La consulta utiliza el filtro correspondiente y aplica las operaciones
de ordenamiento, desplazamiento y límite.

Una página sin resultados responde `200` con `datos` vacío y los
metadatos correspondientes.

### 4. Selección de campos

La consulta devuelve únicamente los campos públicos definidos para las
reservas.

Campos incluidos:

-   `id`
-   `estudiante`
-   `email`
-   `sala`
-   `fecha`
-   `turno`
-   `personas`
-   `estado`

El identificador de MongoDB se utiliza internamente para construir el
campo público `id`.

No se exponen directamente `_id` ni `__v`.

La selección de campos está definida por el servidor y no puede
modificarse libremente mediante parámetros enviados por el cliente.

## Formato de respuesta del listado

A diferencia del TP 09, donde el listado de la API devolvía directamente
un arreglo, en este trabajo práctico la respuesta incorpora metadatos de
paginación.

Ejemplo ilustrativo:

``` json
{
  "datos": [
    {
      "id": "IDENTIFICADOR_1",
      "estudiante": "Ana Ejemplo",
      "email": "ana@example.com",
      "sala": "Sala Norte",
      "fecha": "2026-10-28",
      "turno": "Mañana",
      "personas": 2,
      "estado": "pendiente"
    }
  ],
  "pagina": 1,
  "limite": 2,
  "total": 4,
  "paginas": 2
}
```

Los valores del identificador y los datos del ejemplo son ilustrativos.

Descripción de los metadatos:

  -----------------------------------------------------------------------
  Campo                               Descripción
  ----------------------------------- -----------------------------------
  `datos`                             Arreglo con las reservas
                                      correspondientes a la página
                                      solicitada.

  `pagina`                            Número de página actual.

  `limite`                            Cantidad máxima de registros por
                                      página.

  `total`                             Cantidad total de reservas que
                                      cumplen el filtro, antes de aplicar
                                      la paginación.

  `paginas`                           Cantidad total de páginas
                                      disponibles.
  -----------------------------------------------------------------------

La cantidad de páginas se calcula a partir del total de registros y el
límite seleccionado. Si el total es cero, la cantidad de páginas también
es cero.

La ruta `GET /api/reservas/:id` conserva su respuesta individual y no
incorpora los metadatos del listado.

## Reglas de validación

Se conservan las reglas de validación del TP 09 para las operaciones de
escritura:

-   `estudiante`: texto obligatorio, sin espacios al inicio o al final.
-   `email`: texto obligatorio, sin espacios al inicio o al final y con
    `@`.
-   `sala`: `Sala Norte`, `Sala Sur` o `Sala Multimedia`.
-   `fecha`: texto obligatorio, sin espacios al inicio o al final.
-   `turno`: `Mañana`, `Tarde` o `Noche`.
-   `personas`: número entero entre `1` y `6`.
-   `estado`: `pendiente` o `confirmada`; al crear, el valor
    predeterminado es `pendiente`.

Las nuevas validaciones del listado controlan los parámetros de
consulta:

-   Solo se aceptan los parámetros habilitados por la API.
-   Los parámetros de texto deben tener contenido cuando se envían.
-   No se aceptan parámetros repetidos.
-   Los valores de orden deben pertenecer a las opciones permitidas.
-   `pagina` y `limite` deben ser números enteros dentro de los rangos
    establecidos.
-   No se aceptan valores vacíos, arreglos ni parámetros desconocidos.
-   La selección de campos no queda a disposición del cliente.

Los parámetros inválidos responden `400` y no modifican los documentos
almacenados.

## Pruebas con Postman

Utilizar la siguiente URL base:

``` text
http://localhost:3000
```

Para las solicitudes `POST`, `PUT` y `PATCH`, seleccionar:

**Body → raw → JSON**

Configurar el encabezado:

``` text
Content-Type: application/json
```

Para las solicitudes `GET` y `DELETE`, dejar el cuerpo en `none`.

### Preparación de datos de prueba

La consigna propone trabajar con una base nueva denominada
`reservas_salas_u10` y cargar seis reservas de prueba.

Los siguientes datos permiten comprobar los filtros, el ordenamiento y
la paginación:

  Estudiante       Sala                Personas
  ---------------- ----------------- ----------
  Ana Ejemplo      Sala Norte                 2
  Bruno Ejemplo    Sala Norte                 1
  Carla Ejemplo    Sala Norte                 2
  Diego Ejemplo    Sala Norte                 3
  Elena Ejemplo    Sala Sur                   1
  Fabian Ejemplo   Sala Multimedia            4

Para completar cada reserva se utilizan también los campos `email`,
`fecha` y `turno`, respetando las validaciones del proyecto.

Cada reserva debe enviarse mediante una solicitud `POST` individual. No
se debe enviar un arreglo de reservas.

Si los datos ya están cargados, comprobar su existencia y no repetir las
operaciones `POST` para evitar duplicados.

### Recorrido de pruebas recomendado

1.  Consultar `GET /api/reservas` sin parámetros. Comprobar el listado
    general y los metadatos.
2.  Filtrar por `sala=Sala Norte`. Comprobar que se devuelven cuatro
    reservas.
3.  Filtrar por `sala=Sala Sur`. Comprobar que se devuelve una reserva.
4.  Filtrar por `sala=Sala Multimedia`. Comprobar que se devuelve una
    reserva.
5.  Consultar una sala inexistente. Comprobar que se devuelve `200` con
    `datos` vacío.
6.  Consultar `orden=personas-asc` y verificar el orden ascendente.
7.  Consultar `orden=personas-desc` y verificar el orden descendente.
8.  Consultar sin indicar `orden` y comprobar el orden predeterminado
    por estudiante.
9.  Combinar filtro, orden y paginación.
10. Consultar la primera y la segunda página, comprobando que no se
    repitan los registros entre ambas.
11. Probar páginas sin resultados.
12. Probar parámetros inválidos, repetidos o desconocidos.
13. Comprobar que la selección de campos no permite exponer información
    adicional.
14. Verificar que el formulario, el listado HTML, el detalle y `/estado`
    continúan funcionando.

### Caso combinado de filtro, orden y paginación

Solicitud:

``` http
GET /api/reservas?sala=Sala%20Norte&orden=personas-asc&pagina=1&limite=2
```

Resultado esperado:

-   Código HTTP: `200`.
-   Dos reservas en `datos`.
-   `pagina`: `1`.
-   `limite`: `2`.
-   `total`: `4`.
-   `paginas`: `2`.

La primera página debe mostrar las reservas con menor cantidad de
personas.

Para consultar la segunda página:

``` http
GET /api/reservas?sala=Sala%20Norte&orden=personas-asc&pagina=2&limite=2
```

Resultado esperado:

-   Código HTTP: `200`.
-   Dos reservas en `datos`.
-   `pagina`: `2`.
-   `limite`: `2`.
-   `total`: `4`.
-   `paginas`: `2`.

Los dos resultados deben corresponder a reservas diferentes, manteniendo
el mismo filtro y orden.

### Casos de validación de consultas

  -----------------------------------------------------------------------
  Prueba                              Resultado esperado
  ----------------------------------- -----------------------------------
  Listado sin parámetros              `200`, página 1, límite 2 y total
                                      6.

  Filtro Sala Norte                   `200`, total 4.

  Filtro Sala Sur                     `200`, total 1.

  Filtro Sala Multimedia              `200`, total 1.

  Sala inexistente                    `200`, datos vacío y total 0.

  Sala Norte, página 3 y límite 2     `200`, datos vacío, total 4 y
                                      páginas 2.

  Página 0                            `400`.

  Página decimal                      `400`.

  Límite 21                           `400`.

  Parámetro repetido                  `400`.

  Sala vacía                          `400`.

  Orden no permitido                  `400`.

  Parámetro desconocido               `400`.

  Selección de campos enviada por el  `400`, si se intenta utilizar como
  cliente                             parámetro no permitido.
  -----------------------------------------------------------------------

## Continuidad con el TP 09

Se mantiene el funcionamiento de las operaciones anteriores:

-   Creación de reservas.
-   Consulta individual por identificador.
-   Reemplazo completo mediante `PUT`.
-   Actualización parcial mediante `PATCH`.
-   Eliminación física mediante `DELETE`.
-   Formulario HTML.
-   Listado y detalle HTML.
-   Ruta `/estado`.

El método `listar` continúa siendo utilizado por las vistas HTML. La
nueva consulta `consultar` se utiliza para el listado de la API.

Esta separación permite incorporar nuevas opciones de consulta sin
modificar el comportamiento del sitio web.

## Organización de los datos: salas y reservas

Como parte de la actividad, se analiza conceptualmente la relación entre
una sala y una reserva.

Una **sala** representa un espacio físico que puede tener
características propias, como nombre, capacidad, ubicación y
equipamiento.

Una **reserva** representa la solicitud de utilización de ese espacio en
una fecha y turno determinados. Sus datos incluyen estudiante, email,
sala, fecha, turno, cantidad de personas y estado.

Desde el punto de vista del diseño de datos, una sala podría constituir
una entidad independiente, ya que sus características pueden ser
compartidas por numerosas reservas.

En cambio, los datos particulares de una reserva pertenecen a esa
solicitud.

Una posible solución de diseño sería mantener las salas como documentos
independientes y utilizar una referencia desde cada reserva hacia la
sala correspondiente. Esto permitiría reutilizar la información de una
misma sala en distintas reservas y evitar duplicar sus características.

Esta explicación es una propuesta conceptual. No implica agregar un
modelo nuevo ni implementar referencias o `populate` en este trabajo
práctico.

## Evidencias

Se recomienda conservar las siguientes evidencias de las pruebas
realizadas:

-   Captura del listado general.
-   Captura del filtro por sala.
-   Captura del orden ascendente y descendente.
-   Captura de la primera página y de la segunda página.
-   Captura de una consulta combinada.
-   Captura de los errores de validación.
-   Captura de una página sin resultados.
-   Captura del funcionamiento del sitio y de la ruta `/estado`.

También se puede adjuntar la colección de Postman exportada con las
solicitudes utilizadas durante la comprobación.

## Alcance del trabajo

Este trabajo práctico amplía las consultas de reservas incorporando
filtros, ordenamiento, paginación y selección de campos.

Se conserva la estructura del proyecto anterior y el funcionamiento de
las operaciones CRUD, las vistas HTML y las validaciones existentes.

No se incorpora un nuevo modelo de salas ni se implementan relaciones
mediante `populate`. Tampoco se agregan autenticación ni despliegue
público.

## Conclusión

El Trabajo Práctico N.º 10 permite ampliar las consultas de reservas y
comprender cómo aplicar filtros, ordenamientos, paginación y selección
de campos desde una API desarrollada con Node.js, Express, Mongoose y
MongoDB.

La separación entre controladores y servicios permite validar las
opciones recibidas por el cliente y construir consultas controladas
hacia la base de datos.

De esta manera, el listado de reservas puede adaptarse a diferentes
necesidades sin alterar los documentos almacenados ni afectar el
funcionamiento de las operaciones anteriores.
