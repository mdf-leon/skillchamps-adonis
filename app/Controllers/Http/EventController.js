'use strict'

const User = use('App/Models/User')
const Rider = use('App/Models/Rider')
const Institute = use('App/Models/Institute')
const Entity = use('App/Models/Entity')
const Event = use('App/Models/Event')
const Image = use('App/Models/Image')
const Trial = use('App/Models/Trial')
const PenaltyConf = use('App/Models/PenaltyConf')
const History = use('App/Models/History')
const Notification = use('App/Models/Notification')
const Score = use('App/Models/Score')
const Penalty = use('App/Models/Penalty')
//const EntityTag = use('App/Models/EntityTag')
const Database = use('Database')
var { Duration } = require('luxon');
const fs = require('fs');

class EventController {

  async image({ request, response, params }) {
    const { id } = params
    response.header('Content-Type', 'image/png')
    // response.header('Content-Length', 'img.length')
    return response.type('image/png').send(Buffer.from((await Image.findOrFail(id)).b64, 'base64'))
  }

  async imageB64({ request, response, params }) {
    const { id } = params
    return `data:image/png;base64, ` + (await Image.findOrFail(id)).b64
  }

  async eventsSigned({ request, response, auth }) {
    const parameters = request.get()
    let user = await auth.getUser()

    let q = Event.query()
    q = q.where('date_begin', '>=', new Date())
    if (parameters.event_id) q = q.where('id', parameters.event_id)
    q = q.whereHas('riders', b => { b.where('user_id', user.id) }) // apenas eventos deste rider logado
      .with('institute') // inclui informaçoes do instituto de cada evento
    return await parameters.event_id ? q.first() : q.fetch()
  }

  // exports.getProductsByTenant = async function (tenantName, limit, offset, search = undefined) {
  //   var queryBuilder = knex
  //     .limit(limit)
  //     .offset(offset)
  //     .select('*')
  //     .from(`${tenantName}.zap_product`)
  //   if (search) {
  //     queryBuilder.orWhere('name', 'LIKE', `%${search}%`)
  //     queryBuilder.orWhere('brand', 'LIKE', `%${search}%`)
  //     queryBuilder.orWhere('style', 'LIKE', `%${search}%`)
  //   }
  //   queryBuilder.where('active', true)
  //     .orderBy('crated', 'desc').orderBy('id', 'desc')
  //   var data = await queryBuilder
  //   return data;
  // }

  async events({ request, response, auth }) {
    const qparams = request.get()
    let dbquery = Database.table('events')

    if (qparams.event_id) {
      dbquery = dbquery.where({ id: qparams.event_id }).first()
    }
    if (qparams.event_name) {
      // TODO: testar: https://forum.adonisjs.com/t/query-for-searching-word-in-column/1178
      // https://stackoverflow.com/questions/44185803/adonis-js-search-queries
      // old: dbquery = dbquery.where({ event_name: qparams.event_name })
      dbquery = dbquery.where('event_name', 'LIKE', '%' + qparams.event_name + '%')
    }
    if (qparams.date_begin) {
      dbquery = dbquery.where({ date_begin: qparams.date_begin })
    }
    if (qparams.institute_id) {
      dbquery = dbquery.where({ institute_id: qparams.institute_id })
    }


    const queryResult = await dbquery.orderBy(qparams.column || 'date_begin', qparams.order_by || 'desc')
    if (queryResult[0]) {
      for (const event of queryResult) {
        const institute = await Institute.findOrFail(event.institute_id)
        event.institute_name = institute.name
      }
    }
    return queryResult
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

  async allRanking(events_request) {

    const total_events = []
    let riders_points = {}
    let r_p_final = []
    for (const even of events_request) {
      let event = await Event.query()
        .with('riders.scores.trial')
        .with('riders.scores.penalties')
        .with('riders.scores.bonuses')
        .where({ id: even.event_id })
        .first()

      event.category_chosen = even.category
      event.category2_chosen = even.category2
      event = event.toJSON()

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

      event.riders.sort(this.sortLessTime)
      event.trial_name = event.riders[0].scores.trial.name
      if (event.riders[0].scores.trial.inverted) {
        event.riders.reverse();
      }

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
        event.riders[i].treated_time_total = this.msToDefault(event.riders[i].scores ? event.riders[i].scores.time_total : 0)
        event.riders[i].treated_time = this.msToDefault(event.riders[i].scores ? event.riders[i].scores.time : 0)
        // console.log(event.riders[i].id);

        if (event.riders[i].scores && points[i]) {
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


  async finishEvent({ request, response, auth, params }) {
    const { event_id } = params
    const history = await History.findByOrFail({ event_id })
    if (!history || !history.config) { // TODO: testar / aqui era && antes, n sei se deveria continuar sendo 
      return response.status(400).json({ error: 'cannot make history without "allRanking", please create a config file' })
    }
    const allRanks = await this.allRanking(JSON.parse(history.config))

    const finalists = []
    await allRanks.r_p_final.forEach((position, i) => {
      position.podium = i + 1
      finalists.push(position)
    })

    history.podium = JSON.stringify(finalists)
    await history.save()
    return history
  }

  async eventsHistory({ request, response, auth }) {
    let user = await auth.getUser()

    let rider = await user.rider().fetch()
    let scores = (await rider.scores().with(`trial.event.history`).fetch()).toJSON()

    let queryArray = []

    for (const score of scores) {
      const podium = JSON.parse(score.trial.event.history.podium).find(pod => pod.id === rider.id)

      const queryObject = {
        event_id: score.trial.event.id,
        event_name: score.trial.event.id,
        institute_name: (await Institute.findOrFail(score.trial.event.institute_id)).toJSON().name,
        photo_event: score.trial.event.photo_event,
        history: score.trial.event.history,
        podium_placement: podium,
      }
      queryArray.push(queryObject)
    }
    return queryArray
  }

  async eventsList({ request, response, auth }) {
    let events = await Event.all()

    const query = request.get()

    if (!query.column || !query.value) {
      events = await Event.query()
        .paginate(query.page, query.limit)
      return response.send(events)
    }

    events = await Event.query()
      .where(query.column, 'LIKE', '%' + query.value + '%')
      .paginate(query.page, query.limit)
    return response.send(events)
  }

  async uncontrolledRegister({ request, response }) {
    const { rdata, parameters } = await request.only(['rdata', 'parameters']);
    const event = await Event.find(parameters.event_id)
    const rider = await Rider.create(rdata);
    if (!parameters.event_id) response.status(400).json('parameters.event_id is missing')
    if (!event || !rider) return response.status(500).json({ error: 'event not found or rider could not be created' })
    await event.riders().attach(rider.id)

    return response.json({ rider, event });
  }

  async signToEvent({ request, response, auth }) {

    const data = request.only(['rider_id', 'event_id']);
    // return response.send(request.only('event_id'))
    await Database.transaction(async (trx) => {
      const rider = await Rider.findOrFail(data.rider_id)

      const user = await auth.getUser()
      // const institute = await user.institute().fetch()
      // const event = await institute.events().where('id', data.event_id).first()
      const event = await Event.findOrFail(data.event_id)

      //const event = await Event.find(2)
      if (await event.riders().where('rider_id', data.rider_id).first()) {
        return response.status(401).json({ Error: "Ja existe" })
      } else {
        await event.riders().attach(data.rider_id)
        return response.json(rider)
      }

      //await event.riders().attach(data.rider_id)
      return response.json(rider)
    }).catch((e) => {
      // console.log(e)
      return response.status(401).json({
        Error: e, ErrorSQL: e.sqlMessage,
        ErrorMSG: "Provavelmente o Rider não existe."
      })
    })

  }

  async unsignToEvent({ request, response, auth }) {
    const data = request.only(['rider_id', 'event_id']);
    const rider = await Rider.findOrFail(data.rider_id)

    const user = await auth.getUser()
    // const institute = await user.institute().fetch()
    // const event = await institute.events().where('id', data.event_id).first()
    const event = await Event.findOrFail(data.event_id)

    //const event = await Event.find(2)
    if (!await event.riders().where('rider_id', data.rider_id).first()) {
      return response.status(404).json({ Error: "Não existe" })
    } else {
      await event.riders().detach([data.rider_id])
      return response.json(rider)
    }
  }

  // async showEvent({ request, response, auth }) { // legacy
  //   let user = await auth.getUser()
  //   let institute = await user.institute().fetch()
  //   let events = await institute.events().fetch()
  //   // console.log(events)
  //   return response.send(events)
  // }

  async showEvent({ request, response, auth }) {
    const { event_id } = request.get()
    return Event.findOrFail(event_id)
  }

  async createEvent({ request, response, auth }) {
    const eventData = request.only([
      'event_name', //event name
      'date_begin',
      'date_begin',
      //'date_end',
    ]);

    //const event = {}

    await Database.transaction(async (trx) => {

      const user = await auth.getUser()
      const institute = await user.institute().fetch()
      console.log(institute.id)
      const event = await Event.create({ ...eventData, institute_id: institute.id })

      return response.json(event)

    }).catch((e) => {
      console.log(eventData)
      return response.status(401).json({ Error: e.sqlMessage })
    })


  }

  async createEvent2({ request, response, auth }) {
    const photo_event = request.file('photo_event')
    const photo_folder = request.file('photo_folder')
    const eventData = request.only([
      'event_name', //event name
      'date_begin',
      'longtext',
    ]);

    const photo_event_entity = photo_event && await Image.create({ b64: fs.readFileSync(photo_event.tmpPath, { encoding: 'base64' }) })
    const photo_folder_entity = photo_folder && await Image.create({ b64: fs.readFileSync(photo_folder.tmpPath, { encoding: 'base64' }) })

    const user = await auth.getUser()
    const institute = await user.institute().fetch()
    const event = await Event.create({ ...eventData, institute_id: institute.id })
    if (photo_event_entity)
      event.photo_event = photo_event_entity.id
    if (photo_folder_entity)
      event.photo_folder = photo_folder_entity.id
    await event.save()

    await user.eventsOnManagement().attach(event.id)

    await Notification.create({
      type: 'created',
      subject: 'event',
      title: `${institute.name} created an event`,
      message: `The event: "${eventData.event_name}" is now accessible to administration.`,
      user_id: user.id,
      event_id: event.id,
      institute_id: institute.id
    })

    return response.json(event)
  }

  async updateEvent({ request, response, auth, params }) {
    const { event_id } = params
    const photo_event = request.file('photo_event')
    const photo_folder = request.file('photo_folder')
    let photo_event_entity
    if (photo_event && photo_event.tmpPath)
      photo_event_entity = await Image.create({ b64: photo_event && fs.readFileSync(photo_event.tmpPath, { encoding: 'base64' }) })
    let photo_folder_entity
    if (photo_folder && photo_folder.tmpPath)
      photo_folder_entity = await Image.create({ b64: photo_folder && fs.readFileSync(photo_folder.tmpPath, { encoding: 'base64' }) })
    const eventData = request.only([
      'event_name', //event name
      'date_begin',
      'longtext',
    ]);

    const event = await Event.findOrFail(event_id)

    event.event_name = eventData.event_name
    event.date_begin = eventData.date_begin
    event.longtext = eventData.longtext
    if (photo_event_entity && photo_event_entity.id)
      event.photo_event = photo_event_entity.id
    if (photo_folder_entity && photo_folder_entity.id)
      event.photo_folder = photo_folder_entity.id
    await event.save()

    return response.json(event)
  }

  async uploadEventPhoto({ request, response, params, auth }) {
    const photo_event = request.file('photo_event')
    const photo_folder = request.file('photo_folder')

    const photo_event_entity = await Image.create({ b64: photo_event && fs.readFileSync(photo_event.tmpPath, { encoding: 'base64' }) })
    const photo_folder_entity = await Image.create({ b64: photo_folder && fs.readFileSync(photo_folder.tmpPath, { encoding: 'base64' }) })

    const event = await Event.findOrFail(params.event_id)
    event.photo_event = photo_event_entity.id
    event.photo_folder = photo_folder_entity.id
    await event.save()
    return await { photo_event, photo_folder }
  }


}

module.exports = EventController
