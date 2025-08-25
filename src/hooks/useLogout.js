import { useDispatch } from 'react-redux';
import { resetDashboard } from '../store/slices/dashboardSlice';
import { resetDrawings } from '../store/slices/drawingsSlice';
//import { resetHeader } from '../store/slices/headerSlice';
import { resetTechnologiesPrefix } from '../store/slices/technologiesPrefixSlice';
import { resetTechnologies } from '../store/slices/technologiesSlice';
import { resetUnsavedChanges } from '../store/slices/unsavedChangesSlice';
import { resetUsers } from '../store/slices/usersSlice';
import { resetProducts } from '../store/slices/productsSlice';
import { resetAdmin } from '../store/slices/adminSlice';

export const useLogout = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(resetDashboard());
    dispatch(resetDrawings());
    //dispatch(resetHeader());
    dispatch(resetTechnologiesPrefix());
    dispatch(resetTechnologies());
    dispatch(resetUnsavedChanges());
    dispatch(resetUsers());
    dispatch(resetProducts());
    dispatch(resetAdmin());
  };
};