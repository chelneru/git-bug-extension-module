var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
global.test = false;
global.connected = false;
global.started_gitbug = false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const internal = require('./app/internal');
internal.Initialize();

internal.LoadConfig();
if(global.test === true) {
  global.identity = {
    name: 'alin',
    email: 'alin@test.com',
    folderPath: 'C:\\Users\\Alin\\colligo',
    projectPath: 'C:\\Users\\Alin\\colligo\\project'
  };
}
else {
  let framework = require('./app/framework');
  framework.GetIdentity();
}
module.exports = app;
