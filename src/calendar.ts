
/**
 * @module calendar
 *
 *¨The calendar containing module.
 */

import { ComparableInteger, Integer, isInteger } from "./comparison.js";
import { Definitions } from "./Definitions.js";
import { CalendarException, InvalidFieldValue, UnsupportedFieldException } from "./exceptions.js";
import { TemporalFieldly, FieldDefinitionFunction, TemporalFieldlyValue, FieldDefinition, TemporalInstance, TemporalInstance as FieldInstance, TemporalFieldsInstance, createRecord, FieldValueFunction } from "./temporal.js";
import { TemporalValueRange } from "./temporal.js";
import { VagueValueRange } from "./VagueValueRange.js";
import { ValueRange } from "./ValueRange.js";

/**
 * The field offset function.
 * @param canonicalValue The canonical field value.
 * @returns The actual field value.
 * @throws {UnsupportedFieldException} The given field is not supported by the current calendar.
 */
export type FieldOffsetFunction = (fieldName: string, canonicalValue: TemporalInstance) => Integer;

/**
 * The function determining the canonical field value from the calendar values.
 * @param calendarValues The calendar base field values.
 * @returns the canonical value of the field.
 * @throws {UnsupportedFieldException} The given field is not supported by the canonical calendar.
 */
export type CanonicalValueFunction = (fieldName: string, calendarValues: TemporalInstance) => Integer;

/**
 * The options used for calendar construction.
 */
interface CalendarOptions {
  /**
   * The start of year. 
   * Defaults to the {MONTH 1, DAY 1}.
   */
  startOfYear?: {[Definitions.BaseFields.day]: Integer}|{"day": Integer, "month": Integer};
  /**
   * The leap year function. 
   * @param year the year of the calendar.
   * @returns True, if and only if the given year is leap year.
   */
  leapYear?: ((year: number) => boolean);

  /**
   * The offsets of the canonical field values to get the actual field values.
   */
  offset?: Record<string, Integer|FieldOffsetFunction>;


  /**
   * The base calendar this calendar modifies. 
   */
  baseCalendar?: Calendar;

  /**
   * The supported field declarations.
   */
  supportedFieldDefinitions?: Map<string, FieldDefinition>|Record<string, FieldDefinition>;
}


/**
 * A factory constructing field definitions.
 */
export class FieldDefintionFactory<Type> {

  /**
   * The mapping from field name-value pairs and the partial
   * definition of the field values.
   */
  fieldValues: Map<string, Map<Type, Partial<FieldDefinition>>> = new Map();


  /**
   * Create a enw field definition factory.
   * @param entries The initial entries of the field definition.
   */
  constructor(entries?: Map<string, Map<Type, Partial<FieldDefinition>>>|Record<string, Map<Type, Partial<FieldDefinition>>>) {  
    if (entries !== undefined) {
    if (entries instanceof Map) {
      [...entries.entries()]  .forEach( ([fieldName, fieldValue]) => {
        this.fieldValues.set(fieldName, fieldValue);
      })
    } else {
      [ ...Object.getOwnPropertyNames(entries)].forEach( (fieldName) => {
        this.fieldValues.set(fieldName, entries[fieldName]);
      })
    }
  }
  }

  /**
   * Create a field defintion.
   * @param fieldName The wanted field name.
   * @param currentValue The current value of the field.
   * @throws {UnsupportedFieldException} The given field is not supported.
   * @throws {RangeError} The given current value is not supported.
   */
  createDefinition(fieldName: string, currentValue?: Type): FieldDefinition {
    let valueEntries : Map<Type, Partial<FieldDefinition>>|undefined;
    if (this.fieldValues.has(fieldName) && (valueEntries = this.fieldValues.get(fieldName)) !== undefined) {
      if (currentValue !== undefined && valueEntries.has(currentValue)) {
        return {
          fieldName, 
          field: undefined,
          range: ValueRange.closedRange(new ComparableInteger(1), new ComparableInteger(0)),
          supportedFields: {},
          ...(valueEntries.get(currentValue))
        };
      }
      throw new RangeError("Invalid current value");
    }
    // Fallback is the exception.
    throw new UnsupportedFieldException(undefined, undefined, fieldName);
  }

  /**
   * 
   * @returns The field definition function interface of the facotry instance.
   */
  asDefinitionFunction(): FieldDefinitionFunction {
    return FieldDefintionFactory.asDefinitionFunction(this);
  }

  /**
   * Create a function representation of the given intance.
   * @param instance The definition function whose field definition function construction is returend.
   * @returns 
   */
  static asDefinitionFunction<Type>(instance: FieldDefintionFactory<Type>): FieldDefinitionFunction {
    return Object.assign((fieldName: string, value?:Type) => instance.createDefinition(fieldName, value));
  }
}

/**
 * Builder for building temoral fields.
 */
export class FieldBuilder {
  
  /**
   * Create a field definition function.
   * @param fieldName The field name.
   * @param currentValue The current value
   * @param valueRange The value range.
   * @returns The temporal field 
   */
  static createFieldDefinitionFunction(
    fieldName: string,
    currentValue: ComparableInteger,
    valueRange: TemporalValueRange): FieldDefinitionFunction<Integer|ComparableInteger> {
    const resultFunction = (seekField: string, value?: Integer|ComparableInteger): FieldDefinition => {
      if (seekField === fieldName && (value === undefined || value.valueOf() === currentValue.valueOf())) {
	const resultDefinition = {
	  get fieldName(): string { return fieldName; },
	  get field(): TemporalFieldly|undefined { return undefined },
	  get range(): TemporalValueRange {
	    return valueRange;
	  },
	  get supportedFields(): Record<string, FieldDefinition|FieldDefinitionFunction<Integer|ComparableInteger>> {
	    return {
	      fieldName: resultFunction
	    }
	  }
	} as FieldDefinition;
  return resultDefinition;
      } else {
	throw new RangeError("The given value does not have a field definition");
      }
    };
    return resultFunction;
  }
  
  /**
   * The name of the created field.
   */
  readonly fieldName: Readonly<string>;

  /**
   * The field of the derived field.
   */
  field: TemporalFieldly|undefined = undefined;

  /**
   * The valid value range of the values.
   */
  values: TemporalValueRange;


  /**
   * The mapping from supported fields to the functions determining the field
   * definitions for of the field from the current field value.
   */
  supportedFields: Map<string, FieldBuilder>;
  
  constructor(fieldName: string) {
    this.fieldName = fieldName;
    this.values = VagueValueRange.closedRange<ComparableInteger>(undefined, undefined);
    this.supportedFields = new Map<string, FieldBuilder>();
    this.supportedFields.set(fieldName, new FieldBuilder(fieldName));
  }

  composeSupportedFields(): Record<string, FieldDefinition|FieldDefinitionFunction<number|ComparableInteger>> {
    const result : Record<string,  FieldDefinition|FieldDefinitionFunction<number|ComparableInteger>> = {};
    [...this.supportedFields.entries()].forEach( ([fieldName, builder]) => {
      result[fieldName] = builder.build();
    })

    return result;
  }



  /**
   * Build the field definition.
   * @returns The field definition of the current builder state.
   * @throws {Error} The current state is an incomplete state.
   */
  build(): FieldDefinition {
    return {
      fieldName: this.fieldName,
      field: this.field, 
      range: this.values,
      supportedFields: this.composeSupportedFields()
    };
  }
}



/**
 * The builder of a calendar.
 */
export class CalendarBuilder {

  /**
   * The calendar anme.
   */
  readonly calendarName: string;

  /**
   * Is the calendar bulider immutable returning new isntance
   * on all mutations instead of altering current object.
   */
  readonly immutable : boolean;

  /**
   * The field builders for building the calendar fields.
   */
  private fields: Map<string, FieldBuilder>;

  constructor(calendarName: string, fields?: Map<string, FieldBuilder>, isImmutable?:boolean) {
    this.calendarName = calendarName;
    this.immutable = isImmutable == true;
    this.fields = new Map();
  }

  addSupportedField(fieldName: string): CalendarBuilder {
    if (!this.fields.has(fieldName)) {
      if (this.immutable) {
        return new CalendarBuilder(this.calendarName, new Map([...this.fields.entries(), [fieldName, new FieldBuilder(fieldName)]]))
      } else {
        this.fields.set(fieldName, new FieldBuilder(fieldName));
      }
    }
    return this;
  }
  


}

/**
 * An instance of calendar value.
 */
export interface CalendarInstance extends TemporalFieldsInstance {

  /**
   * The calendar of the calendar instance.
   */
  readonly calendar: Calendar;

  /**
   * Get the instance base field value.
   * The base field is the first field of the required fields.
   */
  get(): Integer;

  /**
   * Get a field value.
   * @param fieldName The queried field name.
   * @return The value of the field.
   */
  get(fieldName?: string): Integer|undefined;


  /**
   * Get the derived calendar instance. 
   * @param fieldName The name of the derived field.
   * @returns The calendar instance derived by adding the given field with given field value
   * to the current calendar instance. An undefined value, if no such instance exists.
   * @throws {InvalidFieldValue} The given field value is not valid.
   * @throws {UnsupportedFieldException} The given field is not supported.
   */
  derive(fieldName: string, fieldValue: Integer): CalendarInstance;

  /**
   * Get the canonical value.
   * @param fieldName The queried field name.
   * @return The canonical field value of the base calendar.
   */
  getCanonical(fieldName?: string): Integer|undefined;

  /**
   * Set the field value.
   * @param fieldName The name of the set field.
   * @param value The new value of the field.
   * @returns The new calendar instance with the value set.
   * @throws {InvalidFieldValue} The field value was invalid.
   */
  set(fieldName: string, value: Integer): CalendarInstance;

  /**
   * Get the range of valid values.
   * @param fieldName The field name.
   * @return The valid value range of the field, if the field is known.
   */
  range(fieldName: string): TemporalValueRange|undefined;
}

/**
 * The constructor of a calendar instance.
 */
type CalendarInstanceConstructor<Type extends CalendarInstance> = (calendar: Calendar, fieldValues: FieldInstance) => Type;


/**
 * Declaration of a field instance from 
 */
interface FieldInstanceDeclaration {

  /**
   * The base field of the declaration.
   */
  baseField: Definitions.GenericField;

  /**
   * The allowd field instance types. Defaults to the base field.
   * The first matching field or definition determines the actula field value.
   * The first field of the list is the base field value of the field instance, and
   * the field instance value contains all the values of the fields.
   */
  allowedFields?: (Definitions.Field|FieldInstanceDeclaration)[];

}

/**
 * Declaration of a calendar instance. 
 */
interface CalendarInstanceDeclaration<Type extends CalendarInstance> extends FieldInstanceDeclaration {

  /**
   * The actual instance, or the constructor of the instance from any combination of the 
   * allowed field values.
   */
  instance: Type|CalendarInstanceConstructor<Type>;
}


export class BasicCalendarInstance implements CalendarInstance {

  /**
   * Get the allowed fields structure.
   * @param fieldStruct The field structure.
   * @returns The allowed fields list. The allowed fields list has a base field follwed
   *  by the required actual field, or additional generic field restraints.
   */
  static composeAllowedFields(fieldStruct: (string|(string|string[])[])[]): string[][] {
    return fieldStruct.reduce( 
      (result: string[][], fields: string|(string|string[])[]) => {
      return result.reduce( (newEntry: string[][], prefix: string[]) => {
        if (Array.isArray(fields)) {
            newEntry.push(...(fields.map( (newTail: (string|string[])) => {
                if (Array.isArray(newTail)) {
                  return [...prefix, ...newTail];
                } else {
                  return [...prefix, newTail];
                }
            })));
        } else {
          newEntry.push([...prefix, fields]);
        }
        return newEntry;
      }, [] as string[][]);
  }, [] as string[][]) as string[][];
  }


  /**
   * The calendar of the calendar instance.
   */
  public readonly calendar: Calendar;

  /**
   * The field definition.
   */
  protected definition: FieldDefinition;

  /**createInstance
   * The valeus of the field.
   */
  protected fieldValues: Record<string, Integer> = {};


  /**
   * Sets the field values of the calendar. THis method should be called during construction.
   * @param fieldValues The field values.
   * @throws {InvalidFieldValue} Some of the field values were invalid.
   */
  protected setFieldValues(fieldValues: FieldInstance|Record<string, Integer>) {
    const newValue = [...Object.getOwnPropertyNames(fieldValues)].reduce( (result: Record<string, Integer>, field: string|Definitions.Field) => {
      if (isInteger(result[field])) {
        result[field] = fieldValues[field] as Integer;
        return result;  
      } else {
        throw new InvalidFieldValue(`Field ${field} is not an integer`, null, field);
      }
    }, {});
    this.fieldValues = newValue;
  }

  /**
   * Pick the first matching allowed fields suitable for the calendar. 
   * @param calendar The claendar used to determine the result.
   * @param fields The fields instance value. 
   * @param allowedFields The list of allowed fields structures. 
   * @returns The field definition, if it does exist.
   */
  static createFieldValues(calendar: Calendar, fields: FieldInstance, allowedFields: string[][]): FieldInstance|Record<string, Integer>|undefined {
    if (allowedFields.length) {
      const fieldNames = allowedFields.find( (fieldList) => (
        fieldList.reduce( (result: {result: boolean, current?: Definitions.GenericField}, field : string) => {
          if (result.result) {
            // The base field changes. 
            if (Definitions.isGenericField(field)) {
              result.current = field;
            } else {
              // Checking if the field is derived from the base feild.
              result.result = result.current !== undefined && (Definitions.getField(fields, result.current) === field);
            }
          }
          return result;
        }, {result: true } as {result: boolean, current?:Definitions.GenericField}).result
      ));
    } else {
      return undefined;
    }
  }

  /**
   * Pick the first matching allowed field form allowed fields of the calendar, and retunr its definition.
   * @param calendar The claendar used to determine the result.
   * @param fields The fields instance value. 
   * @param allowedFields The list of allowed fields structures. 
   * @returns The field definition, if it does exist.
   */
  static createFieldDefinition(calendar: Calendar, fields: FieldInstance, allowedFields: string[][]): FieldDefinition|undefined {

    const fieldValues: FieldInstance|Record<string,Integer>|undefined = this.createFieldValues(calendar, fields, allowedFields);
    return fieldValues ? calendar.getFieldInstanceDefinition(fieldValues) : undefined;
  }


  /**
   * The base field names.
   */
  private baseFields: Set<string>;

  /**
   * The mapping from derived field names to the values of the derived fields or functions determining
   * the values from teh base fields.
   */
  private derivedFields: Map<string, Integer|FieldValueFunction>;

  constructor(calendar: Calendar, definition: FieldDefinition, fieldValues: FieldInstance|Record<string, Integer>, 
    requiredFields: Set<string>|undefined = undefined, 
    derivedFields : Map<string, Integer|FieldValueFunction>|undefined = undefined) {
    this.calendar = calendar;
    this.definition =  definition;
    this.setFieldValues(fieldValues);
    this.baseFields = (requiredFields ?? new Set(Object.getOwnPropertyNames(fieldValues)));
    this.derivedFields = (derivedFields ?? new Map());
  }

  getBaseFields(): Readonly<Set<string | TemporalFieldly>> {
    return this.baseFields;
  }

  getDerivedFields(): Readonly<Set<string | TemporalFieldly>> {
    return new Set(this.derivedFields.keys());
  }

  /**
   * Get the default values of the fields. 
   * @returns The default value mapping.
   */
  getDefaultValues(): Readonly<Map<string, Integer|FieldValueFunction>> {
    return this.derivedFields;
  }

  has(field: Readonly<string | TemporalFieldly>): boolean {
    if (typeof field === "string") {
      return field in this.fieldValues;
    } else {
      return field.fieldName in this.fieldValues;
    }
  }
  toRecord(): Record<string, Integer> {
    return createRecord(this.fieldValues, this.getBaseFields(), this.getDerivedFields(), this.getDefaultValues());
  }


  derive(fieldName: string, fieldValue: Integer): CalendarInstance {
    if (this.range(fieldName)?.contains(new ComparableInteger(fieldValue))) {
      return this.calendar.createInstance({...this.fieldValues, [fieldName]:fieldValue})
    }
    throw new UnsupportedFieldException(null, null, fieldName);
  }

  getRequiredFieldValues(): Array<Integer> {
    return [...this.getBaseFields()].map( (field) => {
      const fieldName = typeof field === "string" ? field : field.fieldName;
      if (fieldName in this.fieldValues) {
        return this.fieldValues[fieldName];
      } else {
        throw new Error(`Invalid required field ${fieldName}`);
      }
    });
  }

  get(): Integer;

  get(fieldName?: string): Integer|undefined {
    if (fieldName === undefined) {
      // Get the current field value.
      return this.fieldValues[this.definition.fieldName];
    } else if (fieldName in this.fieldValues) {
      return this.fieldValues[fieldName];
    } else if (this.getDerivedFields().has(fieldName)) {
      const value = this.getDefaultValues().get(fieldName);
      if (typeof value === "function") {
        return value(this.getRequiredFieldValues());
      } else {
        return value;
      }
    }
    
    
    return undefined;
    
  }

  getCanonical(fieldName?: string): Integer|undefined {
    if (fieldName === undefined || fieldName in this.fieldValues) {
      return this.calendar.getCanonicalValue(fieldName ?? this.definition.fieldName, this.fieldValues);
    } else {
      return undefined;
    }
  }

  range(fieldName: string): TemporalValueRange;

  range(fieldName?: string): TemporalValueRange {
    if (fieldName === undefined) {
      // Using the base field.
      const baseField:string|TemporalFieldly = this.getBaseFields().keys().next().value
      const baseFieldName = typeof baseField === "string"? baseField: baseField.fieldName;
      return this.range(baseFieldName);
    }
    if (this.definition?.supportedFields && fieldName in (this.definition.supportedFields)) {
      const fieldDefiner = this.definition.supportedFields[fieldName];
      if (typeof fieldDefiner === "function") {
        return fieldDefiner(fieldName, this.get()).range;
      } else {
        return fieldDefiner.range;
      }
    } else {
      throw new UnsupportedFieldException(null, null, fieldName);
    }
  }

  set(fieldName: string, value: Integer): CalendarInstance {
    if (this.definition?.supportedFields && fieldName in this.definition.supportedFields) {
      if (this.range(fieldName).contains(new ComparableInteger(value))) {
        return this.calendar.createInstance({...this.fieldValues, fieldName: value})
      } else {
        throw new InvalidFieldValue(`FIeld ${fieldName} does not allowe value ${value}`, value, null);
      }
    } else {
      throw new UnsupportedFieldException(null, null, fieldName);
    }
  }

}

const BaseFields = Definitions.BaseFields;
const DerivedFields = Definitions.DerivedFields;

export class YearInstance extends BasicCalendarInstance {


  /**
   * The allowed fields of the year.
   */
  static baseFields :string[][] = this.composeAllowedFields(
    [
      BaseFields.year,
      [BaseFields.canonicalYear, DerivedFields.yearOfEra]
    ]
  );


  constructor(calendar: Calendar, fields: FieldInstance,
    allowedFields: string[][]=YearInstance.baseFields) {
    const definition =YearInstance.createFieldDefinition(calendar, fields, allowedFields); 
    const fieldList = YearInstance.createFieldValues(calendar, fields, allowedFields);
    if (fieldList && definition) {
      super(calendar, definition, fieldList);
    } else {
      throw new RangeError("Could not create a year without proper year value");
    }
  }
}

export class DateInstance extends BasicCalendarInstance {

  /**
   * The allowed fields of the date.
   */
  static baseFields :string[][] = this.composeAllowedFields(
    [
      BaseFields.year,
      [BaseFields.canonicalYear, DerivedFields.yearOfEra],
      BaseFields.day,
      [DerivedFields.dayOfMonth, BaseFields.dayOfYear]
    ]
  );

  constructor(calendar: Calendar, fields: FieldInstance,
    allowedFields: string[][]=DateInstance.baseFields) {
    const definition =DateInstance.createFieldDefinition(calendar, fields, allowedFields); 
    const fieldList = DateInstance.createFieldValues(calendar, fields, allowedFields);
    if (fieldList && definition) {
      super(calendar, definition, fieldList);
    } else {
      throw new RangeError("Could not create a year without proper year value");
    }
  }

}

export class YearAndMonthInstance extends BasicCalendarInstance {

  /**
   * The allowed fields of the month and year.
   */
  static baseFields :string[][] = this.composeAllowedFields(
    [
      BaseFields.year,
      DerivedFields.month,
      [DerivedFields.monthOfYear]
    ]
  );

  constructor(calendar: Calendar, fields: FieldInstance,
    allowedFields: string[][]=YearAndMonthInstance.baseFields) {
    const definition =YearAndMonthInstance.createFieldDefinition(calendar, fields, allowedFields); 
    const fieldList = YearAndMonthInstance.createFieldValues(calendar, fields, allowedFields);
    if (fieldList && definition) {
      super(calendar, definition, fieldList);
    } else {
      throw new RangeError("Could not create a year without proper year value");
    }
  }

}

/**
 * The function determining the field range.
 * @param fields The set of required field values.
 */
export type FieldRangeFunction = ((values: Set<Integer|ComparableInteger>) => TemporalValueRange);

/**
 * Generic calendar.
 */
export class Calendar {
  canonicalRanges: any;
  getFieldInstanceDefinition(fieldValues: TemporalInstance | Record<string, Integer>): FieldDefinition {
    throw new Error("Method not implemented.");
  }
  getCanonicalValue(fieldName: string, fieldValues: Record<string, Integer>): Integer {
    throw new Error("Method not impsupportedFieldDefinitionslemented.");
  }

  /**
   * The name of the calendar.
   */
  public readonly calendarName: string;

  /**
   * The calendar this calendar is based on.
   */
  private readonly baseCalendar?: Calendar;


  /**
   * The start of year.
   */
  public readonly startOfYear: Partial<Omit<FieldInstance, Definitions.BaseFields.year|Definitions.DerivedFields.era>>;

  /**
   * The offsets of the base calendar fields, or to the ISO calendar
   * fields. 
   */
  private readonly offsets: Record<string, Integer|FieldOffsetFunction>;

  /**
   * The mapping from supported field names to the range of the field, or a function
   * determining the range from the field value from the canonical year and day of year.
   */
  private readonly fieldRanges: Record<string, (
    TemporalValueRange|FieldRangeFunction
  )>
  
  /**
   * Create a new calendar.
   * @param calendarName The unique name of the calendar.
   * @param calendarOptions The calendar options.
   */
  constructor(calendarName: string, calendarOptions?: CalendarOptions) {
    this.calendarName = calendarName;
    // The offsets defaults to an empty record.
    this.offsets = (calendarOptions?.offset|| {});

    // The base calendar defaults to undefined.
    this.baseCalendar = (calendarOptions?.baseCalendar || undefined);

    // Start of year defaults to the first day of year. 
    this.startOfYear = (calendarOptions?.startOfYear || {day: 1 as Integer});

    this.supportedFields = {};
    this.constructSupportedFields(calendarOptions?.supportedFieldDefinitions, this.baseCalendar);

    this.fieldRanges = {};
    this.canonicalRanges = {};
    const [additionalRanges, canonicalRanges] = this.constructFieldRanges(calendarOptions?.supportedFieldDefinitions, this.baseCalendar, this.offsets, this.startOfYear)
    if (additionalRanges) {
      this.fieldRanges = additionalRanges;
      if (canonicalRanges) {
        this.canonicalRanges = canonicalRanges;
      } else {
        this.canonicalRanges = additionalRanges;
      }
    }
  }
  constructFieldRanges(supportedFieldDefinitions?: Record<string, FieldDefinition> | Map<string, FieldDefinition>, baseCalendar?: Calendar, offsets?: Record<string, number | FieldOffsetFunction>, startOfYear?: Partial<Omit<TemporalInstance, Definitions.BaseFields.year | Definitions.DerivedFields.era>>): [Record<string, TemporalValueRange|FieldRangeFunction>, Record<string, TemporalValueRange|FieldRangeFunction>] {
    throw new Error("Method not implemented.");
  }
  constructSupportedFields(supportedFieldDefinitions: any, baseCalendar?: Calendar): Record<string, FieldDefinition> {
    throw new Error("Method not implemented.");
  }

  /**
   * The supported fields. 
   */
  private supportedFields: Record<string, FieldDefinition>;

  /**
   * Does the calendar support the given field.
   * @param fieldName The tested field name.
   * @returns True, if and only if the field name is supported by the calendar.
   */
  supportsField(fieldName: string): boolean {
    return fieldName in this.supportedFields;
  }

  /**
   * Does the calendar support all given field names.
   * @param fieldNames The tested dfield names
   * @returns True, if and only if the calendar supports all the given fields.
   */
  supportsAllFields(fieldNames: string[]): boolean {
    return fieldNames.length > 0 && fieldNames.every( (field) => this.supportsField(field));
  }

  /**
   * Get the field deifnition of the given field.
   * @param fieldName The field name.
   * @param baseField The base field used instead of field name, if field name is 
   * not supported.
   * @returns The field definition of the field.
   * @throws {UnsupportedFieldException} The field (and the base field) are not supported.
   */
  getFieldDefinition(fieldName: string, baseField?: string): FieldDefinition {
    if (this.supportsField(fieldName)) {
      return this.supportedFields[fieldName];
    } else if (baseField && this.supportsField(baseField)) {
      return this.supportedFields[baseField];
    }
    throw new UnsupportedFieldException(null, null, fieldName);
  }

  createInstanceDeclaration<Type extends CalendarInstance>(baseField: Definitions.GenericField, allowedFields?: Array<FieldInstanceDeclaration|CalendarInstanceDeclaration<Type>>, 
    instance?: Type|CalendarInstanceConstructor<Type>): CalendarInstanceDeclaration<Type> {
    
      const hasField = (fields: FieldInstance, baseField: Definitions.GenericField, tested: string|FieldInstanceDeclaration): boolean => {
        if (typeof tested === "string") {
          return Definitions.getField(fields, baseField) === tested;
        } else {
          return (tested?.allowedFields ?? [tested.baseField]).some( (allowed) => (
            allowed !== undefined && 
            typeof allowed === "string" ? hasField(fields, baseField, allowed) : 
            allowed instanceof Object && (allowed?.allowedFields ?? [allowed.baseField])
          ));
        }
      }

      if (instance === undefined) {
      // Generating the instantiator - all declarations without instantiation are ignored.
      return {
        baseField, 
        allowedFields: (allowedFields ?? []).filter( (field) => ("instance" in field)),
        instance: (calendar: Calendar, fields: FieldInstance): Type => {
          const declaration = ((allowedFields ?? []).filter( (field) => ("instance" in field))?.find( (fieldDef) => hasField(fields, baseField, fieldDef)));
          if (declaration && "instance" in declaration) {
            const instance = declaration.instance;
            try {
              if (typeof instance === "function") {
                return instance(calendar, fields);
              } else {
                return instance as Type;
              }
            } catch(error) {
            }
          }
          throw new CalendarException("Invalid instance definition", null);
        }
      }
    }
    
    return {
      baseField, 

      instance
    }
  }

  getDerivedFieldValue(fields: FieldInstance, field: string|Definitions.Field):Integer|undefined {
    if (this.supportsField(field)) {
      if (Definitions.isGenericField(field) && field in fields) {
        return fields[field];
      } else {
        switch (field) {
          case BaseFields.dayOfYear:
            if (Definitions.getField(fields, BaseFields.day) === BaseFields.dayOfYear) {
              return fields[BaseFields.day]
            } else if (Definitions.getField(fields, DerivedFields.month) === DerivedFields.monthOfYear) {
              // Calculating day of year.
              return this.createInstance({month: fields.month, year: fields.year, era: fields?.era}).derive(BaseFields.dayOfYear, fields?.day)?.get();
            } else {
              return undefined;
            }
          case DerivedFields.dayOfMonth: 
          if (Definitions.getField(fields, BaseFields.day) === BaseFields.dayOfYear) {
            // Calculate the day of month.
            return this.createInstance({day: fields.day, year: fields.year, era: fields?.era}).get(DerivedFields.dayOfMonth);
          } else if (Definitions.getField(fields, DerivedFields.month) === DerivedFields.monthOfYear) {
            return fields[BaseFields.day];
          } else {
            return undefined;
          }
        case DerivedFields.monthOfYear:

          default:
            return undefined;
        }
      }
    } else {
      return undefined;
    }
  }

  createInstance<Type extends CalendarInstance=CalendarInstance>(source: TemporalInstance): Type {
    const field = [ 
      this.createInstanceDeclaration(BaseFields.year, [
          {baseField:BaseFields.day, 
            allowedFields: [BaseFields.dayOfYear, DerivedFields.dayOfMonth], 
            instance: (calendar:Calendar, fields:FieldInstance) => new DateInstance(calendar, fields)
          } as CalendarInstanceDeclaration<DateInstance>,
          {
            baseField:DerivedFields.month, allowedFields: [DerivedFields.monthOfYear], 
            instance: (calendar:Calendar, fields:FieldInstance) => new YearAndMonthInstance(calendar, fields)
          } as CalendarInstanceDeclaration<YearAndMonthInstance>,
        ]) as CalendarInstanceDeclaration<CalendarInstance>,
      this.createInstanceDeclaration(BaseFields.year, undefined, (calendar, fields) => (new YearInstance(this, fields)))
    ].find( (fields) => {    
      return ((fields.allowedFields ?? []).some( (field) => (Definitions.getField(source, fields.baseField))))
    });
    if (field?.instance) {
      if (typeof field.instance === "function") {
        return field.instance(this, source) as Type;
      } else {
        return field.instance as Type;
      }
    } else {
      throw new CalendarException("The calendar instance does not exist", null);
    }
  }
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
  supportedFields: Record<string, FieldDefinition|FieldDefinitionFunction<Integer>>,
  equivalentFields: (string | TemporalFieldly)[]
): TemporalFieldly {
  const getFieldDefinition = (fieldName: string, currentValue?: Integer) => {
    if (fieldName in supportedFields) {
      const definition = supportedFields[fieldName];
      if (typeof definition === "function") {
        if (currentValue !== undefined) {
          const result = definition(fieldName, currentValue);
          if (result !== undefined) {
            return result;
          }
        }
      } else {
        return definition;
      }
    } else {
      throw new UnsupportedFieldException(null, null, fieldName);
    }
  }
  const result: TemporalFieldly = {
    baseField: base,
    fieldName,
    equivalentFields,
    get supportedFieldDefinitions(): Readonly<Record<string, FieldDefinition|FieldDefinitionFunction<Integer>>> {
      return supportedFields;
    },
    get supportedFieldsNames(): Readonly<string[]> {
      return [ ...Object.getOwnPropertyNames(supportedFields)];
    },
    createInstance(value: number): TemporalFieldlyValue {
      throw new Error("Method not implemented");
    },

    refineValueRange(
      field: TemporalFieldly | number,
      value: TemporalFieldly
    ): ValueRange<ComparableInteger> {
      throw new Error("Method not implemented");
    }, 
    getValueRange( fieldOrValue?: TemporalFieldly|Integer|ComparableInteger, 
      value?: Integer| ComparableInteger): Readonly<TemporalValueRange> {
      if (fieldOrValue === undefined) {
        // Teh call without field, and with sole value - recurse call with current result.
        return this.getValueRange(result, value);
      } else if (typeof fieldOrValue === "number" || fieldOrValue instanceof ComparableInteger) {
        // Call with only the field value - recurse with current result. 
        return this.getValueRange(result, fieldOrValue);
      } else if (value === undefined) {
        // The value is not given - calculating the range over all values.
        const fieldName = (typeof fieldOrValue === "string" ? fieldOrValue : fieldOrValue.fieldName);
        const result = getFieldDefinition(fieldName)?.range;
        if (result !== undefined) {
          return result;
        }
      } else {
        // The value is given.
        const fieldName = (typeof fieldOrValue === "string" ? fieldOrValue : fieldOrValue.fieldName);
        const result = getFieldDefinition(fieldName, value.valueOf() as Integer)?.range;
        if (result !== undefined) {
          return result;
        }
      }

      throw new UnsupportedFieldException(null, null, fieldOrValue);
    }


  } as TemporalFieldly;
  return result;
}

  /**
   * Convert a value to the comparable integer or undefined.
   * @param value The actual value with null mapped to undefined, and undefined to the default value.
   * @param defaultValue The default value. Defaults to undefined.
   * @returns The comparable integer, if the value is defined, or if the valeu is undefined and default value is defined. 
   * Otherwise returns undefined value.
   * @throws {RangeError} The defined value or default value was not an integer.
   */
  const toComparableInteger = (value: number|null|undefined, defaultValue?:number): ComparableInteger|undefined => {
    if (value === null) {
      return undefined;
    } else if (value === undefined) {
      return defaultValue === undefined ? undefined : new ComparableInteger(defaultValue);
    } else {
      return new ComparableInteger(value);
    }
  }


/**
 * Creates a value range. 
 * @param lowerBoundary The lower boundary with null mapping to lower unbounded range. Defaults to 1. 
 * @param upperBoundary The upper boundary with null mapping to upper unbounded range. Defaults to upper unbounded range.
 * @returns The value range with given boundaries.
 */
function createValueRange(lowerBoundary: Integer|null|undefined, upperBoundary: Integer|null|undefined): ValueRange<ComparableInteger>;



/**
 * Creates a value range. 
 * @param lowerBoundary The lower boundary with null mapping to lower unbounded range. Defaults to 1. 
 * @param upperBoundary The upper boundary with null mapping to upper unbounded range. Defaults to upper unbounded range.
 * @returns The value range with given boundaries.
 * @throws {RangeError} The lower or upper boundaries were not integers.
 */
function createValueRange(lowerBoundary: number|null|undefined, upperBoundary: number|null|undefined, 
  defaultLowerBoundary: null|number = 1, 
  defaultUpperBoundary: null|number = null): ValueRange<ComparableInteger> {
  

  const actualLowerBoundary : ComparableInteger|undefined = toComparableInteger(lowerBoundary, defaultLowerBoundary ?? undefined);
  const actualUpperBoundary : ComparableInteger|undefined = toComparableInteger(upperBoundary, defaultUpperBoundary ?? undefined);

  return ValueRange.closedRange(actualLowerBoundary, actualUpperBoundary);
}

/**
 * Creates a value range. 
 * @param lowerBoundary The lower boundary with null mapping to lower unbounded range. Defaults to 1. 
 * @param upperBoundary The upper boundary with null mapping to upper unbounded range. Defaults to upper unbounded range.
 * @returns The value range with given boundaries.
 * @throws {RangeError} The lower or upper boundaries were not integers.
 */
function createVagueValueRange(lowerBoundary: number|null|undefined, upperBoundary: number|null|undefined, 
  smallestLowerBoundary: null|number|undefined = undefined, 
  largestUpperBoundary: null|number|undefined = undefined): VagueValueRange<ComparableInteger> {
  

  if (smallestLowerBoundary != null && lowerBoundary == null)  {
    throw new RangeError("Invalid lower boundary - the lower boundary cannot be upper unbounded")
  }
  if (largestUpperBoundary != null && upperBoundary == null) {
    throw new RangeError("Invalid uppper boundary - the upper boundary cannot be lower unbounded")

  }

  // Creates the boundary range. 
  function createRange(lowerBoundary: null|number|undefined, upperBoundary?: null|number|undefined): ValueRange<ComparableInteger>|undefined {
    return lowerBoundary === undefined ? (upperBoundary == null ? undefined : createValueRange(
      toComparableInteger(upperBoundary)?.valueOf(), 
      toComparableInteger(upperBoundary)?.valueOf())) :
      (upperBoundary === undefined ? createValueRange(
        toComparableInteger(lowerBoundary)?.valueOf(),
        toComparableInteger(lowerBoundary)?.valueOf()) :
      createValueRange(toComparableInteger(lowerBoundary)?.valueOf(), toComparableInteger(upperBoundary)?.valueOf()) );
  }

  return VagueValueRange.create(
    createRange(smallestLowerBoundary, lowerBoundary), 
    createRange(upperBoundary, largestUpperBoundary), true, true); 
}


/**
 * The interface of the temporal field range definition.
 */
interface TemporalFieldRange {
  fieldName: string, 
  maxValue: Integer|undefined,
  minValue?: Integer|null,
  smallestMinValue?: Integer|null,
  largestMaxValue?: Integer|null,
  defaultMinValue?: Integer|undefined,
  defaultMaxValue?: Integer|undefined,
} 

export class ISOCalendar extends Calendar {

  static createFieldDefinition(
    fieldName: string, 
    maxValue: Integer|undefined, minValue?: Integer|null, largestMaxValue?: Integer|null, smallestMinValue?: Integer|null):FieldDefinition {
      if (smallestMinValue !== undefined) {
        if (smallestMinValue !== null && (minValue === null || (minValue ?? 1) < smallestMinValue)) {
          throw new RangeError("Invalid smallest minimum value: Empty lower boundary is not allowed");
        }
      }
      if (largestMaxValue !== undefined) {
        if (largestMaxValue !== null && (maxValue === undefined || (maxValue > largestMaxValue))) {
          throw new RangeError("Invalid largest maximum value: Empty upper boundary is not allowed");
        }
      }
      const range : VagueValueRange<ComparableInteger>|ValueRange<ComparableInteger> = 
      (largestMaxValue === undefined && smallestMinValue === undefined  ?
        ValueRange.closedRange(toComparableInteger(minValue), toComparableInteger(maxValue))
        :
          new VagueValueRange<ComparableInteger>(
          (smallestMinValue === undefined ? (minValue === null ? undefined : createValueRange(minValue, minValue)) : 
          createValueRange(smallestMinValue, minValue)),
          (smallestMinValue === undefined ? (minValue === null ? undefined : createValueRange(minValue, minValue)) : 
          createValueRange(smallestMinValue, minValue)), true, true));
      return {
        fieldName,
        field: undefined,
        range
      } 
  }

  static supportedFields:Record<string, FieldDefinition> = Object.fromEntries(
    [ 
      {fieldName: Definitions.BaseFields.canonicalYear, maxValue: undefined, minValue: null} as TemporalFieldRange, 
      {fieldName: Definitions.BaseFields.year, maxValue: undefined, minValue: 1 as Integer, largestMaxValue: null, smallestMinValue: null} as TemporalFieldRange, 
      {fieldName: Definitions.BaseFields.dayOfYear, maxValue: 365 as Integer, minValue: 1 as Integer, largestMaxValue: 366 as Integer} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.dayOfMonth, maxValue: 28 as Integer, minValue: 1 as Integer, largestMaxValue: 31 as Integer} as TemporalFieldRange, 
      {fieldName: Definitions.BaseFields.day, maxValue: undefined} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.month, maxValue: 12} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.dayOfWeek, maxValue: 7} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.week, maxValue: 52, largestMaxValue: 53} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.weekOfMonth, maxValue: 4, largestMaxValue: 6} as TemporalFieldRange, 
      {fieldName: Definitions.DerivedFields.month, maxValue: 12} as TemporalFieldRange, 
    ].map( (fieldRange) => (
      [fieldRange.fieldName, ISOCalendar.createFieldDefinition(fieldRange.fieldName, fieldRange.maxValue, 
        fieldRange?.minValue, fieldRange?.largestMaxValue, fieldRange?.smallestMinValue)])));

}


