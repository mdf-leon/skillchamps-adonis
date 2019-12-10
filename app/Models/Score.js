'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Score extends Model {
  penalties() {
    return this.hasMany('App/Models/Penalty')
  }

  trial() {
    return this.belongsTo('App/Models/Trial')
  }

  rider() {
    return this.belongsTo('App/Models/Rider')
  }
}

module.exports = Score
