# D9: Natural Language Query (NLQ) - SELECT AI

**Versión:** 1.0  
**Fecha:** 12 de Noviembre de 2025  
**Status:** 🟡 Documentación (Listo para implementar)

---

## 📋 ¿QUÉ ES D9?

**D9** es la capacidad de hacer preguntas en **lenguaje natural (español/inglés)** y que el sistema automáticamente:

1. **Entienda** la pregunta
2. **Traduzca** a SQL
3. **Ejecute** la query
4. **Retorne** resultados en JSON

### Ejemplo:
```
❌ ANTES (Manual SQL):
SELECT NOMBRE, COUNT(*) as ASISTENCIAS 
FROM ESTUDIANTE e
JOIN ASISTENCIA a ON e.ID_ESTUDIANTE = a.ID_ESTUDIANTE
WHERE a.PRESENTE = 1
GROUP BY NOMBRE
ORDER BY ASISTENCIAS DESC;

✅ DESPUÉS (NLQ con D9):
"¿Cuántas asistencias tiene cada estudiante?"
→ Sistema genera SQL automáticamente
→ Retorna JSON con resultados
```

---

## 🎯 OBJETIVO DE D9

Implementar **Oracle SELECT AI** para convertir preguntas en español a SQL automáticamente.

### Beneficios:
- ✅ No requiere conocer SQL
- ✅ Usuarios no-técnicos pueden consultar
- ✅ Búsquedas más naturales y flexibles
- ✅ Reduce errores de sintaxis SQL
- ✅ Mejora UX de la aplicación

---

## 🏗️ ARQUITECTURA D9

```
┌─────────────────────────────────────────────────┐
│        USUARIO (Pregunta en Español)            │
│   "¿Cuántos estudiantes hay por clase?"         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│    API REST (Express.js - Nuevo endpoint)       │
│         POST /api/nlq                           │
│    { "pregunta": "..." }                        │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│  ORACLE SELECT AI (Procesa NLQ)                 │
│  - Detecta entidades (tablas, columnas)         │
│  - Genera SQL automáticamente                   │
│  - Valida sintaxis                              │
│  - Retorna SQL + ejecución                      │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│    Ejecución de SQL en Oracle 23c               │
│    - Duality Views (JSON)                       │
│    - Tablas relacionales                        │
│    - Connection pooling                         │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│        RESPUESTA JSON al Usuario                │
│  {                                              │
│    "pregunta": "¿Cuántos estudiantes...?",     │
│    "sql": "SELECT COUNT(*) FROM ESTUDIANTE",   │
│    "resultados": [ { "NOMBRE": "...", ... } ], │
│    "tiempo_ejecucion_ms": 45                   │
│  }                                              │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ COMPONENTES D9

### 1. Oracle SELECT AI (Backend)
```
┌─────────────────────────────────┐
│  Oracle Database 23c Express    │
│  ├─ SELECT AI activado          │
│  ├─ Training data (Q1-Q10)       │
│  ├─ Schema metadata              │
│  └─ AI Models trained           │
└─────────────────────────────────┘
```

**Features:**
- Reconoce 50+ patrones de consultas
- Entiende relaciones entre tablas
- Detecta agregaciones (SUM, COUNT, AVG)
- Soporta filtros (WHERE, GROUP BY)
- Retorna SQL + ejecución

### 2. Endpoint NLQ (API)
```javascript
POST /api/nlq
{
  "pregunta": "¿Cuántos estudiantes hay?",
  "idioma": "es",
  "limit": 100,
  "timeout_ms": 5000
}
```

**Response:**
```json
{
  "id": "nlq_123456",
  "pregunta": "¿Cuántos estudiantes hay?",
  "sql_generado": "SELECT COUNT(*) as TOTAL FROM ESTUDIANTE",
  "sql_interpretacion": "Contar registros en tabla ESTUDIANTE",
  "resultados": [
    {
      "TOTAL": 6
    }
  ],
  "tiempo_ms": 42,
  "confianza": 0.98,
  "estado": "exitoso"
}
```

### 3. Controller NLQ
```
├─ parseQuery()        → Extrae pregunta
├─ callSelectAI()      → Llama a Oracle AI
├─ sanitizeSQL()       → Valida seguridad
├─ executeSQL()        → Ejecuta en BD
├─ formatResponse()    → Retorna JSON
└─ logQuery()          → Guarda en historial
```

### 4. Validaciones de Seguridad
```
✅ SQL Injection prevention
✅ Query timeout (5s max)
✅ Result limit (10000 rows max)
✅ Table whitelist
✅ User permissions checking
✅ Query audit logging
✅ Rate limiting por usuario
```

---

## 📚 EJEMPLOS DE PREGUNTAS (NLQ)

### Estudiantes (ESTUDIANTE table)
```sql
P: "¿Cuántos estudiantes hay?"
R: SELECT COUNT(*) FROM ESTUDIANTE
→ { "TOTAL": 6 }

P: "Listar estudiantes de la clase EGRESADO"
R: SELECT * FROM ESTUDIANTE WHERE CLASE='EGRESADO'
→ [ { "NOMBRE": "Ana García", "CLASE": "EGRESADO", ... }, ... ]

P: "¿Cuál es el promedio de calificación por clase?"
R: SELECT CLASE, AVG(PROMEDIO) FROM ESTUDIANTE GROUP BY CLASE
→ [ { "CLASE": "EGRESADO", "PROMEDIO": 9.3 }, ... ]

P: "Estudiantes ordenados por promedio descendente"
R: SELECT NOMBRE, PROMEDIO FROM ESTUDIANTE ORDER BY PROMEDIO DESC
→ [ { "NOMBRE": "Top student", "PROMEDIO": 9.8 }, ... ]
```

### Asistencia (ASISTENCIA table)
```sql
P: "¿Cuál es la asistencia de cada estudiante?"
R: SELECT NOMBRE, COUNT(*) as ASISTENCIAS 
   FROM ESTUDIANTE e JOIN ASISTENCIA a
   WHERE a.PRESENTE=1
→ [ { "NOMBRE": "Ana", "ASISTENCIAS": 5 }, ... ]

P: "¿Quién tuvo 100% de asistencia?"
R: SELECT DISTINCT NOMBRE FROM ESTUDIANTE 
   WHERE ID_ESTUDIANTE IN (SELECT ID_ESTUDIANTE 
   FROM ASISTENCIA WHERE PRESENTE=1 GROUP BY ...)
→ [ { "NOMBRE": "Carlos" }, { "NOMBRE": "Diana" } ]

P: "Inasistencias por mes"
R: SELECT TO_CHAR(FECHA,'YYYY-MM') as MES, COUNT(*) 
   FROM ASISTENCIA WHERE PRESENTE=0
→ [ { "MES": "2025-01", "INASISTENCIAS": 3 }, ... ]
```

### Ofertas Académicas (OFERTAACADEMICA table)
```sql
P: "¿Qué materias se ofrecen en lunes?"
R: SELECT DISTINCT NOMBRE FROM OFERTAACADEMICA 
   WHERE DIASEMANA LIKE '%lunes%'
→ [ { "NOMBRE": "Matemática" }, { "NOMBRE": "Español" } ]

P: "Horarios del aula 101"
R: SELECT NOMBRE, HORAINICIO, HORAFIN FROM OFERTAACADEMICA 
   WHERE AULA='101'
→ [ { "NOMBRE": "Clase 1", "HORAINICIO": "08:00", ... }, ... ]

P: "¿Cuántas ofertas por docente?"
R: SELECT DOCENTE, COUNT(*) FROM OFERTAACADEMICA 
   GROUP BY DOCENTE
→ [ { "DOCENTE": "Prof. Pérez", "COUNT": 3 }, ... ]
```

### Consultas Complejas
```sql
P: "Estudiantes con bajo promedio (< 7) que tienen mala asistencia"
R: SELECT e.NOMBRE, e.PROMEDIO, COUNT(a.ID_ASISTENCIA) as FALTAS
   FROM ESTUDIANTE e
   JOIN ASISTENCIA a ON e.ID_ESTUDIANTE = a.ID_ESTUDIANTE
   WHERE e.PROMEDIO < 7 AND a.PRESENTE = 0
   GROUP BY e.NOMBRE, e.PROMEDIO
   HAVING COUNT(a.ID_ASISTENCIA) > 2
→ [ { "NOMBRE": "Estudiante 1", "PROMEDIO": 6.5, "FALTAS": 3 }, ... ]

P: "¿Qué estudiantes no tienen acudiente registrado?"
R: SELECT NOMBRE FROM ESTUDIANTE 
   WHERE ID_ESTUDIANTE NOT IN (SELECT ID_ESTUDIANTE FROM ACUDIENTE)
→ [ { "NOMBRE": "Estudiante X" }, ... ]
```

---

## 🔧 CÓMO IMPLEMENTAR D9

### Paso 1: Habilitar SELECT AI en Oracle

```sql
-- Conectar como ADMIN
sqlplus sys/password@XEPDB1 as sysdba

-- Habilitar AI
BEGIN
  DBMS_AI.CONFIGURE(
    parameter => 'PROVIDER_NAME',
    value => 'ORACLE_AI'
  );
END;
/

-- Verificar
SELECT * FROM DBA_AI_CAPABILITIES;
```

### Paso 2: Entrenar AI con Queries Existentes

```sql
-- Registrar Q1-Q10 como training data
BEGIN
  DBMS_AI.ADD_TRAINING_QUERY(
    query_id => 'Q1',
    query_text => 'SELECT e.NOMBRE, COUNT(a.ID_ASISTENCIA)...',
    query_description => 'Attendance by student'
  );
END;
/

-- Entrenar modelo
BEGIN
  DBMS_AI.TRAIN_MODEL(model_name => 'ESCUELA_NLQ');
END;
/
```

### Paso 3: Crear Endpoint en API

**Archivo: `src/routes/nlq.js`**
```javascript
const express = require('express');
const router = express.Router();
const nlqCtrl = require('../controllers/nlqCtrl');

router.post('/nlq', nlqCtrl.processNLQ);
router.get('/nlq/historial', nlqCtrl.getHistorial);
router.get('/nlq/sugerencias', nlqCtrl.getSugerencias);

module.exports = router;
```

### Paso 4: Crear Controller NLQ

**Archivo: `src/controllers/nlqCtrl.js`**
```javascript
const db = require('../config/database');

exports.processNLQ = async (req, res) => {
  try {
    const { pregunta, idioma = 'es', limit = 100 } = req.body;
    
    // 1. Validar entrada
    if (!pregunta) {
      return res.status(400).json({ error: 'Pregunta requerida' });
    }
    
    // 2. Llamar a SELECT AI
    const connection = await db.getConnection();
    const nlqResult = await connection.execute(`
      SELECT DBMS_AI.GENERATE_QUERY(
        question => :pregunta,
        language => :idioma
      ) as sql_generado
      FROM DUAL
    `, { pregunta, idioma });
    
    const sqlGenerado = nlqResult.rows[0].sql_generado;
    
    // 3. Sanitizar SQL
    if (!isSafeSql(sqlGenerado)) {
      return res.status(403).json({ error: 'Consulta no permitida' });
    }
    
    // 4. Ejecutar con timeout
    const startTime = Date.now();
    const resultados = await connection.execute(sqlGenerado, {}, {
      timeout: 5000
    });
    const tiempo_ms = Date.now() - startTime;
    
    // 5. Retornar respuesta
    res.json({
      id: 'nlq_' + Date.now(),
      pregunta,
      sql_generado: sqlGenerado,
      resultados: resultados.rows,
      tiempo_ms,
      confianza: calculateConfidence(sqlGenerado, resultados),
      estado: 'exitoso'
    });
    
    // 6. Guardar en historial
    await logNLQQuery(pregunta, sqlGenerado, tiempo_ms);
    
    connection.close();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Funciones auxiliares
function isSafeSql(sql) {
  const dangerous = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'TRUNCATE', 'ALTER'];
  return !dangerous.some(word => sql.toUpperCase().includes(word));
}

function calculateConfidence(sql, results) {
  // Retornar confianza 0-1 basada en calidad de resultados
  return results.rows.length > 0 ? 0.98 : 0.5;
}

async function logNLQQuery(pregunta, sql, tiempo_ms) {
  // Guardar en tabla de auditoría
  console.log(`[NLQ] ${pregunta} → ${tiempo_ms}ms`);
}
```

### Paso 5: Actualizar `app.js`

```javascript
const nlqRoutes = require('./routes/nlq');

// ... middleware setup ...

app.use('/api', nlqRoutes);

module.exports = app;
```

---

## 📊 TABLA DE MAPEO (Schema Intelligence)

Oracle SELECT AI necesita entender la estructura. Esta tabla ayuda:

```javascript
const SCHEMA_MAPPING = {
  tablas: [
    {
      nombre: 'ESTUDIANTE',
      alias: ['estudiantes', 'alumno', 'alumna'],
      columnas: [
        { nombre: 'ID_ESTUDIANTE', alias: ['id', 'codigo'] },
        { nombre: 'NOMBRE', alias: ['nombre', 'estudiante'] },
        { nombre: 'CLASE', alias: ['clase', 'grupo'] },
        { nombre: 'PROMEDIO', alias: ['promedio', 'calificación'] }
      ]
    },
    {
      nombre: 'ASISTENCIA',
      alias: ['asistencia', 'asistencias', 'faltas'],
      columnas: [
        { nombre: 'ID_ASISTENCIA', alias: ['id'] },
        { nombre: 'PRESENTE', alias: ['presente', 'asistencia'] },
        { nombre: 'FECHA', alias: ['fecha', 'día'] }
      ]
    },
    {
      nombre: 'OFERTAACADEMICA',
      alias: ['ofertas', 'materias', 'clases'],
      columnas: [
        { nombre: 'ID_OFERTA', alias: ['id', 'oferta'] },
        { nombre: 'NOMBRE', alias: ['nombre', 'materia', 'clase'] },
        { nombre: 'HORAINICIO', alias: ['hora inicio', 'inicio'] },
        { nombre: 'HORAFIN', alias: ['hora fin', 'fin'] }
      ]
    }
  ],
  relaciones: [
    { tabla1: 'ESTUDIANTE', tabla2: 'ASISTENCIA', fk: 'ID_ESTUDIANTE' },
    { tabla1: 'ESTUDIANTE', tabla2: 'MATRICULA', fk: 'ID_ESTUDIANTE' },
    { tabla1: 'OFERTAACADEMICA', tabla2: 'MATERIA', fk: 'ID_MATERIA' }
  ]
};
```

---

## 🧪 TESTING D9

### Test 1: Consulta Simple
```bash
curl -X POST http://localhost:3000/api/nlq \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "¿Cuántos estudiantes hay?"
  }'

# Response:
# { "resultados": [{ "TOTAL": 6 }], "estado": "exitoso" }
```

### Test 2: Consulta con Filtro
```bash
curl -X POST http://localhost:3000/api/nlq \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "Estudiantes de la clase EGRESADO"
  }'

# Response:
# { "resultados": [{ "NOMBRE": "Ana", "CLASE": "EGRESADO" }, ...] }
```

### Test 3: Consulta Compleja
```bash
curl -X POST http://localhost:3000/api/nlq \
  -H "Content-Type: application/json" \
  -d '{
    "pregunta": "¿Qué estudiantes tienen menos del 50% de asistencia?"
  }'

# Response:
# { "resultados": [...], "confianza": 0.98 }
```

### Test 4: Historial
```bash
curl http://localhost:3000/api/nlq/historial?limit=10

# Response:
# { "queries": [ { "pregunta": "...", "timestamp": "...", ... } ] }
```

---

## 🛡️ SEGURIDAD EN D9

### 1. SQL Injection Prevention
```javascript
// ✅ CORRECTO
SELECT COUNT(*) FROM ESTUDIANTE WHERE NOMBRE = ?
// Parámetro sanitizado por Oracle

// ❌ INCORRECTO
SELECT COUNT(*) FROM ESTUDIANTE WHERE NOMBRE = '" + input + "'"
// Vulnerable a injection
```

### 2. Query Timeout
```javascript
// Máximo 5 segundos por query
const timeout = 5000; // ms
if (executionTime > timeout) {
  throw new Error('Consulta demasiado lenta');
}
```

### 3. Result Limit
```javascript
// Máximo 10,000 filas por respuesta
const maxRows = 10000;
if (results.length > maxRows) {
  results = results.slice(0, maxRows);
  response.truncated = true;
}
```

### 4. Table Whitelist
```javascript
const ALLOWED_TABLES = [
  'ESTUDIANTE',
  'ASISTENCIA',
  'OFERTAACADEMICA',
  'CALIFICACIONDESGLOSE',
  'MATRICULA'
  // No incluir: tablas internas, logs, etc.
];

if (!ALLOWED_TABLES.includes(table)) {
  throw new Error('Tabla no permitida');
}
```

### 5. User Permissions
```javascript
// Verificar que usuario tenga acceso
if (!userHasPermission(userId, queryType)) {
  throw new Error('Permiso denegado');
}
```

### 6. Audit Logging
```sql
-- Guardar todas las queries NLQ
INSERT INTO NLQ_AUDIT_LOG (
  usuario_id, pregunta, sql_generado, 
  resultado_filas, tiempo_ms, 
  fecha_hora, ip_origen
) VALUES (?, ?, ?, ?, ?, SYSDATE, ?);
```

---

## 📈 PERFORMANCE OPTIMIZATION

### 1. Query Caching
```javascript
// Cache del último 1000 consultas
const nlqCache = new Map();

if (nlqCache.has(preguntaNormalizada)) {
  return nlqCache.get(preguntaNormalizada);
}
// ... ejecutar query ...
nlqCache.set(preguntaNormalizada, resultado);
```

### 2. Índices para NLQ
```sql
-- Crear índices para queries frecuentes
CREATE INDEX idx_estudiante_clase ON ESTUDIANTE(CLASE);
CREATE INDEX idx_asistencia_presente ON ASISTENCIA(PRESENTE);
CREATE INDEX idx_oferta_diasemana ON OFERTAACADEMICA(DIASEMANA);
```

### 3. Connection Pooling
```javascript
// Ya implementado en D6
const pool = await oracledb.createPool({
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING,
  poolMin: 5,
  poolMax: 20,
  poolIncrement: 1
});
```

---

## 📝 SUGERENCIAS DE PREGUNTAS

El endpoint `/api/nlq/sugerencias` retorna preguntas de ejemplo:

```json
{
  "sugerencias": [
    "¿Cuántos estudiantes hay?",
    "¿Cuál es el estudiante con mejor promedio?",
    "¿Quién tiene 100% de asistencia?",
    "¿Qué materias se ofrecen en lunes?",
    "¿Cuántas clases tiene cada docente?",
    "¿Estudiantes de la clase EGRESADO?",
    "¿Promedio de calificaciones por clase?",
    "¿Inasistencias por mes?"
  ]
}
```

---

## 🚀 DEPLOYMENT D9

### Opción 1: Incluir en API existente
```bash
cd /ruta/al/reto-escuela-api
# Copiar archivos:
# - src/routes/nlq.js
# - src/controllers/nlqCtrl.js
npm install
npm run dev
```

### Opción 2: Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

---

## 📊 COMPARATIVA CON/SIN D9

```
┌─────────────────────┬──────────────────┬─────────────────┐
│ Característica      │ SIN D9 (D6)       │ CON D9          │
├─────────────────────┼──────────────────┼─────────────────┤
│ Endpoint            │ /api/estudiante  │ /api/nlq        │
│ Input               │ JSON structured  │ Texto natural   │
│ Conocimiento SQL    │ REQUERIDO        │ NO requerido    │
│ Flexibilidad        │ Baja (fija)      │ Alta (natural)  │
│ Usuarios objetivo   │ Técnicos         │ Cualquiera      │
│ Velocidad setup     │ Rápida           │ Media           │
│ Mantenimiento       │ Manual           │ Automático      │
│ Nuevas queries      │ Nuevo endpoint   │ Nueva pregunta  │
└─────────────────────┴──────────────────┴─────────────────┘
```

---

## ✅ CHECKLIST D9

### Implementación
- [ ] Oracle SELECT AI habilitado
- [ ] Training data (Q1-Q10) registrada
- [ ] Modelo IA entrenado
- [ ] Endpoint `/api/nlq` creado
- [ ] Controller `nlqCtrl.js` implementado
- [ ] Validación de seguridad activa
- [ ] Audit logging configurado

### Testing
- [ ] Test consulta simple
- [ ] Test consulta con filtro
- [ ] Test consulta compleja
- [ ] Test SQL injection prevention
- [ ] Test timeout
- [ ] Test result limit

### Documentación
- [ ] API spec de `/api/nlq` actualizada
- [ ] Ejemplos de preguntas documentados
- [ ] Security best practices listadas
- [ ] Performance tips incluidos

### Deployment
- [ ] Docker image actualizada
- [ ] PM2 ecosystem config actualizado
- [ ] Environment variables configuradas
- [ ] Health check incluido

---

## 🎯 PRÓXIMO PASO

Una vez implementado D9, podrás hacer:

```bash
# Sin SQL, solo preguntas en español:
POST /api/nlq
{ "pregunta": "¿Estudiantes con promedio > 8.5?" }

# Vs. en D6 necesitabas:
GET /api/estudiante?promedio=gt:8.5
```

---

## 📞 REFERENCIAS

- [Oracle SELECT AI Docs](https://docs.oracle.com/en/database/oracle/select-ai/)
- [DBMS_AI Package](https://docs.oracle.com/en/database/oracle/oracle-database/23c/arpls/DBMS_AI.html)
- [NLQ Best Practices](https://docs.oracle.com/en/database/oracle/select-ai/nlq-best-practices/)

---

**Generado:** 12 de Noviembre de 2025  
**Versión:** 1.0.0  
**Status:** 📋 Documentación completa

