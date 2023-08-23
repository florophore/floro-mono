export const NAME_REGEX = /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]{2,50}$/u;
export const USERNAME_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const HANDLE_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const REPO_REGEX = /^[A-z0-9$!.-]{3,20}$/iu;
export const PLUGIN_REGEX = /^[a-z0-9-][a-z0-9-_]{2,20}$/u;

export const TLD_DOMAIN = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
export const LOCALHOST = /^localhost$/;
export const IP_REGEX = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
export const SUBDOMAIN = /^(?![-.])[a-zA-Z0-9.-]+(?<![-.])$/;
export const URI_PATH = /^\/[/.a-zA-Z0-9-]+$/;

export const orRegex = (regexes: Array<RegExp>, str: string): boolean => {
    for (const regex of regexes) {
        if (regex.test(str)) {
            return true;
        }
    }
    return false;
}

export const validateLocalDomain = (str: string): boolean => {
    return orRegex([LOCALHOST, IP_REGEX, TLD_DOMAIN], str);
}


export const validateTLDDomain = (str: string): boolean => {
    return orRegex([TLD_DOMAIN], str);
}