# 前端接入 Supabase SDK 指南

## 📦 安装依赖

```bash
npm install @supabase/supabase-js
```

## 🔧 配置 Supabase 客户端

创建 `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 类型定义
export type User = {
  id: number;
  phone: string;
  nickname: string | null;
  avatar: string | null;
  userType: number;
};

export type Device = {
  id: number;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  dailyPrice: string;
  weeklyPrice: string | null;
  monthlyPrice: string | null;
  deposit: string;
  stockAvailable: number;
  isHot: boolean;
  imageUrls: any;
};

export type RentalOrder = {
  id: number;
  orderNo: string;
  userId: number;
  deviceId: number;
  rentalType: number;
  rentalDays: number;
  unitPrice: string;
  totalAmount: string;
  depositAmount: string;
  startDate: string;
  endDate: string;
  status: number;
  paidAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  returnedAt: string | null;
};
```

## 🔐 认证模块

创建 `src/lib/auth.ts`:

```typescript
import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// 存储令牌
function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// 发送验证码
export async function sendSmsCode(phone: string) {
  const response = await fetch(`${API_BASE}/auth/sms/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data;
}

// 短信登录
export async function smsLogin(phone: string, code: string) {
  const response = await fetch(`${API_BASE}/auth/sms/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  setTokens(data.data.tokens.accessToken, data.data.tokens.refreshToken);
  return data.data;
}

// 获取当前用户
export async function getCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;
  
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  const data = await response.json();
  if (!response.ok) return null;
  return data.data;
}

// 登出
export async function logout() {
  const token = getAccessToken();
  if (token) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
  }
  clearTokens();
}

// 刷新令牌
export async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('无刷新令牌');
  
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  
  setTokens(data.data.accessToken, refresh);
  return data.data.accessToken;
}
```

## 📱 设备 API

创建 `src/api/device.ts`:

```typescript
import { getAccessToken } from '../lib/auth';
import { Device } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface DeviceListParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isHot?: boolean;
}

export async function getDeviceList(params: DeviceListParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value));
  });
  
  const response = await fetch(`${API_BASE}/devices?${searchParams}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data;
}

export async function getDeviceById(id: number) {
  const response = await fetch(`${API_BASE}/devices/${id}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data;
}

export async function getHotDevices(limit = 10) {
  const response = await fetch(`${API_BASE}/devices/hot?limit=${limit}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data;
}
```

## 🛒 租赁订单 API

创建 `src/api/rental.ts`:

```typescript
import { getAccessToken } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data;
}

export async function getRentalOrders(params = {}) {
  const searchParams = new URLSearchParams(params as any);
  return request(`/rentals?${searchParams}`);
}

export async function getRentalOrderById(id: number) {
  return request(`/rentals/${id}`);
}

export async function createRentalOrder(data: {
  deviceId: number;
  rentalType: number;
  rentalDays: number;
  startDate: string;
  endDate: string;
  address: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    city: string;
    district: string;
    detailAddress: string;
  };
}) {
  return request('/rentals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function payRentalOrder(id: number, paymentMethod: number) {
  return request(`/rentals/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify({ paymentMethod }),
  });
}

export async function cancelRentalOrder(id: number) {
  return request(`/rentals/${id}/cancel`, { method: 'POST' });
}

export async function confirmReceive(id: number) {
  return request(`/rentals/${id}/confirm-receive`, { method: 'POST' });
}

export async function returnDevice(id: number) {
  return request(`/rentals/${id}/return`, { method: 'POST' });
}
```

## 💰 Token API

创建 `src/api/token.ts`:

```typescript
import { getAccessToken } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message);
  return data.data;
}

export async function getTokenPackages() {
  return request('/tokens/packages');
}

export async function getTokenWallet() {
  return request('/tokens/wallet');
}

export async function getTokenTransactions(params = {}) {
  const searchParams = new URLSearchParams(params as any);
  return request(`/tokens/transactions?${searchParams}`);
}

export async function rechargeToken(packageId: number, paymentMethod: number) {
  return request('/tokens/recharge', {
    method: 'POST',
    body: JSON.stringify({ packageId, paymentMethod }),
  });
}

export async function consumeToken(amount: number, description: string, relatedOrderNo?: string) {
  return request('/tokens/consume', {
    method: 'POST',
    body: JSON.stringify({ amount, description, relatedOrderNo }),
  });
}
```

## 🔌 Vue/React 集成示例

### Vue 3 组合式 API

```typescript
// src/composables/useAuth.ts
import { ref, computed } from 'vue';
import { smsLogin, logout, getCurrentUser } from '../lib/auth';

export function useAuth() {
  const user = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  const isAuthenticated = computed(() => !!user.value);
  
  async function login(phone: string, code: string) {
    loading.value = true;
    error.value = null;
    try {
      const result = await smsLogin(phone, code);
      user.value = result.user;
      return result;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }
  
  async function loadUser() {
    try {
      user.value = await getCurrentUser();
    } catch {
      user.value = null;
    }
  }
  
  async function doLogout() {
    await logout();
    user.value = null;
  }
  
  return { user, loading, error, isAuthenticated, login, loadUser, logout: doLogout };
}
```

### React Hooks

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { smsLogin, logout, getCurrentUser } from '../lib/auth';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = !!user;
  
  const login = useCallback(async (phone: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await smsLogin(phone, code);
      setUser(result.user);
      return result;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadUser = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch {
      setUser(null);
    }
  }, []);
  
  const doLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  return { user, loading, error, isAuthenticated, login, loadUser, logout: doLogout };
}
```

## 📝 环境变量配置

创建 `.env` 或 `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## ⚠️ 注意事项

1. **令牌刷新**: 在请求拦截器中处理 401 错误，自动刷新令牌
2. **错误处理**: 统一错误处理，显示友好的错误提示
3. **加载状态**: 所有异步操作都要有 loading 状态
4. **TypeScript 类型**: 为所有 API 响应定义类型
5. **请求取消**: 使用 AbortController 取消未完成的请求

---

**大内总管·王德发 敬上** 🫡  
祝陛下前端对接顺利！
