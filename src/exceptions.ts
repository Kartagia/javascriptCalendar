import { TemporalFieldly } from "./index";

/**
 * Calendar exceptions represents errors caused by the calendar module.
 */

export class CalendarException extends Error {
  /**
   * The cause of the error.
   */
  private cause: string | Error | undefined;

  /**
   * Create a new calendar exception.
   * @param message The message of the error.
   * @param cause The cause of the error.
   */
  constructor(message: string, cause: string | Error | undefined) {
    super(message);
    this.cause = cause;
    this.name = this.constructor.name; // Setting the error name.
  }

  /**
   * The stack trace of the error.
   * @returns {string} The cause stack trace.
   */
  protected getStackTrace(): string {
    switch (typeof this.cause) {
      case "string":
        return this.cause;
      case "object":
        return this.cause.stack || "";
      default:
        return "";
    }
  }
}
/**
 * The exception indicating the temporal field was not supported.
 */
export class UnsupportedFieldException extends CalendarException {
  /**
   * Get the field name.
   * @param field The field name or the temporal fieldly.
   * @returns The name of the field.
   */
  static getFieldName(field: string | TemporalFieldly): string {
    if (typeof field === "string") {
      return field;
    } else {
      return field.fieldName;
    }
  }

  /**
   * The invalid field.
   */
  private field: string | TemporalFieldly;

  /**
   * Create a new unsupported field exception.
   * @param message The message of the error message. Defaults to the message
   * compiled from the field.
   * @param cause The cause of the error.
   * @param field The unsupported field.
   */
  constructor(
    message: string | undefined,
    cause: string | Error | undefined,
    field: string | TemporalFieldly
  ) {
    super(
      message ??
      `Unsupported temporal field ${UnsupportedFieldException.getFieldName(
        field
      )}`,
      cause
    );
    this.field = field;
  }

  /**
   * The field name of the invalid field.
   */
  get fieldName(): string {
    return UnsupportedFieldException.getFieldName(this.field);
  }
}

/**
 * The error indicating invalid field value.
 */
export class InvalidFieldValue<Cause=(string|Error), Value=any> extends RangeError {

  /**
   * The cause of the error.
   */
  readonly cause: Cause|undefined;

  /**
   * The invalid value.
   */
  readonly value: Value;

  /**
   * Create an invalid value exception with given message, value, and cause.
   * @param message The message of the error. 
   * @param value The invalid value.
   * @param cause The cause of the error.
   */
  constructor(message: string, value: Value, cause: Cause|undefined) {
    super(message);
    this.cause = cause;
    this.value = value;
    this.name = this.constructor.name;
  }

 }