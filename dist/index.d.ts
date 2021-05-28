import { FluentBundle, FluentVariable } from '@fluent/bundle';
declare class TurnslateLocalization {
    bundles: Iterable<FluentBundle>;
    constructor(bundles: Iterable<FluentBundle>);
    getBundle(id: string): FluentBundle | null;
    getString(id: string, args?: Record<string, FluentVariable> | null, fallback?: string): string;
    reportError(error: Error): void;
}
export declare const generateLocalization: (userLocales: string[], localizationConfig: Record<string, string>) => TurnslateLocalization;
export {};
