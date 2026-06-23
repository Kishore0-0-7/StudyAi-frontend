import { useState } from 'react';
import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const benefits = ['Topic Classification', 'Similar Question Discovery', 'Learning Analytics'];

export default function Register() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [error, setError] = useState('');
  const { register } = useAuth(); const navigate = useNavigate();
  const submit = async event => { event.preventDefault(); setError(''); if (password !== confirmPassword) { setError('Passwords do not match.'); return; } try { await register(name, email, password); navigate('/'); } catch (err) { setError(err.response?.data?.message || 'Registration failed. Please try again.'); } };
  return <Box sx={{ minHeight: '100svh', bgcolor: 'background.default', display: 'grid', placeItems: 'center', py: { xs: 3, md: 6 } }}>
    <Container maxWidth="lg"><Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 5, md: 10 }} alignItems="center">
      <Box sx={{ flex: 1, maxWidth: 550 }}><Box component="img" src="/STUDYMIND-AI-ICON.png" alt="StudyMind AI" sx={{ height: 36, width: 'auto', mb: 5 }} />
        <Typography component="h1" variant="h3" sx={{ fontSize: { xs: '2.25rem', md: '3.1rem' }, lineHeight: 1.12, mb: 2 }}>Study smarter with intelligent topic analysis.</Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 500 }}>Track learning patterns, discover related questions, and build stronger study habits.</Typography>
        <Stack spacing={1.5} sx={{ mt: 4 }}>{benefits.map(benefit => <Stack direction="row" spacing={1.25} alignItems="center" key={benefit}><CheckCircleIcon color="primary" fontSize="small" /><Typography>{benefit}</Typography></Stack>)}</Stack>
      </Box>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 430, p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 30px rgba(15,23,42,.06)' }}>
        <Typography variant="h5">Create your account</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: .75, mb: 3 }}>Start building your personal study history.</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={submit}><Stack spacing={2}><TextField required fullWidth label="Name" autoFocus value={name} onChange={event => setName(event.target.value)} /><TextField required fullWidth label="Email address" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /><TextField required fullWidth label="Password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><TextField required fullWidth label="Confirm password" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /><Button type="submit" fullWidth variant="contained" size="large" startIcon={<PersonAddIcon />} sx={{ mt: 1 }}>Create account</Button></Stack></Box>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>Already have an account? <Link to="/login">Sign in</Link></Typography>
      </Paper>
    </Stack></Container>
  </Box>;
}
