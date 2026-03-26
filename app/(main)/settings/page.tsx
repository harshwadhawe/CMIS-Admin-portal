"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"
import { Save, Bell, Lock, Mail } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: "Council for the Management of Information Systems",
    organizationEmail: "cmis@tamu.edu",
    organizationPhone: "+1 (979) 845-3211",
    notificationsEnabled: true,
    emailReminders: true,
    maintenanceMode: false,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 space-y-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-4xl font-bold text-gradient mb-2">Settings</h1>
        <p className="text-muted-foreground mt-2 text-lg">Manage portal settings and preferences</p>
      </div>

      {/* Organization Settings */}
      <Card className="hover-lift transition-smooth animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Organization Settings
          </CardTitle>
          <CardDescription>Update organization details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization Name</label>
            <Input
              value={settings.organizationName}
              onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              value={settings.organizationEmail}
              onChange={(e) => setSettings({ ...settings, organizationEmail: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              value={settings.organizationPhone}
              onChange={(e) => setSettings({ ...settings, organizationPhone: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="hover-lift transition-smooth animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive notifications about events and activities</p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, notificationsEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Reminders</p>
              <p className="text-sm text-muted-foreground">Send reminders for upcoming events</p>
            </div>
            <Switch
              checked={settings.emailReminders}
              onCheckedChange={(checked) => setSettings({ ...settings, emailReminders: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="hover-lift transition-smooth animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>Manage security and access settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Restrict access to the portal</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
          <Button variant="outline" className="w-full bg-transparent">
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2 items-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <Button 
          onClick={handleSave} 
          className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md hover-lift transition-all" 
          size="lg"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
        {saved && (
          <p className="text-emerald-600 text-sm flex items-center gap-2 animate-fade-in">
            <span className="text-lg">✓</span> Changes saved successfully
          </p>
        )}
      </div>
    </div>
  )
}
