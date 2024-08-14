import {Model} from 'objection';
import Monitor from "./Monitor.js";

class MonitorLog extends Model {
  static get tableName() {
    return 'monitorLogs';
  }

  static get virtualAttributes() {
    return [
      'id',

      'status',
      'monitorId',

      'createdAt',
      'updatedAt'
    ];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['status', 'monitorId'],
      properties: {
        status: {type: 'boolean'},
        monitorId: {type: 'integer'},
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: Monitor,
        join: {
          from: 'monitorLogs.monitorId',
          to: 'monitors.id'
        }
      }
    };
  }

  $parseDatabaseJson(json) {
    json = super.$parseDatabaseJson(json);

    if (json.status !== undefined) {
      json.status = json.status === 1;
    }

    return json;
  }
}

export default MonitorLog;