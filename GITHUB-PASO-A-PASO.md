# 🚀 GUÍA PASO A PASO: Subir Proyecto a GitHub

**Versión:** 1.0  
**Fecha:** 12 de Noviembre de 2025  
**Verificado:** Git 2.51.0 instalado ✅ | 19 archivos Markdown ✅

---

## 📋 CHECKLIST INICIAL

```
✅ Git instalado (git version 2.51.0.windows.1)
✅ 19 archivos Markdown en carpeta
✅ Windows PowerShell disponible
✅ Acceso a internet
⏳ Cuenta GitHub (necesitas crear)
```

---

## 🎯 PLAN DE ACCIÓN

```
PASO 1: Crear cuenta GitHub (5 min)
PASO 2: Crear repositorio vacío (2 min)
PASO 3: Configurar Git local (1 min)
PASO 4: Subir archivos (1 min)
PASO 5: Verificar en GitHub (1 min)

TOTAL: ~10 minutos ⏱️
```

---

## ✅ PASO 1: Crear Cuenta GitHub

### Si YA tienes cuenta → Salta a PASO 2

### Si NO tienes cuenta:

**En tu navegador:**

1. Ir a: **https://github.com/signup**
2. Llenar:
   ```
   Email: tu-email@gmail.com (o cualquiera)
   Password: contraseña fuerte (guárdala!)
   Username: algo-unico (ej: tu-nombre-2025)
   ```
3. Verificar email (GitHub te envía link)
4. Completar setup (preguntas opcionales)
5. **¡Listo!** Tienes tu cuenta GitHub

---

## ✅ PASO 2: Crear Repositorio en GitHub

### En GitHub web:

1. Hacer login
2. Click en **"+"** arriba a la derecha
3. Seleccionar **"New repository"**
4. Llenar:
   ```
   Repository name:     reto-escuela-proyecto
   Description:         Proyecto integral BD + API + NLQ
   Visibility:          ⭕ Public (visible para todos)
                    ○ Private (solo tú + invitados)
   ```
5. **NO** marcar: "Initialize with README"
6. Click **"Create repository"**

### Resultado:
Se abre una página con instrucciones. Copia esta URL:
```
https://github.com/tu-usuario/reto-escuela-proyecto.git
```

Ejemplo:
```
https://github.com/ranamateo/reto-escuela-proyecto.git
```

---

## ✅ PASO 3: Configurar Git en tu PC

### Abre PowerShell y ejecuta esto:

```powershell
# 1. Ir a carpeta del proyecto
cd C:\tmp\reto-escuela-proyecto

# 2. Verificar archivos
ls *.md | wc -l
# Debe mostrar: 19

# 3. Inicializar Git
git init

# 4. Agregar tu nombre/email
git config user.name "Tu Nombre"
git config user.email "tu-email@gmail.com"

# 5. Verificar config
git config --list | grep user
```

**Salida esperada:**
```
user.name=Tu Nombre
user.email=tu-email@gmail.com
```

---

## ✅ PASO 4: Subir Archivos a GitHub

### En PowerShell (en la carpeta del proyecto):

```powershell
# 1. Agregar todos los archivos
git add .

# 2. Hacer primer commit
git commit -m "Initial commit: Proyecto Reto_Escuela D2-D9 completo"

# 3. Renombrar rama a 'main'
git branch -M main

# 4. Conectar con GitHub
git remote add origin https://github.com/tu-usuario/reto-escuela-proyecto.git

# 5. Subir archivos
git push -u origin main
```

**Nota:** Te pedirá credenciales GitHub. Tienes 2 opciones:

### Opción A: Token de acceso (RECOMENDADO)

En GitHub:
1. Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Llenar:
   ```
   Note: PowerShell upload
   Expiration: 90 days
   Scopes: ✅ repo (todos los checks)
   ```
4. Click "Generate token"
5. **COPIA el token** (aparece solo una vez)

En PowerShell cuando pida password:
```
Username: tu-usuario
Password: (pega el token)
```

### Opción B: Usuario + Contraseña
```
Username: tu-usuario
Password: tu-contraseña-github
```

---

## ✅ PASO 5: Verificar en GitHub

### En el navegador:

1. Ir a: `https://github.com/tu-usuario/reto-escuela-proyecto`
2. Deberías ver:
   ```
   ✅ 19 archivos listados
   ✅ Carpeta llena de .md
   ✅ "Initial commit" en historial
   ✅ README si existe (opcional)
   ```

3. Clickear en un archivo para previsualizar

4. **¡FELICIDADES!** 🎉 Tu proyecto está en GitHub

---

## 📊 VERIFICACIÓN FINAL

### En PowerShell, ejecuta:

```powershell
# Ver estado
git status
# Debe mostrar: On branch main, nothing to commit

# Ver historial
git log --oneline -3
# Debe mostrar tu commit

# Ver remote
git remote -v
# Debe mostrar:
# origin  https://github.com/tu-usuario/reto-escuela-proyecto.git (fetch)
# origin  https://github.com/tu-usuario/reto-escuela-proyecto.git (push)
```

---

## 🔗 COMPARTIR EL LINK

### Tu proyecto ahora está en:

```
https://github.com/tu-usuario/reto-escuela-proyecto
```

### Para compartir con otra persona:

Opción 1 - Link directo:
```
https://github.com/tu-usuario/reto-escuela-proyecto
```

Opción 2 - Comando para clonar:
```bash
git clone https://github.com/tu-usuario/reto-escuela-proyecto.git
```

Opción 3 - Email:
```
Puedes descargar como ZIP:
GitHub → Code → Download ZIP
```

---

## 🆘 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "fatal: not a git repository"

**Solución:**
```powershell
cd C:\tmp\reto-escuela-proyecto
git init
```

---

### Problema 2: "error: remote origin already exists"

**Solución:**
```powershell
git remote remove origin
git remote add origin https://github.com/tu-usuario/reto-escuela-proyecto.git
```

---

### Problema 3: "fatal: Authentication failed"

**Solución:**
1. Usa token de acceso (no contraseña)
2. Token debe tener permiso `repo`
3. Copia exactamente sin espacios

---

### Problema 4: "Permission denied (publickey)"

**Solución (Windows):**
```powershell
# Es normal en Windows. Usa HTTPS en lugar de SSH:
git remote set-url origin https://github.com/tu-usuario/reto-escuela-proyecto.git
```

---

### Problema 5: "error: src refspec main does not match any"

**Solución:**
```powershell
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## 🎓 PRÓXIMOS PASOS (Después de subir)

### 1. Crear README.md

```markdown
# Proyecto Reto_Escuela

Sistema integral de gestión escolar con:
- Base de datos Oracle 23c
- API REST con 15 endpoints
- Natural Language Queries (D9)
- Documentación completa

## Inicio Rápido

\`\`\`bash
git clone https://github.com/tu-usuario/reto-escuela-proyecto.git
cd reto-escuela-proyecto
cat PROYECTO-FINAL.md
\`\`\`

## Documentación

- [PROYECTO-FINAL.md](PROYECTO-FINAL.md) - Resumen general
- [INDEX-MAESTRO.md](INDEX-MAESTRO.md) - Índice de archivos
- [D6-Guia-Instalacion-Deployment.md](D6-Guia-Instalacion-Deployment.md) - Setup

## Licencia

Abierto para educación y colaboración
```

En PowerShell:
```powershell
# Crear README
@'
# Proyecto Reto_Escuela
...
'@ | Out-File -Encoding UTF8 README.md

git add README.md
git commit -m "Add README"
git push origin main
```

---

### 2. Agregar .gitignore

```powershell
# Crear .gitignore
@'
# Node
node_modules/
package-lock.json

# Environment
.env
.env.local

# Sistema
.DS_Store
Thumbs.db
*.log

# IDE
.vscode/
.idea/
*.code-workspace
'@ | Out-File -Encoding UTF8 .gitignore

git add .gitignore
git commit -m "Add .gitignore"
git push origin main
```

---

### 3. Crear carpeta de código (opcional)

```powershell
mkdir code
cd code

# Copiar archivos de D6-Codigo-Fuente.md aquí
# server.js, app.js, package.json, etc.

git add code/
git commit -m "Add source code from D6"
git push origin main
```

---

## 📈 ESTADÍSTICAS FINALES

Después de subir:
```
Tu repositorio GitHub:
├── 19 archivos Markdown (184 KB)
├── Documentación D2-D9
├── Código en D6-Codigo-Fuente.md
├── Guías de instalación/deployment
└── Historial Git completo

Visible públicamente en:
https://github.com/tu-usuario/reto-escuela-proyecto
```

---

## ✅ CHECKLIST FINAL

- [ ] Cuenta GitHub creada
- [ ] Repositorio vacío creado en GitHub
- [ ] Git configurado localmente
- [ ] git add . ejecutado
- [ ] git commit hecho
- [ ] git branch -M main ejecutado
- [ ] git remote add origin configurado
- [ ] git push -u origin main exitoso
- [ ] Verificado en GitHub web
- [ ] Link compartible preparado
- [ ] README.md añadido (opcional)
- [ ] .gitignore añadido (opcional)

---

## 🎉 ¡COMPLETADO!

Tu proyecto está:
✅ En GitHub  
✅ Compartible por link  
✅ Con versionamiento  
✅ Backupeado automáticamente  
✅ Listo para colaboración

---

**Generado:** 12 de Noviembre de 2025  
**Versión:** 1.0.0  
**Status:** ✅ Paso a paso verificado

