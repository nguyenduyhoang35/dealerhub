"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Card,
  Statistic,
  App,
  Descriptions,
  Empty,
  Grid,
  Spin,
  Upload,
  Steps,
  Alert,
  Dropdown,
  Pagination,
} from "antd";

const { useBreakpoint } = Grid;
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileExcelOutlined,
  DownOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { fmtVND, STATUS_LABEL, STATUS_TAG, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TAG, filterOption } from "@/lib/format";
import FormDrawer from "../FormDrawer";
import CommonInputNumber from "@/components/CommonInputNumber";

type Agent = { id: number; name: string };
type Product = { id: number; name: string; unit: string; price: number };
type Driver = { id: number; name: string; vehicle_plate: string | null; roles?: { name: string } | { name: string }[]; active: boolean | number };

const getRoleName = (d: Driver) => {
  if (!d.roles) return null;
  if (Array.isArray(d.roles)) return d.roles[0]?.name;
  return d.roles.name;
};
type Item = {
  id?: number;
  product_id: number;
  product_name?: string;
  product_unit?: string;
  quantity: number;
  price: number;
};
type Order = {
  id: number;
  agent_id: number;
  agent_name: string;
  user_id: number | null;
  driver_name: string | null;
  status: string;
  total: number;
  paid: number;
  delivery_date: string | null;
  note: string | null;
  created_at: string;
  items: Item[];
};

type UploadItem = {
  product_id: number;
  product_name: string;
  unit: string;
  quantity: number;
  price: number;
  total: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function OrdersPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [debtFilter, setDebtFilter] = useState<string>("all");
  const [driverFilter, setDriverFilter] = useState<number | null>(null);
  const [agentFilter, setAgentFilter] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);

  // Upload Excel state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [uploadAgentId, setUploadAgentId] = useState<number | null>(null);
  const [uploadDriverId, setUploadDriverId] = useState<number | null>(null);
  const [uploadDate, setUploadDate] = useState<Dayjs | null>(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);

  const [form] = Form.useForm<{
    agent_id: number;
    delivery_date: Dayjs | null;
    user_id: number | null;
    paid: number;
    note: string;
    items: { product_id: number; quantity: number; price: number }[];
  }>();

  const calcTotal = (items: { quantity?: number; price?: number }[] | undefined) =>
    (items || []).reduce(
      (s, it) => s + (Number(it?.quantity) || 0) * (Number(it?.price) || 0),
      0
    );

  const loadOrders = async (page = 1, status = filter, debt = debtFilter, driver = driverFilter, agent = agentFilter) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (status !== "all") params.set("status", status);
    if (debt !== "all") params.set("debt", debt);
    if (driver !== null) params.set("user_id", String(driver));
    if (agent !== null) params.set("agent_id", String(agent));

    const res = await fetch(`/api/orders?${params}`);
    const json = await res.json();
    setOrders(json.data || []);
    setPagination(json.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    setLoading(false);
  };

  const loadMasterData = async () => {
    const [a, p, d] = await Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setAgents(Array.isArray(a) ? a : []);
    setProducts(Array.isArray(p) ? p : []);
    const driverList = Array.isArray(d) ? d : [];
    setDrivers(driverList.filter((x: Driver) => getRoleName(x) === "driver" && x.active));
  };

  useEffect(() => {
    loadMasterData();
    loadOrders();
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ items: [], paid: 0 });
    setOpen(true);
  };

  const openUpload = () => {
    setUploadStep(0);
    setUploadItems([]);
    setUploadAgentId(null);
    setUploadDriverId(null);
    setUploadDate(null);
    setUploadOpen(true);
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (!values.items?.length) {
      message.error("Thêm ít nhất 1 sản phẩm");
      return;
    }
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent_id: values.agent_id,
        user_id: values.user_id || null,
        delivery_date: values.delivery_date ? values.delivery_date.format("YYYY-MM-DD") : null,
        note: values.note,
        paid: values.paid || 0,
        items: values.items,
      }),
    });
    if (!r.ok) {
      const e = await r.json();
      message.error(e.error || "Lỗi tạo đơn");
      return;
    }
    message.success("Đã tạo đơn");
    setOpen(false);
    loadOrders(1);
  };

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/orders/parse-excel", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error || "Lỗi đọc file Excel");
        return false;
      }

      const data = await res.json();
      setUploadItems(data.items);
      setUploadStep(1);
    } catch {
      message.error("Lỗi upload file");
    }
    return false;
  };

  const submitUpload = async () => {
    if (!uploadAgentId) {
      message.error("Vui lòng chọn đại lý");
      return;
    }

    setUploadSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_id: uploadAgentId,
          user_id: uploadDriverId || null,
          delivery_date: uploadDate ? uploadDate.format("YYYY-MM-DD") : null,
          items: uploadItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            price: i.price,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        message.error(err.error || "Lỗi tạo đơn hàng");
        return;
      }

      message.success("Đã tạo đơn hàng từ Excel!");
      setUploadOpen(false);
      loadOrders(1);
    } finally {
      setUploadSubmitting(false);
    }
  };

  const uploadTotal = uploadItems.reduce((sum, i) => sum + i.total, 0);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    message.success("Đã cập nhật");
    loadOrders(pagination.page);
  };

  const updatePaid = async (id: number, paid: number) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    loadOrders(pagination.page);
  };

  const del = async (id: number) => {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    message.success("Đã xóa");
    loadOrders(pagination.page);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    loadOrders(1, value, debtFilter, driverFilter, agentFilter);
  };

  const handleDebtFilterChange = (value: string) => {
    setDebtFilter(value);
    loadOrders(1, filter, value, driverFilter, agentFilter);
  };

  const handleDriverFilterChange = (value: number | undefined) => {
    const v = value ?? null;
    setDriverFilter(v);
    loadOrders(1, filter, debtFilter, v, agentFilter);
  };

  const handleAgentFilterChange = (value: number | undefined) => {
    const v = value ?? null;
    setAgentFilter(v);
    loadOrders(1, filter, debtFilter, driverFilter, v);
  };

  const handlePageChange = (page: number) => {
    loadOrders(page, filter, debtFilter, driverFilter, agentFilter);
  };

  const createMenuItems = [
    {
      key: "manual",
      label: "Tạo thủ công",
      icon: <PlusOutlined />,
      onClick: openCreate,
    },
    {
      key: "upload",
      label: "Upload Excel",
      icon: <UploadOutlined />,
      onClick: openUpload,
    },
    {
      key: "template",
      label: "Tải mẫu Excel",
      icon: <DownloadOutlined />,
      onClick: () => window.open("/api/export/order-template", "_blank"),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Đơn hàng
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Select
            value={filter}
            onChange={handleFilterChange}
            className="!w-[140px] sm:!w-[180px]"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "pending", label: "Chờ giao" },
              { value: "delivering", label: "Đang giao" },
              { value: "delivered", label: "Đã giao" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
          />
          <Select
            value={debtFilter}
            onChange={handleDebtFilterChange}
            className="!w-[120px] sm:!w-[140px]"
            options={[
              { value: "all", label: "Tất cả nợ" },
              { value: "has_debt", label: "Còn nợ" },
              { value: "no_debt", label: "Hết nợ" },
            ]}
          />
          <Select
            value={driverFilter}
            onChange={handleDriverFilterChange}
            allowClear
            showSearch
            filterOption={filterOption}
            placeholder="Tài xế"
            className="!w-[130px] sm:!w-[160px]"
            options={drivers.map((d) => ({
              value: d.id,
              label: d.vehicle_plate ? `${d.name} (${d.vehicle_plate})` : d.name,
            }))}
          />
          <Select
            value={agentFilter}
            onChange={handleAgentFilterChange}
            allowClear
            showSearch
            filterOption={filterOption}
            placeholder="Đại lý"
            className="!w-[130px] sm:!w-[160px]"
            options={agents.map((a) => ({
              value: a.id,
              label: a.name,
            }))}
          />
          <Button
            icon={<DownloadOutlined />}
            href={`/api/export/orders${filter !== "all" ? `?status=${filter}` : ""}`}
          >
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Xuất</span>
          </Button>
          <Dropdown menu={{ items: createMenuItems }} placement="bottomRight">
            <Button type="primary" icon={<PlusOutlined />}>
              <span className="hidden sm:inline">Tạo đơn</span>
              <span className="sm:hidden">Tạo</span>
              <DownOutlined className="ml-1" style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        </Space>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <Empty description="Không có đơn nào" />
            </Card>
          ) : (
            orders.map((o) => {
              const debt = o.total - o.paid;
              return (
                <Card
                  key={o.id}
                  styles={{ body: { padding: 12 } }}
                  onClick={() => setDetail(o)}
                  hoverable
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">#{o.id}</span>
                        <span className="font-semibold truncate">{o.agent_name}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {o.driver_name ? `🚚 ${o.driver_name}` : "Chưa gán xe"}
                        {o.delivery_date && ` · ${dayjs(o.delivery_date).format("DD/MM HH:mm")}`}
                      </div>
                    </div>
                    <Tag color={STATUS_TAG[o.status] as any} className="!m-0 whitespace-nowrap">
                      {STATUS_LABEL[o.status]}
                    </Tag>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-2 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      <div className="text-slate-500">Tổng</div>
                      <div className="font-semibold">{fmtVND(o.total)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Đã trả</div>
                      <CommonInputNumber
                        size="small"
                        className="!w-full"
                        value={o.paid}
                        min={0}
                        onBlur={(e) => {
                          const v = Number(String(e.target.value).replace(/\D/g, "")) || 0;
                          if (v !== o.paid) updatePaid(o.id, v);
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-slate-500">Còn nợ</div>
                      <div
                        className="font-semibold"
                        style={{ color: debt > 0 ? "#dc2626" : "#16a34a" }}
                      >
                        {fmtVND(debt)}
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Select
                      value={o.status}
                      size="small"
                      className="!flex-1"
                      onChange={(v) => updateStatus(o.id, v)}
                      options={Object.entries(STATUS_LABEL).map(([k, v]) => ({
                        value: k,
                        label: <Tag color={STATUS_TAG[k] as any}>{v}</Tag>,
                      }))}
                    />
                    <Popconfirm
                      title="Xóa đơn này?"
                      onConfirm={() => del(o.id)}
                      okText="Xóa"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </Card>
              );
            })
          )}
          {pagination.total > pagination.limit && (
            <div className="flex justify-center mt-4">
              <Pagination
                current={pagination.page}
                pageSize={pagination.limit}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={false}
                simple
              />
            </div>
          )}
        </div>
      ) : (
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={orders}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: false,
            showTotal: (total) => `Tổng ${total} đơn`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 1200 }}
          columns={[
            { title: "#", dataIndex: "id", width: 60, render: (v) => `#${v}` },
            { title: "Đại lý", dataIndex: "agent_name", width: 200, ellipsis: true, render: (v) => <b>{v}</b> },
            {
              title: "Tài xế",
              dataIndex: "driver_name",
              width: 130,
              render: (v) => v || <span className="text-slate-400">—</span>,
            },
            {
              title: "Người tạo",
              dataIndex: "creator_name",
              width: 120,
              render: (v) => v || <span className="text-slate-400">—</span>,
            },
            {
              title: "Ngày tạo",
              dataIndex: "created_at",
              width: 140,
              render: (v) => dayjs(v).format("DD/MM/YYYY HH:mm"),
              sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            },
            {
              title: "Ngày giao",
              dataIndex: "delivery_date",
              width: 140,
              render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "—"),
            },
            {
              title: "Tổng",
              dataIndex: "total",
              align: "right",
              width: 130,
              render: (v) => fmtVND(v),
              sorter: (a, b) => a.total - b.total,
            },
            {
              title: "Đã trả",
              width: 150,
              align: "right",
              render: (_, r) => (
                <CommonInputNumber
                  size="small"
                  className="!w-full"
                  value={r.paid}
                  min={0}
                  onBlur={(e) => {
                    const v = Number(String(e.target.value).replace(/\D/g, "")) || 0;
                    if (v !== r.paid) updatePaid(r.id, v);
                  }}
                />
              ),
            },
            {
              title: "Còn nợ",
              width: 130,
              align: "right",
              render: (_, r) => (
                <span style={{ color: r.total - r.paid > 0 ? "#dc2626" : "#16a34a" }}>
                  {fmtVND(r.total - r.paid)}
                </span>
              ),
            },
            {
              title: "Giao hàng",
              dataIndex: "status",
              width: 130,
              render: (s, r) => (
                <Select
                  value={s}
                  size="small"
                  style={{ width: "100%" }}
                  onChange={(v) => updateStatus(r.id, v)}
                  options={Object.entries(STATUS_LABEL).map(([k, v]) => ({
                    value: k,
                    label: <Tag color={STATUS_TAG[k] as any}>{v}</Tag>,
                  }))}
                />
              ),
            },
            {
              title: "Thanh toán",
              dataIndex: "payment_status",
              width: 110,
              render: (v: string) => (
                <Tag color={PAYMENT_STATUS_TAG[v]}>
                  {PAYMENT_STATUS_LABEL[v]}
                </Tag>
              ),
            },
            {
              title: "",
              width: 150,
              align: "center",
              render: (_, r) => (
                <Space size={4}>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => setDetail(r)}
                  >
                    Xem
                  </Button>
                  <Popconfirm
                    title="Xóa đơn này?"
                    onConfirm={() => del(r.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      )}

      {/* Manual Create Drawer */}
      <FormDrawer
        title="Tạo đơn hàng"
        open={open}
        onClose={() => setOpen(false)}
        onOk={submit}
        okText="Tạo đơn"
        width={760}
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Form.Item
              label="Đại lý"
              name="agent_id"
              rules={[{ required: true, message: "Chọn đại lý" }]}
            >
              <Select
                showSearch
                placeholder="Chọn đại lý"
                filterOption={filterOption}
                options={agents.map((a) => ({ value: a.id, label: a.name }))}
              />
            </Form.Item>
            <Form.Item label="Tài xế (tùy chọn)" name="user_id">
              <Select
                allowClear
                showSearch
                placeholder="Gán sau cũng được"
                filterOption={filterOption}
                options={drivers.map((d) => ({
                  value: d.id,
                  label: `${d.name}${d.vehicle_plate ? ` (${d.vehicle_plate})` : ""}`,
                }))}
              />
            </Form.Item>
            <Form.Item label="Ngày giao" name="delivery_date">
              <DatePicker className="!w-full" format="YYYY-MM-DD" />
            </Form.Item>
            <Form.Item label="Trả trước (VNĐ)" name="paid">
              <CommonInputNumber
                className="!w-full"
                min={0}
              />
            </Form.Item>
          </div>
          <Form.Item label="Ghi chú" name="note">
            <Input placeholder="Giao trước 10h..." />
          </Form.Item>

          <Typography.Title level={5}>Sản phẩm trong đơn</Typography.Title>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map((f) => (
                  <div
                    key={f.key}
                    className="mb-2 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:[&_.ant-input-number]:rounded-none sm:[&_.ant-select-selector]:rounded-r-none"
                  >
                    <Form.Item
                      {...f}
                      name={[f.name, "product_id"]}
                      noStyle
                      rules={[{ required: true }]}
                    >
                      <Select
                        placeholder="Sản phẩm"
                        showSearch
                        filterOption={filterOption}
                        className="!flex-[2] sm:!min-w-0"
                        options={products.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.unit}) - ${fmtVND(p.price)}`,
                        }))}
                        onChange={(v) => {
                          const p = products.find((x) => x.id === v);
                          if (p) {
                            const items = form.getFieldValue("items");
                            items[f.name].price = p.price;
                            form.setFieldsValue({ items: [...items] });
                          }
                        }}
                      />
                    </Form.Item>
                    <div className="flex gap-0">
                      <Form.Item
                        {...f}
                        name={[f.name, "quantity"]}
                        noStyle
                        rules={[{ required: true }]}
                      >
                        <CommonInputNumber
                          placeholder="SL"
                          min={1}
                          className="!w-[80px] sm:!w-[90px]"
                        />
                      </Form.Item>
                      <Form.Item
                        {...f}
                        name={[f.name, "price"]}
                        noStyle
                        rules={[{ required: true }]}
                      >
                        <CommonInputNumber
                          placeholder="Giá"
                          min={0}
                          className="!flex-1 sm:!w-[140px]"
                        />
                      </Form.Item>
                      <Button danger onClick={() => remove(f.name)}>
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="dashed"
                  block
                  icon={<PlusOutlined />}
                  onClick={() => {
                    const p = products[0];
                    add({ product_id: p?.id, quantity: 1, price: p?.price || 0 });
                  }}
                >
                  Thêm sản phẩm
                </Button>
              </>
            )}
          </Form.List>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.items !== cur.items}>
            {() => (
              <div className="mt-4 text-right">
                <Statistic title="Tổng tiền" value={calcTotal(form.getFieldValue("items"))} suffix="₫" />
              </div>
            )}
          </Form.Item>
        </Form>
      </FormDrawer>

      {/* Upload Excel Modal */}
      <Modal
        title="Tạo đơn từ Excel"
        open={uploadOpen}
        onCancel={() => setUploadOpen(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Steps
          current={uploadStep}
          items={[
            { title: "Tải file", icon: <FileExcelOutlined /> },
            { title: "Xác nhận" },
          ]}
          className="mb-6"
        />

        {uploadStep === 0 && (
          <div className="text-center py-8">
            <FileExcelOutlined className="text-6xl text-green-600 mb-4" />
            <Typography.Title level={4}>Upload file Excel đặt hàng</Typography.Title>
            <Typography.Text type="secondary" className="block mb-6">
              Tải mẫu Excel, điền số lượng cần đặt rồi upload lên hệ thống
            </Typography.Text>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                icon={<DownloadOutlined />}
                href="/api/export/order-template"
                target="_blank"
              >
                Tải mẫu Excel
              </Button>
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={handleUploadFile}
              >
                <Button type="primary" icon={<UploadOutlined />}>
                  Upload file đặt hàng
                </Button>
              </Upload>
            </div>

            <Alert
              type="info"
              showIcon
              title="Hướng dẫn"
              description={
                <ul className="text-left mt-2 space-y-1">
                  <li>1. Tải mẫu Excel về máy</li>
                  <li>2. Điền số lượng vào cột "Số lượng"</li>
                  <li>3. Upload file lên hệ thống</li>
                  <li>4. Chọn đại lý và xác nhận đơn hàng</li>
                </ul>
              }
            />
          </div>
        )}

        {uploadStep === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <Typography.Text strong>Đại lý *</Typography.Text>
                <Select
                  className="!w-full mt-1"
                  placeholder="Chọn đại lý"
                  showSearch
                  filterOption={filterOption}
                  value={uploadAgentId}
                  onChange={setUploadAgentId}
                  options={agents.map((a) => ({ value: a.id, label: a.name }))}
                />
              </div>
              <div>
                <Typography.Text strong>Tài xế</Typography.Text>
                <Select
                  className="!w-full mt-1"
                  placeholder="Tùy chọn"
                  allowClear
                  showSearch
                  filterOption={filterOption}
                  value={uploadDriverId}
                  onChange={setUploadDriverId}
                  options={drivers.map((d) => ({
                    value: d.id,
                    label: `${d.name}${d.vehicle_plate ? ` (${d.vehicle_plate})` : ""}`,
                  }))}
                />
              </div>
              <div>
                <Typography.Text strong>Ngày giao</Typography.Text>
                <DatePicker
                  className="!w-full mt-1"
                  format="YYYY-MM-DD"
                  value={uploadDate}
                  onChange={setUploadDate}
                />
              </div>
            </div>

            <Table
              dataSource={uploadItems}
              rowKey="product_id"
              pagination={false}
              scroll={{ x: 600, y: 300 }}
              size="small"
              columns={[
                { title: "Sản phẩm", dataIndex: "product_name" },
                { title: "ĐVT", dataIndex: "unit", width: 80 },
                { title: "SL", dataIndex: "quantity", align: "right", width: 80 },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  align: "right",
                  width: 120,
                  render: (v) => fmtVND(v),
                },
                {
                  title: "Thành tiền",
                  dataIndex: "total",
                  align: "right",
                  width: 120,
                  render: (v) => <b>{fmtVND(v)}</b>,
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4}>
                    <b>Tổng cộng</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <b className="text-lg text-blue-600">{fmtVND(uploadTotal)}</b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button onClick={() => setUploadStep(0)}>Chọn file khác</Button>
              <Button
                type="primary"
                loading={uploadSubmitting}
                onClick={submitUpload}
                disabled={!uploadAgentId}
              >
                Tạo đơn hàng
              </Button>
            </div>
          </>
        )}
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title={detail ? `Đơn #${detail.id} — ${detail.agent_name}` : ""}
        open={!!detail}
        onCancel={() => setDetail(null)}
        footer={null}
        width="min(680px, calc(100vw - 24px))"
      >
        {detail && (
          <>
            <Descriptions
              size="small"
              column={{ xs: 1, sm: 2 }}
              bordered
            >
              <Descriptions.Item label="Tài xế">
                {detail.driver_name || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày giao">
                {detail.delivery_date ? dayjs(detail.delivery_date).format("DD/MM/YYYY HH:mm") : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tạo lúc">
                {dayjs(detail.created_at).format("DD/MM/YYYY HH:mm")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={STATUS_TAG[detail.status] as any}>{STATUS_LABEL[detail.status]}</Tag>
              </Descriptions.Item>
              {detail.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  {detail.note}
                </Descriptions.Item>
              )}
            </Descriptions>
            <Table
              className="mt-4"
              pagination={false}
              size="small"
              scroll={{ x: 480 }}
              dataSource={detail.items}
              rowKey={(r) => r.id || `${r.product_id}_${r.price}`}
              columns={[
                { title: "Sản phẩm", dataIndex: "product_name", render: (v) => v || "(đã xóa)" },
                { title: "SL", dataIndex: "quantity", width: 80, align: "right" },
                {
                  title: "Đơn giá",
                  dataIndex: "price",
                  align: "right",
                  render: (v) => fmtVND(v),
                },
                {
                  title: "Thành tiền",
                  align: "right",
                  render: (_, r) => fmtVND(r.quantity * r.price),
                },
              ]}
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <b>Tổng</b>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="right">
                    <b>{fmtVND(detail.total)}</b>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </>
        )}
      </Modal>
    </>
  );
}
