import React from 'react';
import { 
  Brain, 
  Activity, 
  BarChart3, 
  Settings, 
  Timer,
  Home,
  Menu,
  X
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  isMobileMenuOpen,
  onMobileMenuToggle
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'monitor', label: 'Monitor', icon: Brain },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'interventions', label: 'Wellness', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    if (isMobileMenuOpen) {
      onMobileMenuToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-soft border border-calm-200 focus-ring"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-calm-700" /> : <Menu className="w-5 h-5 text-calm-700" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-xs"
          onClick={onMobileMenuToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - Now Fixed */}
      <nav 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-soft border-r border-calm-200 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed at top of sidebar */}
          <div className="flex items-center justify-center h-16 bg-gradient-to-r from-focus-600 to-focus-700 px-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <img 
                src="/BrainwaveShift.png" 
                alt="Brainwave Shift Logo" 
                className="h-10 w-auto"
              />
              <span className="text-white text-heading-4 font-semibold tracking-tight">Brainwave Shift</span>
            </div>
          </div>
          
          {/* Navigation Items - Scrollable if needed */}
          <div className="flex-1 mt-8 px-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-left focus-ring group
                      ${isActive
                        ? 'bg-focus-100 text-focus-700 border-l-4 border-focus-500 shadow-gentle'
                        : 'text-calm-600 hover:bg-calm-100 hover:text-calm-800'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-focus-600' : 'text-calm-500 group-hover:text-calm-700'
                    }`} />
                    <span className="text-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer - Fixed at bottom of sidebar */}
          <div className="p-4 flex-shrink-0">
            <div className="bg-gradient-to-r from-wellness-50 to-focus-50 rounded-xl p-4 border border-calm-200">
              <p className="text-label text-calm-800">Cognitive Enhancement</p>
              <p className="text-body-small text-calm-600 mt-1 leading-relaxed">
                AI-powered mental co-pilot for optimal performance
              </p>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};