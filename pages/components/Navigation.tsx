/**
 * AI 租易用 - 统一导航组件
 * 可复用于所有页面的导航栏
 */

import React from 'react';
import Link from 'next/link';

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export interface NavigationProps {
  activePath?: string;
  variant?: 'horizontal' | 'vertical' | 'sidebar';
  items?: NavItem[];
  className?: string;
}

// 默认导航项配置
const defaultNavItems: NavItem[] = [
  {
    label: '首页',
    href: '/',
  },
  {
    label: '设备租赁',
    href: '/rental',
    children: [
      { label: '全部设备', href: '/rental' },
      { label: 'AI 电脑', href: '/rental/ai-pc' },
      { label: '开发板', href: '/rental/dev-board' },
      { label: '机器人', href: '/rental/robot' },
    ],
  },
  {
    label: '算力套餐',
    href: '/compute',
    children: [
      { label: '套餐列表', href: '/compute' },
      { label: '充值记录', href: '/compute/history' },
      { label: '使用统计', href: '/compute/stats' },
    ],
  },
  {
    label: 'AI 开发',
    href: '/development',
    children: [
      { label: '定制开发', href: '/development' },
      { label: '项目案例', href: '/development/cases' },
      { label: '技术文档', href: '/development/docs' },
    ],
  },
  {
    label: '学习论坛',
    href: '/forum',
    children: [
      { label: '社区首页', href: '/forum' },
      { label: '技术讨论', href: '/forum/tech' },
      { label: '项目分享', href: '/forum/projects' },
      { label: '问答专区', href: '/forum/qa' },
    ],
  },
  {
    label: '企业服务的',
    href: '/enterprise',
    children: [
      { label: '企业服务', href: '/enterprise' },
      { label: '批量采购', href: '/enterprise/bulk' },
      { label: '定制方案', href: '/enterprise/solution' },
    ],
  },
  {
    label: '分销合作',
    href: '/distribution',
    children: [
      { label: '分销计划', href: '/distribution' },
      { label: '推广数据', href: '/distribution/stats' },
      { label: '佣金提现', href: '/distribution/withdraw' },
    ],
  },
  {
    label: '用户中心',
    href: '/user',
    children: [
      { label: '个人中心', href: '/user' },
      { label: '我的订单', href: '/user/orders' },
      { label: '账户设置', href: '/user/settings' },
    ],
  },
];

/**
 * 导航组件
 */
export const Navigation: React.FC<NavigationProps> = ({
  activePath = '/',
  variant = 'horizontal',
  items = defaultNavItems,
  className = '',
}) => {
  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isActive = activePath === item.href || activePath.startsWith(item.href + '/');
    
    const baseClasses = {
      horizontal: `px-4 py-2 rounded-lg transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`,
      vertical: `px-3 py-2 rounded-md transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`,
      sidebar: `px-4 py-3 rounded-lg transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`,
    };

    return (
      <li key={item.href} className="relative">
        <Link href={item.href} className={baseClasses[variant]}>
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.label}
        </Link>
        
        {/* 子菜单 */}
        {item.children && variant === 'horizontal' && (
          <ul className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover:block">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        
        {/* 垂直/侧边栏模式的子菜单 */}
        {item.children && variant !== 'horizontal' && (
          <ul className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activePath === child.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const containerClasses = {
    horizontal: `flex items-center space-x-2 ${className}`,
    vertical: `flex flex-col space-y-1 ${className}`,
    sidebar: `flex flex-col space-y-2 ${className}`,
  };

  return (
    <nav className={variant === 'horizontal' ? 'bg-white shadow-sm' : ''}>
      <ul className={containerClasses[variant]}>
        {items.map((item) => renderNavItem(item))}
      </ul>
    </nav>
  );
};

/**
 * 顶部导航栏组件（带 Logo 和用户区）
 */
export const TopNavBar: React.FC<{ activePath?: string }> = ({ activePath = '/' }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">AI 租易用</span>
            </Link>
          </div>
          
          {/* 主导航 */}
          <Navigation activePath={activePath} variant="horizontal" />
          
          {/* 用户操作区 */}
          <div className="flex items-center space-x-4">
            <Link href="/user" className="text-gray-700 hover:text-blue-600">
              登录
            </Link>
            <Link
              href="/user/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              注册
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * 侧边栏导航组件（用于后台页面）
 */
export const SidebarNav: React.FC<{ activePath?: string }> = ({ activePath = '/' }) => {
  const dashboardItems: NavItem[] = [
    { label: '仪表盘', href: '/user' },
    { label: '我的订单', href: '/user/orders' },
    { label: '租赁管理', href: '/user/rentals' },
    { label: '算力账户', href: '/user/compute' },
    { label: '项目进度', href: '/user/projects' },
    { label: '分销数据', href: '/user/distribution' },
    { label: '账户设置', href: '/user/settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <Link href="/" className="text-xl font-bold">AI 租易用</Link>
      </div>
      <Navigation
        activePath={activePath}
        variant="sidebar"
        items={dashboardItems}
      />
    </aside>
  );
};

export default Navigation;
