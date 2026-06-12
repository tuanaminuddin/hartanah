import { useRef, useState } from 'react';
import { CircleDollarSign, PlusCircle, Trash2 } from 'lucide-react';
import {
  createSalesCalculatorRow,
  defaultSalesCalculator,
  formatMoney,
  getFileType,
  getSalesCalculatorResults,
  MalaysiaLocationInput,
  PageHeader,
  PermissionNotice,
  ProjectImagePreviews,
  salesPackageColumns,
  statuses,
  toAmount,
} from '../components/shared.jsx';
export default function AddPropertyPage({ isAdmin, onSave, propertyRecords = [] }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    price: '',
    status: 'Available',
    developer: '',
  });
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [salesPackages, setSalesPackages] = useState([]);
  const [projectImages, setProjectImages] = useState([]);
  const [salesCalculator, setSalesCalculator] = useState(defaultSalesCalculator);
  const salesPackageInput = useRef(null);
  const projectImagesInput = useRef(null);
  const locations = propertyRecords.map((property) => property.location);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const salesCalculatorResults = getSalesCalculatorResults(salesCalculator);
  const updateSalesCalculator = (field, value) => {
    setSalesCalculator((current) => ({ ...current, [field]: value }));
  };
  const updateSalesCalculatorColumn = (group, column, value) => {
    setSalesCalculator((current) => ({
      ...current,
      [group]: { ...current[group], [column]: value },
    }));
  };
  const updateRebateRowMeta = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId ? { ...row, [field]: value } : row
      )),
    }));
  };
  const updateRebateRow = (rowId, field, value) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.map((row) => (
        row.id === rowId
          ? { ...row, values: { ...row.values, [field]: value } }
          : row
      )),
    }));
  };
  const addRebateRow = () => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: [...current.rebateRows, createSalesCalculatorRow()],
    }));
  };
  const removeRebateRow = (rowId) => {
    setSalesCalculator((current) => ({
      ...current,
      rebateRows: current.rebateRows.filter((row) => row.id !== rowId),
    }));
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
        salesPackageCalculator: salesCalculator,
      });
      setForm({ name: '', location: '', price: '', status: 'Available', developer: '' });
      setSalesPackages([]);
      setProjectImages([]);
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
          <section className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50/50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                  <CircleDollarSign size={22} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-950">Sales Package Calculator</h2>
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
                    onChange={(event) => updateSalesCalculator('simulationName', event.target.value)}
                    className="mt-2 h-10 w-full rounded-lg border border-amber-200 bg-white px-3 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    placeholder="20x60"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-lg border border-amber-200 bg-white">
              <table className="min-w-[960px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-amber-200 text-center">
                    <th className="w-64 bg-white px-3 py-2 text-left text-xs font-bold uppercase text-slate-500">Lot Type</th>
                    <th colSpan="2" className="bg-emerald-100 px-3 py-2 font-bold text-emerald-950">Intermediate Lot</th>
                    <th colSpan="2" className="bg-sky-100 px-3 py-2 font-bold text-sky-950">End Lot</th>
                  </tr>
                  <tr className="border-b border-amber-200 text-center text-xs font-bold text-slate-600">
                    <th className="bg-white px-3 py-2 text-left">Buyer Type</th>
                    {salesPackageColumns.map((column) => (
                      <th key={column.id} className="px-3 py-2">{column.buyer}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-3 py-2 font-bold text-slate-700">SPA Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-2 py-2">
                        <input
                          disabled={!isAdmin}
                          type="number"
                          value={salesCalculator.spaPrices[column.id]}
                          onChange={(event) => updateSalesCalculatorColumn('spaPrices', column.id, event.target.value)}
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
                            onChange={(event) => updateRebateRowMeta(row.id, 'label', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            placeholder="Selection name"
                          />
                          <select
                            disabled={!isAdmin}
                            value={row.type}
                            onChange={(event) => updateRebateRowMeta(row.id, 'type', event.target.value)}
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none disabled:cursor-not-allowed disabled:text-slate-400 focus:border-emerald-400 focus:bg-white"
                            aria-label={`${row.label || 'Selection'} type`}
                          >
                            <option value="percent">%</option>
                            <option value="amount">RM</option>
                          </select>
                          <button
                            disabled={!isAdmin || salesCalculator.rebateRows.length === 1}
                            type="button"
                            onClick={() => removeRebateRow(row.id)}
                            className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Remove ${row.label || 'selection'}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                      {salesPackageColumns.map((column) => {
                        const rowValue = toAmount(row.values[column.id]);
                        const rowAmount = salesCalculatorResults[column.id].rebates[row.id];
                        return (
                          <td key={column.id} className="px-2 py-2">
                            <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2">
                              <input
                                disabled={!isAdmin}
                                type="number"
                                step="0.01"
                                value={row.values[column.id]}
                                onChange={(event) => updateRebateRow(row.id, column.id, event.target.value)}
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
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-2 text-right font-bold text-slate-950">
                        {formatMoney(salesCalculatorResults[column.id].totalRebates)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50">
                    <td className="px-3 py-3 font-bold text-emerald-950">Net to Buyer Price</td>
                    {salesPackageColumns.map((column) => (
                      <td key={column.id} className="px-3 py-3 text-right font-bold text-emerald-950">
                        {formatMoney(salesCalculatorResults[column.id].netBuyerPrice)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-start">
              <button
                disabled={!isAdmin}
                type="button"
                onClick={addRebateRow}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                <PlusCircle size={16} />
                Add Selection
              </button>
            </div>
          </section>
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

