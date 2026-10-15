import { createBrowserRouter } from 'react-router-dom';

import AdminLayout from '@/layouts/AdminLayout';
import ManagerLayout from '@/layouts/ManagerLayout';
import StaffLayout from '@/layouts/StaffLayout';

import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/auth/LoginPage';

import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';

import ManagerDashboardPage from '@/pages/manager/ManagerDashboardPage';
import ProductManagementPage from '@/pages/manager/ProductManagementPage';
import SupplierManagementPage from '@/pages/manager/SupplierManagementPage';
import ReceiptManagementPage from '@/pages/manager/ReceiptManagementPage';
import ReceiptStatisticsPage from '@/pages/manager/ReceiptStatisticsPage';

import ProductLookupPage from '@/pages/staff/ProductLookupPage';
import ReceiptCreatePage from '@/pages/staff/ReceiptCreatePage';
import IssueCreatePage from '@/pages/staff/IssueCreatePage';

/**
 * 3 cổng giao diện tách biệt (mỗi cổng 1 layout riêng):
 *   /admin/*    -> Admin (quản lý user, phân quyền)
 *   /manager/*  -> Quản lý kho
 *   /staff/*    -> Nhân viên kho
 * TODO (TV1 - tuần 2): bọc mỗi cổng bằng route guard kiểm tra đăng nhập + vai trò.
 */
export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
    ],
  },
  {
    path: '/manager',
    element: <ManagerLayout />,
    children: [
      { index: true, element: <ManagerDashboardPage /> },
      { path: 'products', element: <ProductManagementPage /> },
      { path: 'suppliers', element: <SupplierManagementPage /> },
      { path: 'receipts', element: <ReceiptManagementPage /> },
      { path: 'statistics', element: <ReceiptStatisticsPage /> },
    ],
  },
  {
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { index: true, element: <ProductLookupPage /> },
      { path: 'receipts/new', element: <ReceiptCreatePage /> },
      { path: 'issues/new', element: <IssueCreatePage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
