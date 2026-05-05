// wallets.service.ts — lógica de negócio das carteiras financeiras
// O saldo (balance) é calculado dinamicamente somando as transações vinculadas
// INCOME aumenta o saldo, EXPENSE diminui

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  // cria uma nova carteira — saldo começa zerado (nenhuma transação vinculada ainda)
  async create(userId: string, dto: CreateWalletDto) {
    return this.prisma.wallet.create({
      data: { name: dto.name, type: dto.type, userId },
    });
  }

  // retorna todas as carteiras do usuário com o saldo calculado dinamicamente
  async findAll(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        // busca apenas amount e type de cada transação para calcular o saldo
        transactions: { select: { amount: true, type: true } },
        // conta o número de transações vinculadas
        _count: { select: { transactions: true } },
      },
    });

    // transforma cada carteira: calcula o saldo e remove o array de transações da resposta
    return wallets.map((wallet) => {
      const balance = wallet.transactions.reduce((soma, t) => {
        // INCOME soma ao saldo, EXPENSE subtrai
        return soma + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount));
      }, 0);

      // desestrutura para remover transactions (não deve ser exposto na resposta)
      const { transactions, ...rest } = wallet;
      return { ...rest, balance };
    });
  }

  // atualiza nome e/ou tipo da carteira — verifica se pertence ao usuário
  async update(userId: string, id: string, dto: UpdateWalletDto) {
    await this.findOwned(userId, id);
    return this.prisma.wallet.update({ where: { id }, data: dto });
  }

  // remove a carteira — as transações vinculadas ficam com walletId = null (SetNull no schema)
  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    return this.prisma.wallet.delete({ where: { id } });
  }

  // método auxiliar — lança 404 se a carteira não existir ou não pertencer ao usuário
  private async findOwned(userId: string, id: string) {
    const wallet = await this.prisma.wallet.findFirst({ where: { id, userId } });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    return wallet;
  }
}
