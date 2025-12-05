import { read, utils, write } from 'xlsx';

export const ALL_COLUMNS = [
  "Nro. Entrega", "Nro. Arquivo", "Serviço", "Serviço Parceiro", "Nota Fiscal", 
  "Chave NFe", "N° Pedido", "Nro. Carga", "Nro. Entrega2", "Cliente", 
  "CNPJ Cliente", "Filial", "CNPJ Filial", "Sigla Unidade Coleta de Carga", 
  "Sigla Unidade Atual", "Sigla Unidade Destino", "Sigla Unidade Entrega", 
  "Sigla Unidade Devolução", "Cidade Unidade Atual", "Cidade Unidade Entrega", 
  "Cidade Unidade Devolução", "Rota", "Nome Pessoa Visita", "RG Pessoa Visita", 
  "Documento Pessoa Visita", "CEP Pessoa Visita", "Logradouro Pessoa Visita", 
  "Numero Pessoa Visita", "Complemento Pessoa Visita", "Bairro Pessoa Visita", 
  "Cidade Pessoa Visita", "UF Pessoa Visita", "Ponto de Referencia Pessoa Visita", 
  "Região Tarifária", "Nome Recebedor", "Documento Recebedor", "Observação Recebedor", 
  "Peso Informado", "Peso Medido", "Cubagem Informada", "Cubagem Medida", 
  "Peso Taxado", "Peso NotaFiscal", "Qtde Volumes", "Qtde. Itens", 
  "Valor Mercadoria", "Valor Pendente Compra", "Nro. CTE", "Nro. Série CTe", 
  "Dt. Entrega", "Dt. Devolução", "Status", "Dt. Prazo Embarcador", 
  "Dt. Primeiro Prazo", "Dt. Prazo Atual", "Dt. Agendamento", "Dt. Cadastro", 
  "Dt. Recebimento Unidade Entrega", "Qtde. Atendimentos Realizados", 
  "Qtde. Pendências", "Pendências", "Últ. Pendência", "Obs. Ult. Pendência", 
  "Dt. Ult. Pendência", "Últ. Ocorrência", "Obs. Ult. Ocorrência", 
  "Dt. Ult. Ocorrência", "Id Ult. Ocorrência", "Ult. Romaneio", "Ult. Motorista", 
  "Código Remetente", "Nro. Transporte", "Motivo Atraso", "PREVENTIVO", "SLA", "SLA2"
];

export const parseXLSX = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header support
        const jsonData = utils.sheet_to_json(worksheet, { 
          raw: false, 
          dateNF: 'yyyy-mm-dd' 
        });

        if (jsonData.length === 0) {
          reject(new Error('Nenhum dado encontrado no arquivo'));
          return;
        }

        const mappedData = jsonData.map(row => {
          const getVal = (key) => {
            const exact = row[key];
            if (exact !== undefined) return exact;
            const foundKey = Object.keys(row).find(k => k.trim().toLowerCase() === key.toLowerCase());
            return foundKey ? row[foundKey] : '';
          };

          return {
            nroEntrega: getVal("Nro. Entrega"),
            status: getVal("Status"),
            dtPrazo: getVal("Dt. Prazo Atual"),
            unidadeAtual: getVal("Sigla Unidade Atual"),
            unidadeDestino: getVal("Sigla Unidade Destino"),
            preventivo: getVal("PREVENTIVO"),
            sla: getVal("SLA"),
            sla2: getVal("SLA2"),
            _raw: row
          };
        });

        resolve(mappedData);
      } catch (error) {
        reject(new Error('Erro ao processar o arquivo XLSX: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const generateTemplateXLSX = () => {
  const wb = utils.book_new();
  const headerRow = {};
  ALL_COLUMNS.forEach(col => {
    headerRow[col] = ""; 
  });

  const ws = utils.json_to_sheet([], { header: ALL_COLUMNS });
  utils.book_append_sheet(wb, ws, "Modelo Importação");
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportToXLSX = (data, fileName) => {
  // We want to export the FULL raw data (from _raw property if available, or reconstruct)
  // Since the mapped data only has specific fields + _raw, we prefer _raw for full export
  const exportData = data.map(item => item._raw || item);
  
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(exportData);
  utils.book_append_sheet(wb, ws, "Dados Exportados");
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
  
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

export const calculatePerformance = (data) => {
  if (data.length === 0) return 0;
  
  // Performance based on SLA2 positive statuses
  const positiveStatuses = ['ENTREGUE NO PRAZO', 'DENTRO DO PRAZO'];
  
  const dentroPrazo = data.filter(item => 
    item.sla2 && positiveStatuses.includes(item.sla2.toString().trim().toUpperCase())
  ).length;
  
  return (dentroPrazo / data.length) * 100;
};

export const filterData = (data, filters) => {
  return data.filter(item => {
    if (filters.unidadeAtual && filters.unidadeAtual !== 'all') {
      if (item.unidadeAtual !== filters.unidadeAtual) return false;
    }

    if (filters.unidadeDestino && filters.unidadeDestino !== 'all') {
      if (item.unidadeDestino !== filters.unidadeDestino) return false;
    }

    if (filters.statusPreventivo && filters.statusPreventivo !== 'all') {
      if (item.preventivo !== filters.statusPreventivo) return false;
    }

    if (filters.dataVencimento) {
      // Convert selected date (YYYY-MM-DD) to comparable format
      if (!item.dtPrazo) return false;
      
      const dt = String(item.dtPrazo).trim();
      let itemDateFormatted = '';

      // Handle YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
      if (/^\d{4}-\d{2}-\d{2}/.test(dt)) {
        itemDateFormatted = dt.substring(0, 10);
      } 
      // Handle DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
      else if (/^\d{2}\/\d{2}\/\d{4}/.test(dt)) {
        const parts = dt.split('/');
        itemDateFormatted = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      // Handle M/D/YY or MM/DD/YY format (Excel default)
      else if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dt)) {
        const parts = dt.split('/');
        const month = String(parts[0]).padStart(2, '0');
        const day = String(parts[1]).padStart(2, '0');
        const year = parts[2];
        const fullYear = year.length === 2 ? '20' + year : year;
        itemDateFormatted = `${fullYear}-${month}-${day}`;
      }
      // Handle DD/MM/YY or MM/DD/YY format
      else if (/^\d{1,2}\/\d{1,2}\/\d{2}/.test(dt)) {
        const parts = dt.split('/');
        const day = String(parts[0]).padStart(2, '0');
        const month = String(parts[1]).padStart(2, '0');
        const year = parts[2];
        const fullYear = year.length === 2 ? '20' + year : year;
        itemDateFormatted = `${fullYear}-${month}-${day}`;
      }

      if (itemDateFormatted !== filters.dataVencimento) return false;
    }

    if (filters.mesVencimento && filters.mesVencimento !== '') {
      if (!item.dtPrazo) return false;
      
      const dt = String(item.dtPrazo).trim();
      let itemYear = '';
      let itemMonth = '';

      // Handle YYYY-MM-DD or YYYY-MM-DD HH:MM:SS
      if (/^\d{4}-\d{2}-\d{2}/.test(dt)) {
        itemYear = dt.substring(0, 4);
        itemMonth = dt.substring(5, 7);
      } 
      // Handle DD/MM/YYYY or DD/MM/YYYY HH:MM:SS
      else if (/^\d{2}\/\d{2}\/\d{4}/.test(dt)) {
        const parts = dt.split('/'); // [DD, MM, YYYY...]
        itemYear = parts[2];
        itemMonth = String(parts[1]).padStart(2, '0');
      }
      // Handle M/D/YY or MM/DD/YY format (Excel default for US)
      else if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dt)) {
        const parts = dt.split('/');
        // Determine if first is month or day - typically M/D/YY in US format
        const month = String(parts[0]).padStart(2, '0');
        const year = parts[2];
        // Convert 2-digit year to 4-digit year (assume 20xx for 00-99)
        const fullYear = year.length === 2 ? '20' + year : year;
        itemYear = fullYear;
        itemMonth = month;
      }
      // Handle DD/MM/YY or MM/DD/YY format
      else if (/^\d{1,2}\/\d{1,2}\/\d{2}/.test(dt)) {
        const parts = dt.split('/');
        // In Brazilian format, it's DD/MM/YY
        const day = String(parts[0]).padStart(2, '0');
        const month = String(parts[1]).padStart(2, '0');
        const year = parts[2];
        const fullYear = year.length === 2 ? '20' + year : year;
        itemYear = fullYear;
        itemMonth = month;
      }

      if (itemYear === '' || itemMonth === '') return false;
      const itemYearMonth = `${itemYear}-${itemMonth}`;
      
      if (itemYearMonth !== filters.mesVencimento) return false;
    }

    return true;
  });
};

export const mergeData = (currentData, newData) => {
  const dataMap = new Map();

  // Populate map with current data
  currentData.forEach(item => {
    if (item.nroEntrega) {
      dataMap.set(item.nroEntrega, item);
    }
  });

  // Merge new data (overwriting existing keys)
  newData.forEach(item => {
    if (item.nroEntrega) {
      dataMap.set(item.nroEntrega, item);
    }
  });

  return Array.from(dataMap.values());
};