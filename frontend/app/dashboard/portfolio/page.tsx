import { AllocationDonut } from "../_components/AllocationDonut";
import { AssetsPanel } from "../_components/AssetsPanel";
import { EvolucaoChart } from "../_components/EvolucaoChart";
import { Chip, KpiCard, PageHeader, Section, fmtBRL } from "../_components/ui";

// Patrimônio total = soma das categorias do AssetsPanel
// (399.382 + 349.267 + 224.529 + 174.634 + 99.570 = 1.247.382)
const TOTAL = 1247382;
const ASSET_COUNT = 18;

export default function PortfolioPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Portfólio de ativos"
        description="Visão consolidada do seu patrimônio em todas as classes."
        action={
          <div className="flex items-center gap-2">
            <Chip tone="gold">Open Finance · 4 instituições</Chip>
            <Chip tone="neutral">Atualizado há 2 min</Chip>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Patrimônio total"
          value={fmtBRL(TOTAL)}
          delta={{ value: "+2,4% mês", positive: true }}
        />
        <KpiCard
          label="Rentabilidade YTD"
          value="+18,30%"
          delta={{ value: "vs CDI 11,2%", positive: true }}
          hint="Ibovespa: +14,1%"
        />
        <KpiCard
          label="Aporte mensal"
          value={fmtBRL(12000)}
          hint="Próximo: 05 jun"
        />
        <KpiCard
          label="Ativos sob gestão"
          value={String(ASSET_COUNT)}
          hint="5 classes · 4 instituições"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section
          title="Evolução do Patrimônio"
          description="Aporte acumulado + ganho de capital, mês a mês"
          className="lg:col-span-3"
        >
          <EvolucaoChart />
        </Section>

        <Section
          title="Ativos na carteira"
          description="Distribuição por classe"
          className="lg:col-span-2"
        >
          <AllocationDonut />
        </Section>
      </div>

      <AssetsPanel />
    </div>
  );
}
