import { User } from "@floro/database/src/entities/User";
import { injectable } from "inversify";
import { GuardResolverHook } from "../ResolverHook";
import { UnAuthenticatedError } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class LoggedInUserGuard extends GuardResolverHook<
  unknown,
  unknown,
  { currentUser: User | null, cacheKey: string },
  unknown | UnAuthenticatedError
> {
  public async run(_parent, _args, context) {
    if (!context.currentUser) {
      return {
        __typename: "UnAuthenticatedError",
        type: "UNAUTHENTICATED_ERROR",
        message: "Unauthenticated request",
      };
    }
    return null;
  }
}
