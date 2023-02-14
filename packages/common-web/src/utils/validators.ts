export const NAME_REGEX = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,50}$/u;
export const USERNAME_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const HANDLE_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const REPO_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const PLUGIN_REGEX = /^[a-z0-9-][a-z0-9-_]{2,20}$/