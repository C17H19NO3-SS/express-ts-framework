// src/adapters/mysql/unit-of-work.interface.ts

/**
 * Interface defining the transactional contract for the Unit of Work.
 * This is a Port in the Hexagonal Architecture, allowing the Core layer (CommandBus) 
 * to depend on an abstraction, not the concrete MySQL implementation.
 */
export interface IUnitOfWork {
    /**
     * Starts a new database transaction, binding the connection to the request context.
     */
    beginTransaction(): Promise<void>;

    /**
     * Commits the active transaction and releases the connection.
     */
    commit(): Promise<void>;

    /**
     * Rolls back the active transaction and releases the connection.
     */
    rollback(): Promise<void>;

    /**
     * Gets the currently transactional database connection or client.
     * @returns The active transaction handle.
     */
    getConnection(): any;
}
