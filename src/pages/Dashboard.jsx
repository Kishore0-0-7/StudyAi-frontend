import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
import LoadingScreen from '../components/LoadingScreen';
import dashboardHero from '../assets/dashboard-study-hero.png';

const TOPIC_COLORS = {
  Biology: '#22C55E',
  Physics: '#2563EB',
  Chemistry: '#F59E0B',
  Mathematics: '#8B5CF6',
  'Computer Science': '#EF4444',
  General: '#64748B',
};

const FALLBACK_COLORS = ['#14B8A6', '#A855F7', '#F97316', '#0EA5E9', '#84CC16', '#E11D48'];
const dateOf = value => {
  const date = value ? new Date(value) : null;
  return date && isValid(date) ? date : null;
};
const getTopicColor = (topic, index = 0) => TOPIC_COLORS[topic] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
const iconSx = { width: 42, height: 42, borderRadius: 1.5, display: 'grid', placeItems: 'center' };

function CardShell({ children, sx = {} }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderColor: '#DDE7F3',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.045)',
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}

function StatCard({ label, value, note, icon, color = '#2563EB', soft = '#DBEAFE' }) {
  return (
    <CardShell sx={{ minHeight: 207 }}>
      <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Box sx={{ ...iconSx, bgcolor: soft, color }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.75, fontWeight: 650 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.5, overflowWrap: 'anywhere', fontSize: '1.35rem' }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }}>
          {note}
        </Typography>
      </CardContent>
    </CardShell>
  );
}

function Panel({ title, action, children, sx = {} }) {
  return (
    <CardShell sx={sx}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 30, mb: 2.5 }}>
          <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
            {title}
          </Typography>
          {action && <Box sx={{ ml: 'auto', flexShrink: 0 }}>{action}</Box>}
        </Box>
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
      </CardContent>
    </CardShell>
  );
}

function EmptyChart() {
  return (
    <Box sx={{ minHeight: 245, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <Box>
        <Typography fontWeight={750}>No questions available yet.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Ask your first study question to start generating insights.
        </Typography>
      </Box>
    </Box>
  );
}

function TopicLegend({ data, total }) {
  return (
    <Stack spacing={0.85} sx={{ mt: 1.5 }}>
      {data.map((item, index) => (
        <Box
          key={item.name}
          sx={{
            display: 'grid',
            gridTemplateColumns: '10px minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: 1,
            px: 1.2,
            py: 0.65,
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: getTopicColor(item.name, index) }} />
          <Typography variant="caption" fontWeight={800} noWrap title={item.name}>
            {item.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ whiteSpace: 'nowrap' }}>
            {Math.round((item.value / total) * 100)}% · {item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function RecentActivity({ questions }) {
  const visible = questions.slice(0, 5);

  if (!visible.length) return <EmptyChart />;

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          minWidth: 660,
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed',
          '& th': {
            bgcolor: '#F8FAFC',
            color: 'text.secondary',
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1,
            py: 1.2,
            px: 2,
            textAlign: 'left',
          },
          '& th:first-of-type': { borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
          '& th:last-of-type': { borderTopRightRadius: 16, borderBottomRightRadius: 16 },
          '& td': {
            borderBottom: '1px solid #E2E8F0',
            py: 1.45,
            px: 2,
            verticalAlign: 'middle',
          },
          '& tbody tr:last-of-type td': { borderBottom: 0 },
        }}
      >
        <Box component="colgroup">
          <Box component="col" sx={{ width: '54%' }} />
          <Box component="col" sx={{ width: 170 }} />
          <Box component="col" sx={{ width: 170 }} />
        </Box>
        <Box component="thead">
          <Box component="tr">
            <Box component="th">Question</Box>
            <Box component="th" sx={{ textAlign: 'center !important' }}>Subject</Box>
            <Box component="th" sx={{ textAlign: 'right !important' }}>Timestamp</Box>
          </Box>
        </Box>
        <Box component="tbody">
          {visible.map((question, index) => {
            const topic = question.topic || 'General';
            const createdAt = dateOf(question.createdAt);

            return (
              <Box component="tr" key={question._id || question.id || `${question.content}-${index}`}>
                <Box component="td">
                  <Typography
                    variant="body2"
                    fontWeight={650}
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={question.content}
                  >
                    {question.content}
                  </Typography>
                </Box>
                <Box component="td" sx={{ textAlign: 'center' }}>
                  <Chip
                    label={topic}
                    size="small"
                    sx={{
                      minWidth: 118,
                      maxWidth: 148,
                      justifyContent: 'center',
                      color: getTopicColor(topic, index),
                      bgcolor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      fontWeight: 800,
                    }}
                  />
                </Box>
                <Box component="td" sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.primary" sx={{ whiteSpace: 'nowrap', fontWeight: 800 }}>
                    {createdAt ? format(createdAt, 'MMM dd, h:mm a') : 'Unknown date'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/questions')
      .then(res => setQuestions(Array.isArray(res.data) ? res.data : []))
      .catch(() => showToast('Unable to load dashboard analytics.', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const analytics = useMemo(() => {
    const sorted = [...questions].sort((a, b) => (dateOf(b.createdAt)?.getTime() || 0) - (dateOf(a.createdAt)?.getTime() || 0));
    const counts = questions.reduce((total, question) => {
      const topic = question.topic || 'General';
      return { ...total, [topic]: (total[topic] || 0) + 1 };
    }, {});
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = subDays(today, 6 - index);
      return { key: format(date, 'yyyy-MM-dd'), label: format(date, 'MMM dd'), short: format(date, 'EEE') };
    });
    const daily = questions.reduce((total, question) => {
      const date = dateOf(question.createdAt);
      if (date) total[format(date, 'yyyy-MM-dd')] = (total[format(date, 'yyyy-MM-dd')] || 0) + 1;
      return total;
    }, {});
    const dailyData = days.map(day => ({ ...day, count: daily[day.key] || 0 }));

    let streak = 0;
    const uniqueDates = [
      ...new Set(
        questions
          .map(question => dateOf(question.createdAt))
          .filter(Boolean)
          .map(date => format(date, 'yyyy-MM-dd')),
      ),
    ].sort().reverse();

    for (const key of uniqueDates) {
      if (differenceInCalendarDays(startOfDay(today), new Date(key)) === streak) streak += 1;
      else break;
    }

    const pie = Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
    const top = pie[0];
    const latest = dateOf(sorted[0]?.createdAt);

    return {
      sorted,
      counts,
      pie,
      dailyData,
      total: questions.length,
      top: top?.name || 'No topic yet',
      topShare: top ? Math.round((top.value / questions.length) * 100) : 0,
      streak,
      latest: latest ? format(latest, 'MMM dd, yyyy') : 'No activity yet',
      week: dailyData.reduce((sum, day) => sum + day.count, 0),
    };
  }, [questions]);

  const tooltip = {
    border: '1px solid #E2E8F0',
    borderRadius: 10,
    boxShadow: '0 12px 28px rgba(15,23,42,.10)',
    fontSize: 12,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Navbar />
      <Container maxWidth={false} sx={{ maxWidth: '1400px', pt: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        {loading ? (
          <Box sx={{ mx: 'auto', maxWidth: 420, pt: { xs: 6, md: 10 } }}>
            <LoadingScreen message="Fetching your questions, charts, and recent activity…" />
          </Box>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={2.25}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    minHeight: 220,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: '#D8E7FF',
                    bgcolor: '#F4F8FF',
                    boxShadow: '0 18px 42px rgba(37, 99, 235, 0.08)',
                    display: 'flex',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      flex: { xs: '1 1 100%', md: '0 0 55%' },
                      p: { xs: 3, md: 3 },
                      position: 'relative',
                      zIndex: 2,
                    }}
                  >
                    <Typography color="primary.main" fontWeight={800} variant="body2">
                      Good evening, {user?.name || 'Kishore'}! 👋
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1, fontSize: { xs: '1.55rem', md: '1.78rem' }, lineHeight: 1.18 }}>
                      Keep learning, keep growing!
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 1, lineHeight: 1.6, maxWidth: 360 }}>
                      You’re building a strong learning habit. Ask more questions to unlock deeper insights.
                    </Typography>
                    <Button component={RouterLink} to="/ask" variant="contained" size="small" endIcon={<ArrowForwardIcon />} sx={{ mt: 2, px: 2.15 }}>
                      Ask a Question
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      flex: '1 1 auto',
                      position: 'relative',
                      minWidth: 210,
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, #F4F8FF 0%, rgba(244,248,255,.72) 18%, rgba(244,248,255,0) 48%)',
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box
                      component="img"
                      src={dashboardHero}
                      alt="Student studying at a laptop"
                      sx={{
                        position: 'absolute',
                        width: { sm: 360, md: 410, lg: 430 },
                        maxWidth: 'none',
                        right: { sm: -74, md: -84, lg: -96 },
                        bottom: { sm: -18, md: -24 },
                        display: 'block',
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 7 }}>
                <Grid container spacing={2.25} sx={{ height: '100%' }}>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Total Questions" value={analytics.total} note={`${analytics.week ? `+${analytics.week}` : '0'} this week`} icon={<QueryStatsIcon />} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Most Common Topic" value={analytics.top} note={analytics.topShare ? `${analytics.topShare}% of all questions` : 'No topics yet'} icon={<TopicIcon />} color="#16A34A" soft="#DCFCE7" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Study Streak" value={`${analytics.streak} day${analytics.streak === 1 ? '' : 's'}`} note={analytics.streak ? 'Keep it going! 🔥' : 'Start today'} icon={<LocalFireDepartmentIcon />} color="#9333EA" soft="#F3E8FF" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard label="Latest Question" value={analytics.sorted[0] ? 'Today' : 'No activity'} note={analytics.sorted[0] ? format(dateOf(analytics.sorted[0].createdAt), 'MMM dd, yyyy') : 'Ask a question'} icon={<AccessTimeIcon />} color="#F97316" soft="#FFF3E8" />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 5 }}>
                <Panel title="Questions Asked Per Day" action={<Button component={RouterLink} to="/history" size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>Last 7 days</Button>}>
                  {questions.length ? (
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer>
                        <BarChart data={analytics.dailyData} margin={{ left: -24, right: 5 }}>
                          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <Tooltip contentStyle={tooltip} />
                          <Bar dataKey="count" fill="#2563EB" radius={[5, 5, 0, 0]} maxBarSize={42} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <EmptyChart />
                  )}
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, lg: 3 }}>
                <Panel title="Topic Distribution" action={<Button component={RouterLink} to="/history" size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>View all</Button>}>
                  {analytics.pie.length ? (
                    <Box>
                      <Box sx={{ height: 154 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie data={analytics.pie} dataKey="value" nameKey="name" innerRadius={39} outerRadius={63} paddingAngle={2}>
                              {analytics.pie.map((item, index) => (
                                <Cell key={item.name} fill={getTopicColor(item.name, index)} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={tooltip} formatter={(value, name) => [`${value} question${value === 1 ? '' : 's'}`, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      <TopicLegend data={analytics.pie} total={analytics.total} />
                    </Box>
                  ) : (
                    <EmptyChart />
                  )}
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Panel title="Weekly Study Trend" action={<Button component={RouterLink} to="/history" size="small" variant="outlined" sx={{ minHeight: 30, px: 1.25, fontSize: 11 }}>This week</Button>}>
                  {questions.length ? (
                    <Box sx={{ height: 250 }}>
                      <ResponsiveContainer>
                        <AreaChart data={analytics.dailyData} margin={{ left: -24, right: 5 }}>
                          <defs>
                            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity=".18" />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="short" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                          <Tooltip contentStyle={tooltip} />
                          <Area type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2.5} fill="url(#trend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <EmptyChart />
                  )}
                </Panel>
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 7 }}>
                <Panel title="Recent Activity" action={<Button component={RouterLink} to="/history" size="small">View full history</Button>}>
                  <RecentActivity questions={analytics.sorted} />
                </Panel>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }}>
                <Panel title="Focus Mix">
                  {analytics.pie.length ? (
                    <Stack spacing={2.2}>
                      {analytics.pie.map((item, index) => {
                        const value = Math.round((item.value / analytics.total) * 100);
                        const color = getTopicColor(item.name, index);

                        return (
                          <Box key={item.name}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 0.7 }}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                                <Typography variant="body2" noWrap>
                                  {item.name}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                {value}%
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={value}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  ) : (
                    <EmptyChart />
                  )}
                </Panel>
              </Grid>
            </Grid>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
