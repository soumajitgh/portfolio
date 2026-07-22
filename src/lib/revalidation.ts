import { revalidatePath } from 'next/cache'
import { after } from 'next/server'

export function scheduleRevalidation(paths: string[]) {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)))
  if (!uniquePaths.length) return

  after(() => {
    for (const path of uniquePaths) revalidatePath(path)
  })
}
