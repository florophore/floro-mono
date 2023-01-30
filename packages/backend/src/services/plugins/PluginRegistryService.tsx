import { injectable, inject } from "inversify";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import PluginHelper from "@floro/database/src/contexts/utils/PluginHelper";

@injectable()
export default class PluginRegistryService {

  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async checkPluginNameIsTaken(pluginName: string): Promise<boolean> {
    const pluginsContext = await this.contextFactory.createContext(PluginsContext); 
    const nameKey = PluginHelper.getPluginKeyUUID(pluginName ?? "");
    if (!nameKey) {
        return false;
    }
    return await pluginsContext.pluginExistsByNameKey(nameKey);
  }
}