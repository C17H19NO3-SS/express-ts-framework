# ADR 002: Command/Query Responsibility Segregation (CQRS)

| Status | Proposed |
| :--- | :--- |
| **Decision** | Adopted |
| **Date** | 2024-07-29 |

## Context

The current architecture uses a Service layer (`ServiceBase`) to handle both command (write) and query (read) logic. While effective for small applications, this pattern leads to large service classes and blurred responsibilities, violating the Single Responsibility Principle (SRP).

## Decision

We will implement a lightweight CQRS pattern to strictly separate read and write operations.

1.  **Read Operations (Queries):** A `QueryBus` will dispatch `IQuery` objects to dedicated `IQueryHandler`s. These handlers perform read-only operations, typically bypassing domain objects for optimized DTO projection directly from the data layer.
2.  **Write Operations (Commands):** A `CommandBus` will dispatch `ICommand` objects to dedicated `ICommandHandler`s. These handlers execute state-changing business logic, utilize the `UnitOfWork` for transactional boundaries, and return a `Result<T>`.

## Consequences

*   **Positive:** Enforced SRP, clearer intent in controllers, easier horizontal scaling (query handlers can be separated or optimized independently), and improved testability.
*   **Negative:** Increased file count due to the introduction of dedicated Command/Query/Handler classes, requiring updates to the DI container registration process. The existing `ServiceBase` classes will be replaced by focused Handlers.
