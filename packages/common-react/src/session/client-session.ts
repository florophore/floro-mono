import {
  AccountCreationSuccessAction,
  PassedLoginAction,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Cookies from "js-cookie";

export const setClientSession = (
  payload: PassedLoginAction | AccountCreationSuccessAction
) => {
  Cookies.set("user-session", payload.session?.clientKey as string, {
    expires: 14,
  });
  localStorage.setItem("user", JSON.stringify(payload.user));
  localStorage.setItem("session", JSON.stringify(payload.session));
};
export const removeClientSession = () => {
  Cookies.remove("user-session");
  localStorage.removeItem("user");
  localStorage.removeItem("session");
  localStorage.removeItem("offline-organizations");
};