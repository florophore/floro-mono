import { injectable } from "inversify";

@injectable()
export default class BaseController {
  public static routingTable: {
    [method: string]: {
      [route: string]: {
        name: string,
        object: BaseController,
        method: (
          request: Express.Request,
          response: Express.Response
        ) => unknown;
      };
    };
  } = {};
}