import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileSpreadsheet, Filter, LogOut, TrendingUp, Trash2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import FilterPanel from './FilterPanel';
import StatusCards from './StatusCards';
import PerformanceWidget from './PerfomanceWidget';
import DataTable from './DataTable';
import PerformanceMatrix from './PerfomanceMatrix';
import { parseXLSX, calculatePerformance, filterData, generateTemplateXLSX, mergeData, exportToXLSX } from '../lib/dataUtils';
import { fetchGoogleSheetData } from '../lib/googleSheetsUtils';

function Dashboard({ onLogout }) {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [targetPerformance, setTargetPerformance] = useState(98);
  const [filters, setFilters] = useState({
    unidadeAtual: '',
    unidadeDestino: '',
    statusPreventivo: '',
    dataVencimento: '',
    mesVencimento: ''
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('deliveryData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setData(parsedData);
      setFilteredData(parsedData);
    }

    const savedTarget = localStorage.getItem('targetPerformance');
    if (savedTarget) {
      setTargetPerformance(parseFloat(savedTarget));
    }
  }, []);

  useEffect(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  const handleLoadGoogleSheets = async () => {
    setIsLoading(true);
    try {
      const sheetData = await fetchGoogleSheetData();
      setData(sheetData);
      localStorage.setItem('deliveryData', JSON.stringify(sheetData));
      
      toast({
        title: "Google Sheets carregado!",
        description: `${sheetData.length} registros carregados com sucesso.`
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao carregar Google Sheets",
        description: error.message || "Verifique se a planilha está compartilhada publicamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      toast({
        title: "Erro ao importar",
        description: "Por favor, selecione um arquivo .xlsx válido",
        variant: "destructive"
      });
      return;
    }

    parseXLSX(file)
      .then((parsedData) => {
        // Merge with existing data
        const merged = mergeData(data, parsedData);
        
        setData(merged);
        localStorage.setItem('deliveryData', JSON.stringify(merged));
        
        toast({
          title: "Importação concluída!",
          description: `${parsedData.length} registros processados. Dados atualizados.`
        });
      })
      .catch((error) => {
        console.error(error);
        toast({
          title: "Erro ao importar",
          description: error.message || "Verifique o formato do arquivo.",
          variant: "destructive"
        });
      });

    e.target.value = '';
  };

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Importe dados primeiro ou ajuste os filtros.",
        variant: "destructive"
      });
      return;
    }

    try {
      exportToXLSX(filteredData, `dados-performance-${new Date().toISOString().split('T')[0]}`);
      toast({
        title: "Exportação concluída!",
        description: `${filteredData.length} registros exportados para Excel.`
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo XLSX.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadTemplate = () => {
    try {
      const blob = generateTemplateXLSX();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'modelo-importacao-completo.xlsx';
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Template baixado!",
        description: "Modelo completo XLSX gerado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar template",
        description: "Não foi possível gerar o arquivo modelo.",
        variant: "destructive"
      });
    }
  };

  const handleClearAll = () => {
    setData([]);
    localStorage.removeItem('deliveryData');
    toast({
      title: "Dados apagados",
      description: "Todos os registros foram removidos com sucesso."
    });
  };

  const handleTargetChange = (newTarget) => {
    setTargetPerformance(newTarget);
    localStorage.setItem('targetPerformance', newTarget.toString());
  };

  const performance = calculatePerformance(filteredData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Controle de Performance</h1>
                <p className="text-xs text-blue-200">Transportes Irmãos</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-3 mb-6 items-center justify-between"
        >
          <div className="flex flex-wrap gap-3">
            <label>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleImport}
                className="hidden"
              />
              <Button className="bg-green-600 hover:bg-green-700 cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar XLSX
                </span>
              </Button>
            </label>

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
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Exportar XLSX
            </Button>

            <Button
              onClick={handleDownloadTemplate}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo XLSX
            </Button>

            <Button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Tudo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border border-white/20 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-300">
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os dados importados do seu armazenamento local.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/10">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700 text-white border-0">Continuar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>

        <PerformanceWidget 
          performance={performance} 
          totalRecords={filteredData.length} 
          target={targetPerformance}
          onTargetChange={handleTargetChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {showFilterPanel && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                data={data}
              />
            </motion.div>
          )}

          <div className={showFilterPanel ? "lg:col-span-3" : "lg:col-span-4"}>
            <StatusCards data={filteredData} />
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <PerformanceMatrix data={filteredData} />
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;