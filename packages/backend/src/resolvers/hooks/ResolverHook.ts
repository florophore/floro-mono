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
  ): Promise<TRunReturn>
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
  K
> {}

@injectable()
export abstract class LoaderResolverHook<
  TParent,
  TArgs,
  TContext
> extends ResolverHook<TParent, TArgs, TContext, void> {
  protected abstract requestCache: RequestCache;
}

export function runWithHooks<P, A, C, R>(
  getResolveHooks: () => ResolverHook<P, A, C, unknown>[],
  callback: (p: P, a: A, c: C) => Promise<R>
): (p: P, a: A, c: C) => Promise<R> {
  return async (p: P, a: A, c: C): Promise<R> => {
    const hooks = getResolveHooks();
    for (const hook of hooks) {
      if (hook instanceof GuardResolverHook) {
        const result = await (hook as GuardResolverHook<P, A, C, R>).run(p, a, c);
        if (result) {
          return result;
        }
      }
      if (hook instanceof LoaderResolverHook) {
        await (hook as LoaderResolverHook<P, A, C>).run(p, a, c) as R;
      }
    }
    const out: R = await callback(p, a, c);
    return out;
  };
}
