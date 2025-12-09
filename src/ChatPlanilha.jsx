import { useState } from "react";

export default function ChatPlanilha() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "📄 Planilha carregada! Digite 'status', 'situacao' ou 'base'." }
  ]);
  const [input, setInput] = useState("");
  const [aberto, setAberto] = useState(false);

  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1_4qxu-eZvlbSB36ohIecGUZPGQiLTy8-eDVhsGLaPI4/export?format=csv";

  async function buscarDadosPlanilha() {
    const res = await fetch(SHEET_URL);
    const texto = await res.text();
    const linhas = texto.split("\n").map(l => l.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/));
    return linhas;
  }

  function contarValores(colIndex, data) {
    const contagem = {};
    data.slice(1).forEach(row => {
      const valor = row[colIndex]?.trim();
      if (!valor) return;
      contagem[valor] = (contagem[valor] || 0) + 1;
    });
    return contagem;
  }

  function formatarLista(obj) {
    return Object.entries(obj)
      .sort((a,b)=>b[1]-a[1])
      .map(([k,v])=>`• ${k}: ${v}`)
      .join("\n");
  }

  async function responder(msg) {
    const data = await buscarDadosPlanilha();
    const cabecalho = data[0];

    const colunaAZ = cabecalho.findIndex(c => c.toLowerCase().includes("status"));
    const colunaCC = cabecalho.findIndex(c => c.toLowerCase().includes("sla") || c.toLowerCase().includes("cc"));
    const colUnidade = cabecalho.findIndex(c => c.toLowerCase().includes("sigla") && c.toLowerCase().includes("entrega"));

    if (msg.toLowerCase() === "status" || msg.toLowerCase() === "az")
      return `📊 STATUS (AZ)\n${formatarLista(contarValores(colunaAZ,data))}`;

    if (msg.toLowerCase() === "situacao" || msg.toLowerCase() === "cc")
      return `📦 SITUAÇÃO (CC)\n${formatarLista(contarValores(colunaCC,data))}`;

    if (msg.toLowerCase() === "base") {
      const unidades = [...new Set(data.slice(1).map(r => r[colUnidade]?.trim()).filter(Boolean))];
      return "🏢 Bases encontradas:\n\n" +
      unidades.map((u,i)=>`${i+1} - ${u}`).join("\n") +
      "\n\nDigite o número da base.";
    }

    if (!isNaN(msg)) {
      const unidades = [...new Set(data.slice(1).map(r => r[colUnidade]?.trim()).filter(Boolean))];
      const base = unidades[Number(msg)-1];
      const filtro = data.filter(r => r[colUnidade]?.trim() === base);
      return `📍 BASE: ${base}\n\n📊 STATUS\n${formatarLista(contarValores(colunaAZ,filtro))}\n\n📦 SITUAÇÃO\n${formatarLista(contarValores(colunaCC,filtro))}`;
    }

    return "Comandos:\n• status\n• situacao\n• base";
  }

  async function enviar(){
    if(!input.trim()) return;
    setMessages(m=>[...m,{sender:"user",text:input}]);
    const r = await responder(input);
    setMessages(m=>[...m,{sender:"bot",text:r}]);
    setInput("");
  }

  return (
    <div>
      <button onClick={()=>setAberto(!aberto)} style={estilo.botaoAbrir}>
        {aberto?"✕":"💬"}
      </button>

      {aberto && (
        <div style={estilo.janela}>
          <div style={estilo.chat}>
            {messages.map((m,i)=>(
              <div key={i} style={{
                ...estilo.msg,
                alignSelf:m.sender==="user"?"flex-end":"flex-start",
                background:m.sender==="user"?"#b48aff":"#e7d4ff",
                color:"black"
              }}>{m.text}</div>
            ))}
          </div>

          <div style={estilo.rodape}>
            <input
              style={estilo.input}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&enviar()}
              placeholder="Digite status / situacao / base..."
            />
            <button style={estilo.btn} onClick={enviar}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

const estilo={
  botaoAbrir:{
    position:"fixed",right:"20px",bottom:"20px",
    background:"#6a0dad",color:"#fff",
    padding:"12px 15px",borderRadius:"50%",border:"none",
    fontSize:"18px",cursor:"pointer",fontWeight:"bold",zIndex:99999
  },
  janela:{
    position:"fixed",right:"20px",bottom:"75px",
    width:"350px",height:"450px",
    background:"#6a0dad", // roxo
    color:"black",
    borderRadius:"12px",display:"flex",
    flexDirection:"column",boxShadow:"0 0 12px rgba(0,0,0,.3)",
    zIndex:99999
  },
  chat:{
    flex:1,overflowY:"auto",padding:"12px",
    display:"flex",flexDirection:"column",gap:"10px",
    background:"#b48aff"
  },
  msg:{
    padding:"10px 14px",borderRadius:"10px",fontSize:"14px",
    maxWidth:"80%",whiteSpace:"pre-line",color:"black"
  },
  rodape:{
    padding:"10px",display:"flex",gap:"6px",
    background:"#8a5cff",borderRadius:"0 0 12px 12px"
  },
  input:{
    flex:1,padding:"10px",fontSize:"14px",borderRadius:"8px",
    border:"none",outline:"none",color:"black"
  },
  btn:{
    padding:"10px 14px",borderRadius:"8px",
    background:"#5c3bff",color:"#fff",border:"none",
    cursor:"pointer",fontWeight:"bold"
  }
};
