import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MarketService } from './market.service';

@ApiTags('Mercado')
@ApiBearerAuth('JWT')
@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Resumo de mercado com cambio, acoes, cripto e indicadores' })
  getSummary() {
    return this.marketService.getSummary();
  }

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
