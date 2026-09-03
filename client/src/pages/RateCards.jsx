import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { 
  Package, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  Loader2, 
  Wrench, 
  Sparkles,
  IndianRupee,
  Layers
} from 'lucide-react';

const PRESET_TEMPLATES = [
  { title: 'AC General Service & Coil Wash', category: 'service', defaultRate: 599, unit: 'service', gstRate: 18, description: 'Deep foam cleaning and filter wash' },
  { title: 'AC Gas Charging (R32 / R410A)', category: 'service', defaultRate: 1800, unit: 'service', gstRate: 18, description: 'Complete vacuum and refrigerant refill' },
  { title: 'Ceiling Fan Installation / Replacement', category: 'labor', defaultRate: 300, unit: 'piece', gstRate: 18, description: 'Fan hanging and wiring setup' },
  { title: 'Kitchen Sink / Drain Pipe Leak Repair', category: 'service', defaultRate: 450, unit: 'job', gstRate: 18, description: 'Pipe unclogging and connector seal' },
  { title: 'Geyser Thermostat & Heating Element Change', category: 'labor', defaultRate: 550, unit: 'service', gstRate: 18, description: 'Element swap and safety valve check' },
  { title: 'Single Phase MCB Switch 16A/32A', category: 'material', defaultRate: 220, unit: 'piece', gstRate: 18, description: 'Havells/Schneider modular MCB' },
  { title: 'PVC Flexible Waste Pipe 1.5 inch', category: 'material', defaultRate: 180, unit: 'piece', gstRate: 18, description: 'Heavy duty sink drain pipe' },
  { title: '4.0 MFD Motor Run Capacitor', category: 'material', defaultRate: 280, unit: 'piece', gstRate: 18, description: 'Capacitor for fan / water pump' }
];

export default function RateCards() {
  const token = useAuthStore((state) => state.token);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'service' | 'labor' | 'material'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'service',
    defaultRate: '',
    unit: 'unit',
    gstRate: 18,
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get('/api/rate-cards', { headers });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load rate cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({ title: '', category: 'service', defaultRate: '', unit: 'unit', gstRate: 18, description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      defaultRate: item.defaultRate,
      unit: item.unit || 'unit',
      gstRate: item.gstRate || 18,
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.defaultRate) return;
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (editingItem) {
        await axios.put(`/api/rate-cards/${editingItem._id}`, formData, { headers });
      } else {
        await axios.post('/api/rate-cards', formData, { headers });
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      alert('Failed to save rate card item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this catalog item?')) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`/api/rate-cards/${id}`, { headers });
      fetchItems();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleLoadPresets = async () => {
    if (!window.confirm('Load standard Indian trade presets (AC, Plumbing, Electrical, Materials) into your catalog?')) return;
    setSaving(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      for (const preset of PRESET_TEMPLATES) {
        await axios.post('/api/rate-cards', preset, { headers });
      }
      fetchItems();
    } catch (err) {
      alert('Failed to load presets');
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-text-primary flex items-center gap-2.5">
            <Package className="w-6 h-6 text-primary" />
            Rate Card & Services Catalog
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Pre-configure standard rates for your services, labor charges, and spare parts.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {items.length === 0 && (
            <button
              onClick={handleLoadPresets}
              disabled={saving}
              className="flex items-center gap-1.5 bg-navy-card hover:bg-navy-surface border border-primary/40 text-primary text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Trade Presets
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-orange-glow/20 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Catalog Item
          </button>
        </div>
      </div>

      {/* 2. Controls & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-navy-card p-1 border border-navy-border rounded-xl">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'service', label: 'Services' },
            { id: 'labor', label: 'Labor' },
            { id: 'material', label: 'Materials & Parts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full pl-10 pr-4 py-2 bg-navy-card border border-navy-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* 3. Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-navy-card rounded-card border border-navy-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-navy-card border border-navy-border rounded-card p-12 text-center flex flex-col items-center">
          <Package className="w-12 h-12 text-text-muted mb-3 opacity-40" />
          <h3 className="text-base font-bold text-text-primary">No items found</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            Add your services or materials to quickly populate invoice line items in 1-click.
          </p>
          <button
            onClick={handleLoadPresets}
            className="mt-4 flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Sparkles className="w-3.5 h-3.5" /> Auto-Load Common Trade Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="bg-navy-card border border-navy-border hover:border-primary/50 rounded-card p-4.5 flex flex-col justify-between gap-3 transition-all hover:shadow-lg group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.category === 'service' ? 'bg-primary/10 text-primary border border-primary/20' :
                    item.category === 'labor' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-navy-surface transition-colors"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item._id)}
                      className="p-1 rounded text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-text-primary mt-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-navy-border/60 pt-2.5">
                <div className="flex items-baseline gap-1 font-mono">
                  <span className="text-base font-black text-text-primary flex items-center">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {item.defaultRate.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-text-muted">/ {item.unit || 'unit'}</span>
                </div>

                <span className="text-[11px] font-semibold text-text-muted bg-navy-surface px-2 py-0.5 rounded-md border border-navy-border/50">
                  GST {item.gstRate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-primary/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-navy-card border border-navy-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-text-primary mb-1">
              {editingItem ? 'Edit Catalog Item' : 'Add Rate Card Item'}
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Configure standard item description, unit rate, and applicable GST.
            </p>

            <form onSubmit={handleSaveItem} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Item Title / Service Name *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. AC Gas Refill / Kitchen Sink Drain Repair"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="service">Service</option>
                    <option value="labor">Labor</option>
                    <option value="material">Material / Part</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Standard Rate (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.defaultRate}
                    onChange={(e) => setFormData({ ...formData, defaultRate: e.target.value })}
                    placeholder="450"
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">Billing Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="service">per service</option>
                    <option value="hour">per hour</option>
                    <option value="piece">per piece</option>
                    <option value="meter">per meter</option>
                    <option value="visit">per visit</option>
                    <option value="unit">per unit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-secondary block mb-1">GST Rate</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value={0}>0% (Nil)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Standard)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-text-secondary block mb-1">Description / Notes</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional details, brand recommendations, or scope of work"
                  className="w-full px-3 py-2 bg-navy-surface border border-navy-border rounded-xl text-xs text-text-primary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:bg-navy-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingItem ? 'Update Item' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
