import { expect } from "chai";
import { Result } from "../src/index";

class TestError extends Error {
  test = true;
}

const ERROR = new TestError();

describe("Result", () => {
  describe("ok", () => {
    describe("#isOk", () => {
      it("equals true", () => {
        expect(Result.ok(1).isOk).to.be.true;
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
        expect(Result.ok(1).isErr).to.be.false;
      });
    });

    describe("#unwrap", () => {
      it("returns the wrapped value with 0 args", () => {
        const r = Result.ok(1);
        expect(r.unwrap()).to.equal(1);
      });
      it("returns a mapped value with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.unwrap(v => v + 1)).to.equal(2);
      });
      it("returns a mapped value with 2 args", () => {
        const r = Result.ok(1);
        expect(r.unwrap(v => v + 1, e => 0)).to.equal(2);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.unwrap(v => {
            throw ERROR;
          })
        ).to.throw(ERROR);
      });
    });

    describe("#map", () => {
      it("maps the value with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.map(v => v + 1).unwrap()).to.equal(2);
      });
      it("maps the value with 2 args", () => {
        const r = Result.ok(1);
        expect(r.map(v => v + 1, e => new TypeError()).unwrap()).to.equal(2);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.map(v => {
            throw ERROR;
          })
        ).to.throw(ERROR);
      });
    });

    describe("#chain", () => {
      it("returns the mapped Result with 1 arg", () => {
        const r = Result.ok(1);
        expect(r.chain(v => Result.ok(v + 1)).unwrap()).to.equal(2);
        expect(() => r.chain(v => Result.err(ERROR)).unwrap()).to.throw(ERROR);
      });
      it("returns the mapped Result with 2 args", () => {
        const r = Result.ok(1);
        expect(
          r
            .chain(v => Result.ok(v + 1), e => Result.err(new TypeError()))
            .unwrap()
        ).to.equal(2);
        expect(() =>
          r.chain(v => Result.err(ERROR), e => Result.ok(0)).unwrap()
        ).to.throw(ERROR);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.ok(1);
        expect(() =>
          r.chain(v => {
            throw ERROR;
          })
        ).to.throw(ERROR);
      });
    });
  });
  describe("err", () => {
    describe("#isErr", () => {
      it("equals true", () => {
        expect(Result.err(ERROR).isErr).to.be.true;
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
        expect(Result.err(ERROR).isOk).to.be.false;
      });
    });

    describe("#unwrap", () => {
      it("throws the wrapped error with 0 args", () => {
        const r = Result.err(ERROR);
        expect(() => r.unwrap()).to.throw(ERROR);
      });
      it("throws the wrapped error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.unwrap(v => v + 1)).to.throw(ERROR);
      });
      it("returns a mapped error with 2 args", () => {
        const r = Result.err(ERROR);
        expect(r.unwrap(v => v + 1, e => 0)).to.equal(0);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.unwrap(
            v => v + 1,
            e => {
              throw new TypeError();
            }
          )
        ).to.throw(TypeError);
      });
    });

    describe("#map", () => {
      it("doesn't map the error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.map(v => v + 1).unwrap()).to.throw(ERROR);
      });
      it("maps the error with 2 args", () => {
        const r = Result.err(ERROR);
        expect(() => r.map(v => v + 1, e => new TypeError()).unwrap()).to.throw(
          TypeError
        );
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.map(
            v => v + 1,
            e => {
              throw new TypeError();
            }
          )
        ).to.throw(TypeError);
      });
    });

    describe("#chain", () => {
      it("doesn't map the error with 1 arg", () => {
        const r = Result.err(ERROR);
        expect(() => r.chain(v => Result.ok(v + 1)).unwrap()).to.throw(ERROR);
      });
      it("returns the mapped Result with 2 args", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r
            .chain(v => Result.ok(v + 1), e => Result.err(new TypeError()))
            .unwrap()
        ).to.throw(TypeError);
        expect(
          r.chain(v => Result.err(ERROR), e => Result.ok(0)).unwrap()
        ).to.equal(0);
      });
      it("throws errors raised in a mapping function", () => {
        const r = Result.err(ERROR);
        expect(() =>
          r.chain(
            v => Result.ok(v + 1),
            e => {
              throw new TypeError();
            }
          )
        ).to.throw(TypeError);
      });
    });
  });

  it("preserves the error type over #map(x)", () => {
    const r: Result<number, TestError> = Result.ok(1);
    const a = r.map(v => v + 1);
    const b: Result<number, TestError> = a;
  });

  it("preserves the error type over #chain(x, y)", () => {
    const r: Result<number, TestError> = Result.ok(1);
    const a = r.chain(v => Result.ok(v + 1), e => Result.ok(0));
    const b: Result<number, TestError> = a;
  });
});
