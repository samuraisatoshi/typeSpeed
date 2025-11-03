/**
 * Base class for all entities in the domain
 * Entities have identity and lifecycle
 */
export abstract class Entity<TId> {
  protected readonly _id: TId;

  protected constructor(id: TId) {
    this._id = id;
  }

  public get id(): TId {
    return this._id;
  }

  public equals(other: Entity<TId>): boolean {
    if (!other) {
      return false;
    }

    if (!(other instanceof Entity)) {
      return false;
    }

    return this._id === other._id;
  }
}