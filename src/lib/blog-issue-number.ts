import { sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'

type CounterResult = {
  rows?: Array<Record<string, unknown>>
}

export const allocateBlogIssueNumber = async (req: PayloadRequest) => {
  const result = (await req.payload.db.drizzle.execute(sql`
    UPDATE blog_issue_counter
    SET value = value + 1
    WHERE id = 1
    RETURNING value
  `)) as CounterResult

  const issueNumber = Number(result.rows?.[0]?.value)

  if (!Number.isSafeInteger(issueNumber) || issueNumber < 1) {
    throw new Error('Unable to allocate a blog issue number.')
  }

  return issueNumber
}
