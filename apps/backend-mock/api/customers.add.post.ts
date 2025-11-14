import { eventHandler, readBody } from 'h3';
import { useResponseSuccess } from '~/utils/response';

export default eventHandler(async (event) => {
  const body = await readBody(event);

  // 模拟添加客户，返回带ID的客户信息
  const newCustomer = {
    id: Math.floor(Math.random() * 1000) + 100, // 生成随机ID
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return useResponseSuccess(newCustomer);
});
