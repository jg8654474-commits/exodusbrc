# Exodus Streetwear — Guía de deploy en Netlify

## Estructura del proyecto

```
exodus-site/
├── index.html                    ← Sitio principal
├── admin.html                    ← Panel de administración (protegido)
├── netlify.toml                  ← Configuración de Netlify
├── netlify/
│   └── functions/
│       ├── login.js              ← Función que verifica la contraseña
│       └── verify.js             ← Función que valida el token de sesión
├── img/                          ← Tus imágenes (subir manualmente)
└── README.md
```

---

## Paso a paso para subir a Netlify

### 1. Subir el proyecto

**Opción A — Drag & drop (más fácil):**
1. Comprimí toda la carpeta `exodus-site` en un `.zip`
2. Entrá a [netlify.com](https://netlify.com) → tu sitio → **Deploys**
3. Arrastrá el `.zip` al área de deploy

**Opción B — GitHub (recomendado para actualizaciones continuas):**
1. Subí la carpeta a un repositorio de GitHub
2. Conectá el repo en Netlify → **Add new site → Import an existing project**

---

### 2. Configurar las variables de entorno ⚠️ OBLIGATORIO

Sin este paso, el login NO va a funcionar.

1. En Netlify, andá a tu sitio → **Site configuration → Environment variables**
2. Agregá estas dos variables:

| Variable         | Valor                                              |
|------------------|----------------------------------------------------|
| `ADMIN_PASSWORD` | La contraseña que quieras usar para entrar al admin |
| `ADMIN_SECRET`   | Una cadena larga y aleatoria (mínimo 32 caracteres) |

**Ejemplo de ADMIN_SECRET:**
```
k9#mX2$vQpL8nRwZ4jYtF6uC1eDhBsA0
```
(Podés generar una en: https://1password.com/password-generator/ → modo "random")

3. Guardá los cambios
4. Hacé un nuevo deploy (Deploys → Trigger deploy)

---

### 3. Cómo entrar al admin

1. Abrí tu sitio (`tudominio.netlify.app`)
2. Bajá hasta el **footer** y hacé clic en el punto invisible al final
   (está al final del copyright, es un botón transparente)
3. Ingresá tu contraseña
4. Se abre el panel de administración

**Sesión:** dura 8 horas. Al cerrar el navegador te pide la contraseña de nuevo.

---

### 4. Cómo funciona la seguridad

- La contraseña **nunca está en el código** — vive en Netlify como variable de entorno
- El servidor genera un token firmado con HMAC-SHA256 al hacer login
- El admin verifica el token con el servidor cada vez que se abre
- Si el token es inválido o expirado, redirige al index automáticamente
- Los cambios del admin se guardan en `localStorage` del navegador

---

### 5. Carpeta de imágenes

Las imágenes deben estar en la carpeta `img/` con los mismos nombres que usás en el admin.
Si agregás una prenda nueva, subí la foto a `img/` antes de referenciarla en el admin.

---

## Soporte

Cualquier problema, revisá:
- Que las variables de entorno estén bien escritas (sin espacios)
- Que hayas hecho un nuevo deploy después de setear las variables
- Que el sitio esté en `https://` (Netlify lo hace automático)
