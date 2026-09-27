import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AppLayout = () => {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-gray-900 font-sans selection:bg-brand-500/30">
      <Navbar />
      <div className="flex-1 relative flex flex-col min-h-0">
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
