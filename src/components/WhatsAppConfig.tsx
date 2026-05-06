import React, { useState } from 'react';
import { Smartphone, QrCode, CheckCircle2, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const WhatsAppConfig: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connected');
  const [instanceId, setInstanceId] = useState('1037735152765682');
  const [token, setToken] = useState('EAANyytfxNvw...');

  const handleConnect = () => {
    setStatus('connecting');
    // Simulando processo de handshake com o gateway
    setTimeout(() => {
      setStatus('connected');
    }, 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Conexão WhatsApp</h1>
        <p className="text-gray-500 mt-1">Conecte sua conta para sincronizar conversas e automatizar leads.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center">
               <Smartphone size={20} className="mr-2 text-indigo-500" />
               Estado da Instância
            </h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
              status === 'connected' ? "bg-emerald-100 text-emerald-700" : 
              status === 'connecting' ? "bg-amber-100 text-amber-700 animate-pulse" : 
              "bg-red-100 text-red-700"
            )}>
              {status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Puxando conversas...' : 'Desconectado'}
            </span>
          </div>

          {status === 'disconnected' ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos o protocolo <b>Multi-Device</b>. Para conectar, insira suas credenciais do gateway ou escaneie o QR Code.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ID da Instância (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: JusFlow_Office_01"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                    value={instanceId}
                    onChange={(e) => setInstanceId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Token de Acesso</label>
                  <input 
                    type="password" 
                    placeholder="Seu token secreto"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleConnect}
                  disabled={!token}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  Conectar via Gateway
                </button>
                <div className="text-center">
                  <span className="text-xs text-gray-400">ou</span>
                </div>
                <button className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center justify-center space-x-2">
                  <QrCode size={20} />
                  <span>Gerar QR Code JusFlow</span>
                </button>
              </div>
            </div>
          ) : status === 'connecting' ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
               <RefreshCw className="animate-spin text-indigo-500" size={48} />
               <p className="text-sm font-medium text-gray-600">Sincronizando conversas recentes...</p>
               <span className="text-xs text-gray-400 italic">Isso pode levar alguns minutos dependendo do seu histórico.</span>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center space-x-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <div>
                    <h4 className="font-bold text-emerald-900">Tudo pronto!</h4>
                    <p className="text-xs text-emerald-700">642 conversas sincronizadas com sucesso.</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 border border-gray-100 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="font-bold text-emerald-600">Ativo</p>
                  </div>
                  <div className="bg-white p-4 border border-gray-100 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Última Sinc.</p>
                    <p className="font-bold text-gray-900">Agora</p>
                  </div>
               </div>

               <div className="bg-white p-6 border border-gray-100 rounded-3xl space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Configuração do Webhook (Meta)</h4>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Callback URL</p>
                    <code className="block p-3 bg-gray-50 rounded-xl text-[10px] break-all font-mono text-indigo-600 border border-gray-100">
                      https://ais-dev-x4umkr2pejrtz33jqdqubm-214938784011.us-east1.run.app/webhook
                    </code>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Verify Token</p>
                    <code className="block p-3 bg-gray-50 rounded-xl text-xs font-mono text-indigo-600 border border-gray-100">
                      jusflow_secret_token_123
                    </code>
                  </div>
                  <p className="text-[10px] text-amber-600 font-medium">
                    * Configure isso no painel da Meta em "Configuração da API &gt; Webhook" para receber mensagens em tempo real.
                  </p>
               </div>

               <button 
                onClick={() => setStatus('disconnected')}
                className="w-full py-3 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition-all"
               >
                 Desconectar Dispositivo
               </button>
            </div>
          )}
        </div>

        {/* Info & Security */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl shadow-indigo-200">
            <ShieldCheck size={32} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Privacidade Legal</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">
              O JusFlow processa seus dados localmente. Somente os leads qualificados e notas internas são persistidos no banco de dados seguro do escritório.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start space-x-3">
             <AlertTriangle className="text-amber-500 shrink-0" size={20} />
             <div>
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Aviso Importante</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  Para puxar conversas antigas e manter o status de "extensão", mantenha sua instância do gateway ativa 24/7.
                </p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100">
             <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-tighter">Como Funciona?</h4>
             <ul className="space-y-3">
                {[
                  "Conecte via QR Code para espelhamento real-time.",
                  "O JusFlow varre as palavras-chave (Ex: 'Advogado', 'Trabalho').",
                  "Leads detectados entram automaticamente no Pipeline.",
                  "Histórico de conversas vira prova organizada no PDF."
                ].map((step, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs text-gray-500">
                    <span className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center shrink-0 font-bold">{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
