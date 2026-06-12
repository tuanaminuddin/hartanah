import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatMoney, PageHeader, toAmount } from '../components/shared.jsx';
const monthlyInstallmentPackages = [
  {
    id: 'typeD',
    type: 'Type D',
    unit: 'T7-12-03',
    rooms: '3R 2B',
    carPark: 2,
    size: 958,
    spaPrice: 520800,
    discountPercent: 10,
    nett1: 468720,
    nett2Deduction: 15000,
    nett2: 453720,
    nett3Deduction: 6000,
    nett3: 447720,
  },
  {
    id: 'typeF',
    type: 'Type F',
    unit: 'T7-09-02',
    rooms: '3+1R 2B',
    carPark: 2,
    size: 1324,
    spaPrice: 654800,
    discountPercent: 10,
    nett1: 589320,
    nett2Deduction: 30000,
    nett2: 559320,
    nett3Deduction: 6000,
    nett3: 553320,
  },
];

const installmentScenarios = [
  { id: 'nett1', label: 'Nett (1)', field: 'nett1' },
  { id: 'nett2', label: 'Nett (2)', field: 'nett2' },
  { id: 'nett3', label: 'Nett (3)', field: 'nett3' },
];

const getMonthlyInstallment = (loanAmount, annualInterestRate, tenureYears) => {
  const principal = toAmount(loanAmount);
  const monthlyInterestRate = toAmount(annualInterestRate) / 100 / 12;
  const paymentCount = toAmount(tenureYears) * 12;

  if (!principal || !paymentCount) return 0;
  if (!monthlyInterestRate) return principal / paymentCount;

  return (principal * monthlyInterestRate) / (1 - ((1 + monthlyInterestRate) ** -paymentCount));
};

export default function MonthlyInstallmentPage() {
  const [interestRate, setInterestRate] = useState('4');
  const [loanTenure, setLoanTenure] = useState('35');
  const [packageInputs, setPackageInputs] = useState(monthlyInstallmentPackages);
  const [selectedPackageId, setSelectedPackageId] = useState(monthlyInstallmentPackages[0].id);
  const packages = packageInputs.map((item) => {
    const spaPrice = toAmount(item.spaPrice);
    const nett1 = spaPrice - (spaPrice * item.discountPercent / 100);
    const nett2 = nett1 - toAmount(item.nett2Deduction);
    const nett3 = nett2 - toAmount(item.nett3Deduction);

    return {
      ...item,
      spaPrice,
      nett1,
      nett2,
      nett3,
    };
  });
  const selectedPackage = packages.find((item) => item.id === selectedPackageId) || packages[0];
  const selectedMonthly = getMonthlyInstallment(selectedPackage.nett1, interestRate, loanTenure);
  const updatePackageSpaPrice = (packageId, value) => {
    setPackageInputs((currentPackages) => (
      currentPackages.map((item) => (
        item.id === packageId ? { ...item, spaPrice: value } : item
      ))
    ));
  };

  return (
    <>
      <PageHeader
        title="Monthly Installment"
        description="Sanderling installment guide based on the supplied Excel workbook."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Sanderling</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">Loan Installment Comparison</h2>
              <p className="mt-1 text-sm text-slate-500">Monthly values use the Excel PMT formula with editable rate and tenure.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Interest Rate</span>
                <div className="mt-2 grid h-10 grid-cols-[1fr_2rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={interestRate}
                    onChange={(event) => setInterestRate(event.target.value)}
                    className="min-w-0 border-0 bg-transparent px-3 text-sm font-bold text-slate-800 outline-none"
                    aria-label="Interest rate"
                  />
                  <span className="grid place-items-center text-sm font-bold text-slate-500">%</span>
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Loan Tenure</span>
                <div className="mt-2 grid h-10 grid-cols-[1fr_3.2rem] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus:ring-emerald-100">
                  <input
                    type="number"
                    min="1"
                    value={loanTenure}
                    onChange={(event) => setLoanTenure(event.target.value)}
                    className="min-w-0 border-0 bg-transparent px-3 text-sm font-bold text-slate-800 outline-none"
                    aria-label="Loan tenure"
                  />
                  <span className="grid place-items-center text-xs font-bold text-slate-500">years</span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-center">
                  <th className="w-48 bg-white px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Package</th>
                  {packages.map((item) => (
                    <th key={item.id} className="bg-amber-100 px-4 py-3 font-bold text-amber-950">{item.type}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Unit', render: (item) => item.unit },
                  { label: 'Type', render: (item) => item.rooms },
                  { label: 'Size (SQF)', render: (item) => item.size.toLocaleString('en-MY') },
                  { label: 'Car Park (S/S)', render: (item) => item.carPark },
                  {
                    label: 'SPA Price',
                    render: (item) => (
                      <div className="ml-auto grid h-10 max-w-44 grid-cols-[2.4rem_1fr] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 focus-within:border-emerald-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
                        <span className="grid place-items-center text-xs font-bold text-slate-500">RM</span>
                        <input
                          type="number"
                          min="0"
                          value={packageInputs.find((packageInput) => packageInput.id === item.id)?.spaPrice ?? ''}
                          onChange={(event) => updatePackageSpaPrice(item.id, event.target.value)}
                          className="min-w-0 border-0 bg-transparent px-2 text-right text-sm font-bold text-slate-950 outline-none"
                          aria-label={`${item.type} SPA price`}
                        />
                      </div>
                    ),
                    strong: true,
                  },
                  { label: '(-) 10%', render: (item) => `RM ${formatMoney(item.spaPrice * item.discountPercent / 100, 0)}` },
                  { label: 'Nett (1)', render: (item) => `RM ${formatMoney(item.nett1, 0)}`, highlight: true },
                  { label: '(-)', render: (item) => `RM ${formatMoney(item.nett2Deduction, 0)}` },
                  { label: 'Nett (2)', render: (item) => `RM ${formatMoney(item.nett2, 0)}`, highlight: true },
                  { label: '(-)', render: (item) => `RM ${formatMoney(item.nett3Deduction, 0)}` },
                  { label: 'Nett (3)', render: (item) => `RM ${formatMoney(item.nett3, 0)}`, highlight: true },
                  { label: 'RM 0.25 SQF', render: (item) => `RM ${formatMoney(item.size * 0.25, 2)}` },
                ].map((row) => (
                  <tr key={row.label} className={`border-b border-slate-100 ${row.highlight ? 'bg-emerald-50' : ''}`}>
                    <td className="px-4 py-3 font-bold text-slate-700">{row.label}</td>
                    {packages.map((item) => (
                      <td key={item.id} className={`px-4 py-3 text-right ${row.strong || row.highlight ? 'font-bold text-slate-950' : 'font-semibold text-slate-700'}`}>
                        {row.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <Calculator size={22} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-950">Quick Monthly</h2>
          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Package</span>
            <select
              value={selectedPackageId}
              onChange={(event) => setSelectedPackageId(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {packages.map((item) => (
                <option key={item.id} value={item.id}>{item.type} - {item.unit}</option>
              ))}
            </select>
          </label>
          <div className="mt-5 rounded-lg bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-300">Nett (1) Monthly</p>
            <p className="mt-2 text-3xl font-bold">RM {formatMoney(selectedMonthly, 2)}</p>
            <p className="mt-2 text-xs font-medium text-slate-300">Loan amount RM {formatMoney(selectedPackage.nett1, 0)}</p>
          </div>

          <div className="mt-5 space-y-3">
            {installmentScenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-slate-800">{scenario.label}</p>
                  <p className="text-xs text-slate-500">RM {formatMoney(selectedPackage[scenario.field], 0)}</p>
                </div>
                <p className="text-sm font-bold text-emerald-700">
                  RM {formatMoney(getMonthlyInstallment(selectedPackage[scenario.field], interestRate, loanTenure), 2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            <p className="font-bold">Free cost items</p>
            <p className="mt-1">SPA legal fee, SPA stamp duty, loan legal fee, and loan stamp duty.</p>
          </div>
        </aside>
      </section>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-bold text-slate-950">Monthly Breakdown</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 text-right font-bold">Loan Amount</th>
                <th className="px-4 py-3 text-right font-bold">Interest</th>
                <th className="px-4 py-3 text-right font-bold">Tenure</th>
                <th className="px-4 py-3 text-right font-bold">Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {packages.flatMap((item) => (
                installmentScenarios.map((scenario) => (
                  <tr key={`${item.id}-${scenario.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-950">{item.type} {scenario.label}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">RM {formatMoney(item[scenario.field], 0)}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{toAmount(interestRate)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600">{toAmount(loanTenure)} years</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      RM {formatMoney(getMonthlyInstallment(item[scenario.field], interestRate, loanTenure), 2)}
                    </td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

