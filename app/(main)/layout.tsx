import DashboardLayout from '@/components/dashboard-layout'
import React, { ReactNode } from 'react'


interface DashboardLayoutProps {
  children: ReactNode
}

const DashboardLayoutComponent: React.FC<DashboardLayoutProps> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>
}

export default DashboardLayoutComponent
