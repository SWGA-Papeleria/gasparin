import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/view/Dashboard';
import ProtectedRoute from './components/ProtectedRoute'; // 💥 Importar el componente de protección
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    // Cambiar HashRouter por BrowserRouter si se desea usar rutas limpias
     <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Solo si isAuthenticated es true, se renderizará el Dashboard */}
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          } 
        />      
        {/* Redirecciona la ruta raíz: si está autenticado, ir a dashboard, si no, a login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;