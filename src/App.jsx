import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import Movimentacao from './components/Movimentacao';
import { Toaster } from './components/ui/toaster';
import ChatPlanilha from "./ChatPlanilha";  // ← Chat importado
import { Button } from './components/ui/button';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('painel'); // painel | movimentacao

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email, password) => {
    if (email === 'matheus.transportesirmaos@gmail.com' && password === 'irmaos2024@') {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sistema de Controle de Performance - Transportes Irmãos</title>
        <meta name="description" content="Sistema de gerenciamento e controle de performance de entregas com análise de SLA e status preventivo" />
      </Helmet>

      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen flex bg-slate-900">
          <aside className="w-64 bg-slate-950/80 border-r border-white/10 text-white flex flex-col">
            <div className="p-6 border-b border-white/10">
              <p className="text-sm text-blue-200">Transportes Irmãos</p>
              <h2 className="text-xl font-bold">Módulos</h2>
            </div>

            <div className="flex-1 p-4 space-y-2">
              <Button
                variant={activeModule === 'painel' ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeModule === 'painel' ? 'bg-blue-600 hover:bg-blue-700' : 'text-white hover:bg-white/10'}`}
                onClick={() => setActiveModule('painel')}
              >
                Painel Geral
              </Button>
              <Button
                variant={activeModule === 'movimentacao' ? 'default' : 'ghost'}
                className={`w-full justify-start ${activeModule === 'movimentacao' ? 'bg-indigo-600 hover:bg-indigo-700' : 'text-white hover:bg-white/10'}`}
                onClick={() => setActiveModule('movimentacao')}
              >
                Movimentação
              </Button>
            </div>

            <div className="p-4 border-t border-white/10">
              <Button
                variant="outline"
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          </aside>

          <main className="flex-1">
            {activeModule === 'painel' ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Movimentacao />
            )}
          </main>
        </div>
      )}

      <Toaster />

      {/* Chat aparece apenas quando o usuário estiver logado */}
      {isAuthenticated && <ChatPlanilha />}
    </>
  );
}

export default App;
