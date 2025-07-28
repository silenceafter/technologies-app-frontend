import React from 'react';
import { useMemo } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';

export const useAccessActions = ({ user, currentTechnology }) => {
  const ALL_ACTIONS = [
    { icon: <AssignmentIcon />, name: 'add-technology', title: 'Добавить технологию', roles: ['admin', 'task_admin', 'task_user'], needAccessCheck: false },
    { icon: <FormatListNumberedIcon />, name: 'add-operation', title: 'Добавить операцию', roles: ['admin', 'task_admin', 'task_user'], needAccessCheck: true },
    { icon: <ContentCopyIcon />, name: 'copy', title: 'Копировать', roles: ['admin', 'task_admin', 'task_user'], needAccessCheck: false },
    { icon: <DeleteIcon />, name: 'delete', title: 'Удалить', roles: ['admin', 'task_admin', 'task_user'], needAccessCheck: true },
    { icon: <RestoreIcon />, name: 'restore-all', title: 'Отменить удаление', roles: ['admin', 'task_admin', 'task_user'], needAccessCheck: true },
  ];

  return useMemo(() => {
    // Если нет пользователя — не показываем ничего
    if (!user) return [];

    // Проверка роли
    const isTaskUser = user.role === 'task_user';
    const hasAccessToTech = Boolean(currentTechnology?.hasAccess);

    return ALL_ACTIONS.filter(action => {
      if (!action.roles.includes(user.role)) return false;
      // task_user должен иметь доступ, если действие требует его проверки
      if (isTaskUser && action.needAccessCheck && !hasAccessToTech) {
        return false;
      }
      return true;
    });
  }, [user, currentTechnology]);
};