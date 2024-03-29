import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";

@injectable()
export default class MergeRequestCommentLoader extends LoaderResolverHook<
  unknown,
  { mergeRequestCommentId: string },
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
    { mergeRequestCommentId: string },
    { cacheKey: string },
    void
  >(
    () => [],
    async (_, { mergeRequestCommentId }, { cacheKey }): Promise<void> => {
      if (!mergeRequestCommentId) {
        return;
      }
      const cachedMergeRequestComment = this.requestCache.getMergeRequestComment(cacheKey, mergeRequestCommentId);
      if (cachedMergeRequestComment) {
        return;
      }
      const mergeRequestCommentsContext = await this.contextFactory.createContext(MergeRequestCommentsContext);
      const mergeRequestComment = await mergeRequestCommentsContext.getById(mergeRequestCommentId);
      if (mergeRequestComment) {
        this.requestCache.setMergeRequestComment(cacheKey, mergeRequestComment);
      }
    }
  );
}