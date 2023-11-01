import { RepoBookmark } from '@floro/database/src/entities/RepoBookmark';
import { RepoSubscription } from '@floro/database/src/entities/RepoSubscription';
import { Repository } from '@floro/database/src/entities/Repository';

export default interface BookmarkSubscriptionsHandler {
  onCreateBookmarkNotification(
    repoBookmark: RepoBookmark,
    repository: Repository,
  ): Promise<void>;
  onRemoveBookmarkNotification(
    repoBookmark: RepoBookmark,
    repository: Repository,
  ): Promise<void>;
  onCreateSubscriptionNotification(
    repoSubscription: RepoSubscription,
    repository: Repository,
  ): Promise<void>;
  onRemoveSubscriptionNotification(
    repoSubscription: RepoSubscription,
    repository: Repository,
  ): Promise<void>;
}