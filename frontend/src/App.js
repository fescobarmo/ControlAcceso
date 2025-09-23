import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Usuarios from './components/usuarios/Usuarios';
import Propietarios from './components/propietarios/Propietarios';
import TestAPI from './components/usuarios/TestAPI';
import Visitas from './components/visitas/Visitas';
import VisitaExterna from './components/Visita_Externa/VisitaExterna';
import Bitacora from './components/bitacora/Bitacora';
import Residente from './components/residente/Residente';
import Enrolamiento from './components/enrolamiento/Enrolamiento';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/usuarios" element={
                <ProtectedRoute>
                  <Layout>
                    <Usuarios />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/propietarios" element={
                <ProtectedRoute>
                  <Layout>
                    <Propietarios />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/visitas" element={
                <ProtectedRoute>
                  <Layout>
                    <Visitas />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/visitas-externas" element={
                <ProtectedRoute>
                  <Layout>
                    <VisitaExterna />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/bitacora" element={
                <ProtectedRoute>
                  <Layout>
                    <Bitacora />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/residente" element={
                <ProtectedRoute>
                  <Layout>
                    <Residente />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route path="/enrolamiento" element={
                <ProtectedRoute>
                  <Layout>
                    <Enrolamiento />
                  </Layout>
                </ProtectedRoute>
              } />
              
              <Route 
                path="/test-api" 
                element={
                  <ProtectedRoute>
                    <Layout>
                      <TestAPI />
                    </Layout>
                  </ProtectedRoute>
                } 
              />
              
              
            </Routes>
          </div>
          </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
