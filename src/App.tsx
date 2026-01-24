import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute'; // Importar el componente de protección
import MainLayout from './components/layout/MainLayout';
import NotFound from './pages/NotFound';

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

        {/* RUTA COMODÍN GLOBAL - Captura TODAS las rutas no definidas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;