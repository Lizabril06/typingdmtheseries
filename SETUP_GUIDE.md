# 🚀 Guía de Configuración Completa
## Cast & Plan · CMS con Decap + GitHub + Netlify

> **Para alguien que no sabe programar.** Sigue cada paso en orden y tendrás tu sitio listo en ~30 minutos.

---

## 📋 ¿Qué vas a lograr?

Cuando termines esta guía tendrás:
- ✅ Tu portal **publicado en internet** con una URL tipo `cast-and-plan.netlify.app`
- ✅ Un **panel de administración** en `tu-sitio.netlify.app/admin`
- ✅ Editar textos, subir fotos, agregar actores, noticias, sponsors **sin tocar código**
- ✅ Cada cambio se publica **automáticamente** en segundos
- ✅ Funciona igual en celular y computadora

---

## PASO 1 — Crear cuenta en GitHub (gratis)

1. Ve a **[github.com](https://github.com)** → clic en **"Sign up"**
2. Elige un username (ej: `lizmtsent`)
3. Confirma tu email

---

## PASO 2 — Subir el proyecto a GitHub

### Opción A: Desde la web (más fácil)

1. En GitHub, clic en el botón verde **"New"** (o el ícono `+` arriba)
2. **Repository name:** `cast-and-plan`
3. Deja todo lo demás como está → clic **"Create repository"**
4. En la siguiente pantalla, clic en **"uploading an existing file"**
5. Arrastra **TODOS** los archivos de esta carpeta y suéltalos
6. Abajo escribe: `Initial upload` → clic **"Commit changes"**

> ⚠️ **Importante:** Al subir los archivos, mantén la estructura de carpetas:
> - `admin/` (carpeta con index.html y config.yml)
> - `_data/` (carpeta con los archivos JSON)
> - `images/` (carpeta para las imágenes)
> - `index.html` (tu portal principal)
> - `netlify.toml`

---

## PASO 3 — Conectar con Netlify

1. Ve a **[netlify.com](https://netlify.com)** → clic **"Sign up"** → usa tu cuenta de GitHub
2. Clic en **"Add new site"** → **"Import an existing project"**
3. Clic en **"Deploy with GitHub"**
4. Autoriza Netlify a acceder a GitHub
5. Busca y selecciona tu repositorio **`cast-and-plan`**
6. En la pantalla de configuración:
   - **Branch to deploy:** `main`
   - **Build command:** (déjalo vacío)
   - **Publish directory:** `.` (un punto)
7. Clic **"Deploy cast-and-plan"**

🎉 ¡Tu sitio ya está en internet! Netlify te da una URL tipo `random-name-123.netlify.app`

### Cambiar el nombre de tu sitio (opcional)
- En Netlify: **Site configuration** → **Change site name** → escribe algo como `cast-and-plan-2026`
- Tu URL será: `cast-and-plan-2026.netlify.app`

---

## PASO 4 — Activar Netlify Identity (para el login del admin)

1. En el panel de Netlify, ve a **"Site configuration"** → **"Identity"**
2. Clic **"Enable Identity"**
3. En **"Registration preferences"** → selecciona **"Invite only"** (para que solo tú puedas entrar)
4. Baja hasta **"Services"** → **"Git Gateway"** → clic **"Enable Git Gateway"**

---

## PASO 5 — Conectar el CMS a tu repositorio

1. Abre el archivo `admin/config.yml` en GitHub
2. En la línea que dice:
   ```
   repo: YOUR_GITHUB_USERNAME/cast-and-plan
   ```
   Cambia `YOUR_GITHUB_USERNAME` por tu username de GitHub. Ejemplo:
   ```
   repo: lizmtsent/cast-and-plan
   ```
3. Clic **"Commit changes"** → Netlify se actualiza automáticamente en ~30 segundos

---

## PASO 6 — Crear tu usuario administrador

1. En Netlify: **Identity** → **"Invite users"**
2. Escribe tu email → **"Send"**
3. Revisa tu email → clic en el link de invitación
4. Crea tu contraseña

---

## PASO 7 — ¡Entrar al Admin Panel!

1. Ve a `https://TU-SITIO.netlify.app/admin`
2. Clic **"Login with Netlify Identity"**
3. Ingresa con tu email y contraseña

### ¡Listo! Ya puedes editar todo sin código 🎉

---

## 🎨 Cómo usar el Admin Panel

### Cambiar el nombre del proyecto, colores, etc.
1. En el menú izquierdo → **"⚙️ Configuración del Proyecto"** → **"🎨 General"**
2. Edita lo que quieras → clic **"Publish"** (botón azul arriba)

### Agregar un actor nuevo
1. **"🎭 Actores / Cast"** → clic **"New Actor"**
2. Llena: ID (sin espacios, ej: `carlos`), Nombre, sube su foto
3. Agrega sus redes sociales
4. Clic **"Publish"**
5. ✅ El actor aparece en el portal en ~30 segundos

### Cambiar la foto de un actor
1. **"🎭 Actores / Cast"** → clic en el actor
2. En el campo **"Foto de perfil"** → clic **"Choose an image"** → sube la nueva foto
3. Clic **"Publish"**

### Publicar una noticia
1. **"📰 Noticias & Novedades"** → **"New Noticia"**
2. Escribe el título y el contenido
3. Activa **"Fijar al inicio"** si quieres que aparezca primero
4. Clic **"Publish"**

### Crear una tarea de sponsor
1. **"⭐ Sponsors & Tareas"** → **"New Tarea de Sponsor"**
2. Llena: nombre del sponsor, título, XP, fecha límite
3. En "Actores asignados" escribe los IDs de los actores (ej: `gigi`, `ant`)
4. Clic **"Publish"**

### Agregar un episodio del podcast
1. **"🎙 DM Podcast - Episodios"** → **"New Episodio"**
2. Llena el número, título, y el rundown completo
3. Cambia el estado (Borrador → Grabado → En edición → Publicado)
4. Clic **"Publish"**

### Subir imágenes
1. Clic en **"Media"** en la barra superior del admin
2. Clic **"Upload"** → arrastra tus imágenes
3. Las imágenes quedan disponibles para usar en cualquier campo del CMS

---

## 🔄 ¿Cómo funciona? (versión simple)

```
Tú editas en el Admin  →  Netlify guarda en GitHub  →  Netlify re-publica el sitio
      (30 seg)                   (automático)                   (automático)
```

Cada vez que guardas algo en el admin:
1. Netlify escribe el cambio en tu repositorio de GitHub
2. Netlify detecta el cambio y re-publica el sitio
3. En ~30 segundos todos los usuarios ven los cambios

---

## 👥 Dar acceso a otras personas (ej: Gigi, Ant)

1. En Netlify → **Identity** → **"Invite users"**
2. Escribe el email de la persona → **"Send"**
3. Ellos reciben un email para crear su contraseña
4. Pueden entrar a `tu-sitio.netlify.app/admin` con su propio login

> 💡 Todos los que tengan acceso pueden editar. No hay roles diferentes en Decap CMS básico — todos tienen acceso completo al admin.

---

## 📱 Usar el admin desde el celular

El admin de Decap CMS funciona en celular, aunque es más cómodo en computadora. Solo entra a `tu-sitio.netlify.app/admin` desde el navegador de tu celular.

---

## ❓ Problemas frecuentes

**"No puedo entrar al admin"**
→ Revisa que hayas activado **Identity** y **Git Gateway** en Netlify (Paso 4)

**"Mis cambios no aparecen en el sitio"**
→ Espera 1-2 minutos. Si no aparecen, ve a Netlify → **Deploys** → verifica que el último deploy diga "Published"

**"No veo el botón de Publish"**
→ Asegúrate de haber completado todos los campos requeridos (marcados con *)

**"La foto no aparece"**
→ Las fotos deben subirse desde el campo de imagen del actor, no desde fuera del CMS

---

## 🆘 Necesitas ayuda

Si algo no funciona, comparte:
1. El error exacto que ves
2. En qué paso estás

---

*Guía creada para Cast & Plan · 2026*
