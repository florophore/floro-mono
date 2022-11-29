import { IsDefined, IsHash, IsString } from "class-validator";
import {
  Entity,
  Column,
  OneToOne,
  Relation,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { BinaryPKBaseEntity } from "./BinaryPKBaseEntity";
import { User } from "./User";
import { Organization } from "./Organization";

@Entity("photos")
export class Photo extends BinaryPKBaseEntity {
  @Column("varchar")
  @IsDefined()
  @IsHash("sha256")
  hash?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  path?: string;

  @Column("varchar")
  @IsDefined()
  @IsHash("sha256")
  thumbnailHash?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  thumbnailPath?: string;

  @Column("varchar")
  @IsDefined()
  @IsString()
  mimeType?: string;

  @Column("uuid")
  uploadedByUserId!: string;

  @OneToMany("User", "uploadedPhotos")
  @JoinColumn()
  uploadedByUser?: Relation<User>;

  @OneToOne("User", "profilePhoto")
  user?: Relation<User>;

  @OneToOne("Organization", "profilePhoto")
  organization?: Relation<Organization>;
}