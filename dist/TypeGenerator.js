"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeGenerator = void 0;
const syntax_1 = require("@fluent/syntax");
class TypeGenerator extends syntax_1.Visitor {
    constructor() {
        super(...arguments);
        this.nodes = [];
    }
    static fromFTL(ftl) {
        const vars = new TypeGenerator();
        vars.visit(syntax_1.parse(ftl, { withSpans: true }));
        const union = vars.nodes
            .map((node) => `${node.comment ? `  /* ${node.comment} */\n` : ''}  | ['${node.name}', Vars<${Array.from(node.ids)
            .map((id) => `'${id}'`)
            .join(' | ')}>]`)
            .join('\n');
        return [
            `export type LocalizedMessage =\n${union}`,
            'type Vars<T extends string> = Record<T, string | number>',
        ].join('\n\n');
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
