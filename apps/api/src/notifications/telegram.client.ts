import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Повідомлення в Telegram-чат адміністратора. Без токена нічого не робить. */
@Injectable()
export class TelegramClient {
  private readonly logger = new Logger(TelegramClient.name);
  private readonly token?: string;
  private readonly chatId?: string;

  constructor(config: ConfigService<Env, true>) {
    this.token = config.get('TELEGRAM_BOT_TOKEN', { infer: true });
    this.chatId = config.get('TELEGRAM_ADMIN_CHAT_ID', { infer: true });
  }

  get enabled() {
    return Boolean(this.token && this.chatId);
  }

  /** text у форматі Telegram HTML; значення від користувачів екрануй через escapeHtml. */
  async send(text: string): Promise<void> {
    if (!this.enabled) return;
    const res = await fetch(
      `https://api.telegram.org/bot${this.token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
        }),
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) {
      // Тіло відповіді не логуємо повністю: у ньому може бути щось зайве
      throw new Error(`Telegram API ${res.status}`);
    }
    this.logger.debug('Telegram message sent');
  }
}
