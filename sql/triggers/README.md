# SQL Triggers

Esta carpeta contiene scripts SQL para crear una tabla de auditoría y triggers asociados.

Archivos:
- `001_create_audit_table.sql` — Crea la tabla `AUDIT_LOG` (con protección PL/SQL comentada)
- `002_trigger_timestamps_estudiante.sql` — Trigger `trg_audit_timestamps_estudiante` (before insert/update)
- `003_trigger_audit_estudiante.sql` — Trigger `trg_audit_estudiante` (after insert/update/delete)

Instrucciones rápidas para aplicar (sqlplus):

```sql
-- Conectar
sqlplus reto_sistema_escuela/Clases.2025.2025@localhost:1521/XEPDB1

-- Aplicar tabla de auditoría
@sql/triggers/001_create_audit_table.sql

-- Aplicar trigger timestamps
@sql/triggers/002_trigger_timestamps_estudiante.sql

-- Aplicar trigger auditoría
@sql/triggers/003_trigger_audit_estudiante.sql
```

Notas:
- Asegúrate de que la tabla `ESTUDIANTE` tiene las columnas `created_at TIMESTAMP` y `updated_at TIMESTAMP` antes de ejecutar el trigger 002.
- Si ejecutas en producción, revisa primero en entorno de staging.
- Estos scripts son idempotentes (usar OR REPLACE en triggers). Para la tabla, el bloque PL/SQL comentado evita errores si ya existe.
