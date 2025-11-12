# D6 - Guía de Instalación y Deployment

---

## 1. INSTALACIÓN LOCAL

### 1.1 Requisitos Previos

```bash
# Node.js v18 o superior
node --version

# npm v9 o superior
npm --version

# Oracle Client (para oracledb)
# Descargar de: https://www.oracle.com/database/technologies/instant-client/downloads.html
```

### 1.2 Paso a Paso

```bash
# 1. Clonar/crear carpeta del proyecto
mkdir reto-escuela-api
cd reto-escuela-api

# 2. Inicializar proyecto
npm init -y

# 3. Instalar dependencias
npm install express cors dotenv oracledb jsonwebtoken bcryptjs swagger-jsdoc swagger-ui-express

# 4. Instalar dev dependencies
npm install --save-dev nodemon jest supertest

# 5. Copiar archivos
# - server.js
# - .env
# - src/ (todo el contenido)

# 6. Probar instalación
npm run dev
```

### 1.3 Estructura Final

```
reto-escuela-api/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── estudianteCtrl.js
│   │   ├── ofertaCtrl.js
│   │   └── docenteCtrl.js
│   ├── routes/
│   │   ├── estudiante.js
│   │   ├── oferta.js
│   │   └── docente.js
│   └── swagger/
│       └── swagger.js
├── server.js
├── .env
├── .env.example
├── package.json
├── README.md
└── node_modules/
```

---

## 2. CONFIGURACIÓN

### 2.1 Variables de Entorno (.env)

```bash
# Base de datos
ORACLE_USER=reto_sistema_escuela
ORACLE_PASSWORD=Clases.2025.2025
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# API
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=tu_secret_super_segura_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### 2.2 Conexión Oracle

**Windows:**
```bash
# Descargar Oracle Instant Client 23c
# https://www.oracle.com/database/technologies/instant-client/downloads.html

# Extraer a: C:\oracle\instantclient_23_3

# Agregar a PATH:
$env:PATH += ";C:\oracle\instantclient_23_3"
```

**Linux:**
```bash
# Descargar instantclient para Linux

# Extraer
mkdir -p /opt/oracle
unzip instantclient_23_3.zip -d /opt/oracle

# Agregar a .bashrc
export LD_LIBRARY_PATH=/opt/oracle/instantclient_23_3:$LD_LIBRARY_PATH
```

**macOS:**
```bash
# Con Homebrew
brew install instantclient-basic

# O descargar manualmente desde Oracle
```

---

## 3. EJECUCIÓN

### 3.1 Desarrollo

```bash
# Terminal 1: Base de datos debe estar corriendo
# (Verifica que Oracle 23c esté activo)

# Terminal 2: Iniciar API
npm run dev

# Output esperado:
# ✅ API Reto_Escuela corriendo en puerto 3000
# 📖 Swagger: http://localhost:3000/api-docs
```

### 3.2 Verificar que funciona

```bash
# En otra terminal:

# Health check
curl http://localhost:3000/health

# Listar estudiantes
curl http://localhost:3000/api/v1/estudiante

# Crear estudiante
curl -X POST http://localhost:3000/api/v1/estudiante \
  -H "Content-Type: application/json" \
  -d '{
    "ESTNOMBRE":"Test",
    "ESTAPELLIDO":"User",
    "ESTEMAIL":"test@uni.edu"
  }'
```

---

## 4. TESTING

### 4.1 Con cURL

```bash
# GET todos
curl http://localhost:3000/api/v1/estudiante?page=1&limit=5

# GET uno
curl http://localhost:3000/api/v1/estudiante/E001

# POST crear
curl -X POST http://localhost:3000/api/v1/estudiante \
  -H "Content-Type: application/json" \
  -d '{
    "ESTNOMBRE":"Carlos",
    "ESTAPELLIDO":"Mendez",
    "ESTEMAIL":"carlos@uni.edu",
    "ESTCLASE":"REGULAR"
  }'

# PATCH actualizar
curl -X PATCH http://localhost:3000/api/v1/estudiante/E001 \
  -H "Content-Type: application/json" \
  -d '{"ESTPROMEDIO":9.5}'

# DELETE eliminar
curl -X DELETE http://localhost:3000/api/v1/estudiante/E001
```

### 4.2 Con Postman

```json
{
  "info": { "name": "Reto_Escuela API" },
  "item": [
    {
      "name": "Listar Estudiantes",
      "request": { "method": "GET", "url": "{{base_url}}/estudiante" }
    },
    {
      "name": "Crear Estudiante",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/estudiante",
        "body": {
          "mode": "raw",
          "raw": "{\"ESTNOMBRE\":\"Test\",\"ESTAPELLIDO\":\"User\",\"ESTEMAIL\":\"test@uni.edu\"}"
        }
      }
    }
  ]
}
```

### 4.3 Con Jest

```bash
# Crear archivo test/estudiante.test.js
npm install --save-dev jest supertest

# Ejecutar
npm test
```

---

## 5. DEPLOYMENT

### 5.1 Production Mode

```bash
# Cambiar NODE_ENV
NODE_ENV=production npm start

# O en .env:
NODE_ENV=production
```

### 5.2 Con PM2 (Recomendado)

```bash
# Instalar PM2
npm install -g pm2

# Crear ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'reto-escuela-api',
    script: './server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js --env production

# Ver status
pm2 status

# Ver logs
pm2 logs reto-escuela-api

# Monitorear
pm2 monit
```

### 5.3 Con Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código
COPY src ./src
COPY server.js .
COPY .env .

# Exponer puerto
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
```

```bash
# Build imagen
docker build -t reto-escuela-api:1.0.0 .

# Run contenedor
docker run -p 3000:3000 \
  --env-file .env \
  --name reto-escuela-api \
  reto-escuela-api:1.0.0

# Ver logs
docker logs -f reto-escuela-api
```

### 5.4 Con Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      ORACLE_USER: reto_sistema_escuela
      ORACLE_PASSWORD: Clases.2025.2025
      ORACLE_CONNECT_STRING: host.docker.internal:1521/XEPDB1
    depends_on:
      - oracle
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  oracle:
    image: gvenzl/oracle-xe:latest
    ports:
      - "1521:1521"
    environment:
      ORACLE_PASSWORD: Clases.2025.2025
    volumes:
      - oracle-volume:/opt/oracle/oradata
    restart: unless-stopped

volumes:
  oracle-volume:
```

```bash
# Ejecutar
docker-compose up -d

# Ver status
docker-compose ps

# Logs
docker-compose logs -f api
```

### 5.5 En AWS (EC2)

```bash
# 1. SSH a EC2
ssh -i key.pem ec2-user@your-instance-ip

# 2. Instalar Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18

# 3. Clonar repo
git clone https://github.com/tu-repo/reto-escuela-api.git
cd reto-escuela-api

# 4. Instalar dependencias
npm install

# 5. Configurar .env
nano .env

# 6. Instalar PM2 globalmente
npm install -g pm2

# 7. Iniciar aplicación
pm2 start server.js --name reto-escuela-api
pm2 startup
pm2 save

# 8. Configurar Nginx como proxy
sudo yum install nginx
sudo systemctl start nginx

# Crear /etc/nginx/conf.d/reto-escuela.conf
upstream api {
  server localhost:3000;
}

server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location /api-docs {
    proxy_pass http://api/api-docs;
  }
}

# Reiniciar Nginx
sudo systemctl restart nginx

# 9. SSL con Let's Encrypt
sudo yum install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 6. MONITOREO Y LOGS

### 6.1 Con PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Monitoreo en tiempo real
pm2 monit

# Restart
pm2 restart reto-escuela-api

# Stop
pm2 stop reto-escuela-api

# Delete
pm2 delete reto-escuela-api
```

### 6.2 Logs en archivos

```bash
# Crear directorio
mkdir -p logs

# Ver logs
tail -f logs/app.log
tail -f logs/error.log
```

---

## 7. TROUBLESHOOTING

### Error: "ORACLE_HOME not found"

```bash
# Windows
set ORACLE_HOME=C:\oracle\instantclient_23_3

# Linux
export ORACLE_HOME=/opt/oracle/instantclient_23_3

# Verificar
echo $ORACLE_HOME
```

### Error: "ORA-12504: TNS:listener was not given the SERVICE_NAME"

```bash
# Verificar conexión a Oracle
sqlplus reto_sistema_escuela/Clases.2025.2025@localhost:1521/XEPDB1

# Verificar listener
lsnrctl status
```

### Error: "EADDRINUSE: address already in use :::3000"

```bash
# Buscar proceso en puerto 3000
lsof -i :3000  (Linux/Mac)
netstat -ano | findstr :3000  (Windows)

# Matar proceso
kill -9 <PID>  (Linux/Mac)
taskkill /PID <PID> /F  (Windows)

# O cambiar puerto en .env
PORT=3001
```

### Error: "Cannot find module 'oracledb'"

```bash
# Reinstalar node-gyp
npm install --global node-gyp

# Reinstalar oracledb
npm install oracledb --build-from-source
```

---

## 8. PERFORMANCE TIPS

### 8.1 Caché

```javascript
// Instalar redis
npm install redis

// En config
const redis = require('redis');
const client = redis.createClient();

// En controlador
const cached = await client.get(`estudiante:${id}`);
if (cached) return JSON.parse(cached);
```

### 8.2 Compresión

```javascript
const compression = require('compression');
app.use(compression());
```

### 8.3 Connection Pooling

```javascript
// Ya configurado en database.js
poolMin: 5,
poolMax: 20,
poolIncrement: 2
```

---

## 9. SEGURIDAD CHECKLIST

- [ ] JWT tokens habilitados
- [ ] CORS configurado correctamente
- [ ] Rate limiting activo
- [ ] Validación de entrada
- [ ] Sanitización de queries
- [ ] HTTPS en producción
- [ ] Secrets en variables de entorno
- [ ] Logs de seguridad
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 10. PRÓXIMOS PASOS

1. **Autenticación completa:** JWT login/logout
2. **Roles y permisos:** RBAC implementation
3. **Testing:** Jest + Supertest coverage
4. **CI/CD:** GitHub Actions pipeline
5. **Monitoreo:** Application Performance Monitoring (APM)
6. **Caché:** Redis integration
7. **WebSockets:** Real-time updates

---

**Status:** ✅ D6 Deployment Guide Completo

**Generado:** 12 de Noviembre de 2025  
**Versión:** 1.0.0

