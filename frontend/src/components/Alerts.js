// src/components/Alerts.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { alertsAPI, inventoryAPI } from '../services/api';
import {
  Container,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Box,
  CircularProgress,
  Chip,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [formData, setFormData] = useState({
    inventory_id: '',
    alert_type: '',
    message: '',
    is_active: true,
  });

  useEffect(() => {
    fetchAlerts();
    fetchInventory();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      inventory_id: '',
      alert_type: '',
      message: '',
      is_active: true,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      await alertsAPI.create(formData);
      setSuccess('Alert created successfully');
      handleCloseDialog();
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleToggleActive = async (alert) => {
    try {
      await alertsAPI.update(alert[0], { is_active: !alert[6] });
      setSuccess('Alert status updated');
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update alert');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteClick = (alert) => {
    setCurrentAlert(alert);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await alertsAPI.delete(currentAlert[0]);
      setSuccess('Alert deleted successfully');
      setOpenDeleteDialog(false);
      fetchAlerts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete alert');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'low_stock':
        return 'warning';
      case 'high_stock':
        return 'info';
      case 'anomaly':
        return 'error';
      case 'critical':
        return 'error';
      case 'reorder':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Alerts & Notifications</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Alert
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No alerts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert[0]}>
                      <TableCell>{alert[0]}</TableCell>
                      <TableCell>{alert[3]}</TableCell>
                      <TableCell>
                        <Chip 
                          label={alert[4]} 
                          color={getAlertTypeColor(alert[4])} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{alert[5]}</TableCell>
                      <TableCell>
                        <Switch
                          checked={alert[6]}
                          onChange={() => handleToggleActive(alert)}
                          color="primary"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(alert)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Alert Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add New Alert</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Inventory Item"
              name="inventory_id"
              value={formData.inventory_id}
              onChange={handleChange}
              margin="normal"
              required
            >
              {inventory.map((item) => (
                <MenuItem key={item[0]} value={item[0]}>
                  Product ID: {item[1]} (Qty: {item[2]})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Alert Type"
              name="alert_type"
              value={formData.alert_type}
              onChange={handleChange}
              margin="normal"
              required
            >
              <MenuItem value="low_stock">Low Stock</MenuItem>
              <MenuItem value="high_stock">High Stock</MenuItem>
              <MenuItem value="anomaly">Anomaly</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="reorder">Reorder</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              margin="normal"
              required
              multiline
              rows={3}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this alert?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default Alerts;

