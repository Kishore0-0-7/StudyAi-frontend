import { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter } from '@mui/x-data-grid';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { format, isValid } from 'date-fns';

const formatDate = (value, pattern = 'MMM dd, yyyy h:mm a') => {
  const rawValue = value && typeof value === 'object' && 'value' in value ? value.value : value;
  const date = rawValue instanceof Date ? rawValue : new Date(rawValue);
  return isValid(date) ? format(date, pattern) : 'Unknown date';
};

const CustomToolbar = () => {
  return (
    <GridToolbarContainer sx={{ p: 1, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
      <Box>
        <GridToolbarFilterButton />
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <GridToolbarQuickFilter />
        <GridToolbarExport 
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ fileName: 'question_history.csv' }}
        />
      </Box>
    </GridToolbarContainer>
  );
}

const StatCard = ({ title, value, subtitle }) => (
  <Card sx={{ 
    height: '100%', 
    borderRadius: 3, 
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: '1px solid #f0f0f0'
  }}>
    <CardContent>
      <Typography color="text.secondary" variant="subtitle2" fontWeight="bold" sx={{ textTransform: 'uppercase' }} gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const History = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/questions');
        const formattedData = res.data.map((q) => ({
          id: q._id,
          content: q.content,
          topic: q.topic,
          createdAt: q.createdAt ? new Date(q.createdAt) : null,
        }));
        setQuestions(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const columns = [
    { 
      field: 'createdAt', 
      headerName: 'Date', 
      width: 200,
      valueFormatter: (value) => formatDate(value),
      type: 'dateTime'
    },
    { 
      field: 'topic', 
      headerName: 'Topic', 
      width: 180,
      renderCell: (params) => (
        <Box sx={{ 
          bgcolor: '#e3f2fd', 
          color: '#1976d2', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 2,
          fontWeight: 500,
          fontSize: '0.85rem'
        }}>
          {params.value}
        </Box>
      )
    },
    { 
      field: 'content', 
      headerName: 'Question', 
      flex: 1, 
      minWidth: 400 
    },
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    if (!questions.length) return { total: 0, commonTopic: 'N/A', latest: 'N/A' };
    
    // Most common topic
    const counts = {};
    let max = 0;
    let common = 'N/A';
    questions.forEach(q => {
      counts[q.topic] = (counts[q.topic] || 0) + 1;
      if (counts[q.topic] > max) {
        max = counts[q.topic];
        common = q.topic;
      }
    });

    // Latest date
    const validDates = questions.map((q) => q.createdAt).filter((date) => date && isValid(date));
    const latestDate = validDates.reduce((latest, date) => date > latest ? date : latest, validDates[0]);

    return {
      total: questions.length,
      commonTopic: common,
      latest: latestDate ? formatDate(latestDate, 'MMM dd, yyyy') : 'N/A'
    };
  }, [questions]);

  if (loading && questions.length === 0) {
    return (
      <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
        <Navbar />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', pb: 6 }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4, color: '#172554' }}>
          Question History
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard title="Total Questions" value={stats.total} subtitle="Questions asked so far" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard title="Most Common Topic" value={stats.commonTopic} subtitle="Your main area of focus" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard title="Latest Question" value={stats.latest} subtitle="When you last studied" />
          </Grid>
        </Grid>

        {/* DataGrid */}
        <Paper 
          elevation={0} 
          sx={{ 
            height: 650, 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            bgcolor: 'background.paper',
            overflow: 'hidden'
          }}
        >
          <DataGrid
            rows={questions}
            columns={columns}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 15 },
              },
              sorting: {
                sortModel: [{ field: 'createdAt', sort: 'desc' }],
              },
            }}
            pageSizeOptions={[15, 25, 50, 100]}
            disableRowSelectionOnClick
            slots={{
              toolbar: CustomToolbar,
            }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              border: 0,
              minWidth: 0,
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: '#f8f9fa',
                color: '#555',
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                }
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              }
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
};

export default History;
