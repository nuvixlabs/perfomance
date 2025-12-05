import React from 'react';
import { motion } from 'framer-motion';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { X, Calendar } from 'lucide-react';
import { Button } from './ui/button';

function FilterPanel({ filters, setFilters, data }) {
  const unidadesAtuais = [...new Set(data.map(item => item.unidadeAtual).filter(Boolean))].sort();
  const unidadesDestino = [...new Set(data.map(item => item.unidadeDestino).filter(Boolean))].sort();
  const statusPreventivos = [...new Set(data.map(item => item.preventivo).filter(Boolean))].sort();

  const handleClearFilters = () => {
    setFilters({
      unidadeAtual: '',
      unidadeDestino: '',
      statusPreventivo: '',
      dataVencimento: '',
      mesVencimento: ''
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Filtros</h2>
        <Button
          onClick={handleClearFilters}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
        >
          <X className="w-4 h-4 mr-1" />
          Limpar
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-white mb-2 block">Mês de Vencimento</Label>
          <div className="relative">
            <Input
              type="month"
              value={filters.mesVencimento}
              onChange={(e) => setFilters({ ...filters, mesVencimento: e.target.value })}
              className="bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div>
          <Label className="text-white mb-2 block">Unidade Atual</Label>
          <Select
            value={filters.unidadeAtual}
            onValueChange={(value) => setFilters({ ...filters, unidadeAtual: value })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todas as unidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {unidadesAtuais.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>
                  {unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white mb-2 block">Unidade Destino</Label>
          <Select
            value={filters.unidadeDestino}
            onValueChange={(value) => setFilters({ ...filters, unidadeDestino: value })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todas as unidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as unidades</SelectItem>
              {unidadesDestino.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>
                  {unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white mb-2 block">Status Preventivo</Label>
          <Select
            value={filters.statusPreventivo}
            onValueChange={(value) => setFilters({ ...filters, statusPreventivo: value })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {statusPreventivos.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-white mb-2 block">Data Específica</Label>
          <Input
            type="date"
            value={filters.dataVencimento}
            onChange={(e) => setFilters({ ...filters, dataVencimento: e.target.value })}
            className="bg-white/10 border-white/20 text-white [&::-webkit-calendar-picker-indicator]:invert"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default FilterPanel;