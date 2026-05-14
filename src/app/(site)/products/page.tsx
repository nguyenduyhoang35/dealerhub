"use client";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Input,
  Empty,
  Spin,
  Badge,
  Drawer,
  Tag,
  App,
  Tabs,
} from "antd";
import CommonInputNumber from "@/components/CommonInputNumber";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  AppstoreOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { fmtVND } from "@/lib/format";
import { useCategories, useProductsInfinite, type Product } from "@/hooks";

type CartItem = Product & { qty: number };

export default function ProductsPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch categories
  const { data: categories = [] } = useCategories();

  // Infinite query for products
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useProductsInfinite({
    categoryId: activeCategory,
    search: debouncedSearch,
  });

  // Flatten all pages into single array
  const products = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  const totalProducts = data?.pages[0]?.pagination.total || 0;

  // Intersection observer for infinite scroll
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const addToCart = (product: Product, qty: number) => {
    if (qty <= 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) =>
          c.id === product.id ? { ...c, qty: c.qty + qty } : c
        );
      }
      return [...prev, { ...product, qty }];
    });

    setAddedProduct(product.id);
    setTimeout(() => setAddedProduct(null), 1500);

    notification.success({
      message: "Đã thêm vào giỏ hàng",
      description: (
        <div className="flex items-center justify-between">
          <span>
            <b>{product.name}</b> x {qty} {product.unit}
          </span>
          <span className="font-semibold text-blue-600">
            {fmtVND(product.price * qty)}
          </span>
        </div>
      ),
      placement: "bottomRight",
      duration: 3,
      btn: (
        <Button type="primary" size="small" onClick={() => setCartOpen(true)}>
          Xem giỏ hàng
        </Button>
      ),
    });
  };

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((c) => (c.id === id ? { ...c, qty } : c)));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    notification.info({
      message: "Đã xóa giỏ hàng",
      placement: "bottomRight",
      duration: 2,
    });
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);
  const cartItemCount = cart.length;

  const getCartQty = (productId: number) => {
    const item = cart.find((c) => c.id === productId);
    return item?.qty || 0;
  };

  return (
    <div className="max-w-6xl mx-auto pb-24 lg:pb-4">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Typography.Title level={3} className="!m-0 !mb-1 !text-white">
              Sản phẩm
            </Typography.Title>
            <Typography.Text className="!text-blue-100">
              {totalProducts} sản phẩm có sẵn
            </Typography.Text>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              placeholder="Tìm sản phẩm..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64"
              allowClear
            />
            <Badge count={cartItemCount} showZero={false} offset={[-5, 5]}>
              <Button
                icon={<ShoppingCartOutlined />}
                type={cartItemCount > 0 ? "primary" : "default"}
                onClick={() => setCartOpen(true)}
                className={`hidden sm:flex ${cartItemCount > 0 ? "!bg-white !text-blue-600" : ""}`}
              >
                {cartTotal > 0 ? fmtVND(cartTotal) : "Giỏ hàng"}
              </Button>
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          className="mb-4"
          items={[
            { key: "all", label: "Tất cả", icon: <AppstoreOutlined /> },
            ...categories.map((cat) => ({
              key: String(cat.id),
              label: cat.name,
            })),
          ]}
        />
      )}

      {/* Cart Summary Bar (Desktop) */}
      {cart.length > 0 && (
        <div className="hidden lg:flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <ShoppingCartOutlined className="text-white text-xl" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">
                {cartItemCount} sản phẩm ({cartCount} đơn vị)
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                {cart.slice(0, 3).map((item) => (
                  <Tag key={item.id} color="blue" className="!m-0">
                    {item.name} x{item.qty}
                  </Tag>
                ))}
                {cart.length > 3 && (
                  <Tag className="!m-0">+{cart.length - 3} khác</Tag>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-blue-600">
              {fmtVND(cartTotal)}
            </span>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRightOutlined />}
              onClick={() => setCartOpen(true)}
              className="!bg-gradient-to-r !from-blue-500 !to-indigo-600 !border-0"
            >
              Xem giỏ hàng
            </Button>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : isError ? (
        <Card className="text-center py-12">
          <Empty description="Lỗi tải sản phẩm" />
        </Card>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <Empty description="Không tìm thấy sản phẩm" />
        </Card>
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {products.map((product, index) => (
              <Col
                xs={12}
                sm={8}
                md={6}
                lg={6}
                key={product.id}
                ref={index === products.length - 1 ? lastProductRef : null}
              >
                <ProductCard
                  product={product}
                  onAdd={addToCart}
                  cartQty={getCartQty(product.id)}
                  isAdded={addedProduct === product.id}
                />
              </Col>
            ))}
          </Row>

          {/* Loading more indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <Spin indicator={<LoadingOutlined spin />} />
              <span className="ml-2 text-gray-500">Đang tải thêm...</span>
            </div>
          )}
        </>
      )}

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 bg-white border-t shadow-lg p-3 z-40">
        <div className="flex items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => setCartOpen(true)}
          >
            <Badge count={cartItemCount} size="small">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <ShoppingCartOutlined className="text-white text-lg" />
              </div>
            </Badge>
            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                {cartItemCount > 0 ? `${cartItemCount} sản phẩm` : "Giỏ hàng trống"}
              </div>
              <div className="text-base font-bold text-blue-600 truncate">
                {fmtVND(cartTotal)}
              </div>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            disabled={cart.length === 0}
            onClick={() => setCartOpen(true)}
            className="!h-10 !px-6 !bg-gradient-to-r !from-blue-500 !to-indigo-600 !border-0"
          >
            Xem giỏ hàng
          </Button>
        </div>
      </div>

      {/* Cart Drawer */}
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Giỏ hàng ({cartItemCount})</span>
            {cart.length > 0 && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={clearCart}
              >
                Xóa tất cả
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={() => setCartOpen(false)}
        open={cartOpen}
        styles={{
          body: { padding: 0, display: "flex", flexDirection: "column" },
        }}
      >
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCartOutlined className="text-4xl text-slate-300" />
            </div>
            <Typography.Text type="secondary" className="text-base">
              Giỏ hàng trống
            </Typography.Text>
            <Typography.Text type="secondary" className="text-sm">
              Thêm sản phẩm để bắt đầu đặt hàng
            </Typography.Text>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              {cart.map((item) => (
                <div key={item.id} className="p-4 border-b">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        <span>{item.unit}</span>
                        <span className="mx-2">•</span>
                        <span className="text-blue-600">{fmtVND(item.price)}</span>
                      </div>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removeFromCart(item.id)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-blue-600">
                      {fmtVND(item.price * item.qty)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="small"
                        icon={<MinusOutlined />}
                        onClick={() => updateQty(item.id, item.qty - 1)}
                      />
                      <span className="w-10 text-center font-medium">
                        {item.qty}
                      </span>
                      <Button
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => updateQty(item.id, item.qty + 1)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="border-t p-4 bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Tổng sản phẩm:</span>
                <span>{cartItemCount} sản phẩm ({cartCount} đơn vị)</span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium">Tổng tiền:</span>
                <span className="text-xl font-bold text-blue-600">
                  {fmtVND(cartTotal)}
                </span>
              </div>
              <Button
                type="primary"
                size="large"
                block
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  sessionStorage.setItem("dealerhub_cart", JSON.stringify(cart));
                  setCartOpen(false);
                  router.push("/orders/checkout");
                }}
                className="!h-12 !bg-gradient-to-r !from-blue-500 !to-indigo-600 !border-0 !font-semibold"
              >
                Tiến hành đặt hàng
              </Button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  cartQty,
  isAdded,
}: {
  product: Product;
  onAdd: (p: Product, qty: number) => void;
  cartQty: number;
  isAdded: boolean;
}) {
  const [qty, setQty] = useState(1);

  return (
    <Card
      size="small"
      className={`h-full transition-all hover:shadow-lg ${
        isAdded ? "ring-2 ring-green-500 ring-offset-2" : ""
      } ${cartQty > 0 ? "border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50" : ""}`}
      styles={{ body: { padding: 12 } }}
    >
      <div className="flex flex-col h-full relative">
        {/* Cart indicator */}
        {cartQty > 0 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
            {cartQty}
          </div>
        )}

        {/* Added animation */}
        {isAdded && (
          <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center rounded-lg z-10 pointer-events-none">
            <CheckCircleOutlined className="text-4xl text-green-500 animate-bounce" />
          </div>
        )}

        <Typography.Text strong className="text-sm sm:text-base mb-1 line-clamp-2">
          {product.name}
        </Typography.Text>
        <Typography.Text type="secondary" className="text-xs sm:text-sm mb-2">
          {product.unit}
        </Typography.Text>
        <Typography.Text className="text-base sm:text-lg font-bold text-blue-600 mb-3">
          {fmtVND(product.price)}
        </Typography.Text>

        <div className="flex items-center gap-1 mt-auto">
          <Button
            icon={<MinusOutlined />}
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="!w-9 !h-9 !p-0 !rounded-lg"
          />
          <CommonInputNumber
            min={1}
            value={qty}
            onChange={(v) => setQty(Number(v) || 1)}
            className="flex-1 !h-9 [&_input]:!h-9 [&_input]:!text-center [&_input]:!text-base [&_input]:!px-0"
          />
          <Button
            icon={<PlusOutlined />}
            onClick={() => setQty(qty + 1)}
            className="!w-9 !h-9 !p-0 !rounded-lg"
          />
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            onClick={() => {
              onAdd(product, qty);
              setQty(1);
            }}
            className="!w-9 !h-9 !p-0 !rounded-lg !bg-gradient-to-r !from-blue-500 !to-indigo-600 !border-0"
          />
        </div>
      </div>
    </Card>
  );
}
