'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Trial = use('App/Models/Trial')
const PenaltyConf = use('App/Models/PenaltyConf')
const BonusConf = use('App/Models/BonusConf')
const Score = use('App/Models/Score')
const Penalty = use('App/Models/Penalty')
const Bonus = use('App/Models/Bonus')
//const EntityTag = use('App/Models/EntityTag')
const History = use('App/Models/History')
const Bracket = use('App/Models/Bracket')
const Database = use('Database')
var _ = require('lodash');
var { Duration } = require('luxon');

class ManageEventController {

  async managedEventsListold({ request, response, auth }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin
    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    let events = await institute.events().fetch()
    return response.send(events)
  }

  async managedEventsList({ request, response, auth }) {
    let user = await auth.getUser()
    let events = await user.eventsOnManagement().where('date_begin', '>=', new Date()).fetch()
    return response.send(events.toJSON().reverse())
  }

  async managedHistoryList({ request, response, auth }) {
    let user = await auth.getUser()
    let events = await user.eventsOnManagement().where('date_begin', '<=', new Date()).fetch()
    return response.send(events.toJSON().reverse())
  }

  //primeira rota que precisa de segurança completa: verificar se o evento é do usuario jwt
  async addManagerByEmail({ request, response, auth }) { // valeu zap
    const { event_id, email } = request.post()
    let manager = await User.findByOrFail({ email })
    let event = await Event.findOrFail(event_id)
    let attach = await event.admins().attach(manager.id)
    return response.send({ event, attach })
  }

  async assignEventToManager({ request, response, auth }) {
    const { event_id, user_id } = request.post()
    let event = await Event.findOrFail(event_id)
    let admins = (await event.admins().fetch()).toJSON()
    if (admins.find(admin => admin.id == user_id)) {
      return response.status(401).json({ already: 'there' })
    }
    const res = await event.admins().attach(user_id)
    return response.send({ event, res })
  }

  async getTrial({ request, response, params, auth }) {
    return await Trial.findOrFail(params.trial_id)
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
        let trials

        if (query.trial_id) {
          trials = await eventTemp.trials().where('trials.id', query.trial_id).where('active', '=', true).first()
        } else {
          trials = await eventTemp.trials().where('active', '=', true).fetch()
        }

        return response.send(trials)
      }
    }
    return response.status(500).send({ Erro: 'Bad request: Could you be asking for an event thats not yours?' })

    // return event
  }

  async trialsList({ request, response, params }) {
    const { event_id } = params
    let event = await Event.findOrFail(event_id)
    if (event) {
      return event.trials().where('active', '=', true).fetch()
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

    let riders
    if (query.rider_id) {
      riders = await eventOne.riders().where('riders.id', query.rider_id).first()
    } else {
      riders = await eventOne.riders().fetch()
    }

    if (!riders) return response.status(500).send({ Erro: "There are no riders on here, populate this wasteland" })

    return response.send(riders)

  }

  async managedRidersList2({ request, response, auth }) {

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

    let riders
    let filteredRiders = []
    let filteredRidersNoScore = []
    if (query.rider_id) {
      riders = await eventOne.riders().where('riders.id', query.rider_id).first()
    } else {
      riders = await eventOne.riders()
        .with('scores.trial')
        .fetch()
      riders = riders.toJSON()
      for (const rider of riders) {
        if (!rider.scores[0]) {
          filteredRidersNoScore.push({ ...rider, scores: undefined })
        }
        for (const score of rider.scores) {
          if (score.trial.id == query.trial_id) {
            filteredRiders.push({ ...rider, scores: { ...score } })
          }
        }
      }
      // filteredRidersNoScore = filteredRidersNoScore.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
      riders = _.uniqBy([...filteredRiders, ...filteredRidersNoScore], 'id')
      // riders = [...filteredRiders, ...filteredRidersNoScore]
      // riders = filteredRiders
    }

    if (!riders) return response.status(500).send({ Erro: "There are no riders on here, populate this wasteland" })

    return response.send(riders.reverse())

  }

  async managedRidersList3({ request, response, auth }) {

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

    let riders
    let filteredRiders = []
    let filteredRidersNoScore = []
    if (query.rider_id) {
      riders = await eventOne.riders().where('riders.id', query.rider_id).first()
    } else {
      riders = await eventOne.riders()
        .with('scores.trial')
        .fetch()
      riders = riders.toJSON()
      for (const rider of riders) {
        if (!rider.scores.find(score => score.trial.id == query.trial_id)) {
          filteredRidersNoScore.push({ ...rider, scores: undefined })
        }
        for (const score of rider.scores) {
          if (score.trial.id == query.trial_id) {
            filteredRiders.push({ ...rider, scores: { ...score } })
          }
        }
      }
      riders = _.uniqBy([...filteredRiders, ...filteredRidersNoScore], 'id')
    }

    if (!riders) return response.status(500).send({ Erro: "There are no riders on here, populate this wasteland" })

    return response.send(riders.reverse())

  }

  async managedBonusConfsFromTrial({ request, response, auth }) {
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
    let bonuses = await trial.bonusConfs().fetch()


    return response.send(bonuses)
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

  async managedBonusConfsFromTrial2({ request, response, params }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin

    const query = request.get()

    let user = await User.findOrFail(params.user_id)
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
    let bonuses = await trial.bonusConfs().fetch()


    return response.send(bonuses)
  }

  async managedBonusConfsFromTrial3({ request, response, params }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin

    const query = request.get()

    let trial
    let eventTemp = await Event.findOrFail(query.event_id)
    let trials = await eventTemp.trials().fetch()
    trials = trials.toJSON()
    for (let trialL of trials) {
      if (trialL.id == query.trial_id) {
        trial = await Trial.findOrFail(query.trial_id)
      }
    }

    if (!trial) return response.status(400).send({ "bad_request": "sure this trial exist?" })
    let bonuses = await trial.bonusConfs().fetch()


    return response.send(bonuses)
  }

  async managedPenaltyConfsFromTrial2({ request, response, params }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin

    const query = request.get()

    let user = await User.findOrFail(params.user_id)
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

  async managedPenaltyConfsFromTrial3({ request, response, params }) {
    //assumo que o evento está acontecendo
    //esta rota apenas procura as trials do admin

    const query = request.get()

    let trial
    let eventTemp = await Event.findOrFail(query.event_id)
    let trials = await eventTemp.trials().fetch()
    trials = trials.toJSON()
    for (let trialL of trials) {
      if (trialL.id == query.trial_id) {
        trial = await Trial.findOrFail(query.trial_id)
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

  async fullRanking({ request, params, response, auth }) {

    let event = await Event.query()
      .with('riders.scores.trial')
      .with('riders.scores.penalties')
      .with('riders.scores.bonuses')
      .where({ id: params.event_id }).first()

    event = event.toJSON()

    return { event }

  }

  async fullRanking2({ request, params, response, auth }) {
    const get = request.get()
    // .innerJoin('accounts', 'user.id', 'accounts.user_id')
    let event = await Event.query()
      .with('riders.scores.trial')
      .with('riders.scores.penalties')
      .with('riders.scores.bonuses')
      .where({ id: get.event_id })
      .first()

    event = event.toJSON()

    // let filtered = []
    for (let i = 0; i < event.riders.length; i++) {
      event.riders[i].scores =
        event.riders[i].scores.filter(score => {
          return score.trial.id == get.trial_id
        })[0]
    }

    // if(!event.riders[1]) console.log("a")
    console.log(event.riders)
    event.riders.sort(function (riderA, riderB) {

      let timeA = riderA.scores ? riderA.scores.time_total : null
      let timeB = riderB.scores ? riderB.scores.time_total : null
      if (!timeA) return 1
      if (!timeB) return -1
      if (Number(timeA) < Number(timeB)) {
        return -1;
      }
      if (Number(timeA) > Number(timeB)) {
        return 1;
      }
      return 0;
    });

    return { ...event }
  }

  msToDefault = (ms) => {
    const duration = Duration.fromObject({ milliseconds: ms })
      .normalize()
      .shiftTo('minutes', 'seconds', 'milliseconds')
      .toObject();
    const minutesT = `${duration.minutes}`.padStart(2, '0');
    const secondsT = `${duration.seconds}`.padStart(2, '0');
    const millisecondsT = `${duration.milliseconds}`.padEnd(3, '0');
    const timeT = `${minutesT}:${secondsT}.${millisecondsT}`;
    return timeT;
  };

  sortLessTime(riderA, riderB) {
    let timeA = riderA.scores ? riderA.scores.time_total : null
    let timeB = riderB.scores ? riderB.scores.time_total : null
    if (!timeA) return 1
    if (!timeB) return -1
    if (Number(timeA) < Number(timeB)) {
      return -1;
    }
    if (Number(timeA) > Number(timeB)) {
      return 1;
    }
    return 0;
  }

  sortMoreTime(riderA, riderB) { // for inverted trial, or slowride
    let timeA = riderA.scores ? riderA.scores.time_total : null
    let timeB = riderB.scores ? riderB.scores.time_total : null
    if (!timeA) return 1
    if (!timeB) return -1
    if (Number(timeA) < Number(timeB)) {
      return -1;
    }
    if (Number(timeA) > Number(timeB)) {
      return 1;
    }
    return 0;
  }

  async fullRanking3({ request, params, response, auth }) {
    const get = request.get()
    // .innerJoin('accounts', 'user.id', 'accounts.user_id')
    let event = await Event.query()
      .with('riders.scores.trial')
      .with('riders.scores.penalties.penaltyConf')
      .with('riders.scores.bonuses.bonusConf')
      .where({ id: get.event_id })
      .first()

    event = event.toJSON()

    // let filtered = []
    for (let i = 0; i < event.riders.length; i++) {
      event.riders[i].scores =
        event.riders[i].scores.filter(score => {
          return score.trial.id == get.trial_id
        })[0]
    }

    // if(!event.riders[1]) console.log("a")
    // console.log(event.riders)
    event.riders.sort(function (riderA, riderB) {

      let timeA = riderA.scores ? riderA.scores.time_total : null
      let timeB = riderB.scores ? riderB.scores.time_total : null
      if (!timeA) return 1
      if (!timeB) return -1
      if (Number(timeA) < Number(timeB)) {
        return -1;
      }
      if (Number(timeA) > Number(timeB)) {
        return 1;
      }
      return 0;
    });

    for (const i in event.riders) {
      if (get.category && get.category !== "null" && get.category !== "none" && event.riders[i].category !== get.category) {
        // event.riders[i] = undefined
        delete event.riders[i]
        continue
      }

      event.riders[i].position = Number(i) + 1
      event.riders[i].treated_time_total = this.msToDefault(event.riders[i].scores ? event.riders[i].scores.time_total : 0)
      event.riders[i].treated_time = this.msToDefault(event.riders[i].scores ? event.riders[i].scores.time : 0)

      event.riders[i].penalty_time = 0
      if (event.riders[i].scores && event.riders[i].scores.penalties) {
        for (const p in event.riders[i].scores.penalties) {
          const temp_p = event.riders[i].scores.penalties[p]
          event.riders[i].penalty_time
            += temp_p.quantity * temp_p.penaltyConf.time_penalty
        }
        event.riders[i].penalty_time = this.msToDefault(event.riders[i].penalty_time)
      }

      if (event.riders[i].scores && event.riders[i].scores.bonuses) {
        event.riders[i].bonus_time = 0
        for (const p in event.riders[i].scores.bonuses) {
          const temp_p = event.riders[i].scores.bonuses[p]
          event.riders[i].bonus_time
            += temp_p.quantity * temp_p.bonusConf.time_bonus
        }
        event.riders[i].bonus_time = this.msToDefault(event.riders[i].bonus_time)
      }
    }

    event.riders = event.riders.filter(function (el) {
      return el != null;
    });

    return { ...event }
  }

  async getBrackets({ request, params, response, auth }) {
    const { trial_id } = params
    const bracket = await Bracket.findByOrFail({ trial_id })
    return bracket
  }

  async resultRanking({ request, params, response }) {
    const { event_id } = params
    // const { events_request } = request.post()

    // try {
    //   const history = await History.findByOrFail({ event_id: events_request[0].event_id });
    //   history.config = JSON.stringify(events_request);
    //   await history.save()
    // } catch (error) {
    //   console.log(error)
    //   await History.create({ config: JSON.stringify(events_request), event_id: events_request[0].event_id })
    // }

    const event_temp = await Event.findOrFail(event_id)
    const history = await event_temp.history().fetch()
    if (!history || !history.config) {
      return response.status(400).json({ error: 'cannot make history without "allRanking", please create a config file' })
    }
    const events_request = JSON.parse(history.config)

    const total_events = []
    let riders_points = {}
    let r_p_final = []
    for (const even of events_request) {
      let event = await Event.query()
        .with('trials')
        .with('riders.scores.trial')
        .with('riders.scores.penalties')
        .with('riders.scores.bonuses')
        .where({ id: even.event_id })
        .first()

      event.category_chosen = even.category
      event.category2_chosen = even.category2
      event = event.toJSON()

      if (event.trials.find(el => el.id === Number(even.trial_id))?.type === 'bracket') {
        let bracket = await Bracket.findByOrFail({ trial_id: even.trial_id })
        let finalists = bracket.tournament[Object.keys(bracket.tournament).length - 1]
        let first = finalists['0'].winner
        let second = finalists['0'].rider1.id !== finalists['0'].winner.id ? finalists['0'].rider1 : finalists['0'].rider2
        let third = finalists['1'].winner
        riders_points[first.id.toString()] = {
          id: first.id,
          name: first.name,
          points: riders_points[first.id] ? riders_points[first.id].points + 100 : 100
        }
        riders_points[second.id.toString()] = {
          id: second.id,
          name: second.name,
          points: riders_points[second.id] ? riders_points[second.id].points + 80 : 80
        }
        riders_points[third.id.toString()] = {
          id: third.id,
          name: third.name,
          points: riders_points[third.id] ? riders_points[third.id].points + 60 : 60
        }
      } else {


        // let filtered = []
        for (let i = 0; i < event.riders.length; i++) {
          event.riders[i].scores =
            event.riders[i].scores.filter(score => {
              return score.trial.id == even.trial_id
            })[0]
          if (!event.riders[i].scores) {
            delete event.riders[i]
          }
        }



        // if(!event.riders[1]) console.log("a")
        // console.log(event.riders)
        // event.riders.sort(event.riders[0].scores && event.riders[0].scores.trial.inverted ? this.sortMoreTime : this.sortLessTime);
        event.riders.sort(this.sortLessTime)
        event.trial_name = event.trials.find(el => el.id === Number(even.trial_id))?.name
        if (event.riders[0]?.scores.trial.inverted) {
          event.riders.reverse();
        }

        // for (let i = 0; i < event.riders.length; i++) {

        // }
        event.riders = event.riders.filter(function (el) { // DELETES EMPTY POSITIONS IN ARRAY
          return el != null;
        });

        const points = [100, 80, 60, 40, 20, 5];
        for (const i in event.riders) {
          if (even.category && even.category !== "null" && even.category !== "none" && event.riders[i].category !== even.category) {
            // event.riders[i] = undefined
            delete event.riders[i]
            continue
          }
          if (even.category2 && even.category2 !== "null" && even.category2 !== "none" && event.riders[i].category2 !== even.category2) {
            delete event.riders[i]; continue;
          }
          event.riders[i].position = Number(i) + 1
          event.riders[i].treated_time_total = this.msToDefault(event.riders[i]?.scores ? event.riders[i]?.scores.time_total : 0)
          event.riders[i].treated_time = this.msToDefault(event.riders[i]?.scores ? event.riders[i]?.scores.time : 0)
          // console.log(event.riders[i].id);

          if (event.riders[i]?.scores && points[i]) {
            riders_points[event.riders[i].id.toString()] = {
              id: event.riders[i].id,
              name: event.riders[i].name,
              points: riders_points[event.riders[i].id] ? riders_points[event.riders[i].id].points + points[i] : points[i]
            }
          }
        }

        event.riders = event.riders.filter(function (el) { // TODO: check necessity
          return el != null;
        });


      }


      // riders_points = {...riders_points}
      // for (const rider in riders_points) {
      //   r_p_final.push(riders_points[rider])
      // }


      // riders_points = riders_points.filter(function (el) {
      //   return el != null;
      // });


      // for (const r_p in riders_points) {
      //   r_p_final[r_p] = (riders_points[r_p])
      // }

      // r_p_final = r_p_final.filter(function (el) {
      //   return el != null;
      // });

      total_events.push({ ...event })
    }

    Object.keys(riders_points).forEach(function (key) {
      r_p_final.push(riders_points[key]);
    });

    r_p_final.sort(function (riderA, riderB) {
      let pointA = riderA.points
      let pointB = riderB.points
      // if (!pointA) return -1
      // if (!pointB) return 1
      if (Number(pointA) < Number(pointB)) {
        return 1;
      }
      if (Number(pointA) > Number(pointB)) {
        return -1;
      }
      return 0;
    });
    let the_cone_master = r_p_final.map(function (rp, i) {
      if (i === 0) {
        return rp
      } else if (rp.points === r_p_final[0].points) {
        return rp
      }
    })

    the_cone_master = the_cone_master.filter(function (el) {
      return el != null;
    });

    return { the_cone_master, r_p_final, total_events }
  }


  async allRanking({ request, params, response, auth }) {
    //possivelmente essa funcao nao precisa mais fazer calculo de allranking mais
    const { events_request } = request.post()

    try {
      const history = await History.findByOrFail({ event_id: events_request[0].event_id });
      history.config = JSON.stringify(events_request);
      await history.save()
    } catch (error) {
      console.log(error)
      await History.create({ config: JSON.stringify(events_request), event_id: events_request[0].event_id })
    }

    const total_events = []
    let riders_points = {}
    let r_p_final = []
    for (const even of events_request) {
      let event = await Event.query()
        .with('trials')
        .with('riders.scores.trial')
        .with('riders.scores.penalties')
        .with('riders.scores.bonuses')
        .where({ id: even.event_id })
        .first()

      event.category_chosen = even.category
      event.category2_chosen = even.category2
      event = event.toJSON()

      if (event.trials.find(el => el.id === Number(even.trial_id))?.type === 'bracket') {
        let bracket = await Bracket.findByOrFail({ trial_id: even.trial_id })
        let finalists = bracket.tournament[Object.keys(bracket.tournament).length - 1]
        let first = finalists['0'].winner
        let second = finalists['0'].rider1.id !== finalists['0'].winner.id ? finalists['0'].rider1 : finalists['0'].rider2
        let third = finalists['1'].winner
        riders_points[first.id.toString()] = {
          id: first.id,
          name: first.name,
          points: riders_points[first.id] ? riders_points[first.id].points + 100 : 100
        }
        riders_points[second.id.toString()] = {
          id: second.id,
          name: second.name,
          points: riders_points[second.id] ? riders_points[second.id].points + 80 : 80
        }
        riders_points[third.id.toString()] = {
          id: third.id,
          name: third.name,
          points: riders_points[third.id] ? riders_points[third.id].points + 60 : 60
        }
      } else {



        // let filtered = []
        for (let i = 0; i < event.riders.length; i++) {
          event.riders[i].scores =
            event.riders[i].scores.filter(score => {
              return score.trial.id == even.trial_id
            })[0]
          if (!event.riders[i].scores) {
            delete event.riders[i]
          }
        }



        // if(!event.riders[1]) console.log("a")
        // console.log(event.riders)
        // event.riders.sort(event.riders[0].scores && event.riders[0].scores.trial.inverted ? this.sortMoreTime : this.sortLessTime);
        event.riders.sort(this.sortLessTime)
        event.trial_name = event.trials.find(el => el.id === Number(even.trial_id))?.name
        if (event.riders[0]?.scores.trial.inverted) {
          event.riders.reverse();
        }

        // for (let i = 0; i < event.riders.length; i++) {

        // }
        event.riders = event.riders.filter(function (el) { // DELETES EMPTY POSITIONS IN ARRAY
          return el != null;
        });

        const points = [100, 80, 60, 40, 20, 5];
        for (const i in event.riders) {
          if (even.category && even.category !== "null" && even.category !== "none" && event.riders[i].category !== even.category) {
            // event.riders[i] = undefined
            delete event.riders[i]
            continue
          }
          if (even.category2 && even.category2 !== "null" && even.category2 !== "none" && event.riders[i].category2 !== even.category2) {
            delete event.riders[i]; continue;
          }
          event.riders[i].position = Number(i) + 1
          event.riders[i].treated_time_total = this.msToDefault(event.riders[i]?.scores ? event.riders[i]?.scores.time_total : 0)
          event.riders[i].treated_time = this.msToDefault(event.riders[i]?.scores ? event.riders[i]?.scores.time : 0)
          // console.log(event.riders[i].id);

          if (event.riders[i]?.scores && points[i]) {
            riders_points[event.riders[i].id.toString()] = {
              id: event.riders[i].id,
              name: event.riders[i].name,
              points: riders_points[event.riders[i].id] ? riders_points[event.riders[i].id].points + points[i] : points[i]
            }
          }
        }

        event.riders = event.riders.filter(function (el) { // TODO: check necessity
          return el != null;
        });
      }




      // riders_points = {...riders_points}
      // for (const rider in riders_points) {
      //   r_p_final.push(riders_points[rider])
      // }


      // riders_points = riders_points.filter(function (el) {
      //   return el != null;
      // });


      // for (const r_p in riders_points) {
      //   r_p_final[r_p] = (riders_points[r_p])
      // }

      // r_p_final = r_p_final.filter(function (el) {
      //   return el != null;
      // });

      total_events.push({ ...event })
    }





    Object.keys(riders_points).forEach(function (key) {
      r_p_final.push(riders_points[key]);
    });

    r_p_final.sort(function (riderA, riderB) {
      let pointA = riderA.points
      let pointB = riderB.points
      // if (!pointA) return -1
      // if (!pointB) return 1
      if (Number(pointA) < Number(pointB)) {
        return 1;
      }
      if (Number(pointA) > Number(pointB)) {
        return -1;
      }
      return 0;
    });
    let the_cone_master = r_p_final.map(function (rp, i) {
      if (i === 0) {
        return rp
      } else if (rp.points === r_p_final[0].points) {
        return rp
      }
    })

    the_cone_master = the_cone_master.filter(function (el) {
      return el != null;
    });

    return { the_cone_master, r_p_final, total_events }
  }

  async addScore({ request, response, auth }) {
    const data = request.only([
      'rider_id',
      'trial_id',
      'penalties',
      'bonuses',
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

    let old = await Score.query().where({ rider_id: data.rider_id, trial_id: data.trial_id })
      .with('penalties')
      .with('bonuses')
      .first();
    if (old) {
      for (let penalty of old.toJSON().penalties) {
        const pen = await Penalty.findOrFail(penalty.id)
        await pen.delete()
      }
      for (let bonus of old.toJSON().bonuses) {
        const bon = await Bonus.findOrFail(bonus.id)
        await bon.delete()
      }
      await old.delete()
    }
    let res = await Score.create({
      rider_id: data.rider_id, trial_id: data.trial_id, time: data.time
    })

    let pens = []
    let penaltyTime = 0

    for (let penalty of data.penalties) {
      const peny = await Penalty.create({ ...penalty, score_id: res.id })
      if (penalty.quantity > 0) {
        pens.push(peny);
      }
      const pc = await PenaltyConf.findOrFail(penalty.penalty_conf_id);
      penaltyTime += (penalty.quantity || 0) * pc.time_penalty;
    }

    let bons = []
    let bonusTime = 0

    for (let bonus of data.bonuses) {
      const bc = await BonusConf.findOrFail(bonus.bonus_conf_id)
      // console.log(bc.toJSON());
      if (bc.condition === "trial_true") {
        const score = await Score.findBy({ rider_id: data.rider_id, trial_id: bc.condition_trial_id })
        // console.log(score);
        if (score && score.time_total == 1) {
          bons.push(await Bonus.create({ ...bonus, score_id: res.id, quantity: 1 }))
          bonusTime += bc.time_bonus
        }
      } if (bc.condition === "no_penalties" && !pens[0]) {
        bons.push(await Bonus.create({ ...bonus, score_id: res.id, quantity: 1 }))
        bonusTime += bc.time_bonus
      } else if (bc.condition === "unconditioned") {
        bons.push(await Bonus.create({ ...bonus, score_id: res.id }))
        bonusTime += (bonus.quantity || 0) * bc.time_bonus
      }
    }
    for (let bonus of data.bonuses) {
      const bc = await BonusConf.findOrFail(bonus.bonus_conf_id)
      if (bc.condition === "full_bonus" && bons.length === (data.bonuses.length - 1)) {
        bons.push(await Bonus.create({ ...bonus, score_id: res.id, quantity: 1 }))
        bonusTime += bc.time_bonus
      }
    }
    // console.log(bonusTime);

    res.time_total = Number(res.time) + Number(penaltyTime) - Number(bonusTime)
    await res.save()

    res = res.toJSON()
    return response.json({
      ...res, penaltyTime, bonusTime,
      penalties: [...pens], bonuses: [...bons]
    })
  }

  async addBoolScore({ request, response, auth }) {
    const data = request.only([
      'rider_id',
      'trial_id',
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

    let old = await Score.query().where({ rider_id: data.rider_id, trial_id: data.trial_id })
      .with('penalties')
      .with('bonuses')
      .first();
    if (old) {
      await old.delete()
    }
    let res = await Score.create({
      rider_id: data.rider_id, trial_id: data.trial_id, time_total: data.time
    })
    res = res.toJSON()
    return response.json(res)
  }

  async addBracketScore({ request, response, auth }) { // so para teste

    const data = request.only([
      'trial_id',
      'tournament',
    ]);
    const bracket = await Bracket.create({ trial_id: data.trial_id, tournament: data.tournament })
    return bracket
  }

  async recursiveBuildBrackets(p_tournament, position = 1) {
    let tournament = { ...p_tournament }
    if (tournament[(position - 1)]["1"]?.type === 'third') {
      console.log('cond. parada');
      return tournament
    }

    tournament[position] = {}
    const pastKeys = Object.keys(tournament[(position - 1)])
    let pos = 0
    for (let i = 0; i < pastKeys.length; i += 2) {
      tournament[position] = {
        ...tournament[position], [pos]: {
          type: 'normal',
          rider1: tournament[(position - 1)][pastKeys[i]]?.winner || 0,
          // rider2: tournament[(position - 1)][pastKeys[i + 1]]?.winner || 0, // wrong
          rider2: tournament[(position - 1)][pastKeys[i + 1]]?.winner || 0,
          // rider2: tournament[(position - 1)][pastKeys[i + 1]]?.winner || tournament[(position - 1)][pastKeys[i]]?.winner, // legacy
          // winner: tournament[(position - 1)][pastKeys[i]]?.winner === tournament[(position - 1)][pastKeys[i + 1]]?.winner // wrong
          // winner: !tournament[(position - 1)][pastKeys[i + 1]]?.winner
          //   ? tournament[(position - 1)][pastKeys[i]]?.winner : 0
          winner: 0
        }
      }
      pos = pos + 1;
    }
    if (Object.keys(tournament[(position)]).length === 1) {
      let third1 = {}
      let third2 = {}

      if (tournament[(position - 1)]["0"]?.winner?.id) {
        if (tournament[(position - 1)]["0"]?.winner?.id !== tournament[(position - 1)]["0"].rider1?.id) {
          third1 = tournament[(position - 1)]["0"].rider1
        } else if (tournament[(position - 1)]["0"]?.winner?.id !== tournament[(position - 1)]["0"].rider2?.id) {
          third1 = tournament[(position - 1)]["0"].rider2
        }
      }


      if (tournament[(position - 1)]["1"]?.winner?.id) {
        if (tournament[(position - 1)]["1"]?.winner?.id !== tournament[(position - 1)]["1"].rider1?.id) {
          third2 = tournament[(position - 1)]["1"].rider1
        } else if (tournament[(position - 1)]["1"]?.winner?.id !== tournament[(position - 1)]["1"].rider2?.id) {
          third2 = tournament[(position - 1)]["1"].rider2
        }
      }

      tournament[position] = {
        ...tournament[position], ["1"]: {
          type: 'third',
          rider1: third1,
          rider2: third2,
          winner: third1 === third2 ? third1 : { rider1: 0, rider2: 0, winner: { name: 'third place' } }
        }
      }
      // console.log(tournament[(position)]);
      return tournament
    }

    return this.recursiveBuildBrackets(tournament, ++position)
  }

  async createBracketScore({ request, response, auth, params }) {
    const { trial_id } = params
    try {
      const oldBracket = await Bracket.findByOrFail({ trial_id })
      if (oldBracket) {
        await oldBracket.delete()
      }
    } catch (error) {
      console.log('oldBracket not found');
    }

    let tournament = {
      "0": {}
    }
    // "tournament": {
    //   "0": {
    //     "0": {
    //       "rider_1": "42",
    //       "rider_2": "54",
    //       "winner": "false"
    //     },
    //     "1": {
    //       "rider_1": "32",
    //       "rider_2": "14",
    //       "winner": "false"
    //     }
    //   }
    // }

    const trial = await Trial.findOrFail(trial_id)
    const event = await trial.event().fetch()
    let riders = await event.riders().fetch()
    riders = await riders.toJSON()
    for (let i = 0; i < riders.length / 2; i++) {
      tournament["0"][i.toString()] = {
        type: 'single',
        rider1: riders[i],
        rider2: riders[(riders.length - 1 - i)],
        winner: riders[(riders.length - 1 - i)].id === riders[i].id ? riders[i] : 0,
      }
    }
    if (Object.keys(tournament["0"]).length % 2 !== 0) {
      const lastPos = Object.keys(tournament["0"]).length
      const coupleBeforeLastPos = lastPos - 2
      const repeatedPos = lastPos - 1
      const coupleBeforeLastPosObject = {
        type: 'single',
        rider1: tournament["0"][coupleBeforeLastPos].rider1,
        rider2: tournament["0"][coupleBeforeLastPos].rider1,
        winner: tournament["0"][coupleBeforeLastPos].rider1,
      }
      const newLastRider = {
        type: 'single',
        rider1: tournament["0"][coupleBeforeLastPos].rider2,
        rider2: tournament["0"][coupleBeforeLastPos].rider2,
        winner: tournament["0"][coupleBeforeLastPos].rider2,
      }
      tournament["0"][lastPos] = { ...newLastRider }
      tournament["0"][coupleBeforeLastPos] = { ...coupleBeforeLastPosObject }
      // console.log(Object.keys(tournament["0"]).length, Object.keys(tournament["0"]));
      // console.log(lastPos, coupleBeforeLastPosObject, newLastRider);
    }

    function IsPowerOfTwo(num) {
      return (num != 0) && ((num & (num - 1)) == 0);
    }

    function makeItPowerOfTwo(whilePos = 0) {
      const lastPos = Object.keys(tournament["0"]).length
      const newAtWhilePos = {
        type: 'single',
        rider1: tournament["0"][whilePos].rider1,
        rider2: tournament["0"][whilePos].rider1,
        winner: tournament["0"][whilePos].rider1,
      }
      const newLastRider = {
        type: 'single',
        rider1: tournament["0"][whilePos].rider2,
        rider2: tournament["0"][whilePos].rider2,
        winner: tournament["0"][whilePos].rider2,
      }
      tournament["0"][lastPos.toString()] = { ...newLastRider }
      tournament["0"][whilePos] = { ...newAtWhilePos }
      if (IsPowerOfTwo(Object.keys(tournament["0"]).length)) {
        return whilePos
      }
      return makeItPowerOfTwo(whilePos + 1)
    }

    if (!IsPowerOfTwo(Object.keys(tournament["0"]).length)) {
      makeItPowerOfTwo(0)
    }

    // console.log(Object.keys(tournament["0"]).length);


    let bracket = await Bracket.create({ trial_id, tournament: await this.recursiveBuildBrackets(tournament) })
    bracket = bracket.toJSON()
    return {
      "r_length": riders.length,
      "0length": Object.keys(bracket.tournament["0"]).length || 0,
      "1length": Object.keys(bracket.tournament["1"]).length || 0,
      bracket
    }
    // return { riders1: riders.slice(0, riders.length / 2), riders2: riders.slice(riders.length / 2, riders.length) }
    // return { tournament, t: await this.recursiveBuildBrackets(tournament) }
    // return await this.recursiveBuildBrackets(tournament)
  }

  async updateBracketScore({ request, response, auth, params }) {
    const { trial_id, tournament_group, group_pair } = params
    const data = request.only([
      'winner',
    ]);
    const trial = await Trial.findOrFail(trial_id)
    const event = await trial.event().fetch()
    let winner = await event.riders().where({ "riders.id": data.winner }).first()
    winner = winner.toJSON()
    const bracket = await Bracket.findByOrFail({ trial_id })
    const tempTournament = { ...await bracket.tournament }
    tempTournament[tournament_group][group_pair].winner = winner || 0
    // console.log(tempTournament[tournament_group][group_pair], tournament_group);
    bracket.tournament = {} // fix not updating
    await bracket.save() // fix not updating
    bracket.tournament = await this.recursiveBuildBrackets({ ...tempTournament }, Number(tournament_group) + 1)
    await bracket.save()
    return await Bracket.findByOrFail({ trial_id })
  }

  async manualUpdateBracketScore({ request, response, auth }) {
    const data = request.only([
      'trial_id',
      'tournament',
      'tournament_position',
    ]);
    const bracket = await Bracket.findByOrFail({ trial_id: data.trial_id })
    const tempTournament = { ...await bracket.tournament }
    tempTournament[data.tournament_position] = { ...tempTournament[data.tournament_position], ...data.tournament }
    bracket.tournament = tempTournament
    await bracket.save()
    return await bracket.toJSON()
  }

  async deleteTrial({ request, response, auth, params }) {
    const { trial_id } = params
    const trial = await Trial.findOrFail(trial_id)
    trial.active = false;
    await trial.save()
    return trial
  }

  async createTrial({ request, response, auth }) {
    const data = request.only([
      'name',
      'inverted',
      'event_id',
      'bonuses',
      'penalties',
    ]);

    let res = await Trial.create({ name: data.name, inverted: data.inverted, event_id: data.event_id })

    let pens = []

    for (let penalty of data.penalties) {
      pens.push(await PenaltyConf.create({ ...penalty, trial_id: res.id }))
    }

    let bons = []

    for (let bonus of data.bonuses) {
      bons.push(await BonusConf.create({ ...bonus, trial_id: res.id }))
    }

    res = res.toJSON()

    return response.json({ ...res, penalties: [...pens], bonuses: [...bons] })
  }

  async createTrialBool({ request, response, auth }) {
    const data = request.only([
      'name',
      'event_id',
    ]);

    let res = await Trial.create({ name: data.name, type: 'boolean', event_id: data.event_id })

    res = res.toJSON()

    return response.json(res)
  }

  async createTrialBracket({ request, response, auth }) {
    const data = request.only([
      'name',
      'event_id',
    ]);

    let res = await Trial.create({ name: data.name, type: 'bracket', event_id: data.event_id })

    res = res.toJSON()

    return response.json(res)
  }

}

module.exports = ManageEventController
