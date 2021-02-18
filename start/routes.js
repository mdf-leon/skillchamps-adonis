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

//- MVP ROUTES
Route.get('/a', ({response}) => {
    return {a:"b bb b bs"}
});
Route.get('/', 'AppController.index');
Route.post('/register', 'AuthController.register'); // sign up
Route.post('/authenticate', 'AuthController.authenticate'); // sign in

Route.get('/showUser', 'UserController.showUser').middleware('auth');
Route.get('/indexUser', 'UserController.index') //.middleware('auth');

//testes aleatorios
Route.get('/test1', 'AppController.test1').middleware('auth');
Route.get('/check', 'AppController.check').middleware('auth');
Route.get('notifications', 'AuthController.notifications').middleware('auth');

Route.post('/makeRider', 'RiderController.makeRider').middleware('auth');
Route.get('/showRider', 'RiderController.showRider').middleware('auth');
Route.delete('/deleteRider/:rider_id', 'RiderController.deleteRider').middleware('auth');
Route.get('/indexRider', 'RiderController.index').middleware('auth');

Route.post('/makeInstitute', 'InstituteController.makeInstitute').middleware('auth')
Route.get('/showInstitute', 'InstituteController.showInstitute').middleware('auth')
Route.get('/institutesList', 'InstituteController.institutesList').middleware('auth')

Route.get('/image/:id', 'EventController.image')
Route.get('/image-b64/:id', 'EventController.imageB64')
Route.post('/createEvent', 'EventController.createEvent').middleware('auth')
Route.post('/createEvent2', 'EventController.createEvent2').middleware('auth')
Route.post('/updateEvent/:event_id', 'EventController.updateEvent').middleware('auth')
Route.put('/uploadEventPhoto/:event_id', 'EventController.uploadEventPhoto').middleware('auth')
Route.post('/uncontrolledRegister', 'EventController.uncontrolledRegister'); // rider without user
Route.get('/events', 'EventController.events').middleware('auth') // events list with filter in it // events the admin created
Route.get('/showEvent', 'EventController.showEvent').middleware('auth') // events the admin created
Route.get('/eventsHistory', 'EventController.eventsHistory').middleware('auth') // events history from a rider
Route.post('/signToEvent', 'EventController.signToEvent').middleware('auth')
Route.put('/unsignToEvent', 'EventController.unsignToEvent').middleware('auth')
Route.get('/eventsSigned', 'EventController.eventsSigned').middleware('auth')
Route.get('/eventsList', 'EventController.eventsList').middleware('auth')
Route.get('/finishEvent/:event_id', 'EventController.finishEvent').middleware('auth') // WARN: finishing an event

//manage event:
Route.post('/assignEventToManager', 'ManageEventController.assignEventToManager').middleware('auth')
Route.get('/managedEventsList', 'ManageEventController.managedEventsList').middleware('auth') // same as /showEvent (?)
Route.post('/addManagerByEmail', 'ManageEventController.addManagerByEmail').middleware('auth') 
Route.get('/managedTrialsList', 'ManageEventController.managedTrialsList').middleware('auth') 
Route.get('/trials/event/:event_id', 'ManageEventController.trialsList') // lista de trial de um evento publico
Route.get('/managedRidersList', 'ManageEventController.managedRidersList').middleware('auth') 
Route.get('/managedRidersList2', 'ManageEventController.managedRidersList2').middleware('auth') 
Route.get('/managedRidersList3', 'ManageEventController.managedRidersList3').middleware('auth') 
Route.get('/managedPenaltyConfsFromTrial', 'ManageEventController.managedPenaltyConfsFromTrial').middleware('auth') 
Route.get('/managedBonusConfsFromTrial', 'ManageEventController.managedBonusConfsFromTrial').middleware('auth') 
Route.get('/managedPenaltyConfsFromTrial2/:user_id', 'ManageEventController.managedPenaltyConfsFromTrial2')
Route.get('/managedBonusConfsFromTrial2/:user_id', 'ManageEventController.managedBonusConfsFromTrial2')
Route.post('/sendScore', 'ManageEventController.sendScore').middleware('auth') // coraçao da aplicaçao
Route.get('/showScore', 'ManageEventController.showScore').middleware('auth') // coraçao da aplicaçao

Route.get('/trial/:trial_id', 'ManageEventController.getTrial')
Route.post('/createTrial', 'ManageEventController.createTrial').middleware('auth')
Route.post('/addScore', 'ManageEventController.addScore').middleware('auth')
Route.get('/fullRanking/:event_id', 'ManageEventController.fullRanking').middleware('auth')
Route.get('/fullRanking2', 'ManageEventController.fullRanking2').middleware('auth')
Route.get('/fullRanking3', 'ManageEventController.fullRanking3')
Route.post('/allRanking', 'ManageEventController.allRanking').middleware('auth') //essa rota cria o config do history
Route.get('/result/event/:event_id', 'ManageEventController.resultRanking')

//- BETA ROUTES
Route.resource('/score', 'ScoreController').middleware('auth')