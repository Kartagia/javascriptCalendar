
/**
 * @module utlities/comparison 
 * The module containing various tools for comparison.
 */


/**
 * Interface of a comparison result.
 */
export interface ComparisonResult {
  /**
   * Comparison result.
   */
  result: number;

  /**
   * The numeric representation of the comparison result.
   */
  valueOf(): number;

  /**
   * Does the result indicate equivalence.
   */
  isEqual: boolean;

  /**
   * Does the result indicate lesserness.
   */
  isLesser: boolean;

  /**
   * Does teh result indicate greaterness.
   */
  isGreater: boolean;

  /**
   * Does the result exist-
   */
  exists: boolean;
}

/**
 * Get the comparison result from a JavaScript comparison result.
 * @param result The Java Script comparison value.
 * @returns The comparison result.
 */

export function getComparisonResult(result: number): ComparisonResult {
  if (Number.isInteger(result)) {
    return {
      result,
      valueOf() {
        return this.result;
      },

      get exists(): boolean {
        return !Number.isFinite(this.result);
      },

      get isLesser(): boolean {
        return this.exists && this.result < 0;
      },

      get isGreater(): boolean {
        return this.exists && this.result > 0;
      },

      get isEqual(): boolean {
        return this.exists && this.result === 0;
      },
    };
  } else {
    return {
      result: Number.NaN,
      get exists() {
        return false;
      },
      get isLesser() {
        return false;
      },
      get isGreater() {
        return false;
      },
      get isEqual() {
        return false;
      },
      valueOf() {
        return this.result;
      },
    };
  }
}
/**
 * The default comparison of the JavaScript.
 */

export class DefaultComparator
  implements Comparison<boolean | number | string>
{
  compare(
    compared: string | number | boolean,
    comparee: string | number | boolean
  ): ComparisonResult {
    return getComparisonResult(
      compared < comparee ? -1 : compared > comparee ? 1 : 0
    );
  }
}

/**
 * The default comparator of the Java Script.
 */

export const DefaultComparison: Comparison<string | number | boolean> = new DefaultComparator();
/**
 * The interface comparing values.
 */
interface Comparison<Type> {
  /**
   * Compares the compared with comparee.
   * @param compared THe compared.
   * @param comparee The value the compared is compared with.
   */
  compare(compared: Type, comparee: Type): ComparisonResult;
}
/**
 * THe interface indicating a value is comparable with a type.
 */

export interface Comparable<Type> {
  /**
   * Compare other with current value.
   * @param comparee The value current object is compared with.
   * @returns The comparison result of the comparison of the current
   * object wtih the given value.
   */
  compareTo(comparee: Type): ComparisonResult;
}
/**
 * The interface representing an order.
 * The order may contain loops or cycles.
 */
export interface Order<Type> {

  /**
   * Get the predecessor of a value.
   * @param value The value, whose predecessor is queried.
   * @returns The predecessor of the value, or an undefined value, if none exists.
   */
  getPredecessor(value: Type): Type | undefined;

  /**
   * Get the successor of a value.
   * @param value The value, whose successor is queried.
   * @returns The successor of the value, or an undefined value, if none exists.
   */
  getSuccessor(value: Type): Type | undefined;

  /**
   * Test, if the value has predecessor.
   * @param value The tested value.
   * @returns True, if and only if the value has predecessor.
   */
  hasPredecessor(value: Type): boolean;

  /**
   * Test, if the value has successor.
   * @param value The tested value.
   * @returns True, if and only if the value has successor.
   */
  hasSuccessor(value: Type): boolean;
}
/**
 * A natural order does not contain loops or values equal to each other.
 *
 * The natural order fulfils:
 * - if (hasSuccessor(x) && getPredecessor(x) === y) then x > y.
 * - if (hasSuccessor(x) && getSuccessor(x) === y) then x < y.
 * - if (getSuccessor(x) === y || getPredecessor(x) === y) then x === undefined || x !== y
 */
export interface NaturalOrder<Type> extends Order<Type>, Comparable<Type> {
}
/**
 * The interface indicating the type is ordered.
 */
export interface Ordered<Type> extends Comparable<Type> {

  /**
   * The predecessor of the current value.
   */
  predecessor: Type | undefined;

  /**
   * The successor of the current value.
   */
  successor: Type | undefined;
}
/**
 * A comparable wrapper for a number.
 */

/**
  * The type of integers.
  */
export type Integer = number & { __integer: true };


/**
 * The gatekeeper function to determine whether a value is an integer.
 */
export function isInteger(value: number): value is Integer {
  return Number.isSafeInteger(value);
}

/**
 * The type of a positive integers.
 */
export type PositiveInteger = Integer & { __positiveInteger: true };


/**
 * The gate keeper function to determing if a value is a positive integer.
 */
export function isPositiveInteger(value: number): value is PositiveInteger {
  return isInteger(value) && value > 0;
}


/**
 * A comparable is a wrapper class combining both comparable and ordered with a number.
 */
export class ComparableNumber implements Comparable<number | ComparableNumber>, Ordered<ComparableNumber> {
  /**
   * The value of the comparable number.
   */
  public readonly value: number;

  /**
   * Create a new comparable number.
   * @param value The wrapped number.
   */
  constructor(value: number) {
    this.value = value;
  }

  /**
   * Compares the comparable number with either number or comparable number.
   * @param other The value the comparable number is compared with.
   * @returns The comparison result.
   */
  compareTo(other: number | ComparableNumber): ComparisonResult {
    if (Number.isNaN(this.valueOf()) || Number.isNaN(other.valueOf())) {
      return getComparisonResult(Number.NaN);
    } else {
      return DefaultComparison.compare(this.valueOf(), other.valueOf());
    }
  }

  valueOf() {
    return this.value;
  }

  get successor(): ComparableNumber | undefined {
    if (Number.isFinite(this.value) && this.value < Number.MAX_VALUE) {
      return new ComparableNumber(this.value + Number.EPSILON);
    }
    return undefined;
  }

  get predecessor(): ComparableNumber | undefined {
    if (Number.isFinite(this.value) && this.value > Number.MIN_VALUE) {
      return new ComparableNumber(this.value - Number.EPSILON);
    }
    return undefined;
  }
}
/**
 * Comparable integer value. The value order includes only integers.
 */
export class ComparableInteger extends ComparableNumber implements Ordered<ComparableInteger> {

  /**
   * Create a new comparable integer.
   * @param value The value of the comparable integer.
   * @throws {RangeError} The value was not a safe integer.
   */
  constructor(value: number) {
    if (isInteger(value)) {
      super(value);
    } else {
      throw new RangeError("Cannot create comaprable integer from non-safe integer");
    }
  }


  get successor(): ComparableInteger | undefined {
    if (this.value < Number.MAX_SAFE_INTEGER) {
      return new ComparableInteger(this.value + 1);
    }
    return undefined;
  }

  get predecessor(): ComparableInteger | undefined {
    if (this.value > Number.MIN_SAFE_INTEGER) {
      return new ComparableInteger(this.value - 1);
    }
    return undefined;
  }

  valueOf(): Integer {
    const result: number = super.valueOf();
    if (isInteger(result)) {
      return result;;
    } else {
      throw new Error("Corrupted Comparable Integer not containing an integer value");
    }
  }
}

