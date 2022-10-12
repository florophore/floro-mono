import BaseController from "../BaseController";

export function Post(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["POST"] = {
                ...(BaseController.routingTable?.["POST"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}

export function Get(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["GET"] = {
                ...(BaseController.routingTable?.["GET"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}

export function Put(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["PUT"] = {
                ...(BaseController.routingTable?.["PUT"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}

export function Patch(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["PATCH"] = {
                ...(BaseController.routingTable?.["PATCH"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}

export function Delete(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["DELETE"] = {
                ...(BaseController.routingTable?.["DELETE"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}

export function Options(target) {
    return function decorator(t, n, descriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            BaseController.routingTable["OPTIONS"] = {
                ...(BaseController.routingTable?.["OPTIONS"] ?? {}),
                [target]: {
                    name: n,
                    method: descriptor.value,
                    object: t
                }
            }
        }
        return descriptor;
      };
}