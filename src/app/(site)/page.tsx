"use client";
import Link from "next/link";
import Image from "next/image";
import { Button, Card, Row, Col, Rate } from "antd";
import {
  ShoppingCartOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  DollarOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section - Full Width, Full Height */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-warehouse.jpg"
            alt="Warehouse"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 px-4 py-2 rounded-full text-sm mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Hệ thống đang hoạt động 24/7
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Đặt hàng sỉ
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Nhanh chóng & Tiện lợi
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-xl mx-auto lg:mx-0">
                Hệ thống quản lý đơn hàng thông minh dành cho đại lý.
                Đặt hàng theo mẫu Excel, theo dõi giao hàng realtime,
                quản lý công nợ minh bạch.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link href="/products">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    className="!h-12 sm:!h-14 !px-8 !text-base !font-semibold !rounded-xl w-full sm:w-auto"
                  >
                    Xem sản phẩm
                  </Button>
                </Link>
                <Link href="/orders/upload">
                  <Button
                    size="large"
                    icon={<FileExcelOutlined />}
                    className="!bg-white/10 !text-white !border-white/30 hover:!bg-white/20 !h-12 sm:!h-14 !px-8 !text-base !font-semibold !rounded-xl w-full sm:w-auto"
                  >
                    Đặt hàng Excel
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <span>Miễn phí đăng ký</span>
                </div>
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-blue-500" />
                  <span>Bảo mật 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockCircleOutlined className="text-orange-500" />
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>

            {/* Right Stats Card */}
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  <StatBox number="500+" label="Đại lý tin dùng" color="blue" />
                  <StatBox number="10K+" label="Đơn hàng/tháng" color="green" />
                  <StatBox number="99%" label="Giao đúng hẹn" color="orange" />
                  <StatBox number="24/7" label="Hỗ trợ khách hàng" color="purple" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileStatBox number="500+" label="Đại lý" />
            <MobileStatBox number="10K+" label="Đơn/tháng" />
            <MobileStatBox number="99%" label="Đúng hẹn" />
            <MobileStatBox number="24/7" label="Hỗ trợ" />
          </div>
        </div>

        {/* Scroll indicator - Mouse icon */}
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById("features");
            if (el) {
              el.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-2 z-20"
          style={{ background: "transparent", border: "none", outline: "none" }}
        >
          <div
            className="w-8 h-12 rounded-full flex justify-center"
            style={{ border: "2px solid white" }}
          >
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-scroll-down"></div>
          </div>
          <svg
            className="w-5 h-5 text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Tính năng
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Giải pháp toàn diện cho đại lý
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Từ đặt hàng đến giao hàng, quản lý công nợ - tất cả trong một nền tảng
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            icon={<ShoppingCartOutlined />}
            title="Đặt hàng online"
            description="Duyệt sản phẩm, xem giá realtime và đặt hàng trực tiếp trên hệ thống mọi lúc mọi nơi."
            color="blue"
            href="/products"
          />
          <FeatureCard
            icon={<FileExcelOutlined />}
            title="Đặt hàng theo Excel"
            description="Tải mẫu Excel có sẵn, điền số lượng và upload. Tiết kiệm thời gian cho đơn hàng lớn."
            color="green"
            highlight
            href="/orders/upload"
          />
          <FeatureCard
            icon={<FileTextOutlined />}
            title="Theo dõi đơn hàng"
            description="Xem trạng thái đơn realtime, nhận thông báo khi hàng được giao."
            color="purple"
            href="/orders"
          />
          <FeatureCard
            icon={<DollarOutlined />}
            title="Công nợ minh bạch"
            description="Theo dõi công nợ, lịch sử thanh toán chi tiết theo từng đơn hàng."
            color="orange"
            href="/debt"
          />
          <FeatureCard
            icon={<RocketOutlined />}
            title="Giao hàng nhanh"
            description="Đội ngũ giao hàng chuyên nghiệp, giao trong ngày cho đơn đặt trước 12h."
            color="red"
            href="/products"
          />
          <FeatureCard
            icon={<PhoneOutlined />}
            title="Hỗ trợ 24/7"
            description="Đội ngũ CSKH luôn sẵn sàng hỗ trợ qua hotline và Zalo."
            color="teal"
            href="/login"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-4">
              Quy trình
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Đặt hàng chỉ với 3 bước
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            <StepCard
              step="01"
              title="Tải mẫu Excel"
              description="Tải file Excel mẫu với danh sách sản phẩm và giá cập nhật mới nhất"
              icon={<FileExcelOutlined className="text-3xl" />}
            />
            <StepCard
              step="02"
              title="Điền số lượng"
              description="Điền số lượng cần đặt vào từng sản phẩm trong file Excel"
              icon={<FileTextOutlined className="text-3xl" />}
            />
            <StepCard
              step="03"
              title="Upload & Xác nhận"
              description="Upload file lên hệ thống, kiểm tra và xác nhận đơn hàng"
              icon={<CheckCircleOutlined className="text-3xl" />}
            />
          </div>

          <div className="text-center mt-10">
            <Link href="/orders/upload">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                className="!h-12 !px-8 !rounded-xl !font-semibold"
              >
                Bắt đầu đặt hàng ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-4">
            Đánh giá
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Đại lý nói gì về chúng tôi
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <TestimonialCard
            name="Anh Minh"
            role="Đại lý Quận 7"
            content="Đặt hàng qua Excel rất tiện, không cần gọi điện hay nhắn tin nữa. Giao hàng nhanh, đúng hẹn."
            rating={5}
          />
          <TestimonialCard
            name="Chị Lan"
            role="Đại lý Bình Thạnh"
            content="Theo dõi công nợ rõ ràng, không còn phải ghi sổ tay như trước. Rất chuyên nghiệp!"
            rating={5}
          />
          <TestimonialCard
            name="Anh Tuấn"
            role="Đại lý Thủ Đức"
            content="Hỗ trợ nhiệt tình, có vấn đề gì gọi là được giải quyết ngay. Recommend cho các đại lý khác."
            rating={5}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 mb-16 lg:mb-0">
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700" />
          <div className="absolute inset-0 opacity-30">
            <Image
              src="/images/hero-warehouse.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 px-6 sm:px-12 py-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Đăng ký miễn phí ngay hôm nay và trải nghiệm cách đặt hàng sỉ hiện đại
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="large"
                  className="!bg-white !text-blue-600 !border-0 !h-12 !px-8 !rounded-xl !font-semibold w-full sm:w-auto"
                >
                  Đăng nhập ngay
                </Button>
              </Link>
              <Button
                size="large"
                icon={<PhoneOutlined />}
                className="!bg-white/20 !text-white !border-white/30 !h-12 !px-8 !rounded-xl !font-semibold"
              >
                Hotline: 0901 234 567
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatBox({ number, label, color }: { number: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    orange: "from-orange-500 to-orange-600",
    purple: "from-purple-500 to-purple-600",
  };
  return (
    <div className="text-center p-4 rounded-2xl bg-white/10">
      <div className={`text-3xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
        {number}
      </div>
      <div className="text-slate-300 text-sm mt-1">{label}</div>
    </div>
  );
}

function MobileStatBox({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
      <div className="text-xl font-bold text-white">{number}</div>
      <div className="text-slate-300 text-xs">{label}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
  highlight,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  highlight?: boolean;
  href: string;
}) {
  const colors: Record<string, { gradient: string; iconBg: string; iconText: string; shadow: string }> = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-blue-200"
    },
    green: {
      gradient: "from-green-500 to-emerald-600",
      iconBg: "bg-green-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-green-200"
    },
    purple: {
      gradient: "from-purple-500 to-indigo-600",
      iconBg: "bg-purple-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-purple-200"
    },
    orange: {
      gradient: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-orange-200"
    },
    red: {
      gradient: "from-red-500 to-rose-600",
      iconBg: "bg-red-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-red-200"
    },
    teal: {
      gradient: "from-teal-500 to-cyan-600",
      iconBg: "bg-teal-500",
      iconText: "text-white",
      shadow: "group-hover:shadow-teal-200"
    },
  };
  const c = colors[color];

  return (
    <Link href={href} className="block">
      <div
        className={`group relative bg-white rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden h-full ${
          highlight
            ? "ring-2 ring-green-500 shadow-xl shadow-green-100"
            : `border border-slate-200 hover:border-transparent hover:shadow-xl ${c.shadow}`
        }`}
      >
        {/* Gradient overlay on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

        {highlight && (
          <div className="absolute -top-0 -right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-4 py-1.5 rounded-bl-xl rounded-tr-xl">
            Phổ biến nhất
          </div>
        )}

        {/* Icon */}
        <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.iconText} text-2xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        {/* Content */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-slate-800">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{description}</p>

        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-sm font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
          <span>Tìm hiểu thêm</span>
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 text-center">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
        {step}
      </div>
      <div className="text-blue-600 mb-4 mt-2">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function TestimonialCard({
  name,
  role,
  content,
  rating,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <Rate disabled defaultValue={rating} className="text-sm mb-4" />
      <p className="text-slate-700 mb-4 italic">&ldquo;{content}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
          {name[0]}
        </div>
        <div>
          <div className="font-semibold text-slate-900">{name}</div>
          <div className="text-sm text-slate-500">{role}</div>
        </div>
      </div>
    </div>
  );
}
