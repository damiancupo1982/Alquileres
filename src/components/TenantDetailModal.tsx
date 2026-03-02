import React from 'react';
import { X, Calendar, Mail, Phone, User, DollarSign, TrendingUp } from 'lucide-react';
import { Tenant } from '../App';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  receipts: any[];
  onClose: () => void;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ tenant, receipts, onClose }) => {
  if (!tenant) return null;

  // Filtrar recibos del inquilino actual
  const tenantReceipts = Array.isArray(receipts) ? receipts.filter(r => r?.tenant === tenant.name) : [];

  // Calcular resumen de pagos
  const totalPaid = tenantReceipts
    .filter(r => r?.status === 'pagado' || r?.status === 'confirmado')
    .reduce((sum, r) => sum + ((r?.rent || 0) + (r?.expenses || 0)), 0);

  const totalPending = tenantReceipts
    .filter(r => r?.status === 'pendiente' || r?.status === 'pendiente_confirmacion')
    .reduce((sum, r) => sum + ((r?.rent || 0) + (r?.expenses || 0)), 0);

  // Construir tabla de movimientos con saldos actualizados
  const movements = tenantReceipts
    .sort((a, b) => {
      const dateA = new Date(`${a.year}-${(a.month.padStart || String.prototype.padStart).call(a.month, 2, '0')}-01`);
      const dateB = new Date(`${b.year}-${(b.month.padStart || String.prototype.padStart).call(b.month, 2, '0')}-01`);
      return dateA.getTime() - dateB.getTime();
    })
    .map((receipt, index) => {
      // Calcular saldo acumulado hasta este recibo
      const upToThisReceipt = tenantReceipts
        .slice(0, index + 1)
        .filter(r => r?.status === 'pagado' || r?.status === 'confirmado')
        .reduce((sum, r) => sum + ((r?.rent || 0) + (r?.expenses || 0)), 0);

      const totalDebtUpToThis = tenantReceipts
        .slice(0, index + 1)
        .reduce((sum, r) => sum + ((r?.rent || 0) + (r?.expenses || 0)), 0);

      const balanceUpdated = totalDebtUpToThis - upToThisReceipt;

      return {
        ...receipt,
        dueDate: receipt.dueDate || `${receipt.year}-${String(receipt.month).padStart(2, '0')}-01`,
        payment: receipt.status === 'pagado' || receipt.status === 'confirmado' ? (receipt.rent || 0) + (receipt.expenses || 0) : 0,
        balance: balanceUpdated
      };
    });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-5xl mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{tenant.name}</h2>
            <p className="text-gray-600 mt-1">Detalles del Inquilino</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  <label className="text-xs font-semibold uppercase">Email</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.email}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                  <label className="text-xs font-semibold uppercase">Teléfono</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.phone}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                  <label className="text-xs font-semibold uppercase">Depósito</label>
                </div>
                <p className="text-gray-900 font-bold text-lg">${tenant.deposit?.toLocaleString('es-AR') || '0'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-2 text-purple-500" />
                  <label className="text-xs font-semibold uppercase">Estado</label>
                </div>
                <p className={`text-sm font-bold px-3 py-1 rounded-full w-fit ${
                  tenant.status === 'activo' ? 'bg-green-100 text-green-800' :
                  tenant.status === 'vencido' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {tenant.status}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Garante */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Garante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium mt-1">{tenant.guarantor?.name}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Email</label>
                <p className="text-gray-900 font-medium mt-1">{tenant.guarantor?.email}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Teléfono</label>
                <p className="text-gray-900 font-medium mt-1">{tenant.guarantor?.phone}</p>
              </div>
            </div>
          </div>

          {/* Fechas del Contrato */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <label className="text-xs font-semibold uppercase">Fecha de Inicio</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.contractStart}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                  <label className="text-xs font-semibold uppercase">Fecha de Vencimiento</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.contractEnd}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Pagos */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Resumen de Pagos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 rounded-lg p-4 border border-green-300">
                <p className="text-sm text-green-700 font-semibold">✓ Pagos Confirmados</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-300">
                <p className="text-sm text-yellow-700 font-semibold">⏳ Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString('es-AR')}</p>
              </div>
              <div className={`rounded-lg p-4 border ${tenant.balance > 0 ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
                <p className={`text-sm font-semibold ${tenant.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  Saldo Actual
                </p>
                <p className={`text-2xl font-bold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${tenant.balance.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Tabla de Movimientos Detallada */}
            {tenantReceipts.length > 0 ? (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200 border-b border-gray-300">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Fecha de Pago</th>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Mes</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Alquiler</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Expensas</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Total Adeudado</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Pago Realizado</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Saldo Actualizado</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {movements.map((movement, idx) => {
                        const totalDue = (movement.rent || 0) + (movement.expenses || 0);
                        return (
                          <tr key={idx} className={`hover:bg-gray-50 ${movement.balance > 0 ? 'bg-red-50' : ''}`}>
                            <td className="py-3 px-4 font-medium text-gray-900">{movement.dueDate}</td>
                            <td className="py-3 px-4 text-gray-900">{movement.month} {movement.year}</td>
                            <td className="py-3 px-4 text-right text-gray-900">${movement.rent?.toLocaleString('es-AR') || '0'}</td>
                            <td className="py-3 px-4 text-right text-gray-900">${movement.expenses?.toLocaleString('es-AR') || '0'}</td>
                            <td className="py-3 px-4 text-right font-semibold text-gray-900">${totalDue.toLocaleString('es-AR')}</td>
                            <td className={`py-3 px-4 text-right font-bold ${movement.payment > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                              ${movement.payment.toLocaleString('es-AR')}
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${movement.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${movement.balance.toLocaleString('es-AR')}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                                movement.status === 'pagado' || movement.status === 'confirmado' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {movement.status === 'pagado' || movement.status === 'confirmado' ? '✓ Pagado' : '⏳ Pendiente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border border-gray-300">
                <p className="text-gray-500 text-lg">📋 No hay recibos registrados para este inquilino</p>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;