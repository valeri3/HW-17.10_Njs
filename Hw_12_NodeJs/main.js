const restify = require('restify');
const apiHandler = require('./js/api.js');
const path = require('path');

const port = 8080;

// Создание сервера
const server = restify.createServer({
    name: 'AuthorizationApp'
});

// Middleware для работы с формами
server.use(restify.plugins.bodyParser());

// Статические файлы
server.get('/css/*', restify.plugins.serveStatic({
    directory: path.join(__dirname)
}));

// Маршруты
server.get('/', apiHandler.loadIndexPage); // Главная страница
server.get('/register', apiHandler.loadRegisterPage); // Страница регистрации
server.post('/register', apiHandler.registerUser); // Регистрация нового пользователя
server.get('/login', apiHandler.loadLoginPage); // Страница логина
server.post('/login', apiHandler.loginUser); // Логин пользователя
server.get('/edit/:id', apiHandler.loadEditUserPage); // Страница редактирования пользователя
server.post('/edit/:id', apiHandler.updateUser); // Обновление данных пользователя
server.post('/delete/:id', apiHandler.deleteUser); // Удаление пользователя

// Обработка ошибок
server.on('InternalServer', (req, res, err, cb) => {
    console.error('Internal Server Error:', err);
    res.send(500, 'Oops... something went wrong');
    return cb();
});

// Запуск сервера
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
