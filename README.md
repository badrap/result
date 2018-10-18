# result [![CircleCI](https://circleci.com/gh/badrap/result.svg?style=shield)](https://circleci.com/gh/badrap/result)

A TypeScript result type taking cues from Rust's Result and Haskell's Either types. It's goals are:

 * **Small, idiomatic API surface**: Mix and match parts from Rust's Result and Haskell's Either types, but modify them to make the experience TypeScript-y (TypeScriptic? TypeScriptish?). Of course this is pretty subjective.
 * **Coding errors should throw**: While **Result#map** and **Result#chain** together somewhat resemble [Promise#then](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then) but differ in that they don't implicitly wrap errors thrown in callbacks.
 * **Be ergonomic but safe**: Leverage TypeScript's type inference to make common cases simple while keeping type safety. This also helps to get a nice editor experience in e.g. Visual Studio Code.

## Installation

```sh
$ yarn install @badrap/result
```

## Usage

```ts
import { Result } from "@badrap/result";
```

## API

### Result.ok

Returns a new **Result.Ok** wrapping the given value.

```ts
const res = Result.ok(1);
res.isOk;   // true
```

### Result.err

Returns a new **Result.Err** wrapping the given error.

```ts
const res = Result.err(new Error());
res.isOk;   // false
```

### Result#isOk & Result.isErr

**Result#isOk** and **Result#isErr** are complementary `readonly boolean` properties. **isOk** is `true` for **Result.Ok** and `false` for **Result.Err**.

```ts
const ok = Result.ok(1);
ok.isOk;  // true

const err = Result.err(new Error());
err.isOk; // false
```

**isErr** is the inverse of **isOk**: 'false' for **Result.Ok** and 'true' for **Result.Err**.

```ts
const ok = Result.ok(1);
ok.isErr;  // false

const err = Result.err(new Error());
err.isErr; // true
```

These properties are handy for type assertions.

```ts
const res = Math.random() < 0.5 ? Result.ok(1) : Result.err(new Error("oh no"));

if (res.isErr) {
  // TypeScript now knows that res is a Result.Err, and we can access res.error
  res.error;  // Error("oh no")
}

if (res.isOk) {
  // TypeScript now knows that res is a Result.Ok, and we can access res.value
  res.value;  // 1
}
```

### Result#unwrap

Return the wrapped value for **Result.Ok** and throw the wrapped error for **Result.Err**.
This can be modified for providing functions to map the value and error to some value.

```ts
const ok = Result.ok(1);
const err = Result.err(new Error("oh no"));

ok.unwrap();    // 1
err.unwrap();   // throws Error("oh no")

ok.unwrap(value => value + 1);    // 2
err.unwrap(value => value + 2);   // throws Error("oh no")

ok.unwrap(value => value + 1, error => 0);    // 2
err.unwrap(value => value + 2, error => 0);   // 0
```

As a small extra convenience the result types from the callbacks don't have to be the same.
Here's an example HTTP handler demonstrating this, using an imaginary **validate** function
that returns a **Result**:

```ts
app.use(ctx =>
  validate(ctx.request.body).unwrap(
    async (value: any) => {
      ...
    },
    error => {
      ctx.throw(400, `Request validation failed: ${error.message}`);
    }
  )
);
```

### Result#map

Return a new **Result** where the given function/functions have been applied
to the wrapped value and error.

```ts
const ok = Result.ok(1);
const err = Result.err(new Error("oh no"));

ok.map(value => value + 1).unwrap();  // 2
err.map(value => value + 1).unwrap(); // throws Error("oh no")

ok.map(value => value + 1, error => new Error("mapped")).unwrap();  // 2
err.map(value => value + 1, error => new Error("mapped")).unwrap(); // throws Error("mapped")
```

### Result#chain

```ts
const ok = Result.ok(1);
const err = Result.err(new Error("oh no"));

ok.chain(value => Result.ok(value + 1)).unwrap();   // 2
err.chain(value => Result.ok(value + 1)).unwrap();  // throws Error("oh no")

ok.chain(value => Result.ok(value + 1), error => Result.ok(0)).unwrap();  // 2
err.chain(value => Result.ok(value + 1), error => Result.ok(0)).unwrap(); // 0
```

## License

This library is licensed under the MIT license. See [LICENSE](./LICENSE).
