import { Socket } from "net";
import { Transport, Transporter, TransportOptions } from "nodemailer";
import { Options, PluginFunction } from "nodemailer/lib/mailer";
import { Logger } from "nodemailer/lib/shared";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Token } from "nodemailer/lib/xoauth2";
import { Url } from "url";

export default class MockTransport implements Transporter<SMTPTransport.SentMessageInfo> {
    options!: Options;
    meta!: Map<string, any>;
    dkim!: import("nodemailer/lib/dkim");
    transporter!: Transport<SMTPTransport.SentMessageInfo>;
    logger!: Logger;
    MailMessage!: import("nodemailer/lib/mailer/mail-message") <SMTPTransport.SentMessageInfo>;
    close(): void {
        throw new Error("Method not implemented.");
    }
    isIdle(): boolean {
        throw new Error("Method not implemented.");
    }
    verify(callback: (err: Error | null, success: true) => void): void;
    verify(): Promise<true>;
    verify(callback?: unknown): void | Promise<true> {
        throw new Error("Method not implemented.");
    }
    use(step: string, plugin: PluginFunction<SMTPTransport.SentMessageInfo>): this {
        throw new Error("Method not implemented.");
    }
    sendMail(mailOptions: Options, callback: (err: Error | null, info: SMTPTransport.SentMessageInfo) => void): void;
    sendMail(mailOptions: Options): Promise<SMTPTransport.SentMessageInfo>;
    sendMail(mailOptions: unknown, callback?: unknown): void | Promise<SMTPTransport.SentMessageInfo> {
        throw new Error("Method not implemented.");
    }
    getVersionString(): string {
        throw new Error("Method not implemented.");
    }
    setupProxy(proxyUrl: string): void {
        throw new Error("Method not implemented.");
    }
    set(key: "oauth2_provision_cb", value: (user: string, renew: boolean, callback: (err: Error | null, accessToken?: string | undefined, expires?: number | undefined) => void) => void): Map<string, any>;
    set(key: "proxy_handler_http" | "proxy_handler_https" | "proxy_handler_socks" | "proxy_handler_socks5" | "proxy_handler_socks4" | "proxy_handler_socks4a", value: (proxy: Url, options: TransportOptions, callback: (err: Error | null, socketOptions?: { connection: Socket; } | undefined) => void) => void): Map<string, any>;
    set(key: string, value: any): Map<string, any>;
    set(key: unknown, value: unknown): Map<string, any> {
        throw new Error("Method not implemented.");
    }
    get(key: "oauth2_provision_cb"): (user: string, renew: boolean, callback: (err: Error | null, accessToken: string, expires: number) => void) => void;
    get(key: "proxy_handler_http" | "proxy_handler_https" | "proxy_handler_socks" | "proxy_handler_socks5" | "proxy_handler_socks4" | "proxy_handler_socks4a"): (proxy: Url, options: TransportOptions, callback: (err: Error | null, socketOptions: { connection: Socket; }) => void) => void;
    get(key: string);
    get(key: unknown): any {
        throw new Error("Method not implemented.");
    }
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "idle", listener: () => void): this;
    addListener(event: "token", listener: (token: Token) => void): this;
    addListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    emit(event: "error", error: Error): boolean;
    emit(event: "idle"): boolean;
    emit(event: "token", token: Token): boolean;
    emit(event: unknown, token?: unknown): boolean {
        throw new Error("Method not implemented.");
    }
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "idle", listener: () => void): this;
    on(event: "token", listener: (token: Token) => void): this;
    on(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "idle", listener: () => void): this;
    once(event: "token", listener: (token: Token) => void): this;
    once(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "idle", listener: () => void): this;
    prependListener(event: "end", listener: (token: Token) => void): this;
    prependListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "idle", listener: () => void): this;
    prependOnceListener(event: "end", listener: (token: Token) => void): this;
    prependOnceListener(event: unknown, listener: unknown): this {
        throw new Error("Method not implemented.");
    }
    listeners(event: "error"): ((err: Error) => void)[];
    listeners(event: "idle"): (() => void)[];
    listeners(event: "end"): ((token: Token) => void)[];
    listeners(event: unknown): ((err: Error) => void)[] | (() => void)[] | ((token: import("nodemailer/lib/xoauth2").Token) => void)[] {
        throw new Error("Method not implemented.");
    }
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
        throw new Error("Method not implemented.");
    }
    removeAllListeners(event?: string | symbol | undefined): this {
        throw new Error("Method not implemented.");
    }
    setMaxListeners(n: number): this {
        throw new Error("Method not implemented.");
    }
    getMaxListeners(): number {
        throw new Error("Method not implemented.");
    }
    rawListeners(eventName: string | symbol): Function[] {
        throw new Error("Method not implemented.");
    }
    listenerCount(eventName: string | symbol): number {
        throw new Error("Method not implemented.");
    }
    eventNames(): (string | symbol)[] {
        throw new Error("Method not implemented.");
    }

    public queue: any[] = [];

    public sendEmail(args: any) {
        this.queue.push(args);
    }

    public peak() {
        return this.queue[0];
    }

    public all() {
        return this.queue;
    }

    public clear() {
        this.queue = [];
    }

    public pop() {
        this.queue.pop();
    }

}