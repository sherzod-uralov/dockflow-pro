/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  turbopack: {
    root: ".",
  },

  experimental: {
    optimizePackageImports: [
      "@mantine/core",
      "@mantine/hooks",
      "@mantine/dates",
      "@mantine/notifications",
      "@mantine/dropzone",
      "@mantine/form",
      "@tabler/icons-react",
      "react-icons",
      "lucide-react",
      "recharts",
      "date-fns",
      "antd",
      "@fullcalendar/core",
      "@fullcalendar/daygrid",
      "@fullcalendar/interaction",
      "@fullcalendar/list",
      "@fullcalendar/react",
      "@fullcalendar/timegrid",
      "reactflow",
    ],
  },

  serverExternalPackages: ["@docverse-pdf/viewer", "mammoth"],

  productionBrowserSourceMaps: false,

  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
