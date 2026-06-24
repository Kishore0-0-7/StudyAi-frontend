import { useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip,
  CircularProgress, Container, Grid, LinearProgress,
  Paper, Stack, TextField, Typography
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import api from '../api/api';
import Navbar from '../components/Navbar';
import { format, isValid } from 'date-fns';

const samples = ['Photosynthesis', 'TCP vs UDP', "Newton's Law", 'Derivative', 'Ionic Bond'];
const prompts = {
  Photosynthesis: 'How does photosynthesis work?',
  'TCP vs UDP': 'What is the difference between TCP and UDP?',
  "Newton's Law": "Explain Newton's second law of motion.",
  Derivative: 'What is the derivative of x²?',
  'Ionic Bond': 'What is an ionic bond?',
};
const MAX_CHARS = 1000;
const toPercent = value => Math.round(Math.max(0, Math.min(1, Number(value) || 0)) * 100);
const topicColor = {
  Biology: '#22C55E', Physics: '#2563EB', Chemistry: '#F59E0B',
  Mathematics: '#8B5CF6', 'Computer Science': '#2563EB', General: '#64748B',
};
const topicSoft = {
  Biology: '#DCFCE7', Physics: '#DBEAFE', Chemistry: '#FEF3C7',
  Mathematics: '#EDE9FE', 'Computer Science': '#DBEAFE', General: '#F1F5F9',
};
const prettyDate = value => {
  const date = value ? new Date(value) : null;
  return date && isValid(date) ? format(date, 'MMM dd, yyyy') : 'Recently';
};
const fallbackExplanation = topic =>
  `Detected concepts related to ${String(topic || 'your question').toLowerCase()} and compared them with your saved study activity.`;

/* ── Similar question card ─────────────────────────────────── */
function SimilarCard({ item }) {
  const score = toPercent(item.score);
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow .2s',
        '&:hover': { boxShadow: '0 4px 16px rgba(15,23,42,.1)' },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
          <Chip
            label={`${score}% Similar`}
            size="small"
            color={score >= 80 ? 'success' : 'primary'}
            sx={{ fontWeight: 700 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: 13 }} />
            {prettyDate(item.createdAt)}
          </Typography>
        </Stack>
        <Typography fontWeight={650} sx={{ mt: 2, minHeight: 48, lineHeight: 1.5 }}>
          {item.content || item.question}
        </Typography>
        <Chip
          label={item.topic || 'General'}
          size="small"
          sx={{
            mt: 2,
            bgcolor: topicSoft[item.topic] || topicSoft.General,
            color: topicColor[item.topic] || topicColor.General,
            fontWeight: 700,
          }}
        />
      </CardContent>
    </Card>
  );
}

/* ── Main page ─────────────────────────────────────────────── */
export default function AskQuestion() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const remaining = MAX_CHARS - content.length;
  const over = remaining < 0;
  const similar = useMemo(() => result?.similarQuestions?.slice(0, 6) || [], [result]);

  const submit = async event => {
    event.preventDefault();
    if (!content.trim() || over) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await api.post('/questions', { content: content.trim() });
      setResult(response.data);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'We could not analyze that question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const topic = result?.question?.topic || 'General';
  const confidence = toPercent(result?.confidenceScore);

  return (
    <Box sx={{ minHeight: '100vh', pb: 6, bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth={false} sx={{ maxWidth: '1400px', pt: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Stack spacing={3}>

          {/* Page heading */}
          <Box>
            <Typography variant="h4" fontWeight={900}>Ask a question</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Get a topic prediction and discover related questions from your study history.
            </Typography>
          </Box>

          {/* Question input card */}
          <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid', borderColor: 'divider' }}>
            <Box component="form" onSubmit={submit}>
              <TextField
                fullWidth
                multiline
                minRows={7}
                placeholder="What would you like to understand? Ask a study question in your own words..."
                value={content}
                onChange={event => setContent(event.target.value)}
                disabled={loading}
                error={over}
                inputProps={{ maxLength: MAX_CHARS + 1 }}
                sx={{ '& .MuiOutlinedInput-root': { p: 2, alignItems: 'flex-start' } }}
              />
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ sm: 'center' }}
                sx={{ mt: 2 }}
              >
                <Typography variant="caption" color={over ? 'error.main' : 'text.secondary'}>
                  {over
                    ? `Please remove ${Math.abs(remaining)} characters`
                    : `${content.length} / ${MAX_CHARS} characters`}
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !content.trim() || over}
                  startIcon={loading ? <CircularProgress size={17} color="inherit" /> : <SendIcon />}
                  sx={{ px: 3, py: 1, fontWeight: 700 }}
                >
                  {loading ? 'Analyzing…' : 'Analyze question'}
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* Quick examples */}
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 1.25 }}>Quick examples</Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {samples.map(sample => (
                <Chip
                  key={sample}
                  label={sample}
                  clickable
                  variant="outlined"
                  onClick={() => setContent(prompts[sample])}
                  sx={{ fontWeight: 600 }}
                />
              ))}
            </Stack>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          {/* Analysis result */}
          {result && (
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                {/* Blue accent bar */}
                <Box sx={{ height: 4, bgcolor: 'primary.main' }} />

                <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                  {/* Header row */}
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ sm: 'center' }}
                    spacing={2}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <AutoAwesomeIcon color="primary" fontSize="small" />
                        <Typography variant="h6" fontWeight={800}>Analysis result</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        A concise classification based on the concepts in your question.
                      </Typography>
                    </Box>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`${confidence}% confidence`}
                      color={confidence >= 75 ? 'success' : 'warning'}
                      sx={{ fontWeight: 700, px: 0.5 }}
                    />
                  </Stack>

                  {/* Detail grid */}
                  <Grid container spacing={2.5} sx={{ mt: 1 }}>
                    {/* Topic box */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box
                        sx={{
                          p: 2.5,
                          height: '100%',
                          bgcolor: topicSoft[topic] || '#F8FAFC',
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: '.8px' }}>
                          Detected Topic
                        </Typography>
                        <Typography
                          variant="h5"
                          fontWeight={900}
                          sx={{ mt: 0.75, color: topicColor[topic] || topicColor.General }}
                        >
                          {topic}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Confidence + explanation */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: '.8px' }}>
                        Confidence Score
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mt: 0.75,
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">Classification confidence:</Typography>
                        <Typography fontWeight={900} color="primary.main">{confidence}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={confidence}
                        sx={{ height: 8, borderRadius: 4, bgcolor: '#E2E8F0' }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.65 }}>
                        {result?.question?.explanation || result?.explanation || fallbackExplanation(topic)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>

              {/* Similar questions */}
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>Similar questions</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Related questions from your study history.
                </Typography>
                {similar.length ? (
                  <Grid container spacing={2}>
                    {similar.map((item, index) => (
                      <Grid key={item._id || item.id || index} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <SimilarCard item={item} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}
                  >
                    <Typography fontWeight={700}>No similar questions found yet.</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Keep asking questions to build your personal study archive.
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          )}

        </Stack>
      </Container>
    </Box>
  );
}
