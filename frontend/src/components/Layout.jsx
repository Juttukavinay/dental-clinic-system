import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar />
      
      {/* Content wrapper shifted to make room for Sidebar */}
      <div className="pl-64">
        {/* Top Navbar */}
        <Navbar />
        
        {/* Primary Page Outlet */}
        <main className="pt-20 px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
