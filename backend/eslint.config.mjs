// eslint.config.mjs — regras de qualidade e estilo de código do backend
// Executar manualmente: npm run lint
// O Prettier cuida da formatação, o ESLint cuida das regras de código

// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // arquivos ignorados pelo ESLint
    ignores: [
      'eslint.config.mjs',
      'generated/**',      // ignora o client gerado pelo Prisma
      'dist/**',           // ignora a pasta de build
      'node_modules/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',            // permite uso de any quando necessário
      '@typescript-eslint/no-floating-promises': 'warn',      // avisa sobre promises não tratadas
      '@typescript-eslint/no-unsafe-argument': 'warn',        // avisa sobre argumentos unsafe
      '@typescript-eslint/no-unsafe-member-access': 'warn',   // avisa sobre acesso a membros unsafe
      '@typescript-eslint/no-unsafe-assignment': 'warn',      // avisa sobre atribuições unsafe
      'prettier/prettier': ['error', { endOfLine: 'auto' }],  // erro se o código não estiver formatado
      'no-console': 'warn',                                   // avisa sobre console.log esquecido no código
    },
  },
);
