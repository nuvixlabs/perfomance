import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { exportToXLSX } from '../lib/dataUtils';

function DataTable({ data }) {
  const summaryData = useMemo(() => {
    const summary = {};
    
    data.forEach(item => {
      const key = `${item.status}-${item.unidadeAtual}`;
      if (!summary[key]) {
        summary[key] = {
          status: item.status,
          unidade: item.unidadeAtual,
          quantidade: 0
        };
      }
      summary[key].quantidade += 1;
    });

    return Object.values(summary);
  }, [data]);

  const handleDownload = () => {
    if (data.length === 0) {
      toast({
        title: "Nenhum dado disponível",
        description: "Não há dados para fazer download.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Exporting raw filtered data as per request "no mesmo formato das notas importadas"
      exportToXLSX(data, `relatorio-status-detalhado-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: "Download concluído!",
        description: "Relatório detalhado exportado em XLSX com sucesso."
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro no download",
        description: "Não foi possível gerar o arquivo.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
    >
      <div className="p-6 border-b border-white/20 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Relação Status / Unidade / Quantidade</h2>
          <p className="text-sm text-blue-200 mt-1">Resumo consolidado dos dados</p>
        </div>
        <Button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Detalhado (XLSX)
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white">Unidade</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-white">Quantidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {summaryData.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-white/60">
                  Nenhum dado disponível. Importe um arquivo XLSX para começar.
                </td>
              </tr>
            ) : (
              summaryData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-white">{row.status}</td>
                  <td className="px-6 py-4 text-sm text-white">{row.unidade}</td>
                  <td className="px-6 py-4 text-sm text-white text-right font-semibold">
                    {row.quantidade}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default DataTable;