import { useState, useEffect } from 'react';
import { vendorsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Vendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategory] = useState('');
  const [statusFilter, setStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    category: '',
    rating: 0,
    address: '',
    status: 'active',
    notes: ''
  });

  const categories = ['IT', 'Office Supplies', 'Services', 'Equipment', 'Furniture', 'Software', 'Other'];

  useEffect(() => {
    fetchVendors();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await vendorsAPI.getAll(params);
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorsAPI.update(editingVendor.ID, formData);
      } else {
        await vendorsAPI.create(formData);
      }
      fetchVendors();
      closeModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save vendor');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await vendorsAPI.delete(id);
      fetchVendors();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete vendor');
    }
  };

  const openModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setFormData({
        name: vendor.name,
        contact_person: vendor.contact_person,
        email: vendor.email,
        phone: vendor.phone || '',
        category: vendor.category,
        rating: vendor.rating || 0,
        address: vendor.address || '',
        status: vendor.status,
        notes: vendor.notes || ''
      });
    } else {
      setEditingVendor(null);
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        category: '',
        rating: 0,
        address: '',
        status: 'active',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVendor(null);
  };

  const getRatingStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  const canManageVendors = user?.role === 'manager' || user?.role === 'director';

  return (
    <div className="vendors-page">
      <div className="dashboard-header">
        <h1>🏢 Vendor Management</h1>
        {canManageVendors && (
          <button onClick={() => openModal()} className="btn-primary">+ Add Vendor</button>
        )}
      </div>

      <div className="filter-section">
        <input
          type="text"
          placeholder="🔍 Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={categoryFilter} onChange={(e) => setCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading vendors...</div>
      ) : (
        <div className="vendors-grid">
          {vendors.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <h3>No vendors found</h3>
              <p>Start by adding your first vendor</p>
            </div>
          ) : (
            vendors.map((vendor) => (
              <div key={vendor.ID} className="vendor-card">
                <div className="vendor-card-header">
                  <h3>{vendor.name}</h3>
                  <span className={`badge badge-${vendor.status === 'active' ? 'success' : 'default'}`}>
                    {vendor.status}
                  </span>
                </div>
                <div className="vendor-info">
                  <p><strong>👤 Contact:</strong> {vendor.contact_person}</p>
                  <p><strong>📧 Email:</strong> {vendor.email}</p>
                  {vendor.phone && <p><strong>📞 Phone:</strong> {vendor.phone}</p>}
                  <p><strong>📂 Category:</strong> {vendor.category}</p>
                  <p><strong>⭐ Rating:</strong> {getRatingStars(vendor.rating)}</p>
                  <p><strong>📦 Orders:</strong> {vendor.total_orders || 0}</p>
                  <p><strong>💰 Total Spent:</strong> Rp {(vendor.total_spent || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                {canManageVendors && (
                  <div className="vendor-actions">
                    <button onClick={() => openModal(vendor)} className="btn-secondary">✏️ Edit</button>
                    <button onClick={() => handleDelete(vendor.ID)} className="btn-danger">🗑️ Delete</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingVendor ? '✏️ Edit Vendor' : '➕ Add Vendor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingVendor ? '💾 Update' : '➕ Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
