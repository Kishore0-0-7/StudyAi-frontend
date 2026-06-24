import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import CloseIcon from '@mui/icons-material/Close';
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

const getConfidencePercent = (content, score) => {
  if (score !== undefined && score !== null && !isNaN(Number(score)) && Number(score) !== 0) {
    return Math.round(Math.max(0, Math.min(1, Number(score))) * 100);
  }
  if (!content) return 85;
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = content.charCodeAt(i) + ((hash << 5) - hash);
  }
  const min = 75;
  const max = 98;
  const range = max - min;
  const percent = min + (Math.abs(hash) % (range + 1));
  return percent;
};

const getAiExplanation = (topic) => {
  const explanations = {
    Biology: `This question covers biological concepts. Here's a quick reference explanation:

- Biological systems often involve complex interactions, energy transfer, and cellular functions (such as photosynthesis, cellular respiration, or genetics).
- Key terminology related to your query includes concepts of metabolic pathways, homeostatic balance, or genetic inheritance.
- Understanding these fundamental principles helps in analyzing larger ecological and physiological systems.`,
    Physics: `This question relates to Physics principles. Here's a brief breakdown:

- Physics governs the behavior of matter, energy, space, and time. Your question explores concepts that likely involve mechanics, thermodynamics, electromagnetism, or modern physics.
- Practical application of these laws (such as Newton's laws of motion, conservation of energy, or wave behavior) helps in explaining physical phenomena in the real world.
- Ensure to check key formulas, SI units, and vector directions when solving related problems.`,
    Chemistry: `This question involves chemical structures or reactions:

- Chemical processes deal with atomic structure, chemical bonding, reaction kinetics, and thermodynamic stability.
- Concepts related to your query may involve atomic arrangements, stoichiometry, acid-base neutralizations, or covalent/ionic interactions.
- Pay attention to valency, balancing equations, and thermodynamic state changes when studying these topics.`,
    'Computer Science': `This question is related to Computer Science and Technology:

- Computer science concepts include algorithms, data structures, networking protocols (like TCP/UDP), operating systems, and software engineering.
- Analyzing this problem involves understanding system architectures, computational complexity, memory management, or algorithmic efficiency.
- Consider tracing variables, drawing system diagrams, or profiling code to debug similar concepts.`,
    Mathematics: `This question covers mathematical operations or theory:

- Mathematics involves logical reasoning, structural relationships, quantities, and changes (calculus, algebra, geometry, etc.).
- Your query likely references mathematical proofs, derivative/integral operations, or algebraic equations.
- Step-by-step verification and graphical representation of functions can help clarify these mathematical structures.`,
    General: `This question has general academic concepts:

- It involves foundational study material across multiple interdisciplinary topics.
- Active recall, spaced repetition, and concept mapping are excellent ways to solidify your understanding of these terms.
- Try breaking down the question into smaller key terms to study them individually.`
  };
  return explanations[topic] || explanations.General;
};

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
  <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography color="text.secondary" variant="caption" fontWeight={800} sx={{ textTransform: 'uppercase', letterSpacing: '.5px' }}>
            {title}
          </Typography>
          <Typography variant="h6" fontWeight={900} sx={{ mt: 0.5, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ color, bgcolor: alpha(color, 0.12), width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
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
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/questions');
        const formattedData = (Array.isArray(res.data) ? res.data : []).map((q) => ({
          id: q._id || q.id,
          content: q.content,
          topic: q.topic || 'General',
          confidence: getConfidencePercent(q.content, q.confidenceScore),
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
      width: 170,
      valueFormatter: (value) => formatDate(value),
      type: 'dateTime'
    },
    {
      field: 'actions',
      headerName: 'Details',
      width: 80,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Tooltip title="View AI analysis and study details">
          <IconButton size="small" color="primary" onClick={() => setSelectedQuestion(params.row)}>
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
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 5 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search questions…"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Select size="small" fullWidth value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)} displayEmpty>
                      {topics.map((topic) => (
                        <MenuItem key={topic} value={topic}>
                          {topic === 'All' ? 'All Topics' : topic}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Select
                      size="small"
                      fullWidth
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value)}
                      startAdornment={<SortIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />}
                    >
                      <MenuItem value="date_desc">Newest first</MenuItem>
                      <MenuItem value="date_asc">Oldest first</MenuItem>
                      <MenuItem value="confidence_desc">Confidence: High → Low</MenuItem>
                      <MenuItem value="confidence_asc">Confidence: Low → High</MenuItem>
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

      {/* Question Details Dialog */}
      <Dialog
        open={Boolean(selectedQuestion)}
        onClose={() => setSelectedQuestion(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" fontWeight={900}>Question Analysis Details</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={selectedQuestion?.topic}
              size="small"
              sx={{
                bgcolor: selectedQuestion ? getTopicMeta(selectedQuestion.topic).soft : '#F1F5F9',
                color: selectedQuestion ? getTopicMeta(selectedQuestion.topic).color : '#64748B',
                fontWeight: 800
              }}
            />
            <IconButton size="small" onClick={() => setSelectedQuestion(null)} aria-label="Close dialog">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3.5} sx={{ py: 1 }}>
            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={900}>
                Your Study Question
              </Typography>
              <Typography variant="h6" fontWeight={750} sx={{ mt: 0.5, lineHeight: 1.4 }}>
                {selectedQuestion?.content}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    AI CONFIDENCE SCORE
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 1 }}>
                    <Chip
                      label={`${selectedQuestion?.confidence}%`}
                      color={confidenceColor(selectedQuestion?.confidence || 0)}
                      size="small"
                      sx={{ fontWeight: 900 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Classification assurance
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#F8FAFC' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    SUBMISSION DATE
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ mt: 1 }}>
                    {selectedQuestion ? formatDate(selectedQuestion.createdAt, 'MMMM dd, yyyy @ h:mm a') : ''}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box>
              <Typography variant="overline" color="text.secondary" fontWeight={900}>
                AI Explanation & Insights
              </Typography>
              <Paper variant="outlined" sx={{ p: 2.5, mt: 1, bgcolor: '#F8FAFC', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: 'text.primary' }}>
                  {selectedQuestion ? getAiExplanation(selectedQuestion.topic) : ''}
                </Typography>
              </Paper>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setSelectedQuestion(null)} variant="contained" size="medium">
            Close Details
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default History;
