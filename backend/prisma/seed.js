// seed.js — popula o banco com dados de teste realistas para 12 meses
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USER_ID = '3199105d-d991-47ce-8060-98e5a61b1233';

// Gera uma data ISO para o dia especificado
function d(year, month, day) {
  return new Date(year, month - 1, day).toISOString();
}

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // ── Limpa dados existentes do usuário (mantém o usuário) ──────────────────
  await prisma.transaction.deleteMany({ where: { userId: USER_ID } });
  await prisma.asset.deleteMany({ where: { userId: USER_ID } });
  await prisma.wallet.deleteMany({ where: { userId: USER_ID } });
  console.log('✓ Dados antigos removidos');

  // ── Carteiras ─────────────────────────────────────────────────────────────
  const [itau, xp, clear, nubank] = await Promise.all([
    prisma.wallet.create({ data: { name: 'Itaú Corrente', type: 'CHECKING',   userId: USER_ID } }),
    prisma.wallet.create({ data: { name: 'XP Investimentos', type: 'INVESTMENT', userId: USER_ID } }),
    prisma.wallet.create({ data: { name: 'Clear Corretora', type: 'INVESTMENT', userId: USER_ID } }),
    prisma.wallet.create({ data: { name: 'Nubank', type: 'CHECKING',   userId: USER_ID } }),
  ]);
  console.log('✓ 4 carteiras criadas');

  // ── Ativos ────────────────────────────────────────────────────────────────
  const assets = [
    // Ações BR
    { name: 'Vale ON',           ticker: 'VALE3',  type: 'STOCK',        quantity: '800',   purchasePrice: '56.92', currentPrice: '67.42', purchasedAt: d(2025, 6, 5)  },
    { name: 'Itaú PN',           ticker: 'ITUB4',  type: 'STOCK',        quantity: '1200',  purchasePrice: '32.05', currentPrice: '38.91', purchasedAt: d(2025, 7, 12) },
    { name: 'Petrobras PN',      ticker: 'PETR4',  type: 'STOCK',        quantity: '600',   purchasePrice: '38.20', currentPrice: '41.78', purchasedAt: d(2025, 8, 3)  },
    { name: 'WEG ON',            ticker: 'WEGE3',  type: 'STOCK',        quantity: '350',   purchasePrice: '41.50', currentPrice: '47.12', purchasedAt: d(2025, 9, 15) },
    { name: 'Banco do Brasil ON',ticker: 'BBAS3',  type: 'STOCK',        quantity: '400',   purchasePrice: '28.30', currentPrice: '26.85', purchasedAt: d(2025, 10, 8) },
    // FIIs
    { name: 'CSHG Logística',    ticker: 'HGLG11', type: 'REAL_ESTATE',  quantity: '200',   purchasePrice: '162.50', currentPrice: '171.80', purchasedAt: d(2025, 6, 18) },
    { name: 'Kinea Renda Imob.', ticker: 'KNRI11', type: 'REAL_ESTATE',  quantity: '150',   purchasePrice: '275.00', currentPrice: '291.40', purchasedAt: d(2025, 7, 22) },
    { name: 'XP Malls',         ticker: 'XPML11', type: 'REAL_ESTATE',  quantity: '300',   purchasePrice: '112.00', currentPrice: '119.50', purchasedAt: d(2025, 8, 10) },
    { name: 'Vinci Logística',   ticker: 'VILG11', type: 'REAL_ESTATE',  quantity: '250',   purchasePrice: '108.00', currentPrice: '114.20', purchasedAt: d(2025, 9, 5)  },
    // Cripto
    { name: 'Bitcoin',           ticker: 'BTC',    type: 'CRYPTO',       quantity: '0.4',   purchasePrice: '310000.00', currentPrice: '389000.00', purchasedAt: d(2025, 6, 1)  },
    { name: 'Ethereum',          ticker: 'ETH',    type: 'CRYPTO',       quantity: '3',     purchasePrice: '8500.00',   currentPrice: '12400.00',  purchasedAt: d(2025, 7, 1)  },
    // Exterior
    { name: 'iShares S&P 500',   ticker: 'IVVB11', type: 'FUND',         quantity: '100',   purchasePrice: '345.00', currentPrice: '398.50', purchasedAt: d(2025, 6, 20) },
    { name: 'Vanguard S&P 500',  ticker: 'VOO',    type: 'FUND',         quantity: '12',    purchasePrice: '2750.00', currentPrice: '3120.00', purchasedAt: d(2025, 8, 5)  },
    { name: 'Nasdaq 100 ETF',    ticker: 'QQQ',    type: 'FUND',         quantity: '8',     purchasePrice: '2100.00', currentPrice: '2580.00', purchasedAt: d(2025, 9, 1)  },
    // Renda Fixa
    { name: 'Tesouro Selic 2027',ticker: null,     type: 'FIXED_INCOME', quantity: '1000',  purchasePrice: '13.50',   currentPrice: '14.20',  purchasedAt: d(2025, 6, 1)  },
    { name: 'LCI Bradesco 14%',  ticker: null,     type: 'FIXED_INCOME', quantity: '1',     purchasePrice: '15000.00', currentPrice: '16100.00', purchasedAt: d(2025, 7, 15) },
    { name: 'CDB Nubank 115% CDI',ticker: null,    type: 'FIXED_INCOME', quantity: '1',     purchasePrice: '10000.00', currentPrice: '10850.00', purchasedAt: d(2025, 8, 1)  },
  ];

  await prisma.asset.createMany({
    data: assets.map((a) => ({ ...a, userId: USER_ID })),
  });
  console.log(`✓ ${assets.length} ativos criados`);

  // ── Transações (12 meses: Jun/2025 → Mai/2026) ────────────────────────────
  const transactions = [];

  const months = [
    [2025, 6], [2025, 7], [2025, 8], [2025, 9], [2025, 10], [2025, 11],
    [2025, 12], [2026, 1], [2026, 2], [2026, 3], [2026, 4], [2026, 5],
  ];

  const salarios   = [12000, 12000, 12500, 12500, 12500, 13000, 13000, 13000, 13500, 13500, 13500, 14000];
  const aportes    = [8000,  8500,  8000,  9000,  8500,  9000,  8000,  9500,  9000,  9500,  10000, 10000];
  const dividendos = [680,   720,   695,   750,   710,   780,   820,   760,   800,   840,   870,   920];

  for (let i = 0; i < months.length; i++) {
    const [y, m] = months[i];

    // ENTRADAS
    transactions.push({ description: 'Salário',                amount: String(salarios[i]),   type: 'INCOME',  category: 'Trabalho',          date: d(y, m, 5),  userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Aporte mensal XP',       amount: String(aportes[i]),    type: 'INCOME',  category: 'Investimentos',     date: d(y, m, 6),  userId: USER_ID, walletId: xp.id });
    transactions.push({ description: 'Dividendos FIIs',        amount: String(dividendos[i]), type: 'INCOME',  category: 'Renda passiva',     date: d(y, m, 15), userId: USER_ID, walletId: clear.id });
    if (i % 3 === 0) {
      transactions.push({ description: 'Freelance design',       amount: '2500',               type: 'INCOME',  category: 'Trabalho',          date: d(y, m, 20), userId: USER_ID, walletId: nubank.id });
    }

    // SAÍDAS
    transactions.push({ description: 'Aluguel',                amount: '3200',  type: 'EXPENSE', category: 'Moradia',       date: d(y, m, 1),  userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Supermercado',           amount: String(1800 + (i * 30)), type: 'EXPENSE', category: 'Alimentação',    date: d(y, m, 8),  userId: USER_ID, walletId: nubank.id });
    transactions.push({ description: 'Restaurantes',           amount: String(600 + (i * 20)),  type: 'EXPENSE', category: 'Alimentação',    date: d(y, m, 18), userId: USER_ID, walletId: nubank.id });
    transactions.push({ description: 'Transporte / Gasolina',  amount: '780',   type: 'EXPENSE', category: 'Transporte',    date: d(y, m, 10), userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Energia elétrica',       amount: '220',   type: 'EXPENSE', category: 'Moradia',       date: d(y, m, 12), userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Internet / Telefone',    amount: '180',   type: 'EXPENSE', category: 'Moradia',       date: d(y, m, 13), userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Academia',               amount: '120',   type: 'EXPENSE', category: 'Saúde',         date: d(y, m, 2),  userId: USER_ID, walletId: nubank.id });
    transactions.push({ description: 'Plano de saúde',         amount: '480',   type: 'EXPENSE', category: 'Saúde',         date: d(y, m, 5),  userId: USER_ID, walletId: itau.id });
    transactions.push({ description: 'Lazer / Streaming',      amount: '150',   type: 'EXPENSE', category: 'Lazer',         date: d(y, m, 20), userId: USER_ID, walletId: nubank.id });
    if (i % 2 === 0) {
      transactions.push({ description: 'Cinema / Passeios',    amount: String(200 + (i * 25)), type: 'EXPENSE', category: 'Lazer', date: d(y, m, 22), userId: USER_ID, walletId: nubank.id });
    }
    if (i % 4 === 0) {
      transactions.push({ description: 'Roupas / Compras',     amount: '850',   type: 'EXPENSE', category: 'Outros',        date: d(y, m, 25), userId: USER_ID, walletId: nubank.id });
    }
  }

  await prisma.transaction.createMany({ data: transactions });
  console.log(`✓ ${transactions.length} transações criadas (12 meses)`);

  const totIn  = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totOut = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  console.log(`\n📊 Resumo:`);
  console.log(`   Entradas totais : R$ ${totIn.toLocaleString('pt-BR')}`);
  console.log(`   Saídas totais   : R$ ${totOut.toLocaleString('pt-BR')}`);
  console.log(`   Saldo acumulado : R$ ${(totIn - totOut).toLocaleString('pt-BR')}`);
  console.log(`\n✅ Seed concluído com sucesso!`);
}

main()
  .catch((e) => { console.error('❌ Erro:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
