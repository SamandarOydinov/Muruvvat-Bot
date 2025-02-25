import { Action, Ctx, Hears, On, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SahiyService } from './sahiy.service';

@Update()
export class SahiyUpdate {
  constructor(private readonly sahiyService: SahiyService) {}

  @Action(/^sahiybulimi_+\d+$/)
  async onSahiy(@Ctx() ctx: Context) {
    await this.sahiyService.onSahiy(ctx);
  }

  @Action(/^muruvvat_+\d+$/)
  async onMuruvvat(@Ctx() ctx: Context) {
    await this.sahiyService.onMuruvvat(ctx);
  }

  @Action(/^korishSabrlilar_+\d+$/)
  async onShowSabrlilarni(@Ctx() ctx: Context) {
    console.log('object');
    await this.sahiyService.onShowSabrlilarni(ctx);
  }

  @Action(/^istalganKishiga_+\d+$/)
  async onToSomeone(@Ctx() ctx: Context) {
    await this.sahiyService.onToSomeone(ctx);
  }
}
