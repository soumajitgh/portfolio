import * as migration_20260722_155641_portfolio_foundation from './20260722_155641_portfolio_foundation'
import * as migration_20260722_170503_home_stack_contact_r2 from './20260722_170503_home_stack_contact_r2'
import * as migration_20260722_171124_resume_download from './20260722_171124_resume_download'
import * as migration_20260722_172418_github_issue_blog from './20260722_172418_github_issue_blog'
import * as migration_20260722_173500_update_hero_copy from './20260722_173500_update_hero_copy'
import * as migration_20260722_174500_ensure_blog_issue_counter from './20260722_174500_ensure_blog_issue_counter'
import * as migration_20260722_175229_blog_stars from './20260722_175229_blog_stars'
import * as migration_20260722_175734_home_blog_tab from './20260722_175734_home_blog_tab'

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
  {
    up: migration_20260722_172418_github_issue_blog.up,
    down: migration_20260722_172418_github_issue_blog.down,
    name: '20260722_172418_github_issue_blog',
  },
  {
    up: migration_20260722_173500_update_hero_copy.up,
    down: migration_20260722_173500_update_hero_copy.down,
    name: '20260722_173500_update_hero_copy',
  },
  {
    up: migration_20260722_174500_ensure_blog_issue_counter.up,
    down: migration_20260722_174500_ensure_blog_issue_counter.down,
    name: '20260722_174500_ensure_blog_issue_counter',
  },
  {
    up: migration_20260722_175229_blog_stars.up,
    down: migration_20260722_175229_blog_stars.down,
    name: '20260722_175229_blog_stars',
  },
  {
    up: migration_20260722_175734_home_blog_tab.up,
    down: migration_20260722_175734_home_blog_tab.down,
    name: '20260722_175734_home_blog_tab',
  },
]
