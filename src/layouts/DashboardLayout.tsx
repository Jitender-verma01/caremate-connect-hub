
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useState } from "react";
import { 
  Bell, 
  Calendar, 
  Layout, 
  LogOut, 
  Menu, 
  User, 
  X,
  FileText,
  Search
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const DashboardLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar for desktop */}
        <Sidebar className="hidden md:flex">
          <SidebarHeader className="p-4 flex justify-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/fb497873-d154-4ea1-8f85-542123eda93d.png" 
                alt="CareMate Logo" 
                className="h-8 w-8" 
              />
              <span className="text-xl font-bold">CareMate</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu>
              <Link to="/dashboard">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span className="flex items-center space-x-3">
                      <Layout size={20} />
                      <span>Dashboard</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
              <Link to="/doctors">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span className="flex items-center space-x-3">
                      <Search size={20} />
                      <span>Find Doctors</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
              <Link to="/prescriptions">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span className="flex items-center space-x-3">
                      <FileText size={20} />
                      <span>Prescriptions</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
              <Link to="/appointments">
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <span className="flex items-center space-x-3">
                      <Calendar size={20} />
                      <span>Appointments</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  {user?.profileImage ? (
                    <AvatarImage 
                      src={user.profileImage} 
                      alt={user.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "";
                      }}
                    />
                  ) : null}
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut size={18} />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1">
          {/* Header for mobile and desktop */}
          <header className="h-16 border-b bg-background px-4 md:px-6 flex items-center justify-between sticky top-0 z-10">
            {/* Mobile toggle menu */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </Button>
              <Link to="/" className="ml-2 flex items-center space-x-2">
                <img 
                  src="/lovable-uploads/fb497873-d154-4ea1-8f85-542123eda93d.png" 
                  alt="CareMate Logo" 
                  className="h-6 w-6" 
                />
                <span className="text-lg font-bold">CareMate</span>
              </Link>
            </div>

            {/* Desktop - Sidebar toggle and title */}
            <div className="hidden md:flex items-center gap-4">
              <SidebarTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu size={16} />
                </Button>
              </SidebarTrigger>
              <h1 className="text-lg font-semibold">Healthcare Dashboard</h1>
            </div>

            {/* Right side - Notifications and user menu */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1 flex items-center justify-center">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all read
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem key={notification.id} className={!notification.isRead ? "bg-muted/50" : ""}>
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground capitalize">
                                {notification.type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="text-sm p-2 text-center text-muted-foreground">
                        No notifications
                      </p>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      {user?.profileImage ? (
                        <AvatarImage 
                          src={user.profileImage} 
                          alt={user.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                      ) : null}
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Mobile navigation menu - visible only on small screens when menu is open */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed top-16 left-0 right-0 bg-background border-b shadow-lg z-10">
              <nav className="p-4">
                <ul className="space-y-4">
                  <li>
                    <Link to="/dashboard" className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
                          onClick={() => setIsMobileMenuOpen(false)}>
                      <Layout size={20} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctors" className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
                          onClick={() => setIsMobileMenuOpen(false)}>
                      <Search size={20} />
                      <span>Find Doctors</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/prescriptions" className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
                          onClick={() => setIsMobileMenuOpen(false)}>
                      <FileText size={20} />
                      <span>Prescriptions</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/appointments" className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
                          onClick={() => setIsMobileMenuOpen(false)}>
                      <Calendar size={20} />
                      <span>Appointments</span>
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Main content */}
          <main className="p-4 md:p-6 pb-16">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
