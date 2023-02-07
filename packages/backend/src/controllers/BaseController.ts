import { injectable } from "inversify";

@injectable()
export default class BaseController {
  public envs: Array<"test"|"development"|"production"> = ["test", "development", "production"];

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