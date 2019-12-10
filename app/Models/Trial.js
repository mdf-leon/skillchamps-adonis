'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Trial extends Model {
  
  score() {
    return this.hasMany('App/Models/Score')
  }

  event() {
    return this.belongsTo('App/Models/Event')
  }

}

module.exports = Trial
