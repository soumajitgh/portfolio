import * as migration_20260723_102158_postgres_initial from './20260723_102158_postgres_initial';
import * as migration_20260723_110659_remove_portfolio_actions from './20260723_110659_remove_portfolio_actions';

export const migrations = [
  {
    up: migration_20260723_102158_postgres_initial.up,
    down: migration_20260723_102158_postgres_initial.down,
    name: '20260723_102158_postgres_initial',
  },
  {
    up: migration_20260723_110659_remove_portfolio_actions.up,
    down: migration_20260723_110659_remove_portfolio_actions.down,
    name: '20260723_110659_remove_portfolio_actions'
  },
];
