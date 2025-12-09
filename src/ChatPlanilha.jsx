import { useState } from "react";

export default function ChatPlanilha() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "📄 Planilha carregada! Digite 'status' ou 'situacao' para ver os agrupamentos." }
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
      let valor = row[colIndex]?.trim();
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

    if (colunaAZ === -1) return "❌ Coluna AZ (Status) não encontrada.";
    if (colunaCC === -1) return "❌ Coluna CC (Situação) não encontrada.";

    if (msg.toLowerCase() === "status" || msg.toLowerCase() === "az") {
      const grupos = contarValores(colunaAZ, data);
      return `📊 STATUS (AZ)\n${formatarLista(grupos)}`;
    }

    if (msg.toLowerCase() === "situacao" || msg.toLowerCase() === "cc") {
      const grupos = contarValores(colunaCC, data);
      return `📦 SITUAÇÃO (CC)\n${formatarLista(grupos)}`;
    }

    return "Digite:\n\n🟣 'status' para agrupar coluna AZ\n🟣 'situacao' para agrupar coluna CC";
  }

  async function enviar() {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: "user", text: input }]);
    const resposta = await responder(input);
    setMessages(prev => [...prev, { sender: "bot", text: resposta }]);
    setInput("");
  }

  return (
    <div>
      {/* Botão flutuante sempre visível */}
      <button
        onClick={() => setAberto(!aberto)}
        style={{
          position: "fixed",
          right: "20px",
          bottom: aberto ? "480px" : "20px", // se chat aberto, empurra pra cima
          zIndex: 10000, // sempre acima do chat
          padding: "12px 16px",
          borderRadius: "50px",
          border: "none",
          background: "#5c3bff",
          color: "#fff",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          transition: "bottom 0.3s"
        }}
      >
        {aberto ? "✕ Minimizar" : "💬 Chat"}
      </button>

      {aberto && (
        <div style={estilo.janela}>
          <div style={estilo.chat}>
            {messages.map((m,i)=>(
              <div key={i} style={{
                ...estilo.msg,
                alignSelf: m.sender==="user"?"flex-end":"flex-start",
                background: m.sender==="user"?"#c7b5ff":"#e5d8ff",
                color:"black"
              }}>{m.text}</div>
            ))}
          </div>

          <div style={estilo.rodape}>
            <input style={estilo.input}
              placeholder="Digite status ou situacao..."
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter" && enviar()}
            />
            <button style={estilo.btn} onClick={enviar}>➤</button>
          </div>
        </div>
      )}
    </div>
  );
}

const estilo = {
  janela:{
    position:"fixed",
    right:"20px",
    bottom:"20px",
    width:"350px",
    height:"450px",
    background:"#9b6ff",
    borderRadius:"12px",
    display:"flex",
    flexDirection:"column",
    boxShadow:"0 4px 12px rgba(0,0,0,.25)",
    zIndex:9999,
    color:"black"
  },
  chat:{
    flex:1,
    overflowY:"auto",
    padding:"12px",
    display:"flex",
    flexDirection:"column",
    gap:"8px",
    background:"#c7b5ff",
    borderRadius:"10px"
  },
  msg:{
    padding:"10px 14px",
    borderRadius:"10px",
    maxWidth:"75%",
    whiteSpace:"pre-line",
    fontSize:"15px"
  },
  rodape:{
    display:"flex",
    padding:"10px",
    gap:"6px",
    background:"#8a5cff",
    borderBottomLeftRadius:"12px",
    borderBottomRightRadius:"12px"
  },
  input:{
    flex:1,
    padding:"10px",
    borderRadius:"8px",
    border:"none",
    outline:"none",
    fontSize:"14px"
  },
  btn:{
    padding:"10px 14px",
    borderRadius:"8px",
    background:"#5c3bff",
    color:"#fff",
    border:"none",
    cursor:"pointer",
    fontWeight:"bold"
  }
};
