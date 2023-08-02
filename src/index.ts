///<reference lib="es2015.symbol" />
///<reference lib="es2015.symbol.wellknown" />
///<reference lib="es2015.collection" />
///<reference lib="es2015.iterable" />
declare global {
  /**
   * Recursively unwraps the "awaited type" of a type. Non-promise "thenables" should resolve to `never`. This emulates the behavior of `await`.
   */
  type Awaited<T> = T extends null | undefined
    ? T // special case for `null | undefined` when not in `--strictNullChecks` mode
    : T extends object & { then(onfulfilled: infer F): any } // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
    ? F extends (value: infer V, ...args: any) => any // if the argument to `then` is callable, extracts the first argument
      ? Awaited<V> // recursively unwrap the value
      : never // the argument to `then` was not callable
    : T; // non-object or non-thenable

  type Bool = "true" | "false";
  type Key = string | symbol; // removed number
  type Not<X extends Bool> = {
    true: "false";
    false: "true";
  }[X];
  type HaveIntersection<S1 extends string, S2 extends string> = ({
    [K in S1]: "true";
  } & {
    [key: string]: "false";
  })[S2];
  type IsNeverWorker<S extends string> = ({
    // changed Key to string
    [K in S]: "false";
  } & {
    [key: string]: "true";
  })[S];
  type IsNever<T extends string> = Not<HaveIntersection<IsNeverWorker<T>, "false">>; // changed Key to string
  type IsFunction<T> = IsNever<keyof T>;
  export type NonFunctionProps<T> = {
    [K in keyof T]: {
      false: K;
      true: never;
    }[IsFunction<T[K]>];
  }[keyof T];
  export type NonFunctionPropNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];
}
export {};
export * from "./shared/interfaces";
export * from "./components/index";
export * from "./logic/index";
export * from "./app";
