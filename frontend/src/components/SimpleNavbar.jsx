import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

const SimpleNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                TaxPortal
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
              TaxPortal
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/dashboard">
                <Button 
                  variant={isActive('/dashboard') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
              <Link to="/documents">
                <Button 
                  variant={isActive('/documents') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Documents
                </Button>
              </Link>
              <Link to="/messages">
                <Button 
                  variant={isActive('/messages') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Messages
                </Button>
              </Link>
              <Link to="/invoices">
                <Button 
                  variant={isActive('/invoices') ? 'default' : 'ghost'}
                  size="sm"
                >
                  Invoices
                </Button>
              </Link>
              {user?.role === 'tax_professional' && (
                <>
                  <Link to="/invite-clients">
                    <Button 
                      variant={isActive('/invite-clients') ? 'default' : 'ghost'}
                      size="sm"
                    >
                      Invite Clients
                    </Button>
                  </Link>
                  <Link to="/email-integration">
                    <Button 
                      variant={isActive('/email-integration') ? 'default' : 'ghost'}
                      size="sm"
                    >
                      Email Sync
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user?.profile?.firstName} {user?.profile?.lastName}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {user?.role === 'tax_professional' ? 'Pro' : 'Client'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimpleNavbar;