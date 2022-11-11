import { injectable } from "inversify";
import RequestCache from "../../request/RequestCache";

@injectable()
export default abstract class ResolverHook<
  TParent,
  TArgs,
  TContext,
  TRunReturn
> {
  public abstract run(
    parent: TParent,
    args: TArgs,
    context: TContext
  ): Promise<TRunReturn> | TRunReturn;
}

@injectable()
export abstract class GuardResolverHook<
  TParent,
  TArgs,
  TContext,
  K
> extends ResolverHook<
  TParent,
  TArgs,
  TContext,
  null | K | Promise<null | K>
> {}

@injectable()
export abstract class LoaderResolverHook<
  TParent,
  TArgs,
  TContext
> extends ResolverHook<TParent, TArgs, TContext, void | Promise<void>> {
  protected abstract requestCache: RequestCache;
}

export function runWithHooks<P, A, C, R>(
  getResolveHooks: () => ResolverHook<P, A, C, R>[],
  callback: (p: P, a: A, c: C) => R | Promise<R>
): (p: P, a: A, c: C) => Promise<R> | R {
  return async (p: P, a: A, c: C): Promise<R> => {
    const hooks = getResolveHooks();
    for (const hook of hooks) {
      if (hook instanceof GuardResolverHook) {
        const result = await hook.run(p, a, c);
        if (result) {
          return result;
        }
      }
      if (hook instanceof LoaderResolverHook) {
        await hook.run(p, a, c);
      }
    }
    return await callback(p, a, c);
  };
}
