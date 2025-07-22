export interface DashboardHeaderProps {
  userName: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
}