import * as React from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import PermMediaOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActual';
import PublicIcon from '@mui/icons-material/Public';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import SettingsInputComponentIcon from '@mui/icons-material/SettingsInputComponent';
import TimerIcon from '@mui/icons-material/Timer';
import SettingsIcon from '@mui/icons-material/Settings';
import PhonelinkSetupIcon from '@mui/icons-material/PhonelinkSetup';
import EngineeringIcon from '@mui/icons-material/Engineering';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventIcon from '@mui/icons-material/Event';
import { useSafeReset } from '../hooks/useSafeReset';

const categories = [
  {
    id: 'Производство',
    children: [
      {
        id: 'Технологии',
        icon: <EngineeringIcon />,
        route: '/technologies',
      },      
    ],
  },
  {
    id: 'Система',
    children: [
      { 
        id: 'Администрирование', 
        icon: <AdminPanelSettingsIcon />, 
        route: '/admin/accounts',
      },
      { 
        id: 'Журнал событий', 
        icon: <EventIcon />, 
        route: '/admin/logs',
      },
    ],
  },
];

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
};

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
};

export default function Navigator(props) {
  const { ...other } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  //селекторы
  //хуки
  //const { safeResetAndExecute, ConfirmationDialog } = useSafeReset();

  //события
  /*const handleSafeNavigation = (route) => async () => {
    const confirmed = await safeResetAndExecute({
      title: 'Есть несохранённые изменения!',
      message: 'Вы хотите покинуть страницу? Все несохранённые изменения будут потеряны.'
    });

    //переход
    if (confirmed) {
      navigate(route);
    }
  };*/

  // Определяем, является ли текущая страница главной
  const isMainPageActive = location.pathname === '/dashboard';

  return (
    <Drawer variant="persistent" {...other}>
      <List disablePadding>
        <ListItem sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}>
          Навигация
        </ListItem>

        {/* Главная страница */}
        <ListItem sx={{ ...item, ...itemCategory }}>
          <ListItemButton 
            selected={isMainPageActive}
            sx={item} 
            /*onClick={handleSafeNavigation('/')}*/
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText>Главная страница</ListItemText>
          </ListItemButton>          
        </ListItem>

        {/* Другие страницы */}
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: '#101F33' }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: '#fff' }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, route }) => {
              // Определяем активный элемент на основе текущего URL
              const isActive = location.pathname === route;              
              return (
                <ListItem disablePadding key={childId}>
                  <ListItemButton 
                    selected={isActive} 
                    sx={item} 
                    /*onClick={handleSafeNavigation(route)}*/
                  >
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{childId}</ListItemText>
                  </ListItemButton>
                </ListItem>
              )
            })}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
        {/*ConfirmationDialog*/}
      </List>
    </Drawer>
  );
}