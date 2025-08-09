import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkMode';
import { toast } from 'react-toastify';

export function useHeaderLogic() {
  const { userName } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const onLogout = () => {
    window.dispatchEvent(new CustomEvent('logout'));
    toast.success('Sesión cerrada correctamente');
  };
  return {
    userName: userName ?? '',
    darkMode,
    onToggleDarkMode: toggleDarkMode,
    onLogout,
  };
}
