import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { MainPage } from './pages/MainPage/MainPage';
import { AccessDenied } from './pages/AccessDenied';
import { LoginPage } from './pages/LoginPage';
import { CrudPage } from './pages/CrudPage';
import ProtectedRoute from './ProtectedRoute';
import { Grid, Paper, AppBar, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

function App() {
  return (
    <Router>
      <CssBaseline />
      {/*<Container maxWidth="xs"> вернуть для dashboard*/}            
        <main>
          <Routes>
          <Route exact path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<MainPage page="dashboard" />} />
            <Route path="/technologies" element={<MainPage page="technologies" />} />
            <Route path="/admin/accounts" element={<MainPage page="admin/accounts" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/crud" element={<CrudPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
          </Routes>
        </main>
      {/*</Container>*/}
    </Router>
  );
}

export default App;
