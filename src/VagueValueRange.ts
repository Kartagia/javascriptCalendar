import { ValueRange } from "./ValueRange";
import { Comparable } from "./comparison";

/**
 * A Vague value range defines boundaries as ranges instead of using fixed values.
 */

export class VagueValueRange<Type extends Comparable<Type>> extends ValueRange<
  ValueRange<Type>
> {
  constructor(
    lowerBoundary: ValueRange<Type> | undefined,
    upperBoundary: ValueRange<Type> | undefined,
    includeLowerBoundary: boolean,
    includeUpperBoundary: boolean
  ) {
    super(
      lowerBoundary,
      upperBoundary,
      includeLowerBoundary,
      includeUpperBoundary
    );
  }


  /**
   * Create the value range boundary equivalent to the given boundary.
   * @param boundary The boundary candidate.
   * @returns The value range boundary equivalent tot he given boundary.
   */
  static createBoundary<Type extends Comparable<Type>>(
    boundary: Type | ValueRange<Type> | undefined
  ): ValueRange<Type> | undefined {
    if (typeof boundary === "undefined") {
      return boundary;
    } else if (boundary instanceof ValueRange) {
      return boundary;
    } else {
      return ValueRange.closedRange(boundary, boundary);
    }
  }

  /**
   * Create a new vague value range.
   * @param lowerBoundary The lower boundary.
   * @param upperBoundary THe upper boundary.
   * @param includeLowerBoundary Does the range include the lower boundary.
   * @param includesUpperBoundary Does the range include the upper boundary.
   * @returns
   */
  static create<Type extends Comparable<Type>>(
    lowerBoundary: ValueRange<Type> | undefined | Type,
    upperBoundary: ValueRange<Type> | undefined | Type,
    includeLowerBoundary: boolean,
    includesUpperBoundary: boolean
  ): VagueValueRange<Type> {
    return new VagueValueRange<Type>(
      VagueValueRange.createBoundary(lowerBoundary),
      VagueValueRange.createBoundary(upperBoundary),
      includeLowerBoundary,
      includesUpperBoundary
    );
  }


  /**
   * Get the lower boundary of the range boundary.
   * @param boundary The tested boundary.
   * @returns The lower boundary of the range boundary.
   */
  static getBoundaryMinimum<Type extends Comparable<Type>>(boundary: ValueRange<Type> | undefined): Type | undefined {
    if (typeof boundary !== "undefined" && boundary.hasLowerBoundary) {
      return boundary.getLowerBoundary();
    } else {
      return undefined;
    }
  }

  /**
   * Get the upper boundary of the range boundary.
   * @param boundary The tested boundary.
   * @returns The upper boundary of the range boundary.
   */
  static getBoundaryMaximum<Type extends Comparable<Type>>(boundary: ValueRange<Type> | undefined): Type | undefined {
    if (typeof boundary !== "undefined" && boundary.hasUpperBoundary) {
      return boundary.getUpperBoundary();
    } else {
      return undefined;
    }
  }


  /**
   * The smallest possible lower boundary.
   */
  get minimalLowerBoundary(): Type | undefined {
    if (this.hasLowerBoundary) {
      return VagueValueRange.getBoundaryMinimum(this.getLowerBoundary());
    } else {
      return undefined;
    }
  }

  /**
   * The largest possible lower boundary.
   */
  get maximalLowerBoundary(): Type | undefined {
    if (this.hasLowerBoundary) {
      return VagueValueRange.getBoundaryMaximum(this.getLowerBoundary());
    } else {
      return undefined;
    }
  }

  /**
   * The smallest possible upper boundary.
   */
  get minmalUpperBoundary(): Type | undefined {
    if (this.hasUpperBoundary) {
      return VagueValueRange.getBoundaryMinimum(this.getUpperBoundary());
    } else {
      return undefined;
    }

  }

  /**
   * The largest possible upper boundary.
   */
  get maximalUpperBoundary(): Type | undefined {
    if (this.hasUpperBoundary) {
      return VagueValueRange.getBoundaryMaximum(this.getUpperBoundary());
    } else {
      return undefined;
    }
  }


  /**
   * Create a new vague range by expanding the lower boundary to include the given value.
   * - If the value is within the boundary, the boundary minimum is changed to the given value.
   * - IF the value is less than the boundary minimum, the boundary minimum is moved to the given value.
   * - If the value is greater than the boundary maximu, teh boundary maximum is moved to the given value.
   * @param lowerBoundary The value the lower boundary is expanded to.
   * @returns The new vague boundary with adjusted lower boundary.
   */
  expandLowerBoundary(lowerBoundary: Type | undefined): VagueValueRange<Type> {
  }

  expandUpperBoundary(upperBoundary: Type | undefined): VagueValueRange<Type> {
    if (this.hasUpperBoundary) {
      if (upperBoundary === undefined || this.maximalUpperBoundary?.compareTo(upperBoundary)?.isGreater) {
        return VagueValueRange.create(this.lowerBoundary, upperBoundary, this.includesLowerBoundary, this.includesUpperBoundary);
      } else if (this.minmalUpperBoundary?.compareTo(upperBoundary)?.isLesser) {
        return VagueValueRange.create(this.lowerBoundary,
          new ValueRange(upperBoundary, this.maximalUpperBoundary, this), this.includesLowerBoundary, this.includesUpperBoundary);
      }
    }
    return this;
  }
}
