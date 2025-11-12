# Tools: ejecutar SQL usando Oracle Wallet (TNS_ADMIN)

Este directorio contiene un runner Node.js para ejecutar scripts SQL contra una base Oracle remota cuando se usa Oracle Wallet (TNS_ADMIN).

Requisitos previos
- Node.js 18+
- Oracle Instant Client instalado (o proporcionar `ORACLE_CLIENT_LIB_DIR` en `.env`)
- Un Wallet de Oracle (si usas Oracle Cloud/ATP) descomprimido en una carpeta local
- Variables de entorno configuradas en `.env` (ver abajo)

Variables `.env` (ejemplo)
```
# Usuario/Password del esquema
ORACLE_USER=reto_sistema_escuela
ORACLE_PASSWORD=Clases.2025.2025

# Connect string: puede ser TNS alias definido en tnsnames.ora dentro de wallet
ORACLE_CONNECT_STRING=your_tns_alias

# Ruta donde descomprimiste el wallet (contiene tnsnames.ora, sqlnet.ora)
TNS_ADMIN=C:\path\to\wallet_folder

# Opcional: si necesitas indicar la carpeta del Instant Client
ORACLE_CLIENT_LIB_DIR=C:\oracle\instantclient_21_6
```

Instalación y ejecución

```powershell
# Ir a tools
cd C:\tmp\reto-escuela-proyecto\tools

# Crear package.json e instalar dependencias
npm init -y
npm install oracledb dotenv fs-extra

# Copiar .env.example desde la raíz y editar
copy ..\.env.example .env
notepad .env

# Ejecutar
node run-sql-wallet.js
```

Notas importantes
- `TNS_ADMIN` debe apuntar a la carpeta donde está `tnsnames.ora` (y el wallet para ATP). El runner establecerá `process.env.TNS_ADMIN` automáticamente.
- Si tu `ORACLE_CONNECT_STRING` es un alias definido en `tnsnames.ora`, úsalo tal cual; si prefieres EZConnect, pon `host:port/service`.
- El script lee todos los archivos `*.sql` en `sql/triggers/` y los ejecuta en orden alfabético.
- Los scripts deben remover la línea con `/` (el runner lo hace automáticamente) porque esa línea es un separador de SQL*Plus no válido para `oracledb.execute()`.
- Si ves errores de cliente (por ejemplo falta de Instant Client), instala Instant Client y/o configura `ORACLE_CLIENT_LIB_DIR`.

Seguridad
- No subir credenciales reales en GitHub. Usa `.env.example` en el repo (ya creado en la raíz).
- Ejecuta el runner en una máquina segura (VPN/servidor de administración) que tenga acceso al endpoint Oracle.

Soporte
- Si quieres, puedo intentar ejecutar el runner si me das acceso seguro y temporal (no recomendado). Lo más seguro es que lo ejecutes localmente siguiendo estos pasos; si fallas, pega el error y te ayudo a solucionarlo.
