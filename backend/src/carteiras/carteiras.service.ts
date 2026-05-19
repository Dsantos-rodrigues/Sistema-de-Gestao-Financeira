import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carteira } from './carteira.entity';
import { Transacao } from '../transacoes/transacao.entity';
import { TipoTransacao } from '../transacoes/transacao.entity';

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
}