import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AntdProvider from "./AntdProvider";

const APP_NAME = "DealerHub";
const APP_DESCRIPTION =
  "Hệ thống quản lý đơn hàng sỉ, giao hàng và công nợ cho đại lý. Đặt hàng nhanh chóng theo mẫu Excel, theo dõi giao hàng realtime.";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dealerhub.vn";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Quản lý giao hàng đại lý`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "quản lý đại lý",
    "đặt hàng sỉ",
    "giao hàng",
    "công nợ",
    "quản lý đơn hàng",
    "đại lý",
    "wholesale",
    "delivery management",
  ],
  authors: [{ name: "DealerHub Team" }],
  creator: "DealerHub",
  publisher: "DealerHub",
  applicationName: APP_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} - Quản lý giao hàng đại lý`,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DealerHub - Hệ thống quản lý giao hàng đại lý",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - Quản lý giao hàng đại lý`,
    description: APP_DESCRIPTION,
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  category: "business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
