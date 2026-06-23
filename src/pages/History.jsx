import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha
} from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BiotechIcon from '@mui/icons-material/Biotech';
import CalculateIcon from '@mui/icons-material/Calculate';
import ComputerIcon from '@mui/icons-material/Computer';
import HistoryIcon from '@mui/icons-material/History';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import SortIcon from '@mui/icons-material/Sort';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { useToast } from '../context/AppUiContext';
import { format, isValid } from 'date-fns';

const TOPIC_META = {
  Biology: { color: '#0f766e', soft: '#ccfbf1', icon: <BiotechIcon /> },
  Physics: { color: '#7c3aed', soft: '#ede9fe', icon: <ScienceIcon /> },
  Chemistry: { color: '#ea580c', soft: '#ffedd5', icon: <ScienceIcon /> },
  'Computer Science': { color: '#2563eb', soft: '#dbeafe', icon: <ComputerIcon /> },
  Mathematics: { color: '#ca8a04', soft: '#fef3c7', icon: <CalculateIcon /> },
  General: { color: '#475569', soft: '#e2e8f0', icon: <AutoAwesomeIcon /> }
};

const getTopicMeta = (topic) => TOPIC_META[topic] || TOPIC_META.General;
const getConfidencePercent = (score) => Math.round(Math.max(0, Math.min(1, Number(score) || 0)) * 100);

const formatDate = (value, pattern = 'MMM dd, yyyy h:mm a') => {
  const rawValue = value && typeof value === 'object' && 'value' in value ? value.value : value;
  const date = rawValue instanceof Date ? rawValue : new Date(rawValue);
  return isValid(date) ? format(date, pattern) : 'Unknown date';
};

const confidenceColor = (value) => {
  if (value >= 90) return 'success';
  if (value >= 75) return 'primary';
  if (value >= 60) return 'warning';
  return 'error';
};

const EmptyState = () => (
  <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: 'background.paper' }}>
    <HistoryIcon color="primary" sx={{ fontSize: 46, mb: 1 }} />
    <Typography variant="h6" fontWeight={900}>
      No study questions found yet.
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      Ask your first question to populate the analytics table and unlock your learning archive.
    </Typography>
  </Paper>
);

const StatCard = ({ title, value, subtitle, icon, color = '#2563eb' }) => (
  <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: '0 18px 48px rgba(15, 23, 42, 0.08)' }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" variant="overline" fontWeight={900}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ color, bgcolor: alpha(color, 0.12), width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
          {icon}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const CustomToolbar = () => (
  <GridToolbarContainer sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', justifyContent: 'flex-end' }}>
    <GridToolbarExport
      printOptions={{ disableToolbarButton: true }}
      csvOptions={{ fileName: 'studymind-question-history.csv' }}
    />
  </GridToolbarContainer>
);

const History = () => {
  const { showToast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [sortMode, setSortMode] = useState('date_desc');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/questions');
        const formattedData = (Array.isArray(res.data) ? res.data : []).map((q) => ({
          id: q._id || q.id,
          content: q.content,
          topic: q.topic || 'General',
          confidence: getConfidencePercent(q.confidenceScore),
          explanation: q.explanation,
          createdAt: q.createdAt ? new Date(q.createdAt) : null
        }));
        setQuestions(formattedData);
      } catch (err) {
        console.error(err);
        showToast('Unable to load question history.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [showToast]);

  const topics = useMemo(() => ['All', ...new Set(questions.map((question) => question.topic).filter(Boolean))], [questions]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = questions.filter((question) => {
      const matchesSearch = !query || question.content?.toLowerCase().includes(query);
      const matchesTopic = topicFilter === 'All' || question.topic === topicFilter;
      return matchesSearch && matchesTopic;
    });

    return [...rows].sort((a, b) => {
      if (sortMode === 'date_asc') return (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0);
      if (sortMode === 'confidence_desc') return b.confidence - a.confidence;
      if (sortMode === 'confidence_asc') return a.confidence - b.confidence;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
  }, [questions, search, sortMode, topicFilter]);

  const stats = useMemo(() => {
    if (!questions.length) return { total: 0, commonTopic: 'N/A', latest: 'N/A', averageConfidence: '0%' };

    const counts = {};
    questions.forEach((question) => {
      counts[question.topic] = (counts[question.topic] || 0) + 1;
    });

    const commonTopic = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const validDates = questions.map((q) => q.createdAt).filter((date) => date && isValid(date));
    const latestDate = validDates.reduce((latest, date) => (date > latest ? date : latest), validDates[0]);
    const averageConfidence = Math.round(questions.reduce((sum, question) => sum + question.confidence, 0) / questions.length);

    return {
      total: questions.length,
      commonTopic,
      latest: latestDate ? formatDate(latestDate, 'MMM dd, yyyy') : 'N/A',
      averageConfidence: `${averageConfidence}%`
    };
  }, [questions]);

  const columns = [
    {
      field: 'content',
      headerName: 'Question',
      flex: 1,
      minWidth: 360,
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Typography variant="body2" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {params.value}
          </Typography>
        </Tooltip>
      )
    },
    {
      field: 'topic',
      headerName: 'Topic',
      width: 190,
      renderCell: (params) => {
        const meta = getTopicMeta(params.value);
        return <Chip icon={meta.icon} label={params.value} size="small" sx={{ bgcolor: meta.soft, color: meta.color, fontWeight: 800 }} />;
      }
    },
    {
      field: 'confidence',
      headerName: 'Confidence',
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Chip label={`${params.value}%`} color={confidenceColor(params.value)} size="small" sx={{ fontWeight: 900 }} />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Date',
      width: 200,
      valueFormatter: (value) => formatDate(value),
      type: 'dateTime'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title={params.row.explanation || 'AI explanation will appear for newly analyzed questions.'}>
          <IconButton size="small" color="primary">
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth={false} sx={{ maxWidth: '1400px', mt: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900}>
                Question history
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Search, filter, and review every question in your study archive.</Typography>
            </Box>
            <Box sx={{ color: 'primary.main', bgcolor: '#EFF6FF', width: 52, height: 52, borderRadius: 2, display: 'grid', placeItems: 'center' }}>
              <HistoryIcon />
            </Box>
          </Stack>

          {loading ? (
            <Stack spacing={3}>
              <Grid container spacing={2.5}>
                {[1, 2, 3, 4].map((item) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item}>
                    <Skeleton variant="rounded" height={140} />
                  </Grid>
                ))}
              </Grid>
              <Skeleton variant="rounded" height={620} />
            </Stack>
          ) : (
            <>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Total Questions" value={stats.total} subtitle="Questions asked so far" icon={<QueryStatsIcon />} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Most Common Topic" value={stats.commonTopic} subtitle="Your main area of focus" icon={getTopicMeta(stats.commonTopic).icon} color={getTopicMeta(stats.commonTopic).color} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Latest Question" value={stats.latest} subtitle="Most recent study activity" icon={<HistoryIcon />} color="#14b8a6" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                  <StatCard title="Average Confidence" value={stats.averageConfidence} subtitle="AI classification quality" icon={<AutoAwesomeIcon />} color="#f59e0b" />
                </Grid>
              </Grid>

              <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      label="Search Question"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Select fullWidth value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} displayEmpty>
                      {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          {topic === 'All' ? 'Filter by Topic' : topic}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Select
                      fullWidth
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value)}
                      startAdornment={<SortIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="date_desc">Sort by Date: Newest first</MenuItem>
                      <MenuItem value="date_asc">Sort by Date: Oldest first</MenuItem>
                      <MenuItem value="confidence_desc">Sort by Confidence: High to low</MenuItem>
                      <MenuItem value="confidence_asc">Sort by Confidence: Low to high</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
              </Paper>

              {questions.length === 0 ? (
                <EmptyState />
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    height: { xs: 620, md: 700 },
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden'
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <QueryStatsIcon color="primary" />
                    <Typography variant="h6" fontWeight={900}>
                      Saved questions
                    </Typography>
                    <Chip label={`${filteredRows.length} rows`} size="small" sx={{ fontWeight: 900 }} />
                  </Stack>
                  <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={loading}
                    initialState={{
                      pagination: { paginationModel: { page: 0, pageSize: 15 } },
                      sorting: { sortModel: [{ field: 'createdAt', sort: 'desc' }] }
                    }}
                    pageSizeOptions={[10, 15, 25, 50, 100]}
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    sx={{
                      border: 0,
                      minWidth: 0,
                      '& .MuiDataGrid-columnHeaders': {
                        bgcolor: '#f8fafc',
                        color: 'text.secondary',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.82rem'
                      },
                      '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                        transition: 'background-color 0.2s, transform 0.2s',
                        '&:hover': {
                          bgcolor: alpha('#2563EB', 0.06)
                        }
                      },
                      '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
                        outline: 'none'
                      }
                    }}
                  />
                </Paper>
              )}
            </>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default History;
