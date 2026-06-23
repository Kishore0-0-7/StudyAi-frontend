import { useState } from 'react';
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Stack, Toolbar, Tooltip, useMediaQuery } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [{ label: 'Dashboard', to: '/' }, { label: 'Ask Question', to: '/ask' }, { label: 'History', to: '/history' }];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const compact = useMediaQuery('(max-width:700px)');
  const initials = (user?.name || 'U').slice(0, 1).toUpperCase();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const logOut = () => { logout(); navigate('/login'); };
  if (!user) return null;
  return (
    <AppBar position="sticky" elevation={0} color="inherit" sx={{ bgcolor: 'background.default', py: .5 }}>
      <Container maxWidth={false} sx={{ maxWidth: '1520px', px: { xs: 1, md: 2 }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
        <Toolbar disableGutters sx={{ minHeight: '72px !important', gap: { xs: 1, md: 4 } }}>
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }} aria-label="StudyMind AI home">
            <Box component="img" src="/STUDYMIND-AI-ICON.png" alt="StudyMind AI" sx={{ height: 36, width: 'auto', display: 'block' }} />
          </Box>
          {!compact && <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'center', flexGrow: 1 }}>
            {links.map(link => <Button key={link.to} component={RouterLink} to={link.to} sx={{ height: 72, color: location.pathname === link.to ? 'primary.main' : 'text.primary', borderRadius: 0, borderBottom: '2px solid', borderColor: location.pathname === link.to ? 'primary.main' : 'transparent', px: 1.5 }}>{link.label}</Button>)}
          </Stack>}
          <Box sx={{ flexGrow: compact ? 1 : 0 }} />
          {compact && <Tooltip title="Navigation"><IconButton onClick={event => setMenuAnchor(event.currentTarget)}><MenuIcon /></IconButton></Tooltip>}
          <Tooltip title="Notifications"><IconButton size="small" sx={{ color: 'text.secondary' }}><NotificationsNoneIcon /></IconButton></Tooltip>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>{initials}</Avatar>
          {!compact && <Button onClick={logOut} color="inherit" endIcon={<LogoutIcon fontSize="small" />} sx={{ color: 'text.secondary' }}>Logout</Button>}
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            {links.map(link => <MenuItem key={link.to} component={RouterLink} to={link.to} selected={location.pathname === link.to} onClick={() => setMenuAnchor(null)}>{link.label}</MenuItem>)}
            <MenuItem onClick={logOut} sx={{ color: 'error.main' }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
