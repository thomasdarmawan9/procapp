import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestsAPI, vendorsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
    fetchVendors();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await requestsAPI.getAll(filter);
      setRequests(response.data);
      
      if (filter === '') {
        setAllRequests(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorsAPI.getAll();
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
    };
    return colors[status] || 'badge-default';
  };

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length,
    totalCost: allRequests.reduce((sum, r) => sum + r.total_cost, 0),
    approvedCost: allRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.total_cost, 0),
  };

  const vendorStats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    totalOrders: vendors.reduce((sum, v) => sum + (v.total_orders || 0), 0),
    totalSpent: vendors.reduce((sum, v) => sum + (v.total_spent || 0), 0),
    topVendors: vendors
      .sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))
      .slice(0, 3)
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Procurement Dashboard</h1>
        <Link to="/requests/new" className="btn-primary">+ Create New Request</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-header">
            <span className="stat-card-title">Total Requests</span>
            <div className="stat-card-icon">📋</div>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-change" style={{ color: '#6b7280' }}>
            All procurement requests
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending</span>
            <div className="stat-card-icon">⏳</div>
          </div>
          <div className="stat-card-value">{stats.pending}</div>
          <div className="stat-card-change" style={{ color: '#d97706' }}>
            Awaiting approval
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <span className="stat-card-title">Approved</span>
            <div className="stat-card-icon">✅</div>
          </div>
          <div className="stat-card-value">{stats.approved}</div>
          <div className="stat-card-change" style={{ color: '#059669' }}>
            Successfully approved
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-card-header">
            <span className="stat-card-title">Rejected</span>
            <div className="stat-card-icon">❌</div>
          </div>
          <div className="stat-card-value">{stats.rejected}</div>
          <div className="stat-card-change" style={{ color: '#dc2626' }}>
            Declined requests
          </div>
        </div>

        <div className="stat-card primary" style={{ gridColumn: 'span 2' }}>
          <div className="stat-card-header">
            <span className="stat-card-title">Total Value</span>
            <div className="stat-card-icon">💰</div>
          </div>
          <div className="stat-card-value">Rp {stats.totalCost.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="stat-card-change" style={{ color: '#6b7280' }}>
            Approved: Rp {stats.approvedCost.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {vendorStats.total > 0 && (
        <div className="vendor-analytics">
          <h2>🏢 Vendor Analytics</h2>
          <div className="vendor-stats-grid">
            <div className="vendor-stat-card">
              <div className="vendor-stat-icon">🏢</div>
              <div className="vendor-stat-content">
                <div className="vendor-stat-value">{vendorStats.total}</div>
                <div className="vendor-stat-label">Total Vendors</div>
              </div>
            </div>
            <div className="vendor-stat-card">
              <div className="vendor-stat-icon">✅</div>
              <div className="vendor-stat-content">
                <div className="vendor-stat-value">{vendorStats.active}</div>
                <div className="vendor-stat-label">Active Vendors</div>
              </div>
            </div>
            <div className="vendor-stat-card">
              <div className="vendor-stat-icon">📦</div>
              <div className="vendor-stat-content">
                <div className="vendor-stat-value">{vendorStats.totalOrders}</div>
                <div className="vendor-stat-label">Total Orders</div>
              </div>
            </div>
            <div className="vendor-stat-card">
              <div className="vendor-stat-icon">💰</div>
              <div className="vendor-stat-content">
                <div className="vendor-stat-value">Rp {vendorStats.totalSpent.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="vendor-stat-label">Total Spent</div>
              </div>
            </div>
          </div>
          {vendorStats.topVendors.length > 0 && (
            <div className="top-vendors">
              <h3>Top Vendors by Spending</h3>
              <div className="top-vendors-list">
                {vendorStats.topVendors.map((vendor, index) => (
                  <div key={vendor.ID} className="top-vendor-item">
                    <div className="vendor-rank">#{index + 1}</div>
                    <div className="vendor-info">
                      <div className="vendor-name">{vendor.name}</div>
                      <div className="vendor-category">{vendor.category}</div>
                    </div>
                    <div className="vendor-metrics">
                      <div className="vendor-metric">
                        <span className="metric-label">Orders:</span>
                        <span className="metric-value">{vendor.total_orders || 0}</span>
                      </div>
                      <div className="vendor-metric">
                        <span className="metric-label">Spent:</span>
                        <span className="metric-value">Rp {(vendor.total_spent || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="filter-section">
        <button
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          🔍 All Requests
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          ⏳ Pending ({stats.pending})
        </button>
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          ✅ Approved ({stats.approved})
        </button>
        <button
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          ❌ Rejected ({stats.rejected})
        </button>
      </div>

      {loading ? (
        <div className="loading">⏳ Loading requests...</div>
      ) : (
        <div className="requests-grid">
          {requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3>No requests found</h3>
              <p>
                {filter 
                  ? `No ${filter} requests at the moment`
                  : 'Start by creating your first procurement request'
                }
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <Link to={`/requests/${request.ID}`} key={request.ID} className="request-card">
                <div className="request-card-header">
                  <h3>{request.item_name}</h3>
                  <span className={`badge ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <p className="request-description">
                  {request.description || 'No description provided'}
                </p>
                <div className="request-details">
                  <div>
                    <span className="label">Quantity</span>
                    <strong>{request.quantity}</strong>
                  </div>
                  <div>
                    <span className="label">Unit Price</span>
                    <strong>Rp {request.unit_price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div>
                    <span className="label">Total Cost</span>
                    <strong style={{ color: '#6366f1' }}>Rp {request.total_cost.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div>
                    <span className="label">Requestor</span>
                    <strong>{request.requestor?.full_name}</strong>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
