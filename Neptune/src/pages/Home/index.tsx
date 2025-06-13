import { AppBar } from '../../components/AppBar';
import { DashboardHeader } from '../../components/Dashboard';
import { Sidebar } from '../../components/SideBar';

export const Home = () => {
    const handleNewTab = () => {};
    const handleCloseTab = () => {};
    const handleInitRepo = () => {};
    const handleCloneRepo = () => {};
    const handleSignIn = () => {};
    const handleAddRepository = () => {};
    return (
        <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0">
            <div className="flex h-full">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                    <DashboardHeader onAddRepository={handleAddRepository} />
                    <div className="flex-1 relative">
                        <div className="absolute inset-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
