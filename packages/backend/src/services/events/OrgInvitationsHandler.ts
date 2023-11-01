import { Organization } from '@floro/database/src/entities/Organization';
import { OrganizationInvitation } from '@floro/database/src/entities/OrganizationInvitation';
import { User } from '@floro/database/src/entities/User';

export default interface OrgInvitationsHandler {
  onCreateInvitation(
    organizationInvitation: OrganizationInvitation,
    organization: Organization,
    invitedByUser: User,
    user: User
  ): Promise<void>;
  onCancelInvitation(
    organizationInvitation: OrganizationInvitation,
  ): Promise<void>;
  onAcceptInvitation(
    organizationInvitation: OrganizationInvitation,
  ): Promise<void>;
  onDeclineInvitation(
    organizationInvitation: OrganizationInvitation,
  ): Promise<void>;
}