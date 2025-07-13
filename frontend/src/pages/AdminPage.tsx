import { useAuth } from '../contexts/AuthContext';
import { useConvertKit } from '../contexts/ConvertKitContext';
import { Header, GlassCard, Button } from '../components/common';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const { user, logout } = useAuth();
  const { connectionStatus, customFields } = useConvertKit();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen w-full">
      <Header 
        showSearch 
        searchPlaceholder="Search surveys..." 
        rightContent={
          <div className="flex items-center gap-md">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        }
      />
      
      <main className="container" style={{ paddingTop: '40px', width: '100%' }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="h1" style={{ marginBottom: '8px' }}>Admin Dashboard</h1>
          <p className="text-lg text-gray-600">
            Manage your surveys and ConvertKit integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg" style={{ width: '100%' }}>
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Surveys</h3>
            <p style={{ marginBottom: '20px' }}>
              Create, edit, and manage your survey campaigns.
            </p>
            <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
              <Link to="/admin/surveys">
                <Button variant="primary">Create Survey</Button>
              </Link>
              <Link to="/admin/surveys">
                <Button variant="secondary">View All</Button>
              </Link>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>ConvertKit Integration</h3>
            <p style={{ marginBottom: '20px' }}>
              Configure API connection and field mappings.
            </p>
            <div className="flex items-center gap-sm" style={{ marginBottom: '15px' }}>
              <span className={`status-indicator ${connectionStatus === 'connected' ? 'connected' : 'disconnected'}`}></span>
              <span className="text-sm">
                {connectionStatus === 'connected' ? `Connected (${customFields.length} custom fields)` : 'Not Connected'}
              </span>
            </div>
            <Link to="/admin/convertkit">
              <Button variant="primary">Setup Integration</Button>
            </Link>
          </GlassCard>

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Analytics</h3>
            <p style={{ marginBottom: '20px' }}>
              View survey performance and completion rates.
            </p>
            <Link to="/admin/analytics">
              <Button variant="secondary">View Reports</Button>
            </Link>
          </GlassCard>

          <GlassCard dark>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Quick Stats</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Active Surveys:</span>
                <span className="font-bold">0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Responses:</span>
                <span className="font-bold">0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completion Rate:</span>
                <span className="font-bold">--</span>
              </div>
            </div>
            <Link to="/admin/analytics">
              <Button variant="success">View Details</Button>
            </Link>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;