import { UnsupportedFieldException } from "./exceptions";
import { ValueRange } from "./ValueRange";
import { Comparable, ComparableInteger } from "./comparison";

/**
 * The interface of the temporal fieldly for storing a temporal fielld.
 */
export interface TemporalFieldly {
  /**
   * The base accuracy of the temporal field.
   */
  baseField: TemporalFieldly | undefined;

  /**
   * The name of the field.
   */
  fieldName: string;

  /**
   * The supported fields. This list must include the field name.
   */
  supportedFieldsNames: string[];

  /**
   * The supported field definitions. This list must include the field name
   * for definition of the valid values.
   */
  supportedFieldDefinitions: Record<string, FieldDefinition>;

  /**
   * The fields equivalent with the temporal fieldly.
   */
  equivalentFields: (TemporalFieldly | string)[];

  /**
   * Create an instance of the field.
   * @param value The value of the field.
   * @throws {RangeError} The field value was invalid.
   */
  createInstance(value: number): TemporalFieldlyValue;

  /**
   * Get value range of the temporal field with value.
   * @param field The temporal field.
   * @param value The value of the current field.
   * @throws {UnsupportedFieldException} The field is not supported by the temporal fieldly.
   * @throws {RangeError} The given field value is invalid.
   */
  getValueRange(
    field: TemporalFieldly,
    value: number | ComparableInteger
  ): ValueRange<ComparableInteger>;

  /**
   * Get value range of the temporal field.
   * @param field The temporal field.
   * @throws {UnsupportedFieldException} The field is not supported by the temporal fieldly.
   */
  getValueRange(field: TemporalFieldly): ValueRange<ComparableInteger>;

  /**
   * Get value range of the current temporal field with value.
   * @param value The value of the current field.
   * @throws {RangeError} The given field value is invalid.
   */
  getValueRange(value: number | ComparableInteger): ValueRange<ComparableInteger>;

  /**
   * Get value range of the current temporal field with value.
   * @return The value range of the current field.
   */
  getValueRange(): ValueRange<ComparableInteger>;
}

/**
 * The definition of a field.
 */
export interface FieldDefinition {
  /**
   * The field name.
   */
  readonly fieldName: string;
  /**
   * The field as object, if it exists.
   */
  readonly field: TemporalFieldly | undefined;

  /**
   * The range of valid values.
   */
  readonly range: ValueRange<ComparableInteger>;
}


/**
 * Create a value range.
 * @param value The value range boundary.
 */
export function createRange<Type extends Comparable<Type>>(
  value: ValueRange<Type>
): ValueRange<Type>;

/**
 * Create a value range from a single value.
 * @param value The value defining the created range.
 * @returns The value range boundary equivalent to the given fixed boundary.
 */
export function createRange<Type extends Comparable<Type>>(
  value: Type
): ValueRange<Type>;

/**
 * Create an undefined value range.
 * @param value The undefined value range.
 * @returns An undefined value range.
 */
export function createRange<Type extends Comparable<Type>>(
  value: undefined
): undefined;

/**
 * Create the value range equivalent to the given value.
 * @param value The boundary candidate.
 * @returns The value range boundary equivalent tot he given boundary.
 */
export function createRange<Type extends Comparable<Type>>(
  value: Type | ValueRange<Type> | undefined
): ValueRange<Type> | undefined {
  if (typeof value === "undefined") {
    return value;
  } else if (value instanceof ValueRange) {
    return value;
  } else {
    return ValueRange.closedRange(value, value);
  }
}

/**
 * The temporal fieldly value. All temporal fieldlys store values
 * as numbers.
 */
interface TemporalFieldlyValue {
  /**
   * The field whose value the temporal fieldly represents.
   */
  get field(): TemporalFieldly;

  /**
   * The temporal field value. If the value is undefined, teh field has no value.
   */
  get value(): number | undefined;

  /**
   * The getter of the field name.
   */
  get fieldName(): string;

  /**
   * Get a derived field.
   * @param field The field, whose value is used to refine the value.
   * @param value The value of the field.
   * @throws {UnsupportedFieldException} The derived field is not supported by the
   * current field.
   */
  deriveField(
    field: TemporalFieldly,
    value: number | ComparableInteger
  ): TemporalFieldly;

  /**
   * Get the valeu range of the field.
   * @param field The temporal field.
   * @throws {UnsupportedFieldException} The given field is not supported by the current field value.
   */
  getFieldRange(field: TemporalFieldly): ValueRange<ComparableInteger>;
}

/**
 * Temporal interval. 
 */
interface TemporalInterval {
  /**
   * The base field of the temporal interval.
   */
  readonly baseField: TemporalFieldly;

  /**
   * The name of the temporal interval.
   */
  readonly fieldName: string;

  /**
   * Does the interval support a scope.
   * @param scope The queried scope. 
   * @returns True, if and only if the interval supports the scope.
   */
  supportsField(scope: TemporalFieldly | TemporalInterval |string): boolean;

  /**
   * Get the value range of the base field.
   */
  getValueRange(): ValueRange<ComparableInteger>;

  /**
   * Get the valeu range of the given scope.
   * @param scope The scope of the interval.
   * @returns The temporal base range of the temporal friendly.
   * @throws {UnsupportedFieldException} The scope is not supported by the interval.
   */
  getValueRange(scope: TemporalFieldly): ValueRange<ComparableInteger>;
}

interface TemporalFieldOptions {
  /**
   * The fields equivalent to the current field.
   */
  equivalentFields: string[]|undefined;

  /**
   * The offsets of the fields to the base field.
   */
  offsets: Record<string, number>;
}

/**
 * A temporal field represents an implementation of the temporal fieldly.
 */
export class TemporalField<Base extends TemporalFieldly> implements TemporalFieldly {

  /**
   * The base field of the temporal field.
   */
  readonly baseField: Base;

 
  /**
   * The field offsets when calculating values from the base calendar dates.
   */
  readonly offsets: Record<string, number>;

  constructor(baseField: Base, options: TemporalFieldOptions) {
    this.baseField = baseField;
    this.supportedFieldDefinitions = baseField.supportedFieldDefinitions;
    this.equivalentFields = [baseField.fieldName, ...(options.equivalentFields || [])];
    this.offsets = {...(options.offsets || {})};
  }
  supportedFieldDefinitions: Record<string, FieldDefinition>;
  equivalentFields: (string | TemporalFieldly)[];
  createInstance(value: number): TemporalFieldlyValue {
    if (this.getValueRange().contains(new ComparableInteger(value))) {
      return {
        field: this.baseField,
        get fieldName: This.baseField.fieldName,
        value
      } as TemporalFieldlyValue;
    } else {
      throw new RangeError(`The ${value} is not a valid value of ${this.fieldName}`)
    }
  }
  getValueRange(field: TemporalFieldly, value: number | ComparableInteger): ValueRange<ComparableInteger>;
  getValueRange(field: string, value: number | ComparableInteger): ValueRange<ComparableInteger>;
  getValueRange(): ValueRange<ComparableInteger>;
  getValueRange(field?: unknown, value?: unknown): ValueRange<ComparableInteger> {
    if (field === undefined) {
      // The field is not given. The value does not matter in this case.
      return this.supportedFieldDefinitions[this.fieldName].range;
    }
    const fieldName : string = typeof field === "string" ? field : (field as TemporalFieldly).fieldName;
    if (fieldName in this.supportedFieldDefinitions) {
      // TODO: Add refinement of the range due current field value.
      return this.supportedFieldDefinitions[fieldName].range;
    } else {
      throw new UnsupportedFieldException(``, null, typeof field === "string" ? field : (field as TemporalFieldly))
    }
  }

  get fieldName() {
    return this.baseField.fieldName;
  }
  
  
}

/**
 * Teh basic instance type for a temporal instance mapping field names
 * to field values.
 */
type TemporalInstance = Record<string, number|ComparableInteger>;


namespace Definitions {
  export enum Intervals {
    DAYS = "days",
    MONTHS = "months",
    YEARS = "years",
    DECENNIALS = "decennials",
    CENTURYS = "century", // The
    CYCLES = "cycles", // The cycle of the calendar, if it has any.
  }

  export type Interval = keyof typeof Intervals;

  export enum BaseFields {
    DATE = "date",
    DAY = "day",
    DAY_OF_MONTH = "dayOfMonth",
    DAY_OF_YEAR = "dayOfYear",
    MONTH = "month",
    MONTH_OF_YEAR = "monthOfYear",
    YEAR = "year",
    CANONICAL_YEAR = "canonicalYear",
    YEAR_OF_ERA = "yearOfEra",
    ERA = "era"
  }

  export type BaseField = keyof typeof BaseFields;

  export function getInterval(key: Interval | string): TemporalInterval|undefined {
    if (typeof key === "string") {
      return ISOCalendar.getInterval(key);
    } else {
      return ISOCalendar.getInterval(Intervals[key]);
    }
    return undefined;
  }

  export function getField(fields : TemporalInstance) {
    if (BaseFields.MONTH in fields) {
    if (BaseFields.DAY in fields) {
      if ([BaseFields.YEAR, BaseFields.CANONICAL_YEAR, BaseFields.YEAR_OF_ERA].some( (fieldName) => (fieldName in fields))) {
        return BaseFields.DATE;
      } else {
        return BaseFields.DAY_OF_MONTH;
      }
    } else if ([BaseFields.YEAR, BaseFields.CANONICAL_YEAR, BaseFields.YEAR_OF_ERA].some( (fieldName) => (fieldName in fields))) {
      return BaseFields.MONTH_OF_YEAR;
    } else {
      return BaseFields.MONTH;
    }
  }
}

type SomeBaseFields = Partial<Definitions.BaseField>;

type FieldInstance<Types extends SomeBaseFields> = Record<Types, number|ComparableInteger>;

interface CalendarOptions {
  /**
   * The start of year. 
   * Defaults to the {MONTH 1, DAY 1}.
   */
  startOfYear: FieldInstance<BaseFields.DAY&BaseFields.MONTH&"calendar"> | undefined;
  /**
   * The leap year function. 
   * @param year the year of the calendar.
   * @returns True, if and only if the given year is leap year.
   */
  leapYear: ((year: number) => boolean) | undefined;

  /**
   * The offsets of the fields compared to the ISO calendar years at the
   * start of the year.
   * - Any calendar fields
   */
  offset: Record<string, number|((value:number)=>number)> | undefined;


  /**
   * The base calendar this calendar modifies. 
   */
  baseCalendar: Calendar | undefined;
}

export class Calendar {
  constructor(calendarName: string, calendarOptions: CalendarOptions) {}
}


/**
 * Create a new temporal fieldly.
 * @param base
 * @param fieldName
 * @param supportedFields
 * @param FieldDefintiion
 */
export function createTemporalFiedly(
  base: TemporalFieldly | undefined,
  fieldName: string,
  supportedFields: Record<string, FieldDefinition>,
  equivalentFields: (string | TemporalFieldly)[]
): TemporalFieldly {
  return {
    baseField: base,
    fieldName,
    supportedFields,
    get supportedFieldNames() {
      return Object.getOwnPropertyNames(this.supportedFields);
    },
    equivalentFields,
    createInstance(value: number): TemporalFieldly {},

    refineValueRange(
      field: TemporalFieldly | number,
      value: TemporalFieldly
    ): ValueRange<ComparableInteger> {
      return;
    },
  };
}

export class ISOCalendar {
  static getInterval(arg0: never): TemporalInterval {
    throw new Error("Method not implemented.");
  }
  static leapYear(year: number | ComparableInteger): boolean {
    const yearVal = year.valueOf();
    return (
      Number.isInteger(yearVal) &&
      yearVal % 4 === 0 &&
      (yearVal % 100 !== 0 || yearVal % 400 === 0)
    );
  }

  static Era: TemporalFieldly = createTemporalFiedly(null, "era", [
    "yearOfEra",
    "year",
    "monthOfYear",
    "dayOfMonth",
    "dayOfYear",
  ]);

  private supportedFields: string[];

  constructor() {
    this.supportedFields = ["era", "year", "month", "day"];
  }
}
