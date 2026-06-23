import { useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Alert, Fade, Snackbar, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AskQuestion from './pages/AskQuestion';
import History from './pages/History';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContext } from './context/AppUiContext';

const theme = createTheme({
  palette: {
    primary: { main: '#2563EB', dark: '#1D4ED8', light: '#DBEAFE', contrastText: '#FFFFFF' },
    success: { main: '#22C55E' }, warning: { main: '#F59E0B' }, error: { main: '#EF4444' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    divider: '#E2E8F0'
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h4: { fontWeight: 750, letterSpacing: '-0.025em' },
    h5: { fontWeight: 750, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    button: { fontWeight: 650, textTransform: 'none' }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, minHeight: 40, boxShadow: 'none' }, contained: { '&:hover': { boxShadow: '0 5px 12px rgba(37,99,235,.20)' } } } },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(15,23,42,.03)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTextField: { defaultProps: { size: 'small' } }
  }
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return <Fade in timeout={160} key={location.pathname}><div>{children}</div></Fade>;
};

export default function App() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const toastApi = useMemo(() => ({ showToast: (message, severity = 'success') => setToast({ open: true, message, severity }) }), []);
  return (
    <ToastContext.Provider value={toastApi}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <PageTransition><Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/ask" element={<PrivateRoute><AskQuestion /></PrivateRoute>} />
              <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            </Routes></PageTransition>
            <Footer />
          </Router>
        </AuthProvider>
        <Snackbar open={toast.open} autoHideDuration={3200} onClose={() => setToast(current => ({ ...current, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
          <Alert severity={toast.severity} variant="filled" sx={{ width: '100%' }}>{toast.message}</Alert>
        </Snackbar>
      </ThemeProvider>
    </ToastContext.Provider>
  );
}
