var mssql = require('mssql');

// Параметры соединения с бд
var config = {
    user: 'lera',
    password: '1234',
    server: 'ASUS_PC\\SQLEXPRESS',
    database: 'AuthorizationDB',
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

var connection = new mssql.ConnectionPool(config);
var pool = connection.connect(err => {
    if (err) console.error('Database connection failed:', err);
});

module.exports = pool;
