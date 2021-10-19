"use strict";

const User = use("App/Models/User");
const Rider = use("App/Models/Rider");
const Institute = use("App/Models/Institute");
const Entity = use("App/Models/Entity");
const Event = use("App/Models/Event");
const Trial = use("App/Models/Trial");
const PenaltyConf = use("App/Models/PenaltyConf");
const BonusConf = use("App/Models/BonusConf");
const Score = use("App/Models/Score");
const Penalty = use("App/Models/Penalty");
const Bonus = use("App/Models/Bonus");
//const EntityTag = use('App/Models/EntityTag')
const Database = use("Database");
var _ = require("lodash");

class ScoreController {
  async show({ request, response, auth, params }) {
    let qsearch = { id: params.id };
    if (params.id == "new")
      qsearch = { trial_id: request.trial_id, rider_id: request.rider_id }; // remover esta gambi
    let score = await Score.query()
      .where(qsearch)
      .with("penalties.penaltyConf")
      .with("bonuses.bonusConf")
      .first();
    if (!score) {
      return response.status(400).json({ bad_request: "Score nao existe" });
    }
    return score.toJSON();
  }

  async destroy({ request, response, auth, params }) {
    let old = await Score.query()
      .where({ id: params.id })
      .with("penalties")
      .with("bonuses")
      .first();
    if (old) {
      for (let penalty of old.toJSON().penalties) {
        const pen = await Penalty.findOrFail(penalty.id);
        await pen.delete();
      }
      for (let bonus of old.toJSON().bonuses) {
        const bon = await Bonus.findOrFail(bonus.id);
        await bon.delete();
      }
      await old.delete();
    } else {
      return response
        .status(400)
        .json({ not_found: "could not found this score in DB" });
    }
    return response.json({ deleted: "successfully" });
  }

  async index({ request, response, auth, params }) {
    const { trial_id, rider_id } = request.get();
    let whereQuery = { trial_id };
    let score;
    if (trial_id || rider_id) {
      score = await Score.query()
        .where(whereQuery)
        .with("penalties.penaltyConf")
        .with("bonuses.bonusConf")
        .fetch();
    } else {
      score = await Score.query()
        .with("penalties.penaltyConf")
        .with("bonuses.bonusConf")
        .fetch();
    }

    if (!score) {
      return response.status(400).json({ bad_request: "Score nao existe" });
    }
    return score.toJSON();
  }

  async store({ request, response, auth }) {
    // to create a score
    const data = request.only([
      "rider_id",
      "trial_id",
      "penalties",
      "bonuses",
      "time",
    ]);
    //um rider so pode receber a pontuaçao se o gerente estiver dando pontuaçao a um rider inscrito em seu evento
    const rider = await Rider.query()
      .where("id", "=", data.rider_id)
      .with("events")
      .first();
    if (!rider)
      return response
        .status(400)
        .json({ bad_request: "este rider nao existe" });

    const trial = await Trial.query()
      .where("id", "=", data.trial_id)
      .with("event")
      .first(); // trial.toJSON().event.id
    if (!trial)
      return response
        .status(400)
        .json({ bad_request: "este trial nao existe" });

    //que essa linha significa que este rider esta inscrito neste evento
    const event = await rider
      .events()
      .where("events.id", "=", trial.toJSON().event.id)
      .first();
    if (!event)
      return response
        .status(400)
        .json({ bad_request: "este rider esta inscrito neste evento?" });

    let old = await Score.query()
      .where({ rider_id: data.rider_id, trial_id: data.trial_id })
      .with("penalties")
      .with("bonuses")
      .first();
    if (old) {
      return response.status(400).json({ bad_request: "Ja existe um score" });
    }
    let res = await Score.create({
      rider_id: data.rider_id,
      trial_id: data.trial_id,
      time: data.time,
    });

    let pens = [];
    let penaltyTime = 0;

    for (let penalty of data.penalties) {
      pens.push(await Penalty.create({ ...penalty, score_id: res.id }));
      const pc = await PenaltyConf.findOrFail(penalty.penalty_conf_id);
      penaltyTime += (penalty.quantity || 0) * pc.time_penalty;
    }

    let bons = [];
    let bonusTime = 0;

    for (let bonus of data.bonuses) {
      bons.push(await Bonus.create({ ...bonus, score_id: res.id }));
      const bc = await BonusConf.findOrFail(bonus.bonus_conf_id);
      bonusTime += (bonus.quantity || 0) * bc.time_bonus;
    }

    res.time_total = Number(res.time) + Number(penaltyTime) - Number(bonusTime);
    await res.save();

    res = res.toJSON();
    return response.json({
      ...res,
      penaltyTime,
      bonusTime,
      penalties: [...pens],
      bonuses: [...bons],
    });
  }

  async update({ request, response, auth, params }) {
    const data = request.only([
      "rider_id",
      "trial_id",
      "penalties",
      "bonuses",
      "time",
    ]);
    //um rider so pode receber a pontuaçao se o gerente estiver dando pontuaçao a um rider inscrito em seu evento
    const rider = await Rider.query()
      .where("id", "=", data.rider_id)
      .with("events")
      .first();
    if (!rider)
      return response
        .status(400)
        .json({ bad_request: "este rider nao existe" });

    const trial = await Trial.query()
      .where("id", "=", data.trial_id)
      .with("event")
      .first(); // trial.toJSON().event.id
    if (!trial)
      return response
        .status(400)
        .json({ bad_request: "este trial nao existe" });

    //que essa linha significa que este rider esta inscrito neste evento
    const event = await rider
      .events()
      .where("events.id", "=", trial.toJSON().event.id)
      .first();
    if (!event)
      return response
        .status(400)
        .json({ bad_request: "este rider esta inscrito neste evento?" });

    let old = await Score.query()
      .where({ rider_id: data.rider_id, trial_id: data.trial_id })
      .with("penalties")
      .with("bonuses")
      .first();
    if (old) {
      for (let penalty of old.toJSON().penalties) {
        const pen = await Penalty.findOrFail(penalty.id);
        await pen.delete();
      }
      for (let bonus of old.toJSON().bonuses) {
        const bon = await Bonus.findOrFail(bonus.id);
        await bon.delete();
      }
      await old.delete();
    }
    let res = await Score.create({
      rider_id: data.rider_id,
      trial_id: data.trial_id,
      time: data.time,
    });

    let pens = [];
    let penaltyTime = 0;

    for (let penalty of data.penalties) {
      pens.push(await Penalty.create({ ...penalty, score_id: res.id }));
      const pc = await PenaltyConf.findOrFail(penalty.penalty_conf_id);
      penaltyTime += (penalty.quantity || 0) * pc.time_penalty;
    }

    let bons = [];
    let bonusTime = 0;

    for (let bonus of data.bonuses) {
      bons.push(await Bonus.create({ ...bonus, score_id: res.id }));
      const bc = await BonusConf.findOrFail(bonus.bonus_conf_id);
      bonusTime += (bonus.quantity || 0) * bc.time_bonus;
    }

    res.time_total = Number(res.time) + Number(penaltyTime) - Number(bonusTime);
    await res.save();

    res = res.toJSON();
    return response.json({
      updated: true,
      ...res,
      penaltyTime,
      bonusTime,
      penalties: [...pens],
      bonuses: [...bons],
    });
  }

  async replace({ request, response, auth }) {
    const data = request.only([
      "rider_id",
      "trial_id",
      "penalties",
      "bonuses",
      "time",
    ]);
    //um rider so pode receber a pontuaçao se o gerente estiver dando pontuaçao a um rider inscrito em seu evento
    const rider = await Rider.query()
      .where("id", "=", data.rider_id)
      .with("events")
      .first();
    if (!rider)
      return response
        .status(400)
        .json({ bad_request: "este rider nao existe" });

    const trial = await Trial.query()
      .where("id", "=", data.trial_id)
      .with("event")
      .first(); // trial.toJSON().event.id
    if (!trial)
      return response
        .status(400)
        .json({ bad_request: "este trial nao existe" });

    //que essa linha significa que este rider esta inscrito neste evento
    const event = await rider
      .events()
      .where("events.id", "=", trial.toJSON().event.id)
      .first();
    if (!event)
      return response
        .status(400)
        .json({ bad_request: "este rider esta inscrito neste evento?" });

    let old = await Score.query()
      .where({ rider_id: data.rider_id, trial_id: data.trial_id })
      .with("penalties")
      .with("bonuses")
      .first();
    if (old) {
      for (let penalty of old.toJSON().penalties) {
        const pen = await Penalty.findOrFail(penalty.id);
        await pen.delete();
      }
      for (let bonus of old.toJSON().bonuses) {
        const bon = await Bonus.findOrFail(bonus.id);
        await bon.delete();
      }
      await old.delete();
    }
    let res = await Score.create({
      rider_id: data.rider_id,
      trial_id: data.trial_id,
      time: data.time,
    });

    let pens = [];
    let penaltyTime = 0;

    for (let penalty of data.penalties) {
      pens.push(await Penalty.create({ ...penalty, score_id: res.id }));
      const pc = await PenaltyConf.findOrFail(penalty.penalty_conf_id);
      penaltyTime += (penalty.quantity || 0) * pc.time_penalty;
    }

    let bons = [];
    let bonusTime = 0;

    for (let bonus of data.bonuses) {
      bons.push(await Bonus.create({ ...bonus, score_id: res.id }));
      const bc = await BonusConf.findOrFail(bonus.bonus_conf_id);
      bonusTime += (bonus.quantity || 0) * bc.time_bonus;
    }

    res.time_total = Number(res.time) + Number(penaltyTime) - Number(bonusTime);
    await res.save();

    res = res.toJSON();
    return response.json({
      updated: true,
      ...res,
      penaltyTime,
      bonusTime,
      penalties: [...pens],
      bonuses: [...bons],
    });
  }
}

module.exports = ScoreController;
