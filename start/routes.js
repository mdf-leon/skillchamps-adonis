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

Route.get('/', 'AppController.index');
Route.post('/register', 'AuthController.register'); // sign up
Route.post('/authenticate', 'AuthController.authenticate'); // sign in

//testes aleatorios
Route.get('/test1', 'AppController.test1').middleware('auth');

//TODO criar um rider(com entity)
Route.post('/makeRider', 'AppController.makeRider').middleware('auth');

Route.post('/makeInstitute', 'AppController.makeInstitute')

