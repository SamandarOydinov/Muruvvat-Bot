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
                callback_data: `muruvvat_${user_id}`,
              },
              {
                text: `Sabrlilarni ko’rish`,
                callback_data: `korishSabrlilar_${user_id}`,
              },
            ],
            [
              {
                text: `Sozlamalar`,
                callback_data: `settings_${user_id}`,
              },
              {
                text: `Admin bilan bog’lanish`,
                callback_data: `connectWithAdmin_${user_id}`,
              },
            ],
            [
              {
                text: `Asosiy menyu`,
                callback_data: `MENU_${user_id}`,
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
      await ctx.reply('Kimga: ', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Istalgan kishiga`,
                callback_data: `istalganKishiga_${sahiy_id}`,
              },
              {
                text: `Aniq bir kishiga`,
                callback_data: `birKishiga_${sahiy_id}`,
              },
            ],
          ],
        },
      });
      // let sahiylar = await this.sahiyModel.findAll();
      // console.log('sahiylar=>', sahiylar);
      //   await ctx.reply(
      //     "Do'stim hozircha ba'zi sabablarga ko'ra sabrlilar mavjud emas",
      //   );
    }
  }

  async onShowSabrlilarni(ctx: Context) {
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
      await ctx.reply("biror bo'limni tanlang: ", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Barcha sabrlilar',
                callback_data: `allSabrlilar_${sahiy_id}`,
              },
              {
                text: "Hudud bo'yicha",
                callback_data: `hududBuyicha_${sahiy_id}`,
              },
            ],
            [
              {
                text: "Jins va yosh bo'yicha",
                callback_data: `jinsVaYosh_${sahiy_id}`,
              },
              {
                text: "Jins va o'lcham bo'yicha",
                callback_data: `jinsVaUlcham_${sahiy_id}`,
              },
            ],
            [
              {
                text: 'ortga qaytish',
                callback_data: `ortgaFromShowSabrli_${sahiy_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onToSomeone(ctx: Context) {
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
      sahiy.is_ehson = true;
      await sahiy.save();
      await ctx.reply('Nima bermoqchisiz: ');
    }
  }
}
