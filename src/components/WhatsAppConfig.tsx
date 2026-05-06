import React, { useState } from 'react';
import { Smartphone, QrCode, CheckCircle2, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const WhatsAppConfig: React.FC = () => {
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);

  const handleConnect = () => {
    setStatus('connecting');
    // Simulando a geração de um QR Code de pareamento (como no WhatsApp Web)
    setTimeout(() => {
      setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=JusFlow_Pairing_Mock_123456');
    }, 1500);
  };

  const simulateSuccess = () => {
    setStatus('connected');
    setQrCode(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Conectar WhatsApp</h2>
          <p className="text-gray-500 mt-1">Vincule seu número pessoal como um dispositivo pareado.</p>
        </div>
        <div className={cn(
          "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center space-x-2",
          status === 'connected' ? "bg-emerald-100 text-emerald-600" : 
          status === 'connecting' ? "bg-amber-100 text-amber-600 animate-pulse" : "bg-gray-100 text-gray-400"
        )}>
          <div className={cn("w-2 h-2 rounded-full", 
            status === 'connected' ? "bg-emerald-500" : 
            status === 'connecting' ? "bg-amber-500" : "bg-gray-400"
          )} />
          <span>{status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Aguardando QR Code' : 'Desconectado'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Esquerda: Instruções e Ação */}
        <div className="space-y-6">
          <div className="bg-white p-8 border border-gray-100 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Como conectar?</h3>
            <ul className="space-y-4">
              {[
                "Abra o WhatsApp no seu celular",
                "Toque em Mais opções (⋮) ou Configurações (⚙️)",
                "Selecione 'Dispositivos conectados'",
                "Toque em 'Conectar um dispositivo' e aponte para o QR Code"
              ].map((step, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm text-gray-600">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px] mt-0.5">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            {status === 'disconnected' && (
              <button 
                onClick={handleConnect}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <div className="bg-white/20 p-1 rounded-lg"><Smartphone size={20} /></div>
                <span>Gerar QR Code de Conexão</span>
              </button>
            )}

            {status === 'connected' && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Sua conta está ativa</p>
                    <p className="text-xs text-emerald-600 font-medium">Sincronizando em tempo real</p>
                  </div>
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

          <div className="p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3">Vantagens deste modelo</h4>
            <p className="text-xs text-gray-500 leading-relaxed italic">
              "Diferente da API oficial, aqui você usa seu próprio número pessoal. O JusFlow funciona como uma máscara que organiza suas etiquetas e threads sem custar por mensagem enviada."
            </p>
          </div>
        </div>

        {/* Direita: QR Code */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col items-center justify-center shadow-sm min-h-[400px]">
          {status === 'disconnected' && (
            <div className="text-center space-y-4 opacity-50">
              <div className="w-48 h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto">
                <Smartphone size={40} className="text-gray-300" />
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Clique para gerar o código</p>
            </div>
          )}

          {status === 'connecting' && qrCode && (
            <div className="text-center space-y-6">
              <div className="p-4 bg-white border-2 border-indigo-600 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900">Escaneie o código acima</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                  <span className="text-xs text-gray-500">Aguardando confirmação do celular...</span>
                </div>
                <button 
                  onClick={simulateSuccess}
                  className="mt-4 text-[10px] text-gray-300 hover:text-indigo-600 transition-colors uppercase font-bold"
                >
                  (Simular Sucesso do Scan)
                </button>
              </div>
            </div>
          )}

          {status === 'connected' && (
            <div className="text-center space-y-6">
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Smartphone size={48} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-gray-900">Dispositivo Pareado</h3>
                <p className="text-sm text-gray-500">Seu iPhone 15 Pro está conectado.</p>
              </div>
              <div className="flex justify-center space-x-2">
                 {['Ativo', 'Seguro', 'Criptografado'].map(tag => (
                   <span key={tag} className="text-[9px] bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-bold uppercase">{tag}</span>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
