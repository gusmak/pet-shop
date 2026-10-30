export declare const normalizePhone: (v: string) => string;
export declare const NormalizePhone: () => PropertyDecorator;
export declare const Trim: () => PropertyDecorator;
export declare const Lowercase: () => PropertyDecorator;
export declare const Uppercase: () => PropertyDecorator;
export declare function slugify(input: string): string;
export declare function vnNow(): {
    date: string;
    time: string;
};
export declare const addMinutes: (hhmm: string, minutes: number) => string;
