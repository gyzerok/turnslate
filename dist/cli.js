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
const URL = 'https://us-central1-turnslate.cloudfunctions.net/langs';
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
    const ftl = json.langs[json.main];
    const langs = Object.entries(json.langs).map(([locale, ftl]) => `'${locale}': \`${ftl}\``);
    const output = [
        TypeGenerator_1.TypeGenerator.fromFTL(ftl),
        `export const langs = {\n  ${langs.join(',\n  ')}\n} as const`,
    ].join('\n\n');
    fs.writeFileSync(args['--out-file'], output);
    console.log(`Generated translations for ${Object.keys(json.langs).length} languages`);
}
run().catch((err) => console.log(err));
