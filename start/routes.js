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

Route.post('/registerEntity', 'AppController.createEntity');
Route.get('/', 'AppController.index');

//TODO criar um rider(com entity)

Route.post('/getUserInfo', 'UserController.showInfo').middleware('auth')

Route.post('/attach/user/entity', 'AppController.attachToEntity');

Route.post('/register', 'AuthController.register');
Route.post('/authenticate', 'AuthController.authenticate');
Route.get('/app', 'AppController.index').middleware(["auth"]);