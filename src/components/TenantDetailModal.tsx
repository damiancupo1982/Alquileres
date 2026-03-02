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
  const tenantReceipts = receipts.filter(r => r.tenant === tenant.name);

  // Calcular resumen de pagos
  const totalPaid = tenantReceipts
    .filter(r => r.status === 'confirmado')
    .reduce((sum, r) => sum + (r.rent + r.expenses), 0);

  const totalPending = tenantReceipts
    .filter(r => r.status === 'pendiente_confirmacion')
    .reduce((sum, r) => sum + (r.rent + r.expenses), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
            <p className="text-gray-600 mt-1">Información del Inquilino</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Información Personal */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Email</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.email}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Teléfono</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.phone}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Depósito</label>
                </div>
                <p className="text-gray-900 font-medium">${tenant.deposit.toLocaleString('es-AR')}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <User className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Estado</label>
                </div>
                <p className={`text-sm font-semibold px-3 py-1 rounded-full w-fit ${
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
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Garante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Teléfono</label>
                <p className="text-gray-900 font-medium">{tenant.guarantor.phone}</p>
              </div>
            </div>
          </div>

          {/* Fechas del Contrato */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Fecha de Inicio</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.contractStart}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  <label className="text-sm font-medium">Fecha de Vencimiento</label>
                </div>
                <p className="text-gray-900 font-medium">{tenant.contractEnd}</p>
              </div>
            </div>
          </div>

          {/* Resumen de Movimientos */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Resumen de Pagos
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Pagos Confirmados</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString('es-AR')}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">Pendiente de Confirmación</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toLocaleString('es-AR')}</p>
              </div>
              <div className={`bg-white rounded-lg p-4 border border-gray-200`}>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${tenant.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ${tenant.balance.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Tabla de Recibos */}
            {tenantReceipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Mes</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Alquiler</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Expensas</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenantReceipts.slice(-6).reverse().map((receipt, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-2 px-2">{receipt.month} {receipt.year}</td>
                        <td className="py-2 px-2">${receipt.rent.toLocaleString('es-AR')}</td>
                        <td className="py-2 px-2">${receipt.expenses.toLocaleString('es-AR')}</td>
                        <td className="py-2 px-2 font-semibold">${(receipt.rent + receipt.expenses).toLocaleString('es-AR')}</td>
                        <td className="py-2 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            receipt.status === 'confirmado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {receipt.status === 'confirmado' ? 'Confirmado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No hay recibos registrados para este inquilino</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;