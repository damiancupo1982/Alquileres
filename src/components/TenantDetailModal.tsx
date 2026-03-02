import React from 'react';
import { X, Calendar, DollarSign, User, Phone, Mail } from 'lucide-react';
import { Tenant, Receipt } from '../App';

interface TenantDetailModalProps {
  tenant: Tenant | null;
  receipts: Receipt[];
  onClose: () => void;
}

const TenantDetailModal: React.FC<TenantDetailModalProps> = ({ tenant, receipts, onClose }) => {
  if (!tenant) return null;

  const tenantReceipts = receipts.filter((r: any) => r?.tenant === tenant.name);

  const totalPaid = tenantReceipts
    .filter((r: any) => r?.status === 'pagado')
    .reduce((sum, r: any) => sum + (r?.paidAmount || 0), 0);

  const totalOwed = tenantReceipts
    .filter((r: any) => r?.status === 'pendiente')
    .reduce((sum, r: any) => sum + (r?.total || 0), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">{tenant.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Información personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Información Personal</h4>
            <div className="space-y-3">
              <div className="flex items-center text-gray-900">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">{tenant.email}</span>
              </div>
              <div className="flex items-center text-gray-900">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span className="text-sm">{tenant.phone}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-600 mb-3">Contrato</h4>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-blue-600">Inicio</p>
                <p className="text-sm font-medium text-gray-900">{tenant.contractStart}</p>
              </div>
              <div>
                <p className="text-xs text-blue-600">Vencimiento</p>
                <p className="text-sm font-medium text-gray-900">{tenant.contractEnd}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del garante */}
        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-purple-600 mb-3">Información del Garante</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-purple-600">Nombre</p>
              <p className="text-sm font-medium text-gray-900">{tenant.guarantor.name}</p>
            </div>
            <div>
              <p className="text-xs text-purple-600">Email</p>
              <p className="text-sm font-medium text-gray-900">{tenant.guarantor.email}</p>
            </div>
            <div>
              <p className="text-xs text-purple-600">Teléfono</p>
              <p className="text-sm font-medium text-gray-900">{tenant.guarantor.phone}</p>
            </div>
          </div>
        </div>

        {/* Resumen financiero */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-xs text-green-600 mb-1">Depósito</p>
            <p className="text-xl font-bold text-green-600">${tenant.deposit.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-xs text-blue-600 mb-1">Total Pagado</p>
            <p className="text-xl font-bold text-blue-600">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-xs text-red-600 mb-1">Total Adeudado</p>
            <p className="text-xl font-bold text-red-600">${totalOwed.toLocaleString()}</p>
          </div>
        </div>

        {/* Recibos */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Historial de Recibos</h4>
          {tenantReceipts.length > 0 ? (
            <div className="space-y-2">
              {tenantReceipts.map((receipt) => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {receipt.month} {receipt.year}
                      </p>
                      <p className="text-xs text-gray-500">Recibo: {receipt.receiptNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${receipt.total.toLocaleString()}</p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          receipt.status === 'pagado'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {receipt.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                    <p>Alquiler: ${receipt.rent.toLocaleString()} + Expensas: ${receipt.expenses.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>No hay recibos registrados</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailModal;