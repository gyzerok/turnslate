import { FluentBundle } from '@fluent/bundle';
declare class TurnslateLocalization {
    bundles: Iterable<FluentBundle>;
    constructor(bundles: Iterable<FluentBundle>);
    getBundle(id: string): FluentBundle | null;
}
export declare const generateLocalization: (userLocales: string[], localizationConfig: Record<string, string>) => TurnslateLocalization;
export {};
