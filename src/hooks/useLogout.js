import { useDispatch } from 'react-redux';
import { resetDashboard } from '../store/slices/dashboardSlice';
import { resetDrawings } from '../store/slices/drawingsSlice';
import { resetHeader } from '../store/slices/headerSlice';
import { resetNotifications } from '../store/slices/notificationsSlice';
import { resetOperations } from '../store/slices/operationsSlice';
import { resetTechnologiesPrefix } from '../store/slices/technologiesPrefixSlice';
import { resetTechnologies } from '../store/slices/technologiesSlice';
import { resetUnsavedChanges } from '../store/slices/unsavedChangesSlice';
import { resetUsers } from '../store/slices/usersSlice';

export const useLogout = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(resetDashboard());
    dispatch(resetDrawings());
    dispatch(resetHeader());
    dispatch(resetNotifications());
    dispatch(resetOperations());
    dispatch(resetTechnologiesPrefix());
    dispatch(resetTechnologies());
    dispatch(resetUnsavedChanges());
    dispatch(resetUsers());
  };
};