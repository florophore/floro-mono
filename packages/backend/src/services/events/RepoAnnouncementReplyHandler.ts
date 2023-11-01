import { RepoAnnouncement } from '@floro/database/src/entities/RepoAnnouncement';
import { RepoAnnouncementReply } from '@floro/database/src/entities/RepoAnnouncementReply';

export default interface RepoAnnouncementReplyHandler {
  onCreateRepoAnnouncementReply(
    repoAnnouncement: RepoAnnouncement,
    repoAnnouncementReply: RepoAnnouncementReply,
  ): Promise<void>;
  onRemoveRepoAnnouncement(
    repoAnnouncement: RepoAnnouncement,
  ): Promise<void>;
  onRemoveRepoAnnouncementReply(
    repoAnnouncement: RepoAnnouncement,
    repoAnnouncementReply: RepoAnnouncementReply,
  ): Promise<void>;
}