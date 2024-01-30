import { describe, it } from "mocha";
import { expect, should } from "chai";
import {
  ComparisonResult,
  DefaultComparison,
  getComparisonResult,
  isInteger,
} from "../comparison.js";

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
      it(`Value ${value} should not be equal`, () => {
        let expected = (result: ComparisonResult) => !result.isEqual;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    equalTestValues.forEach((value) => {
      it(`Value ${value} should be equal`, () => {
        let expected = (result: ComparisonResult) => result.isEqual;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    greaterTestValues.forEach((value) => {
      it(`Value ${value} should not be equal`, () => {
        let expected = (result: ComparisonResult) => !result.isEqual;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    invalidTestValues.forEach((value) => {
      it(`Value ${value} should not be equal`, () => {
        let expected = (result: ComparisonResult) => !result.isEqual;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
  });

  it("Lesser", () => {
    let result: ComparisonResult;
    lesserTestValues.forEach((value) => {
      it(`Value ${value} should be lesser`, () => {
        let expected = (result: ComparisonResult) => result.isLesser;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    greaterTestValues.forEach((value) => {
      it(`Value ${value} should not be lesser`, () => {
        let expected = (result: ComparisonResult) => !result.isLesser;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    equalTestValues.forEach((value) => {
      it(`Value ${value} should not be lesser`, () => {
        let expected = (result: ComparisonResult) => !result.isLesser;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    invalidTestValues.forEach((value) => {
      it(`Value ${value} should not be lesser`, () => {
        let expected = (result: ComparisonResult) => !result.isLesser;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
  });

  it("Greater", () => {
    let result: ComparisonResult;
    lesserTestValues.forEach((value) => {
      it(`Value ${value} should not be greater`, () => {
        let expected = (result: ComparisonResult) => !result.isGreater;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    greaterTestValues.forEach((value) => {
      it(`Value ${value} should be greater`, () => {
        let expected = (result: ComparisonResult) => result.isGreater;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    equalTestValues.forEach((value) => {
      it(`Value ${value} should not be greater`, () => {
        let expected = (result: ComparisonResult) => !result.isGreater;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
    invalidTestValues.forEach((value) => {
      it(`Value ${value} should not be greater`, () => {
        let expected = (result: ComparisonResult) => !result.isGreater;
        expect(() => {
          result = getComparisonResult(value);
        }).not.throw();
        expect(expected(result)).true;
      });
    });
  });
});

describe("Test default comparison", () => {
  const numbersInOrder = [
    Number.NEGATIVE_INFINITY,
    Number.MIN_SAFE_INTEGER,
    -(2 ** 32),
    -(2 ** 10),
    -(2 ** 8),
    -255,
    -2,
    -1,
    0,
    1,
    2,
    255,
    2 ** 8,
    2 ** 10,
    2 ** 32,
    Number.MAX_SAFE_INTEGER,
    Number.POSITIVE_INFINITY,
  ];
  const cmp = DefaultComparison;
  numbersInOrder.forEach((value, index, arr) => {
    arr.forEach((comparee, compareeIndex) => {
      const expected = getComparisonResult(index - compareeIndex);
      it(`Case ${value} is ${
        index < compareeIndex
          ? "less than"
          : index === compareeIndex
          ? "equal to"
          : "greater than"
      } ${comparee}`, () => {
        let result: ComparisonResult;
        expect(() => {
          result = cmp.compare(value, comparee);
        }).not.throw();
        result = cmp.compare(value, comparee);
        expect(
          result.exists,
          `Expected exists ${expected.exists}, but got ${result.exists}`
        ).equal(expected.exists);
        expect(
          result.isLesser,
          `Expected exists ${expected.isLesser}, but got ${result.isLesser}`
        ).equal(expected.isLesser);
        expect(
          result.isGreater,
          `Expected exists ${expected.isGreater}, but got ${result.isGreater}`
        ).equal(expected.isGreater);
        expect(
          result.isEqual,
          `Expected exists ${expected.isEqual}, but got ${result.isEqual}`
        ).equal(expected.isEqual);
      });
    });
  });
  const stringsInOrder = [
    "",
    " ",
    "!",
    "/",
    0,
    1,
    9,
    "9a",
    "A",
    "a",
    "bAr",
    "bar",
  ];
  stringsInOrder.forEach((value, index, arr) => {
    arr.forEach((comparee, compareeIndex) => {
      const expected = getComparisonResult(index - compareeIndex);
      it(`Case "${value}" is ${
        index < compareeIndex
          ? "less than"
          : index === compareeIndex
          ? "equal to"
          : "greater than"
      } "${comparee}"`, () => {
        let result: ComparisonResult;
        expect(() => {
          result = cmp.compare(value, comparee);
        }).not.throw();
        result = cmp.compare(value, comparee);
        expect(
          result.exists,
          `Expected exists ${expected.exists}, but got ${result.exists}`
        ).equal(expected.exists);
        expect(
          result.isLesser,
          `Expected exists ${expected.isLesser}, but got ${result.isLesser}`
        ).equal(expected.isLesser);
        expect(
          result.isGreater,
          `Expected exists ${expected.isGreater}, but got ${result.isGreater}`
        ).equal(expected.isGreater);
        expect(
          result.isEqual,
          `Expected exists ${expected.isEqual}, but got ${result.isEqual}`
        ).equal(expected.isEqual);
      });
    });
  });
});

describe("Testing Integer", () => {
  const invalidIntegers = [
    0.1,
    0.5,
    0 - Number.EPSILON,
    0 + Number.EPSILON,
    2**54,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NaN,
  ];
  invalidIntegers.forEach( (value) => {
    it(`Invalid integer ${value}`, () => {
      expect(isInteger(value)).false;
    });
  })

  const validIntegers = [
    0,
    1,
    2**32, 
    2**52,
    -(2**32),
    -(2**52),
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ];
  validIntegers.forEach( (value) => {
    it(`Valid integer ${value}`, () => {
      expect(isInteger(value)).true;
    });
  })
});
