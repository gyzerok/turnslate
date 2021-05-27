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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var syntax_1 = require("@fluent/syntax");
var isomorphic_unfetch_1 = __importDefault(require("isomorphic-unfetch"));
var arg_1 = __importDefault(require("arg"));
var parser_1 = require("./parser");
var args = arg_1.default({
    '--project-id': String,
    '--token': String,
    '--out-file': String,
});
var URL = 'https://us-central1-turnslate.cloudfunctions.net/getEntriesForProject';
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var response, _a, json, tab, ftls, defaultFtl, localizationConfigOutput, generatedTypes, output;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!args['--project-id']) {
                        throw new Error('missing required argument: --project-id');
                    }
                    if (!args['--out-file']) {
                        throw new Error('missing required argument: --out-file');
                    }
                    if (!args['--token']) {
                        throw new Error('missing required argument: --token');
                    }
                    return [4 /*yield*/, isomorphic_unfetch_1.default(URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                projectId: args['--project-id'],
                                token: args['--token'],
                            }),
                        })];
                case 1:
                    response = _b.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    _a = Error.bind;
                    return [4 /*yield*/, response.text()];
                case 2: throw new (_a.apply(Error, [void 0, _b.sent()]))();
                case 3: return [4 /*yield*/, response.json()];
                case 4:
                    json = _b.sent();
                    tab = '  ';
                    ftls = Object.keys(json.langs).map(function (langAlias) {
                        var ftl = [];
                        for (var _i = 0, _a = json.entries; _i < _a.length; _i++) {
                            var entry = _a[_i];
                            var translationForLang = entry.translations[langAlias];
                            if (!translationForLang) {
                                console.log("Entry " + entry.id + " \u2013 Can't find translation for " + json.langs[langAlias] + ", id would be used");
                            }
                            var translation = translationForLang || entry.id;
                            ftl.push([
                                entry.id + " =",
                                "" + tab + translation.split('\n').join('\n' + tab),
                            ].join('\n'));
                        }
                        return {
                            lang: langAlias,
                            ftl: ftl.join('\n\n'),
                        };
                    });
                    defaultFtl = ftls[0];
                    localizationConfigOutput = [
                        "export const localizationConfig = {",
                        "\t" + ftls.map(function (_a) {
                            var lang = _a.lang, ftl = _a.ftl;
                            return lang + ":\n`" + ftl + "`";
                        }).join(',\n\t'),
                        "} as const",
                    ].join('\n');
                    if (!defaultFtl) {
                        throw new Error('Not found default language translation');
                    }
                    generatedTypes = generateTypesFromFtl(defaultFtl.ftl);
                    output = generatedTypes + '\n\n' + localizationConfigOutput;
                    fs.writeFileSync(args['--out-file'], output);
                    console.log("Generated translations for " + Object.keys(json.langs).length + " languages");
                    return [2 /*return*/];
            }
        });
    });
}
function generateTypesFromFtl(string) {
    var _a;
    var astResult = syntax_1.parse(string, { withSpans: false });
    var generatedTypes = '';
    for (var _i = 0, _b = astResult.body; _i < _b.length; _i++) {
        var messageOrJunk = _b[_i];
        if (messageOrJunk.type !== 'Message')
            break;
        var messageEntry = messageOrJunk;
        var id = messageEntry.id.name;
        var comment = (_a = messageEntry.comment) === null || _a === void 0 ? void 0 : _a.content;
        var identifiers = messageEntry.value
            ? Array.from(new Set(parser_1.parseElements(messageEntry.value.elements)))
            : [];
        if (!id)
            break;
        if (comment)
            generatedTypes = generatedTypes + ("\n # " + comment);
        if (identifiers.length) {
            generatedTypes =
                generatedTypes +
                    '\n' +
                    ("| [\n      '" + id + "',\n      {\n        " + identifiers.map(function (identifier) { return identifier + ": string | number \n"; }) + "\n      },\n    ]");
        }
        else {
            generatedTypes = generatedTypes + ("\n | ['" + id + "']");
        }
    }
    if (generatedTypes.length === 0)
        generatedTypes = 'any';
    return 'export type LocalizedMessage = ' + generatedTypes;
}
run().catch(function (err) { return console.log("Error: " + err); });
