import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carteira } from './carteira.entity';
import { Transacao } from '../transacoes/transacao.entity';
import { TipoTransacao } from '../transacoes/transacao.entity';
import { FiltroAgregacaoDto } from './dto/filtro-agregacao.dto';


/**
 * Serviço responsável pelas operações de carteiras e patrimônio.
 * Gerencia consulta de patrimônio e cálculo de saldo do usuário.
 */
@Injectable()
export class CarteirasService {
  constructor(
    @InjectRepository(Carteira)
    private readonly carteirasRepository: Repository<Carteira>,

    @InjectRepository(Transacao)
    private readonly transacoesRepository: Repository<Transacao>,
  ) {}

  /**
   * Lista todas as carteiras do usuário autenticado.
   * @param userId - ID do usuário autenticado
   * @returns Lista de carteiras do usuário
   */
  async listarCarteiras(userId: string): Promise<Carteira[]> {
    return this.carteirasRepository.find({
      where: { user: { id: userId } },
    });
  }

  /**
   * Consulta o patrimônio completo do usuário.
   * Retorna todas as carteiras com seus saldos calculados.
   * @param userId - ID do usuário autenticado
   * @returns Lista de carteiras com saldo calculado e saldo total geral
   */
  async consultarPatrimonio(userId: string) {
    const carteiras = await this.carteirasRepository.find({
      where: { user: { id: userId } },
    });

    // Para cada carteira, calcula o saldo com base nas transações
    const carteirasComSaldo = await Promise.all(
      carteiras.map(async (carteira) => {
        const saldo = await this.calcularSaldoCarteira(carteira.id);
        return { ...carteira, saldo_calculado: saldo };
      }),
    );

    // Calcula o saldo total somando todas as carteiras
    const saldo_total = carteirasComSaldo.reduce(
      (acc, carteira) => acc + carteira.saldo_calculado,
      0,
    );

    return {
      carteiras: carteirasComSaldo,
      saldo_total,
    };
  }

  /**
   * Calcula o saldo de uma carteira específica.
   * Soma entradas e subtrai saídas das transações da carteira.
   * @param carteiraId - ID da carteira
   * @returns Saldo calculado da carteira
   */
  async calcularSaldoCarteira(carteiraId: string): Promise<number> {
    const transacoes = await this.transacoesRepository.find({
      where: { carteira: { id: carteiraId } },
    });

    // Soma entradas e subtrai saídas
    return transacoes.reduce((saldo, transacao) => {
      const valor = Number(transacao.valor);
      return transacao.tipo === TipoTransacao.ENTRADA
        ? saldo + valor
        : saldo - valor;
    }, 0);
  }

  /**
   * Calcula o saldo total do usuário somando todas as carteiras.
   * @param userId - ID do usuário autenticado
   * @returns Saldo total do usuário
   */
  async calcularSaldoTotal(userId: string): Promise<{ saldo_total: number }> {
    const transacoes = await this.transacoesRepository.find({
      where: { user: { id: userId } },
    });

    const saldo_total = transacoes.reduce((saldo, transacao) => {
      const valor = Number(transacao.valor);
      return transacao.tipo === TipoTransacao.ENTRADA
        ? saldo + valor
        : saldo - valor;
    }, 0);

    return { saldo_total };
  }

  /**
   * Gera agregações financeiras do usuário por período e categoria.
   * @param userId - ID do usuário autenticado
   * @param filtro - Filtros opcionais de período e carteira
   * @returns Resumo financeiro com totais por tipo e categoria
   */
  async gerarAgregacoes(userId: string, filtro: FiltroAgregacaoDto) {
    // Monta a query base filtrando pelo usuário
    const query = this.transacoesRepository
      .createQueryBuilder('transacao')
      .where('transacao.user_id = :userId', { userId });

    // Aplica filtro de data início se informado
    if (filtro.data_inicio) {
      query.andWhere('transacao.data >= :data_inicio', {
        data_inicio: filtro.data_inicio,
      });
    }

    // Aplica filtro de data fim se informado
    if (filtro.data_fim) {
      query.andWhere('transacao.data <= :data_fim', {
        data_fim: filtro.data_fim,
      });
    }

    // Aplica filtro de carteira se informado
    if (filtro.carteira_id) {
      query.andWhere('transacao.carteira_id = :carteira_id', {
        carteira_id: filtro.carteira_id,
      });
    }

    const transacoes = await query.getMany();

    // Calcula totais de entrada e saída
    const total_entradas = transacoes
      .filter((t) => t.tipo === TipoTransacao.ENTRADA)
      .reduce((acc, t) => acc + Number(t.valor), 0);

    const total_saidas = transacoes
      .filter((t) => t.tipo === TipoTransacao.SAIDA)
      .reduce((acc, t) => acc + Number(t.valor), 0);

    // Agrupa por categoria
    const por_categoria = transacoes.reduce((acc, t) => {
      const categoria = t.categoria || 'Sem categoria';
      if (!acc[categoria]) {
        acc[categoria] = { entradas: 0, saidas: 0 };
      }
      if (t.tipo === TipoTransacao.ENTRADA) {
        acc[categoria].entradas += Number(t.valor);
      } else {
        acc[categoria].saidas += Number(t.valor);
      }
      return acc;
    }, {} as Record<string, { entradas: number; saidas: number }>);

    return {
      total_entradas,
      total_saidas,
      saldo_periodo: total_entradas - total_saidas,
      por_categoria,
      quantidade_transacoes: transacoes.length,
    };
  }
}
