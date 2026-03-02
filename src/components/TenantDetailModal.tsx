import React from 'react';
import { X, Calendar, Mail, Phone, User, DollarSign, TrendingUp } from 'lucide-react';
import { Tenant } from '../App';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  receipts: any[];
  onClose: () => void;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ tenant, receipts, onClose }) => {
  if (!tenant) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-3xl mx-4">
          <p className="text-center text-gray-500">No hay datos del inquilino</p>
          <div className="flex justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar recibos del inquilino actual
  const tenantReceipts = receipts.filter(r => r.tenant === tenant.name);

  // Calcular resumen de pagos
  const totalPaid = tenantReceipts
    .filter(r => r.status === 'pagado' || r.status === 'confirmado')
    .reduce((sum, r) => sum + (r.rent + r.expenses), 0);

  const totalPending = tenantReceipts
    .filter(r => r.status === 'pendiente' || r.status === 'pendiente_confirmacion')
    .reduce((sum, r) => sum + (r.rent + r.expenses), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{tenant.name}</h2>
            <p className="text-gray-600 mt-1">Detalles del Inquilino</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  <label className="text-xs font-semibold uppercase">Email</label>
                </div>
                <p className="text-gray-900 font-medium text-base">{tenant.email || 'No especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                  <label className="text-xs font-semibold uppercase">Teléfono</label>
                </div>
                <p className="text-gray-900 font-medium text-base">{tenant.phone || 'No especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <DollarSign className="h-4 w-4 mr-2 text-yellow-500" />
                  <label className="text-xs font-semibold uppercase">Depósito</label>
                </div>
                <p className="text-gray-900 font-bold text-lg">${tenant.deposit.toLocaleString('es-AR')}</p>
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
                  {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Garante */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🛡️ Información del Garante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium text-base mt-1">{tenant.guarantor?.name || 'No especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Email</label>
                <p className="text-gray-900 font-medium text-base mt-1">{tenant.guarantor?.email || 'No especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <label className="text-xs font-semibold uppercase text-gray-600">Teléfono</label>
                <p className="text-gray-900 font-medium text-base mt-1">{tenant.guarantor?.phone || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Fechas del Contrato */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  <label className="text-xs font-semibold uppercase">Fecha de Inicio</label>
                </div>
                <p className="text-gray-900 font-bold text-lg">{tenant.contractStart || 'No especificada'}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                  <label className="text-xs font-semibold uppercase">Fecha de Vencimiento</label>
                </div>
                <p className="text-gray-900 font-bold text-lg">{tenant.contractEnd || 'No especificada'}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Movimientos */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Resumen de Pagos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-300">
                <p className="text-sm text-green-700 font-semibold mb-2">✓ Pagos Confirmados</p>
                <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border-2 border-yellow-300">
                <p className="text-sm text-yellow-700 font-semibold mb-2">⏳ Pendiente de Confirmación</p>
                <p className="text-3xl font-bold text-yellow-600">${totalPending.toLocaleString('es-AR')}</p>
              </div>
              <div className={`bg-gradient-to-br ${tenant.balance > 0 ? 'from-red-50 to-red-100 border-2 border-red-300' : 'from-green-50 to-green-100 border-2 border-green-300'} rounded-lg p-6`}>
                <p className={`text-sm font-semibold mb-2 ${tenant.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {tenant.balance > 0 ? '⚠️ Saldo Adeudado' : '✓ Saldo'}
                </p>
                <p className={`text-3xl font-bold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${tenant.balance.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Tabla de Recibos */}
            {tenantReceipts.length > 0 ? (
              <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-200 border-b border-gray-300">
                      <tr>
                        <th className="text-left py-3 px-4 font-bold text-gray-700">Mes</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Alquiler</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Expensas</th>
                        <th className="text-right py-3 px-4 font-bold text-gray-700">Total</th>
                        <th className="text-center py-3 px-4 font-bold text-gray-700">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tenantReceipts.slice(-6).reverse().map((receipt, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-gray-900 font-medium">{receipt.month} {receipt.year}</td>
                          <td className="py-3 px-4 text-right text-gray-900">${receipt.rent?.toLocaleString('es-AR') || '0'}</td>
                          <td className="py-3 px-4 text-right text-gray-900">${receipt.expenses?.toLocaleString('es-AR') || '0'}</td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">${((receipt.rent || 0) + (receipt.expenses || 0)).toLocaleString('es-AR')}</td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${
                              receipt.status === 'pagado' || receipt.status === 'confirmado' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {receipt.status === 'pagado' || receipt.status === 'confirmado' ? '✓ Confirmado' : '⏳ Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
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
            ✕ Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;