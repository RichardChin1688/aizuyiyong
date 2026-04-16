/**
 * 数据库种子脚本
 * 用于初始化测试数据
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种...');

  // 1. 创建测试用户
  const user = await prisma.user.upsert({
    where: { phone: '13800138000' },
    update: {},
    create: {
      phone: '13800138000',
      nickname: '测试用户',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
      gender: 1,
      userType: 1,
      status: 1,
      profile: {
        create: {
          email: 'test@example.com',
          realName: '测试员',
          certificationStatus: 2,
        },
      },
      tokenWallet: {
        create: {
          balance: 10000,
        },
      },
    },
    include: { profile: true, tokenWallet: true },
  });

  console.log(`✅ 创建用户：${user.nickname} (${user.phone})`);

  // 2. 创建测试设备
  const devices = [
    {
      name: 'NVIDIA Jetson Orin Nano 开发者套件',
      category: '边缘设备',
      brand: 'NVIDIA',
      model: 'Orin Nano',
      specs: {
        cpu: '6-core Arm® Cortex®-A78AE',
        gpu: '1024-core NVIDIA Ampere architecture GPU',
        memory: '8GB 128-bit LPDDR5',
        storage: '16GB eMMC',
      },
      dailyPrice: 50,
      weeklyPrice: 300,
      monthlyPrice: 1000,
      deposit: 2000,
      stockTotal: 10,
      stockAvailable: 10,
      isHot: true,
    },
    {
      name: 'Raspberry Pi 5 开发板',
      category: '开发板',
      brand: 'Raspberry Pi',
      model: 'Pi 5',
      specs: {
        cpu: 'Broadcom BCM2712, Quad core Cortex-A76',
        memory: '8GB LPDDR4X',
        connectivity: 'Dual-band Wi-Fi, Bluetooth 5.0',
      },
      dailyPrice: 20,
      weeklyPrice: 120,
      monthlyPrice: 400,
      deposit: 500,
      stockTotal: 20,
      stockAvailable: 20,
      isHot: true,
    },
    {
      name: 'Intel NUC 13 Pro 工作站',
      category: '工作站',
      brand: 'Intel',
      model: 'NUC13PRO',
      specs: {
        cpu: 'Intel Core i7-1360P',
        gpu: 'Intel Iris Xe',
        memory: '32GB DDR4',
        storage: '1TB NVMe SSD',
      },
      dailyPrice: 100,
      weeklyPrice: 600,
      monthlyPrice: 2000,
      deposit: 5000,
      stockTotal: 5,
      stockAvailable: 5,
      isHot: false,
    },
    {
      name: '宇树 Go2 教育机器人',
      category: '机器人',
      brand: 'Unitree',
      model: 'Go2',
      specs: {
        joints: '12-29 DOF',
        battery: '2-4 hours',
        payload: '12kg',
        sensors: 'LiDAR, Depth Camera',
      },
      dailyPrice: 500,
      weeklyPrice: 3000,
      monthlyPrice: 10000,
      deposit: 20000,
      stockTotal: 3,
      stockAvailable: 3,
      isHot: true,
    },
  ];

  for (const deviceData of devices) {
    const device = await prisma.device.create({
      data: deviceData as any,
    });
    console.log(`✅ 创建设备：${device.name}`);
  }

  // 3. 创建 Token 套餐
  const packages = [
    { name: '体验套餐', tokenAmount: 100, price: 9.9, validityDays: 7 },
    { name: '入门套餐', tokenAmount: 500, price: 39.9, validityDays: 30, isPopular: true },
    { name: '进阶套餐', tokenAmount: 2000, price: 129.9, validityDays: 90, isPopular: true },
    { name: '专业套餐', tokenAmount: 10000, price: 499.9, validityDays: 365 },
    { name: '企业套餐', tokenAmount: 50000, price: 1999.9, validityDays: 365 },
  ];

  for (const pkg of packages) {
    await prisma.tokenPackage.create({
      data: {
        ...pkg,
        status: 1,
      },
    });
    console.log(`✅ 创建套餐：${pkg.name}`);
  }

  // 4. 创建优惠券
  await prisma.coupon.create({
    data: {
      name: '新人优惠券',
      type: 1, // 满减
      discountValue: 20,
      minAmount: 100,
      totalCount: 1000,
      issuedCount: 0,
      validFrom: new Date(),
      validTo: new Date('2026-12-31'),
      status: 1,
    },
  });
  console.log('✅ 创建优惠券：新人优惠券');

  console.log('🎉 播种完成!');
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
