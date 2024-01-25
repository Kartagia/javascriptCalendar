import { Comparable, ComparisonResult, getComparisonResult } from "./comparison";

/**
 * Value range represents a range of values.
 */

export class ValueRange<Type extends Comparable<Type>>
  implements Comparable<ValueRange<Type>>
{
  /**
   * The lower boundary of the range.
   * An undefined value indicates the range is lower unbounded.
   */
  public readonly lowerBoundary: Type | undefined;

  /**
   * The upper boundary of the range.
   * An undefined value indicates the range is upper unbounded.
   */
  public readonly upperBoundary: Type | undefined;

  /**
   * Does the lower boundary belong to the range.
   */
  public readonly includesLowerBoundary: boolean;

  /**
   * Does teh upper boudnary belong ot the range.
   */
  public readonly includesUpperBoundary: boolean;

  /**
   * Create a new range.
   * @param lowerBoundary The lower boundary.
   * @param upperBoundary The upper boudnary.
   * @param includeLowerBoundary Does the range include the lower boundary.
   * @param includeUpperBoundary Does the range include the upper boundary.
   */
  constructor(
    lowerBoundary: Type | undefined,
    upperBoundary: Type | undefined,
    includeLowerBoundary: boolean,
    includeUpperBoundary: boolean
  ) {
    this.upperBoundary = upperBoundary;
    this.lowerBoundary = lowerBoundary;
    this.includesLowerBoundary = includeLowerBoundary;
    this.includesUpperBoundary = includeUpperBoundary;
  }

  /**
   * Does the given value belong to the value range.
   * @param value The tested value.
   * @returns True, if and only if the given value belongs to the value range.
   */
  contains(value: Type): boolean {
    return (
      (this.lowerBoundary === undefined ||
        this.lowerBoundary.compareTo(value).valueOf() >=
        (this.includesLowerBoundary ? 0 : 1)) &&
      (this.upperBoundary === undefined ||
        this.upperBoundary.compareTo(value).valueOf() <=
        (this.includesUpperBoundary ? 0 : -1))
    );
  }

  /**
   * Does the range have lower boundary.
   */
  get hasLowerBoundary(): boolean {
    return this.lowerBoundary !== undefined;
  }

  /**
   * Does the range have upper boundary.
   */
  get hasUpperBoundary(): boolean {
    return this.upperBoundary !== undefined;
  }

  /**
   * Get the upper boundary.
   * @returns The upper boundary.
   * @throws {Error} The upper boundary does not exist.
   */
  getUpperBoundary(): Type {
    const result = this.upperBoundary;
    if (result === undefined) {
      throw new Error("The upper boundary does not exist");
    } else {
      return result;
    }
  }

  /**
   * Get the lower boundary.
   * @returns The lower boundary.
   * @throws {Error} The lower boundary does not exist.
   */
  getLowerBoundary(): Type {
    const result = this.lowerBoundary;
    if (result === undefined) {
      throw new Error("The lower boundary does not exist");
    } else {
      return result;
    }
  }

  /**
   * Is the interval empty.
   */
  get isEmpty(): boolean {
    return (
      this.hasLowerBoundary &&
      this.hasLowerBoundary &&
      this.upperBoundary !== undefined &&
      this.lowerBoundary !== undefined &&
      this.lowerBoundary.compareTo(this.upperBoundary).valueOf() >=
      (this.includesLowerBoundary ? 1 : 0) +
      (this.includesUpperBoundary ? 1 : 0)
    );
  }

  /**
   * Get the value range with upper boundary moved to the given value, if
   * that will reduce the range.
   * @param value The value limiting the upper boundary.
   * @returns The value range with redefined upper boundary, if necessary.
   * If no redefining is required, the current range is returned.
   */
  refineUpperBoundary(value: Type | undefined): ValueRange<Type> {
    if (value === undefined ||
      (this.hasUpperBoundary &&
        value.compareTo(this.getUpperBoundary()).isGreater)) {
      return this;
    } else {
      return new ValueRange(
        this.lowerBoundary,
        value,
        this.includesLowerBoundary,
        this.includesUpperBoundary
      );
    }
  }

  /**
   * Get the value range with lower boundary moved to the given value, if
   * that will reduce the range.
   * @param value The value limiting the lower boundary.
   * @returns The value range with redefined lower boundary, if necessary.
   * If no redefining is required, the current range is returned.
   */
  refineLowerBoundary(value: Type | undefined): ValueRange<Type> {
    if (value === undefined ||
      (this.hasLowerBoundary &&
        value.compareTo(this.getLowerBoundary()).isLesser)) {
      return this;
    } else {
      return new ValueRange(
        value,
        this.upperBoundary,
        this.includesLowerBoundary,
        this.includesUpperBoundary
      );
    }
  }

  /**
   * Expands the upper boundary of the range, if necessary.
   * @param value The new upper boundary, if this expands the boundary.
   * @returns The new value range with greater of the current upper boundary,
   * and the current upper boundary.
   */
  expandUpperBoundary(value: Type | undefined): ValueRange<Type> {
    if (this.hasUpperBoundary) {
      if (value === undefined || this.getUpperBoundary().compareTo(value).isLesser) {
        return new ValueRange(this.lowerBoundary, value, this.includesLowerBoundary, this.includesUpperBoundary);
      }
    }
    // The boundary does not change.
    return this;
  }

  /**
   * Expands the lower boundary of the range, if necessary.
   * @param value The new lower boundary, if this expands the boundary.
   * @returns The new value range with lesser of the current lower boundary,
   * and the current lower boundary.
   */
  expandLowerBoundary(value: Type | undefined): ValueRange<Type> {
    if (this.hasLowerBoundary) {
      if (value === undefined || this.getLowerBoundary().compareTo(value).isGreater) {
        return new ValueRange(value, this.upperBoundary, this.includesLowerBoundary, this.includesUpperBoundary);
      }
    }
    // The boundary does not change.
    return this;
  }

  /**
   * Expand boundaries to get the value wihtin the boundary.
   * @param value The value included in the boundary.
   * @throws {Error} The boundary cannot be expanded as it an open boundary.
   */
  expand(value: Type): ValueRange<Type> {
    if (this.contains(value)) {
      return this;
    } else {
      let result: ValueRange<Type> | undefined = this;
      if (result?.hasLowerBoundary && this.getLowerBoundary().compareTo(value).isGreater) {
        if (result.includesLowerBoundary) {
          result = result.expandLowerBoundary(value);
        } else {
          result = undefined;
        }
      }
      if (result?.hasUpperBoundary && this.getUpperBoundary().compareTo(value).isLesser) {
        if (result.includesUpperBoundary) {
          result = result.expandUpperBoundary(value);
        } else {
          result = undefined;
        }
      }
      if (result !== undefined) {
        return result;
      }
    }
    throw new Error("Cannot expand the boundary to include the value in the range due open boundary");
  }

  /**
   * Create the upper open ended range excluding the upper boundary.
   * This is the range used by the Java by default.
   * @param lowerBoundary The lower boundary.
   * @param upperBoundary The upper boundary.
   * @returns The valeu range including the lower boundary, and excluding the upper boundary.
   */
  static upperOpenEnded<Type extends Comparable<Type>>(
    lowerBoundary: Type | undefined,
    upperBoundary: Type | undefined
  ): ValueRange<Type> {
    return new ValueRange(lowerBoundary, upperBoundary, true, false);
  }

  /**
   * Create the lower open ended range excluding the lower boundary.
   * @param lowerBoundary The lower boundary.
   * @param upperBoundary The upper boundary.
   * @returns The valeu range including the lower boundary, and excluding the upper boundary.
   */
  static lowerOpenEnded<Type extends Comparable<Type>>(
    lowerBoundary: Type | undefined,
    upperBoundary: Type | undefined
  ) {
    return new ValueRange(lowerBoundary, upperBoundary, false, true);
  }

  /**
   * Create a closed range.
   * @param lowerBoundary The lower boundary.
   * @param upperBoundary The upper boundary.
   * @returns The valeu range including both the lower boundary, and the upper boundary.
   */
  static closedRange<Type extends Comparable<Type>>(
    lowerBoundary: Type | undefined,
    upperBoundary: Type | undefined
  ): ValueRange<Type> {
    return new ValueRange(lowerBoundary, upperBoundary, true, true);
  }

  /**
   * Comparison of the value ranges. The value range order is defined by the
   * lower boudary comparison first, and if the lower boundaries are equivalent,
   * the upper boundary. Ranges are equals only if they are same range.
   * - Only an exlusive boundary is equal to an exclusive boundary of the same value.
   * - Only an inclusive boundary is equal to an inclusive boundary of hte same value.
   * - An exclusive lower boundary is greater than the inclusive lower boundary of the same value
   * - An exclusive upper boudnary is lesser than the inclusive upper boundary of the same value.
   * @param other The other value range.
   * @reutrn The comparison result.
   */
  compareTo(other: ValueRange<Type>): ComparisonResult {
    if (this.hasLowerBoundary && other.hasLowerBoundary) {
      let result = this.getLowerBoundary().compareTo(other.getLowerBoundary());
      if (result.isEqual) {
        // Checking the inclusiveness.
        if (this.includesLowerBoundary !== other.includesLowerBoundary) {
          // The result is determined by the inclusiveness.
          result = getComparisonResult(this.includesLowerBoundary ? -1 : 1);
        } else {
          // The lower boundaries are the same value, thus comparing upper boundaries.
          if (this.hasUpperBoundary && other.hasUpperBoundary) {
            result = this.getUpperBoundary().compareTo(
              other.getUpperBoundary()
            );
          } else if (this.hasUpperBoundary) {
            // The lack of boundary is infinitely far away from the defined value.
            result = getComparisonResult(Number.NEGATIVE_INFINITY);
          } else {
            // The lack of boundary is infinitely far away from the defiend value.
            result = getComparisonResult(Number.POSITIVE_INFINITY);
          }

          if (result.isEqual &&
            this.includesUpperBoundary !== other.includesUpperBoundary) {
            // The result is detemrined by the inclusiveness.
            result = getComparisonResult(this.includesUpperBoundary ? 1 : -1);
          }
        }
      }
      return result;
    } else if (this.hasLowerBoundary) {
      // The distance is the positive infinity.
      return getComparisonResult(Number.POSITIVE_INFINITY);
    } else {
      // The distance is the negative infinity.
      return getComparisonResult(Number.NEGATIVE_INFINITY);
    }
  }
}
