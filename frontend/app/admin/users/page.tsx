'use client';

import { useState } from 'react';

export default function AdminUsersPage() {
  const [users] = useState([
    { id: '1', fullName: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0912345678', pets: 2, bookings: 5, totalSpent: '1.2M', isActive: true, createdAt: '2026-10-01' },
    { id: '2', fullName: 'Trần Thị B', email: 'tranthib@email.com', phone: '0987654321', pets: 1, bookings: 3, totalSpent: '800K', isActive: true, createdAt: '2026-10-05' },
    { id: '3', fullName: 'Lê Văn C', email: 'levanc@email.com', phone: '0909123456', pets: 3, bookings: 8, totalSpent: '2.5M', isActive: true, createdAt: '2026-09-20' },
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h1>
        <p className="text-gray-600">Danh sách khách hàng đã đăng ký</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Liên hệ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Thú cưng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bookings</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tổng chi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{user.fullName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-600">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.pets}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.bookings}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.totalSpent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.createdAt}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Xem
                      </button>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Sửa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
