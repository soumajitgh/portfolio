import { headers as getHeaders } from 'next/headers.js'
import { ArrowUpRight, Terminal } from 'lucide-react'
import { getPayload } from 'payload'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10 md:py-10">
      <nav className="flex items-center justify-between text-sm">
        <a className="flex items-center gap-2 text-foreground" href="#top">
          <Terminal className="size-4 text-terminal-cyan" aria-hidden="true" />
          <span>soumajit.dev</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-3">
          <Button asChild size="sm" variant="ghost">
            <a href="#work">./work</a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={payloadConfig.routes.admin}>{user ? './dashboard' : './login'}</a>
          </Button>
        </div>
      </nav>

      <section className="flex flex-1 flex-col justify-center py-24 md:py-32" id="top">
        <p className="mb-5 font-mono text-sm text-terminal-green">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ whoami
        </p>
        <h1 className="max-w-4xl font-mono text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-balance md:text-6xl">
          Backend systems built to scale.
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          I design APIs, distributed systems, and developer infrastructure with an emphasis on
          reliability, clarity, and long-term maintainability.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild>
            <a href="#work">
              ./view-projects <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="#work">./explore-stack</a>
          </Button>
        </div>
      </section>

      <section className="pb-20" id="work">
        <div className="mb-6 flex items-center gap-3 font-mono text-sm">
          <span className="text-terminal-purple">const</span>
          <h2 className="text-base font-medium tracking-normal text-foreground">selectedWork</h2>
          <span className="text-terminal-cyan">=</span>
          <span className="text-muted-foreground">[</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-3 flex items-center justify-between font-mono text-xs text-terminal-yellow">
                <span>01 / INFRASTRUCTURE</span>
                <span className="text-terminal-green">● available</span>
              </div>
              <CardTitle>Distributed API platform</CardTitle>
              <CardDescription>
                A fault-tolerant service layer designed for predictable performance under load.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {['TypeScript', 'PostgreSQL', 'Redis'].map((technology) => (
                <Badge className="text-terminal-purple" key={technology} variant="outline">
                  {technology}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="mb-3 flex items-center justify-between font-mono text-xs text-terminal-yellow">
                <span>02 / DEVELOPER TOOLS</span>
                <span className="text-terminal-cyan">2026</span>
              </div>
              <CardTitle>Observability toolkit</CardTitle>
              <CardDescription>
                Structured traces, metrics, and logs that make production behavior easy to reason
                about.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {['OpenTelemetry', 'Go', 'ClickHouse'].map((technology) => (
                <Badge className="text-terminal-purple" key={technology} variant="outline">
                  {technology}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
        <p className="mt-6 font-mono text-sm text-muted-foreground">]</p>
      </section>
    </div>
  )
}
