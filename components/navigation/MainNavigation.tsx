import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Home,
  MessageSquare,
  BarChart3,
  Settings,
  User,
  LogOut,
  CreditCard,
  HelpCircle,
  Star,
  Zap,
  ChevronDown,
  FileText
} from 'lucide-react';
import { BiteBaseLogo } from '@/components/brand/BiteBaseLogo';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  requiresAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Templates', href: '/templates', icon: FileText, badge: 'New' },
  { label: 'Research', href: '/chat', icon: MessageSquare, requiresAuth: true },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Star, requiresAuth: true, badge: 'AI' },
  { label: 'Analytics', href: '/analytics', icon: BarChart3, requiresAuth: true, badge: 'New' },
  { label: 'Features', href: '/features', icon: Star },
  { label: 'Pricing', href: '/pricing', icon: CreditCard },
  { label: 'Support', href: '/support', icon: HelpCircle },
];


export function MainNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const logout = () => {
    // Implement logout functionality
    window.location.href = '/api/logout';
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const filteredNavItems = navigationItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-lg border-b border-border shadow-sm' 
            : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BiteBaseLogo 
                size="md" 
                onClick={() => handleNavigation('/')}
                className="cursor-pointer"
              />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {filteredNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => handleNavigation(item.href)}
                      className={`relative flex items-center space-x-2 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-primary/10'
                      }`}
                    >
                      <IconComponent size={16} />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* User Menu / Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 p-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{user?.firstName}</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
                      <Settings size={16} className="mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/billing')}>
                      <CreditCard size={16} className="mr-2" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/support')}>
                      <HelpCircle size={16} className="mr-2" />
                      Support
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleNavigation('/auth/signin')}>
                    Sign In
                  </Button>
                  <Button size="sm" onClick={() => handleNavigation('/auth/signup')}>
                    <Zap size={16} className="mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border lg:hidden"
          >
            <div className="container mx-auto px-4 py-6">
              <div className="space-y-4">
                {/* Navigation Items */}
                {filteredNavItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="lg"
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full justify-start space-x-3 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'hover:bg-primary/10'
                        }`}
                      >
                        <IconComponent size={20} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}

                {/* Mobile Auth Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredNavItems.length * 0.1 }}
                  className="pt-4 border-t border-border"
                >
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user?.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleNavigation('/settings')}
                        className="w-full justify-start space-x-3"
                      >
                        <Settings size={20} />
                        <span>Settings</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={logout}
                        className="w-full justify-start space-x-3 text-destructive hover:text-destructive"
                      >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handleNavigation('/auth/signin')}
                        className="w-full"
                      >
                        Sign In
                      </Button>
                      <Button
                        size="lg"
                        onClick={() => handleNavigation('/auth/signup')}
                        className="w-full"
                      >
                        <Zap size={20} className="mr-2" />
                        Get Started
                      </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16" />
    </>
  );
}

export default MainNavigation;
