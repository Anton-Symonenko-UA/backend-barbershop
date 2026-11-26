import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.js';

/** SMS клієнтам через TurboSMS (turbosms.ua). Без токена нічого не надсилає. */
@Injectable()
export class SmsClient {
  private readonly logger = new Logger(SmsClient.name);
  private readonly token?: string;
  private readonly sender: string;

  constructor(config: ConfigService<Env, true>) {
    this.token = config.get('TURBOSMS_TOKEN', { infer: true });
    this.sender = config.get('TURBOSMS_SENDER', { infer: true });
  }

  get enabled() {
    return Boolean(this.token);
  }

  async send(phone: string, text: string): Promise<void> {
    if (!this.enabled) return;
    const res = await fetch('https://api.turbosms.ua/message/send.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        recipients: [phone.replace(/^\+/, '')],
        sms: { sender: this.sender, text },
      }),
      signal: AbortSignal.timeout(5000),
    });
    const body = (await res.json().catch(() => null)) as {
      response_code?: number;
    } | null;
    // TurboSMS відповідає 200 навіть на помилки; успіх: response_code 0, 1 або 800–802
    const code = body?.response_code;
    if (
      !res.ok ||
      code === undefined ||
      !(code <= 1 || (code >= 800 && code <= 802))
    ) {
      throw new Error(`TurboSMS error ${res.status}/${code ?? '?'}`);
    }
    this.logger.debug('SMS sent');
  }
}
