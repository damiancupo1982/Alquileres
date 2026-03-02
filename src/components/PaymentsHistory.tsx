import React, { useMemo, useState } from 'react';
import { Calendar, DollarSign, Filter, Download } from 'lucide-react';
import { Receipt } from '../App';

interface PaymentsHistoryProps {
  receipts: Receipt[];
}

const PaymentsHistory: React.FC<PaymentsHistoryProps> = ({ receipts }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pagado' | 'pendiente'>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');

  const safeDate = (v: unknown): Date | null => {
    if (!v) return null;
    const d = new Date(String(v));
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    receipts.forEach((r) => {
      const d = safeDate(r?.dueDate);
      if (d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        monthSet.add(`${year}-${month}`);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    let result = (receipts ?? []).filter((receipt: any) => {
      if (filterStatus !== 'all' && receipt?.status !== filterStatus) return false;

      if (filterMonth !== 'all') {
        const d = safeDate(receipt?.dueDate);
        if (!d) return false;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const receiptMonth = `${year}-${month}`;
        if (receiptMonth !== filterMonth) return false;
      }

      return true;
    });

    // Ordenar
    if (sortBy === 'date') {
      result.sort((a, b) => {
        const da = safeDate(a?.dueDate)?.getTime() ?? 0;
        const db = safeDate(b?.dueDate)?.getTime() ?? 0;
        return db - da;
      });
    } else if (sortBy === 'amount') {
      result.sort((a, b) => (b?.total || 0) - (a?.total || 0));
    }

    return result;
  }, [receipts, filterStatus, filterMonth, sortBy]);

  const stats = useMemo(() => {
    const paid = receipts.filter((r) => r?.status === 'pagado').reduce((sum, r) => sum + (r?.paidAmount || 0), 0);
    const pending = receipts.filter((r) => r?.status === 'pendiente').reduce((sum, r) => sum + ((r?.total || 0) - (r?.paidAmount || 0)), 0);
    const total = receipts.reduce((sum, r) => sum + (r?.total || 0), 0);

    return { paid, pending, total };
  }, [receipts]);

  const generateCSV = () => {
    const headers = ['Fecha', 'Inquilino', 'Propiedad', 'Mes', 'Alquiler', 'Expensas', 'Total', 'Pagado', 'Pendiente', 'Estado'];
    const rows = filteredReceipts.map((receipt) => [
      receipt.dueDate || '-',
      receipt.tenant,
      receipt.property,
      `${receipt.month} ${receipt.year}`,
      receipt.rent,
      receipt.expenses,
      receipt.total,
      receipt.paidAmount,
      receipt.total - receipt.paidAmount,
      receipt.status
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `historial_pagos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
        <p className="text-gray-600">Registro completo de todos los recibos y pagos</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Facturado</p>
              <p className="text-3xl font-bold text-blue-900">${stats.total.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Pagado</p>
              <p className="text-3xl font-bold text-green-900">${stats.paid.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Pendiente de Pago</p>
              <p className="text-3xl font-bold text-red-900">${stats.pending.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Estados</option>
              <option value="pagado">✓ Pagados</option>
              <option value="pendiente">⏳ Pendientes</option>
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los Meses</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Ordenar por Fecha</option>
              <option value="amount">Ordenar por Monto</option>
            </select>
          </div>

          <button
            onClick={generateCSV}
            className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inquilino
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propiedad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Periodo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alquiler
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expensas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReceipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className={`hover:bg-gray-50 ${receipt.status === 'pendiente' ? 'bg-yellow-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {receipt.dueDate ? new Date(receipt.dueDate).toLocaleDateString('es-AR') : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {receipt.tenant}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.property}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {receipt.month} {receipt.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${receipt.rent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${receipt.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    ${receipt.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-semibold ${receipt.paidAmount > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      ${receipt.paidAmount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        receipt.status === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : receipt.status === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {receipt.status === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredReceipts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recibos</h3>
          <p className="text-gray-500">No hay recibos que coincidan con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentsHistory;