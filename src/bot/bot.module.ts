import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { BotUpdate } from './bot.update';
import { SahiyUpdate } from './sahiy.update';
import { SahiyService } from './sahiy.service';
import { Sahiy } from './models/sahiy.model';
import { AdminService } from './admin.service';
import { AdminUpdate } from './admin.update';
import { Admin } from './models/admin.model';
import { Sabrli } from './models/sabrli.model';
import { SabrliService } from './sabrli.service';
import { SabrliUpdate } from './sabrli.update';

@Module({
  imports: [SequelizeModule.forFeature([Bot, Sahiy, Admin, Sabrli])],
  providers: [
    BotService,
    BotUpdate,
    AdminService,
    AdminUpdate,
    SahiyService,
    SahiyUpdate,
    SabrliService,
    SabrliUpdate,
  ],
  exports: [BotService],
})
export class BotModule {}
