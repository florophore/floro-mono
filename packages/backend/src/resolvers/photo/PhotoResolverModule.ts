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
    "Photo",
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
      return this.mainConfig.publicRoot() + photo.path;
    },
    thumbnailUrl: (photo) => {
      return this.mainConfig.publicRoot() + photo.thumbnailPath;
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

    uploadOrganizationProfilePhoto: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        {
          organizationId,
          file,
          x,
          y,
          width,
          height,
        }: main.MutationUploadOrganizationProfilePhotoArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "UploadOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (organizationMember?.membershipState != "active") {
          return {
            __typename: "UploadOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMember?.id
        );
        if (!permissions?.canModifyOrganizationSettings) {
          return {
            __typename: "UploadOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const { createReadStream } = await file;
        const stream: ReadStream = createReadStream();
        const result =
          await this.photoUploadService.uploadOrganizationProfilePhoto(
            currentUser,
            organization,
            stream,
            x,
            y,
            width,
            height
          );
        if (result.action == "UPLOAD_PROFILE_PHOTO_SUCCEEDED") {
          return {
            __typename: "UploadOrganizationProfilePhotoSuccess",
            organization: result.organization,
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
            __typename: "UploadOrganizationProfilePhotoError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UploadOrganizationProfilePhotoError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    removeUserProfilePhoto: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_root, _, { currentUser }) => {
        const result = await this.photoUploadService.removeUserProfilePhoto(
          currentUser
        );
        if (result.action == "REMOVE_PROFILE_PHOTO_SUCCEEDED") {
          return {
            __typename: "RemoveUserProfilePhotoSuccess",
            user: result.user,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "RemoveUserProfilePhotoError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RemoveUserProfilePhotoError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    removeOrganizationProfilePhoto: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        { organizationId }: main.MutationRemoveOrganizationProfilePhotoArgs,
        { cacheKey, currentUser }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "RemoveOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organizationMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (organizationMember?.membershipState != "active") {
          return {
            __typename: "RemoveOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          organizationMember?.id
        );
        if (!permissions?.canModifyOrganizationSettings) {
          return {
            __typename: "RemoveOrganizationProfilePhotoError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result =
          await this.photoUploadService.removeOrganizationProfilePhoto(
            organization
          );
        if (result.action == "REMOVE_PROFILE_PHOTO_SUCCEEDED") {
          return {
            __typename: "RemoveOrganizationProfilePhotoSuccess",
            organization: result.organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "RemoveOrganizationProfilePhotoError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RemoveOrganizationProfilePhotoError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}
