import { useOrgPluginUpdatedSubscription } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import React from "react";
import { useSession } from "../../session/session-context";

interface Props {
  children: React.ReactElement;
  organizationId: string;
}

const OrgSubscriber = (props: Props) => {
  useOrgPluginUpdatedSubscription({
    variables: {
      organizationId: props.organizationId,
    },
  });
  return props.children;
};

interface MountProps {
  children: React.ReactElement;
  organizationId?: string|null;
}

const OrgSubscriberMount = (props: MountProps) => {
  if (!props?.organizationId) {
    return props.children;
  }
  return (
    <OrgSubscriber organizationId={props.organizationId}>{props.children}</OrgSubscriber>
  );
};

export default OrgSubscriberMount;