import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Context, Markup } from 'telegraf';
import { Sabrli } from './models/sabrli.model';
import { Bot } from './models/bot.model';
import { Sahiy } from './models/sahiy.model';

@Injectable()
export class SabrliService {
  sabrlilar: Partial<Sabrli> = {};
  constructor(
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Bot) private readonly botModel: typeof Bot,
  ) {}

  async onSabrli(ctx: Context) {
    const user_id = ctx.from?.id;
    const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
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
    if (!sabrli) {
      const sabrli1 = await this.sabrliModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });
      await ctx.reply('xizmatlardan birini tanlamoqchimisiz: ', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'ha',
                callback_data: `xizmatlar_${sabrli1.user_id}`,
              },
              {
                text: 'hozir emas',
                callback_data: `yo'q_${user_id}`,
              },
            ],
          ],
        },
      });
    } else if (!sabrli.status) {
      sabrli.last_state = 'phone_number';
      await sabrli.save();
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
      await ctx.reply('xizmatlardan birini tanlamoqchimisiz: ', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'ha',
                callback_data: `xizmatlar_${sabrli.user_id}`,
              },
              {
                text: 'hozir emas',
                callback_data: `yo'q_${user_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onAnyService(ctx: Context) {
    const user_id = ctx.from?.id;
    const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
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
    if (!sabrli) {
      await this.sabrliModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });
    } else if (!sabrli.status) {
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
      await ctx.replyWithHTML('sizga qanday xizmat kerak: ', {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'SARTAROSHXONA 💇',
                callback_data: `xizmat_SARTAROSHXONA_${user_id}`,
              },
            ],
            [
              {
                text: "GO'ZALLIK SALONI 💅",
                callback_data: `xizmat_BEAUTYSALON_${user_id}`,
              },
            ],
            [
              {
                text: 'ZARGARLIK USTAXONASI 💍',
                callback_data: `xizmat_ZARGAR_${user_id}`,
              },
            ],
            [
              {
                text: 'SOATSOZ 🕰',
                callback_data: `xizmat_SOATSOZ_${user_id}`,
              },
            ],
            [
              {
                text: 'POYABZAL USTAXONASI 👞',
                callback_data: `xizmat_POYABZAL_${user_id}`,
              },
            ],
          ],
        },
      });
    }
  }

  async onXizmat(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const xizmat = contextAction.split('_')[1];
    const user_id = Number(contextAction.split('_')[2]);
    const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
    console.log('sabrli1: ', sabrli);
    if (!sabrli) {
      await ctx.replyWithHTML(
        'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']])
            .resize()
            .oneTime(),
        },
      );
    } else {
      if (!sabrli.name) {
        sabrli.last_state = 'name';
        await sabrli.save();
        await ctx.replyWithHTML('iltimos ismingizni kiriting: ', {
          parse_mode: 'HTML',
          ...Markup.removeKeyboard(),
        });
      } else if (!sabrli.phone_number) {
        sabrli.last_state = 'phone_number';
        await sabrli.save();
        await ctx.reply(
          "Telefon raqamingizni yuborsangiz bazaga saqlab qo'yamiz",
          {
            parse_mode: 'HTML',
            ...Markup.keyboard([
              [Markup.button.contactRequest('Telefon raqamni yuborish')],
            ])
              .resize()
              .oneTime(),
          },
        );
      } else if (!sabrli.location) {
        sabrli.last_state = 'location';
        sabrli.status = true;
        await sabrli.save();
        await ctx.reply('bizga lokatsiyani yuboring: ', {
          parse_mode: 'HTML',
          ...Markup.keyboard([
            [Markup.button.locationRequest('locatsiyani yuborish')],
          ])
            .resize()
            .oneTime(),
        });
      } else {
        sabrli.xizmat = xizmat;
        sabrli.last_state = 'sahiy';
        await sabrli.save();
        const sahiylar = await this.sahiyModel.findAll();
        await ctx.reply('siz sahiylardan birini tanlang: ', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `name: ${sahiylar[0]?.first_name}`,
                  callback_data: `bandqilish_${sahiylar[0]?.user_id}_${sabrli.user_id}`,
                },
                {
                  text: `name: ${sahiylar[1]?.first_name}`,
                  callback_data: `bandqilish_${sahiylar[1]?.user_id}_${sabrli.user_id}`,
                },
              ],
            ],
          },
        });
      }
    }
  }

  async onBandQilish(ctx: Context) {
    const user_id = ctx.from?.id;
    const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
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
    if (!sabrli) {
      await this.sabrliModel.create({
        user_id,
        user_name: ctx.from?.username,
        first_name: ctx.from?.first_name,
        last_name: ctx.from?.last_name,
        lang: ctx.from?.language_code,
      });
    } else if (!sabrli.status) {
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
      const contextAction = ctx.callbackQuery!['data'];
      const sahiy_id = contextAction.split('_')[1];
      const sabrli_id = contextAction.split('_')[2];
      await ctx.reply("sizning so'rovingiz ko'rib chiqilmoqda...");
    }
  }
}
