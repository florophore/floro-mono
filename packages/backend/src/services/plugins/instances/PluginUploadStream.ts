import tar, { ReadEntry } from "tar";
import Stream from "stream";
import path from "path";
import isSvg from "is-svg";
import semver from "semver";
import { init as CJSInit, parse as CJSParser } from "cjs-module-lexer";
import * as fastXML from "fast-xml-parser";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { v4 as uuidv4} from 'uuid';
import os from 'os';
import fs, { ReadStream } from 'fs';
import { createHash } from "crypto";

await CJSInit();

// 5mb
const ENTRY_MAX_SIZE = 5_000_000;
// 20mb
const CUMMULATIVE_MAX_SIZE = 20_000_000;

export class PluginUploadStream {
  private entryMap: { [key: string]: Buffer } = {};
  private cummulativeSize = 0;

  private tarStream: Stream;

  public name?: string;
  public version?: string|null;
  public displayName?: string;
  public description?: string;

  public originalManifest?: Manifest;

  public lightIconPath?: string;
  public darkIconPath?: string;
  public selectedLightIconPath?: string;
  public selectedDarkIconPath?: string;
  public originalLightIcon?: string;
  public originalDarkIcon?: string;
  public originalSelectedLightIcon?: string;
  public originalSelectedDarkIcon?: string;

  public originalIndexHTML?: string;
  public indexJSPath?: string;
  public originalIndexJS?: string;

  public uuid!: string;

  public originalAssets: {
    [path: string]: string | Buffer;
  } = {};

  public hasErrors = false;
  public errorMessage?: string;

  constructor(tarStream: Stream) {
    this.uuid = uuidv4();
    this.tarStream = tarStream;
  }

  public static make(tarStream: Stream) {
    return new PluginUploadStream(tarStream);
  }

  public async start(): Promise<PluginUploadStream> {
    const checks = [
      this.parseManifest.bind(this),
      this.parseIcons.bind(this),
      this.validateEntry.bind(this),
    ];
    let written = false;
    await new Promise(resolve => {
      this.tarStream 
      .pipe(fs.createWriteStream(this.tmpPath()))
      .on("finish", () => {
        if (!written) {
          resolve(this);
          written = true;
        }
      })
      .on("error", () => {
        this.hasErrors = true;
        this.errorMessage = "Unable to unzip tar.";
        if (!written) {
          resolve(this);
          written = true;
        }
      });
    });
    return await new Promise((resolve) => {
      if (this.hasErrors) {
        resolve(this);
        return;
      }
      this.getReadStream()
        .pipe(tar.t())
        .on("entry", this.addEntryToTarEntries.bind(this))
        .on("end", async () => {
          if (this.hasErrors) {
            resolve(this);
            return;
          }
          for (const check of checks) {
            await check();
            if (this.hasErrors) {
              break;
            }
          }
          resolve(this);
        });
    });
  }

  private tmpPath(): string {
    return path.join(os.tmpdir(), `${this.uuid}.tar.gz`);
  }

  public getReadStream(): ReadStream {
    return fs.createReadStream(this.tmpPath());
  }

  private addEntryToTarEntries(entry: ReadEntry) {
    if ((entry?.size ?? 0) > ENTRY_MAX_SIZE) {
      this.hasErrors = true;
      this.errorMessage = `Exceeded size limit in ${entry.path}.`;
      return;
    }
    this.cummulativeSize += entry?.size ?? 0;
    if (this.cummulativeSize > CUMMULATIVE_MAX_SIZE) {
      this.hasErrors = true;
      this.errorMessage = `Exceeded cummulative size limit.`;
      return;
    }
    const data: Buffer[] = [];
    entry.on("data", (chunk) => {
      if (this.hasErrors) return;
      data.push(chunk);
    });
    entry.on("error", () => {
      this.hasErrors = true;
      this.errorMessage = `Failed to load ${entry.path}.`;
    });
    entry.on("finish", () => {
      if (this.hasErrors) return;
      this.entryMap[entry.path] = Buffer.concat(data);
    });
  }

  private async parseManifest() {
    try {
      const manifestBuffer = this.entryMap["floro/floro.manifest.json"];
      this.originalManifest = JSON.parse(manifestBuffer.toString());
      if (!this.originalManifest?.name) {
        this.hasErrors = true;
        this.errorMessage = "Missing plugin name.";
        return;
      }
      this.name = this.originalManifest?.name;

      if (!this.originalManifest?.version) {
        this.hasErrors = true;
        this.errorMessage = "Missing plugin version.";
        return;
      }

      this.version = semver.clean(this.originalManifest?.version) ?? null;
      if (!this.version || !semver.valid(this.version)) {
        this.hasErrors = true;
        this.errorMessage = `Invalid version ${this.version}.`;
        return;
      }

      if (!this.originalManifest?.description) {
        this.hasErrors = true;
        this.errorMessage = "Missing plugin description.";
        return;
      }
      this.description = this.originalManifest?.description as string;

      if (!this.originalManifest?.displayName) {
        this.hasErrors = true;
        this.errorMessage = "Missing plugin displayName.";
        return;
      }
      this.displayName = this.originalManifest?.displayName as string;

      // release
      delete this.entryMap["floro/floro.manifest.json"];
    } catch (e) {
      this.hasErrors = true;
      this.errorMessage = "Failed to parse manifest.";
    }
  }

  private async parseIcons() {
    try {
      if (!this?.originalManifest?.icon) {
        this.hasErrors = true;
        this.errorMessage = "No icon present in manifest.";
        return;
      }
      const lightSVG: string | undefined =
        typeof this.originalManifest?.icon == "string"
          ? (this.originalManifest?.icon as string)
          : this.originalManifest?.icon.light;
      if (!lightSVG) {
        this.hasErrors = true;
        this.errorMessage = "Invalid icon in manifest.";
        return;
      }
      const lightSVGPath = path.join("floro", lightSVG);
      if (!this.entryMap[lightSVGPath]) {
        this.hasErrors = true;
        this.errorMessage = `Icon (${lightSVG}) not found.`;
        return;
      }
      this.originalLightIcon = this.entryMap[lightSVGPath].toString();
      if (!isSvg(this.originalLightIcon as string)) {
        this.hasErrors = true;
        this.errorMessage = `Invalid icon in manifest (${lightSVGPath}). Icons need to be valid SVG.`;
        return;
      }
      const lightSha = createHash("sha256");
      this.lightIconPath = `${lightSha.update(this.originalLightIcon).digest("hex")}.svg`;

      const darkSVG: string | undefined =
        typeof this.originalManifest?.icon == "string"
          ? (this.originalManifest?.icon as string)
          : this.originalManifest?.icon.dark;

      if (!darkSVG) {
        this.hasErrors = true;
        this.errorMessage = "Invalid icon in manifest.";
        return;
      }

      const darkSVGPath = path.join("floro", darkSVG);
      if (!this.entryMap[darkSVGPath]) {
        this.hasErrors = true;
        this.errorMessage = `Icon (${darkSVG}) not found.`;
        return;
      }

      this.originalDarkIcon = this.entryMap[darkSVGPath].toString();
      if (!isSvg(this.originalDarkIcon as string)) {
        this.hasErrors = true;
        this.errorMessage = `Invalid icon in manifest (${darkSVGPath}). Icons need to be valid SVG.`;
        return;
      }

      const darkSha = createHash("sha256");
      this.darkIconPath = `${darkSha.update(this.originalDarkIcon).digest("hex")}.svg`;
      // release
      delete this.entryMap[lightSVGPath];
      if (this.entryMap[darkSVGPath]) {
        delete this.entryMap[darkSVGPath];
      }

      if (typeof this.originalManifest?.icon != "object" || !this.originalManifest?.icon.selected) {
        this.originalSelectedLightIcon = this.originalLightIcon;
        this.originalSelectedDarkIcon = this.originalDarkIcon;
        this.selectedLightIconPath = this.lightIconPath;
        this.selectedDarkIconPath = this.darkIconPath;
        return;
      }
      if (typeof this.originalManifest.icon?.selected == "string") {

        const selectedSVGPath = path.join("floro", this.originalManifest.icon.selected);
        if (!this.entryMap[selectedSVGPath]) {
          this.hasErrors = true;
          this.errorMessage = `Icon (${selectedSVGPath}) not found.`;
          return;
        }

        this.originalSelectedLightIcon = this.entryMap[selectedSVGPath].toString();
        this.originalSelectedDarkIcon = this.originalSelectedLightIcon;
        if (!isSvg(this.originalSelectedLightIcon)) {
          this.hasErrors = true;
          this.errorMessage = `Invalid icon in manifest (${selectedSVGPath}). Icons need to be valid SVG.`;
          return;
        }

        const selectedSha = createHash("sha256");
        this.selectedLightIconPath = `${selectedSha.update(this.originalSelectedLightIcon).digest("hex")}.svg`;
        this.selectedDarkIconPath = this.selectedLightIconPath;
        delete this.entryMap[selectedSVGPath];
        return;
      }
      if (
        typeof this.originalManifest.icon.selected.light != "string" ||
        typeof this.originalManifest.icon.selected.dark != "string"
      ) {
        this.hasErrors = true;
        this.errorMessage = "Invalid icon in manifest.";
        return;
      }
      if (!this.entryMap[this.originalManifest.icon.selected.light]) {
        this.hasErrors = true;
        this.errorMessage = `Icon (${this.originalManifest.icon.selected.light}) not found.`;
        return;
      }
      if (!this.entryMap[this.originalManifest.icon.selected.dark]) {
        this.hasErrors = true;
        this.errorMessage = `Icon (${this.originalManifest.icon.selected.dark}) not found.`;
        return;
      }
      this.originalSelectedLightIcon = this.entryMap[this.originalManifest.icon.selected.light].toString();
      if (!isSvg(this.originalSelectedLightIcon)) {
        this.hasErrors = true;
        this.errorMessage = `Invalid icon in manifest (${this.originalManifest.icon.selected.light}). Icons need to be valid SVG.`;
        return;
      }

      const selectedLightSha = createHash("sha256");
      this.selectedLightIconPath = `${selectedLightSha.update(this.originalSelectedLightIcon).digest("hex")}.svg`;
      delete this.entryMap[this.originalManifest.icon.selected.light];

      this.originalSelectedDarkIcon = this.entryMap[this.originalManifest.icon.selected.dark].toString();
      if (!isSvg(this.originalSelectedDarkIcon)) {
        this.hasErrors = true;
        this.errorMessage = `Invalid icon in manifest (${this.originalManifest.icon.selected.dark}). Icons need to be valid SVG.`;
        return;
      }
      const selectedDarkSha = createHash("sha256");
      this.selectedLightIconPath = `${selectedDarkSha.update(this.originalSelectedDarkIcon).digest("hex")}.svg`;
      delete this.entryMap[this.originalManifest.icon.selected.dark];

    } catch (e) {
      this.hasErrors = true;
      this.errorMessage = "Failed to parse icons.";
    }
  }

  private async validateEntry() {
    try {
      const indexHTMLBuffer = this.entryMap["index.html"];
      if (!indexHTMLBuffer) {
        this.hasErrors = true;
        this.errorMessage = "Missing entry (index.html).";
        return;
      }
      this.originalIndexHTML = this.entryMap["index.html"]?.toString();
      delete this.entryMap["index.html"];
      try {
        fastXML.validate(this.originalIndexHTML);
      } catch (e) {
        this.hasErrors = true;
        this.errorMessage = `Failed to parse index.html.`;
        return;
      }
      const indexJSRegex = new RegExp(
        `http://localhost:63403/plugins/${this.name}/${this.version}/assets/index-[a-f0-9]{64}\\.js`
      );
      if (!indexJSRegex.test(this.originalIndexHTML)) {
        this.hasErrors = true;
        this.errorMessage = "Unable to locate index.js entry.";
        return;
      }
      const indexJSFullPath = indexJSRegex.exec(this.originalIndexHTML);
      if (!indexJSFullPath?.[0]) {
        this.hasErrors = true;
        this.errorMessage = "Unable to locate index.js entry.";
        return;
      }
      this.indexJSPath = indexJSFullPath[0].substring(
        `http://localhost:63403/plugins/${this.name}/${this.version}/`.length
      );
      if (!this.entryMap[this.indexJSPath]) {
        this.hasErrors = true;
        this.errorMessage = `Unable to locate ${this.indexJSPath} in assets.`;
        return;
      }
      this.originalIndexJS = this.entryMap[this.indexJSPath].toString();
      delete this.entryMap[this.indexJSPath];

      try {
        CJSParser(this.originalIndexJS);
      } catch (e) {
        this.hasErrors = true;
        this.errorMessage = `Failed to parse ${this.indexJSPath} as CJS.`;
        return;
      }
      const stringExtensions = new Set([
        ".svg",
        ".html",
        ".xml",
        ".xhtml",
        ".css",
        ".txt",
        ".json",
        ".js",
      ]);
      for (const entryPath in this.entryMap) {
        if (entryPath.endsWith("/") || !entryPath.startsWith("assets/")) {
          delete this.entryMap[entryPath];
        } else {
          const extension = path.parse(entryPath).ext;
          if (stringExtensions.has(extension)) {
            this.originalAssets[entryPath] =
              this.entryMap[entryPath].toString();
          } else {
            this.originalAssets[entryPath] = this.entryMap[entryPath];
          }
          delete this.entryMap[entryPath];
        }
      }
    } catch (e) {
      this.hasErrors = true;
      this.errorMessage = "Failed plugin introspection check.";
    }
  }

  public release() {
    try {
      fs.promises.rm(this.tmpPath(), {recursive: true});
    } catch(e) {
      return;
    }
  }
}
