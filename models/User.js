import {Model} from 'objection';
import Monitor from './Monitor.js';

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get virtualAttributes() {
    return [
      'id',

      'displayName',
      'email',
      'password',

      'createdAt',
      'updatedAt'
    ];
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['displayName', 'email', 'password'],
      properties: {
        displayName: {
          type: 'string',
          minLength: 5,
          maxLength: 40
        },
        email: {type: 'string'},
        password: {type: 'string'}
      }
    };
  }

  static get relationMappings() {
    return {
      servers: {
        relation: Model.HasManyRelation,
        modelClass: Monitor,
        join: {
          from: 'users.id',
          to: 'monitors.userId'
        }
      }
    };
  }
}

export default User;