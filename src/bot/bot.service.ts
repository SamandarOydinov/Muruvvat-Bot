import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Bot } from './models/bot.model';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Markup, Telegraf } from 'telegraf';
import { BOT_NAME } from '../app.constants';
import { Admin } from './models/admin.model';
import { Sahiy } from './models/sahiy.model';
import { Sabrli } from './models/sabrli.model';

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(Sahiy) private readonly sahiyModel: typeof Sahiy,
    @InjectModel(Sabrli) private readonly sabrliModel: typeof Sabrli,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>,
  ) {}

  async start(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await this.botModel.create({
          user_id,
          user_name: ctx.from?.username,
          first_name: ctx.from?.first_name,
          last_name: ctx.from?.last_name,
          lang: ctx.from?.language_code,
        });
      }
      await ctx.replyWithHTML(
        "Ro'yxatdan o'tish uchun pastdagi tugmani bosing",
        {
          parse_mode: 'HTML',
          ...Markup.keyboard([["Ro'yxatdan o'tish"]])
            .resize()
            .oneTime(),
        },
      );
    } catch (error) {
      console.log('StartError: ', error);
    }
  }

  async onRegister(ctx: Context) {
    await ctx.replyWithHTML("siz kim bo'lib ro'yxatdan o'tmoqchisiz", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Sahiy`,
              callback_data: `sahiybulimi_${ctx.from?.id}`,
            },
            {
              text: `Sabrli`,
              callback_data: `sabrlibulimi_${ctx.from?.id}`,
            },
          ],
        ],
      },
    });
  }

  async adminTasdiqladi(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = Number(contextAction.split('_')[1]);
    const sahiy = await this.sahiyModel.update(
      { status: true },
      { where: { user_id: sahiy_id } },
    );
    await this.bot.telegram.sendMessage(
      sahiy_id,
      "Tabriklayman ✅ sizning so'rovingiz adminlar tomonidan tasdiqlandi! ",
      {
        parse_mode: 'Markdown',
        ...Markup.removeKeyboard(),
      },
    );
  }

  async adminBekorQildi(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = Number(contextAction.split('_')[1]);

    const sahiy = await this.sahiyModel.update(
      { status: false },
      { where: { user_id: sahiy_id } },
    );
    await this.bot.telegram.sendMessage(
      sahiy_id,
      "Afsuski sizning so'rovingiz adminlar tomonidan bekor qilindi, nimanidir xato qilgandirsiz e'tibor qilib ko'ring!",
      {
        parse_mode: 'HTML',
        ...Markup.keyboard([["Ro'yxatdan o'tish"]])
          .resize()
          .oneTime(),
      },
    );
  }

  async onTekshirish(ctx: Context) {
    const sahiy = await this.sahiyModel.findOne({
      where: { user_id: ctx.from?.id },
    });
    if (sahiy?.status)
      await ctx.reply("Tekshiruvdan muvaffaqiyatli o'tgansiz👌");
    await ctx.reply('Tekshirilmoqda...');
  }

  async onTasdiqlash(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = Number(contextAction.split('_')[1]);
    const admin_id = Number(contextAction.split('_')[2]);
    const sahiy = await this.sahiyModel.findOne({
      where: { user_id: sahiy_id },
    });
    await this.bot.telegram.sendMessage(
      admin_id,
      `
sahiy ismi: ${sahiy?.name}
sahiy familiyasi: ${sahiy?.last_name}
sahiy location: ${sahiy?.location}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Tasdiqlash', `approve_${sahiy_id}`)],
          [Markup.button.callback('❌ Bekor qilish', `reject_${sahiy_id}`)],
        ]),
      },
    );
    await ctx.reply('✅ So‘rovingiz adminlarga yuborildi!');

    await ctx.reply("quyidagi bo'limlardan birini tanlang", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Tekshirish',
              callback_data: `check_${sahiy_id}`,
            },
            {
              text: 'Bekor qilish',
              callback_data: `bekor_${sahiy_id}_${admin_id}`,
            },
            {
              text: "Admin bilan bog'lanish",
              callback_data: `call_${sahiy_id}_${admin_id}`,
            },
          ],
        ],
      },
    });
  }

  async onCallWithAdmin(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = Number(contextAction.split('_')[1]);
    const sahiy = await this.sahiyModel.findOne({
      where: { user_id: sahiy_id },
    });
    if (sahiy) {
      sahiy.call_with_admin = true;
      await sahiy.save();
      await ctx.reply(
        "iltimos adminga yubormoqchi bo'lgan matningizni yuboring",
      );
    } else {
      await ctx.reply("siz hali ro'yxatdan o'tmagansiz: ", {
        parse_mode: 'HTML',
        ...Markup.keyboard([['/start']])
          .resize()
          .oneTime(),
      });
    }
  }

  async onBekor(ctx: Context) {
    const contextAction = ctx.callbackQuery!['data'];
    const sahiy_id = Number(contextAction.split('_')[1]);
    const admin_id = Number(contextAction.split('_')[2]);
    const newSahiy = await this.sahiyModel.findOne({
      where: { user_id: sahiy_id },
    });
    await this.bot.telegram.sendMessage(
      admin_id,
      `<---Mana shu shaxs kirib bekor qildi--->
sahiy ismi: ${newSahiy?.name}
sahiy familiyasi: ${newSahiy?.last_name}
sahiy location: ${newSahiy?.location}`,
    );
    const sahiy = await this.sahiyModel.destroy({
      where: { user_id: sahiy_id },
    });
    await ctx.reply("Yana qaytadan urinib ko'rishingiz mumkin!", {
      parse_mode: 'HTML',
      ...Markup.keyboard([["Ro'yxatdan o'tish"]]),
    });
  }

  async onContact(ctx: Context) {
    try {
      if ('contact' in ctx.message!) {
        const user_id = ctx.from?.id;
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
        } else if (ctx.message.contact.user_id !== user_id) {
          await ctx.reply(
            "iltimos do'stim faqat o'zingizning accountingizga ochilgan contactni yuboring",
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
          const sahiy = await this.sahiyModel.findOne({where: {user_id}})
          if(!sahiy){
            await ctx.replyWithHTML(
              'iltimos <b>/start</b> tugmasini bosing yoki pastdagi buttonni bosing',
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([['/start']])
                  .resize()
                  .oneTime(),
              },
            );
          } else if(sahiy.last_state !== "finish") {
            if(sahiy.last_state == "phone_number"){
              sahiy.phone_number = ctx.message.contact.phone_number;
              sahiy.status = true
              sahiy.last_state = "location"
              await sahiy.save()
              await ctx.reply("endi lokatsiyangizni yuborishingiz kerak: ", {
                parse_mode: "HTML",
                ...Markup.button.locationRequest("lokatsiyani yuborish")
              })
            }
          }
        }
      }
    } catch (error) {
      console.log('contactError: ', error);
    }
  }

  async onLocation(ctx: Context) {
    try {
      if ('location' in ctx.message!) {
        const user_id = ctx.from?.id;
        const sahiy = await this.sahiyModel.findOne({ where: { user_id } });
        const user = await this.botModel.findOne({ where: { user_id } });
        const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
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
        } else {
          if (sahiy) {
            if(sahiy.last_state !== 'finish'){
              if (sahiy.last_state == 'location') {
                sahiy.last_state = 'finish';
                let lat = ctx.message.location.latitude;
                let long = ctx.message.location.longitude;
                sahiy.location = { lat, long };
                await sahiy.save();
                await ctx.reply(
                  "locatsiyangiz muvaffaqiyatli saqlandi do'stim👍",
                  { parse_mode: 'HTML', ...Markup.removeKeyboard() },
                );
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
          } else {
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

          // Sabrli

          if (sabrli) {
            if (sabrli.last_state !== 'finish') {
              if (sabrli.last_state == 'location') {
                sabrli.last_state = 'sahiy';
                sabrli.location = {
                  lat: ctx.message.location.latitude,
                  long: ctx.message.location.longitude,
                };
                await sabrli.save();
                const sahiylar = await this.sahiyModel.findAll();
                await ctx.reply('siz sahiylardan birini tanlang: ', {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: `name: ${sahiylar[0]?.name}`,
                          callback_data: `bandqilish_${sahiylar[0]?.user_id}_${sabrli.user_id}`,
                        },
                        {
                          text: `name: ${sahiylar[1]?.name}`,
                          callback_data: `bandqilish_${sahiylar[1]?.user_id}_${sabrli.user_id}`,
                        },
                      ],
                    ],
                  },
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('contactError: ', error);
    }
  }

  async onText(ctx: Context) {
    if ('text' in ctx.message!) {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findOne({ where: { user_id } });
      const sahiy = await this.sahiyModel.findOne({ where: { user_id } });
      const admin = await this.adminModel.findOne({ where: { user_id } });
      const sabrli = await this.sabrliModel.findOne({ where: { user_id } });
      if (!user) {
        await ctx.reply(`Siz avval ro'yxatdan o'ting`, {
          parse_mode: 'HTML',
          ...Markup.keyboard([['/start']]).resize(),
        });
      }
      //  Sahiy
       else if (sahiy) {
        if (sahiy.last_state !== 'finish') {
          if (sahiy.last_state == 'name') {
            sahiy.last_state = 'phone_number';
            sahiy.name = ctx.message.text;
            await sahiy.save();
            await ctx.reply(
              `Iltimos, o'zingizni telefon raqamingizni yuboring`,
              {
                parse_mode: 'HTML',
                ...Markup.keyboard([
                  [Markup.button.contactRequest('Telefon raqamni yuborish')],
                ])
                  .resize()
                  .oneTime(),
              },
            );
          }
        } else if (sahiy.call_with_admin) {
          if (ctx.message.text !== 'end') {
            const message = ctx.message.text;
            await this.bot.telegram.sendMessage(process.env.ADMIN_ID!, message);
          } else {
            sahiy.call_with_admin = false;
            await sahiy.save();
            await this.bot.telegram.sendMessage(
              process.env.ADMIN_ID!,
              ctx.message.text,
            );
          }
        }
      }
      //  Sabrli
      if (sabrli) {
        if (sabrli.last_state !== 'finish') {
          if (sabrli.last_state == 'name') {
            sabrli.last_state = 'phone_number';
            sabrli.name = ctx.message.text;
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
          } else if (sabrli.last_state === 'sahiy') {
            sabrli.last_state = '';
          }
        }
      }
    }
  }
}
