import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiClient } from '../utils/api';
import { Package, Truck, Plus, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Inventory = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // Item Form State
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Medicine');
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('Box');
  const [minAlert, setMinAlert] = useState('10');
  const [expiry, setExpiry] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');

  // Supplier Form State
  const [supName, setSupName] = useState('');
  const [supPerson, setSupPerson] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');

  // Restock State
  const [restockItem, setRestockItem] = useState(null);
  const [restockQty, setRestockQty] = useState('');

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const invData = await apiClient('/inventory');
      setInventory(invData.inventory);

      const supData = await apiClient('/inventory/suppliers');
      setSuppliers(supData.suppliers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      const selectedSupObj = suppliers.find((s) => s._id === selectedSupplier);
      await apiClient('/inventory', {
        body: {
          itemName,
          type: itemType,
          quantity: Number(qty),
          unit,
          minQuantityAlert: Number(minAlert),
          expiryDate: expiry || undefined,
          supplier: selectedSupplier || undefined,
          supplierContact: selectedSupObj ? selectedSupObj.contactNumber : undefined,
        },
      });
      setShowItemModal(false);
      resetItemForm();
      loadInventoryData();
    } catch (err) {
      alert(err || 'Failed to create item');
    }
  };

  const resetItemForm = () => {
    setItemName('');
    setItemType('Medicine');
    setQty('');
    setUnit('Box');
    setMinAlert('10');
    setExpiry('');
    setSelectedSupplier('');
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await apiClient('/inventory/suppliers', {
        body: {
          name: supName,
          contactPerson: supPerson,
          email: supEmail || undefined,
          contactNumber: supPhone,
          address: supAddress || undefined,
        },
      });
      setShowSupplierModal(false);
      resetSupplierForm();
      loadInventoryData();
    } catch (err) {
      alert(err || 'Failed to register supplier');
    }
  };

  const resetSupplierForm = () => {
    setSupName('');
    setSupPerson('');
    setSupEmail('');
    setSupPhone('');
    setSupAddress('');
  };

  const handleRestock = async (e) => {
    e.preventDefault();
    try {
      const updatedQty = restockItem.quantity + Number(restockQty);
      await apiClient(`/inventory/${restockItem._id}`, {
        method: 'PUT',
        body: { quantity: updatedQty },
      });
      setRestockItem(null);
      setRestockQty('');
      loadInventoryData();
    } catch (err) {
      alert(err || 'Failed to update stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-white">Inventory & Resources</h1>
          <p className="text-sm text-slate-500">Track dental materials, medicines stock counts, and supplier records</p>
        </div>
        {(user?.role === 'Admin' || user?.role === 'Dental Assistant') && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowSupplierModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Truck size={14} />
              <span>Add Supplier</span>
            </button>
            <button
              onClick={() => setShowItemModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
            >
              <Plus size={14} />
              <span>Add Stock Item</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'items'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Package size={16} />
          <span>Dental Materials & Medicines</span>
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'suppliers'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Truck size={16} />
          <span>Suppliers List</span>
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
        </div>
      ) : activeTab === 'items' ? (
        /* Render Inventory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const isLow = item.quantity <= item.minQuantityAlert;
            return (
              <div 
                key={item._id} 
                className={`glass-panel rounded-2xl p-5 border shadow-sm relative overflow-hidden flex flex-col justify-between h-44 ${
                  isLow ? 'border-rose-500/20 bg-rose-500/5' : 'border-slate-100 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                      item.type === 'Medicine' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                      {item.type}
                    </span>
                    {isLow && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        <AlertTriangle size={12} /> Low Stock Alert
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-850 dark:text-white mt-2 leading-tight truncate">{item.itemName}</h3>
                  <p className="text-xs text-slate-400 mt-1">Vendor: {item.supplier?.name || 'General Stock'}</p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3 mt-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-450 uppercase font-semibold">In Stock</span>
                    <p className={`text-base font-extrabold ${isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-white'}`}>
                      {item.quantity} {item.unit}s
                    </p>
                  </div>
                  
                  {(user.role === 'Admin' || user.role === 'Dental Assistant') && (
                    <button
                      onClick={() => setRestockItem(item)}
                      className="flex items-center gap-1 font-bold text-brand-500 hover:text-brand-600 hover:underline"
                    >
                      <RefreshCw size={13} />
                      <span>Restock</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Render Suppliers list */
        <div className="glass-panel overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-semibold text-xs border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Supplier Name</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
                {suppliers.map((sup) => (
                  <tr key={sup._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-white">{sup.name}</td>
                    <td className="px-6 py-4">{sup.contactPerson}</td>
                    <td className="px-6 py-4">{sup.contactNumber}</td>
                    <td className="px-6 py-4">{sup.email || 'N/A'}</td>
                    <td className="px-6 py-4 max-w-xs truncate">{sup.address || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Stock Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Add Material / Drug to Inventory</h3>
            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lidocaine 2% cartridges"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Type *</label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Medicine">Medicine</option>
                    <option value="Dental Material">Dental Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Supplier Vendor *</label>
                  <select
                    required
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((sup) => (
                      <option key={sup._id} value={sup._id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Initial Qty *</label>
                  <input
                    type="number"
                    required
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Unit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Box / Vial"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Min Stock *</label>
                  <input
                    type="number"
                    required
                    value={minAlert}
                    onChange={(e) => setMinAlert(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Expiry Date</label>
                <input
                  type="date"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowItemModal(false); resetItemForm(); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Supplier */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Register Supplier Vendor</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Supplier Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dental Care Supplies Corp"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Wallace"
                    value={supPerson}
                    onChange={(e) => setSupPerson(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 555-0199"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. orders@dentalcare.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Office Address</label>
                <input
                  type="text"
                  placeholder="100 Supply Road, Philadelphia, PA"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSupplierModal(false); resetSupplierForm(); }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Restock Quantity Adjustment */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Restock Item</h3>
            <p className="text-xs text-slate-400 mb-4">{restockItem.itemName} (Current: {restockItem.quantity} {restockItem.unit}s)</p>

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Additional Quantity *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 50"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-650 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
                >
                  Add Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
