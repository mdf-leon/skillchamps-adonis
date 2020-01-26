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

//testes aleatorios
Route.get('/test1', 'AppController.test1').middleware('auth');
Route.get('/check', 'AppController.check').middleware('auth');

//TODO criar um rider(com entity)
Route.post('/makeRider', 'AppController.makeRider').middleware('auth');
Route.post('/makeInstitute', 'AppController.makeInstitute').middleware('auth')
Route.post('/createEvent', 'AppController.createEvent').middleware('auth')
Route.post('/createTrial', 'AppController.createTrial').middleware('auth')
Route.post('/addScore', 'AppController.addScore').middleware('auth')
Route.post('/signToEvent', 'AppController.signToEvent').middleware('auth')

