#!/usr/bin/env node

import * as fs from 'fs'
import { Message, parse } from '@fluent/syntax'
import fetch from 'isomorphic-unfetch'
import arg from 'arg'

import { parseElements } from './parser'

const args = arg({
  '--project-id': String,
  '--token': String,
  '--out-file': String,
})

const URL =
  'https://us-central1-turnslate.cloudfunctions.net/getEntriesForProject'

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

  const tab = '  '

  const ftls = Object.keys(json.langs).map((langAlias) => {
    const ftl: string[] = []

    for (const entry of json.entries) {
      const translationForLang = entry.translations[langAlias]
      if (!translationForLang) {
        console.log(
          `Entry ${entry.id} – Can't find translation for ${json.langs[langAlias]}, id would be used`,
        )
      }
      const translation = translationForLang || entry.id
      ftl.push(
        [
          `${entry.id} =`,
          `${tab}${translation.split('\n').join('\n' + tab)}`,
        ].join('\n'),
      )
    }

    return {
      lang: langAlias,
      ftl: ftl.join('\n\n'),
    }
  })

  const defaultFtl = ftls[0]
  const localizationConfigOutput = [
    `export const localizationConfig = {`,
    `\t${ftls.map(({ lang, ftl }) => `${lang}:\n\`${ftl}\``).join(',\n\t')}`,
    `} as const`,
  ].join('\n')

  if (!defaultFtl) {
    throw new Error('Not found default language translation')
  }
  const generatedTypes = generateTypesFromFtl(defaultFtl.ftl)
  const output = generatedTypes + '\n\n' + localizationConfigOutput

  fs.writeFileSync(args['--out-file'], output)
  console.log(
    `Generated translations for ${Object.keys(json.langs).length} languages`,
  )
}

function generateTypesFromFtl(string: string) {
  const astResult = parse(string, { withSpans: false })
  let generatedTypes = ''

  for (const messageOrJunk of astResult.body) {
    if (messageOrJunk.type !== 'Message') break

    const messageEntry = messageOrJunk as Message
    const id = messageEntry.id.name
    const comment = messageEntry.comment?.content

    const identifiers = messageEntry.value
      ? Array.from(new Set(parseElements(messageEntry.value.elements)))
      : []

    if (!id) break
    if (comment) generatedTypes = generatedTypes + `\n # ${comment}`
    if (identifiers.length) {
      generatedTypes =
        generatedTypes +
        '\n' +
        `| [
      '${id}',
      {
        ${identifiers.map((identifier) => `${identifier}: string | number \n`)}
      },
    ]`
    } else {
      generatedTypes = generatedTypes + `\n | ['${id}']`
    }
  }

  if (generatedTypes.length === 0) generatedTypes = 'any'

  return 'export type LocalizedMessage = ' + generatedTypes
}

run().catch((err) => console.log(err))
