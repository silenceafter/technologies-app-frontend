import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Box, 
  Button, 
  Chip,
  Checkbox,
  CircularProgress, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  IconButton, 
  Menu, 
  MenuItem, 
  SpeedDial, 
  SpeedDialIcon, 
  SpeedDialAction, 
  Stack, 
  TextField, 
  Typography 
} from '@mui/material';
import {  
  addItems,
  setSelectedItems, 
  setSelectedId,
  deleteSelectedItems,
  restoreItems, restoreItem,
  setCheckedItems,
  addTechnology,
  addOperation,
  deleteItems, deleteItem,
  selectCurrentItems
} from '../../../store/slices/technologiesSlice';

const TechnologiesTreeSpeedDial = () => {
    //стейты
    const [currentTechnology, setCurrentTechnology] = useState(null);
    const [currentOperation, setCurrentOperation] = useState(null);
    const [access, setAccess] = useState(false);
    const [actions, setActions] = useState([]); //по умолчанию разрешенных действий нет

    //селекторы
    const user = useSelector((state) => state.users.user);
    const currentItems = useSelector(selectCurrentItems);

    //эффекты
    useEffect(() => {
        if (currentItems.length > 0 && currentItems[0]) {
          setCurrentTechnology(currentItems[0]);
          setCurrentOperation(currentItems[1]);
        }
      }, [currentItems]);
    
    useEffect(() => {
    if (currentTechnology && user) {
        setAccess(currentTechnology?.GID == user?.groupId ? true : false);
        const userAccess = currentTechnology?.groupId == user?.GID ? true : false;
        actions.forEach(action => {
            if (!('access' in action)) {
                action.access = userAccess;
            } else {
                action.access = userAccess;
            }
        })

        /* 
        если GID совпадает с groupId значит есть права на редактирование
        если GID не совпадает => права на чтение, но есть права на создание технологий и др.  
        если GID равен null => права только на чтение
        */

        if (user?.GID) {
            //у пользователя есть права на редактирование (вообще)
            if (currentTechnology?.groupId == user?.GID) {
                //у пользователя есть права на редактирование этой технологии
                //действия для SpeedDial
                const actions = [
                    { icon: <AssignmentIcon />, name: 'add-technology', title: 'Добавить технологию' },
                    { icon: <FormatListNumberedIcon />, name: 'add-operation', title: 'Добавить операцию' },
                    { icon: <ContentCopyIcon />, name: 'copy', title: 'Копировать' },
                    { icon: <DeleteIcon />, name: 'delete', title: 'Удалить' },
                    { icon: <RestoreIcon />, name: 'restoreAll', title: 'Отменить удаление' },
                ];
            } else {
                //у пользователя нет прав на редактирование этой технологии
                const actions = [
                    { icon: <AssignmentIcon />, name: 'add-technology', title: 'Добавить технологию' },
                    { icon: <FormatListNumberedIcon />, name: 'add-operation', title: 'Добавить операцию' },
                    { icon: <ContentCopyIcon />, name: 'copy', title: 'Копировать' },
                    { icon: <DeleteIcon />, name: 'delete', title: 'Удалить' },
                    { icon: <RestoreIcon />, name: 'restoreAll', title: 'Отменить удаление' },
                ];
            }
        } else {
            //у пользователя права только на чтение, другие действия запрещены
        }

        

        //actions.filter(item => item.access === true);
    }    
    }, [user, currentTechnology]);
    //
    return (
        <>

        </>
    );
};

export default TechnologiesTreeSpeedDial;