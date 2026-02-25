import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, FileDown, FileUp, Database } from 'lucide-react';
import { Property, Tenant, Receipt, CashMovement } from '../App';

interface DataPortabilityProps {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  tenants: Tenant[];
  setTenants: React.Dispatch<React.SetStateAction<Tenant[]>>;
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  cashMovements: CashMovement[];
  setCashMovements: React.Dispatch<React.SetStateAction<CashMovement[]>>;
}

interface SystemData {
  version: string;
  exportDate: string;
  properties: Property[];
  tenants: Tenant[];
  receipts: Receipt[];
  cashMovements: CashMovement[];
}

const DataPortability: React.FC<DataPortabilityProps> = ({
  properties,
  setProperties,
  tenants,
  setTenants,
  receipts,
  setReceipts,
  cashMovements,
  setCashMovements,
}) => {
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{
    properties: number;
    tenants: number;
    receipts: number;
    cashMovements: number;
  } | null>(null);

  const handleExport = () => {
    const dataToExport: SystemData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      properties,
      tenants,
      receipts,
      cashMovements,
    };

    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alquileres_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData: SystemData = JSON.parse(content);

        if (!importedData.version || !importedData.properties || !importedData.tenants) {
          throw new Error('Archivo inválido: faltan datos requeridos');
        }

        if (
          properties.length > 0 ||
          tenants.length > 0 ||
          receipts.length > 0 ||
          cashMovements.length > 0
        ) {
          const confirmMessage =
            'Ya existen datos en el sistema. ¿Desea REEMPLAZAR TODOS los datos actuales con los datos importados?\n\n' +
            'ADVERTENCIA: Esta acción eliminará todos los datos existentes y no se puede deshacer.\n\n' +
            'Datos actuales:\n' +
            `- Propiedades: ${properties.length}\n` +
            `- Inquilinos: ${tenants.length}\n` +
            `- Recibos: ${receipts.length}\n` +
            `- Movimientos de caja: ${cashMovements.length}\n\n` +
            'Datos a importar:\n' +
            `- Propiedades: ${importedData.properties?.length || 0}\n` +
            `- Inquilinos: ${importedData.tenants?.length || 0}\n` +
            `- Recibos: ${importedData.receipts?.length || 0}\n` +
            `- Movimientos de caja: ${importedData.cashMovements?.length || 0}`;

          if (!confirm(confirmMessage)) {
            event.target.value = '';
            return;
          }
        }

        setProperties(importedData.properties || []);
        setTenants(importedData.tenants || []);
        setReceipts(importedData.receipts || []);
        setCashMovements(importedData.cashMovements || []);

        setImportStats({
          properties: importedData.properties?.length || 0,
          tenants: importedData.tenants?.length || 0,
          receipts: importedData.receipts?.length || 0,
          cashMovements: importedData.cashMovements?.length || 0,
        });

        setImportError(null);
        setShowImportSuccess(true);
        setTimeout(() => {
          setShowImportSuccess(false);
          setImportStats(null);
        }, 5000);

        event.target.value = '';
      } catch (error) {
        console.error('Error al importar:', error);
        setImportError(
          error instanceof Error
            ? `Error al procesar el archivo: ${error.message}`
            : 'Error desconocido al procesar el archivo'
        );
        setShowImportSuccess(false);
        setTimeout(() => setImportError(null), 5000);
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      setImportError('Error al leer el archivo');
      setTimeout(() => setImportError(null), 5000);
      event.target.value = '';
    };

    reader.readAsText(file);
  };

  const getTotalRecords = () => {
    return properties.length + tenants.length + receipts.length + cashMovements.length;
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Database className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Gestión de Datos</h3>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar Todo</span>
          </button>

          <label className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <FileUp className="h-4 w-4" />
            <span>Importar Datos</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <div className="text-xs text-gray-600 text-center pt-2 border-t border-gray-200">
            {getTotalRecords()} registros totales
          </div>
        </div>
      </div>

      {showExportSuccess && (
        <div className="fixed top-6 right-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-green-800">Exportación Exitosa</h4>
              <p className="text-sm text-green-700 mt-1">
                Todos tus datos han sido exportados correctamente.
              </p>
              <div className="text-xs text-green-600 mt-2">
                <div>Propiedades: {properties.length}</div>
                <div>Inquilinos: {tenants.length}</div>
                <div>Recibos: {receipts.length}</div>
                <div>Movimientos de caja: {cashMovements.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportSuccess && importStats && (
        <div className="fixed top-6 right-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800">Importación Exitosa</h4>
              <p className="text-sm text-blue-700 mt-1">
                Todos tus datos han sido importados correctamente.
              </p>
              <div className="text-xs text-blue-600 mt-2">
                <div>Propiedades: {importStats.properties}</div>
                <div>Inquilinos: {importStats.tenants}</div>
                <div>Recibos: {importStats.receipts}</div>
                <div>Movimientos de caja: {importStats.cashMovements}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {importError && (
        <div className="fixed top-6 right-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg max-w-md animate-fade-in">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Error de Importación</h4>
              <p className="text-sm text-red-700 mt-1">{importError}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPortability;
