import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

// esse módulo expõe o UsersService pra quem precisar usar
// o AuthModule vai importar ele pra conseguir verificar os usuários no login
@Module({
  providers: [UsersService],
  exports: [UsersService], // sem isso aqui o AuthModule não enxerga o serviço
})
export class UsersModule {}
