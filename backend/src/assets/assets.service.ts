// assets.service.ts — lógica de negócio dos ativos financeiros

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  // registra um novo ativo para o usuário
  async create(userId: string, dto: CreateAssetDto) {
    return this.prisma.asset.create({
      data: {
        name: dto.name,
        ticker: dto.ticker,
        type: dto.type,
        quantity: dto.quantity,
        purchasePrice: dto.purchasePrice,
        currentPrice: dto.currentPrice,
        purchasedAt: new Date(dto.purchasedAt),
        userId,
      },
    });
  }

  // retorna todos os ativos com valor total e lucro/prejuízo calculados
  async findAll(userId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { userId },
      orderBy: { purchasedAt: 'desc' },
    });

    return assets.map((asset) => ({
      ...asset,
      totalValue: Number(asset.quantity) * Number(asset.currentPrice),
      totalCost: Number(asset.quantity) * Number(asset.purchasePrice),
      profitLoss:
        Number(asset.quantity) * (Number(asset.currentPrice) - Number(asset.purchasePrice)),
    }));
  }

  // atualiza os campos enviados — útil para atualizar currentPrice com a cotação atual
  async update(userId: string, id: string, dto: UpdateAssetDto) {
    await this.findOwned(userId, id);
    return this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        // converte purchasedAt para Date apenas se foi enviado no body
        ...(dto.purchasedAt && { purchasedAt: new Date(dto.purchasedAt) }),
      },
    });
  }

  // remove o ativo do portfólio do usuário
  async remove(userId: string, id: string) {
    await this.findOwned(userId, id);
    return this.prisma.asset.delete({ where: { id } });
  }

  // método auxiliar — lança 404 se o ativo não existir ou não pertencer ao usuário
  private async findOwned(userId: string, id: string) {
    const asset = await this.prisma.asset.findFirst({ where: { id, userId } });
    if (!asset) throw new NotFoundException('Ativo não encontrado');
    return asset;
  }
}
