import { useDispatch } from 'react-redux';
import { resetDashboard } from '../store/slices/dashboardSlice';
import { resetDrawings } from '../store/slices/drawingsSlice';
import { resetHeader } from '../store/slices/headerSlice';
import { resetTechnologiesPrefix } from '../store/slices/technologiesPrefixSlice';
import { resetTechnologies } from '../store/slices/technologiesSlice';
import { resetUnsavedChanges } from '../store/slices/unsavedChangesSlice';

export const useResetStates = () => {
  const dispatch = useDispatch();
  return () => {
    dispatch(resetDashboard());
    dispatch(resetDrawings());
    dispatch(resetHeader());
    dispatch(resetTechnologiesPrefix());
    dispatch(resetTechnologies());
    dispatch(resetUnsavedChanges());
  };
};