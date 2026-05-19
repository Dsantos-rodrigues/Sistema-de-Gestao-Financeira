import { Chip, PageHeader, Section } from "../_components/ui";

const RECOMMENDATIONS = [
  {
    title: "Concentração em ações brasileiras acima da meta",
    detail:
      "Sua exposição a ações BR está em 32%, contra os 25% definidos no plano de alocação. Considere realocar parte da posição para Exterior ou Renda fixa de longo prazo.",
    confidence: 87,
    impact: "alto",
    action: "Rebalancear",
    tone: "warning",
  },
  {
    title: "HGLG11 com sentimento de mercado deteriorando",
    detail:
      "Análise de 4.2k notícias e 18k posts dos últimos 30 dias indica viés negativo (−0,42). O fundo apresenta risco de revisão de dividendo.",
    confidence: 72,
    impact: "médio",
    action: "Revisar posição",
    tone: "warning",
  },
  {
    title: "Janela de aporte favorável em cripto",
    detail:
      "BTC corrigiu 4,1% na semana com volume estável e RSI em 38 (oversold). Volatilidade implícita acima da média histórica.",
    confidence: 64,
    impact: "médio",
    action: "Considerar aporte",
    tone: "info",
  },
  {
    title: "Reserva de emergência atingiu meta",
    detail:
      "Você acumulou o equivalente a 6,2 meses do seu padrão de gastos em renda fixa pós-fixada de alta liquidez. Excedente pode ser direcionado a aportes de longo prazo.",
    confidence: 95,
    impact: "alto",
    action: "Realocar excedente",
    tone: "positive",
  },
  {
    title: "Tesouro IPCA+ com taxa atrativa",
    detail:
      "Yield real de 6,8% a.a. está no topo histórico dos últimos 18 meses. Boa janela para alongar duração da renda fixa.",
    confidence: 79,
    impact: "alto",
    action: "Aumentar exposição",
    tone: "info",
  },
];

const SENTIMENT = [
  { sector: "Tech BR", value: 0.32 },
  { sector: "Bancos", value: 0.78 },
  { sector: "Commodities", value: 0.55 },
  { sector: "Varejo", value: 0.21 },
  { sector: "Energia", value: 0.62 },
  { sector: "Cripto", value: 0.41 },
  { sector: "FIIs", value: 0.38 },
  { sector: "Tech US", value: 0.84 },
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="IA Insights"
        description="Recomendações personalizadas e análise de sentimento de mercado"
        action={
          <Chip tone="gold">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
            Análise atualizada · há 4 min
          </Chip>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section
            title="Recomendações"
            description={`${RECOMMENDATIONS.length} insights baseados na sua carteira e dados de mercado`}
            bodyPadding={false}
          >
            <ul className="divide-y divide-zinc-50">
              {RECOMMENDATIONS.map((r, i) => (
                <RecommendationItem key={i} rec={r} />
              ))}
            </ul>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section
            title="Sentimento de mercado"
            description="Radar por setor · últimos 30 dias"
          >
            <SentimentRadar />
            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                Bearish
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-zinc-300" />
                Neutro
              </span>
              <span className="flex items-center gap-1.5 text-zinc-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Bullish
              </span>
            </div>
          </Section>

          <Section
            title="Como a IA funciona"
            description="Transparência nas recomendações"
          >
            <ul className="flex flex-col gap-3 text-xs text-zinc-600">
              <InfoLine
                title="Modelo proprietário"
                description="Treinado com 12 anos de dados B3 + sinais de mercado global"
              />
              <InfoLine
                title="Confidence score"
                description="Probabilidade calibrada (0-100%) baseada em backtests"
              />
              <InfoLine
                title="Sem conflito de interesse"
                description="Não recebemos comissão de corretoras ou gestores"
              />
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
}

function RecommendationItem({
  rec,
}: {
  rec: (typeof RECOMMENDATIONS)[number];
}) {
  const toneIcon =
    rec.tone === "warning"
      ? "bg-gold-200/40 text-gold-600"
      : rec.tone === "positive"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-sky-50 text-sky-700";
  return (
    <li className="flex gap-4 px-6 py-5">
      <span
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${toneIcon}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c1 .8 1.5 1.5 1.5 2.3v1h5v-1c0-.8.5-1.5 1.5-2.3A7 7 0 0 0 12 2z" />
        </svg>
      </span>
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-ink-900">{rec.title}</span>
          <Chip
            tone={
              rec.tone === "warning"
                ? "gold"
                : rec.tone === "positive"
                ? "positive"
                : "info"
            }
          >
            Impacto {rec.impact}
          </Chip>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">{rec.detail}</p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <ConfidenceBar value={rec.confidence} />
          <button
            type="button"
            className="inline-flex h-7 items-center rounded-md border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            {rec.action}
          </button>
        </div>
      </div>
    </li>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-zinc-500">Confiança</span>
      <span className="relative h-1 w-24 overflow-hidden rounded-full bg-zinc-100">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-gold-500"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="font-medium tabular-nums text-ink-900">{value}%</span>
    </div>
  );
}

function SentimentRadar() {
  const cx = 110;
  const cy = 110;
  const max = 100;
  const angle = (i: number) => (i / SENTIMENT.length) * Math.PI * 2 - Math.PI / 2;

  const point = (i: number, r: number) => {
    const a = angle(i);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const polygonPoints = SENTIMENT.map((s, i) => {
    const r = s.value * max;
    const [x, y] = point(i, r);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox="0 0 220 220" className="h-56 w-full">
      {[0.25, 0.5, 0.75, 1].map((scale, i) => {
        const points = SENTIMENT.map((_, j) => {
          const [x, y] = point(j, scale * max);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#f4f4f5"
            strokeWidth="1"
          />
        );
      })}

      {SENTIMENT.map((_, i) => {
        const [x, y] = point(i, max);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#f4f4f5"
            strokeWidth="1"
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="#c89b3c"
        fillOpacity="0.18"
        stroke="#c89b3c"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {SENTIMENT.map((s, i) => {
        const [x, y] = point(i, s.value * max);
        const tone =
          s.value > 0.6
            ? "#10b981"
            : s.value < 0.35
            ? "#f43f5e"
            : "#a1a1aa";
        return <circle key={i} cx={x} cy={y} r="3" fill={tone} />;
      })}

      {SENTIMENT.map((s, i) => {
        const [x, y] = point(i, max + 16);
        return (
          <text
            key={s.sector}
            x={x}
            y={y}
            fontSize="9"
            fill="#52525b"
            textAnchor="middle"
            dominantBaseline="middle"
            fontWeight="500"
          >
            {s.sector}
          </text>
        );
      })}
    </svg>
  );
}

function InfoLine({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold-200/50 text-gold-600">
        <svg
          viewBox="0 0 12 12"
          fill="none"
          className="h-2 w-2"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 6l3 3 5-6" />
        </svg>
      </span>
      <span className="flex flex-col">
        <span className="font-medium text-ink-900">{title}</span>
        <span className="text-zinc-500">{description}</span>
      </span>
    </li>
  );
}
