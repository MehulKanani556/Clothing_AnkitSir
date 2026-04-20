import './App.css';
import { Routes, Route } from 'react-router-dom';
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'Urbanist, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: { background: '#14372F', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#14372F' },
          },
          error: {
            style: { background: '#fff', color: '#1B1B1B', border: '1px solid #E9ECEF' },
          },
        }}
      />
      <Routes>
        {/* Admin sections starts with /admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        {/* Everything else belongs to UserRoutes */}
        <Route path="/*" element={<UserRoutes />} />
      </Routes>
    </>
  );
}


export default App;
