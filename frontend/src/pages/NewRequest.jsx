import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestsAPI, vendorsAPI } from '../api/client';

const NewRequest = () => {
  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    justification: '',
    vendor_id: '',
  });
  const [vendors, setVendors] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll({ status: 'active' });
      setVendors(response.data);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = { ...formData };
      if (submitData.vendor_id === '') {
        delete submitData.vendor_id;
      } else {
        submitData.vendor_id = parseInt(submitData.vendor_id);
      }
      await requestsAPI.create(submitData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : name === 'unit_price' ? parseFloat(value) : value,
    }));
  };

  const totalCost = formData.quantity * formData.unit_price;

  return (
    <div className="new-request">
      <button onClick={() => navigate('/')} className="btn-back">← Back to Dashboard</button>
      <h1>📝 Create New Procurement Request</h1>
      {error && <div className="error-message">⚠️ {error}</div>}
      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label>📦 Item Name *</label>
          <input
            type="text"
            name="item_name"
            value={formData.item_name}
            onChange={handleChange}
            placeholder="e.g., Laptop, Office Supplies, Software License"
            required
          />
        </div>

        <div className="form-group">
          <label>📄 Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Provide detailed information about the item..."
          />
        </div>

        <div className="form-group">
          <label>🏢 Vendor (Optional)</label>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
          >
            <option value="">Select a vendor (optional)</option>
            {vendors.map((vendor) => (
              <option key={vendor.ID} value={vendor.ID}>
                {vendor.name} - {vendor.category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>🔢 Quantity *</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              placeholder="1"
              required
            />
          </div>

          <div className="form-group">
            <label>💵 Unit Price (Rp) *</label>
            <input
              type="number"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="total-cost">
          💰 Total Cost: Rp {totalCost.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div className="form-group">
          <label>📋 Justification</label>
          <textarea
            name="justification"
            value={formData.justification}
            onChange={handleChange}
            rows="5"
            placeholder="Explain why this procurement is needed, expected benefits, urgency, etc..."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '⏳ Submitting...' : '🚀 Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewRequest;
