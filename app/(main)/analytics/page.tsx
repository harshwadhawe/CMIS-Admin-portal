"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

// Theme colors matching Texas A&M Maroon and complementary palette
// Colors aligned with the website's maroon theme
const THEME_COLORS = {
  primary: "#500000", // Texas A&M Maroon
  primaryLight: "#800020", // Lighter maroon
  secondary: "#A52A2A", // Medium maroon/brown
  accent: "#C07850", // Warm tan/brown accent
  success: "#10b981", // Green for success metrics
  warning: "#f59e0b", // Amber for pending/warning
  muted: "#9ca3af", // Muted gray for secondary bars
  chart1: "#500000", // Maroon - Primary brand color
  chart2: "#800020", // Lighter maroon
  chart3: "#A52A2A", // Medium brown-maroon
  chart4: "#C07850", // Tan/brown accent
  chart5: "#D4A574", // Light tan
};

const CHART_COLORS = [
  THEME_COLORS.chart1,
  THEME_COLORS.chart2,
  THEME_COLORS.chart3,
  THEME_COLORS.chart4,
  THEME_COLORS.chart5,
];

// Mock data for Event Analytics
const eventData = [
  { month: "Jan", events: 4, participants: 120, competitions: 2, workshops: 1, seminars: 1 },
  { month: "Feb", events: 6, participants: 180, competitions: 3, workshops: 2, seminars: 1 },
  { month: "Mar", events: 8, participants: 250, competitions: 4, workshops: 2, seminars: 2 },
  { month: "Apr", events: 7, participants: 220, competitions: 3, workshops: 2, seminars: 2 },
  { month: "May", events: 9, participants: 290, competitions: 5, workshops: 2, seminars: 2 },
  { month: "Jun", events: 10, participants: 320, competitions: 5, workshops: 3, seminars: 2 },
];

const eventTypesData = [
  { name: "Competitions", value: 22, percentage: 47.8 },
  { name: "Workshops", value: 12, percentage: 26.1 },
  { name: "Seminars", value: 10, percentage: 21.7 },
  { name: "Networking", value: 2, percentage: 4.4 },
];

// Mock data for Student Placement Analytics
const placementData = [
  { month: "Jan", placed: 15, pending: 8, total: 23 },
  { month: "Feb", placed: 22, pending: 12, total: 34 },
  { month: "Mar", placed: 18, pending: 10, total: 28 },
  { month: "Apr", placed: 25, pending: 15, total: 40 },
  { month: "May", placed: 30, pending: 18, total: 48 },
  { month: "Jun", placed: 28, pending: 12, total: 40 },
];

const placementByCategory = [
  { category: "Software Engineering", placed: 45, total: 62 },
  { category: "Data Science", placed: 32, total: 48 },
  { category: "Product Management", placed: 28, total: 40 },
  { category: "Consulting", placed: 22, total: 35 },
  { category: "Finance", placed: 18, total: 28 },
];

// Mock data for Students Connected to Portal
const studentsData = [
  { month: "Jan", active: 342, new: 45 },
  { month: "Feb", active: 387, new: 52 },
  { month: "Mar", active: 439, new: 61 },
  { month: "Apr", active: 500, new: 68 },
  { month: "May", active: 568, new: 75 },
  { month: "Jun", active: 643, new: 82 },
];

const studentsByYear = [
  { year: "Freshman", count: 145, percentage: 19.6 },
  { year: "Sophomore", count: 185, percentage: 25.0 },
  { year: "Junior", count: 172, percentage: 23.3 },
  { year: "Senior", count: 97, percentage: 13.1 },
  { year: "Graduate", count: 140, percentage: 18.9 },
];

// Mock data for Funding Received
const fundingData = [
  { month: "Jan", amount: 12500, category: "Corporate Sponsors" },
  { month: "Feb", amount: 18200, category: "Corporate Sponsors" },
  { month: "Mar", amount: 15400, category: "University Grants" },
  { month: "Apr", amount: 22100, category: "Corporate Sponsors" },
  { month: "May", amount: 19500, category: "University Grants" },
  { month: "Jun", amount: 24800, category: "Corporate Sponsors" },
];

const fundingBySource = [
  { source: "Corporate Sponsors", amount: 77600, percentage: 64.7 },
  { source: "University Grants", amount: 34900, percentage: 29.1 },
  { source: "Alumni Donations", amount: 7400, percentage: 6.2 },
];

export default function AnalyticsPage() {
  const totalStudents = studentsByYear.reduce((sum, item) => sum + item.count, 0);
  const totalFunding = fundingData.reduce((sum, item) => sum + item.amount, 0);
  const totalEvents = eventData.reduce((sum, item) => sum + item.events, 0);
  const totalPlacements = placementData.reduce((sum, item) => sum + item.placed, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive statistics and insights for CMIS Admin Portal
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">+10 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+82 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              Placements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlacements}</div>
            <p className="text-xs text-muted-foreground">+28 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-destructive" />
              Total Funding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalFunding / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">$24.8K this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Event Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Events Over Time</CardTitle>
              <CardDescription>Monthly event count and participant engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="events" fill={THEME_COLORS.primary} name="Total Events" />
                  <Bar dataKey="participants" fill={THEME_COLORS.accent} name="Participants" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Event Types Distribution</CardTitle>
              <CardDescription>Breakdown of event categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventTypesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => {
                      const total = eventTypesData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${name}: ${percentage}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventTypesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Event Type Breakdown by Month</CardTitle>
              <CardDescription>Detailed view of event categories over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="competitions" stackId="a" fill={THEME_COLORS.primary} name="Competitions" />
                  <Bar dataKey="workshops" stackId="a" fill={THEME_COLORS.accent} name="Workshops" />
                  <Bar dataKey="seminars" stackId="a" fill={THEME_COLORS.secondary} name="Seminars" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Placement Analytics Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Student Placement Analytics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Placement Trends</CardTitle>
              <CardDescription>Monthly placement statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={placementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="placed" stackId="1" stroke={THEME_COLORS.primary} fill={THEME_COLORS.primary} name="Placed" />
                  <Area type="monotone" dataKey="pending" stackId="1" stroke="#d0d0d0" fill="#ffffff" name="Pending" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Placements by Category</CardTitle>
              <CardDescription>Placement distribution across fields</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={placementByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="placed" fill={THEME_COLORS.primary} name="Placed" />
                  <Bar dataKey="total" fill="#f5f5f5" stroke={THEME_COLORS.primary} strokeWidth={1} name="Total Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Students Connected to Portal Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Students Connected to CMIS Portal</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Growth Over Time</CardTitle>
              <CardDescription>Monthly active and new student registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="active" stroke={THEME_COLORS.primary} strokeWidth={2} name="Active Students" />
                  <Line type="monotone" dataKey="new" stroke={THEME_COLORS.accent} strokeWidth={2} name="New Registrations" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students by Academic Year</CardTitle>
              <CardDescription>Distribution across class levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={studentsByYear}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ year, percentage }) => `${year}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {studentsByYear.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Funding Received Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Funding Received Per Month</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Funding Trends</CardTitle>
              <CardDescription>Funding received over the past 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={fundingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="amount" fill={THEME_COLORS.primary} name="Funding ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funding by Source</CardTitle>
              <CardDescription>Breakdown of funding sources</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={fundingBySource}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {fundingBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Funding Summary Table</CardTitle>
            <CardDescription>Detailed monthly funding breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Month</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-left p-2">Primary Source</th>
                  </tr>
                </thead>
                <tbody>
                  {fundingData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{item.month}</td>
                      <td className="text-right p-2">${item.amount.toLocaleString()}</td>
                      <td className="p-2 text-muted-foreground">{item.category}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-semibold">
                    <td className="p-2">Total</td>
                    <td className="text-right p-2">${totalFunding.toLocaleString()}</td>
                    <td className="p-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
