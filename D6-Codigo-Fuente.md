# Código Fuente D6 - Listo para usar

Este archivo contiene el código compilado en un único lugar para fácil referencia y copy-paste.

---

## package.json

```json
{
  "name": "reto-escuela-api",
  "version": "1.0.0",
  "description": "API REST para sistema de gestión escolar",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "jsonwebtoken": "^9.0.0",
    "oracledb": "^6.0.0",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^4.6.3"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "nodemon": "^2.0.20",
    "supertest": "^6.3.3"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## .env

```
# Oracle Database
ORACLE_USER=reto_sistema_escuela
ORACLE_PASSWORD=Clases.2025.2025
ORACLE_CONNECT_STRING=localhost:1521/XEPDB1

# API
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=reto_escuela_super_secret_key_2025
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:4200
```

---

## server.js

```javascript
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ API Reto_Escuela corriendo en puerto ${PORT}`);
  console.log(`📖 Swagger: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando gracefully...');
  process.exit(0);
});
```

---

## src/app.js

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger/swagger');

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middleware de seguridad
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas solicitudes desde esta IP'
});

// Middleware de parseo
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', limiter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    url: '/api-docs-json'
  }
}));

app.get('/api-docs-json', (req, res) => {
  res.json(swaggerDocs);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Routes
app.use('/api/v1/estudiante', require('./routes/estudiante'));
app.use('/api/v1/oferta', require('./routes/oferta'));
app.use('/api/v1/docente', require('./routes/docente'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR',
    status: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
```

---

## src/config/database.js

```javascript
const oracledb = require('oracledb');

let pool;

async function initializePool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
      poolMin: 5,
      poolMax: 20,
      poolIncrement: 2,
      poolTimeout: 60,
      homogeneous: true
    });
    
    console.log('✅ Pool de conexiones Oracle creado');
  } catch (error) {
    console.error('❌ Error al crear pool:', error);
    throw error;
  }
}

async function getConnection() {
  if (!pool) {
    await initializePool();
  }
  
  try {
    return await pool.getConnection();
  } catch (error) {
    console.error('❌ Error al obtener conexión:', error);
    throw error;
  }
}

async function closePool() {
  if (pool) {
    try {
      await pool.close(0);
      console.log('✅ Pool de conexiones cerrado');
    } catch (error) {
      console.error('❌ Error al cerrar pool:', error);
    }
  }
}

module.exports = {
  initializePool,
  getConnection,
  closePool
};
```

---

## src/controllers/estudianteCtrl.js

```javascript
const oracledb = require('oracledb');
const { getConnection } = require('../config/database');

// GET - Listar todos
async function getAllEstudiantes(req, res, next) {
  const connection = await getConnection();
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT DATA FROM ESTUDIANTE_DV
      ORDER BY JSON_VALUE(DATA, '$._id')
      OFFSET :offset ROWS
      FETCH NEXT :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      offset,
      limit
    });
    
    const estudiantes = result.rows.map(row => JSON.parse(row[0]));
    
    res.json({
      success: true,
      data: estudiantes,
      pagination: {
        page,
        limit,
        total: estudiantes.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  } finally {
    await connection.close();
  }
}

// GET - Obtener uno
async function getEstudiante(req, res, next) {
  const connection = await getConnection();
  
  try {
    const { id } = req.params;
    
    const query = `
      SELECT DATA FROM ESTUDIANTE_DV
      WHERE JSON_VALUE(DATA, '$._id') = :id
    `;
    
    const result = await connection.execute(query, { id });
    
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        error: 'Estudiante no encontrado',
        id,
        timestamp: new Date().toISOString()
      });
    }
    
    const estudiante = JSON.parse(result.rows[0][0]);
    
    res.json({
      success: true,
      data: estudiante,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  } finally {
    await connection.close();
  }
}

// POST - Crear
async function createEstudiante(req, res, next) {
  const connection = await getConnection();
  
  try {
    const { ESTNOMBRE, ESTAPELLIDO, ESTEMAIL, ESTCLASE } = req.body;
    
    // Validar
    if (!ESTNOMBRE || !ESTAPELLIDO || !ESTEMAIL) {
      return res.status(400).json({
        error: 'Campos requeridos: ESTNOMBRE, ESTAPELLIDO, ESTEMAIL'
      });
    }
    
    // Email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ESTEMAIL)) {
      return res.status(400).json({
        error: 'Email inválido'
      });
    }
    
    const query = `
      INSERT INTO ESTUDIANTE (ESTNOMBRE, ESTAPELLIDO, ESTEMAIL, ESTCLASE, ESTPROMEDIO)
      VALUES (:nombre, :apellido, :email, :clase, 0)
      RETURNING ESTID INTO :id
    `;
    
    const binds = {
      nombre: ESTNOMBRE,
      apellido: ESTAPELLIDO,
      email: ESTEMAIL,
      clase: ESTCLASE || 'REGULAR',
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    
    const result = await connection.execute(query, binds, { autoCommit: true });
    
    res.status(201).json({
      success: true,
      message: 'Estudiante creado exitosamente',
      id: result.outBinds.id[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  } finally {
    await connection.close();
  }
}

// PATCH - Actualizar
async function updateEstudiante(req, res, next) {
  const connection = await getConnection();
  
  try {
    const { id } = req.params;
    const { ESTPROMEDIO, ESTCLASE, ESTEMAIL } = req.body;
    
    if (!ESTPROMEDIO && !ESTCLASE && !ESTEMAIL) {
      return res.status(400).json({
        error: 'Especifique al menos un campo para actualizar'
      });
    }
    
    let query = 'UPDATE ESTUDIANTE SET ';
    const updates = [];
    const binds = { id };
    
    if (ESTPROMEDIO !== undefined) {
      updates.push('ESTPROMEDIO = :promedio');
      binds.promedio = ESTPROMEDIO;
    }
    
    if (ESTCLASE) {
      updates.push('ESTCLASE = :clase');
      binds.clase = ESTCLASE;
    }
    
    if (ESTEMAIL) {
      updates.push('ESTEMAIL = :email');
      binds.email = ESTEMAIL;
    }
    
    query += updates.join(', ') + ' WHERE ESTID = :id';
    
    const result = await connection.execute(query, binds, { autoCommit: true });
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Estudiante actualizado',
      rowsAffected: result.rowsAffected,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  } finally {
    await connection.close();
  }
}

// DELETE - Eliminar
async function deleteEstudiante(req, res, next) {
  const connection = await getConnection();
  
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM ESTUDIANTE WHERE ESTID = :id';
    const result = await connection.execute(query, { id }, { autoCommit: true });
    
    if (result.rowsAffected === 0) {
      return res.status(404).json({
        error: 'Estudiante no encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Estudiante eliminado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  } finally {
    await connection.close();
  }
}

module.exports = {
  getAllEstudiantes,
  getEstudiante,
  createEstudiante,
  updateEstudiante,
  deleteEstudiante
};
```

---

## src/routes/estudiante.js

```javascript
const express = require('express');
const router = express.Router();
const estudianteCtrl = require('../controllers/estudianteCtrl');

/**
 * @swagger
 * /estudiante:
 *   get:
 *     tags:
 *       - Estudiante
 *     summary: Listar todos los estudiantes
 *     parameters:
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Lista de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 */
router.get('/', estudianteCtrl.getAllEstudiantes);

/**
 * @swagger
 * /estudiante/{id}:
 *   get:
 *     tags:
 *       - Estudiante
 *     summary: Obtener estudiante por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Datos del estudiante
 *       '404':
 *         description: Estudiante no encontrado
 */
router.get('/:id', estudianteCtrl.getEstudiante);

/**
 * @swagger
 * /estudiante:
 *   post:
 *     tags:
 *       - Estudiante
 *     summary: Crear nuevo estudiante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ESTNOMBRE
 *               - ESTAPELLIDO
 *               - ESTEMAIL
 *             properties:
 *               ESTNOMBRE:
 *                 type: string
 *               ESTAPELLIDO:
 *                 type: string
 *               ESTEMAIL:
 *                 type: string
 *               ESTCLASE:
 *                 type: string
 *                 enum: [REGULAR, EGRESADO]
 */
router.post('/', estudianteCtrl.createEstudiante);

/**
 * @swagger
 * /estudiante/{id}:
 *   patch:
 *     tags:
 *       - Estudiante
 *     summary: Actualizar estudiante
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ESTPROMEDIO:
 *                 type: number
 *               ESTCLASE:
 *                 type: string
 *               ESTEMAIL:
 *                 type: string
 */
router.patch('/:id', estudianteCtrl.updateEstudiante);

/**
 * @swagger
 * /estudiante/{id}:
 *   delete:
 *     tags:
 *       - Estudiante
 *     summary: Eliminar estudiante
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', estudianteCtrl.deleteEstudiante);

module.exports = router;
```

---

## src/swagger/swagger.js

```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reto_Escuela API',
      version: '1.0.0',
      description: 'API REST para sistema de gestión escolar usando Oracle 23c JSON Duality Views',
      contact: {
        name: 'GitHub Copilot',
        email: 'support@reto-escuela.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.reto-escuela.com/v1',
        description: 'Servidor de producción'
      }
    ],
    components: {
      schemas: {
        Estudiante: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: 'E001' },
            ESTNOMBRE: { type: 'string', example: 'Juan' },
            ESTAPELLIDO: { type: 'string', example: 'García' },
            ESTEMAIL: { type: 'string', example: 'juan@uni.edu' },
            ESTCLASE: { 
              type: 'string', 
              enum: ['REGULAR', 'EGRESADO'],
              example: 'REGULAR'
            },
            ESTPROMEDIO: { 
              type: 'number', 
              format: 'float',
              example: 8.5
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
```

---

**Estado:** ✅ Código listo para usar

