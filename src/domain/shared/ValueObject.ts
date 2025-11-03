/**
 * Base class for all value objects in the domain
 * Value objects are immutable and compared by value
 */
export abstract class ValueObject<T> {
  protected readonly value: T;

  protected constructor(value: T) {
    this.value = Object.freeze(value);
  }

  public equals(other: ValueObject<T>): boolean {
    if (!other || !this.isValueObject(other)) {
      return false;
    }
    return JSON.stringify(this.value) === JSON.stringify(other.value);
  }

  private isValueObject(obj: any): obj is ValueObject<T> {
    return obj instanceof ValueObject;
  }

  public getValue(): T {
    return this.value;
  }
}