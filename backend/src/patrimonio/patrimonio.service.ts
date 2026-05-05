// patrimonio.service.ts — calcula o patrimônio consolidado do usuário
// Agrega saldos de carteiras, valor atual de ativos e resumo de transações

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatrimonioService {
  constructor(private readonly prisma: PrismaService) {}

  async getPatrimonio(userId: string) {
    // busca carteiras, ativos e transações do usuário em paralelo para melhor performance
    const [wallets, assets, transactions] = await Promise.all([
      this.prisma.wallet.findMany({
        where: { userId },
        // inclui as transações de cada carteira para calcular o saldo dinamicamente
        include: { transactions: { select: { amount: true, type: true } } },
      }),
      this.prisma.asset.findMany({ where: { userId } }),
      this.prisma.transaction.findMany({ where: { userId } }),
    ]);

    // saldo de cada carteira = soma das entradas − soma das saídas vinculadas a ela
    // depois soma os saldos de todas as carteiras para obter o total
    const totalCarteiras = wallets.reduce((total, carteira) => {
      const saldoCarteira = carteira.transactions.reduce((soma, t) => {
        return soma + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
      }, 0);
      return total + saldoCarteira;
    }, 0);

    // soma o valor atual de cada ativo (quantidade × preço atual)
    const totalAtivos = assets.reduce(
      (soma, ativo) => soma + Number(ativo.quantity) * Number(ativo.currentPrice),
      0,
    );

    // soma o custo total de compra dos ativos (quantidade × preço de compra)
    const custoAtivos = assets.reduce(
      (soma, ativo) => soma + Number(ativo.quantity) * Number(ativo.purchasePrice),
      0,
    );

    // soma todas as entradas (salário, freelance, etc.)
    const totalEntradas = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((soma, t) => soma + Number(t.amount), 0);

    // soma todas as saídas (contas, compras, etc.)
    const totalSaidas = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((soma, t) => soma + Number(t.amount), 0);

    return {
      // patrimônio total = saldo em carteiras + valor atual dos ativos
      patrimonioTotal: totalCarteiras + totalAtivos,

      // detalhamento por categoria
      carteiras: {
        total: totalCarteiras, // soma dos saldos calculados de todas as carteiras
        quantidade: wallets.length, // número de carteiras cadastradas
      },

      ativos: {
        valorAtual: totalAtivos, // valor de mercado atual
        custoCompra: custoAtivos, // quanto foi investido
        lucroprejuizo: totalAtivos - custoAtivos, // resultado: positivo = lucro, negativo = prejuízo
        quantidade: assets.length, // número de ativos cadastrados
      },

      transacoes: {
        totalEntradas, // soma de todas as receitas
        totalSaidas, // soma de todas as despesas
        saldo: totalEntradas - totalSaidas, // saldo líquido das transações
        quantidade: transactions.length, // total de transações registradas
      },
    };
  }
}
