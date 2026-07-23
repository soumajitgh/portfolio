import * as migration_20260723_102158_postgres_initial from './20260723_102158_postgres_initial';
import * as migration_20260723_110659_remove_portfolio_actions from './20260723_110659_remove_portfolio_actions';
import * as migration_20260723_113924_add_mcp_write_permissions from './20260723_113924_add_mcp_write_permissions';

export const migrations = [
  {
    up: migration_20260723_102158_postgres_initial.up,
    down: migration_20260723_102158_postgres_initial.down,
    name: '20260723_102158_postgres_initial',
  },
  {
    up: migration_20260723_110659_remove_portfolio_actions.up,
    down: migration_20260723_110659_remove_portfolio_actions.down,
    name: '20260723_110659_remove_portfolio_actions',
  },
  {
    up: migration_20260723_113924_add_mcp_write_permissions.up,
    down: migration_20260723_113924_add_mcp_write_permissions.down,
    name: '20260723_113924_add_mcp_write_permissions'
  },
];
