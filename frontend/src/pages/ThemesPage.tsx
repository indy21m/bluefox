import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Palette, ArrowLeft } from 'lucide-react';
import ThemeEditor from '../components/theme-builder/ThemeEditor';

const ThemesPage = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen">
      <header className="header">
        <div className="container">
          <div className="logo">
            <span className="gradient-text text-2xl font-bold">🦊 BlueFox</span>
          </div>
          
          <div className="flex items-center gap-lg">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name || user?.email}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ marginBottom: '40px' }}>
          <Link to="/surveys">
            <button className="btn btn-secondary">
              <ArrowLeft size={20} />
              <span>Back to Surveys</span>
            </button>
          </Link>
        </div>

        <div style={{ marginBottom: '40px' }}>
          <div className="flex items-center gap-md" style={{ marginBottom: '16px' }}>
            <Palette size={32} className="text-primary" />
            <h1 className="h1">Survey Themes</h1>
          </div>
          <p className="text-lg text-gray-600">
            Customize the look and feel of your surveys with our theme editor
          </p>
        </div>

        <ThemeEditor inline={true} />
      </main>
    </div>
  );
};

export default ThemesPage;