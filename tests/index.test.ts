import { describe, it, expect } from "vitest";
import { Result } from "../src/index";

class TestError extends Error {
  test = true;
}

const ERROR = new TestError();

describe("Result", () => {
  describe("ok", () => {
    describe("#isOk", () => {
      it("equals true", () => {
        expect(Result.ok(1).isOk).toBe(true);
      });
      it("can be used for type assertions", () => {
        const ok = Result.ok(1);
        if (ok.isOk) {
          expect(ok.value).to.equal(1);
        }
      });
    });
    describe("#isErr", () => {
      it("equals false", () => {
        expect(Result.ok(1).isErr).toBe(false);
      });
    });

    describe("#unwrap", () => {
      it("returns the wrapped value with 0 args", () => {
        const r = Result.ok(1);
        expect(r.unwrap()).to.equal(1);
      });
      it("returns a mapped value with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.unwrap((v) => v + 1)).to.equal(2);
      });
      it("returns a mapped value with 2 args", () => {
        const r = Result.ok(1);
        expect(
          r.unwrap(
            (v) => v + 1,
            (_e) => 0,
          ),
        ).to.equal(2);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.unwrap(() => {
            throw ERROR;
          }),
        ).to.throw(ERROR);
      });
    });

    describe("#map", () => {
      it("maps the value with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.map((v) => v + 1).unwrap()).to.equal(2);
      });
      it("maps the value with 2 args", () => {
        const r = Result.ok(1);
        expect(
          r
            .map(
              (v) => v + 1,
              () => new TypeError(),
            )
            .unwrap(),
        ).to.equal(2);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.map(() => {
            throw ERROR;
          }),
        ).to.throw(ERROR);
      });
    });

    describe("#chain", () => {
      it("returns the mapped Result with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.chain((v) => Result.ok(v + 1)).unwrap()).to.equal(2);
        expect(() => r.chain(() => Result.err(ERROR)).unwrap()).to.throw(ERROR);
      });
      it("returns the mapped Result with 2 args", () => {
        const r = Result.ok(1);
        expect(
          r
            .chain(
              (v) => Result.ok(v + 1),
              () => Result.err(new TypeError()),
            )
            .unwrap(),
        ).to.equal(2);
        expect(() =>
          r
            .chain(
              () => Result.err(ERROR),
              () => Result.ok(0),
            )
            .unwrap(),
        ).to.throw(ERROR);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.chain(() => {
            throw ERROR;
          }),
        ).to.throw(ERROR);
      });
    });
  });
  describe("err", () => {
    it("accepts 1 argument, any Error subtype", () => {
      const r: Result<unknown, TypeError> = Result.err(new TypeError("test"));
      expect(r.unwrap.bind(r)).to.throw(TypeError, "test");
    });

    it("accepts 0 arguments, defaulting to new Error()", () => {
      const r: Result<unknown> = Result.err();
      expect(r.unwrap.bind(r)).to.throw(Error);
    });

    describe("#isErr", () => {
      it("equals true", () => {
        expect(Result.err(ERROR).isErr).toBe(true);
      });
      it("can be used for type assertions", () => {
        const ok = Result.err(ERROR);
        if (ok.isErr) {
          expect(ok.error).to.equal(ERROR);
        }
      });
    });
    describe("#isOk", () => {
      it("equals false", () => {
        expect(Result.err(ERROR).isOk).toBe(false);
      });
    });

    describe("#unwrap", () => {
      it("throws the wrapped error with 0 args", () => {
        const r = Result.err(ERROR);
        expect(() => r.unwrap()).to.throw(ERROR);
      });
      it("throws the wrapped error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.unwrap(() => 1)).to.throw(ERROR);
      });
      it("returns a mapped error with 2 args", () => {
        const r = Result.err(ERROR);
        expect(
          r.unwrap(
            () => 1,
            () => 0,
          ),
        ).to.equal(0);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.unwrap(
            () => 1,
            () => {
              throw new TypeError();
            },
          ),
        ).to.throw(TypeError);
      });
    });

    describe("#map", () => {
      it("doesn't map the error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.map(() => 1).unwrap()).to.throw(ERROR);
      });
      it("maps the error with 2 args", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r
            .map(
              () => 1,
              () => new TypeError(),
            )
            .unwrap(),
        ).to.throw(TypeError);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.map(
            () => 1,
            () => {
              throw new TypeError();
            },
          ),
        ).to.throw(TypeError);
      });
    });

    describe("#chain", () => {
      it("doesn't map the error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.chain(() => Result.ok(1)).unwrap()).to.throw(ERROR);
      });
      it("returns the mapped Result with 2 args", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r
            .chain(
              () => Result.ok(1),
              () => Result.err(new TypeError()),
            )
            .unwrap(),
        ).to.throw(TypeError);
        expect(
          r
            .chain(
              () => Result.err(ERROR),
              () => Result.ok(0),
            )
            .unwrap(),
        ).to.equal(0);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.chain(
            () => Result.ok(1),
            () => {
              throw new TypeError();
            },
          ),
        ).to.throw(TypeError);
      });
    });
  });

  it("preserves the error type over #map(x)", () => {
    const r: Result<number, TestError> = Result.ok(1);
    const a = r.map((v) => v + 1);
    const _b: Result<number, TestError> = a;
  });

  it("preserves the error type over #chain(x, y)", () => {
    const r: Result<number, TestError> = Result.ok(1);
    const a = r.chain(
      (v) => Result.ok(v + 1),
      () => Result.ok(0),
    );
    const _b: Result<number, TestError> = a;
  });

  describe("all", () => {
    it("accepts arrays", () => {
      const a = Result.all([Result.ok(1), Result.ok("test")]).unwrap();
      expect(a).to.deep.equal([1, "test"]);
    });

    it("accepts objects", () => {
      const a = Result.all({ x: Result.ok(1), y: Result.ok("test") }).unwrap();
      expect(a).to.deep.equal({ x: 1, y: "test" });
    });

    it("supports tuple types from length 0 to length 16", () => {
      const _a: [] = Result.all([]).unwrap();
      const _b: [number] = Result.all([Result.ok(1)]).unwrap();
      const _c: [number, string] = Result.all([
        Result.ok(1),
        Result.ok("a"),
      ]).unwrap();
      const _d: [
        1,
        "a",
        2,
        "b",
        3,
        "c",
        4,
        "d",
        5,
        "e",
        6,
        "f",
        7,
        "g",
        8,
        "h",
      ] = Result.all([
        Result.ok(1 as const),
        Result.ok("a" as const),
        Result.ok(2 as const),
        Result.ok("b" as const),
        Result.ok(3 as const),
        Result.ok("c" as const),
        Result.ok(4 as const),
        Result.ok("d" as const),
        Result.ok(5 as const),
        Result.ok("e" as const),
        Result.ok(6 as const),
        Result.ok("f" as const),
        Result.ok(7 as const),
        Result.ok("g" as const),
        Result.ok(8 as const),
        Result.ok("h" as const),
      ]).unwrap();
    });

    it("preserves the error types as a union", () => {
      const _a: Result<unknown, TypeError | TestError> = Result.all([
        Result.err(new TypeError("type error")),
        Result.err(new TestError("test error")),
      ]);
      const _b: Result<unknown, TypeError | TestError> = Result.all({
        x: Result.err(new TypeError("type error")),
        y: Result.err(new TestError("test error")),
      });
    });

    it("returns a failing result as-is", () => {
      const r = Result.err(ERROR);
      const a = Result.all([Result.ok(1), r]);
      expect(() => a.unwrap()).to.throw(ERROR);

      const b = Result.all({ x: Result.ok(1), y: r });
      expect(() => b.unwrap()).to.throw(ERROR);
    });
  });
});
