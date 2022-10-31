import {
  AccountCreationSuccessAction,
  PassedLoginAction,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Cookies from "js-cookie";

export const setClientSession = (
  payload: PassedLoginAction | AccountCreationSuccessAction
) => {
  localStorage.setItem("user", JSON.stringify(payload.user));
  localStorage.setItem("session", JSON.stringify(payload.session));
  Cookies.set("user-session", payload.session?.clientKey as string, {
    expires: 14,
  });
};
export const removeClientSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("session");
  Cookies.remove("user-session");
};