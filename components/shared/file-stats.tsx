import { Card, CardContent } from "@/components/ui/card"
import { Files, HardDrive, Upload, Download } from "lucide-react"

const stats = [
  {
    title: "Total Files",
    value: "2,847",
    change: "+12%",
    icon: Files,
    color: "text-primary",
  },
  {
    title: "Storage Used",
    value: "45.2 GB",
    change: "+8%",
    icon: HardDrive,
    color: "text-secondary",
  },
  {
    title: "Uploads Today",
    value: "23",
    change: "+15%",
    icon: Upload,
    color: "text-accent",
  },
  {
    title: "Downloads",
    value: "156",
    change: "+5%",
    icon: Download,
    color: "text-chart-4",
  },
]

export function FileStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="rounded-xl border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-card-foreground mt-2">{stat.value}</p>
                <p className="text-sm text-primary mt-1">{stat.change} from last month</p>
              </div>
              <div className={`p-3 rounded-xl bg-primary/10 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
