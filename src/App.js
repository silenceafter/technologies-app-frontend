import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { Home } from './pages/home';
import { NotFound } from './pages/notFound';
import { Dashboard } from './components/dashboard';
import { Grid, Paper, AppBar, Tabs, Tab, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';

function App() {
  return (
    <main>
      <Dashboard />
      <Routes>
        <Route path="/" exact component={Home} />
        <Route component={NotFound} />
      </Routes>
    </main> 
  );
}

export default App;
