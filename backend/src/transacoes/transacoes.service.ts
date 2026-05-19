import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from './transacao.entity';
import { Carteira } from '../carteiras/carteira.entity';
import { CriarTransacaoDto } from './dto/criar-transacao.dto';

/**
 * Serviço responsável pelas operações de transações financeiras.
 * Gerencia criação e consulta de transações no banco de dados.
 */
@Injectable()
export class TransacoesService {
  constructor(
    @InjectRepository(Transacao)
    private readonly transacoesRepository: Repository<Transacao>,

    @InjectRepository(Carteira)
    private readonly carteirasRepository: Repository<Carteira>,
  ) {}

  /**
   * Cria uma nova transação financeira.
   * @param userId - ID do usuário autenticado
   * @param dto - Dados da transação
   * @returns A transação criada
   * @throws NotFoundException se a carteira não existir
   * @throws ForbiddenException se a carteira não pertencer ao usuário
   */
  async criar(userId: string, dto: CriarTransacaoDto): Promise<Transacao> {
    // Verifica se a carteira existe
    const carteira = await this.carteirasRepository.findOne({
      where: { id: dto.carteira_id },
      relations: ['user'],
    });

    if (!carteira) {
      throw new NotFoundException('Carteira não encontrada.');
    }

    // Garante que a carteira pertence ao usuário autenticado
    if (carteira.user.id !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta carteira.');
    }

    // Cria e salva a transação
    const transacao = this.transacoesRepository.create({
      tipo: dto.tipo,
      valor: dto.valor,
      categoria: dto.categoria,
      descricao: dto.descricao,
      data: new Date(dto.data),
      user: { id: userId },
      carteira: { id: dto.carteira_id },
    });

    return this.transacoesRepository.save(transacao);
  }

  /**
   * Lista todas as transações do usuário autenticado.
   * @param userId - ID do usuário autenticado
   * @returns Lista de transações do usuário
   */
  async listar(userId: string): Promise<Transacao[]> {
    return this.transacoesRepository.find({
      where: { user: { id: userId } },
      relations: ['carteira'],
      order: { data: 'DESC' },
    });
  }
}