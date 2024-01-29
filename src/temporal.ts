
import {ComparableInteger, Integer, PositiveInteger} from "./comparison";
import { ValueRange } from "./ValueRange";
import { VagueValueRange } from "./VagueValueRange";
import { Definitions } from "./Definitions";

/**
 * @module temporal
 * The module defining the temporal data types. 
 */

/**
 * The velue type of the temporal values.
 * (The canonical year requires integer instead of positive integer)
 */
export type ValueType = (Integer|PositiveInteger|ComparableInteger);


/**
 * A temporal instance placeholder.
 */
export type TemporalInstance = {[fieldName: string]:Integer};

/**
 * The function determining the field definition from the field name and the value.
 * @param fieldName The field name of the defined field.
 * @param value The current value used to determine the refinement of the definition.
 * @returns The field definition of the given field with the given value.
 * @throws UnsupportedFieldException The field is not supported.
 * @throws RangeError The given value was invalid. 
 */
export type FieldDefinitionFunction<Type = number> = (fieldName: string, value?:Type) => FieldDefinition;


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
  readonly range: (ValueRange<ComparableInteger>|VagueValueRange<ComparableInteger>);

  /**
   * The supported fields of the defined fields. 
   */
  readonly supportedFields?: Record<string, FieldDefinition|FieldDefinitionFunction<number|ComparableInteger>>;
}


/**
 * Temporal value range.
 */
export type TemporalValueRange = ValueRange<ComparableInteger>|VagueValueRange<ComparableInteger>

/**
 * The interface of the temporal fieldly for storing a temporal fielld.
 */
export interface TemporalFieldly {
  /**
   * The base accuracy of the temporal field.
   */
  readonly baseField: Readonly<TemporalFieldly> | undefined;

  /**
   * The name of the field.
   */
  readonly fieldName: string;

  /**
   * The supported fields. This list must include the field name.
   */
  readonly supportedFieldsNames: Readonly<string[]>;
	
  /**
   * The supported field definitions. This list must include the field name
   * for definition of the valid values.
   */
  readonly supportedFieldDefinitions: Readonly<Record<string, FieldDefinition|FieldDefinitionFunction<Integer>>>;
    
  /**
   * The fields equivalent with the temporal fieldly.
   */
  readonly equivalentFields: Readonly<TemporalFieldSpec[]>;
    
  /**
   * Create an instance of the field.
   * @param value The value of the field.
   * @throws {RangeError} The field value was invalid.
   */
  createInstance(value: number): Readonly<TemporalFieldlyValue>;
    
  /**
   * Get value range of the temporal field.
   * @param field The temporal field.
   * @throws {UnsupportedFieldException} The field is not supported by the temporal fieldly.
   */
  getValueRange(field: TemporalFieldly): Readonly<TemporalValueRange>;

  /**
   * Get value range of the current temporal field with value.
   * @param value The value of the current field.
   * @throws {RangeError} The given field value is invalid.
   */
  getValueRange(value: number | ComparableInteger): Readonly<TemporalValueRange>;

  /**
   * Get value range of the current temporal field with value.
   * @return The value range of the current field.
   */
  getValueRange(): TemporalValueRange;

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
    ): Readonly<TemporalValueRange>;
  
  
}

/**
 * The type of the temporal field sepcification..
 */
export type TemporalFieldSpec = (string|TemporalFieldly);


/**
 * The temporal fieldly value. All temporal fieldlys store values
 * as numbers.
 */
export interface TemporalFieldlyValue {
  /**
   * The field whose value the temporal fieldly represents.
   */
  get field(): TemporalFieldly;

  /**
   * The temporal field value. If the value is undefined, teh field has no value.
   */
  get value(): Integer | undefined;

  /**
   * The getter of the field name.
   */
  get fieldName(): string;

  /**
   * Derive another field instance of hte same temporal field with given value.
   * @param value The new value of the derived field.
   * @throws {InvalidFieldValue} The given field value was invalid.
   */
  derive(value: Integer|ComparableInteger): TemporalFieldlyValue;

  /**
   * Create a new instance of a derived field with given value.
   * @param field The field of the derived value.
   * @param fieldValue The value of the derived. field.
   * @throws {UnsupportedFieldException} The given field is not supported.
   * @throws {InvalidFieldValue} The given field value was invalid.
   */
  derive(field: Definitions.Field|string, fieldValue: Integer|ComparableInteger): TemporalFieldlyValue;

  /**
   * Get a derived field.
   * @param field The field, whose value is used to refine the value.
   * @param value The value of the field.
   * @throws {UnsupportedFieldException} The derived field is not supported by the
   * current field.
   */
  deriveField(
    field: TemporalFieldly,
    value: Integer | ComparableInteger
  ): TemporalFieldly;

  /**
   * Get the valeu range of the field.
   * @param field The temporal field.
   * @throws {UnsupportedFieldException} The given field is not supported by the current field value.
   */
  getFieldRange(field: TemporalFieldly): TemporalValueRange;

  /**
   * Converts the velue into number.
   * @returns The primitive representation of the temporal fiedly value is either a number.
   */
  valueOf(): Integer;
}

/**
 * An instance of one or more temporal feilds and their values.
 */
export interface TemporalFieldsInstance {

  /**
   * The base fields required for the temporal instance.
   */
  getBaseFields(): Readonly<Set<string|Definitions.Field|TemporalFieldly>>;

  /**
   * The set of the field values derived from the base values or with fixed value.
   */
  getDerivedFields(): Readonly<Set<string|Definitions.Field|TemporalFieldly>>;

  /**
   * Get the field value.
   * @åaram field The queried field.
   * @returns The field value, if the field belongs to the fields, or an undefined value.
   */
  get(field: Readonly<string|Definitions.Field|TemporalFieldly>): Integer|undefined;

  /**
   * Does the temporal instance support the field.
   * @param field The tested field.
   * @reutrns True, if and only if the temporal fieldly has the given field.
   */
  has(field: Readonly<string|Definitions.Field|TemporalFieldly>): boolean;

  /**
   * Create a new temporal fields instance from the current one with given field set to given value.
   * @param newValue The new value of the field.
   * @throws {InvalidFieldValue} The given field value is not valid.
   * @throws {UnsupportedFieldException} The given field is not supported.
   */
  derive(field: Readonly<string|Definitions.Field|TemporalFieldly>, newValue: Integer): TemporalFieldsInstance;

  /**
   * The record representation of the temporal field instance.
   * @returns The record with field names as keys and the field values as values. 
   */
  toRecord(): Record<string, Integer>;
}

/**
 * Createa a record from feild value mapping or record.
 * @param values The values of all fields.
 * @param required The required fields. 
 * @param optional The optional fields.
 * @param defaultValues The mapping from field name to the default vaolue of the field, or to 
 * a function determining the value of the field from the set of the required field values int eh order
 * of the required fields set.
 * @returns 
 */
export function createRecord(values: Map<string, Integer>|Record<string, Integer>, 
    required: Set<string|Definitions.Field|TemporalFieldly>, 
    optional?: Set<string|Definitions.Field|TemporalFieldly>,
    defaultValues?: Map<string, Integer|((values: Set<Integer>)=>Integer)>
    ): Record<string,Integer>  {

  const result = {};
  const getValue : (field: string) => Integer|undefined = (values instanceof Map ? (field: string) => (values.get(field)) : 
  (field: string) => (field in values ? values[field] : undefined))
  const getField : (field: string|Definitions.Field|TemporalFieldly) => string = (field) => {
    return (typeof field === "object")? field.fieldName : field;
  };
  const getDefaultValue : ( value : Integer|((values: Set<Integer>)=>Integer), requiredFields: Set<Integer>) => (Integer|undefined) = 
    (value, requiredFields) => {
      if (typeof value === "function") {  
        return value(requiredFields);
      } else {
        return value;
      }
    };
  [...required.values()].forEach(element => {
    const fieldName = getField(element);
    const value = getValue(fieldName);
    if (value === undefined) {
      throw new RangeError(`Missing required field ${fieldName}`);
    } else {
      result[fieldName] = value;
    }
  });
  [...(optional?.values()||[])].forEach(element => {
    const fieldName = getField(element);
    const value = getValue(fieldName);
    if (value !== undefined) {
      result[fieldName] = value;
    } else if (defaultValues?.has(fieldName)) {
      result[fieldName] = getDefaultValue(defaultValues.get(fieldName), new Set([...required.values()].map( (reqField) => {
        const fieldName = getField(reqField);
        return getValue(fieldName)
      if (result[fieldName] === "undefined") {
        delete result[fieldName];
      }
    })))
    }
  });

  return result;
}