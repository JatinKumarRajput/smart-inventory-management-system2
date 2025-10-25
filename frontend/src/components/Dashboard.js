// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { dashboardAPI } from '../services/api';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username') || 'User';
  
  const [stats, setStats] = useState({
    total_products: 0,
    total_suppliers: 0,
    low_stock_items: 0,
    active_alerts: 0,
  });
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [transactionTrends, setTransactionTrends] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data
      const [statsRes, inventoryRes, trendsRes, lowStockRes, categoryRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getInventoryStatus(),
        dashboardAPI.getTransactionTrends(),
        dashboardAPI.getLowStockProducts(),
        dashboardAPI.getCategoryDistribution(),
      ]);

      setStats(statsRes.data);
      
      // Format inventory status for pie chart
      const invData = inventoryRes.data;
      setInventoryStatus([
        { name: 'In Stock', value: invData.in_stock, color: '#4caf50' },
        { name: 'Low Stock', value: invData.low_stock, color: '#ff9800' },
        { name: 'Out of Stock', value: invData.out_of_stock, color: '#f44336' },
      ]);

      // Format transaction trends
      const trendsData = trendsRes.data;
      const groupedByDate = {};
      trendsData.forEach(([date, type, count]) => {
        if (!groupedByDate[date]) {
          groupedByDate[date] = { date, purchase: 0, sale: 0, adjustment: 0 };
        }
        groupedByDate[date][type] = count;
      });
      setTransactionTrends(Object.values(groupedByDate));

      // Format low stock products for bar chart
      const lowStockData = lowStockRes.data.map(([name, qty, threshold]) => ({
        name: name.substring(0, 15), // Truncate long names
        quantity: qty,
        threshold: threshold,
      }));
      setLowStockProducts(lowStockData);

      // Format category distribution
      const categoryData = categoryRes.data.map(([category, count]) => ({
        name: category,
        value: count,
      }));
      setCategoryDistribution(categoryData);

      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { title: 'Total Products', value: stats.total_products, icon: <InventoryIcon fontSize="large" />, color: '#1976d2' },
    { title: 'Suppliers', value: stats.total_suppliers, icon: <LocalShippingIcon fontSize="large" />, color: '#388e3c' },
    { title: 'Low Stock Items', value: stats.low_stock_items, icon: <WarehouseIcon fontSize="large" />, color: '#f57c00' },
    { title: 'Active Alerts', value: stats.active_alerts, icon: <NotificationsActiveIcon fontSize="large" />, color: '#d32f2f' },
  ];

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

  return (
    <Layout>
      <Container maxWidth="xl">
        <Typography variant="h4" gutterBottom>
          Welcome back, {username}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Role: {userRole}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {statsConfig.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', borderTop: `4px solid ${stat.color}` }}>
                    <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                    <Typography variant="h4" component="div">{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary">{stat.title}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            {/* Charts Row 1 */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Inventory Status Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Inventory Status</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={inventoryStatus} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {inventoryStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Category Distribution Pie Chart */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Product Categories</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>

            {/* Charts Row 2 */}
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {/* Transaction Trends Line Chart */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Transaction Trends (Last 30 Days)</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={transactionTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="purchase" stroke="#4caf50" strokeWidth={2} />
                      <Line type="monotone" dataKey="sale" stroke="#f44336" strokeWidth={2} />
                      <Line type="monotone" dataKey="adjustment" stroke="#2196f3" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Low Stock Products Bar Chart */}
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>Top 10 Low Stock Products</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={lowStockProducts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="quantity" fill="#f44336" name="Current Quantity" />
                      <Bar dataKey="threshold" fill="#ff9800" name="Threshold" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Layout>
  );
}

export default Dashboard;
