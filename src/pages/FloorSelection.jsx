import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Armchair, CheckCircle2, AlertTriangle, Coffee } from 'lucide-react';
import { useTableStore } from '../store/tableStore';

export default function FloorSelection() {
  const navigate = useNavigate();
  const { tables, isLoading, fetchTables, setTableId } = useTableStore();

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableSelect = (table) => {
    setTableId(table.id);
    navigate(`/pos?table_id=${table.id}`);
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500 mb-4 animate-pulse">
          <Coffee className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Odoo Cafe POS Terminal
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xs">
          Select a table to start taking orders or manage active bills.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-400 text-sm font-semibold">Loading Floor Plan...</span>
        </div>
      ) : (
        <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-200 tracking-wide uppercase">
              Main Dining Floor
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Occupied / Active Bill
              </span>
            </div>
          </div>

          {/* Grid Layout of Tables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {tables.map((table) => {
              const active = table.has_active_order;
              return (
                <div
                  key={table.id}
                  onClick={() => handleTableSelect(table)}
                  className={`relative overflow-hidden rounded-2xl p-6 border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-40 group ${
                    active
                      ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-400 shadow-rose-950/10'
                      : 'bg-slate-950/40 border-slate-800 hover:border-emerald-500/50 shadow-slate-950/20'
                  }`}
                >
                  {/* Decorative glowing overlay */}
                  <div
                    className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-2xl transition-opacity duration-300 group-hover:opacity-60 ${
                      active ? 'bg-rose-500/20' : 'bg-emerald-500/10'
                    }`}
                  ></div>

                  <div className="flex justify-between items-start">
                    <span className="text-2xl font-black font-mono tracking-tight text-slate-100 group-hover:text-amber-500 transition-colors">
                      T-{table.number}
                    </span>
                    {active ? (
                      <span className="bg-rose-500/10 text-rose-400 p-1.5 rounded-lg border border-rose-500/20">
                        <AlertTriangle size={14} />
                      </span>
                    ) : (
                      <span className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 size={14} />
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                      <Armchair size={14} className="text-slate-500" />
                      <span>{table.seats} Seats</span>
                    </div>
                    <div className="mt-3 text-[10px] uppercase font-bold tracking-wider">
                      {active ? (
                        <span className="text-rose-400">View Active Bill</span>
                      ) : (
                        <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">Start Order</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
