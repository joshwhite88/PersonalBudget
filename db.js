const Pool = require('pg').Pool;
require('dotenv').config();

// module.exports.getPool = () => {
//     const pool = new Pool({
//         user: process.env.PG_USER,
//         host: process.env.PG_HOST,
//         database: process.env.PG_DATABASE,
//         password: process.env.PG_PASSWORD,
//         port: process.env.PG_PORT,
//     });
//     return pool;
// };

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

const getEnvelopes = (req, res) => {
    pool.query('SELECT * FROM envelopes ORDER BY envelopeId', (error, results) => {
        // if (error) {
        //     throw error;
        // }
        // res.status(200).json(results.rows);
        return results.rows;
    });
};

module.exports = { getEnvelopes };