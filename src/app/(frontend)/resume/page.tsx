import { Download } from 'lucide-react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'

import { ResumePreview } from '@/components/resume-preview'
import { Button } from '@/components/ui/button'
import config from '@/payload.config'
import type { Media } from '@/payload-types'
import { siteName, siteRole } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: '/resume' },
  description: `Preview and download the resume of ${siteName}, a ${siteRole.toLowerCase()}.`,
  title: 'Resume',
}

async function getResume() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'portfolio-settings',
    depth: 1,
    overrideAccess: false,
    select: { resumeFile: true },
  })
  return settings.resumeFile && typeof settings.resumeFile === 'object'
    ? (settings.resumeFile as Media)
    : null
}

export default async function ResumePage() {
  const resume = await getResume()

  return (
    <main className="page-container flex min-h-[calc(100dvh-4rem)] flex-col py-10 sm:py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs text-terminal-green sm:text-sm">
            soumajit@portfolio:<span className="text-terminal-blue">~</span>$ cat resume.pdf
          </p>
          <h1 className="page-title mt-4 font-semibold">Resume</h1>
        </div>
        {resume?.url ? (
          <Button asChild variant="default">
            <a download href="/resume/download">
              ./download <Download aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>

      <div className="mt-8 min-h-0 flex-1">
        {resume?.url ? (
          <ResumePreview url={resume.url} />
        ) : (
          <p className="page-lede text-muted-foreground">Resume is not configured yet.</p>
        )}
      </div>
    </main>
  )
}
