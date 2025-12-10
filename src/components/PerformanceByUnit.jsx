import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function PerformanceByUnit({ data }) {
  const positiveStatuses = ['ENTREGUE NO PRAZO', 'DENTRO DO PRAZO'];

  const rows = useMemo(() => {
    if (!data || data.length === 0) return [];

    const normalize = (value) => (value || '').toString().trim().toUpperCase();
    const groups = {};

    data.forEach((item) => {
      const unidade = item.unidadeAtual || 'Sem unidade';
      const sla2 = normalize(item.sla2);

      if (!groups[unidade]) {
        groups[unidade] = {
          unidade,
          total: 0,
          dentroPrazo: 0,
          atrasada: 0,
          vencida: 0,
        };
      }

      groups[unidade].total += 1;

      if (positiveStatuses.includes(sla2)) {
        groups[unidade].dentroPrazo += 1;
      } else if (sla2 === 'ATRASADA') {
        groups[unidade].atrasada += 1;
      } else if (sla2 === 'VENCIDA') {
        groups[unidade].vencida += 1;
      }
    });

    return Object.values(groups)
      .map((group) => ({
        ...group,
        performance: group.total > 0 ? (group.dentroPrazo / group.total) * 100 : 0,
      }))
      .sort((a, b) => b.performance - a.performance);
  }, [data]);

  if (!rows.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
    >
      <div className="p-6 border-b border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Performance por Unidade Atual</h2>
          <p className="text-sm text-blue-200 mt-1">
            Percentual baseado em SLA2 (Entregue/Dentro do Prazo) por unidade
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white">
          <thead className="bg-white/5 text-xs uppercase bg-slate-800/50">
            <tr>
              <th className="px-6 py-3 font-bold sticky left-0 bg-slate-800 z-10">Unidade</th>
              <th className="px-6 py-3 font-bold text-right">Total</th>
              <th className="px-6 py-3 font-bold text-right">No prazo</th>
              <th className="px-6 py-3 font-bold text-right">Atrasada</th>
              <th className="px-6 py-3 font-bold text-right">Vencida</th>
              <th className="px-6 py-3 font-bold text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row, index) => (
              <motion.tr
                key={row.unidade}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 font-medium whitespace-nowrap sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10">
                  {row.unidade}
                </td>
                <td className="px-6 py-4 text-right">{row.total}</td>
                <td className="px-6 py-4 text-right text-green-300 font-semibold">{row.dentroPrazo}</td>
                <td className="px-6 py-4 text-right text-yellow-200">{row.atrasada}</td>
                <td className="px-6 py-4 text-right text-orange-300">{row.vencida}</td>
                <td className="px-6 py-4 text-right font-bold">
                  <span
                    className={`${
                      row.performance >= 98
                        ? 'text-green-400'
                        : row.performance >= 85
                          ? 'text-yellow-300'
                          : 'text-red-400'
                    }`}
                  >
                    {row.performance.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default PerformanceByUnit;

