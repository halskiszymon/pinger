import {Model} from 'objection';
import User from "./User.js";

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
      }
    };
  }
}

export default Monitor;