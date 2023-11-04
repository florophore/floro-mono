import { inject, injectable } from "inversify";
import BaseController from "./BaseController";
import { Get } from "./annotations/HttpDecorators";
import { createHmac } from "crypto";
import NotificationsService from "../services/notifications/NotificationsService";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import NotificationsContext from "@floro/database/src/contexts/notifications/NotificationsContext";

@injectable()
export default class NotificationReceiverController extends BaseController {
  private notificationsService!: NotificationsService;
  private contextFactory!: ContextFactory;
  constructor(
    @inject(NotificationsService) notificationsService: NotificationsService,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.notificationsService = notificationsService;
    this.contextFactory = contextFactory;
  }

  @Get("/notification/:notificationId")
  public async receiverNotification(req, res) {
    const notificationId = req?.params?.notificationId;
    if (!notificationId) {
      res.redirect("/404");
      return;
    }
    try {
      const noticationsContext = await this.contextFactory.createContext(
        NotificationsContext
      );
      const notification = await noticationsContext.getById(notificationId);
      if (!notification) {
        res.redirect("/404");
        return;
      }
      const redirectLink =
        this.notificationsService.getNotifcationRedirectLink(notification);
        console.log("LOL", redirectLink)
      res.redirect(redirectLink);
    } catch (e) {
      res.redirect("/404");
      return;
    }
  }
}
