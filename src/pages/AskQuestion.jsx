import { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, CircularProgress, Chip, Card, CardContent, LinearProgress } from '@mui/material';
import api from '../api/api';
import Navbar from '../components/Navbar';

const toPercent = (score) => Math.round(Math.max(0, Math.min(1, Number(score) || 0)) * 100);

const getConfidenceMeta = (score) => {
  const percentage = toPercent(score);
  if (percentage >= 85) return { color: 'success', label: 'High confidence', helper: 'The question strongly matches this topic.' };
  if (percentage >= 70) return { color: 'primary', label: 'Good confidence', helper: 'The topic is likely correct.' };
  if (percentage >= 55) return { color: 'warning', label: 'Needs review', helper: 'The AI found a match, but it is less certain.' };
  return { color: 'error', label: 'Low confidence', helper: 'Try adding more subject-specific details.' };
};

const SimilarityCard = ({ question }) => {
  const percentage = toPercent(question.score);
  
  let color = 'warning';
  let hexColor = '#ff9800';
  if (percentage >= 90) {
    color = 'success';
    hexColor = '#4caf50';
  } else if (percentage >= 75) {
    color = 'primary';
    hexColor = '#2196f3';
  }

  return (
    <Card 
      sx={{ 
        mb: 2, 
        transition: 'all 0.3s ease',
        borderLeft: `6px solid ${hexColor}`,
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardContent sx={{ pb: '16px !important' }}>
        <Typography variant="body1" fontWeight="500" sx={{ mb: 2 }}>
          "{question.content}"
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
          <Chip 
            label={`${percentage}% Match`} 
            color={color} 
            size="small" 
            sx={{ fontWeight: 'bold' }} 
          />
          <Typography variant="body2" color="text.secondary">
            Similarity
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          color={color}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </CardContent>
    </Card>
  );
};

const AskQuestion = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/questions', { content });
      setResult(res.data);
      setContent('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confidence = getConfidenceMeta(result?.confidenceScore);
  const confidencePercent = toPercent(result?.confidenceScore);

  return (
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', pb: 4 }}>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            borderRadius: 3, 
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)' 
          }}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: '#1a237e' }}>
            Ask a Study Question
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
            Get an instant topic prediction, confidence level, and similar questions from your study history.
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="e.g., How does the process of photosynthesis work in C4 plants?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={loading}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#fff',
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !content.trim()}
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Analyze & Submit'}
            </Button>
          </Box>

          {error && (
            <Paper sx={{ p: 2, bgcolor: '#ffebee', color: '#c62828', mb: 3, borderRadius: 2 }}>
              <Typography>{error}</Typography>
            </Paper>
          )}

          {result && (
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #eee' }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Assigned Topic:
                  </Typography>
                  <Chip 
                    label={result.question.topic} 
                    color="secondary" 
                    sx={{ fontWeight: 'bold', px: 1 }} 
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Typography variant="body1" fontWeight="bold" color="text.secondary">
                    Classification Confidence:
                  </Typography>
                  <Box sx={{ flexGrow: 1, maxWidth: 360, width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {confidencePercent}% · {confidence.label}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={confidencePercent} 
                      color={confidence.color}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                      {confidence.helper}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                Similar Previously Asked Questions
              </Typography>
              
              {result.similarQuestions?.length > 0 ? (
                <Box>
                  {result.similarQuestions.map(sq => (
                    <SimilarityCard key={sq.id} question={sq} />
                  ))}
                </Box>
              ) : (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: '#f8f9fa', 
                    borderRadius: 2,
                    border: '1px dashed #ccc'
                  }}
                >
                  <Typography color="text.secondary">
                    No highly similar questions found. You are the first to ask this!
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AskQuestion;
