import {Model} from 'objection';
import User from "./User.js";
import MonitorLog from "./MonitorLog.js";

class Monitor extends Model {
  static get tableName() {
    return 'monitors';
  }

  static get virtualAttributes() {
    return [
      'id',

      'type',
      'name',
      'address',
      'interval',
      'status',
      'notifyEmailAddresses',
      'userId',

      'createdAt',
      'updatedAt'
    ];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type', 'name', 'address', 'interval', 'notifyEmailAddresses', 'userId'],
      properties: {
        type: {type: 'string'}, // http or ping
        name: {type: 'string'},
        address: {type: 'string'},
        interval: {type: 'integer'},
        notifyEmailAddresses: {type: 'string'},
        userId: {type: 'integer'},
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'monitors.userId',
          to: 'users.id'
        }
      },
      logs: {
        relation: Model.HasManyRelation,
        modelClass: MonitorLog,
        join: {
          from: 'monitors.id',
          to: 'monitorLogs.monitorId'
        }
      }
    };
  }

  get status() {
    return this.$lastLog ? this.$lastLog.status : null;
  }

  async $afterFind(queryContext) {
    await super.$afterFind(queryContext);

    const lastLog = await MonitorLog.query()
      .where({monitorId: this.id})
      .orderBy('id', 'desc')
      .first();

    this.$lastLog = lastLog;
  }
}

export default Monitor;