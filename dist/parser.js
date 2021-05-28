"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGenerator = void 0;
const syntax_1 = require("@fluent/syntax");
class TypeGenerator extends syntax_1.Visitor {
    constructor() {
        super(...arguments);
        this.nodes = [];
    }
    static generate(node) {
        const vars = new TypeGenerator();
        vars.visit(node);
        const union = vars.nodes
            .map((node) => `${node.comment ? `  /* ${node.comment} */\n` : ''}  | ['${node.name}', Record<${Array.from(node.ids)
            .map((id) => `'${id}'`)
            .join(' | ')}, string | number>]`)
            .join('\n');
        return `export type LocalizedMessage =\n${union}`;
    }
    visitMessage(node) {
        this.nodes.push({ name: node.id.name, ids: new Set() });
        this.genericVisit(node);
    }
    visitComment(node) {
        const last = this.nodes[this.nodes.length - 1];
        if (!last) {
            return;
        }
        last.comment = node.content;
    }
    visitVariableReference(node) {
        var _a;
        (_a = this.nodes[this.nodes.length - 1]) === null || _a === void 0 ? void 0 : _a.ids.add(node.id.name);
    }
}
exports.TypeGenerator = TypeGenerator;
const test = `
# Gonvo
shared-photos =
    {$userName} {$photoCount ->
        [one] added a new photo
       *[other] added {$photoCount} new photos
    } to {$userGender ->
        [male] his stream
        [female] her stream
       *[other] their stream
    }.

shared-photos-again =
    {$userName} is pidor.
`;
const ast = syntax_1.parse(test, { withSpans: true });
console.log(TypeGenerator.generate(ast));
