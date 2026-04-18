import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

/**
 * Módulo raiz da aplicação.
 * Configura o banco de dados e importa todos os módulos.
 */
@Module({
  imports: [
    // Carrega as variáveis de ambiente do .env globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configura a conexão com o PostgreSQL via TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      // Carrega todas as entities automaticamente
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // Cria/atualiza as tabelas automaticamente — apenas em desenvolvimento!
      synchronize: true,
    }),

    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}