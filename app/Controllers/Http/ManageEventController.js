'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Trial = use('App/Models/Trial')
const PenaltyConf = use('App/Models/PenaltyConf')
const Score = use('App/Models/Score')
const Penalty = use('App/Models/Penalty')
//const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')

class ManageEventController {

  async managedEventsList({ request, response, auth }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin
    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    let events = await institute.events().fetch()
    return response.send(events)
  }

  async managedTrialsList({ request, response, auth }) {

    const query = request.get()

    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    // let event = await Event.findOrFail(query.event_id)
    let events = await institute.events().fetch()
    events = events.toJSON()
    for (let event of events) {
      if (event.id == query.event_id) {

        let eventTemp = await Event.findOrFail(query.event_id)
        let trials = await eventTemp.trials().fetch()

        return response.send(trials)
      }
    }
    return response.status(500).send({ Erro: 'Bad request: Could you be asking for an event thats not yours?' })

    // return event
  }

  async managedRidersList({ request, response, auth }) {
    // lista de riders de um evento, por enquanto
    // teoricamente cada prova pode ter um competidor diferente da outra
    // mas aqui você escolhe o corredor que vai participar da prova X
    // se ele não for correr, basta não selecionar/pontuar o corredor
    // portanto lista-se os corredores inscritos num evento, selecionar uma prova anteriormente
    // na tela de gerencia apenas significa que você escolheu uma prova e um corredor para enviar para
    // este endpoit e ser processado.

    const query = request.get()

    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    // let event = await Event.findOrFail(query.event_id)
    let events = await institute.events().fetch()
    events = events.toJSON()
    let eventOne;
    for (let event of events) {
      if (event.id == query.event_id) {
        eventOne = await Event.findOrFail(query.event_id)
      }
    }
    if (!eventOne) return response.status(500).send({ Erro: "Unknown event" })

    let riders = await eventOne.riders().fetch()

    if (!riders) return response.status(500).send({ Erro: "There are no riders on here, populate this wasteland" })

    return response.send(riders)

  }

  async managedPenaltyConfsFromTrial({ request, response, auth }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin

    const query = request.get()

    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    let events = await institute.events().fetch()
    events = events.toJSON()
    let trial
    for (let event of events) {
      if (event.id == query.event_id) {

        let eventTemp = await Event.findOrFail(query.event_id)
        let trials = await eventTemp.trials().fetch()
        trials = trials.toJSON()
        for (let trialL of trials) {
          if (trialL.id == query.trial_id) {
            trial = await Trial.findOrFail(query.trial_id)
          }
        }

      }
    }
    if (!trial) return response.status(400).send({ "bad_request": "sure this trial exist?" })
    let penalties = await trial.penaltyConfs().fetch()


    return response.send(penalties)
  }

  async sendScore({ request, response, auth }) {

    const data = request.all()

    const score = await Score.create({ time: data.time, rider_id: data.rider_id, trial_id: data.trial_id })
    let penalties = []
    for (let penalty of data.penalties) {
      let pen = await Penalty.create({ ...penalty, score_id: score.id })
      penalties.push(pen)
      console.log(pen)
    }

    return { score, penalties }

  }

  async showScore({ request, response, auth }) {

    const query = request.get()

    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    // let event = await Event.findOrFail(query.event_id)
    let events = await institute.events().fetch()
    events = events.toJSON()
    let trial
    for (let event of events) {
      if (event.id == query.event_id) {

        let eventTemp = await Event.findOrFail(query.event_id)
        let trials = await eventTemp.trials().fetch()
        trials = trials.toJSON()
        // return response.send(trials)
        for (let trialL of trials) {
          if (trialL.id == query.trial_id) {
            trial = await Trial.findOrFail(trialL.id)
          }
        }
      }
    }
    let penaltyConfs = await trial.penaltyConfs().fetch()
    let scoresO = await trial.scores().fetch()
    let scores = scoresO.toJSON()
    for (let score in scores) {
      let tempScore = await Score.findOrFail(scores[score].id)
      let penalties = await tempScore.penalties().fetch()
      penalties = penalties.toJSON()
      console.log(penalties)
      scores[score].penalties = penalties
    }

    return { penaltyConfs, scores }

  }

  async result({ request, response, auth }) {

    const query = request.get()


  }

  async addScore({ request, response, auth }) {
    const data = request.only([
      'rider_id',
      'trial_id',
      'penalties',
      'time',
    ]);
    //um rider so pode receber a pontuaçao se o gerente estiver dando pontuaçao a um rider inscrito em seu evento
    const rider = await Rider.query()
      .where('id', '=', data.rider_id)
      .with('events')
      .first()
    if (!rider) return response.status(400).json({ bad_request: 'este rider nao existe' })

    const trial = await Trial.query()
      .where('id', '=', data.trial_id)
      .with('event')
      .first() // trial.toJSON().event.id
    if (!trial) return response.status(400).json({ bad_request: 'este trial nao existe' })

    //que essa linha significa que este rider esta inscrito neste evento
    const event = await rider.events().where('events.id', '=', trial.toJSON().event.id).first()
    if (!event) return response.status(400).json({ bad_request: 'este rider esta inscrito neste evento?' })

    let res = await Score.create({
      rider_id: data.rider_id, trial_id: data.trial_id, time: data.time
    })

    let pens = []

    for (let penalty of data.penalties) {
      pens.push(await Penalty.create({ ...penalty, score_id: res.id }))
    }

    res = res.toJSON()
    return response.json({ ...res, penalties: [...pens] })
  }

  async createTrial({ request, response, auth }) {
    const data = request.only([
      'name',
      'event_id',
      'penalties'
    ]);

    let res = await Trial.create({ name: data.name, event_id: data.event_id })

    let pens = []

    for (let penalty of data.penalties) {
      pens.push(await PenaltyConf.create({ ...penalty, trial_id: res.id }))
    }

    res = res.toJSON()

    return response.json({ ...res, penalties: [...pens] })
  }

}

module.exports = ManageEventController
