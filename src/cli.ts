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

  const { ftl } = json.langs[json.main]

  const output = [
    TypeGenerator.fromFTL(ftl),
    `export const langs = ${JSON.stringify(json.langs, null, 2)} as const`,
  ].join('\n\n')

  fs.writeFileSync(args['--out-file'], output)
  console.log(
    `Generated translations for ${Object.keys(json.langs).length} languages`,
  )
}

run().catch((err) => console.log(err))
