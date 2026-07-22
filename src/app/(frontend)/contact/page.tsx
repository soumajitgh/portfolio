import { ArrowUpRight, Globe2, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

import { ContactForm } from '@/components/contact-form'
import { Card } from '@/components/ui/card'
import { getPortfolioSettings } from '@/lib/portfolio-data'

export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: '/contact' },
  description: 'input: start a conversation about backend systems and developer infrastructure.',
  openGraph: {
    description: 'input: start a conversation about backend systems and developer infrastructure.',
    title: 'soumajit in ~/contact',
    type: 'website',
    url: '/contact',
  },
  title: 'soumajit in ~/contact',
}

function SocialIcon({ label, url }: { label: string; url: string }) {
  const provider = `${label} ${url}`.toLowerCase()
  const className = 'size-4 shrink-0'

  if (provider.includes('github')) return <FaGithub aria-hidden="true" className={className} />
  if (provider.includes('linkedin')) return <FaLinkedin aria-hidden="true" className={className} />
  if (provider.includes('twitter') || provider.includes('x.com')) {
    return <FaXTwitter aria-hidden="true" className={className} />
  }
  if (provider.includes('youtube')) return <FaYoutube aria-hidden="true" className={className} />
  if (provider.includes('instagram')) {
    return <FaInstagram aria-hidden="true" className={className} />
  }
  if (provider.includes('facebook')) return <FaFacebook aria-hidden="true" className={className} />
  return <Globe2 aria-hidden="true" className={className} />
}

export default async function ContactPage() {
  const settings = await getPortfolioSettings()
  const contact = settings.contact

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-12 md:py-16">
        <p className="font-mono text-xs text-terminal-green sm:text-sm">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ open ./contact
        </p>
        <h1 className="page-title mt-4 font-semibold">Start a conversation.</h1>
        <p className="page-lede mt-3 max-w-2xl text-muted-foreground sm:mt-4">
          {contact?.intro ||
            'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.'}
        </p>

        <div className="mt-8 grid items-start gap-5 sm:mt-10 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)] lg:gap-6">
          <Card className="gap-0 px-4 py-5 sm:px-6">
            <div className="mb-4 border-b border-border pb-3 font-mono text-[0.6875rem] sm:text-xs">
              <span className="text-terminal-purple">message</span>
              <span className="text-muted-foreground"> = {'{'}</span>
            </div>
            <ContactForm />
            <p className="mt-4 font-mono text-[0.6875rem] text-muted-foreground sm:text-xs">
              {'}'}
            </p>
          </Card>

          <aside className="space-y-5">
            <Card className="gap-3 px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-terminal-cyan">./direct</h2>
              <a
                className="flex min-h-11 items-center gap-3 break-all font-mono text-[0.6875rem] text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs"
                href={`mailto:${contact?.email || 'soumojitghosh02@gmail.com'}`}
              >
                <Mail className="size-4 shrink-0 text-terminal-green" aria-hidden="true" />
                {contact?.email || 'soumojitghosh02@gmail.com'}
              </a>
            </Card>

            <Card className="gap-3 px-4 py-4 sm:px-5">
              <h2 className="text-sm font-semibold text-terminal-cyan">./socials</h2>
              {contact?.socials?.length ? (
                <ul className="space-y-2">
                  {contact.socials.map((social) => (
                    <li key={social.id || social.url}>
                      <a
                        className="flex min-h-11 items-center justify-between rounded-md border border-border px-3 py-2 font-mono text-[0.6875rem] transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs"
                        href={social.url}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <SocialIcon label={social.label} url={social.url} />
                          <span className="truncate">
                            ./{social.label.toLowerCase().replaceAll(' ', '-')}
                          </span>
                        </span>
                        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-[0.6875rem] text-muted-foreground sm:text-xs">
                  output: no social links configured
                </p>
              )}
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
