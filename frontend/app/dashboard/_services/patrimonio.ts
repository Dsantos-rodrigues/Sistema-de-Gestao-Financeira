import { api } from "../../lib/api";

export type PatrimonioResponse = {
  patrimonioTotal: number;
  carteiras: {
    total: number;
    quantidade: number;
  };
  ativos: {
    valorAtual: number;
    custoCompra: number;
    lucroprejuizo: number;
    quantidade: number;
  };
  transacoes: {
    totalEntradas: number;
    totalSaidas: number;
    saldo: number;
    quantidade: number;
  };
};

export async function getPatrimonio(): Promise<PatrimonioResponse> {
  return api.get<PatrimonioResponse>("/patrimonio");
}