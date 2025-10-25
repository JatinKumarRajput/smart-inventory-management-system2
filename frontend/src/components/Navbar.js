// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

function Navbar() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('userRole');
      localStorage.removeItem('username');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      // Force logout even if API fails
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Inventory Management System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            {username} ({userRole})
          </Typography>
          <Button 
            color="inherit" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
