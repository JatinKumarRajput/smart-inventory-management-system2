// src/components/Inventory.js
import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { inventoryAPI, productsAPI } from '../services/api';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentInventory, setCurrentInventory] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: '',
    low_stock_threshold: '',
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventory(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load inventory');
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

  const handleOpenDialog = (inventoryItem = null) => {
    if (inventoryItem) {
      setEditMode(true);
      setCurrentInventory(inventoryItem);
      setFormData({
        product_id: inventoryItem[1],
        quantity: inventoryItem[2],
        low_stock_threshold: inventoryItem[3],
      });
    } else {
      setEditMode(false);
      setCurrentInventory(null);
      setFormData({
        product_id: '',
        quantity: '',
        low_stock_threshold: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      product_id: '',
      quantity: '',
      low_stock_threshold: '',
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
      if (editMode) {
        await inventoryAPI.update(currentInventory[0], formData);
        setSuccess('Inventory updated successfully');
      } else {
        await inventoryAPI.create(formData);
        setSuccess('Inventory item added successfully');
      }
      handleCloseDialog();
      fetchInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteClick = (inventoryItem) => {
    setCurrentInventory(inventoryItem);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    try {
      await inventoryAPI.delete(currentInventory[0]);
      setSuccess('Inventory item deleted successfully');
      setOpenDeleteDialog(false);
      fetchInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete inventory item');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p[0] === productId);
    return product ? product[1] : 'Unknown Product';
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) {
      return <Chip label="Out of Stock" color="error" size="small" />;
    } else if (quantity <= threshold) {
      return <Chip label="Low Stock" color="warning" size="small" />;
    } else {
      return <Chip label="In Stock" color="success" size="small" />;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Inventory Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Inventory Item
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
                  <TableCell>Product Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Low Stock Threshold</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No inventory data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  inventory.map((item) => (
                    <TableRow key={item[0]}>
                      <TableCell>{item[0]}</TableCell>
                      <TableCell>{getProductName(item[1])}</TableCell>
                      <TableCell>{item[2]}</TableCell>
                      <TableCell>{item[3]}</TableCell>
                      <TableCell>{getStockStatus(item[2], item[3])}</TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(item)}
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

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editMode ? 'Edit Inventory' : 'Add New Inventory Item'}</DialogTitle>
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
              disabled={editMode}
            >
              {products.map((product) => (
                <MenuItem key={product[0]} value={product[0]}>
                  {product[1]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Low Stock Threshold"
              name="low_stock_threshold"
              type="number"
              value={formData.low_stock_threshold}
              onChange={handleChange}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
              {editMode ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this inventory item?
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

export default Inventory;


