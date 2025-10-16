import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestsAPI, approvalsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const RequestDetail = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approvalData, setApprovalData] = useState({ status: 'approved', comments: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await requestsAPI.getById(id);
      setRequest(response.data);
    } catch (error) {
      console.error('Failed to fetch request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    setSubmitting(true);
    try {
      await approvalsAPI.create(id, approvalData);
      fetchRequest();
      setApprovalData({ status: 'approved', comments: '' });
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  const canApprove = (user?.role === 'manager' || user?.role === 'director') && request?.status === 'pending';

  if (loading) {
    return <div className="loading">⏳ Loading request details...</div>;
  }

  if (!request) {
    return <div className="error-message">❌ Request not found</div>;
  }

  const statusIcon = {
    pending: '⏳',
    approved: '✅',
    rejected: '❌'
  };

  return (
    <div className="request-detail">
      <button onClick={() => navigate('/')} className="btn-back">← Back to Dashboard</button>
      
      <div className="detail-card">
        <div className="detail-header">
          <h1>📦 {request.item_name}</h1>
          <span className={`badge badge-${request.status}`}>
            {statusIcon[request.status]} {request.status}
          </span>
        </div>

        <div className="detail-section">
          <h2>📋 Request Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">📄 Description</span>
              <p>{request.description || 'No description provided'}</p>
            </div>
            <div className="info-item">
              <span className="label">🔢 Quantity</span>
              <p>{request.quantity}</p>
            </div>
            <div className="info-item">
              <span className="label">💵 Unit Price</span>
              <p>Rp {request.unit_price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="info-item">
              <span className="label">💰 Total Cost</span>
              <p style={{ fontSize: '1.3rem', color: '#6366f1', fontWeight: '700' }}>
                Rp {request.total_cost.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="info-item">
              <span className="label">👤 Requested By</span>
              <p>{request.requestor?.full_name} ({request.requestor?.role})</p>
            </div>
            <div className="info-item">
              <span className="label">📅 Submitted On</span>
              <p>{new Date(request.CreatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            {request.vendor && (
              <div className="info-item">
                <span className="label">🏢 Vendor</span>
                <p>{request.vendor.name} ({request.vendor.category})</p>
              </div>
            )}
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="label">📝 Justification</span>
              <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>
                {request.justification || 'No justification provided'}
              </p>
            </div>
          </div>
        </div>

        {request.approvals && request.approvals.length > 0 && (
          <div className="detail-section">
            <h2>📜 Approval History</h2>
            {request.approvals.map((approval) => (
              <div key={approval.ID} className="approval-item">
                <div className="approval-header">
                  <strong>
                    {approval.status === 'approved' ? '✅' : '❌'} {approval.approver?.full_name}
                  </strong>
                  <span className={`badge badge-${approval.status}`}>
                    {approval.status}
                  </span>
                </div>
                {approval.comments && (
                  <p className="approval-comments">💬 {approval.comments}</p>
                )}
                <p className="approval-date">
                  📅 {new Date(approval.approved_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {canApprove && (
          <div className="detail-section approval-section">
            <h2>✍️ Review Request</h2>
            <div className="form-group">
              <label>Decision</label>
              <select
                value={approvalData.status}
                onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
              >
                <option value="approved">✅ Approve</option>
                <option value="rejected">❌ Reject</option>
              </select>
            </div>
            <div className="form-group">
              <label>💬 Comments</label>
              <textarea
                value={approvalData.comments}
                onChange={(e) => setApprovalData({ ...approvalData, comments: e.target.value })}
                rows="4"
                placeholder="Add your review comments, feedback, or reasons for your decision..."
              />
            </div>
            <button onClick={handleApproval} disabled={submitting} className="btn-primary">
              {submitting ? '⏳ Submitting...' : '🚀 Submit Decision'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
