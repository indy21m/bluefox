import { Link } from 'react-router-dom';
import { Header, Button, GlassCard } from '../components/common';

const HomePage = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      
      <main className="container" style={{ paddingTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="h1 gradient-text">🦊 BlueFox</h1>
          <p className="text-xl text-gray-600" style={{ margin: '20px 0' }}>
            Intelligent Survey Platform for ConvertKit Segmentation
          </p>
          <p className="text-lg text-gray-500">
            Create one-question-per-screen surveys that automatically segment your subscribers
          </p>
        </div>

        <div className="grid grid-responsive gap-lg">
          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Take a Survey</h3>
            <p style={{ marginBottom: '20px' }}>
              Experience our survey-taking flow designed for maximum engagement and completion rates.
            </p>
            <Link to="/survey/demo">
              <Button variant="primary">Try Demo Survey</Button>
            </Link>
          </GlassCard>

          <GlassCard>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Admin Dashboard</h3>
            <p style={{ marginBottom: '20px' }}>
              Create and manage surveys, view analytics, and configure ConvertKit integration.
            </p>
            <Link to="/admin">
              <Button variant="secondary">Admin Portal</Button>
            </Link>
          </GlassCard>

          <GlassCard dark>
            <h3 className="h3" style={{ marginBottom: '16px' }}>Key Features</h3>
            <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
              <li>One-question-per-screen surveys</li>
              <li>Auto-advance after 500ms</li>
              <li>Conditional logic engine</li>
              <li>Direct ConvertKit field mapping</li>
              <li>Professional analytics dashboard</li>
            </ul>
            <Button variant="success">Learn More</Button>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default HomePage;