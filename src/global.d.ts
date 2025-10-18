/// <reference types="vite/client" />

type MicromarkCodes = {
  [K in keyof typeof import("micromark-util-symbol").codes as Uppercase<
    import("type-fest").DelimiterCase<K, "_">
  >]: typeof import("micromark-util-symbol").codes[K];
};

declare const CODES: MicromarkCodes;
