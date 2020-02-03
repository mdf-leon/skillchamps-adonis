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

env file: 

HOST=0.0.0.0
PORT=3333
NODE_ENV=development
APP_NAME=AdonisJs
APP_URL=http://${HOST}:${PORT}
CACHE_VIEWS=false
APP_KEY=LuWpq9LQBkGxPaKgKsiag8mX7VMDQ7nf
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=sc
HASH_DRIVER=bcrypt

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
Route.get('/showEvent', 'AppController.showEvent').middleware('auth') // events the admin created
Route.post('/signToEvent', 'AppController.signToEvent').middleware('auth')
Route.get('/eventsSigned', 'AppController.eventsSigned').middleware('auth')
Route.get('/eventsList', 'AppController.eventsList').middleware('auth')
//manage event:
Route.get('/managedEventsList', 'ManageEventController.managedEventsList').middleware('auth') // same as /showEvent (?)
Route.get('/managedTrialsList', 'ManageEventController.managedTrialsList').middleware('auth') 
Route.get('/managedRidersList', 'ManageEventController.managedRidersList').middleware('auth') 


Route.post('/createTrial', 'AppController.createTrial').middleware('auth')
Route.post('/addScore', 'AppController.addScore').middleware('auth')

