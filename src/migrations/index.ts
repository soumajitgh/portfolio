import * as migration_20260723_102158_postgres_initial from './20260723_102158_postgres_initial';

export const migrations = [
  {
    up: migration_20260723_102158_postgres_initial.up,
    down: migration_20260723_102158_postgres_initial.down,
    name: '20260723_102158_postgres_initial'
  },
];
