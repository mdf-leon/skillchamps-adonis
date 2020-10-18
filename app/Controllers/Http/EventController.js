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

class EventController {

  async eventsSigned({ request, response, auth }) {
    const par = request.get()
    let user = await auth.getUser()

    let q = Event.query()
    if (par.event_id) q = q.where('id', par.event_id)
    q = q.whereHas('riders', b => { b.where('user_id', user.id) }) // apenas eventos deste rider logado
      .with('institute') // inclui informaçoes do instituto de cada evento
    return await par.event_id ? q.first() : q.fetch()
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
    if (!event || !rider) return response.status(500).json({error: 'event not found or rider could not be created'})
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

  async showEvent({ request, response, auth }) {
    let user = await auth.getUser()
    let institute = await user.institute().fetch()
    let events = await institute.events().fetch()
    // console.log(events)
    return response.send(events)
  }

  async createEvent({ request, response, auth }) {
    const eventData = request.only([
      'event_name', //event name
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
}

module.exports = EventController
