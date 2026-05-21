import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { MarketService } from './market.service';

@ApiTags('Mercado')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Public()
  @Get('summary')
  @ApiOperation({ summary: 'Resumo de mercado com cambio, acoes, cripto e indicadores' })
  getSummary() {
    return this.marketService.getSummary();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Buscar ativos para autocomplete por nome, ticker ou termo parecido' })
  @ApiQuery({
    name: 'q',
    required: true,
    example: 'vale',
    description: 'Termo digitado pelo usuario. Ex: vale, hgl, hgll, petrobras',
  })
  @ApiQuery({
    name: 'kind',
    required: false,
    example: 'acoes',
    description: 'Filtro opcional: acoes, fii, etf, cripto',
  })
  searchAssets(@Query('q') query = '', @Query('kind') kind = '') {
    return this.marketService.searchAssets(query, kind);
  }

  @Public()
  @Get('quotes')
  @ApiOperation({ summary: 'Buscar cotacoes normalizadas por simbolo' })
  @ApiQuery({
    name: 'symbols',
    required: true,
    example: 'VALE3,PETR4,USD-BRL,BTC',
    description: 'Lista separada por virgula. Ex: VALE3,PETR4,USD-BRL,BTC',
  })
  getQuotes(@Query('symbols') symbols = '') {
    return this.marketService.getQuotes(symbols);
  }
}
