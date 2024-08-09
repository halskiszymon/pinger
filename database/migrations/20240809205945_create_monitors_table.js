/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('monitors', table => {
    table.increments('id');
    table.string('type').notNullable();
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.integer('interval').notNullable();
    table.integer('userId').unsigned().references('users.id').onDelete('CASCADE');
    table.timestamps(true, true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('monitors');
};
