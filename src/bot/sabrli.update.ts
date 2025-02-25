import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { SabrliService } from './sabrli.service';

@Update()
export class SabrliUpdate {
  constructor(private readonly sabrliService: SabrliService) {}

  @Action(/^sabrlibulimi_+\d+$/)
  async onSabrli(@Ctx() ctx: Context) {
    await this.sabrliService.onSabrli(ctx);
  }

  @Action(/^xizmatlar_+\d+$/)
  async onAnyService(@Ctx() ctx: Context) {
    await this.sabrliService.onAnyService(ctx);
  }

  @Action(/^bandqilish_+\d+$/)
  async onBandQilish(@Ctx() ctx: Context) {
    await this.sabrliService.onBandQilish(ctx);
  }
}
