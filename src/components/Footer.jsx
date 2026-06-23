import { Box, Container, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export default function Footer() {
  const { pathname } = useLocation();
  if (pathname === '/login' || pathname === '/register') return null;
  return <Box component="footer" sx={{ px: { xs: 2, md: 3 }, pb: 3, bgcolor: 'background.default' }}>
    <Container maxWidth={false} sx={{ maxWidth: '1400px', border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 3, py: 2.5, bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={2}>
        <Stack direction="row" alignItems="center" spacing={3} flexWrap="wrap" useFlexGap>
          <Box component="img" src="/STUDYMIND-AI-ICON.png" alt="StudyMind AI" sx={{ height: 28, width: 'auto' }} />
          <Typography variant="caption" color="text.secondary">Semantic Search&nbsp; • &nbsp;Topic Classification&nbsp; • &nbsp;Learning Analytics</Typography>
        </Stack>
        <Stack direction="row" spacing={3}><Typography component={RouterLink} to="/" variant="caption" color="text.secondary" sx={{ textDecoration: 'none' }}>Dashboard</Typography><Typography component={RouterLink} to="/ask" variant="caption" color="text.secondary" sx={{ textDecoration: 'none' }}>Ask Question</Typography><Typography component={RouterLink} to="/history" variant="caption" color="text.secondary" sx={{ textDecoration: 'none' }}>History</Typography></Stack>
        <Typography variant="caption" color="text.secondary">© 2026 StudyMind AI. All rights reserved.</Typography>
      </Stack>
    </Container>
  </Box>;
}
