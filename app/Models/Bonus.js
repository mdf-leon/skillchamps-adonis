'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Bonus extends Model {

  score() {
    return this.belongsTo('App/Models/Score')
  }

  bonusConf() {
    return this.belongsTo('App/Models/BonusConf')
  }
  
}

module.exports = Bonus
