# AC Training

Aplicación web para la gestión de rutinas de entrenamiento personal. Un entrenador arma y sigue los planes de sus alumnos, y cada alumno ve su rutina y registra lo que entrena. Pensada mobile-first, para usarse desde el celular en el gimnasio.

Reemplaza la típica planilla de Excel del entrenador por una herramienta con roles, seguridad por usuario y registro del progreso semana a semana.

---

## Funcionalidades

**Entrenador**
- Lista de alumnos agrupada por estado (con plan activo / sin plan asignado), con ficha completa: objetivo, datos físicos, lesiones, días y horarios de entrenamiento y contacto de emergencia.
- Armado de planes organizados por **meses → semanas → días**, con ejercicios (reps, peso, aclaraciones y superseries). Los meses anteriores quedan guardados para ver la progresión.
- "Duplicar semana" para reutilizar la estructura y ajustar solo los pesos, y borrado de meses, semanas y días.
- Pantalla "Dar la clase": permite elegir semana y día, muestra el peso de la semana pasada al lado, marcar cada ejercicio como hecho / no hecho, cargar el peso usado (guardado automático) y finalizar el día.
- **Control de pagos** por alumno: estado al día / pendiente, registro con fecha, monto y período, e historial editable.

**Alumno**
- Registro con enlace (queda asignado a su entrenador automáticamente), con confirmación de contraseña.
- Home con el entrenamiento del día y barra de progreso.
- Navegación por su rutina completa, organizada por meses y semanas.
- Registro propio cuando entrena solo (queda guardado quién cargó cada dato).

**General**
- Autenticación por rol (entrenador / alumno) con sesión persistente.
- Modo claro / oscuro con preferencia guardada en el navegador.
- Estados vacíos claros, animaciones sutiles y diseño mobile-first.

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **React Router** para la navegación
- **Tailwind CSS v4** (tokens de diseño semánticos, sin colores hardcodeados)
- **Supabase** (PostgreSQL + Auth + Row Level Security) como backend
- Deploy en **Vercel**

---

## Arquitectura

- **Seguridad en la base, no solo en la interfaz.** El acceso a los datos está protegido por Row Level Security (RLS) en Supabase: cada usuario solo puede leer y escribir lo que le corresponde, aunque manipule el frontend. Las rutas por rol son solo una capa de comodidad.
- **Sistema de diseño por tokens.** Todos los colores y tipografías se definen en `src/index.css` con la paleta "Kinetic Cobalt". El modo oscuro reescribe los mismos tokens, por eso toda la app se adapta sin tocar los componentes.
- **Patrón de datos consistente.** Cada pantalla que trae datos usa un hook propio (`useStudents`, `usePlan`, `useClassDay`, etc.) que expone `data / loading / error`, y la lógica pesada vive en el hook, no en la vista.

Estructura:

```
src/
  lib/          conexión a Supabase y utilidades
  context/      autenticación y tema (claro/oscuro)
  hooks/        acceso a datos (un hook por recurso)
  components/   componentes reutilizables
  pages/
    trainer/    pantallas del entrenador
    student/    pantallas del alumno
  App.tsx       ruteo según rol
```

---

## Puesta en marcha (local)

**Requisitos:** Node.js 18+ y un proyecto de Supabase.

1. Cloná el repositorio e instalá dependencias:
   ```bash
   git clone <url-del-repo>
   cd ac-training
   npm install
   ```

2. Creá el archivo `.env` a partir del ejemplo y completá con tus claves de Supabase (Settings -> API):
   ```bash
   cp .env.example .env
   ```
   ```
   VITE_SUPABASE_URL=tu-project-url
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. Configurá la base de datos en Supabase corriendo el SQL de creación de tablas, funciones y políticas de seguridad (RLS).

4. Levantá el entorno de desarrollo:
   ```bash
   npm run dev
   ```

---

## Scripts

- `npm run dev` — entorno de desarrollo con recarga en caliente.
- `npm run build` — build de producción.
- `npm run preview` — previsualiza el build localmente.
- `npm run lint` — chequeo de estilo con ESLint.

---

## Deploy en Vercel

1. Importá el repositorio en Vercel.
2. Cargá las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en la configuración del proyecto.
3. Deploy. El archivo `vercel.json` ya incluye la reescritura necesaria para que las rutas del cliente funcionen al recargar la página.

> Nota: el plan gratuito de Supabase pausa el proyecto tras un período de inactividad. La primera carga después de una pausa puede demorar mientras el proyecto se reactiva.

---

## Roadmap

Ideas para próximas versiones:
- Planes online (además de los presenciales).
- Historial y gráficos de progreso.
- Catálogo de ejercicios con videos.
- Vínculo robusto entre ejercicios de semanas distintas (hoy el "semana pasada" se relaciona por nombre).

---

## Autora

Proyecto desarrollado por **Sofía Soler** — [Soler Studio](https://soler-studio.vercel.app).
