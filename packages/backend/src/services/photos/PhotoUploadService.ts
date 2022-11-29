import { inject, injectable } from "inversify";

import { Organization } from "@floro/database/src/entities/Organization";
import { User } from "@floro/database/src/entities/User";
import UserAccessor from "@floro/storage/src/accessors/UserAccessor";
import OrganizationAccessor from "@floro/storage/src/accessors/OrganizationAccessor";
import StorageClient from "@floro/storage/src/StorageClient";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import PhotosContext from "@floro/database/src/contexts/photos/PhotosContext";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import sharp from "sharp";
import { ReadStream } from "fs";
import { Photo } from "@floro/database/src/entities/Photo";

export interface UploadUserProfilePhotoResponse {
  action: "UPLOAD_PROFILE_PHOTO_SUCCEEDED" | "LOG_ERROR";
  photo?: Photo;
  user?: User;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UploadOrganizationProfilePhotoResponse {
  action: "UPLOAD_PROFILE_PHOTO_SUCCEEDED" | "LOG_ERROR";
  photo?: Photo;
  organization?: Organization;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class PhotoUploadService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  private userAccessor!: UserAccessor;
  private organizationAccessor!: OrganizationAccessor;
  private storageClient!: StorageClient;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(UserAccessor) userAccessor: UserAccessor,
    @inject(OrganizationAccessor) organizationAccessor: OrganizationAccessor,
    @inject(StorageClient) storageClient: StorageClient
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.userAccessor = userAccessor;
    this.organizationAccessor = organizationAccessor;
    this.storageClient = storageClient;
  }

  public async uploadUserProfilePhoto(
    user: User,
    stream: ReadStream,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<UploadUserProfilePhotoResponse> {
    try {
      const rawBuffer: Buffer = await new Promise((resolve) => {
        const bytes: Uint8Array[] = [];
        stream.on("data", (data: Uint8Array) => bytes.push(data));
        stream.on("end", () => resolve(Buffer.concat(bytes)));
      });
      const image: Buffer = await sharp(rawBuffer)
        .extract({
          left: x,
          top: y,
          width,
          height,
        })
        .resize(300, 300)
        .png()
        .toBuffer();

      const thumbnail: Buffer = await sharp(image)
        .resize(100, 100)
        .png()
        .toBuffer();
      const hash = this.storageClient.hashBuffer(image);
      const thumbnailHash = this.storageClient.hashBuffer(thumbnail);
      const path = this.userAccessor.getPhotoPathFromRoot(user, hash, "png");
      const thumbnailPath = this.userAccessor.getPhotoPathFromRoot(
        user,
        thumbnailHash,
        "png"
      );
      await this.userAccessor.writePhoto(user, hash, image);
      await this.userAccessor.writePhoto(user, thumbnailHash, thumbnail);
      const photosContext = await this.contextFactory.createContext(
        PhotosContext
      );
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      const photo = await photosContext.createPhoto({
        uploadedByUserId: user.id,
        hash,
        path,
        thumbnailHash,
        thumbnailPath,
        mimeType: "png",
      });
      const refreshedUser = await usersContext.updateUserById(user.id, {
        profilePhotoId: photo.id,
        profilePhoto: photo
      });
      if (!refreshedUser) {
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_UPLOAD_PROFILE_PHOTO_ERROR",
            message: "User not refreshed",
          },
        };
      }
      return {
        action: "UPLOAD_PROFILE_PHOTO_SUCCEEDED",
        user: refreshedUser,
        photo,
      };
    } catch (e: any) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPLOAD_PROFILE_PHOTO_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    }
  }
}
