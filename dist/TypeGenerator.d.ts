import { VariableReference, Visitor, Message, Comment } from '@fluent/syntax';
export declare class TypeGenerator extends Visitor {
    nodes: Array<{
        name: string;
        comment?: string;
        ids: Set<string>;
    }>;
    static fromFTL(ftl: string): string;
    visitMessage(node: Message): void;
    visitComment(node: Comment): void;
    visitVariableReference(node: VariableReference): void;
}
