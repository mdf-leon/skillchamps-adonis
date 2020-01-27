'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/a', ({response}) => {
    return {a:"b bb b"}
});
Route.get('/', 'AppController.index');
Route.post('/register', 'AuthController.register'); // sign up
Route.post('/authenticate', 'AuthController.authenticate'); // sign in

Route.get('/showUser', 'UserController.showUser').middleware('auth');

//testes aleatorios
Route.get('/test1', 'AppController.test1').middleware('auth');
Route.get('/check', 'AppController.check').middleware('auth');

Route.post('/makeRider', 'AppController.makeRider').middleware('auth');
Route.get('/showRider', 'AppController.showRider').middleware('auth');

Route.post('/makeInstitute', 'AppController.makeInstitute').middleware('auth')
Route.get('/showInstitute', 'AppController.showInstitute').middleware('auth')
Route.get('/institutesList', 'AppController.institutesList').middleware('auth')

Route.post('/createEvent', 'AppController.createEvent').middleware('auth')
Route.get('/showEvent', 'AppController.showEvent').middleware('auth')

Route.post('/createTrial', 'AppController.createTrial').middleware('auth')
Route.post('/addScore', 'AppController.addScore').middleware('auth')
Route.post('/signToEvent', 'AppController.signToEvent').middleware('auth')

