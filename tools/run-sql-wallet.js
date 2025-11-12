/*
 tools/run-sql-wallet.js

 Ejecuta los scripts SQL dentro de `sql/triggers/` usando conexión Oracle que soporte Wallet (TNS_ADMIN).

 Uso:
   - Copiar `.env.example` a `.env` y completar las variables (ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING, TNS_ADMIN)
   - Instalar dependencias en la carpeta `tools`:
       npm init -y
       npm install oracledb dotenv fs-extra
   - Ejecutar:
       node run-sql-wallet.js

 Nota:
 - Debes tener Oracle Instant Client instalado y/o disponible; si usas Oracle Cloud Wallet, descomprime el wallet y apunta TNS_ADMIN a esa carpeta.
 - Este script no ejecuta si no hay conexión; sólo intenta y muestra errores.
*/

require('dotenv').config();
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');

(async function main() {
    try {
        const {
            ORACLE_USER,
            ORACLE_PASSWORD,
            ORACLE_CONNECT_STRING,
            TNS_ADMIN,
            ORACLE_CLIENT_LIB_DIR
        } = process.env;

        if (!ORACLE_USER || !ORACLE_CONNECT_STRING) {
            console.error('Por favor configura ORACLE_USER y ORACLE_CONNECT_STRING en .env');
            process.exit(1);
        }

        // Si el usuario indicó libDir para Instant Client, inicializamos
        if (ORACLE_CLIENT_LIB_DIR) {
            try {
                oracledb.initOracleClient({ libDir: ORACLE_CLIENT_LIB_DIR });
                console.log('initOracleClient con libDir:', ORACLE_CLIENT_LIB_DIR);
            } catch (err) {
                console.warn('initOracleClient falló (sólo necesario si no está instalado el cliente):', err.message);
            }
        }

        // Si se especificó TNS_ADMIN (ruta al wallet), ponla en env
        if (TNS_ADMIN) {
            process.env.TNS_ADMIN = TNS_ADMIN;
            console.log('TNS_ADMIN configurado a:', TNS_ADMIN);
        }

        // Conectar con oracledb
        const conn = await oracledb.getConnection({
            user: ORACLE_USER,
            password: ORACLE_PASSWORD,
            connectString: ORACLE_CONNECT_STRING
        });
        console.log('Conectado a Oracle:', ORACLE_CONNECT_STRING);

        const scriptsDir = path.resolve(__dirname, '..', 'sql', 'triggers');
        const files = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.sql')).sort();

        for (const file of files) {
            const filePath = path.join(scriptsDir, file);
            console.log('\n--- Ejecutando:', filePath);
            let sql = fs.readFileSync(filePath, 'utf8');

            // Oracle SQL scripts suelen terminar con \n/ en una línea propia. Quitamos líneas que sólo contienen '/'.
            sql = sql.split('\n').filter(line => line.trim() !== '/').join('\n');

            // Ejecutar el script (puede contener varios statements PL/SQL). Usar execute() tal cual.
            try {
                const result = await conn.execute(sql, [], { autoCommit: true });
                console.log('OK:', file, ' - result:', (result && result.rowsAffected !== undefined) ? ('rowsAffected=' + result.rowsAffected) : 'executed');
            } catch (err) {
                console.error('ERROR al ejecutar', file, ':', err.message);
                // No abortamos; seguimos con siguientes scripts
            }
        }

        await conn.close();
        console.log('\nTodos los scripts procesados.');
    } catch (err) {
        console.error('Error en runner:', err.message);
        process.exit(2);
    }
})();
