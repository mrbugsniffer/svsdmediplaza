
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, Activity } from "lucide-react";

export default function AdminDashboardPage() {
  // Mock data for dashboard - replace with real data fetching
  const stats = [
    { title: "Total Revenue", value: "$12,345", icon: DollarSign, change: "+5.2%" },
    { title: "Total Orders", value: "256", icon: Package, change: "+12" },
    { title: "Active Customers", value: "1,204", icon: Users, change: "+50" },
    { title: "Products in Stock", value: "78", icon: Activity, change: "-3" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for recent orders list */}
            <p className="text-muted-foreground">Recent orders will be displayed here.</p>
            <ul className="mt-4 space-y-2">
                <li className="flex justify-between p-2 bg-muted/30 rounded-md text-sm"><span>Order #ORD-00123</span><span>$150.00</span></li>
                <li className="flex justify-between p-2 bg-muted/30 rounded-md text-sm"><span>Order #ORD-00122</span><span>$75.50</span></li>
                <li className="flex justify-between p-2 bg-muted/30 rounded-md text-sm"><span>Order #ORD-00121</span><span>$220.75</span></li>
            </ul>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            {/* Placeholder for quick actions */}
            <button className="text-left p-2 hover:bg-muted rounded-md transition-colors">Add New Product</button>
            <button className="text-left p-2 hover:bg-muted rounded-md transition-colors">View All Users</button>
            <button className="text-left p-2 hover:bg-muted rounded-md transition-colors">Site Settings</button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
