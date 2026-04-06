"use client";

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsStringLiteral,
  type Options,
} from "nuqs";

type FilterConfig<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] extends number
    ? { type: "integer"; defaultValue?: number }
    : T[K] extends string
      ? { type: "string"; defaultValue?: string; options?: readonly string[] }
      : never;
};

type FilterReturn<T extends Record<string, unknown>> = {
  [K in keyof T]: [T[K] | null, (value: T[K] | null) => void];
} & {
  clearAll: () => void;
  activeCount: number;
};

const nuqsOptions: Options = {
  history: "replace",
  shallow: false,
};

export function useUrlFilter(key: string, defaultValue?: string) {
  return useQueryState(
    key,
    parseAsString.withDefault(defaultValue ?? "").withOptions(nuqsOptions),
  );
}

export function useUrlFilterInt(key: string, defaultValue?: number) {
  return useQueryState(
    key,
    parseAsInteger
      .withDefault(defaultValue ?? 0)
      .withOptions(nuqsOptions),
  );
}

export function useUrlFilterEnum<T extends string>(
  key: string,
  options: readonly T[],
  defaultValue?: T,
) {
  return useQueryState(
    key,
    parseAsStringLiteral(options)
      .withDefault(defaultValue ?? (null as unknown as T))
      .withOptions(nuqsOptions),
  );
}

export function useUrlFilters<T extends Record<string, unknown>>(
  config: FilterConfig<T>,
): FilterReturn<T> {
  const entries = Object.entries(config) as [keyof T, FilterConfig<T>[keyof T]][];

  const states: Record<string, [unknown, (v: unknown) => void]> = {};

  for (const [key, cfg] of entries) {
    const k = key as string;
    if (cfg.type === "integer") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [val, setVal] = useQueryState(
        k,
        parseAsInteger.withOptions(nuqsOptions),
      );
      states[k] = [val ?? cfg.defaultValue ?? null, setVal as (v: unknown) => void];
    } else if (cfg.options) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [val, setVal] = useQueryState(
        k,
        parseAsStringLiteral(cfg.options).withOptions(nuqsOptions),
      );
      states[k] = [val ?? cfg.defaultValue ?? null, setVal as (v: unknown) => void];
    } else {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [val, setVal] = useQueryState(
        k,
        parseAsString.withOptions(nuqsOptions),
      );
      states[k] = [val ?? cfg.defaultValue ?? null, setVal as (v: unknown) => void];
    }
  }

  const activeCount = Object.values(states).filter(([val]) => val !== null && val !== "").length;

  const clearAll = () => {
    for (const [, setState] of Object.values(states)) {
      setState(null);
    }
  };

  const result = { clearAll, activeCount } as FilterReturn<T>;
  for (const [key, [val, setVal]] of Object.entries(states)) {
    (result as Record<string, unknown>)[key] = [val, setVal];
  }

  return result;
}
