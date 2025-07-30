import { useConfirm } from './useConfirm';
import { useSelector } from 'react-redux';
import { useResetStates } from './useResetStates';

export const useSafeReset = () => {
  const { confirm, ConfirmationDialog } = useConfirm();
  const hasUnsavedChanges = useSelector(state => state.technologies.hasUnsavedChanges);
  const resetUserData = useResetStates();

  const safeReset = async (options) => {
    if (!hasUnsavedChanges) {  
      return true; // можно сбрасывать
    }

    const result = await confirm({
      title: 'Есть несохранённые изменения',
      message: 'Вы хотите сохранить перед сбросом?',
      ...options
    });
    return result === 'confirm'; // разрешить сброс
  };

  const safeResetAndExecute = async (options = {}) => {
    const confirmed = await safeReset(options);
    if (confirmed) {
      resetUserData(); // Выполняем сброс
      return true;
    }
    return false;
  };
  //
  return { 
    safeReset, 
    safeResetAndExecute,
    ConfirmationDialog 
  };
};