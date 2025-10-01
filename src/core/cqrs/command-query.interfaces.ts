// src/core/cqrs/command-query.interfaces.ts

/**
 * Marker interface for all Command DTOs (write operations).
 * Commands are mutable data transfer objects that express intent to change state.
 */
export interface ICommand {}

/**
 * Marker interface for all Query DTOs (read operations).
 * Queries are immutable data transfer objects that request state without changing it.
 */
export interface IQuery {}

/**
 * Defines a Command Handler, responsible for executing a specific ICommand.
 * A Command Handler typically manages transactional boundaries (UnitOfWork) and persistence.
 * @template TCommand The specific Command object it handles.
 * @template TResult The result value on success (e.g., entity ID, or null).
 */
export interface ICommandHandler<TCommand extends ICommand, TResult> {
    handle(command: TCommand): Promise<TResult>;
}

/**
 * Defines a Query Handler, responsible for executing a specific IQuery.
 * A Query Handler performs read-only data access and often returns a specific DTO.
 * @template TQuery The specific Query object it handles.
 * @template TResult The return type, usually a specific DTO or array of DTOs.
 */
export interface IQueryHandler<TQuery extends IQuery, TResult> {
    handle(query: TQuery): Promise<TResult>;
}
