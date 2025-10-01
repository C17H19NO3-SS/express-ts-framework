// src/core/cqrs/bus.ts
import { 
    ICommand, 
    ICommandHandler, 
    IQuery, 
    IQueryHandler 
} from './command-query.interfaces';
import { Result } from '../base/result';
import { Container } from '../di/container';
import { HttpError } from '../errors/http.error';
import { TOKENS } from '../di/tokens';
import { IUnitOfWork } from '../../adapters/mysql/unit-of-work.interface';

// Central mapping for Command/Query to Handler Tokens
// This must be manually populated during application bootstrap
type HandlerMap = Map<new (...args: any[]) => ICommand | IQuery, symbol>;

export class CommandBus {
    private readonly handlerMap: HandlerMap;

    constructor(handlerMap: HandlerMap) {
        this.handlerMap = handlerMap;
    }

    /**
     * Executes a Command within a transactional boundary (UnitOfWork).
     * Automatically begins and commits the transaction or rolls it back on error.
     * @template TCommand The command to execute.
     * @template TResult The expected result type.
     * @param command The command instance.
     * @returns A Result object containing the value or an HttpError.
     */
    public async execute<TCommand extends ICommand, TResult>(
        command: TCommand
    ): Promise<Result<TResult>> {
        const handlerToken = this.handlerMap.get(command.constructor as any);
        if (!handlerToken) {
            return Result.Failure(new HttpError(500, 'Internal Server Error', `No command handler found for ${command.constructor.name}`));
        }

        const uow = Container.get<IUnitOfWork>(TOKENS.UnitOfWork);

        try {
            await uow.beginTransaction();
            
            const handler = Container.get<ICommandHandler<TCommand, TResult>>(handlerToken);
            const value = await handler.handle(command);
            
            await uow.commit();

            return Result.Success(value);
        } catch (error) {
            await uow.rollback();
            // Re-throw as a Result.Failure using HttpError abstraction
            if (error instanceof HttpError) {
                 return Result.Failure(error);
            }
            // Catch unexpected errors
            return Result.Failure(new HttpError(500, 'Internal Server Error', error instanceof Error ? error.message : 'An unknown command execution error occurred.'));
        }
    }
}

export class QueryBus {
    private readonly handlerMap: HandlerMap;

    constructor(handlerMap: HandlerMap) {
        this.handlerMap = handlerMap;
    }

    /**
     * Executes a Query outside of a transactional boundary.
     * @template TQuery The query to execute.
     * @template TResult The expected result type.
     * @param query The query instance.
     * @returns A Promise resolving to the value, or throws an HttpError.
     */
    public async execute<TQuery extends IQuery, TResult>(
        query: TQuery
    ): Promise<Result<TResult>> {
        const handlerToken = this.handlerMap.get(query.constructor as any);
        if (!handlerToken) {
            return Result.Failure(new HttpError(500, 'Internal Server Error', `No query handler found for ${query.constructor.name}`));
        }

        try {
            const handler = Container.get<IQueryHandler<TQuery, TResult>>(handlerToken);
            const value = await handler.handle(query);
            return Result.Success(value);
        } catch (error) {
            if (error instanceof HttpError) {
                 return Result.Failure(error);
            }
            // Catch unexpected errors
            return Result.Failure(new HttpError(500, 'Internal Server Error', error instanceof Error ? error.message : 'An unknown query execution error occurred.'));
        }
    }
}

// We will export a centralized map builder function to be used during bootstrap
export function createHandlerMap(mappings: [new (...args: any[]) => ICommand | IQuery, symbol][]): HandlerMap {
    return new Map(mappings);
}

// Global bus instances (initialized in app.ts)
export const commandBus = new CommandBus(new Map()); // Placeholder
export const queryBus = new new QueryBus(new Map());  // Placeholder
