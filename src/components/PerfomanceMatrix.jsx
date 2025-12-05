import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

function PerformanceMatrix({ data }) {
  const matrixData = useMemo(() => {
    if (data.length === 0) return { rows: [], columns: [] };

    // 1. Get unique Dates (Dt. Prazo Atual) and Sort them
    const dates = [...new Set(data.map(item => item.dtPrazo).filter(Boolean))].sort();
    
    // 2. Get unique Statuses and Sort them (Using Status column for matrix columns as before)
    const statuses = [...new Set(data.map(item => item.status).filter(Boolean))].sort();

    // 3. Build Rows
    const rows = dates.map(date => {
      const dateItems = data.filter(d => d.dtPrazo === date);
      
      // Counts per status for this date
      const statusCounts = {};
      statuses.forEach(status => {
        statusCounts[status] = dateItems.filter(d => d.status === status).length;
      });

      // Performance calc for this date using SLA2
      // Positive: 'ENTREGUE NO PRAZO' and 'DENTRO DO PRAZO'
      const positiveStatuses = ['ENTREGUE NO PRAZO', 'DENTRO DO PRAZO'];
      const withinSLA = dateItems.filter(d => 
        d.sla2 && positiveStatuses.includes(d.sla2.toString().trim().toUpperCase())
      ).length;
      
      const total = dateItems.length;
      const performance = total > 0 ? (withinSLA / total) * 100 : 0;

      return {
        date,
        counts: statusCounts,
        total,
        performance
      };
    });

    return { rows, columns: statuses };
  }, [data]);

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '';
    
    const dt = String(dateStr).trim();
    
    // If YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dt)) {
      const parts = dt.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    // If DD/MM/YYYY already - return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dt)) {
      return dt;
    }
    
    // Handle M/D/YY or MM/DD/YY format (Excel default)
    if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dt)) {
      const parts = dt.split('/');
      const month = String(parts[0]).padStart(2, '0');
      const day = String(parts[1]).padStart(2, '0');
      const year = parts[2];
      const fullYear = year.length === 2 ? '20' + year : year;
      return `${day}/${month}/${fullYear}`;
    }
    
    // Handle DD/MM/YY format
    if (/^\d{1,2}\/\d{1,2}\/\d{2}/.test(dt)) {
      const parts = dt.split('/');
      const day = String(parts[0]).padStart(2, '0');
      const month = String(parts[1]).padStart(2, '0');
      const year = parts[2];
      const fullYear = year.length === 2 ? '20' + year : year;
      return `${day}/${month}/${fullYear}`;
    }
    
    return dt;
  };

  if (data.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
    >
      <div className="p-6 border-b border-white/20">
        <h2 className="text-xl font-bold text-white">Análise Diária por Status e Performance</h2>
        <p className="text-sm text-blue-200 mt-1">Visão detalhada de vencimentos (Baseado em SLA2)</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-white">
          <thead className="bg-white/5 text-xs uppercase bg-slate-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 font-bold border-r border-white/10 sticky left-0 bg-slate-800 z-10">
                Dt. Vencimento
              </th>
              {matrixData.columns.map(status => (
                <th key={status} scope="col" className="px-4 py-3 text-center border-r border-white/10 min-w-[100px]">
                  {status}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 font-bold text-center bg-slate-800/50">
                Performance
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {matrixData.rows.map((row, index) => (
              <motion.tr 
                key={row.date}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-4 font-medium whitespace-nowrap border-r border-white/10 sticky left-0 bg-slate-900/90 backdrop-blur-sm z-10">
                  {formatDateBR(row.date)}
                </td>
                {matrixData.columns.map(status => (
                  <td key={`${row.date}-${status}`} className="px-4 py-4 text-center border-r border-white/10">
                    {row.counts[status] > 0 ? (
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200">
                        {row.counts[status]}
                      </span>
                    ) : (
                      <span className="text-white/20">-</span>
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-center font-bold">
                  <span className={`${
                    row.performance >= 98 ? 'text-green-400' : 
                    row.performance >= 85 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {row.performance.toFixed(1)}%
                  </span>
                </td>
              </motion.tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-white/10 font-bold border-t-2 border-white/20">
              <td className="px-6 py-4 border-r border-white/10 sticky left-0 bg-slate-800 z-10">
                TOTAL
              </td>
              {matrixData.columns.map(status => {
                const totalForStatus = matrixData.rows.reduce((acc, row) => acc + (row.counts[status] || 0), 0);
                return (
                  <td key={`total-${status}`} className="px-4 py-4 text-center border-r border-white/10">
                    {totalForStatus}
                  </td>
                );
              })}
              <td className="px-6 py-4 text-center">
                {/* Overall average for displayed rows */}
                {matrixData.rows.length > 0 && (
                  <span>
                    {(matrixData.rows.reduce((acc, row) => acc + row.performance, 0) / matrixData.rows.length).toFixed(1)}%
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default PerformanceMatrix;