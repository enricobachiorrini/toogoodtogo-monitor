declare namespace NodeJS {
  export interface ProcessEnv {
    EMAIL: string;
    DISCORD_WEBHOOK: string;
    TELEGRAM_BOT_TOKEN: string;
    TELEGRAM_CHAT_ID: string;
    PROXY: string;
  }
}
