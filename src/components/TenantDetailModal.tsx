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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
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
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{tenant.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Teléfono</label>
                <p className="text-gray-900 font-medium">{tenant.phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Depósito</label>
                <p className="text-gray-900 font-bold text-lg">${tenant.deposit?.toLocaleString('es-AR') || '0'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Estado</label>
                <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${
                  tenant.status === 'activo' ? 'bg-green-100 text-green-800' :
                  tenant.status === 'vencido' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>

          {/* Información del Garante */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Información del Garante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor?.name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor?.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Teléfono</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor?.phone}</p>
              </div>
            </div>
          </div>

          {/* Fechas del Contrato */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Fecha de Inicio</label>
                <p className="text-gray-900 font-medium">{tenant.contractStart}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Fecha de Vencimiento</label>
                <p className="text-gray-900 font-medium">{tenant.contractEnd}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Pagos */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Pagos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 rounded-lg p-4 border border-green-300">
                <p className="text-sm text-green-700 font-semibold">Pagos Confirmados</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 border border-yellow-300">
                <p className="text-sm text-yellow-700 font-semibold">Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString('es-AR')}</p>
              </div>
              <div className={`rounded-lg p-4 border ${tenant.balance > 0 ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
                <p className={`text-sm font-semibold ${tenant.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  Saldo
                </p>
                <p className={`text-2xl font-bold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${tenant.balance.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Tabla de Recibos */}
            {tenantReceipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="text-left py-2 px-3">Mes</th>
                      <th className="text-right py-2 px-3">Alquiler</th>
                      <th className="text-right py-2 px-3">Expensas</th>
                      <th className="text-right py-2 px-3">Total</th>
                      <th className="text-center py-2 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tenantReceipts.slice(-6).reverse().map((receipt, idx) => (
                      <tr key={idx} className="hover:bg-gray-100">
                        <td className="py-2 px-3">{receipt.month} {receipt.year}</td>
                        <td className="text-right py-2 px-3">${receipt.rent?.toLocaleString('es-AR') || '0'}</td>
                        <td className="text-right py-2 px-3">${receipt.expenses?.toLocaleString('es-AR') || '0'}</td>
                        <td className="text-right py-2 px-3 font-bold">${((receipt.rent || 0) + (receipt.expenses || 0)).toLocaleString('es-AR')}</td>
                        <td className="text-center py-2 px-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            receipt.status === 'pagado' || receipt.status === 'confirmado' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {receipt.status === 'pagado' || receipt.status === 'confirmado' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay recibos registrados</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;