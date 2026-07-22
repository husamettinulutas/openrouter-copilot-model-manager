import * as vscode from 'vscode';

/** Simple output channel logger */
export class Logger {
  private static channel: vscode.OutputChannel | undefined;

  static init(): void {
    if (!Logger.channel) {
      Logger.channel = vscode.window.createOutputChannel('OpenRouter Model Manager');
    }
  }

  static info(message: string, ...args: unknown[]): void {
    Logger.log('INFO', message, ...args);
  }

  static warn(message: string, ...args: unknown[]): void {
    Logger.log('WARN', message, ...args);
  }

  static error(message: string, ...args: unknown[]): void {
    Logger.log('ERROR', message, ...args);
  }

  static debug(message: string, ...args: unknown[]): void {
    Logger.log('DEBUG', message, ...args);
  }

  private static log(level: string, message: string, ...args: unknown[]): void {
    if (!Logger.channel) {
      Logger.init();
    }
    const timestamp = new Date().toISOString();
    const extra = args.length > 0 ? ' ' + args.map(a => JSON.stringify(a)).join(' ') : '';
    Logger.channel!.appendLine(`[${timestamp}] [${level}] ${message}${extra}`);
  }

  static show(): void {
    Logger.channel?.show();
  }

  static dispose(): void {
    Logger.channel?.dispose();
  }
}
