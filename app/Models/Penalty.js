'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Penalty extends Model {

  score() {
    return this.belongsTo('App/Models/Score')
  }

  penaltyConf() {
    return this.belongsTo('App/Models/PenaltyConf')
  }
  
}

module.exports = Penalty
