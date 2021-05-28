#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
const arg_1 = __importDefault(require("arg"));
const TypeGenerator_1 = require("./TypeGenerator");
const args = arg_1.default({
    '--project-id': String,
    '--token': String,
    '--out-file': String,
});
const URL = 'https://us-central1-turnslate.cloudfunctions.net/getEntriesForProject';
async function run() {
    if (!args['--project-id']) {
        throw new Error('missing required argument: --project-id');
    }
    if (!args['--out-file']) {
        throw new Error('missing required argument: --out-file');
    }
    if (!args['--token']) {
        throw new Error('missing required argument: --token');
    }
    const response = await isomorphic_unfetch_1.default(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            projectId: args['--project-id'],
            token: args['--token'],
        }),
    });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    const json = await response.json();
    const tab = '  ';
    const ftls = Object.keys(json.langs).map((langAlias) => {
        const ftl = [];
        for (const entry of json.entries) {
            const translationForLang = entry.translations[langAlias];
            if (!translationForLang) {
                console.log(`Entry ${entry.id} – Can't find translation for ${json.langs[langAlias]}, id would be used`);
            }
            const translation = translationForLang || entry.id;
            ftl.push([
                `${entry.id} =`,
                `${tab}${translation.split('\n').join('\n' + tab)}`,
            ].join('\n'));
        }
        return {
            lang: langAlias,
            ftl: ftl.join('\n\n'),
        };
    });
    const defaultFtl = ftls[0];
    const localizationConfigOutput = [
        `export const localizationConfig = {`,
        `\t${ftls.map(({ lang, ftl }) => `${lang}:\n\`${ftl}\``).join(',\n\t')}`,
        `} as const`,
    ].join('\n');
    if (!defaultFtl) {
        throw new Error('Not found default language translation');
    }
    const generatedTypes = TypeGenerator_1.TypeGenerator.fromFTL(defaultFtl.ftl);
    const output = generatedTypes + '\n\n' + localizationConfigOutput;
    fs.writeFileSync(args['--out-file'], output);
    console.log(`Generated translations for ${Object.keys(json.langs).length} languages`);
}
run().catch((err) => console.log(err));
