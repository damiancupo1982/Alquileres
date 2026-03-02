import React, { useMemo, useState } from 'react';
import { Building2, Users, DollarSign, AlertTriangle, TrendingUp, Calendar, X, Printer, FileText } from 'lucide-react';
import { Tenant, Receipt, Property } from '../App';

type TabType = 'dashboard' | 'properties' | 'tenants' | 'receipts' | 'history' | 'cash';

interface DashboardProps {
  tenants: Tenant[];
  receipts: Receipt[];
  properties: Property[];
  setActiveTab: (tab: TabType) => void;
}

const toNumberSafe = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (!trimmed) return 0;
    const n = Number(trimmed.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
  }
  if (v == null) return 0;
  const n = Number(v as any);
  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (v: unknown): string => {
  const n = toNumberSafe(v);
  return n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
};

const safeDate = (v: unknown): Date | null => {
  if (!v) return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDateShort = (v: unknown): string => {
  const d = safeDate(v);
  if (!d) return '-';
  return d.toLocaleDateString('es-AR');
};

const getMonthName = (monthNum: number): string => {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthNum] || '';
};

// Colores por edificio - MISMO ORDEN QUE TU IMAGEN
const buildingColors: Record<string, string> = {
  'Ramos Mejia': '#FFE0F0', // Rosa
  'Limay': '#E0F0FF',        // Azul
  'Bolivar': '#FFE8D0',      // Naranja
  'Alvear': '#F0E0FF',       // Púrpura
  'Faena': '#E0E8FF',        // Índigo
  'Gaboto': '#E0FFE0',       // Verde
  'Gazcon': '#FFFFE0',       // Amarillo
};

const Dashboard: React.FC<DashboardProps> = ({ tenants, receipts, properties, setActiveTab }) => {
  const [showDebtorsList, setShowDebtorsList] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().getMonth());
  const [selectedReportYear, setSelectedReportYear] = useState(new Date().getFullYear());

  // DEBUG
  useMemo(() => {
    console.log('DEBUG Dashboard:', {
      receiptsCount: receipts?.length,
      tenantsCount: tenants?.length,
      propertiesCount: properties?.length,
      firstReceipt: receipts?.[0],
      firstTenant: tenants?.[0],
      firstProperty: properties?.[0],
    });
  }, [receipts, tenants, properties]);

  // DEUDORES - filtrar inquilinos con balance > 0
  const debtorsList = useMemo(() => {
    return (tenants ?? [])
      .filter((tenant: any) => {
        const balance = toNumberSafe(tenant?.balance);
        console.log(`Tenant ${tenant?.name}: balance=${balance}`);
        return balance > 0;
      })
      .map((tenant: any) => ({
        id: tenant?.id,
        name: tenant?.name,
        balance: toNumberSafe(tenant?.balance),
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [tenants]);

  const totalDebt = useMemo(() => {
    const total = debtorsList.reduce((sum, d) => sum + d.balance, 0);
    console.log('Total Debt:', total);
    return total;
  }, [debtorsList]);

  // INGRESOS DEL MES - filtrar por createdDate (cuándo se registró el pago)
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    console.log(`Calculando ingresos para mes=${currentMonth}, año=${currentYear}`);

    const income = (receipts ?? [])
      .filter((receipt: any) => {
        const createdDate = safeDate(receipt?.createdDate);
        if (!createdDate) return false;
        const isCurrentMonth = createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
        const isPaid = receipt?.status === 'pagado' || receipt?.status === 'confirmado';
        
        console.log(`Receipt ${receipt?.receiptNumber}: createdDate=${receipt?.createdDate}, paidAmount=${receipt?.paidAmount}, status=${receipt?.status}, match=${isCurrentMonth && isPaid}`);
        
        return isCurrentMonth && isPaid;
      })
      .reduce((sum: number, receipt: any) => {
        const paid = toNumberSafe(receipt?.paidAmount);
        console.log(`  Adding ${paid} from ${receipt?.tenant}`);
        return sum + paid;
      }, 0);

    console.log('Monthly Income Total:', income);
    return income;
  }, [receipts]);

  // Propiedades ocupadas
  const occupiedProperties = (properties ?? []).filter((p: any) => p?.status === 'ocupado').length;
  const totalProperties = (properties ?? []).length;

  // Inquilinos activos
  const activeTenants = (tenants ?? []).filter((t: any) => t?.status === 'activo').length;
  const occupancyRate = totalProperties > 0 ? ((activeTenants / totalProperties) * 100).toFixed(1) : '0';

  const stats = useMemo(
    () => [
      {
        title: 'Propiedades',
        value: `${occupiedProperties}/${totalProperties}`,
        icon: Building2,
        color: 'bg-blue-500',
        change: `${occupiedProperties} ocupadas`,
      },
      {
        title: 'Inquilinos Activos',
        value: activeTenants.toString(),
        icon: Users,
        color: 'bg-green-500',
        change: `${occupancyRate}% ocupación`,
      },
      {
        title: 'Ingresos del Mes',
        value: `$${formatMoney(monthlyIncome)}`,
        icon: DollarSign,
        color: 'bg-emerald-500',
        change: '+12% vs mes anterior',
      },
      {
        title: 'A Cobrar',
        value: `$${formatMoney(totalDebt)}`,
        icon: AlertTriangle,
        color: 'bg-red-500',
        change: `${debtorsList.length} deudores`,
        clickable: true,
      },
    ],
    [occupiedProperties, totalProperties, activeTenants, occupancyRate, monthlyIncome, totalDebt, debtorsList.length]
  );

  // Pagos recientes
  const recentPayments = useMemo(() => {
    return (receipts ?? [])
      .slice()
      .sort((a: any, b: any) => {
        const da = safeDate(a?.createdDate)?.getTime() ?? 0;
        const db = safeDate(b?.createdDate)?.getTime() ?? 0;
        return db - da;
      })
      .slice(0, 4)
      .map((receipt: any) => ({
        id: receipt?.id,
        tenant: receipt?.tenant,
        property: receipt?.property,
        amount: toNumberSafe(receipt?.paidAmount),
        date: receipt?.createdDate,
        status: receipt?.status === 'pagado' ? 'paid' : 'pending',
      }));
  }, [receipts]);

  // Generar reporte mensual - RESPETANDO TU ESTRUCTURA EXACTA
  const generateMonthlyReport = () => {
    const reportMonth = selectedReportMonth;
    const reportYear = selectedReportYear;
    const monthName = getMonthName(reportMonth);

    // Obtener todos los recibos del mes/año seleccionado
    const monthReceipts = (receipts ?? []).filter((receipt: any) => {
      const dueDate = safeDate(receipt?.dueDate);
      if (!dueDate) return false;
      return dueDate.getMonth() === reportMonth && dueDate.getFullYear() === reportYear;
    });

    console.log(`Generando reporte para ${monthName} ${reportYear}. Recibos del mes: ${monthReceipts.length}`);

    // Agrupar por edificio, manteniendo TODAS las propiedades en orden
    const sortedProperties = [...(properties ?? [])].sort((a: any, b: any) => {
      const buildingA = a?.building || 'Sin edificio';
      const buildingB = b?.building || 'Sin edificio';
      return buildingA.localeCompare(buildingB);
    });

    const reportData: Record<string, any[]> = {};
    const buildingOrder: string[] = [];

    sortedProperties.forEach((prop: any) => {
      const building = prop?.building || 'Sin edificio';
      if (!reportData[building]) {
        reportData[building] = [];
        buildingOrder.push(building);
      }

      // Buscar el inquilino de esta propiedad
      const tenant = tenants?.find((t: any) => t?.propertyId === prop?.id);
      
      // Buscar recibos de este inquilino en el mes seleccionado
      const propReceipts = monthReceipts.filter((r: any) => r?.tenant === tenant?.name);

      // PAGO: suma de paidAmount en el mes
      const paidAmount = propReceipts.reduce((sum, r: any) => sum + toNumberSafe(r?.paidAmount), 0);
      
      // DEBE: balance actual del inquilino
      const tenantDebt = tenant ? toNumberSafe(tenant?.balance) : 0;

      reportData[building].push({
        propertyName: prop?.name,
        tenantName: tenant?.name || '-',
        paidAmount,
        debt: tenantDebt,
      });
    });

    // Calcular totales
    let totalPaid = 0;
    let totalDebt = 0;
    Object.values(reportData).forEach((items) => {
      items.forEach((item) => {
        totalPaid += item.paidAmount;
        totalDebt += item.debt;
      });
    });

    return { reportMonth, reportYear, monthName, reportData, buildingOrder, totalPaid, totalDebt };
  };

  const printReport = () => {
    const report = generateMonthlyReport();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resumen ${report.monthName} ${report.reportYear}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header-info { display: flex; gap: 40px; justify-content: center; margin: 10px 0; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid black; padding: 8px; text-align: left; }
          th { background-color: #ffff00; font-weight: bold; }
          .total-row { background-color: #ffff00; font-weight: bold; }
          .amount { text-align: right; }
          .footer { margin-top: 40px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RESUMEN MENSUAL</h1>
          <div class="header-info">
            <div>MES <br/> <strong>${report.monthName.toUpperCase()}</strong></div>
            <div>AÑO <br/> <strong>${report.reportYear}</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr style="background-color: #ffff00;">
              <th>Edificio</th>
              <th>Inquilino</th>
              <th>Propiedad</th>
              <th class="amount">PAGO</th>
              <th class="amount">DEBE</th>
            </tr>
          </thead>
          <tbody>
    `;

    report.buildingOrder.forEach((building) => {
      const bgColor = buildingColors[building] || '#f0f0f0';
      const items = report.reportData[building];

      items.forEach((item, index) => {
        reportHTML += `
          <tr>
            ${index === 0 ? `<td rowspan="${items.length}" style="background-color: ${bgColor}; font-weight: bold;">${building}</td>` : ''}
            <td>${item.tenantName}</td>
            <td>${item.propertyName}</td>
            <td class="amount">${item.paidAmount.toLocaleString()}</td>
            <td class="amount">${item.debt.toLocaleString()}</td>
          </tr>
        `;
      });
    });

    reportHTML += `
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px;">
          <table style="width: 400px; margin-left: auto;">
            <tr class="total-row">
              <td style="background-color: #ffff00; font-weight: bold; border: 1px solid black;">TOTAL</td>
              <td class="amount" style="background-color: #ffff00; font-weight: bold; border: 1px solid black;">${report.totalPaid.toLocaleString()}</td>
              <td class="amount" style="background-color: #ffff00; font-weight: bold; border: 1px solid black;">${report.totalDebt.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div class="footer">
          <p>Impreso: ${new Date().toLocaleDateString('es-AR')}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(reportHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${
                stat.clickable ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={stat.clickable ? () => setShowDebtorsList(true) : undefined}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Pagos Recientes</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{payment.tenant}</p>
                    <p className="text-sm text-gray-500">{payment.property}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${formatMoney(payment.amount)}</p>
                    <div className="flex items-center space-x-2 justify-end">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                      <span className="text-xs text-gray-500">{formatDateShort(payment.date)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {recentPayments.length === 0 && (
                <div className="text-sm text-gray-500">No hay pagos recientes para mostrar.</div>
              )}
            </div>
          </div>
        </div>

        {/* List of Debtors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Lista de Deudores</h3>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {debtorsList.map((debtor) => (
                <div
                  key={debtor.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{debtor.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">${formatMoney(debtor.balance)}</p>
                  </div>
                </div>
              ))}
              {debtorsList.length === 0 && (
                <div className="text-sm text-green-600 font-medium">✓ No hay deudores</div>
              )}
            </div>
            {debtorsList.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Adeudado:</span>
                  <span className="text-xl font-bold text-red-600">${formatMoney(totalDebt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Report Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button
          onClick={() => setShowMonthlyReport(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="h-5 w-5" />
          <span>Resumen Mensual</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('properties')}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Building2 className="h-5 w-5" />
            <span>Agregar Propiedad</span>
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Users className="h-5 w-5" />
            <span>Nuevo Inquilino</span>
          </button>
          <button
            onClick={() => setActiveTab('receipts')}
            className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <DollarSign className="h-5 w-5" />
            <span>Generar Recibo</span>
          </button>
        </div>
      </div>

      {/* Monthly Report Modal */}
      {showMonthlyReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Resumen Mensual</h3>
              <button
                onClick={() => setShowMonthlyReport(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Month/Year Selection */}
            <div className="flex gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                <select
                  value={selectedReportMonth}
                  onChange={(e) => setSelectedReportMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{getMonthName(i)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={selectedReportYear}
                  onChange={(e) => setSelectedReportYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <option key={year} value={year}>{year}</option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Report */}
            <div id="report-content" className="bg-white border border-gray-300 p-6">
              {(() => {
                const report = generateMonthlyReport();
                return (
                  <>
                    {/* Header - TU FORMATO EXACTO */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <span className="font-bold">MES</span><br/>
                        <span className="text-lg">{report.monthName.toUpperCase()}</span>
                      </div>
                      <div className="text-center">
                        <h1 className="text-2xl font-bold">RESUMEN MENSUAL</h1>
                      </div>
                      <div>
                        <span className="font-bold">AÑO</span><br/>
                        <span className="text-lg">{report.reportYear}</span>
                      </div>
                    </div>

                    {/* Buildings Table - TU ESTRUCTURA EXACTA */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse border border-black">
                        <thead>
                          <tr style={{ backgroundColor: '#ffff00' }}>
                            <th className="border border-black px-4 py-2 text-left font-bold">Edificio</th>
                            <th className="border border-black px-4 py-2 text-left font-bold">Inquilino</th>
                            <th className="border border-black px-4 py-2 text-left font-bold">Propiedad</th>
                            <th className="border border-black px-4 py-2 text-right font-bold">PAGO</th>
                            <th className="border border-black px-4 py-2 text-right font-bold">DEBE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.buildingOrder.map((building) => {
                            const bgColor = buildingColors[building] || '#f0f0f0';
                            const items = report.reportData[building];
                            return items.map((item, idx) => (
                              <tr
                                key={`${building}-${idx}`}
                              >
                                {idx === 0 && (
                                  <td
                                    rowSpan={items.length}
                                    className="border border-black px-4 py-2 font-bold"
                                    style={{ backgroundColor: bgColor }}
                                  >
                                    {building}
                                  </td>
                                )}
                                <td className="border border-black px-4 py-2">{item.tenantName}</td>
                                <td className="border border-black px-4 py-2">{item.propertyName}</td>
                                <td className="border border-black px-4 py-2 text-right">{item.paidAmount.toLocaleString()}</td>
                                <td className="border border-black px-4 py-2 text-right">{item.debt.toLocaleString()}</td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                      <table className="border-collapse border border-black" style={{ width: '300px' }}>
                        <tbody>
                          <tr style={{ backgroundColor: '#ffff00' }}>
                            <td className="border border-black px-4 py-2 font-bold">TOTAL</td>
                            <td className="border border-black px-4 py-2 text-right font-bold">{report.totalPaid.toLocaleString()}</td>
                            <td className="border border-black px-4 py-2 text-right font-bold">{report.totalDebt.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowMonthlyReport(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="h-4 w-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;