import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { transactionsAPI, productsAPI } from '../services/api';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    transaction_type: '',
    quantity_change: '',
  });

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getAll();
      setTransactions(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      product_id: '',
      transaction_type: '',
      quantity_change: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      product_id: '',
      transaction_type: '',
      quantity_change: '',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      // Get user id from localStorage or session (adjust as per your auth)
      const user_id = 1; // Replace with actual user ID logic!
      await transactionsAPI.create({
        ...formData,
        user_id: user_id,
      });
      setSuccess('Transaction recorded successfully');
      handleCloseDialog();
      fetchTransactions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Transactions</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Transaction
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
                  <TableCell>Transaction ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>User ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity Change</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx[0]}>
                      <TableCell>{tx[0]}</TableCell>
                      <TableCell>{tx[2]}</TableCell>
                      <TableCell>{tx[3]}</TableCell>
                      <TableCell>{tx[4]}</TableCell>
                      <TableCell>{tx[5]}</TableCell>
                      <TableCell>
                        {tx[6] ? new Date(tx[6]).toLocaleString() : ''}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Add Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              select
              label="Product"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              margin="normal"
              required
            >
              {products.map((product) => (
                <MenuItem key={product[0]} value={product[0]}>
                  {product[1]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Transaction Type"
              name="transaction_type"
              value={formData.transaction_type}
              onChange={handleChange}
              margin="normal"
              required
            >
              <MenuItem value="purchase">Purchase (+)</MenuItem>
              <MenuItem value="sale">Sale (-)</MenuItem>
              <MenuItem value="adjustment">Adjustment</MenuItem>
            </TextField>
            <TextField
                fullWidth
                label="Quantity Change"
                name="quantity_change"
                type="number"
                value={formData.quantity_change}
                onChange={handleChange}
                margin="normal"
                required
                helperText="Positive for purchases/additions, negative for sales/removals"  // NEW TEXT
                />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}

export default Transactions;

