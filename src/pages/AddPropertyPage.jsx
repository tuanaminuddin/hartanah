import { useRef, useState } from 'react';
import { CircleDollarSign, PlusCircle, Trash2 } from 'lucide-react';
import {
  createSalesCalculatorRow,
  createSalesCalculatorBuyerType,
  defaultSalesCalculator,
  formatMoney,
  getFileType,
  getSalesCalculatorResults,
  getSalesCalculatorBuyerTypes,
  MalaysiaLocationInput,
  PageHeader,
  PermissionNotice,
  ProjectImagePreviews,
  RichTextEditor,
  statuses,
  toAmount,
} from '../components/shared.jsx';

const createSalesCalculator = () => ({
  ...JSON.parse(JSON.stringify(defaultSalesCalculator)),
  calculatorId: `calculator-${Date.now()}-${Math.random().toString(36).slice(2)}`,
});

export default function AddPropertyPage({ isAdmin, onSave, propertyRecords = [] }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    price: '',
    status: 'Available',
    developer: '',
    remarks: '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [salesPackages, setSalesPackages] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [salesCalculators, setSalesCalculators] = useState(() => [createSalesCalculator()]);
  const salesPackageInput = useRef(null);
  const projectImagesInput = useRef(null);
  const locations = propertyRecords.map((property) => property.location);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateCalculatorAt = (calculatorIndex, updater) => {
    setSalesCalculators((current) => current.map((calculator, index) => (
      index === calculatorIndex ? updater(calculator) : calculator
    )));
  };
  const updateSalesCalculator = (calculatorIndex, field, value) => {
    updateCalculatorAt(calculatorIndex, (current) => ({ ...current, [field]: value }));
  };
  const updateSalesCalculatorColumn = (calculatorIndex, group, column, value) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      [group]: { ...current[group], [column]: value },
    }));
  };
  const updateRebateRowMeta = (calculatorIndex, rowId, field, value) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }));
  };
  const updateRebateRow = (calculatorIndex, rowId, field, value) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value } }
          : row
      )),
    }));
  };
  const addRebateRow = (calculatorIndex) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      rebateRows: [...current.rebateRows, createSalesCalculatorRow(current.buyerTypes)],
    }));
  };
  const addBuyerType = (calculatorIndex) => {
    const buyerType = createSalesCalculatorBuyerType();
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      buyerTypes: [...getSalesCalculatorBuyerTypes(current), buyerType],
      spaPrices: { ...current.spaPrices, [buyerType.id]: '' },
      rebateRows: current.rebateRows.map((row) => ({
        ...row,
        values: { ...row.values, [buyerType.id]: '' },
      })),
    }));
  };
  const updateBuyerType = (calculatorIndex, buyerTypeId, label) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      buyerTypes: getSalesCalculatorBuyerTypes(current).map((buyerType) => (
        buyerType.id === buyerTypeId ? { ...buyerType, label } : buyerType
      )),
    }));
  };
  const removeBuyerType = (calculatorIndex, buyerTypeId) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      buyerTypes: getSalesCalculatorBuyerTypes(current).filter((buyerType) => buyerType.id !== buyerTypeId),
    }));
  };
  const removeRebateRow = (calculatorIndex, rowId) => {
    updateCalculatorAt(calculatorIndex, (current) => ({
      ...current,
      rebateRows: current.rebateRows.filter((row) => row.id !== rowId),
    }));
  };
  const addSalesCalculator = () => {
    setSalesCalculators((current) => [...current, createSalesCalculator()]);
  };
  const removeSalesCalculator = (calculatorIndex) => {
    setSalesCalculators((current) => current.filter((_, index) => index !== calculatorIndex));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setIsSaving(true);
    try {
      if (salesPackages.length > 10) {
        throw new Error('Upload no more than 10 sales package files.');
      }

      if (salesPackages.some((salesPackage) => salesPackage.size > 20 * 1024 * 1024)) {
        throw new Error('Each sales package file must be 20 MB or smaller.');
      }

      if (salesPackages.reduce((total, salesPackage) => total + salesPackage.size, 0) > 50 * 1024 * 1024) {
        throw new Error('Sales package files must be 50 MB or smaller combined.');
      }

      const salesPackageData = await Promise.all(salesPackages.map((salesPackage) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: salesPackage.name,
          type: getFileType(salesPackage),
          data: String(reader.result).split(',')[1],
        });
        reader.onerror = () => reject(new Error(`Unable to read ${salesPackage.name}.`));
        reader.readAsDataURL(salesPackage);
      })));

      if (projectImages.length > 10) {
        throw new Error('Upload no more than 10 project images.');
      }

      if (projectImages.some((image) => image.size > 5 * 1024 * 1024)) {
        throw new Error('Each project image must be 5 MB or smaller.');
      }

      if (projectImages.reduce((total, image) => total + image.size, 0) > 20 * 1024 * 1024) {
        throw new Error('Project images must be 20 MB or smaller combined.');
      }

      const projectImageData = await Promise.all(projectImages.map((image) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          name: image.name,
          type: image.type,
          data: String(reader.result).split(',')[1],
        });
        reader.onerror = () => reject(new Error(`Unable to read ${image.name}.`));
        reader.readAsDataURL(image);
      })));

      await onSave({
        ...form,
        agent: form.developer,
        projectImages: projectImageData,
        salesPackages: salesPackageData,
        salesPackageCalculator: salesCalculators,
      });
      setForm({ name: '', location: '', price: '', status: 'Available', developer: '', remarks: '' });
      setSalesPackages([]);
      setProjectImages([]);
      setSalesCalculators([createSalesCalculator()]);
      if (salesPackageInput.current) salesPackageInput.current.value = '';
      if (projectImagesInput.current) projectImagesInput.current.value = '';
      setMessage('Property saved successfully.');
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Add Property"
        description="Capture a new listing before it moves into review and publication."
      />
      <PermissionNotice isAdmin={isAdmin} />
      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Project Name</span>
            <input
              disabled={!isAdmin}
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Project Name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Location</span>
            <MalaysiaLocationInput
              id="add-property-location"
              disabled={!isAdmin}
              value={form.location}
              onChange={(value) => updateField('location', value)}
              locations={locations}
              placeholder="Search area e.g. Klang, Cyberjaya"
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Starting Price</span>
            <input
              disabled={!isAdmin}
              type="number"
              value={form.price}
              onChange={(event) => updateField('price', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Starting Price"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Status</span>
            <select
              disabled={!isAdmin}
              value={form.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Developer</span>
            <input
              disabled={!isAdmin}
              value={form.developer}
              onChange={(event) => updateField('developer', event.target.value)}
              className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Developer"
              required
            />
          </label>
          <div className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Notes</span>
            <RichTextEditor
              disabled={!isAdmin}
              value={form.remarks}
              onChange={(value) => updateField('remarks', value)}
              placeholder="Add any project notes here. Paste a full web link (https://...) to make it clickable in Property Details."
            />
            <span className="mt-1 block text-xs text-slate-500">Notes are only shown after an agent opens Property Details.</span>
          </div>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Project Images</span>
            <input
              ref={projectImagesInput}
              disabled={!isAdmin}
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setProjectImages(Array.from(event.target.files || []))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600 disabled:cursor-not-allowed"
            />
            <span className="mt-1 block text-xs text-slate-500">Upload up to 10 images, maximum 5 MB each and 20 MB combined.</span>
            {projectImages.length > 0 && <ProjectImagePreviews images={projectImages} />}
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">Sales Package</span>
            <input
              ref={salesPackageInput}
              disabled={!isAdmin}
              type="file"
              multiple
              onChange={(event) => setSalesPackages(Array.from(event.target.files || []))}
              className="mt-2 block w-full rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-950 file:px-4 file:py-3 file:font-semibold file:text-white hover:file:bg-emerald-600 disabled:cursor-not-allowed"
            />
            <span className="mt-1 block text-xs text-slate-500">Upload up to 10 files, maximum 20 MB each and 50 MB combined.</span>
            {salesPackages.length > 0 && (
              <ul className="mt-2 space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                {salesPackages.map((salesPackage) => <li key={`${salesPackage.name}-${salesPackage.size}`}>{salesPackage.name}</li>)}
                <li className="text-emerald-700">Selected for save. Click Save Property to upload.</li>
              </ul>
            )}
          </label>
          {salesCalculators.map((salesCalculator, calculatorIndex) => {
            const salesCalculatorResults = getSalesCalculatorResults(salesCalculator);
            const buyerTypes = getSalesCalculatorBuyerTypes(salesCalculator);
            return (
          <section key={salesCalculator.calculatorId || calculatorIndex} className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <CircleDollarSign size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">
                    Sales Package Calculator {salesCalculators.length > 1 ? calculatorIndex + 1 : ''}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Build the package from SPA price and your own rebate or incentive selections.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:w-44">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500">Simulation</span>
                  <input
                    disabled={!isAdmin}
                    value={salesCalculator.simulationName}
                    onChange={(event) => updateSalesCalculator(calculatorIndex, 'simulationName', event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="20x60"
                  />
                </label>
                {salesCalculators.length > 1 && (
                  <button
                    disabled={!isAdmin}
                    type="button"
                    onClick={() => removeSalesCalculator(calculatorIndex)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                    Remove Calculator
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200 bg-white">
              <table className="min-w-[720px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
                    <th className="w-64 bg-white px-3 py-2 text-left">Buyer Type</th>
                    {buyerTypes.map((buyerType) => (
                      <th key={buyerType.id} className="bg-emerald-100 px-2 py-2">
                        <div className="flex min-w-40 items-center gap-2">
                          <input
                            disabled={!isAdmin}
                            value={buyerType.label}
                            onChange={(event) => updateBuyerType(calculatorIndex, buyerType.id, event.target.value)}
                            className="h-9 w-full rounded-md border border-emerald-200 bg-white px-2 text-center text-xs font-bold text-emerald-950 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-500"
                            placeholder="Buyer type"
                            aria-label="Buyer type name"
                          />
                          <button
                            disabled={!isAdmin || buyerTypes.length === 1}
                            type="button"
                            onClick={() => removeBuyerType(calculatorIndex, buyerType.id)}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-emerald-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${buyerType.label || 'buyer type'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-2 py-2">
                        <input
                          disabled={!isAdmin}
                          type="number"
                          value={salesCalculator.spaPrices[buyerType.id] || ''}
                          onChange={(event) => updateSalesCalculatorColumn(calculatorIndex, 'spaPrices', buyerType.id, event.target.value)}
                          className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                        />
                      </td>
                    ))}
                  </tr>
                  {salesCalculator.rebateRows.map((row) => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">
                        <div className="grid grid-cols-[1fr_4.5rem_2.25rem] items-center gap-2">
                          <input
                            disabled={!isAdmin}
                            value={row.label}
                            onChange={(event) => updateRebateRowMeta(calculatorIndex, row.id, 'label', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            placeholder="Selection name"
                          />
                          <select
                            disabled={!isAdmin}
                            value={row.type}
                            onChange={(event) => updateRebateRowMeta(calculatorIndex, row.id, 'type', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            aria-label={`${row.label || 'Selection'} type`}
                          >
                            <option value="percent">%</option>
                            <option value="amount">RM</option>
                          </select>
                          <button
                            disabled={!isAdmin || salesCalculator.rebateRows.length === 1}
                            type="button"
                            onClick={() => removeRebateRow(calculatorIndex, row.id)}
                            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${row.label || 'selection'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                      {buyerTypes.map((buyerType) => {
                        const rowValue = toAmount(row.values?.[buyerType.id]);
                        const rowAmount = salesCalculatorResults[buyerType.id].rebates[row.id];
                        return (
                          <td key={buyerType.id} className="px-2 py-2">
                            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                              <input
                                disabled={!isAdmin}
                                type="number"
                                step="0.01"
                                value={row.values?.[buyerType.id] || ''}
                                onChange={(event) => updateRebateRow(calculatorIndex, row.id, buyerType.id, event.target.value)}
                                className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-right text-xs font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                              />
                              <span className="text-right text-xs font-semibold text-slate-700">
                                {rowValue ? formatMoney(rowAmount) : '-'}
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="px-3 py-2 font-bold text-slate-950">Total Rebates</td>
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-3 py-2 text-right font-bold text-slate-950">
                        {formatMoney(salesCalculatorResults[buyerType.id].totalRebates)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
                    {buyerTypes.map((buyerType) => (
                      <td key={buyerType.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                        {formatMoney(salesCalculatorResults[buyerType.id].netBuyerPrice)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex flex-wrap justify-start gap-2">
              <button
                disabled={!isAdmin}
                type="button"
                onClick={() => addBuyerType(calculatorIndex)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <PlusCircle size={16} />
                Add Buyer Type
              </button>
              <button
                disabled={!isAdmin}
                type="button"
                onClick={() => addRebateRow(calculatorIndex)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <PlusCircle size={16} />
                Add Selection
              </button>
            </div>
          </section>
            );
          })}
          <div className="md:col-span-2 flex justify-center">
            <button
              disabled={!isAdmin}
              type="button"
              onClick={addSalesCalculator}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 text-sm font-bold text-amber-900 transition hover:border-amber-400 hover:bg-amber-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <PlusCircle size={17} />
              Add Another Sales Package Calculator
            </button>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className={`text-sm font-semibold ${message.includes('successfully') ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
          <button
            disabled={!isAdmin || isSaving}
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            <PlusCircle size={17} />
            {isSaving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </form>
    </>
  );
}

