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
  const projectId = process.env.PROJECT_ID || args['--project-id']
  const outFile = process.env.OUT_FILE || args['--out-file']
  const token = process.env.TOKEN || args['--token']

  if (!projectId) {
    console.error(
      'Missing project id. It can be passed via argument --project-id or env variable PROJECT_ID',
    )
    process.exit(1)
  }
  if (!outFile) {
    console.error(
      'Missing out file. It can be passed via argument --out-file or env variable OUT_FILE',
    )
    process.exit(1)
  }
  if (!token) {
    console.error(
      'Missing api token. It can be passed via argument --token or env variable TOKEN',
    )
    process.exit(1)
  }

  const response = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId, token }),
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

  return (id, ...[params]) => {
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

  fs.writeFileSync(outFile, output)
  console.log(
    `Generated translations for ${Object.keys(json.langs).length} languages`,
  )
}

run().catch((err) => console.log(err))
