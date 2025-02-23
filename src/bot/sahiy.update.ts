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

  @Action(/^barchaSabrli_+\d+$/)
  async onAllSabrli(@Ctx() ctx: Context) {
    await this.sahiyService.onAllSabrli(ctx);
  }
}
