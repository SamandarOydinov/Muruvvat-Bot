import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SabrliService } from './sabrli.service';

@Update()
export class SabrliUpdate {
  constructor(private readonly mijozService: SabrliService) {}

  @Action(/^sabrlibulimi_+\d+$/)
  async onSabrli(@Ctx() ctx: Context) {
    console.log('mijozga kirildi');
    await this.mijozService.onSabrli(ctx);
  }

  @Action(/^xizmat_[A-Z]+_\d+$/)
  async onXizmat(@Ctx() ctx: Context) {
    await this.mijozService.onXizmat(ctx);
  }

  @Action(/^xizmatlar_+\d+$/)
  async onAnyService(@Ctx() ctx: Context) {
    await this.mijozService.onAnyService(ctx);
  }

  @Action(/^bandqilish_+\d+$/)
  async onBandQilish(@Ctx() ctx: Context) {
    await this.mijozService.onBandQilish(ctx);
  }
}
