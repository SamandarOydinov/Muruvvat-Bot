import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { Sahiy } from './models/sahiy.model';
import { Bot } from './models/bot.model';
import { Sabrli } from './models/sabrli.model';

@Injectable()
export class SahiyService {
  sabrlilar: Partial<Sabrli> = {};
  constructor(
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Bot) private readonly botModel: typeof Bot,
  ) {}

  async onSahiy(ctx: Context) {
    const user_id = ctx.from?.id;
    const sahiy = await this.sahiyModel.findOne({ where: { user_id } });
    const user = await this.botModel.findOne({ where: { user_id } });
    if (!user) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    }
    if (!sahiy) {
      const sahiy = await this.sahiyModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });
      sahiy.last_state = 'name';
      await sahiy.save();
      await ctx.reply('Sizni kim deb atashimizni xohlaysiz: ');
    } else if (!sahiy.status) {
      await ctx.reply(
        `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqamni yuborish')],
          ])
            .resize()
            .oneTime(),
        },
      );
    } else if (sahiy.last_state == 'finish') {
      await ctx.reply(`biror bo'limni tanlang👇`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Muruvvat qilish`,
                callback_data: `muruvvat_${sahiy.user_id}`,
              },
              {
                text: `Sabrlilarni ko’rish`,
                callback_data: `barchaSabrli_${sahiy.user_id}`,
              },
            ],
            [
              {
                text: `Sozlamalar`,
                callback_data: `settings_${sahiy.user_id}`,
              },
              {
                text: `Admin bilan bog’lanish`,
                callback_data: `connectWithAdmin_${sahiy.user_id}`,
              },
            ],
            [
              {
                text: `Asosiy menyu`,
                callback_data: `MENU_${sahiy.user_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onMuruvvat(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = contextAction.split('_')[1];
    const sahiy = await this.sahiyModel.findOne({
      where: { user_id: sahiy_id },
    });
    if (!sahiy) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    } else if (!sahiy.status) {
      await ctx.reply(
        `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqamni yuborish')],
          ])
            .resize()
            .oneTime(),
        },
      );
    } else {
      let sahiylar = this.sahiyModel.findAll({ include: Sabrli });
      console.log('sahiylar=>', sahiylar);
      if (1) {
      } else {
        await ctx.reply(
          "Do'stim hozircha ba'zi sabablarga ko'ra sabrlilar mavjud emas",
        );
      }
    }
  }

  async onAllSabrli(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = contextAction.split('_')[1];
    const sahiy = await this.sahiyModel.findOne({
      where: { user_id: sahiy_id },
    });
    if (!sahiy) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    } else if (!sahiy.status) {
      await ctx.reply(
        `Iltimos, <b>Telefon raqamni yuborish</b> tugmasini bosing`,
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.contactRequest('Telefon raqamni yuborish')],
          ])
            .resize()
            .oneTime(),
        },
      );
    } else {
      await ctx.reply('Siz barcha sabrlilar degan joyni bosdingiz');
    }
  }
}
