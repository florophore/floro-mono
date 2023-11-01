import { useUserNotificationCountUpdatedSubscription, useUserPluginUpdatedSubscription } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import React from "react";
import { useSession } from "../../session/session-context";

interface Props {
  children: React.ReactElement;
  userId: string;
}

const UserSubscriber = (props: Props) => {
  useUserPluginUpdatedSubscription({
    variables: {
      userId: props.userId,
    },
  });

  useUserNotificationCountUpdatedSubscription({
    variables: {
      userId: props.userId
    }
  })
  return props.children;
};

interface MountProps {
  children: React.ReactElement;
  userId?: string|null;
}

const UserSubscriberMount = (props: MountProps) => {
  if (!props?.userId) {
    return props.children;
  }
  return (
    <UserSubscriber userId={props.userId}>{props.children}</UserSubscriber>
  );
};


export const CurrentUserSubscriberMount = (props: {children: React.ReactElement}) => {
  const { currentUser} = useSession();
  if (!currentUser?.id) {
    return props.children;
  }
  return (
    <UserSubscriber userId={currentUser?.id}>{props.children}</UserSubscriber>
  );
};

export default UserSubscriberMount;