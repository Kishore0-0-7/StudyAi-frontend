import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Container, Grid, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import TopicIcon from '@mui/icons-material/Topic';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { differenceInCalendarDays, format, isValid, startOfDay, subDays } from 'date-fns';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/AppUiContext';
import dashboardHero from '../assets/dashboard-study-hero.png';

const topicMeta = { Biology: '#22C55E', Physics: '#2563EB', Chemistry: '#F59E0B', Mathematics: '#8B5CF6', 'Computer Science': '#EF4444', General: '#64748B' };
const chartColors = ['#22C55E', '#2563EB', '#F59E0B', '#8B5CF6', '#EF4444', '#64748B'];
const dateOf = value => { const date = value ? new Date(value) : null; return date && isValid(date) ? date : null; };
const CardShell = ({ children, sx = {} }) => <Card elevation={0} sx={{ height: '100%', ...sx }}>{children}</Card>;
const iconSx = { width: 42, height: 42, borderRadius: 1.5, display: 'grid', placeItems: 'center' };

function StatCard({ label, value, note, icon, color = '#2563EB', soft = '#DBEAFE' }) { return <CardShell><CardContent sx={{ p: 2.5, minHeight: 207, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}><Box sx={{ ...iconSx, bgcolor: soft, color }}>{icon}</Box><Typography variant="caption" color="text.secondary" sx={{ mt: 1.75 }}>{label}</Typography><Typography variant="h6" sx={{ mt: .5, overflowWrap: 'anywhere', fontSize: '1.35rem' }}>{value}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }}>{note}</Typography></CardContent></CardShell>; }
function Panel({ title, action, children }) { return <CardShell><CardContent sx={{ p: { xs: 2.5, md: 3 }, height: '100%', boxSizing: 'border-box' }}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 28, mb: 2.5 }}><Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>{title}</Typography>{action && <Box sx={{ ml: 'auto', flexShrink: 0 }}>{action}</Box>}</Box>{children}</CardContent></CardShell>; }
function EmptyChart() { return <Box sx={{ height: 245, display: 'grid', placeItems: 'center', textAlign: 'center' }}><Box><Typography fontWeight={700}>No questions available yet.</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Ask your first study question to start generating insights.</Typography></Box></Box>; }

export default function Dashboard() {
  const { user } = useAuth(); const { showToast } = useToast(); const [questions, setQuestions] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/questions').then(res => setQuestions(Array.isArray(res.data) ? res.data : [])).catch(() => showToast('Unable to load dashboard analytics.', 'error')).finally(() => setLoading(false)); }, [showToast]);
  const analytics = useMemo(() => {
    const sorted = [...questions].sort((a,b) => (dateOf(b.createdAt)?.getTime() || 0) - (dateOf(a.createdAt)?.getTime() || 0));
    const counts = questions.reduce((total, q) => ({ ...total, [q.topic || 'General']: (total[q.topic || 'General'] || 0) + 1 }), {});
    const today = new Date(); const days = Array.from({ length: 7 }, (_, i) => { const date = subDays(today, 6 - i); return { key: format(date, 'yyyy-MM-dd'), label: format(date, 'MMM dd'), short: format(date, 'EEE') }; });
    const daily = questions.reduce((total, q) => { const date = dateOf(q.createdAt); if (date) total[format(date, 'yyyy-MM-dd')] = (total[format(date, 'yyyy-MM-dd')] || 0) + 1; return total; }, {});
    const dailyData = days.map(day => ({ ...day, count: daily[day.key] || 0 }));
    let streak = 0; const unique = [...new Set(questions.map(q => dateOf(q.createdAt)).filter(Boolean).map(date => format(date, 'yyyy-MM-dd'))) ].sort().reverse(); for (const key of unique) { if (differenceInCalendarDays(startOfDay(today), new Date(key)) === streak) streak += 1; else break; }
    const pie = Object.entries(counts).map(([name, value]) => ({ name, value })); const top = [...pie].sort((a,b) => b.value-a.value)[0]; const latest = dateOf(sorted[0]?.createdAt);
    return { sorted, counts, pie, dailyData, total: questions.length, top: top?.name || 'No topic yet', topShare: top ? Math.round(top.value / questions.length * 100) : 0, streak, latest: latest ? format(latest, 'MMM dd, yyyy') : 'No activity yet', week: dailyData.reduce((sum, day) => sum + day.count, 0) };
  }, [questions]);
  const tooltip = { border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 18px rgba(15,23,42,.08)', fontSize: 12 };
  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}><Navbar /><Container maxWidth={false} sx={{ maxWidth: '1400px', pt: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
    {loading ? <Stack spacing={3}><Skeleton height={170} variant="rounded" /><Grid container spacing={3}>{[1,2,3,4].map(x => <Grid key={x} size={{ xs:12, sm:6, lg:3 }}><Skeleton height={180} variant="rounded" /></Grid>)}</Grid><Skeleton height={330} variant="rounded" /></Stack> : <Stack spacing={3}>
      <Grid container spacing={2.25}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Paper elevation={0} sx={{ height: '100%', minHeight: 207, p: { xs: 3, md: 3 }, overflow: 'hidden', border: '1px solid', borderColor: '#D8E7FF', bgcolor: '#F4F8FF', position: 'relative', boxSizing: 'border-box' }}>
            <Box sx={{ maxWidth: { xs: '100%', md: '58%' }, position: 'relative', zIndex: 1 }}><Typography color="primary.main" fontWeight={700} variant="body2">Good evening, {user?.name || 'Kishore'}! 👋</Typography><Typography variant="h5" sx={{ mt: 1, fontSize: { xs: '1.55rem', md: '1.7rem' } }}>Keep learning, keep growing!</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 1, lineHeight: 1.55 }}>You’re building a strong learning habit. Ask more questions to unlock deeper insights.</Typography><Button component={RouterLink} to="/ask" variant="contained" size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 1.75, px: 2 }}>Ask a Question</Button></Box>
            <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: { xs: '43%', md: '49%' }, height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
              <Box component="img" src={dashboardHero} alt="Student studying at a laptop" sx={{ position: 'absolute', width: { xs: 420, md: 530 }, maxWidth: 'none', right: { xs: -115, md: -135 }, bottom: { xs: -16, md: -28 }, display: 'block' }} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}><Grid container spacing={2.25} sx={{ height: '100%' }}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label="Total Questions" value={analytics.total} note={`${analytics.week ? `+${analytics.week}` : '0'} this week`} icon={<QueryStatsIcon />} /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label="Most Common Topic" value={analytics.top} note={analytics.topShare ? `${analytics.topShare}% of all questions` : 'No topics yet'} icon={<TopicIcon />} color="#16A34A" soft="#DCFCE7" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label="Study Streak" value={`${analytics.streak} day${analytics.streak === 1 ? '' : 's'}`} note={analytics.streak ? 'Keep it going! 🔥' : 'Start today'} icon={<LocalFireDepartmentIcon />} color="#9333EA" soft="#F3E8FF" /></Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}><StatCard label="Latest Question" value={analytics.sorted[0] ? 'Today' : 'No activity'} note={analytics.sorted[0] ? format(dateOf(analytics.sorted[0].createdAt), 'MMM dd, yyyy') : 'Ask a question'} icon={<AccessTimeIcon />} color="#F97316" soft="#FFF3E8" /></Grid>
        </Grid></Grid>
      </Grid>
      <Grid container spacing={3}><Grid size={{ xs:12, lg:5 }}><Panel title="Questions Asked Per Day" action={<Button size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>Last 7 days</Button>}>{questions.length ? <Box sx={{ height: 250 }}><ResponsiveContainer><BarChart data={analytics.dailyData} margin={{ left: -24, right: 5 }}><CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill:'#64748B', fontSize:12 }}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill:'#64748B', fontSize:12 }}/><Tooltip contentStyle={tooltip}/><Bar dataKey="count" fill="#2563EB" radius={[4,4,0,0]} maxBarSize={42}/></BarChart></ResponsiveContainer></Box> : <EmptyChart />}</Panel></Grid><Grid size={{ xs:12, lg:3 }}><Panel title="Topic Distribution" action={<Button size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>View all</Button>}>{analytics.pie.length ? <Box sx={{ height:250 }}><ResponsiveContainer><PieChart><Pie data={analytics.pie} dataKey="value" innerRadius={48} outerRadius={82} paddingAngle={2}>{analytics.pie.map((x,i) => <Cell key={x.name} fill={chartColors[i % chartColors.length]} />)}</Pie><Tooltip contentStyle={tooltip}/></PieChart></ResponsiveContainer></Box> : <EmptyChart />}</Panel></Grid><Grid size={{ xs:12, lg:4 }}><Panel title="Weekly Study Trend" action={<Button size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>This week</Button>}>{questions.length ? <Box sx={{ height:250 }}><ResponsiveContainer><AreaChart data={analytics.dailyData} margin={{ left:-24, right:5 }}><defs><linearGradient id="trend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563EB" stopOpacity=".18"/><stop offset="100%" stopColor="#2563EB" stopOpacity="0"/></linearGradient></defs><CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="short" tickLine={false} axisLine={false} tick={{ fill:'#64748B',fontSize:12 }}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill:'#64748B',fontSize:12 }}/><Tooltip contentStyle={tooltip}/><Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} fill="url(#trend)"/></AreaChart></ResponsiveContainer></Box> : <EmptyChart />}</Panel></Grid></Grid>
      <Grid container spacing={3}><Grid size={{ xs:12, lg:7 }}><Panel title="Recent Activity" action={<Button component={RouterLink} to="/history" size="small">View full history</Button>}><Stack divider={<Box sx={{ borderBottom:'1px solid', borderColor:'divider' }} />}>{analytics.sorted.slice(0,5).map(q => <Stack key={q._id || q.id || q.content} direction={{ xs:'column', sm:'row' }} spacing={1} alignItems={{ sm:'center' }} justifyContent="space-between" sx={{ py:1.35 }}><Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth:{ sm:'58%' } }}>{q.content}</Typography><Stack direction="row" spacing={2} alignItems="center"><Chip label={q.topic || 'General'} size="small" sx={{ color: topicMeta[q.topic] || topicMeta.General, bgcolor: '#F8FAFC', fontWeight:600 }} /><Typography variant="caption" color="text.secondary">{dateOf(q.createdAt) ? format(dateOf(q.createdAt), 'MMM dd, h:mm a') : 'Unknown date'}</Typography></Stack></Stack>)}{!analytics.sorted.length && <EmptyChart />}</Stack></Panel></Grid><Grid size={{ xs:12, lg:5 }}><Panel title="Focus Mix">{analytics.pie.length ? <Stack spacing={2.2}>{analytics.pie.map((item,index) => { const value = Math.round(item.value / analytics.total * 100); const color = chartColors[index % chartColors.length]; return <Box key={item.name}><Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb:.7 }}><Typography variant="body2">{item.name}</Typography><Typography variant="caption" color="text.secondary">{value}%</Typography></Stack><LinearProgress variant="determinate" value={value} sx={{ height:6, borderRadius:3, bgcolor:'#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor:color, borderRadius:3 } }} /></Box>; })}</Stack> : <EmptyChart />}</Panel></Grid></Grid>
    </Stack>}
  </Container></Box>;
}
