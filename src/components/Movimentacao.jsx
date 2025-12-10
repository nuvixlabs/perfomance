import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { fetchMovimentacaoSheetData } from '../lib/googleSheetsUtils';
import { exportToXLSX } from '../lib/dataUtils';

// Helper para extrair YYYY-MM da coluna L em formatos variados (aceita 1 ou 2 dígitos)
const extractYearMonth = (value) => {
  if (!value) return '';
  const dt = String(value).trim();

  // YYYY-MM-DD ou YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) return dt.substring(0, 7);

  // DD/MM/YYYY ou D/M/YYYY (aceita 1 ou 2 dígitos)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(dt)) {
    const parts = dt.split('/');
    const d = String(parts[0]).padStart(2, '0');
    const m = String(parts[1]).padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}`;
  }

  // M/D/YY ou MM/DD/YY
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dt)) {
    const parts = dt.split('/');
    const month = String(parts[0]).padStart(2, '0');
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    return `${year}-${month}`;
  }

  return '';
};

function Movimentacao() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    mes: '',
    baseOrigem: '',
    tipos: [],
    situacao: '',
  });

  const bases = useMemo(() => {
    return [...new Set(data.map(d => d.unidadeOrigem).filter(Boolean))].sort();
  }, [data]);

  const tipos = useMemo(() => {
    return [...new Set(data.map(d => d.tipoRomaneio).filter(Boolean))].sort();
  }, [data]);

  const situacoes = useMemo(() => {
    return [...new Set(data.map(d => (d.situacaoBaixa || '').toString().trim()).filter(Boolean))].sort();
  }, [data]);

  useEffect(() => {
    const next = data.filter(item => {
      if (filters.mes) {
        const ym = extractYearMonth(item.dataGeracao);
        if (ym !== filters.mes) return false;
      }

      if (filters.baseOrigem && filters.baseOrigem !== 'all') {
        if (item.unidadeOrigem !== filters.baseOrigem) return false;
      }

      if (filters.tipos.length > 0) {
        if (!filters.tipos.includes(item.tipoRomaneio)) return false;
      }

      if (filters.situacao && filters.situacao !== 'all') {
        const val = (item.situacaoBaixa || '').toString().trim().toLowerCase();
        const selected = filters.situacao.toLowerCase();
        if (val !== selected) return false;
      }

      return true;
    });
    setFilteredData(next);
  }, [data, filters]);

  const handleLoadGoogleSheets = async () => {
    setIsLoading(true);
    try {
      const sheetData = await fetchMovimentacaoSheetData();
      setData(sheetData);
      toast({
        title: 'Movimentações carregadas!',
        description: `${sheetData.length} registros carregados com sucesso.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao carregar Movimentações',
        description: error.message || 'Verifique se a planilha está pública.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'Nenhum dado para exportar',
        description: 'Carregue os dados ou ajuste os filtros.',
        variant: 'destructive',
      });
      return;
    }

    try {
      exportToXLSX(filteredData, `movimentacoes-${new Date().toISOString().split('T')[0]}`);
      toast({
        title: 'Exportação concluída!',
        description: `${filteredData.length} registros exportados em XLSX.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo XLSX.',
        variant: 'destructive',
      });
    }
  };

  const toggleTipo = (tipo) => {
    setFilters((prev) => {
      const exists = prev.tipos.includes(tipo);
      if (exists) {
        return { ...prev, tipos: prev.tipos.filter(t => t !== tipo) };
      }
      return { ...prev, tipos: [...prev.tipos, tipo] };
    });
  };

  const getSituacaoColor = (situacao) => {
    const val = (situacao || '').toString().trim().toLowerCase();
    if (val === 'baixado' || val === 'baixada') return 'text-green-300';
    if (val === 'em aberto' || val === 'aberto') return 'text-red-300';
    return 'text-white';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg">
                <Filter className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Movimentação</h1>
                <p className="text-xs text-blue-200">Romaneios e consolidações</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 items-center justify-between"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleLoadGoogleSheets}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Carregar Google Sheets'}
            </Button>

            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar XLSX
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-white mb-2">Mês (coluna L)</p>
              <Input
                type="month"
                value={filters.mes}
                onChange={(e) => setFilters({ ...filters, mes: e.target.value })}
                className="bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
              />
            </div>
            <div>
              <p className="text-sm text-white mb-2">Base Origem (coluna F)</p>
              <Select
                value={filters.baseOrigem}
                onValueChange={(value) => setFilters({ ...filters, baseOrigem: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todas as bases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as bases</SelectItem>
                  {bases.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-white mb-2">Situação Baixa (coluna P)</p>
              <Select
                value={filters.situacao}
                onValueChange={(value) => setFilters({ ...filters, situacao: value })}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {situacoes.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-white mb-2">Tipo de Romaneio (coluna B)</p>
              <div className="bg-white/5 border border-white/10 rounded-lg max-h-40 overflow-auto p-2 space-y-2">
                {tipos.length === 0 && (
                  <p className="text-white/60 text-sm">Carregue os dados para listar tipos.</p>
                )}
                {tipos.map((tipo) => {
                  const checked = filters.tipos.includes(tipo);
                  return (
                    <label key={tipo} className="flex items-center gap-2 text-white text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTipo(tipo)}
                        className="accent-blue-500"
                      />
                      <span>{tipo}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 border-b border-white/20 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Lista de Movimentações</h2>
              <p className="text-sm text-blue-200 mt-1">
                Número do romaneio, tipo, motorista, origem, data, situação e Qtde.
              </p>
            </div>
            <div className="text-sm text-white/80">
              {filteredData.length} registros
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-white">
              <thead className="bg-white/5 text-xs uppercase bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3">Nro. Romaneio (A)</th>
                  <th className="px-4 py-3">Tipo (B)</th>
                  <th className="px-4 py-3">Motorista (D)</th>
                  <th className="px-4 py-3">Base Origem (F)</th>
                  <th className="px-4 py-3">Data Geração (L)</th>
                  <th className="px-4 py-3">Situação Baixa (P)</th>
                  <th className="px-4 py-3 text-right">Qtde Solic/Cons (Q)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-white/60">
                      Nenhum dado. Clique em "Carregar Google Sheets" e ajuste os filtros.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <motion.tr
                      key={`${item.numeroRomaneio}-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">{item.numeroRomaneio}</td>
                      <td className="px-4 py-3">{item.tipoRomaneio}</td>
                      <td className="px-4 py-3">{item.motorista}</td>
                      <td className="px-4 py-3">{item.unidadeOrigem}</td>
                      <td className="px-4 py-3">{item.dataGeracao}</td>
                      <td className={`px-4 py-3 font-semibold ${getSituacaoColor(item.situacaoBaixa)}`}>
                        {item.situacaoBaixa || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">{item.qtdeSolicitacoes}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Movimentacao;

