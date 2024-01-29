import { describe, it } from "mocha";
import { expect } from "chai";
import { ComparisonResult, getComparisonResult } from "../src/comparison";

describe("Comparison result tests", () => {
  const lesserTestValues = [
    Number.NEGATIVE_INFINITY,
    Number.MIN_SAFE_INTEGER,
    -(2 ** 16),
    -1024,
    -256,
    1,
  ];
  const greaterTestValues = [
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER,
    2 ** 16,
    1024,
    256,
    1,
  ];
  const equalTestValues = [0];
  const invalidTestValues = [Number.NaN];

  it("Equality", () => {
    let result: ComparisonResult;
    lesserTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isEqual;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    equalTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => result.isEqual;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    greaterTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isEqual;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    invalidTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isEqual;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });

  });

  it("Lesser", () => {
    let result: ComparisonResult;
    lesserTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => result.isLesser;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    greaterTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isLesser;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    invalidTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isLesser;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });

  });

  it("Greater", () => {
    let result: ComparisonResult;
    lesserTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isGreater;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    greaterTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => result.isGreater;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
    invalidTestValues.forEach((value) => {
      let expected = (result: ComparisonResult) => !result.isGreater;
      expect(() => {
        result = getComparisonResult(value);
      }).should.not.throw();
      expect(expected(result)).true;
    });
  });
});
