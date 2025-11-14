import { eventHandler } from 'h3';
import { useResponseSuccess } from '~/utils/response';

export default eventHandler(() => {
  const mockCustomers = [
    {
      id: 1,
      name: '张三',
      email: 'zhangsan@example.com',
      phone: '13800138001',
      address: '北京市朝阳区',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 2,
      name: '李四',
      email: 'lisi@example.com',
      phone: '13800138002',
      address: '上海市浦东新区',
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
    {
      id: 3,
      name: '王五',
      email: 'wangwu@example.com',
      phone: '13800138003',
      address: '广州市天河区',
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03',
    },
  ];

  return useResponseSuccess(mockCustomers);
});
