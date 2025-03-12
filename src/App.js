import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';
import { MainPage } from './pages/MainPage';
import { NotFound } from './pages/notFound';
import { LoginPage } from './pages/LoginPage';
import { CrudPage } from './pages/CrudPage';
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
            <Route index element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/crud" element={<CrudPage />} />
          </Routes>
        </main>
      {/*</Container>*/}
    </Router>
  );
}

export default App;
