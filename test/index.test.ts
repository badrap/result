import { expect } from "chai";
import { Result } from "../src/index";

describe("Result", () => {
  describe("unwrap", () => {
    it("returns an ok value", () => {
      const r = Result.ok(1);
      expect(r.unwrap()).to.equal(1);
    });
  });
});
