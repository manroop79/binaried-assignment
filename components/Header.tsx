'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, LogOut, Menu, X as CloseIcon, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { getImageUrl } from '@/lib/utils';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Button } from './ui/Button';

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/explore', icon: Search, label: 'Explore' },
    { href: user ? `/${user.username}` : '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {/* Top Bar with X, Sign in, Sign up */}
      <motion.div 
        className="sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-800/30 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-xl">𝕏</span>
            </motion.div>
          </Link>

          {/* Auth Buttons - Right Side */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated && user ? (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Link href={`/${user.username}`}>
                    <motion.div 
                      className="flex items-center space-x-2 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 rounded-full px-3 py-2 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getImageUrl(user.avatar)} alt={user.displayName} />
                        <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.displayName}</span>
                    </motion.div>
                  </Link>
                  <motion.button
                    onClick={logout}
                    className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                    title="Logout"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <LogOut size={20} />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <motion.button
                    onClick={() => handleAuthClick('login')}
                    className="px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-400 transition-all"
                    whileHover={{ 
                      color: 'rgb(255, 255, 255)',
                      textShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                    }}
                  >
                    Sign in
                  </motion.button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/30 transition-all group relative overflow-hidden"
                  >
                    <motion.span 
                      className="relative z-10 inline-block"
                      whileHover={{ 
                        scale: 1.05,
                        textShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      Sign up
                    </motion.span>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
            </motion.button>
        </div>
      </motion.div>

      {/* Tabs Section Below Top Bar - Centered */}
      <motion.nav 
        className="sticky top-16 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-800/30 z-40"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative flex-1 sm:flex-initial"
                >
                  <motion.div
                    className={`flex items-center justify-center space-x-2 px-3 sm:px-6 py-4 transition-colors ${
                      isActive
                        ? 'text-emerald-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    <span className="text-sm sm:text-base">{item.label}</span>
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-t-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-black/95 backdrop-blur-lg overflow-hidden"
          >
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <motion.div
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </motion.div>
                      </Link>
                    </motion.div>
                  );
                })}

                {isAuthenticated && user ? (
                  <motion.button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    whileTap={{ scale: 0.97 }}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </motion.button>
                ) : (
                  <motion.div
                    className="space-y-2 pt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all hover:text-white"
                      onClick={() => {
                        handleAuthClick('login');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign in
                    </button>
                    <button
                      className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold transition-all"
                      onClick={() => {
                        handleAuthClick('register');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign up
                    </button>
                  </motion.div>
                )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  );
}

