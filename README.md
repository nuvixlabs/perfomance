# Sistema de Controle de Performance - Transportes Irmãos

Aplicação web para gerenciamento e análise de performance de entregas com integração com Google Sheets.

## 🚀 Funcionalidades

- 📊 Dashboard de performance com análise diária
- 📤 Importação de arquivos XLSX
- 📥 Exportação de dados filtrados
- 🔄 Carregamento automático de dados do Google Sheets
- 🔍 Filtros avançados (mês, data específica, unidade, status)
- 📱 Interface responsiva e moderna
- 🎨 Modo escuro com glassmorphism

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **UI Components:** Radix UI
- **Data:** Google Sheets + localStorage
- **Icons:** Lucide React

## 📋 Pré-requisitos

- Node.js (v18+)
- npm ou yarn
- Conta Google (para Google Sheets)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <seu-repo-url>
cd perfomance
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env.local` (copie do `.env.example`):
```bash
cp .env.example .env.local
```

4. Configure a planilha Google Sheets:
   - Acesse https://sheets.google.com
   - Crie/abra sua planilha
   - **Importe o ID da planilha** na variável `VITE_SHEET_ID` do `.env.local`
   - **Certifique-se que a planilha é "Compartilhada publicamente"** (para leitura)

## 🎯 Como usar

### Modo Desenvolvimento
```bash
npm run dev
```
Acesse `http://localhost:3000`

**Credenciais de teste:**
- Email: `matheus.transportesirmaos@gmail.com`
- Senha: `irmaos2024@`

### Build para Produção
```bash
npm run build
```

### Preview do Build
```bash
npm run preview
```

## 📊 Integração com Google Sheets

### Carregamento de dados:
1. Clique em **"Carregar Google Sheets"** no dashboard
2. Os dados serão sincronizados automaticamente
3. Atualize a planilha no Google Sheets a cada 3 horas
4. Clique novamente para recarregar os dados

### Estrutura esperada da planilha:
Suas colunas devem incluir:
- `Nro. Entrega`
- `Status`
- `Dt. Prazo Atual` (formato: M/D/YY, DD/MM/YYYY ou YYYY-MM-DD)
- `Sigla Unidade Atual`
- `Sigla Unidade Destino`
- `PREVENTIVO`
- `SLA`
- `SLA2`

## 🚀 Deploy no Vercel

1. **Faça push para GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <seu-repo-url>
git push -u origin main
```

2. **No Vercel:**
   - Vá para https://vercel.com
   - Clique em **"New Project"**
   - Selecione seu repositório GitHub
   - Configure as variáveis de ambiente:
     - `VITE_SHEET_ID` = seu ID da planilha
   - Clique em **"Deploy"**

3. **Compartilhe o Google Sheets:**
   - Abra a planilha no Google Sheets
   - Clique em **"Compartilhar"**
   - Defina como **"Acesso público"** ou **"Qualquer um com o link pode visualizar"**

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── Dashboard.jsx           # Dashboard principal
│   ├── FilterPanel.jsx         # Painel de filtros
│   ├── LoginPage.jsx           # Página de login
│   ├── DataTable.jsx           # Tabela de dados
│   ├── PerfomanceMatrix.jsx    # Análise diária
│   ├── PerfomanceWidget.jsx    # Widget de performance
│   ├── StatusCards.jsx         # Cards de status
│   └── ui/                     # Componentes reutilizáveis
├── lib/
│   ├── dataUtils.js            # Utilidades de dados XLSX
│   ├── googleSheetsUtils.js    # Utilidades Google Sheets
│   └── utils.js                # Utilidades gerais
├── App.jsx                     # Componente raiz
└── main.jsx                    # Entrada da aplicação
```

## 🔐 Segurança

- As credenciais são armazenadas no localStorage (não compartilhadas)
- O Google Sheets é lido publicamente (apenas leitura)
- Senhas não são criptografadas (projeto demo)

## 🐛 Troubleshooting

### "Erro ao carregar Google Sheets"
- Verifique se a planilha está compartilhada publicamente
- Verifique o ID da planilha em `.env.local`
- Confirme que as colunas da planilha existem

### Datas não filtram corretamente
- Assegure-se que as datas estão no formato: M/D/YY, DD/MM/YYYY ou YYYY-MM-DD
- Tente atualizar os dados clicando em "Carregar Google Sheets"

## 📞 Suporte

Para problemas ou sugestões, abra uma issue no repositório.

## 📄 Licença

Privado - Transportes Irmãos

---

**Desenvolvido com ❤️ para Transportes Irmãos**
