import { Box, CircularProgress, LinearProgress, Stack, Typography } from '@mui/material';

export default function LoadingScreen({ message = 'Loading your study workspace…' }) {
  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
        '@keyframes floatCard': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        '@keyframes glowPulse': {
          '0%, 100%': { opacity: 0.35, transform: 'scale(1)' },
          '50%': { opacity: 0.75, transform: 'scale(1.08)' },
        },
      }}
    >
      <Stack
        alignItems="center"
        spacing={2.25}
        sx={{
          width: 'min(100%, 380px)',
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid #D8E7FF',
          bgcolor: 'rgba(255,255,255,.86)',
          boxShadow: '0 24px 70px rgba(37, 99, 235, 0.14)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'floatCard 2.8s ease-in-out infinite',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 190,
            height: 190,
            borderRadius: '50%',
            bgcolor: '#DBEAFE',
            top: -90,
            right: -80,
            filter: 'blur(4px)',
            animation: 'glowPulse 2s ease-in-out infinite',
          },
        }}
      >
        <Box component="img" src="/STUDYMIND-AI-ICON.png" alt="StudyMind AI" sx={{ height: 42, width: 'auto', zIndex: 1 }} />
        <Box sx={{ position: 'relative', zIndex: 1, display: 'grid', placeItems: 'center' }}>
          <CircularProgress size={58} thickness={4.4} />
          <Box sx={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.14 }} />
        </Box>
        <Box sx={{ width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography variant="h6">Preparing insights</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {message}
          </Typography>
          <LinearProgress sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: '#E2E8F0' }} />
        </Box>
      </Stack>
    </Box>
  );
}
