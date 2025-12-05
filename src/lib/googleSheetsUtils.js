// Google Sheets API Configuration
const SHEET_ID = '1_4qxu-eZvlbSB36ohIecGUZPGQiLTy8-eDVhsGLaPI4';
const API_KEY = 'AIzaSyDummyKeyForNow'; // Will be set from env

// Get data from Google Sheets
export const fetchGoogleSheetData = async () => {
  try {
    // Using public CSV export URL (no API key needed for public sheets)
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    
    const response = await fetch(sheetURL);
    if (!response.ok) {
      throw new Error('Erro ao acessar Google Sheets');
    }

    const csvText = await response.text();
    const rows = csvText.split('\n').map(row => 
      row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );

    if (rows.length < 2) {
      throw new Error('Planilha vazia ou sem dados');
    }

    const headers = rows[0];
    const data = rows.slice(1).filter(row => row.some(cell => cell)); // Filter empty rows

    // Map CSV to same format as Excel import
    const mappedData = data.map(row => {
      const getVal = (colName) => {
        const index = headers.findIndex(h => h.toLowerCase() === colName.toLowerCase());
        return index !== -1 ? row[index] : '';
      };

      return {
        nroEntrega: getVal('Nro. Entrega'),
        status: getVal('Status'),
        dtPrazo: getVal('Dt. Prazo Atual'),
        unidadeAtual: getVal('Sigla Unidade Atual'),
        unidadeDestino: getVal('Sigla Unidade Destino'),
        preventivo: getVal('PREVENTIVO'),
        sla: getVal('SLA'),
        sla2: getVal('SLA2'),
        _raw: Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      };
    });

    return mappedData;
  } catch (error) {
    console.error('Erro ao fetch Google Sheets:', error);
    throw new Error(`Erro ao carregar dados: ${error.message}`);
  }
};

// Alternative: Using Sheets API v4 (if you want real-time with API key)
export const fetchGoogleSheetDataAPI = async (apiKey) => {
  try {
    const range = 'Sheet1'; // Adjust if your sheet has different name
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erro ao acessar Google Sheets API');
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      throw new Error('Planilha vazia ou sem dados');
    }

    const headers = rows[0];
    const mappedData = rows.slice(1).filter(row => row.some(cell => cell)).map(row => {
      const getVal = (colName) => {
        const index = headers.findIndex(h => h.toLowerCase() === colName.toLowerCase());
        return index !== -1 ? row[index] : '';
      };

      return {
        nroEntrega: getVal('Nro. Entrega'),
        status: getVal('Status'),
        dtPrazo: getVal('Dt. Prazo Atual'),
        unidadeAtual: getVal('Sigla Unidade Atual'),
        unidadeDestino: getVal('Sigla Unidade Destino'),
        preventivo: getVal('PREVENTIVO'),
        sla: getVal('SLA'),
        sla2: getVal('SLA2'),
        _raw: Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      };
    });

    return mappedData;
  } catch (error) {
    console.error('Erro ao fetch Google Sheets API:', error);
    throw new Error(`Erro ao carregar dados: ${error.message}`);
  }
};
