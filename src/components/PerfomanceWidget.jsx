import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Edit2, Check, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

function PerformanceWidget({ performance, totalRecords, target = 98, onTargetChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTarget, setTempTarget] = useState(target);

  const isGoodPerformance = performance >= target;

  const handleSave = () => {
    const val = parseFloat(tempTarget);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      onTargetChange(val);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTempTarget(target);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-r ${
        isGoodPerformance 
          ? 'from-green-500 to-green-600' 
          : 'from-orange-500 to-orange-600'
      } rounded-xl p-6 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/90 text-sm font-medium mb-1">Performance do Período</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-white">{performance.toFixed(1)}%</span>
            {isGoodPerformance ? (
              <TrendingUp className="w-8 h-8 text-white" />
            ) : (
              <TrendingDown className="w-8 h-8 text-white" />
            )}
          </div>
          <p className="text-white/80 text-xs mt-2">
            Baseado em {totalRecords} registros
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm min-w-[140px]">
            <p className="text-white/90 text-xs mb-2 flex items-center justify-end gap-1">
              Meta
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  title="Alterar meta"
                >
                  <Edit2 className="w-3 h-3 text-white" />
                </button>
              )}
            </p>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input 
                  type="number"
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  className="h-8 w-20 bg-white/90 text-black border-0 text-right font-bold"
                  min="0"
                  max="100"
                />
                <div className="flex flex-col gap-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-4 w-4 hover:bg-green-500/50 text-white" 
                    onClick={handleSave}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-4 w-4 hover:bg-red-500/50 text-white" 
                    onClick={handleCancel}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-white">{target}%</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PerformanceWidget;