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
    return {a:"b bb b bs"}
});
Route.get('/', 'AppController.index');
Route.post('/register', 'AuthController.register'); // sign up
Route.post('/authenticate', 'AuthController.authenticate'); // sign in

Route.get('/showUser', 'UserController.showUser').middleware('auth');
Route.get('/indexUser', 'UserController.index').middleware('auth');

//testes aleatorios
Route.get('/test1', 'AppController.test1').middleware('auth');
Route.get('/check', 'AppController.check').middleware('auth');

Route.post('/makeRider', 'RiderController.makeRider').middleware('auth');
Route.get('/showRider', 'RiderController.showRider').middleware('auth');
Route.delete('/deleteRider', 'RiderController.deleteRider').middleware('auth');
Route.get('/indexRider', 'RiderController.index').middleware('auth');

Route.post('/makeInstitute', 'InstituteController.makeInstitute').middleware('auth')
Route.get('/showInstitute', 'InstituteController.showInstitute').middleware('auth')
Route.get('/institutesList', 'InstituteController.institutesList').middleware('auth')

Route.post('/createEvent', 'EventController.createEvent').middleware('auth')
Route.post('/uncontrolledRegister', 'EventController.uncontrolledRegister'); // rider without user
Route.get('/showEvent', 'EventController.showEvent').middleware('auth') // events the admin created
Route.post('/signToEvent', 'EventController.signToEvent').middleware('auth')
Route.get('/eventsSigned', 'EventController.eventsSigned').middleware('auth')
Route.get('/eventsList', 'EventController.eventsList').middleware('auth')

//manage event:
Route.get('/managedEventsList', 'ManageEventController.managedEventsList').middleware('auth') // same as /showEvent (?)
Route.get('/managedTrialsList', 'ManageEventController.managedTrialsList').middleware('auth') 
Route.get('/managedRidersList', 'ManageEventController.managedRidersList').middleware('auth') 
Route.get('/managedPenaltyConfsFromTrial', 'ManageEventController.managedPenaltyConfsFromTrial').middleware('auth') 
Route.post('/sendScore', 'ManageEventController.sendScore').middleware('auth') // coraçao da aplicaçao
Route.get('/showScore', 'ManageEventController.showScore').middleware('auth') // coraçao da aplicaçao

Route.post('/createTrial', 'ManageEventController.createTrial').middleware('auth')
Route.post('/addScore', 'ManageEventController.addScore').middleware('auth')
Route.get('/fullRanking/:event_id', 'ManageEventController.fullRanking').middleware('auth')

