import * as migration_20260722_155641_portfolio_foundation from './20260722_155641_portfolio_foundation'
import * as migration_20260722_170503_home_stack_contact_r2 from './20260722_170503_home_stack_contact_r2'
import * as migration_20260722_171124_resume_download from './20260722_171124_resume_download'

export const migrations = [
  {
    up: migration_20260722_155641_portfolio_foundation.up,
    down: migration_20260722_155641_portfolio_foundation.down,
    name: '20260722_155641_portfolio_foundation',
  },
  {
    up: migration_20260722_170503_home_stack_contact_r2.up,
    down: migration_20260722_170503_home_stack_contact_r2.down,
    name: '20260722_170503_home_stack_contact_r2',
  },
  {
    up: migration_20260722_171124_resume_download.up,
    down: migration_20260722_171124_resume_download.down,
    name: '20260722_171124_resume_download',
  },
]
