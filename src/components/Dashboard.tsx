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

// Colores por edificio
const buildingColors: Record<string, { bg: string; text: string; light: string }> = {
  'Ramos Mejia': { bg: 'bg-pink-50', text: 'text-pink-700', light: 'bg-pink-100' },
  'Limay': { bg: 'bg-blue-50', text: 'text-blue-700', light: 'bg-blue-100' },
  'Bolivar': { bg: 'bg-orange-50', text: 'text-orange-700', light: 'bg-orange-100' },
  'Alvear': { bg: 'bg-purple-50', text: 'text-purple-700', light: 'bg-purple-100' },
  'Faena': { bg: 'bg-indigo-50', text: 'text-indigo-700', light: 'bg-indigo-100' },
  'Gaboto': { bg: 'bg-green-50', text: 'text-green-700', light: 'bg-green-100' },
  'Gazcon': { bg: 'bg-yellow-50', text: 'text-yellow-700', light: 'bg-yellow-100' },
};

const getBuildingColor = (building: string) => {
  return buildingColors[building] || { bg: 'bg-gray-50', text: 'text-gray-700', light: 'bg-gray-100' };
};

const Dashboard: React.FC<DashboardProps> = ({ tenants, receipts, properties, setActiveTab }) => {
  const [showDebtorsList, setShowDebtorsList] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState(new Date().getMonth());
  const [selectedReportYear, setSelectedReportYear] = useState(new Date().getFullYear());

  // Deudores ordenados de mayor a menor
  const debtorsList = useMemo(() => {
    return (tenants ?? [])
      .filter((tenant) => toNumberSafe((tenant as any)?.balance) > 0)
      .map((tenant) => ({
        id: (tenant as any)?.id,
        name: (tenant as any)?.name,
        balance: toNumberSafe((tenant as any)?.balance),
      }))
      .sort((a, b) => b.balance - a.balance);
  }, [tenants]);

  const totalDebt = useMemo(() => debtorsList.reduce((sum, d) => sum + d.balance, 0), [debtorsList]);

  // Propiedades ocupadas
  const occupiedProperties = (properties ?? []).filter((p: any) => p?.status === 'ocupado').length;
  const totalProperties = (properties ?? []).length;

  // Inquilinos activos
  const activeTenants = (tenants ?? []).filter((t: any) => t?.status === 'activo').length;
  const occupancyRate = totalProperties > 0 ? ((activeTenants / totalProperties) * 100).toFixed(1) : '0';

  // Ingresos del mes actual (CORREGIDO: usar receipt.total para teórico, paidAmount para real)
  const monthlyIncome = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthReceipts = (receipts ?? []).filter((receipt: any) => {
      const receiptDate = safeDate(receipt?.dueDate || receipt?.createdDate);
      if (!receiptDate) return false;
      return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    });

    // Ingresos reales (pagados)
    return currentMonthReceipts
      .filter((r: any) => r?.status === 'pagado' || r?.status === 'confirmado')
      .reduce((sum: number, receipt: any) => sum + toNumberSafe(receipt?.paidAmount), 0);
  }, [receipts]);

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

  // Generar reporte mensual
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

    // Agrupar por edificio manteniendo orden
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

      const propReceipts = monthReceipts.filter((r: any) => r?.property === prop?.name);
      const tenant = tenants?.find((t: any) => t?.propertyId === prop?.id);

      if (propReceipts.length > 0 || tenant) {
        const receipt = propReceipts[0];
        reportData[building].push({
          propertyName: prop?.name,
          tenantName: tenant?.name || '-',
          paidAmount: receipt?.paidAmount || 0,
          totalDue: receipt?.total || 0,
          debt: (receipt?.total || 0) - (receipt?.paidAmount || 0),
        });
      } else {
        reportData[building].push({
          propertyName: prop?.name,
          tenantName: '-',
          paidAmount: 0,
          totalDue: 0,
          debt: 0,
        });
      }
    });

    // Calcular totales
    let totalPaid = 0;
    let totalDue = 0;
    Object.values(reportData).forEach((items) => {
      items.forEach((item) => {
        totalPaid += item.paidAmount;
        totalDue += item.totalDue;
      });
    });

    return { reportMonth, reportYear, monthName, reportData, buildingOrder, totalPaid, totalDue };
  };

  const printReport = () => {
    const report = generateMonthlyReport();
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resumen Mensual ${report.monthName} ${report.reportYear}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header-info { display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; }
          .building-section { margin: 20px 0; page-break-inside: avoid; }
          .building-title { background-color: #e8e8e8; padding: 10px; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #ffff00; font-weight: bold; }
          .total-row { background-color: #ffff00; font-weight: bold; }
          .amount { text-align: right; }
          .footer { margin-top: 40px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RESUMEN MENSUAL</h1>
          <div class="header-info">
            <div>MES: <span>${report.monthName.toUpperCase()}</span></div>
            <div>AÑO: <span>${report.reportYear}</span></div>
          </div>
        </div>

        <table style="width: 100%; margin-bottom: 30px;">
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
      const color = getBuildingColor(building);
      const items = report.reportData[building];

      items.forEach((item, index) => {
        reportHTML += `
          <tr style="${index === 0 ? `background-color: ${color.light};` : ''}">
            ${index === 0 ? `<td rowspan="${items.length}" style="background-color: ${color.light}; font-weight: bold;">${building}</td>` : ''}
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
          <table style="width: 300px; margin-left: auto;">
            <tr class="total-row">
              <td style="background-color: #ffff00; font-weight: bold;">TOTAL</td>
              <td class="amount" style="background-color: #ffff00; font-weight: bold;">${report.totalPaid.toLocaleString()}</td>
              <td class="amount" style="background-color: #ffff00; font-weight: bold;">${(report.totalDue - report.totalPaid).toLocaleString()}</td>
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
            <div id="report-content" className="bg-white">
              {(() => {
                const report = generateMonthlyReport();
                return (
                  <>
                    {/* Header */}
                    <div className="text-center mb-6 pb-6 border-b-2 border-gray-800">
                      <h1 className="text-2xl font-bold">RESUMEN MENSUAL</h1>
                      <div className="flex justify-center gap-12 mt-3 font-bold">
                        <div>MES <span className="block text-lg">{report.monthName.toUpperCase()}</span></div>
                        <div>AÑO <span className="block text-lg">{report.reportYear}</span></div>
                      </div>
                    </div>

                    {/* Buildings Table */}
                    <div className="overflow-x-auto mb-6">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr style={{ backgroundColor: '#ffff00' }}>
                            <th className="border border-gray-300 px-4 py-2 text-left font-bold">Edificio</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-bold">Inquilino</th>
                            <th className="border border-gray-300 px-4 py-2 text-left font-bold">Propiedad</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-bold">PAGO</th>
                            <th className="border border-gray-300 px-4 py-2 text-right font-bold">DEBE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.buildingOrder.map((building) => {
                            const color = getBuildingColor(building);
                            const items = report.reportData[building];
                            return items.map((item, idx) => (
                              <tr
                                key={`${building}-${idx}`}
                                style={{
                                  backgroundColor: idx === 0 ? color.light : 'white',
                                }}
                              >
                                {idx === 0 && (
                                  <td
                                    rowSpan={items.length}
                                    className={`border border-gray-300 px-4 py-2 font-bold ${color.text}`}
                                    style={{ backgroundColor: color.light }}
                                  >
                                    {building}
                                  </td>
                                )}
                                <td className="border border-gray-300 px-4 py-2">{item.tenantName}</td>
                                <td className="border border-gray-300 px-4 py-2">{item.propertyName}</td>
                                <td className="border border-gray-300 px-4 py-2 text-right">{item.paidAmount.toLocaleString()}</td>
                                <td className="border border-gray-300 px-4 py-2 text-right">{item.debt.toLocaleString()}</td>
                              </tr>
                            ));
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end mb-6">
                      <table className="w-80 border-collapse">
                        <tbody>
                          <tr style={{ backgroundColor: '#ffff00' }}>
                            <td className="border border-gray-300 px-4 py-2 font-bold">TOTAL</td>
                            <td className="border border-gray-300 px-4 py-2 text-right font-bold">{report.totalPaid.toLocaleString()}</td>
                            <td className="border border-gray-300 px-4 py-2 text-right font-bold">{(report.totalDue - report.totalPaid).toLocaleString()}</td>
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