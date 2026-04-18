import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

/**
 * Módulo responsável pelo gerenciamento de usuários.
 * Registra a entity User no TypeORM e disponibiliza
 * o UsersService para outros módulos.
 */
@Module({
  imports: [
    // Registra a entity User para uso do TypeORM neste módulo
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UsersService],
  // Exporta o UsersService para que o AuthModule possa utilizá-lo
  exports: [UsersService], // sem isso aqui o AuthModule não enxerga o serviço
})
export class UsersModule {}