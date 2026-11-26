import { Module } from '@nestjs/common';
import { NotificationsListener } from './notifications.listener.js';
import { RemindersService } from './reminders.service.js';
import { SmsClient } from './sms.client.js';
import { TelegramClient } from './telegram.client.js';

@Module({
  providers: [
    TelegramClient,
    SmsClient,
    NotificationsListener,
    RemindersService,
  ],
})
export class NotificationsModule {}
