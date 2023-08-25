import {
  Session

} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Cookies from "js-cookie";

export const setClientSession = (
  session: Session
) => {
  Cookies.set("user-session", session?.clientKey as string, {
    expires: 14,
    sameSite: 'lax'
  });
  localStorage.setItem("user", JSON.stringify(session.user));
  localStorage.setItem("session", JSON.stringify(session));
};
export const removeClientSession = () => {
  Cookies.remove("user-session");
  localStorage.removeItem("user");
  localStorage.removeItem("session");
  localStorage.removeItem("offline-organizations");
};