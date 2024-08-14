/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('monitorLogs', table => {
    table.increments('id');
    table.boolean('status').notNullable();
    table.integer('monitorId').unsigned().references('monitors.id').onDelete('CASCADE');
    table.timestamps(true, true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('monitorLogs');
};
