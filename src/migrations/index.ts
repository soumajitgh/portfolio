import * as migration_20260722_155641_portfolio_foundation from './20260722_155641_portfolio_foundation'

export const migrations = [
  {
    up: migration_20260722_155641_portfolio_foundation.up,
    down: migration_20260722_155641_portfolio_foundation.down,
    name: '20260722_155641_portfolio_foundation',
  },
]
