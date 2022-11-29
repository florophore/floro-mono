
import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import PhotoUploadService from "../../services/photos/PhotoUploadService";
import { ReadStream } from "fs";
import MainConfig from "@floro/config/src/MainConfig";

@injectable()
export default class PhotoResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Photo"
  ];
  protected mainConfig!: MainConfig;
  protected photoUploadService!: PhotoUploadService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(PhotoUploadService) photoUploadService: PhotoUploadService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.mainConfig = mainConfig;
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.photoUploadService = photoUploadService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public Photo: main.PhotoResolvers = {
    url: (photo) => {
        return this.mainConfig.uploadRoot() + photo.path;
    },
    thumbnailUrl: (photo) => {
        console.log(photo)
        return this.mainConfig.uploadRoot() + photo.thumbnailPath;
    },
  };

  public Mutation: main.MutationResolvers = {
    uploadUserProfilePhoto: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { file, x, y, width, height }: main.MutationUploadUserProfilePhotoArgs,
        { currentUser }
      ) => {
        const { createReadStream } = await file;
        const stream: ReadStream = createReadStream();
        const result = await this.photoUploadService.uploadUserProfilePhoto(
          currentUser,
          stream,
          x,
          y,
          width,
          height
        );
        if (result.action == "UPLOAD_PROFILE_PHOTO_SUCCEEDED") {
          return {
            __typename: "UploadUserProfilePhotoSuccess",
            user: result.user,
            photo: result.photo,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UploadUserProfilePhotoError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UploadUserProfilePhotoError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}