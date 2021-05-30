#!/usr/bin/env node

import * as fs from 'fs'
import fetch from 'isomorphic-unfetch'
import arg from 'arg'
import { TypeGenerator } from './TypeGenerator'

const args = arg({
  '--project-id': String,
  '--token': String,
  '--out-file': String,
})

const URL = 'https://us-central1-turnslate.cloudfunctions.net/langs'

async function run() {
  if (!args['--project-id']) {
    throw new Error('missing required argument: --project-id')
  }
  if (!args['--out-file']) {
    throw new Error('missing required argument: --out-file')
  }
  if (!args['--token']) {
    throw new Error('missing required argument: --token')
  }

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectId: args['--project-id'],
      token: args['--token'],
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  const json = await response.json()

  const ftl = json.langs[json.main]
  const langs = Object.entries(json.langs).map(
    ([locale, ftl]) => `'${locale}': \`${ftl}\``,
  )

  const output = [
    `
import { FluentBundle, FluentResource } from '@fluent/bundle'

export interface Lang {
  <K extends keyof LocalizedMessage>(
    id: K,
    ...params: LocalizedMessage[K]
  ): string
}

export function createLang(locale: keyof typeof langs): Lang {
  const bundle = new FluentBundle(locale)
  const resource = new FluentResource(langs[locale])
  bundle.addResource(resource)

  return (id, params) => {
    const message = bundle.getMessage(id)

    if (!message || !message.value) {
      return id
    }

    return bundle.formatPattern(message.value, params)
  }
}
    `.trim(),
    TypeGenerator.fromFTL(ftl),
    `export const langs = {\n  ${langs.join(',\n  ')}\n} as const`,
  ].join('\n\n')

  fs.writeFileSync(args['--out-file'], output)
  console.log(
    `Generated translations for ${Object.keys(json.langs).length} languages`,
  )
}

run().catch((err) => console.log(err))
