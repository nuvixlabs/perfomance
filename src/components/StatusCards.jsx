import React from 'react';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

function StatusCards({ data }) {
  // Count unique Nro. Entrega
  const uniqueDeliveries = new Set(data.map(d => d.nroEntrega).filter(Boolean));
  const totalEntregas = uniqueDeliveries.size;

  // Helper to check SLA2 safely
  const checkSLA2 = (item, status) => 
    item.sla2 && item.sla2.toString().trim().toUpperCase() === status;

  const entregueNoPrazo = data.filter(item => checkSLA2(item, 'ENTREGUE NO PRAZO')).length;
  const dentroPrazo = data.filter(item => checkSLA2(item, 'DENTRO DO PRAZO')).length;
  const atrasada = data.filter(item => checkSLA2(item, 'ATRASADA')).length;
  const vencida = data.filter(item => checkSLA2(item, 'VENCIDA')).length;

  const cards = [
    {
      title: 'Total de Entregas',
      value: totalEntregas,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Entregue no Prazo',
      value: entregueNoPrazo,
      icon: CheckCircle,
      color: 'from-green-600 to-green-700',
      iconBg: 'bg-green-600'
    },
    {
      title: 'Dentro do Prazo',
      value: dentroPrazo,
      icon: Clock,
      color: 'from-cyan-500 to-cyan-600',
      iconBg: 'bg-cyan-500'
    },
    {
      title: 'Atrasada',
      value: atrasada,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Vencida',
      value: vencida,
      icon: XCircle,
      color: 'from-orange-600 to-orange-700',
      iconBg: 'bg-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${card.color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-xs lg:text-sm font-medium mb-1 break-words">{card.title}</p>
              <p className="text-3xl lg:text-4xl font-bold text-white">{card.value}</p>
            </div>
            <div className={`${card.iconBg} p-2 lg:p-3 rounded-lg bg-white/20`}>
              <card.icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default StatusCards;