// Google Sheets API Configuration
const SHEET_ID = '1_4qxu-eZvlbSB36ohIecGUZPGQiLTy8-eDVhsGLaPI4';
const API_KEY = 'AIzaSyDummyKeyForNow'; // Will be set from env

// Get data from Google Sheets
// This implementation uses a safe CSV parser (handles quoted commas/newlines)
// and a tolerant header matcher (normalizes and accepts aliases/partial matches).
const normalize = (s) => String(s || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');

function parseCSV(text) {
  const rows = [];
  let cur = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"'; // escaped quote
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      row.push(cur);
      cur = '';
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // handle CRLF
      if (ch === '\r' && text[i + 1] === '\n') {
        i++;
      }
      row.push(cur);
      rows.push(row);
      row = [];
      cur = '';
      continue;
    }
    cur += ch;
  }
  // push last
  if (cur !== '' || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  // trim quotes and spaces
  return rows.map(r => r.map(c => (c || '').trim().replace(/^"|"$/g, '')));
}

function findHeaderIndex(headers, targetNames) {
  const normalized = headers.map(h => normalize(h || ''));
  for (const t of targetNames) {
    const tNorm = normalize(t);
    // exact
    let idx = normalized.findIndex(h => h === tNorm);
    if (idx !== -1) return idx;
    // partial contains
    idx = normalized.findIndex(h => h.includes(tNorm) || tNorm.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

function detectColumnBySample(headers, rows, predicate, sampleSize = 10) {
  const cols = headers.length;
  const scores = new Array(cols).fill(0);
  const total = Math.min(sampleSize, rows.length);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < total; r++) {
      const val = (rows[r][c] || '').toString().trim();
      if (predicate(val)) scores[c]++;
    }
  }
  // return index with highest score if it passes threshold
  let bestIdx = -1;
  let bestScore = 0;
  for (let i = 0; i < cols; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestIdx = i;
    }
  }
  if (bestScore >= Math.ceil(total / 2)) return bestIdx;
  return -1;
}

export const fetchGoogleSheetData = async () => {
  try {
    const sheetURL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error('Erro ao acessar Google Sheets');

    const csvText = await response.text();
    const rows = parseCSV(csvText).filter(r => r && r.length > 0);

    if (rows.length < 2) throw new Error('Planilha vazia ou sem dados');

    const headers = rows[0];
    const dataRows = rows.slice(1).filter(row => row.some(cell => String(cell).trim() !== ''));

    // Helper to get index by aliases, then fallback to sample-detection heuristics
    const getIndex = (aliases, samplePredicate) => {
      const idx = findHeaderIndex(headers, Array.isArray(aliases) ? aliases : [aliases]);
      if (idx !== -1) return idx;
      if (typeof samplePredicate === 'function') {
        const detected = detectColumnBySample(headers, dataRows, samplePredicate);
        if (detected !== -1) return detected;
      }
      return -1;
    };

    const mappedData = dataRows.map(row => {
      const getValBy = (aliases, samplePredicate) => {
        const idx = getIndex(aliases, samplePredicate);
        return idx !== -1 ? (row[idx] ?? '') : '';
      };

      return {
        nroEntrega: getValBy(
          ['Nro. Entrega', 'Nro Entrega', 'numero entrega', 'nro entrega', 'nroentrega', 'nro. entrega'],
          // detect numeric-ish columns (delivery number)
          (v) => /^\d+$/.test(v.replace(/[^0-9]/g, '')) || /^\d{3,}$/.test(v)
        ),

        status: getValBy(
          ['Status', 'status', 'situacao', 'situação', 'ocorrencia'],
          // detect status-like values (textual statuses)
          (v) => /entreg|atras|aguard|ocorr|penden|cancel/i.test(v)
        ),

        dtPrazo: getValBy(
          ['Dt. Prazo Atual', 'Dt Prazo Atual', 'Dt. Prazo', 'Dt. Prazo Embarcador', 'Dt. Primeiro Prazo', 'dtprazo', 'dt. prazo'],
          // detect date-like values
          (v) => /^\d{4}-\d{2}-\d{2}/.test(v) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(v) || /^\d{1,2}-\d{1,2}-\d{2,4}/.test(v)
        ),

        unidadeAtual: getValBy(
          ['Sigla Unidade Atual', 'Sigla Unidade Coleta de Carga', 'Sigla Unidade', 'unidade atual', 'unidadecoleta', 'sigla unidade atual'],
          // detect small uppercase sigla-like values
          (v) => /^[A-Z0-9]{1,6}$/.test(v) || /^[A-Z]{2,4}$/.test(v)
        ),

        unidadeDestino: getValBy(
          ['Sigla Unidade Destino', 'Sigla Unidade Entrega', 'Unidade Destino', 'unidade destino', 'sigla unidade destino'],
          (v) => /^[A-Z0-9]{1,6}$/.test(v) || /^[A-Z]{2,4}$/.test(v)
        ),

        preventivo: getValBy(
          ['PREVENTIVO', 'Preventivo', 'preventivo', 'tipo'],
          (v) => /prevent|sim|nao|não|programado/i.test(v)
        ),

        sla: getValBy(['SLA', 'sla', 'SLA '], (v) => /\d+/.test(v)),
        sla2: getValBy(['SLA2', 'SLA 2', 'sla2'], (v) => /\d+|entreg|dentro/i.test(v)),

        _raw: Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      };
    });

    return mappedData;
  } catch (error) {
    console.error('Erro ao fetch Google Sheets:', error);
    throw new Error(`Erro ao carregar dados: ${error.message}`);
  }
};

// Movimentação sheet (separate ID)
const MOVIMENTACAO_SHEET_ID = '1WQsXsByhjnUxNz_mbMnjTLy4j-jXU1qdIKzJWbmMY54';

export const fetchMovimentacaoSheetData = async () => {
  try {
    const sheetURL = `https://docs.google.com/spreadsheets/d/${MOVIMENTACAO_SHEET_ID}/export?format=csv`;
    const response = await fetch(sheetURL);
    if (!response.ok) throw new Error('Erro ao acessar Google Sheets (Movimentação)');

    const csvText = await response.text();
    const rows = parseCSV(csvText).filter(r => r && r.length > 0);
    if (rows.length < 2) throw new Error('Planilha de movimentação vazia ou sem dados');

    const headers = rows[0];
    const dataRows = rows.slice(1).filter(row => row.some(cell => String(cell).trim() !== ''));

    const getIndex = (aliases, fallbackIndex = -1) => {
      const idx = findHeaderIndex(headers, Array.isArray(aliases) ? aliases : [aliases]);
      if (idx !== -1) return idx;
      return fallbackIndex;
    };

    const mappedData = dataRows.map(row => {
      const getValBy = (aliases, fallbackIndex) => {
        const idx = getIndex(aliases, fallbackIndex);
        return idx !== -1 ? (row[idx] ?? '') : '';
      };

      return {
        numeroRomaneio: getValBy(['Numero do romaneio', 'Numero romaneio', 'Romaneio', 'Nro Romaneio', 'Número do romaneio'], 0), // Coluna A
        tipoRomaneio: getValBy(['Tipo de Romaneio', 'Tipo romaneio', 'Tipo'], 1), // Coluna B
        motorista: getValBy(['Motorista', 'Nome do Motorista'], 3), // Coluna D
        unidadeOrigem: getValBy(['Unidade Origem', 'Base Origem', 'Filial Origem'], 5), // Coluna F
        // Coluna L - Dt. Operação (usada no filtro por mês)
        dataGeracao: getValBy(
          ['Dt. Operação', 'Dt Operação', 'Dt. Operacao', 'Dt Operacao', 'Data de geração', 'Data geração', 'Dt Geração', 'Data'],
          11
        ),
        // Coluna P - Situação Baixa
        situacaoBaixa: getValBy(
          ['Situação Baixa', 'Situação da Baixa', 'Situacao da Baixa', 'Status Baixa', 'Situação', 'Situacao'],
          15
        ),
        qtdeSolicitacoes: getValBy(['Qtde. Solicitações/Consolidações', 'Qtde Solicitações', 'Quantidade Solicitações'], 16), // Coluna Q
        _raw: Object.fromEntries(headers.map((h, i) => [h, row[i]]))
      };
    });

    return mappedData;
  } catch (error) {
    console.error('Erro ao fetch Movimentação Sheets:', error);
    throw new Error(`Erro ao carregar movimentações: ${error.message}`);
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
