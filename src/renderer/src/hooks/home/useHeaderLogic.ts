import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkMode';

export function useHeaderLogic() {
  const { userName } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const onLogout = () => {
    window.dispatchEvent(new CustomEvent('logout'));
  };
  return {
    userName: userName ?? '',
    darkMode,
    onToggleDarkMode: toggleDarkMode,
    onLogout,
  };
}
