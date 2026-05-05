// transactions.service.ts — lógica de negócio das transações financeiras

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // salva uma nova transação vinculada ao usuário autenticado
  // se walletId for informado, a transação fica vinculada àquela carteira
  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        description: dto.description,
        amount: dto.amount,
        type: dto.type,
        category: dto.category,
        date: new Date(dto.date),
        userId,
        // vincula à carteira apenas se o campo foi enviado
        ...(dto.walletId && { walletId: dto.walletId }),
      },
    });
  }

  // retorna todas as transações do usuário, da mais recente para a mais antiga
  // inclui o nome da carteira vinculada (se houver) para exibição no frontend
  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: {
        // retorna apenas o nome da carteira para evitar dados desnecessários
        wallet: { select: { id: true, name: true } },
      },
    });
  }

  // atualiza apenas os campos enviados — verifica se a transação pertence ao usuário
  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    await this.findOwned(userId, id);

    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...dto,
        // converte date para Date apenas se foi enviado no body
        ...(dto.date && { date: new Date(dto.date) }),
      },
    });
  }

  // remove a transação — verifica se pertence ao usuário antes de deletar
  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    return this.prisma.transaction.delete({ where: { id } });
  }

  // método auxiliar — busca a transação e lança 404 se não existir ou não pertencer ao usuário
  private async findOwned(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({ where: { id, userId } });
    if (!transaction) throw new NotFoundException('Transação não encontrada');
    return transaction;
  }
}
