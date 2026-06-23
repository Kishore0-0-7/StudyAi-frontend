import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import ComputerIcon from '@mui/icons-material/Computer';
import CalculateIcon from '@mui/icons-material/Calculate';
import ChemistryIcon from '@mui/icons-material/ScienceOutlined';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format, isValid, subDays } from 'date-fns';

const TOPIC_META = {
  Biology: { color: '#0f766e', soft: '#ccfbf1', icon: <BiotechIcon /> },
  Physics: { color: '#7c3aed', soft: '#ede9fe', icon: <ScienceIcon /> },
  Chemistry: { color: '#ea580c', soft: '#ffedd5', icon: <ChemistryIcon /> },
  'Computer Science': { color: '#2563eb', soft: '#dbeafe', icon: <ComputerIcon /> },
  Mathematics: { color: '#ca8a04', soft: '#fef3c7', icon: <CalculateIcon /> },
  General: { color: '#475569', soft: '#e2e8f0', icon: <AssignmentIcon /> }
};

const COLORS = ['#2563eb', '#0f766e', '#ea580c', '#ca8a04', '#7c3aed', '#475569'];

const parseDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && isValid(date) ? date : null;
};

const getTopicMeta = (topic) => TOPIC_META[topic] || TOPIC_META.General;

const Dashboard = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/questions');
        setQuestions(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const analytics = useMemo(() => {
    const topicCounts = questions.reduce((acc, q) => {
      const topic = q.topic || 'General';
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(topicCounts).map(([name, value]) => ({ name, value }));
    const topTopic = pieData.sort((a, b) => b.value - a.value)[0]?.name || 'No topic yet';

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        label: format(date, 'MMM dd'),
        key: format(date, 'yyyy-MM-dd')
      };
    });

    const dailyCounts = questions.reduce((acc, q) => {
      const date = parseDate(q.createdAt);
      if (!date) return acc;
      const key = format(date, 'yyyy-MM-dd');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const barData = last7Days.map((day) => ({
      date: day.label,
      count: dailyCounts[day.key] || 0
    }));

    const activeDays = barData.filter((day) => day.count > 0).length;
    const latestDate = questions.map((q) => parseDate(q.createdAt)).filter(Boolean)[0];

    return {
      topicCounts,
      pieData,
      barData,
      totalQuestions: questions.length,
      topTopic,
      activeDays,
      latestLabel: latestDate ? format(latestDate, 'MMM dd, h:mm a') : 'No activity yet'
    };
  }, [questions]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 64px)' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Questions', value: analytics.totalQuestions, helper: 'All questions saved', topic: 'General' },
    { title: 'Top Topic', value: analytics.topTopic, helper: 'Most frequent area', topic: analytics.topTopic },
    { title: 'Active Days', value: `${analytics.activeDays}/7`, helper: 'Days studied this week', topic: 'Mathematics' },
    { title: 'Latest Activity', value: analytics.latestLabel, helper: 'Most recent question', topic: 'Computer Science' }
  ];

  return (
    <Box sx={{ bgcolor: '#f5f7fb', minHeight: '100vh', pb: 5 }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 4 } }}>
        <Card
          sx={{
            mb: 3,
            borderRadius: 2,
            color: 'white',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)',
            boxShadow: '0 18px 45px rgba(29, 78, 216, 0.18)'
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              Welcome back, {user?.name || 'Student'}
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              {format(new Date(), 'EEEE, MMMM do, yyyy')} · Your study progress at a glance.
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {statCards.map((stat) => {
            const meta = getTopicMeta(stat.topic);
            return (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={stat.title}>
                <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e6edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" sx={{ color: '#64748b', fontWeight: 800 }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} sx={{ color: '#0f172a', mt: 0.5, overflowWrap: 'anywhere' }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.75 }}>
                          {stat.helper}
                        </Typography>
                      </Box>
                      <Box sx={{ bgcolor: meta.soft, color: meta.color, borderRadius: 2, p: 1.25, display: 'flex' }}>
                        {meta.icon}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e6edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  Questions Asked (Last 7 Days)
                </Typography>
                <Box sx={{ width: '100%', minWidth: 0, height: { xs: 260, md: 320 } }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={analytics.barData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip cursor={{ fill: '#eff6ff' }} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                      <Bar dataKey="count" name="Questions" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={54} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e6edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  Topic Distribution
                </Typography>
                <Box sx={{ width: '100%', minWidth: 0, height: { xs: 280, md: 320 } }}>
                  {analytics.pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie data={analytics.pieData} cx="50%" cy="45%" innerRadius={58} outerRadius={88} paddingAngle={4} dataKey="value">
                          {analytics.pieData.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                        <Legend verticalAlign="bottom" height={48} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: '#64748b' }}>
                      <Typography>No topic data yet</Typography>
                    </Stack>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: '100%', borderRadius: 2, border: '1px solid #e6edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  Focus Mix
                </Typography>
                <Stack spacing={2}>
                  {Object.entries(analytics.topicCounts).length > 0 ? Object.entries(analytics.topicCounts).map(([topic, count]) => {
                    const meta = getTopicMeta(topic);
                    const value = Math.round((count / analytics.totalQuestions) * 100);
                    return (
                      <Box key={topic}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                          <Typography variant="body2" fontWeight={700}>{topic}</Typography>
                          <Typography variant="body2" color="text.secondary">{value}%</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 4, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: meta.color } }} />
                      </Box>
                    );
                  }) : (
                    <Typography color="text.secondary">Ask your first question to build your topic mix.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ borderRadius: 2, border: '1px solid #e6edf5', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                  Recent Activity
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f8fafc' }}>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Question</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }}>Topic</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#475569' }} align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.slice(0, 5).map((q) => {
                        const meta = getTopicMeta(q.topic);
                        const date = parseDate(q.createdAt);
                        return (
                          <TableRow key={q._id} hover>
                            <TableCell sx={{ maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {q.content}
                            </TableCell>
                            <TableCell>
                              <Chip icon={meta.icon} label={q.topic || 'General'} size="small" sx={{ bgcolor: meta.soft, color: meta.color, fontWeight: 700 }} />
                            </TableCell>
                            <TableCell align="right" sx={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                              {date ? format(date, 'MMM dd, h:mm a') : 'Unknown date'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {questions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 5, color: '#64748b' }}>
                            No activity found. Start asking questions to populate your dashboard.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
