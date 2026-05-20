'use client'

import { useEffect, useState } from "react";
import { getPatrimonio } from "../_services/patrimonio";
import { AllocationDonut } from "../_components/AllocationDonut";
import { AssetsPanel } from "../_components/AssetsPanel";
import { EvolucaoChart } from "../_components/EvolucaoChart";
import { Chip, KpiCard, PageHeader, Section, fmtBRL } from "../_components/ui";

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await getPatrimonio();
        setData(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        Carregando...
      </div>
    );
  }

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
          value={fmtBRL(data?.patrimonioTotal ?? 0)}
          delta={{ value: "+2,4% mês", positive: true }}
        />
        <KpiCard
          label="Rentabilidade YTD"
          value={fmtBRL(data?.rentabilidadeYTD ?? 0)}
          delta={{ value: "vs CDI 11,2%", positive: true }}
          hint="Ibovespa: +14,1%"
        />
        <KpiCard
          label="Aporte mensal"
          value={fmtBRL(data?.aporteMensal ?? 0)}
          hint="Próximo: 05 jun"
        />
        <KpiCard
          label="Ativos sob gestão"
          value={String(data?.ativos?.quantidade ?? 0)}
          hint="5 classes · 4 instituições"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Section
          title="Evolução do Patrimônio"
          description="Aporte acumulado + ganho de capital, mês a mês"
          className="lg:col-span-3"
        >
          <EvolucaoChart data={data} />
        </Section>

        <Section
          title="Ativos na carteira"
          description="Distribuição por classe"
          className="lg:col-span-2"
        >
          <AllocationDonut data={data} />
        </Section>
      </div>

      <AssetsPanel data={data} />
    </div>
  );
}
