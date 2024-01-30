import { Integer, getComparisonResult } from "./comparison.js";

/**
 * The definitions of the calendar and temporal fields.
 */
export namespace Definitions {
  /**
   * The temporal interval names.
   */
  export enum Intervals {
    DAYS = "days",
    WEEKS = "weeks",
    MONTHS = "months",
    QUARTERS = "quarters",
    YEARS = "years",
    DECENNIALS = "decennials",// The ten years.
    CENTURYS = "centuries",// The century. 
    CYCLES = "cycles",// The cycle of the calendar, if it has any.
    ERAS = "eras"
  }

  /**
   * The base intervals.
   */
  export type BaseInterval = (Intervals.DAYS | Intervals.MONTHS | Intervals.YEARS | Intervals.ERAS);

  /**
   * The derived intervals.
   */
  export type DerivedInterval = Exclude<Interval, BaseInterval>;

  /**
   * The type of the intervals.
   */
  export type Interval = keyof typeof Intervals;

  /**
   * The type of the base fields.
   *
   * The only mandatory fields are DAY_OF_YEAR and CANONICAL_YEAR.
   * The YEAR may be replaced with either YEAR or both YEAR_OF_ERA and ERA.
   */
  export enum BaseFields {
    /**
     * The generic day field.
     */
    day = "day",
    /**
     * The day of year is combined with YEAR.
     */
    dayOfYear = "dayOfYear",
    /**
     * The generic year. Defaults to CANONICAL_YEAR.
     */
    year = "year",
    /**
     * A canonical year represents a continuous year increasing towards
     * the future.
     */
    canonicalYear = "canonicalYear"
  }

  /**
   * The optional fields derived from either the CANONICAL_YEAR
   * or from DAY_OF_YEAR and CANONICAL_YEAR.
   */
  export enum DerivedFields {

    /**
     * The date consitss of DAY, MONTH, YEAR, and possibly ERA.
     */
    date = "date",

    /**
     * A week represents either a week. The week scope is DAYS.
     */
    week = "week",

    /**
     * The day of week.
     */
    dayOfWeek = "dayOfWeek",

    /**
     * The day of month is always combined with a month.
     */
    dayOfMonth = "dayOfMonth",

    /**
     * The week of month.
     */
    weekOfMonth = "weekOfMonth",

    /**
     * The week of year.
     */
    weekOfYear = "weekOfYear",


    /**
     * The month is a month of year by default, but other calendars may
     * implement a month of quarter.
     */
    month = "month",

    /**
     * The month of quarter.
     */
    monthOfQuarter = "monthOfQuarter",

    /**
     * A month of year is tied to a YEAR.
     */
    monthOfYear = "monthOfYear",

    /**
     * A quarter represents a quarter.
     */
    quarter = "quarter",

    /**
     * The quarter of year.
     */
    quarterOfYear = "quarterOfYear",
    /**
     * A year of era. The direction of increment of the year of era is not
     * limited.
     */
    yearOfEra = "yearOfEra",
    /**
     * The era represents the era.
     */
    era = "era"
  }

  /**S
   * The generic fields.
   */
  export type GenericField = (BaseFields.day | DerivedFields.week | DerivedFields.month | DerivedFields.quarter | BaseFields.year |
    DerivedFields.era);

  /**
   * Is the feild a generic field.
   * @param field The tested field.
   * @returns True, if and only if the field is a generic field.
   */
  export function isGenericField(field: string): field is GenericField {
    return [BaseFields.day,DerivedFields.week, DerivedFields.month, DerivedFields.quarter, BaseFields.year, 
      DerivedFields.era].find( (value) => (value === field)) != null;
  }
  

  /**
   * The type of a base feild.
   */
  export type BaseField = keyof typeof BaseFields;

  /**
   * The type of a derived feild.
   */
  export type DerivedField = keyof typeof DerivedFields;

  /**
   * A field known to the defintions.
   */
  export type Field = (BaseField | DerivedField);

  /**
   * A temporal instance is a generic field containing instance.
   */
  export type TemporalInstance = Partial<{
    [Property in GenericField]: Integer;
  }>;


  /**
   * Get the base field of given temporal instance.
   * @param fields The temporal fields instance.
   * @returns The base field matching to the combination
   * of the fields in the temporal instance.
   */
  export function getField(fields: TemporalInstance, baseField: GenericField): Field | undefined {

    if (!(baseField in fields)) {
      // The temporal instance does not have the generic field.
      return undefined;
    }

    switch (baseField) {
      case BaseFields.day:
        if (DerivedFields.week in fields) {
          return DerivedFields[DerivedFields.dayOfWeek];
        } else if (DerivedFields.month in fields) {
          return DerivedFields[DerivedFields.dayOfMonth];
        } else if (BaseFields.year in fields) {
          return BaseFields[BaseFields.dayOfYear];
        } else {
          return undefined;
        }
      case BaseFields.year:
        if (DerivedFields.era in fields) {
          return DerivedFields[DerivedFields.yearOfEra];
        } else {
          return BaseFields[BaseFields.canonicalYear];
        }
      case DerivedFields.week:
        if (DerivedFields.month in fields) {
          return DerivedFields[DerivedFields.weekOfMonth];
        } else if (BaseFields.year in fields) {
          return DerivedFields[DerivedFields.weekOfYear];
        } else {
          return undefined;
        }
      case DerivedFields.month:
        if (DerivedFields.quarter in fields) {
          return DerivedFields[DerivedFields.monthOfQuarter];
        } else if (BaseFields.year in fields) {
          return DerivedFields[DerivedFields.monthOfYear];
        } else {
          return undefined;
        }
      case DerivedFields.quarter:
        if (BaseFields.year in fields) {
          return DerivedFields[DerivedFields.quarterOfYear];
        } else {
          return undefined;
        }
      case DerivedFields.era:
        return DerivedFields[baseField];
      default:
        return undefined;
    }
  } // funciton getField
} // namespace Definitions

