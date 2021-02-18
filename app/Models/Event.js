'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Event extends Model {
  
  trials() {
    return this.hasMany('App/Models/Trial')
  }

  history() {
    return this.hasOne('App/Models/History')
  }

  notifications() {
    return this.hasMany('App/Models/Notification')
  }

  // addresses

  riders() {
    return this.belongsToMany('App/Models/Rider')
  }

  admins() { // managers
    return this.belongsToMany('App/Models/User')
  }

  institute() {
    return this.belongsTo('App/Models/Institute')
  }

  static get createdAtColumn () {
    return null
  }
 
  static get updatedAtColumn () {
    return null
  }

}


module.exports = Event
