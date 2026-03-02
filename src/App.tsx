import React, { useState, useEffect } from 'react';
import { Building2, Users, Receipt, Calendar, BarChart3, Plus, Search, Bell, Wallet } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PropertiesManager from './components/PropertiesManager';
import TenantsManager from './components/TenantsManager';
import ReceiptsManager from './components/ReceiptsManager';
import PaymentsHistory from './components/PaymentsHistory';
import CashRegister from './components/CashRegister';
import DataPortability from './components/DataPortability';

type TabType = 'dashboard' | 'properties' | 'tenants' | 'receipts' | 'history' | 'cash';

// Interfaces globales
export interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  propertyId: number | null;
  property: string; // Mantenemos para compatibilidad
  contractStart: string;
  contractEnd: string;
  deposit: number;
  guarantor: {
    name: string;
    email: string;
    phone: string;
  };
  balance: number;
  status: 'activo' | 'vencido' | 'pendiente';
}

export interface Property {
  id: number;
  name: string;
  type: 'departamento' | 'galpon' | 'local' | 'oficina' | 'otro';
  building: string;
  address: string;
  rent: number;
  expenses: number;
  nextUpdateDate: string;
  tenant: string | null;
  status: 'ocupado' | 'disponible' | 'mantenimiento';
  contractStart: string;
  contractEnd: string;
  lastUpdated: string;
  notes: string;
}

export interface Receipt {
  id: number;
  receiptNumber: string;
  tenant: string;
  property: string;
  building: string;
  month: string;
  year: number;
  rent: number;
  expenses: number;
  otherCharges: { description: string; amount: number }[];
  previousBalance: number;
  total: number;
  paidAmount: number;
  remainingBalance: number;
  currency: 'ARS' | 'USD';
  paymentMethod: 'efectivo' | 'transferencia' | 'dolares';
  status: 'pagado' | 'pendiente' | 'vencido' | 'borrador';
  dueDate: string;
  createdDate: string;
}

export interface CashMovement {
  id: number;
  type: 'income' | 'delivery';
  description: string;
  amount: number;
  currency: 'ARS' | 'USD';
  date: string;
  tenant?: string;
  property?: string;
  paymentMethod?: 'efectivo' | 'transferencia' | 'dolares';
  deliveryType?: 'propietario' | 'comision' | 'gasto';
}

// Funciones para localStorage
const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const [properties, setProperties] = useState<Property[]>(() =>
    loadFromLocalStorage('properties', [
    {
      id: 1,
      name: 'Departamento A-101',
      type: 'departamento',
      building: 'Ramos Mejia',
      address: 'Av. Corrientes 1234, CABA',
      rent: 50000,
      expenses: 5000,
      nextUpdateDate: '2025-03-01',
      tenant: 'Juan Pérez',
      status: 'ocupado',
      contractStart: '2024-01-15',
      contractEnd: '2025-01-15',
      lastUpdated: '2025-01-12',
      notes: 'Departamento con balcón'
    },
    {
      id: 2,
      name: 'Oficina B-201',
      type: 'oficina',
      building: 'Torre Empresarial',
      address: 'Av. Libertador 5678, CABA',
      rent: 28000,
      expenses: 3500,
      tenant: null,
      status: 'disponible',
      contractStart: '',
      contractEnd: '',
      lastUpdated: '2025-01-12',
      notes: 'Oficina con vista panorámica'
    }
  ])
  );

  const [tenants, setTenants] = useState<Tenant[]>(() =>
    loadFromLocalStorage('tenants', [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+54 11 1234-5678',
      propertyId: 1,
      property: 'Departamento A-101',
      contractStart: '2024-01-15',
      contractEnd: '2025-01-15',
      deposit: 50000,
      guarantor: {
        name: 'María Pérez',
        email: 'maria.perez@email.com',
        phone: '+54 11 1234-5679'
      },
      balance: 0,
      status: 'activo'
    }
  ])
  );

  const [receipts, setReceipts] = useState<Receipt[]>(() =>
    loadFromLocalStorage('receipts', [])
  );

  const [cashMovements, setCashMovements] = useState<CashMovement[]>(() =>
    loadFromLocalStorage('cashMovements', [])
  );

  // Guardar en localStorage cuando cambia el estado
  useEffect(() => {
    saveToLocalStorage('properties', properties);
  }, [properties]);

  useEffect(() => {
    saveToLocalStorage('tenants', tenants);
  }, [tenants]);

  useEffect(() => {
    saveToLocalStorage('receipts', receipts);
  }, [receipts]);

  useEffect(() => {
    saveToLocalStorage('cashMovements', cashMovements);
  }, [cashMovements]);

  const updatePropertyTenant = (propertyId: number | null, tenantName: string | null, oldPropertyId?: number | null) => {
    if (oldPropertyId) {
      setProperties(properties.map(p => p.id === oldPropertyId ? { ...p, tenant: null, status: 'disponible' } : p));
    }
    if (propertyId && tenantName) {
      setProperties(properties.map(p => p.id === propertyId ? { ...p, tenant: tenantName, status: 'ocupado' } : p));
    }
  };

  const addCashMovement = (movement: CashMovement) => {
    setCashMovements([...cashMovements, movement]);
  };

  const updateTenantBalance = (tenantName: string, newBalance: number) => {
    setTenants(tenants.map(t => t.name === tenantName ? { ...t, balance: newBalance } : t));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          tenants={tenants} 
          receipts={receipts} 
          properties={properties} 
          setActiveTab={setActiveTab}
        />;
      case 'properties':
        return <PropertiesManager properties={properties} setProperties={setProperties} />;
      case 'tenants':
        return <TenantsManager 
          tenants={tenants} 
          setTenants={setTenants} 
          properties={properties}
          receipts={receipts}
          updatePropertyTenant={updatePropertyTenant}
        />;
      case 'receipts':
        return <ReceiptsManager 
          tenants={tenants} 
          properties={properties}
          receipts={receipts} 
          setReceipts={setReceipts}
          addCashMovement={addCashMovement}
          updateTenantBalance={updateTenantBalance}
        />;
      case 'history':
        return <PaymentsHistory receipts={receipts} />;
      case 'cash':
        return <CashRegister 
          cashMovements={cashMovements} 
          setCashMovements={setCashMovements}
        />;
      default:
        return <Dashboard 
          tenants={tenants} 
          receipts={receipts} 
          properties={properties} 
          setActiveTab={setActiveTab}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Sistema de Alquileres</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-5 w-5 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'properties'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-5 w-5 inline mr-2" />
              Propiedades
            </button>
            <button
              onClick={() => setActiveTab('tenants')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'tenants'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="h-5 w-5 inline mr-2" />
              Inquilinos
            </button>
            <button
              onClick={() => setActiveTab('receipts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'receipts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Receipt className="h-5 w-5 inline mr-2" />
              Recibos
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Historial
            </button>
            <button
              onClick={() => setActiveTab('cash')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'cash'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Wallet className="h-5 w-5 inline mr-2" />
              Arqueo
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Data Portability */}
      <DataPortability />
    </div>
  );
}

export default App;