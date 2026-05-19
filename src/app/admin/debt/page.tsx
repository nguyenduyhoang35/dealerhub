"use client";
import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Typography,
  Card,
  App,
  Empty,
  Grid,
  Spin,
  Statistic,
  Modal,
  Tag,
  Descriptions,
  Tabs,
  Form,
  Switch,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  DollarOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  fmtVND,
  STATUS_LABEL,
  STATUS_TAG,
} from "@/lib/format";
import {
  useAdminDebt,
  useAgentDebt,
  useRecordPayment,
  type AgentDebtSummary,
} from "@/hooks";
import CommonInputNumber from "@/components/CommonInputNumber";

const { useBreakpoint } = Grid;

export default function AdminDebtPage() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [hasDebtOnly, setHasDebtOnly] = useState(true);

  const { data, isLoading, refetch } = useAdminDebt({
    page,
    limit: 20,
    search,
    hasDebt: hasDebtOnly ? true : null,
  });

  const [selectedAgent, setSelectedAgent] = useState<AgentDebtSummary | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  const { data: agentDetail, isLoading: detailLoading } = useAgentDebt(
    selectedAgent?.id ?? null,
    { page: detailPage, limit: 10 }
  );

  const recordPayment = useRecordPayment();

  const [paymentForm] = Form.useForm();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const openPayment = () => {
    paymentForm.resetFields();
    paymentForm.setFieldsValue({ amount: selectedAgent?.debt || 0 });
    setPaymentOpen(true);
  };

  const submitPayment = async () => {
    if (!selectedAgent) return;
    const values = await paymentForm.validateFields();
    try {
      await recordPayment.mutateAsync({
        agentId: selectedAgent.id,
        amount: values.amount,
        note: values.note,
      });
      message.success("Đã ghi nhận thanh toán");
      setPaymentOpen(false);
      refetch();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const totals = data?.totals;

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <Typography.Title level={3} className="!m-0 hidden sm:block">
          Công nợ đại lý
        </Typography.Title>
        <Space wrap className="!ml-auto">
          <Input
            placeholder="Tìm đại lý..."
            prefix={<SearchOutlined className="text-slate-400" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            allowClear
            className="!w-[180px] sm:!w-[220px]"
          />
          <div className="flex items-center gap-2">
            <Switch
              checked={hasDebtOnly}
              onChange={(v) => {
                setHasDebtOnly(v);
                setPage(1);
              }}
              size="small"
            />
            <span className="text-sm text-slate-600">Chỉ còn nợ</span>
          </div>
          <Button icon={<DownloadOutlined />} href="/api/export/agents">
            <span className="hidden sm:inline">Xuất Excel</span>
            <span className="sm:hidden">Xuất</span>
          </Button>
        </Space>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Card size="small" className="!bg-blue-50">
            <Statistic
              title={<span className="text-blue-600">Tổng doanh số</span>}
              value={totals.total_revenue}
              formatter={(v) => fmtVND(Number(v))}
              valueStyle={{ color: "#2563eb", fontSize: isMobile ? 16 : 20 }}
              prefix={<DollarOutlined />}
            />
          </Card>
          <Card size="small" className="!bg-green-50">
            <Statistic
              title={<span className="text-green-600">Đã thu</span>}
              value={totals.total_paid}
              formatter={(v) => fmtVND(Number(v))}
              valueStyle={{ color: "#16a34a", fontSize: isMobile ? 16 : 20 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
          <Card size="small" className="!bg-red-50">
            <Statistic
              title={<span className="text-red-600">Tổng nợ</span>}
              value={totals.total_debt}
              formatter={(v) => fmtVND(Number(v))}
              valueStyle={{ color: "#dc2626", fontSize: isMobile ? 16 : 20 }}
              prefix={<WarningOutlined />}
            />
          </Card>
          <Card size="small" className="!bg-orange-50">
            <Statistic
              title={<span className="text-orange-600">Đại lý còn nợ</span>}
              value={totals.agents_with_debt}
              suffix={`/ ${totals.total_agents}`}
              valueStyle={{ color: "#ea580c", fontSize: isMobile ? 16 : 20 }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </div>
      )}

      {/* Agent List */}
      {isMobile ? (
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spin />
            </div>
          ) : !data?.data.length ? (
            <Card>
              <Empty description="Không có đại lý nào" />
            </Card>
          ) : (
            data.data.map((a) => (
              <Card
                key={a.id}
                styles={{ body: { padding: 12 } }}
                onClick={() => setSelectedAgent(a)}
                hoverable
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate">{a.name}</div>
                    {a.phone && (
                      <a
                        href={`tel:${a.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-blue-600 inline-flex items-center gap-1 mt-0.5"
                      >
                        <PhoneOutlined /> {a.phone}
                      </a>
                    )}
                    <div className="text-xs text-slate-500 mt-1">
                      {a.order_count} đơn · Doanh số: {fmtVND(a.revenue)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Còn nợ</div>
                    <div
                      className="font-bold text-lg"
                      style={{ color: a.debt > 0 ? "#dc2626" : "#16a34a" }}
                    >
                      {fmtVND(a.debt)}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <Table
            dataSource={data?.data || []}
            loading={isLoading}
            rowKey="id"
            pagination={{
              current: page,
              pageSize: 20,
              total: data?.pagination.total || 0,
              showSizeChanger: false,
              showTotal: (total) => `${total} đại lý`,
              onChange: setPage,
            }}
            scroll={{ x: 900 }}
            onRow={(record) => ({
              onClick: () => setSelectedAgent(record),
              className: "cursor-pointer hover:bg-slate-50",
            })}
            columns={[
              { title: "ID", dataIndex: "id", width: 60 },
              {
                title: "Đại lý",
                dataIndex: "name",
                width: 200,
                ellipsis: true,
                render: (v) => <b>{v}</b>,
              },
              {
                title: "SĐT",
                dataIndex: "phone",
                width: 120,
                render: (v) => v || "—",
              },
              {
                title: "Số đơn",
                dataIndex: "order_count",
                width: 90,
                align: "center",
              },
              {
                title: "Doanh số",
                dataIndex: "revenue",
                width: 140,
                align: "right",
                render: (v) => fmtVND(v),
                sorter: (a, b) => a.revenue - b.revenue,
              },
              {
                title: "Đã trả",
                dataIndex: "paid",
                width: 140,
                align: "right",
                render: (v) => <span className="text-green-600">{fmtVND(v)}</span>,
                sorter: (a, b) => a.paid - b.paid,
              },
              {
                title: "Còn nợ",
                dataIndex: "debt",
                width: 140,
                align: "right",
                render: (v) => (
                  <span
                    className="font-bold"
                    style={{ color: v > 0 ? "#dc2626" : "#16a34a" }}
                  >
                    {fmtVND(v)}
                  </span>
                ),
                sorter: (a, b) => a.debt - b.debt,
                defaultSortOrder: "descend",
              },
              {
                title: "",
                width: 100,
                align: "center",
                render: (_, r) => (
                  <Button type="link" size="small">
                    Chi tiết
                  </Button>
                ),
              },
            ]}
          />
        </Card>
      )}

      {/* Agent Detail Modal */}
      <Modal
        title={
          selectedAgent && (
            <div className="flex items-center gap-3">
              <WalletOutlined className="text-orange-500" />
              <span>Công nợ: {selectedAgent.name}</span>
            </div>
          )
        }
        open={!!selectedAgent}
        onCancel={() => {
          setSelectedAgent(null);
          setDetailPage(1);
        }}
        footer={null}
        width={800}
        styles={{ body: { maxHeight: "70vh", overflowY: "auto" } }}
      >
        {selectedAgent && (
          <>
            {/* Agent Info */}
            <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="mb-4">
              <Descriptions.Item label="Điện thoại">
                {selectedAgent.phone ? (
                  <a href={`tel:${selectedAgent.phone}`}>
                    <PhoneOutlined /> {selectedAgent.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedAgent.address ? (
                  <>
                    <EnvironmentOutlined /> {selectedAgent.address}
                  </>
                ) : (
                  "—"
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <Card size="small" className="text-center">
                <div className="text-slate-500 text-xs">Số đơn</div>
                <div className="font-bold text-lg">{selectedAgent.order_count}</div>
              </Card>
              <Card size="small" className="text-center">
                <div className="text-slate-500 text-xs">Doanh số</div>
                <div className="font-bold text-lg text-blue-600">
                  {fmtVND(selectedAgent.revenue)}
                </div>
              </Card>
              <Card size="small" className="text-center">
                <div className="text-slate-500 text-xs">Đã trả</div>
                <div className="font-bold text-lg text-green-600">
                  {fmtVND(selectedAgent.paid)}
                </div>
              </Card>
              <Card size="small" className="text-center">
                <div className="text-slate-500 text-xs">Còn nợ</div>
                <div
                  className="font-bold text-lg"
                  style={{ color: selectedAgent.debt > 0 ? "#dc2626" : "#16a34a" }}
                >
                  {fmtVND(selectedAgent.debt)}
                </div>
              </Card>
            </div>

            {/* Payment Button */}
            {selectedAgent.debt > 0 && (
              <div className="mb-4">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openPayment}
                >
                  Ghi nhận thanh toán
                </Button>
              </div>
            )}

            {/* Orders and Payment History */}
            <Tabs
              items={[
                {
                  key: "orders",
                  label: "Đơn hàng",
                  children: detailLoading ? (
                    <div className="flex justify-center py-8">
                      <Spin />
                    </div>
                  ) : (
                    <Table
                      dataSource={agentDetail?.orders || []}
                      rowKey="id"
                      size="small"
                      pagination={{
                        current: detailPage,
                        pageSize: 10,
                        total: agentDetail?.pagination.total || 0,
                        onChange: setDetailPage,
                        showSizeChanger: false,
                      }}
                      scroll={{ x: 600 }}
                      columns={[
                        {
                          title: "#",
                          dataIndex: "id",
                          width: 60,
                          render: (v) => `#${v}`,
                        },
                        {
                          title: "Ngày",
                          dataIndex: "created_at",
                          width: 100,
                          render: (v) => dayjs(v).format("DD/MM/YY"),
                        },
                        {
                          title: "Tổng",
                          dataIndex: "total",
                          width: 110,
                          align: "right",
                          render: (v) => fmtVND(v),
                        },
                        {
                          title: "Đã trả",
                          dataIndex: "paid",
                          width: 110,
                          align: "right",
                          render: (v) => (
                            <span className="text-green-600">{fmtVND(v)}</span>
                          ),
                        },
                        {
                          title: "Còn nợ",
                          width: 110,
                          align: "right",
                          render: (_, r) => {
                            const debt = r.total - r.paid;
                            return (
                              <span
                                className="font-medium"
                                style={{ color: debt > 0 ? "#dc2626" : "#16a34a" }}
                              >
                                {fmtVND(debt)}
                              </span>
                            );
                          },
                        },
                        {
                          title: "TT",
                          dataIndex: "status",
                          width: 90,
                          render: (v) => (
                            <Tag
                              color={STATUS_TAG[v as keyof typeof STATUS_TAG]}
                              className="!m-0"
                            >
                              {STATUS_LABEL[v as keyof typeof STATUS_LABEL]}
                            </Tag>
                          ),
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: "payments",
                  label: "Lịch sử thanh toán",
                  children: detailLoading ? (
                    <div className="flex justify-center py-8">
                      <Spin />
                    </div>
                  ) : !agentDetail?.payments?.length ? (
                    <Empty description="Chưa có lịch sử thanh toán" />
                  ) : (
                    <Table
                      dataSource={agentDetail.payments}
                      rowKey="id"
                      size="small"
                      pagination={false}
                      scroll={{ x: 500 }}
                      columns={[
                        {
                          title: "Thời gian",
                          dataIndex: "completed_at",
                          width: 140,
                          render: (v) =>
                            v ? dayjs(v).format("DD/MM/YY HH:mm") : "—",
                        },
                        {
                          title: "Số tiền",
                          dataIndex: "amount",
                          width: 120,
                          align: "right",
                          render: (v) => (
                            <span className="font-medium text-green-600">
                              +{fmtVND(v)}
                            </span>
                          ),
                        },
                        {
                          title: "Nội dung",
                          dataIndex: "content",
                          ellipsis: true,
                        },
                        {
                          title: "Đơn",
                          dataIndex: "order_id",
                          width: 70,
                          render: (v) => (v ? `#${v}` : "—"),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />
          </>
        )}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        title="Ghi nhận thanh toán"
        open={paymentOpen}
        onCancel={() => setPaymentOpen(false)}
        onOk={submitPayment}
        okText="Ghi nhận"
        confirmLoading={recordPayment.isPending}
      >
        <Form form={paymentForm} layout="vertical">
          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Nhập số tiền" }]}
          >
            <CommonInputNumber
              className="!w-full"
              min={1000}
              max={selectedAgent?.debt || 999999999}
            />
          </Form.Item>
          <div className="text-sm text-slate-500 -mt-2 mb-4">
            Công nợ hiện tại: {fmtVND(selectedAgent?.debt || 0)}
          </div>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea
              rows={2}
              placeholder="VD: Thanh toán tiền mặt, CK ngân hàng..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
