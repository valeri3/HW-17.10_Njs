const mssql = require('mssql');
const pool = require('./db');

module.exports = {
    // Регистрация пользователя с транзакцией
    registerUser: async function (name, login, password) {
        const transaction = new mssql.Transaction(pool);
        try {
            await transaction.begin(); // Начало транзакции
            const request = new mssql.Request(transaction);
            await request.input('Name', mssql.NVarChar(50), name)
                .input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('INSERT INTO Users (Name, Login, Password) VALUES (@Name, @Login, @Password)');
            await transaction.commit(); // Подтверждение транзакции
        } catch (error) {
            await transaction.rollback(); // Откат транзакции в случае ошибки
            throw error;
        }
    },

    loginUser: async function (login, password) {
        try {
            const poolConnection = await pool;
            const request = poolConnection.request();
            const result = await request.input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('SELECT * FROM Users WHERE Login = @Login AND Password = @Password');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    loginAdmin: async function (login, password) {
        try {
            const poolConnection = await pool;
            const request = poolConnection.request();
            const result = await request.input('Login', mssql.NVarChar(50), login)
                .input('Password', mssql.NVarChar(255), password)
                .query('SELECT * FROM Admins WHERE Login = @Login AND Password = @Password');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    getAllUsers: async function () {
        try {
            const poolConnection = await pool;
            const result = await poolConnection.request().query('SELECT * FROM Users');
            return result.recordset;
        } catch (error) {
            throw error;
        }
    },

    getUserById: async function (id) {
        try {
            const poolConnection = await pool;
            const request = poolConnection.request();
            const result = await request.input('Id', mssql.Int, id)
                .query('SELECT * FROM Users WHERE Id = @Id');
            return result.recordset[0];
        } catch (error) {
            throw error;
        }
    },

    updateUser: async function (id, name, login) {
        const transaction = new mssql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new mssql.Request(transaction);
            await request.input('Id', mssql.Int, id)
                .input('Name', mssql.NVarChar(50), name)
                .input('Login', mssql.NVarChar(50), login)
                .query('UPDATE Users SET Name = @Name, Login = @Login WHERE Id = @Id');
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    deleteUser: async function (id) {
        const transaction = new mssql.Transaction(pool);
        try {
            await transaction.begin();
            const request = new mssql.Request(transaction);
            await request.input('Id', mssql.Int, id)
                .query('DELETE FROM Users WHERE Id = @Id');
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

};

