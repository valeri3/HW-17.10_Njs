const path = require('path');
const ejs = require('ejs');
const queries = require('./queries');

module.exports = {
    // Главная страница
    loadIndexPage: function (req, res, next) {
        const filePath = path.join(__dirname, '..', 'pages', 'index.ejs');
        ejs.renderFile(filePath, {}, (err, str) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading page');
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(str);
            return next();
        });
    },

    // Страница регистрации
    loadRegisterPage: function (req, res, next) {
        const filePath = path.join(__dirname, '..', 'pages', 'register.ejs');
        ejs.renderFile(filePath, {}, (err, str) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading page');
                return next(err);
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(str);
            return next();
        });
    },

    // Регистрация нового пользователя
    registerUser: async function (req, res) {
        const {name, login, password} = req.body;

        try {
            await queries.registerUser(name, login, password);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end('<p>User registered successfully! Redirecting to index page...</p><script>setTimeout(() => { window.location.href = "/" }, 3000);</script>');
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.end('<p>Error registering user! Redirecting to register page...</p><script>setTimeout(() => { window.location.href = "/register" }, 3000);</script>');
        }
    },

    // Страница логина
    loadLoginPage: function (req, res, next) {
        const filePath = path.join(__dirname, '..', 'pages', 'login.ejs');
        ejs.renderFile(filePath, {}, (err, str) => {
            if (err) {
                console.error(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Error loading page');
                return next();
            }
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end(str);
            return next();
        });
    },

    // Вход пользователя
    loginUser: async function (req, res) {
        const {login, password} = req.body;
        try {
            const admin = await queries.loginAdmin(login, password);
            if (admin) {
                // Если найден администратор
                const users = await queries.getAllUsers();
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                ejs.renderFile(
                    path.join(__dirname, '..', 'pages', 'users.ejs'),
                    {users: users, isAdmin: true},
                    (err, str) => {
                        if (err) {
                            console.error(err);
                            res.statusCode = 500;
                            res.end('Error loading users page');
                            return;
                        }
                        res.end(str);
                    }
                );
            } else {
                const user = await queries.loginUser(login, password);
                if (user) {
                    // Если найден обычный пользователь
                    const users = await queries.getAllUsers();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    ejs.renderFile(
                        path.join(__dirname, '..', 'pages', 'users.ejs'),
                        {users: users, isAdmin: false},
                        (err, str) => {
                            if (err) {
                                console.error(err);
                                res.statusCode = 500;
                                res.end('Error loading users page');
                                return;
                            }
                            res.end(str);
                        }
                    );
                } else {
                    // Неверный логин или пароль
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<p>Invalid login or password! Redirecting to login page...</p><script>setTimeout(() => { window.location.href = "/login" }, 3000);</script>');
                }
            }
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Error logging in user');
        }
    },

    // Загрузка страницы редактирования пользователя
    loadEditUserPage: async function (req, res) {
        const {id} = req.params;
        try {
            const user = await queries.getUserById(id);
            if (!user) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('User not found');
                return;
            }
            const filePath = path.join(__dirname, '..', 'pages', 'edit_user.ejs');
            ejs.renderFile(filePath, {user: user}, (err, str) => {
                if (err) {
                    console.error(err);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('Error loading edit user page');
                    return;
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                res.end(str);
            });
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Error loading edit user page');
        }
    },

    // Обновление данных пользователя
    updateUser: async function (req, res) {
        const {id} = req.params;
        const {name, login} = req.body;

        try {
            await queries.updateUser(id, name, login);
            const users = await queries.getAllUsers();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            ejs.renderFile(
                path.join(__dirname, '..', 'pages', 'users.ejs'),
                {users: users, isAdmin: true},
                (err, str) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end('Error loading users page after update');
                        return;
                    }
                    res.end(str);
                }
            );
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.end('<p>Error updating user! Redirecting back to edit page...</p><script>setTimeout(() => { window.location.href = "/edit/' + id + '" }, 3000);</script>');
        }
    },

    // Удаление пользователя
    deleteUser: async function (req, res) {
        const {id} = req.params;

        try {
            await queries.deleteUser(id);
            const users = await queries.getAllUsers();
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            ejs.renderFile(
                path.join(__dirname, '..', 'pages', 'users.ejs'),
                {users: users, isAdmin: true},
                (err, str) => {
                    if (err) {
                        console.error(err);
                        res.statusCode = 500;
                        res.end('Error loading users page after delete');
                        return;
                    }
                    res.end(str);
                }
            );
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'text/html');
            res.end('<p>Error deleting user! Redirecting back to users page...</p><script>setTimeout(() => { window.location.href = "/users" }, 3000);</script>');
        }
    }
};
