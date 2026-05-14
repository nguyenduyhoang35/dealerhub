"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
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
} from "antd";

const { useBreakpoint } = Grid;
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { fmtVND, STATUS_LABEL, STATUS_TAG, vndInputProps } from "@/lib/format";
import FormDrawer from "../FormDrawer";

type Agent = { id: number; name: string };
type Product = { id: number; name: string; unit: string; price: number };
type Driver = { id: number; name: string; vehicle_plate: string | null; role: string; active: number };
type Item = {
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
  driver_id: number | null;
  driver_name: string | null;
  status: string;
  total: number;
  paid: number;
  delivery_date: string | null;
  note: string | null;
  created_at: string;
  items: Item[];
};

export default function OrdersPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<Order | null>(null);

  const [form] = Form.useForm<{
    agent_id: number;
    delivery_date: Dayjs | null;
    driver_id: number | null;
    paid: number;
    note: string;
    items: { product_id: number; quantity: number; price: number }[];
  }>();
  const itemsWatched = Form.useWatch("items", form) || [];
  const totalWatch = useMemo(
    () =>
      itemsWatched.reduce(
        (s, it) => s + (Number(it?.quantity) || 0) * (Number(it?.price) || 0),
        0
      ),
    [itemsWatched]
  );

  const load = async () => {
    setLoading(true);
    const [a, p, d, o] = await Promise.all([
      fetch("/api/agents").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/drivers").then((r) => r.json()),
      fetch("/api/orders").then((r) => r.json()),
    ]);
    setAgents(a);
    setProducts(p);
    setDrivers(d.filter((x: Driver) => x.role === "driver" && x.active));
    setOrders(o);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    form.resetFields();
    form.setFieldsValue({ items: [], paid: 0 });
    setOpen(true);
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
        driver_id: values.driver_id || null,
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
    load();
  };

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    message.success("Đã cập nhật");
    load();
  };

  const updatePaid = async (id: number, paid: number) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid }),
    });
    load();
  };

  const del = async (id: number) => {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    message.success("Đã xóa");
    load();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Đơn hàng
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Select
            value={filter}
            onChange={setFilter}
            className="!w-[140px] sm:!w-[180px]"
            options={[
              { value: "all", label: "Tất cả trạng thái" },
              { value: "pending", label: "Chờ giao" },
              { value: "delivering", label: "Đang giao" },
              { value: "delivered", label: "Đã giao" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
          />
          <Button
            icon={<DownloadOutlined />}
            href={`/api/export/orders${filter !== "all" ? `?status=${filter}` : ""}`}
          >
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Xuất</span>
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            <span className="hidden sm:inline">Tạo đơn</span>
            <span className="sm:hidden">Tạo</span>
          </Button>
        </Space>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <Empty description="Không có đơn nào" />
            </Card>
          ) : (
            filtered.map((o) => {
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
                        {o.delivery_date && ` · ${o.delivery_date}`}
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
                      <InputNumber
                        size="small"
                        className="!w-full"
                        value={o.paid}
                        min={0}
                        {...vndInputProps}
                        onBlur={(e) => {
                          const v = Number(e.target.value.replace(/\D/g, "")) || 0;
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
        </div>
      ) : (
      <Card styles={{ body: { padding: 0 } }}>
        <Table
          dataSource={filtered}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 15 }}
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
              title: "Ngày giao",
              dataIndex: "delivery_date",
              width: 120,
              render: (v) => v || "—",
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
                <InputNumber
                  size="small"
                  className="!w-full"
                  value={r.paid}
                  min={0}
                  {...vndInputProps}
                  onBlur={(e) => {
                    const v = Number(e.target.value.replace(/\D/g, "")) || 0;
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
              title: "Trạng thái",
              dataIndex: "status",
              width: 150,
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
                optionFilterProp="label"
                options={agents.map((a) => ({ value: a.id, label: a.name }))}
              />
            </Form.Item>
            <Form.Item label="Tài xế (tùy chọn)" name="driver_id">
              <Select
                allowClear
                placeholder="Gán sau cũng được"
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
              <InputNumber
                className="!w-full"
                min={0}
                step={10000}
                {...vndInputProps}
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
                        optionFilterProp="label"
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
                        <InputNumber
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
                        <InputNumber
                          placeholder="Giá"
                          min={0}
                          className="!flex-1 sm:!w-[140px]"
                          {...vndInputProps}
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

          <div className="mt-4 text-right">
            <Statistic title="Tổng tiền" value={totalWatch} suffix="₫" />
          </div>
        </Form>
      </FormDrawer>

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
                {detail.delivery_date || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Tạo lúc">{detail.created_at}</Descriptions.Item>
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
              rowKey={(r, i) => `${r.product_id}_${i}`}
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
