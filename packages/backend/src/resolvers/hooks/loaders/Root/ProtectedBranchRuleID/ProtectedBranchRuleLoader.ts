import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import RequestCache from "../../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";

@injectable()
export default class ProtectedBranchRuleLoader extends LoaderResolverHook<
  unknown,
  {protectedBranchRuleId: string},
  { cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected contextFactory!: ContextFactory;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
  }

  public run = runWithHooks<
    unknown,
    {protectedBranchRuleId: string},
    { cacheKey: string },
    void
  >(
    () => [
    ],
    async (_, {protectedBranchRuleId}, { cacheKey }): Promise<void> => {
      if (!protectedBranchRuleId) {
        return;
      }
      const cachedProtectedBranchRule = this.requestCache.getProtectedBranchRule(cacheKey, protectedBranchRuleId);
      if (cachedProtectedBranchRule) {
        return;
      }
      const protectedBranchRulesContext = await this.contextFactory.createContext(ProtectedBranchRulesContext);

      const protectedBranchRule = await protectedBranchRulesContext.getById(protectedBranchRuleId);
      if (protectedBranchRule) {
        this.requestCache.setProtectedBranchRule(cacheKey, protectedBranchRule);
      }
    }
  );
}