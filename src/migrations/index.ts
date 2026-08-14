import * as migration_20260723_102158_postgres_initial from './20260723_102158_postgres_initial'
import * as migration_20260723_110659_remove_portfolio_actions from './20260723_110659_remove_portfolio_actions'
import * as migration_20260723_113924_add_mcp_write_permissions from './20260723_113924_add_mcp_write_permissions'
import * as migration_20260723_115619_seo_fields from './20260723_115619_seo_fields'
import * as migration_20260814_075947_oss_contributions from './20260814_075947_oss_contributions'
import * as migration_20260814_092312_tracked_repository_sync from './20260814_092312_tracked_repository_sync'

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
    name: '20260723_113924_add_mcp_write_permissions',
  },
  {
    up: migration_20260723_115619_seo_fields.up,
    down: migration_20260723_115619_seo_fields.down,
    name: '20260723_115619_seo_fields',
  },
  {
    up: migration_20260814_075947_oss_contributions.up,
    down: migration_20260814_075947_oss_contributions.down,
    name: '20260814_075947_oss_contributions',
  },
  {
    up: migration_20260814_092312_tracked_repository_sync.up,
    down: migration_20260814_092312_tracked_repository_sync.down,
    name: '20260814_092312_tracked_repository_sync',
  },
]
