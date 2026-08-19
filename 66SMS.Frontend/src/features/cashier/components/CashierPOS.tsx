import { useAuthStore } from "@/features/auth/stores/authStore";
import { CashierPromotionModal } from "@/features/cashier/components/CashierPromotionModal";
import {
  CASHIER_CUSTOMER_WALLET,
  CASHIER_DAILY,
  CASHIER_WEEKLY,
} from "@/features/cashier/cashierQueryKey";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import { invoiceApi } from "@/features/invoices/api/invoice.api";
import { useCreateInvoice } from "@/features/invoices/hooks/useInvoices";
import {
  PAYMENT_METHOD,
  POINT_VALUE_VND,
  type InvoiceDto,
} from "@/features/invoices/types/invoice.types";
import { useProductCategories } from "@/features/product-categories/hooks/useProductCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import type { ProductDto } from "@/features/products/types/product.types";
import { useServiceCategories } from "@/features/service_categories/hooks/useServiceCategories";
import { useServices } from "@/features/services/hooks/useServices";
import type { ServiceDto } from "@/features/services/types/service.types";
import { useStaffs } from "@/features/staffs/hooks/useStaffs";
import type { StaffDto } from "@/features/staffs/types/staff.types";
import { useTreatmentCourses } from "@/features/treatment_courses/hooks/useTreatmentCourses";
import type { TreatmentCourseDto } from "@/features/treatment_courses/types/treatmentCourse.types";
import { cn } from "@/lib/utils";
import { FallbackImage } from "@/shared/components/FallbackImage";
import { toast } from "@/shared/utils/kitToast";
import { Modal } from "@/shared/components/Modal";
import { TabNav } from "@/shared/components/Tabs";
import { Button } from "@/shared/elements/Button";
import { Checkbox } from "@/shared/forms/Checkbox";
import { CurrencyInput } from "@/shared/forms/CurrencyInput";
import { FormField } from "@/shared/forms/FormField";
import { Input } from "@/shared/forms/Input";
import { Select } from "@/shared/forms/Select";
import { Textarea } from "@/shared/forms/Textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared/tables/Table";
import { formatDate } from "@/shared/utils/date.utils";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Barcode,
  DollarSign,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  User as UserIcon,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getAdminWallets } from "@/features/wallet/api/wallet.api";

interface POSOrderItem {
  itemType: number;
  id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  staffId?: number;
  staffName?: string;
}

interface POSOrder {
  id: string;
  code: string;
  customer: Partial<CustomerDto> | null;
  items: POSOrderItem[];
  discountAmount: number;
  membershipDiscountAmount: number;
  alreadyPaidAmount: number;
  useLoyaltyPoints: boolean;
  paymentMethod: number;
  note: string;
  promotionCode?: string | null;
  appointmentId?: number | null;
  invoiceId?: number | null;
}

function createEmptyOrder(id: string, code: string): POSOrder {
  return {
    id,
    code,
    customer: null,
    items: [],
    discountAmount: 0,
    membershipDiscountAmount: 0,
    alreadyPaidAmount: 0,
    useLoyaltyPoints: false,
    paymentMethod: PAYMENT_METHOD.CASH,
    note: "",
    promotionCode: null,
  };
}

function buildInvoiceNote(order: POSOrder): string | undefined {
  const parts: string[] = [];
  if (order.note.trim()) parts.push(order.note.trim());
  if (order.promotionCode) {
    parts.push(
      `[Đã áp dụng mã: ${order.promotionCode} giảm ${order.discountAmount.toLocaleString("vi-VN")}đ]`,
    );
  }
  return parts.length > 0 ? parts.join(" ") : undefined;
}

function getCatalogItemImageUrl(
  item: ServiceDto | ProductDto | TreatmentCourseDto,
): string | undefined {
  if (item && typeof item === "object") {
    if ("imageUrl" in item && item.imageUrl) {
      return item.imageUrl;
    }
    if (
      "images" in item &&
      Array.isArray(item.images) &&
      item.images.length > 0
    ) {
      const primary = item.images.find((img) => img.isPrimary);
      return primary?.url || item.images[0]?.url;
    }
  }
  return undefined;
}

interface CashierPOSProps {
  checkoutInvoice?: InvoiceDto | null;
  onClearCheckoutInvoice?: () => void;
}

export function CashierPOS({
  checkoutInvoice,
  onClearCheckoutInvoice,
}: CashierPOSProps = {}) {
  const queryClient = useQueryClient();
  const authStore = useAuthStore();
  const effectiveSalonId = authStore.getEffectiveSalonId();
  const cashierName = authStore.user?.username || "Thu ngân";

  const [orders, setOrders] = useState<POSOrder[]>([
    createEmptyOrder("1", "Đơn Hàng #26070001"),
  ]);
  const [activeOrderId, setActiveOrderId] = useState<string>("1");
  const [activeTab, setActiveTab] = useState<
    "services" | "products" | "courses"
  >("services");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [tempPaidAmount, setTempPaidAmount] = useState<number>(0);
  const [isPayingInvoice, setIsPayingInvoice] = useState(false);

  useEffect(() => {
    if (checkoutInvoice) {
      const orderId = `appointment-${checkoutInvoice.id}`;
      const newOrder: POSOrder = {
        id: orderId,
        code:
          checkoutInvoice.invoiceCode ||
          `HĐ Lịch #${checkoutInvoice.appointmentId}`,
        customer: checkoutInvoice.customerId
          ? {
              id: checkoutInvoice.customerId,
              fullName: checkoutInvoice.customerName || "Khách vãng lai",
              phone: checkoutInvoice.customerPhone || undefined,
              loyaltyPoint: 0,
            }
          : null,
        items: (checkoutInvoice.items || []).map((item) => ({
          itemType: item.itemType || 1,
          id: item.refId || 0,
          name: item.itemName || "Dịch vụ",
          code: `REF${item.refId}`,
          price: item.unitPrice || 0,
          quantity: item.quantity || 1,
          staffId: item.staffId || undefined,
          staffName: item.staffName || undefined,
        })),
        discountAmount: checkoutInvoice.discountAmount || 0,
        membershipDiscountAmount: checkoutInvoice.membershipDiscountAmount || 0,
        alreadyPaidAmount: checkoutInvoice.paidAmount || 0,
        useLoyaltyPoints: (checkoutInvoice.loyaltyPointsUsed || 0) > 0,
        paymentMethod: checkoutInvoice.paymentMethod || PAYMENT_METHOD.CASH,
        note: checkoutInvoice.note || "",
        promotionCode: null,
        appointmentId: checkoutInvoice.appointmentId,
        invoiceId: checkoutInvoice.id,
      };

      setTimeout(() => {
        setOrders((prev) => {
          const filtered = prev.filter((o) => o.id !== orderId);
          return [...filtered, newOrder];
        });
        setActiveOrderId(orderId);

        if (onClearCheckoutInvoice) {
          onClearCheckoutInvoice();
        }
      }, 0);
    }
  }, [checkoutInvoice, onClearCheckoutInvoice]);

  const { data: servicesResult, isLoading: loadingServices } = useServices({
    pageIndex: 1,
    pageSize: 200,
  });
  const services = useMemo(
    () => servicesResult?.data?.items ?? [],
    [servicesResult?.data?.items],
  );

  const { data: productsResult, isLoading: loadingProducts } = useProducts({
    pageIndex: 1,
    pageSize: 200,
  });
  const products = useMemo(
    () => productsResult?.data?.items ?? [],
    [productsResult?.data?.items],
  );

  const { data: coursesResult, isLoading: loadingCourses } =
    useTreatmentCourses({
      pageIndex: 1,
      pageSize: 200,
    });
  const courses = useMemo(
    () => coursesResult?.data?.items ?? [],
    [coursesResult?.data?.items],
  );

  const { data: serviceCatsResult } = useServiceCategories({
    pageIndex: 1,
    pageSize: 100,
  });
  const serviceCats = useMemo(
    () => serviceCatsResult?.data?.items ?? [],
    [serviceCatsResult?.data?.items],
  );

  const { data: productCatsResult } = useProductCategories({
    pageIndex: 1,
    pageSize: 500,
  });
  const productCats = useMemo(
    () => productCatsResult?.data?.items ?? [],
    [productCatsResult?.data?.items],
  );

  const { data: staffsResult } = useStaffs({
    pageIndex: 1,
    pageSize: 100,
    salonId: effectiveSalonId ?? undefined,
    role: "staff",
  });
  const staffs = useMemo(
    () => staffsResult?.data?.items ?? [],
    [staffsResult?.data?.items],
  );

  const { data: customersResult } = useCustomers({
    pageIndex: 1,
    pageSize: 100,
    filter: customerSearch || undefined,
  });
  const customerList = useMemo(
    () => customersResult?.data?.items ?? [],
    [customersResult?.data?.items],
  );

  const createInvoiceMutation = useCreateInvoice();

  const activeOrder = useMemo(() => {
    return orders.find((o: POSOrder) => o.id === activeOrderId) || orders[0];
  }, [orders, activeOrderId]);

  const subTotal = useMemo(() => {
    return activeOrder.items.reduce((sum: number, item: POSOrderItem) => {
      return sum + item.price * item.quantity;
    }, 0);
  }, [activeOrder.items]);

  const pointsUsed = useMemo(() => {
    if (!activeOrder.useLoyaltyPoints || !activeOrder.customer) return 0;
    const maxPointsAllowed = Math.floor(
      (subTotal -
        activeOrder.discountAmount -
        activeOrder.membershipDiscountAmount) /
        POINT_VALUE_VND,
    );
    const customerPoints = activeOrder.customer.loyaltyPoint ?? 0;
    return Math.max(0, Math.min(customerPoints, maxPointsAllowed));
  }, [
    activeOrder.useLoyaltyPoints,
    activeOrder.customer,
    subTotal,
    activeOrder.discountAmount,
    activeOrder.membershipDiscountAmount,
  ]);

  const pointsDiscountValue = pointsUsed * POINT_VALUE_VND;

  const totalAmount = useMemo(() => {
    return Math.max(
      0,
      subTotal -
        activeOrder.discountAmount -
        activeOrder.membershipDiscountAmount -
        pointsDiscountValue,
    );
  }, [
    subTotal,
    activeOrder.discountAmount,
    activeOrder.membershipDiscountAmount,
    pointsDiscountValue,
  ]);

  const amountDue = useMemo(() => {
    return Math.max(0, totalAmount - (activeOrder.alreadyPaidAmount || 0));
  }, [totalAmount, activeOrder.alreadyPaidAmount]);

  const customerId = activeOrder.customer?.id ?? null;
  const isWalletPayment =
    activeOrder.paymentMethod === PAYMENT_METHOD.WALLET;
  const shouldLoadWallet =
    isCheckoutModalOpen && isWalletPayment && customerId != null;

  const walletQuery = useQuery({
    queryKey: [CASHIER_CUSTOMER_WALLET, customerId],
    queryFn: () =>
      getAdminWallets({
        pageIndex: 1,
        pageSize: 1,
        customerId: customerId ?? undefined,
      }),
    enabled: shouldLoadWallet,
  });

  const walletItem = walletQuery.data?.data?.items?.[0];
  const walletLoaded = walletQuery.isSuccess;
  const walletBalance = walletLoaded ? (walletItem?.balance ?? 0) : null;
  const walletInsufficient =
    isWalletPayment &&
    walletBalance != null &&
    walletBalance < amountDue;

  const handleCreateNewOrder = () => {
    const nextNum = orders.length + 1;
    const newId = String(nextNum);
    const newOrder = createEmptyOrder(
      newId,
      `Đơn Hàng #2607${String(nextNum).padStart(4, "0")}`,
    );
    setOrders((prev: POSOrder[]) => [...prev, newOrder]);
    setActiveOrderId(newId);
    toast.success(`Đã tạo ${newOrder.code}`);
  };

  const handleRemoveOrder = (id: string) => {
    if (orders.length <= 1) {
      toast.error("Không thể hủy hóa đơn cuối cùng.");
      return;
    }
    const idx = orders.findIndex((o: POSOrder) => o.id === id);
    const newOrders = orders.filter((o: POSOrder) => o.id !== id);
    setOrders(newOrders);

    const newActiveId = newOrders[idx - 1]?.id || newOrders[0]?.id;
    setActiveOrderId(newActiveId);
    toast.success("Đã hủy đơn hàng nháp.");
  };

  const addToCart = (item: {
    itemType: number;
    id: number;
    name: string;
    code: string;
    price: number;
    imageUrl?: string;
  }) => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        const existingIdx = o.items.findIndex(
          (i: POSOrderItem) => i.itemType === item.itemType && i.id === item.id,
        );
        if (existingIdx > -1) {
          const newItems = [...o.items];
          newItems[existingIdx] = {
            ...newItems[existingIdx],
            quantity: newItems[existingIdx].quantity + 1,
          };
          return { ...o, items: newItems };
        } else {
          const defaultStaff = staffs[0];
          const newItems: POSOrderItem[] = [
            ...o.items,
            {
              itemType: item.itemType,
              id: item.id,
              name: item.name,
              code: item.code,
              price: item.price,
              quantity: 1,
              staffId: defaultStaff?.id ?? undefined,
              staffName: defaultStaff?.fullName ?? undefined,
            },
          ];
          return { ...o, items: newItems };
        }
      });
    });
  };

  const updateCartItemQuantity = (
    itemType: number,
    id: number,
    val: number,
  ) => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        const newItems = o.items
          .map((item: POSOrderItem) => {
            if (item.itemType === itemType && item.id === id) {
              const newQty = item.quantity + val;
              return { ...item, quantity: newQty };
            }
            return item;
          })
          .filter((item: POSOrderItem) => item.quantity > 0);
        return { ...o, items: newItems };
      });
    });
  };

  const updateCartItemStaff = (
    itemType: number,
    id: number,
    staffId: number,
  ) => {
    const staff = staffs.find((s: StaffDto) => s.id === staffId);
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        const newItems = o.items.map((item: POSOrderItem) => {
          if (item.itemType === itemType && item.id === id) {
            return {
              ...item,
              staffId,
              staffName: staff?.fullName ?? undefined,
            };
          }
          return item;
        });
        return { ...o, items: newItems };
      });
    });
  };

  const selectCustomer = (customer: CustomerDto | null) => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        return { ...o, customer, useLoyaltyPoints: false };
      });
    });
    setCustomerSearch("");
    setShowCustomerDropdown(false);
  };

  const setDiscountAmount = (val: number) => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        return { ...o, discountAmount: val, promotionCode: null };
      });
    });
  };

  const applyPromotion = (code: string, discountAmount: number) => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        return {
          ...o,
          discountAmount,
          promotionCode: code,
        };
      });
    });
  };

  const clearDiscount = () => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        return { ...o, discountAmount: 0, promotionCode: null };
      });
    });
  };

  const toggleLoyaltyPoints = () => {
    setOrders((prev: POSOrder[]) => {
      return prev.map((o: POSOrder) => {
        if (o.id !== activeOrderId) return o;
        return { ...o, useLoyaltyPoints: !o.useLoyaltyPoints };
      });
    });
  };

  const handleCheckoutSubmit = async () => {
    const payload = {
      customerId: activeOrder.customer?.id ?? undefined,
      customerName: activeOrder.customer?.fullName ?? "Khách vãng lai",
      customerPhone: activeOrder.customer?.phone ?? undefined,
      salonId: effectiveSalonId ?? undefined,
      discountAmount: activeOrder.discountAmount,
      applyMembershipDiscount: true,
      loyaltyPointsUsed: pointsUsed,
      taxAmount: 0,
      paymentMethod: activeOrder.paymentMethod,
      paidAmount: tempPaidAmount || amountDue,
      note: buildInvoiceNote(activeOrder),
      items: activeOrder.items.map((i: POSOrderItem) => ({
        itemType: i.itemType,
        refId: i.id,
        quantity: i.quantity,
        discountAmount: 0,
        staffId: i.staffId,
      })),
    };

    if (payload.items.length === 0) {
      toast.error(
        "Vui lòng chọn ít nhất 1 sản phẩm hoặc dịch vụ để thanh toán.",
      );
      return;
    }

    const syncInvoiceItems = async (invoiceId: number) => {
      const syncResult = await invoiceApi.updateItems(invoiceId, {
        items: payload.items,
        discountAmount: payload.discountAmount,
        applyMembershipDiscount: payload.applyMembershipDiscount,
        note: payload.note,
      });
      if (!syncResult.isSuccess) {
        toast.error(
          syncResult.message || "Không thể cập nhật mặt hàng hóa đơn.",
        );
        return false;
      }
      return true;
    };

    if (activeOrder.invoiceId) {
      setIsPayingInvoice(true);
      try {
        const synced = await syncInvoiceItems(activeOrder.invoiceId);
        if (!synced) return;

        const result = await invoiceApi.payInvoice(
          activeOrder.invoiceId,
          activeOrder.paymentMethod,
          payload.paidAmount,
          payload.note ?? "",
        );
        if (result.isSuccess) {
          toast.success(result.message || "Thanh toán hóa đơn thành công.");
          await queryClient.invalidateQueries({ queryKey: [CASHIER_DAILY] });
          await queryClient.invalidateQueries({ queryKey: [CASHIER_WEEKLY] });
          setIsCheckoutModalOpen(false);
          if (orders.length === 1) {
            setOrders([createEmptyOrder("1", "Đơn Hàng #26070001")]);
            setActiveOrderId("1");
          } else {
            handleRemoveOrder(activeOrderId);
          }
        } else {
          toast.error(result.message || "Thanh toán hóa đơn thất bại.");
        }
      } catch (err) {
        console.error("Lỗi khi thanh toán hóa đơn POS", err);
        toast.error("Lỗi kết nối tới máy chủ.");
      } finally {
        setIsPayingInvoice(false);
      }
      return;
    }

    createInvoiceMutation.mutate(payload, {
      onSuccess: async (result) => {
        if (result.isSuccess) {
          await queryClient.invalidateQueries({ queryKey: [CASHIER_DAILY] });
          await queryClient.invalidateQueries({ queryKey: [CASHIER_WEEKLY] });
          setIsCheckoutModalOpen(false);
          if (orders.length === 1) {
            setOrders([createEmptyOrder("1", "Đơn Hàng #26070001")]);
            setActiveOrderId("1");
          } else {
            handleRemoveOrder(activeOrderId);
          }
        }
      },
    });
  };

  const filteredCatalogItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "services") {
      return services.filter((s: ServiceDto) => {
        const matchQ =
          s.name?.toLowerCase().includes(q) ||
          s.code?.toLowerCase().includes(q);
        const matchCat = activeCategoryId
          ? s.categoryId === activeCategoryId
          : true;
        return matchQ && matchCat;
      });
    } else if (activeTab === "products") {
      return products.filter((p: ProductDto) => {
        const matchQ =
          p.name?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q);
        const matchCat = activeCategoryId
          ? p.categoryId === activeCategoryId
          : true;
        return matchQ && matchCat;
      });
    } else {
      return courses.filter((c: TreatmentCourseDto) => {
        return (
          c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q)
        );
      });
    }
  }, [activeTab, activeCategoryId, searchQuery, services, products, courses]);

  const renderCategoryChips = () => {
    if (activeTab === "courses") return null;
    const cats = activeTab === "services" ? serviceCats : productCats;
    return (
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Button
          size="sm"
          pill
          variant={activeCategoryId === null ? "primary" : "outline"}
          className="mb-0 mr-0"
          onClick={() => setActiveCategoryId(null)}
        >
          Tất cả
        </Button>
        {cats.map((category: { id?: number; name?: string }) => (
          <Button
            key={category.id}
            size="sm"
            pill
            variant={activeCategoryId === category.id ? "primary" : "outline"}
            className="mb-0 mr-0"
            onClick={() => setActiveCategoryId(category.id ?? null)}
          >
            {category.name}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full bg-kit-page font-sans p-2 gap-2 relative z-10 overflow-hidden">
      <div className="relative z-20 flex shrink-0 items-center gap-3 rounded border border-kit bg-kit-white p-2 shadow-xs">
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center">
            <Search className="h-4 w-4 text-kit-muted" />
          </div>
          <Input
            type="text"
            value={customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
            onFocus={() => setShowCustomerDropdown(true)}
            placeholder="Tìm khách hàng theo tên hoặc số điện thoại"
            inputSize="sm"
            className="pl-9"
          />

          {showCustomerDropdown && customerSearch.trim() ? (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowCustomerDropdown(false)}
              />
              <div className="absolute top-full right-0 left-0 z-30 mt-1.5 max-h-56 divide-y divide-kit overflow-y-auto rounded border border-kit bg-kit-white shadow-lg">
                {customerList.length === 0 ? (
                  <div className="p-3 text-center text-xs font-medium text-kit-muted">
                    Không tìm thấy khách hàng nào khớp.
                  </div>
                ) : (
                  customerList.map((customer: CustomerDto) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => selectCustomer(customer)}
                      className="flex w-full items-center justify-between p-2.5 text-left text-xs text-kit-heading hover:bg-kit-page"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          {customer.fullName}
                          <span className="text-2xs font-normal text-kit-muted">
                            (CS{String(customer.id).padStart(5, "0")})
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-kit-muted">
                          {customer.phone}
                        </div>
                      </div>
                      <div className="text-2xs font-bold text-kit-warning">
                        {customer.loyaltyPoint ?? 0} điểm
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>

        <Button
          size="sm"
          variant="primary"
          className="mb-0 mr-0 shrink-0"
          onClick={handleCreateNewOrder}
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tạo đơn hàng
        </Button>
      </div>

      <div className="flex-1 flex min-h-0 min-w-0 w-full gap-2 relative lg:grid lg:grid-cols-12">
        <div className="lg:col-span-6 bg-white border border-kit rounded-[3px] shadow-xs flex flex-col overflow-hidden h-full">
          <div className="p-3 bg-white border-b border-kit flex items-center justify-between shrink-0 flex-wrap gap-2">
            <span className="font-bold text-sm text-kit-primary">
              {activeOrder.code}
            </span>

            {orders.length > 1 && (
              <Select
                value={String(activeOrderId)}
                onChange={(e) => setActiveOrderId(e.target.value)}
                options={orders.map((order: POSOrder) => ({
                  value: order.id,
                  label: order.customer?.fullName || "Khách vãng lai",
                }))}
                inputSize="sm"
                className="mb-0 max-w-55"
              />
            )}
          </div>

          <div className="p-3 border-b border-kit bg-kit-page shrink-0 grid grid-cols-12 gap-3 text-xs">
            <div className="col-span-6 flex items-start gap-2.5 border-r border-kit pr-2">
              <div className="w-10 h-10 rounded-full bg-kit-page border border-kit flex items-center justify-center text-kit-muted font-bold shrink-0 shadow-inner">
                {activeOrder.customer?.fullName?.charAt(0) || (
                  <UserIcon className="w-5 h-5 text-kit-muted" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-kit-primary truncate">
                  {activeOrder.customer?.fullName || "Khách vãng lai"}
                </div>
                {activeOrder.customer?.phone && (
                  <div className="text-xs text-kit-muted font-medium">
                    {activeOrder.customer.phone}
                  </div>
                )}
                {activeOrder.customer != null && (
                  <div className="text-xs text-kit-danger font-bold">
                    Điểm: {activeOrder.customer.loyaltyPoint ?? 0} điểm
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-6 space-y-1 text-xs">
              <div className="flex justify-between gap-1 text-kit-muted">
                <span>Ngày:</span>
                <span className="font-semibold text-kit-heading">
                  {formatDate().format("DD/MM/YYYY HH:mm")}
                </span>
              </div>
              <div className="flex justify-between gap-1 text-kit-muted">
                <span>Thu ngân:</span>
                <span className="font-semibold text-kit-heading truncate">
                  {cashierName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-white">
            {activeOrder.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-kit-muted p-6">
                <div className="w-16 h-16 rounded-full bg-kit-page flex items-center justify-center mb-2.5">
                  <Barcode className="w-8 h-8 text-kit-muted" />
                </div>
                <p className="text-xs font-semibold text-kit-muted">
                  Đơn hàng chưa có sản phẩm & dịch vụ nào.
                </p>
              </div>
            ) : (
              <Table hover size="sm" className="text-xs">
                <TableHead className="sticky top-0 z-10 bg-kit-page backdrop-blur-xs">
                  <TableRow className="text-2xs uppercase tracking-wider">
                    <TableHeaderCell className="py-2.5 px-3">
                      Sản phẩm & dịch vụ
                    </TableHeaderCell>
                    <TableHeaderCell className="w-24 py-2.5 px-2 text-center">
                      Số lượng
                    </TableHeaderCell>
                    <TableHeaderCell className="w-24 py-2.5 px-2 text-center">
                      Nhân viên
                    </TableHeaderCell>
                    <TableHeaderCell className="w-28 py-2.5 px-3 text-right">
                      Thành tiền
                    </TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody className="divide-y divide-kit text-xs">
                  {activeOrder.items.map((item: POSOrderItem) => (
                    <TableRow
                      key={`${item.itemType}-${item.id}`}
                      className="group transition-colors"
                    >
                      <TableCell className="py-3 px-3">
                        <div className="font-bold text-kit-heading leading-tight">
                          {item.name}
                        </div>
                        <div className="text-2xs text-kit-muted font-medium mt-0.5">
                          Mã: {item.code} | Giá:{" "}
                          {item.price.toLocaleString("vi-VN")}đ
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <div className="mx-auto flex w-24 items-center justify-center gap-0.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mb-0 mr-0 px-2 py-0.5"
                            onClick={() =>
                              updateCartItemQuantity(item.itemType, item.id, -1)
                            }
                          >
                            -
                          </Button>
                          <span className="min-w-6 select-none text-center text-xs font-bold text-kit-heading">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="mb-0 mr-0 px-2 py-0.5"
                            onClick={() =>
                              updateCartItemQuantity(item.itemType, item.id, 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-2 text-center">
                        <Select
                          value={item.staffId ? String(item.staffId) : ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val) {
                              updateCartItemStaff(
                                item.itemType,
                                item.id,
                                Number(val),
                              );
                            }
                          }}
                          options={[
                            { value: "", label: "Chọn..." },
                            ...staffs.map((staff: StaffDto) => ({
                              value: String(staff.id ?? ""),
                              label: staff.fullName ?? "",
                            })),
                          ]}
                          inputSize="sm"
                          className="mb-0"
                        />
                      </TableCell>
                      <TableCell className="py-3 px-3 text-right font-bold text-kit-heading">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mb-0 mr-0 p-1"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.itemType,
                                item.id,
                                -item.quantity,
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="p-3 bg-white border-t border-kit shrink-0 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-kit-muted font-medium">
              <span>Thành tiền</span>
              <span className="font-bold text-kit-heading">
                {subTotal.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-kit-muted font-medium">
              <button
                type="button"
                onClick={() => setIsDiscountModalOpen(true)}
                className="text-kit-danger hover:underline flex items-center gap-0.5"
              >
                {activeOrder.promotionCode
                  ? `KM: ${activeOrder.promotionCode}`
                  : "Giảm giá"}
                <span className="text-2xs text-kit-muted font-normal">
                  ({activeOrder.discountAmount > 0 ? "Đổi" : "Chọn KM"})
                </span>
              </button>
              <span className="font-bold text-kit-danger">
                -{activeOrder.discountAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-kit-muted font-medium">
              <span className="text-kit-info flex items-center gap-0.5">
                Giảm hạng TV
              </span>
              <span className="font-bold text-kit-primary">
                -{activeOrder.membershipDiscountAmount.toLocaleString("vi-VN")}{" "}
                đ
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-kit text-sm font-bold text-kit-heading">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">Tổng tiền</span>
                {activeOrder.customer &&
                  (activeOrder.customer.loyaltyPoint ?? 0) > 0 && (
                    <Checkbox
                      checked={activeOrder.useLoyaltyPoints}
                      onChange={() => toggleLoyaltyPoints()}
                      label={`Điểm thưởng: ${pointsUsed} điểm`}
                      inline
                      className="mb-0 text-xs font-normal text-kit-muted"
                    />
                  )}
              </div>
              <span className="text-lg font-bold text-kit-primary">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>

            {activeOrder.alreadyPaidAmount > 0 && (
              <>
                <div className="flex justify-between items-center text-kit-muted font-medium">
                  <span>Đã thu (cọc):</span>
                  <span className="font-bold text-kit-primary">
                    -{activeOrder.alreadyPaidAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-kit-heading">
                  <span>Còn lại cần thu:</span>
                  <span className="text-lg font-bold text-kit-primary">
                    {amountDue.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-1.5 pt-3">
              <Button
                size="sm"
                variant="warning"
                className="mb-0 mr-0"
                onClick={() => handleRemoveOrder(activeOrderId)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                Hủy
              </Button>

              <Button
                size="sm"
                variant="primary"
                className="mb-0 mr-0"
                loading={createInvoiceMutation.isPending || isPayingInvoice}
                onClick={() => {
                  if (activeOrder.items.length === 0) {
                    toast.error("Vui lòng chọn ít nhất 1 mặt hàng.");
                    return;
                  }
                  setTempPaidAmount(amountDue);
                  setIsCheckoutModalOpen(true);
                }}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-kit rounded-[3px] shadow-xs flex flex-col overflow-hidden h-full">
          <div className="p-3 bg-white border-b border-kit flex flex-col gap-3 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 z-10 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-kit-muted" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quét mã hoặc Tìm kiếm theo tên hoặc mã sản phẩm & dịch vụ"
                inputSize="sm"
                className="pl-9"
              />
            </div>

            <TabNav
              items={[
                { id: "services", label: "Dịch vụ" },
                { id: "products", label: "Sản phẩm" },
                { id: "courses", label: "Thẻ dịch vụ" },
              ]}
              activeId={activeTab}
              onChange={(id: string) => {
                setActiveTab(id as "services" | "products" | "courses");
                setActiveCategoryId(null);
              }}
              variant="btn-group-primary"
              className="w-full"
            />

            {renderCategoryChips()}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-3 bg-kit-page">
            {loadingServices || loadingProducts || loadingCourses ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-kit h-28 rounded-[3px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCatalogItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-kit-muted py-12">
                <SlidersHorizontal className="w-10 h-10 text-kit-muted mb-2" />
                <p className="text-xs font-semibold">
                  Không tìm thấy kết quả phù hợp
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {filteredCatalogItems.map(
                  (item: ServiceDto | ProductDto | TreatmentCourseDto) => {
                    const itemType =
                      activeTab === "services"
                        ? 1
                        : activeTab === "products"
                          ? 2
                          : 3;
                    const id = item.id!;
                    const imageUrl = getCatalogItemImageUrl(item);

                    const cartQty =
                      activeOrder.items.find(
                        (i: POSOrderItem) =>
                          i.itemType === itemType && i.id === id,
                      )?.quantity || 0;

                    return (
                      <div
                        key={id}
                        onClick={() =>
                          addToCart({
                            itemType,
                            id,
                            name: item.name!,
                            code: item.code!,
                            price: item.sellingPrice!,
                            imageUrl: imageUrl,
                          })
                        }
                        className={cn(
                          "bg-white border rounded-[3px] p-2 flex items-start gap-2.5 cursor-pointer hover:shadow-xs transition-all duration-150 select-none relative min-h-[72px]",
                          cartQty > 0
                            ? "border-kit-primary ring-1 ring-kit-primary/40"
                            : "border-kit",
                        )}
                      >
                        {cartQty > 0 && (
                          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-kit-primary text-white flex items-center justify-center text-2xs font-bold shadow-xs z-10">
                            {cartQty}
                          </div>
                        )}

                        <div className="w-12 h-12 rounded-[3px] overflow-hidden bg-kit-page flex items-center justify-center shrink-0 shadow-inner">
                          <FallbackImage
                            kind={itemType === 2 ? "product" : "service"}
                            src={imageUrl}
                            alt={item.name ?? undefined}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="font-bold text-xs text-kit-heading uppercase tracking-wide truncate">
                            {item.name}
                          </div>
                          <div className="text-2xs text-kit-muted font-medium">
                            {item.code}
                          </div>
                          <div className="text-xs font-bold text-kit-heading pt-1">
                            {item.sellingPrice?.toLocaleString("vi-VN")} đ
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </div>

          <div className="bg-white border-t border-kit p-2.5 text-2xs text-kit-muted font-medium flex items-center justify-end shrink-0">
            <span>Hoa Sen Spa POS © 2026</span>
          </div>
        </div>
      </div>

      <CashierPromotionModal
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        orderTotal={Math.max(
          0,
          subTotal - activeOrder.membershipDiscountAmount,
        )}
        currentDiscount={activeOrder.discountAmount}
        currentPromotionCode={activeOrder.promotionCode}
        onApplyManual={setDiscountAmount}
        onApplyPromotion={applyPromotion}
        onClear={clearDiscount}
      />

      <Modal
        open={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Xác nhận thanh toán"
        size="md"
        footer={
          <>
            <Button
              size="sm"
              variant="outline"
              className="mb-0"
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              variant="primary"
              className="mb-0"
              loading={createInvoiceMutation.isPending || isPayingInvoice}
              disabled={
                (isWalletPayment && !customerId) ||
                walletInsufficient ||
                (shouldLoadWallet && walletQuery.isLoading)
              }
              onClick={handleCheckoutSubmit}
            >
              Xác nhận & Thu tiền
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded border border-kit-primary/10 bg-kit-primary/5 p-3">
            <div className="flex items-center justify-between text-xs font-semibold text-kit-muted">
              <span>Khách hàng:</span>
              <span className="font-bold text-kit-heading">
                {activeOrder.customer?.fullName || "Khách vãng lai"}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-semibold text-kit-muted">
              <span>Tổng tiền hóa đơn:</span>
              <span className="font-bold text-kit-heading">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
            {activeOrder.alreadyPaidAmount > 0 && (
              <div className="mt-1 flex items-center justify-between text-xs font-semibold text-kit-muted">
                <span>Đã thu (cọc):</span>
                <span className="font-bold text-kit-primary">
                  -{activeOrder.alreadyPaidAmount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between text-xs font-semibold text-kit-muted">
              <span>Số tiền cần thanh toán:</span>
              <span className="text-sm font-bold text-kit-primary">
                {amountDue.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <FormField label="Phương thức thanh toán">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    method: PAYMENT_METHOD.CASH,
                    label: "Tiền mặt",
                    icon: DollarSign,
                  },
                  {
                    method: PAYMENT_METHOD.BANK_TRANSFER,
                    label: "Chuyển khoản",
                    icon: ArrowRight,
                  },
                  {
                    method: PAYMENT_METHOD.WALLET,
                    label: "Ví",
                    icon: Wallet,
                  },
                ] as const
              ).map(
                (paymentOption: {
                  method: number;
                  label: string;
                  icon: typeof DollarSign;
                }) => {
                  const PaymentIcon = paymentOption.icon;
                  return (
                    <Button
                      key={paymentOption.method}
                      size="sm"
                      variant={
                        activeOrder.paymentMethod === paymentOption.method
                          ? "primary"
                          : "outline"
                      }
                      className="mb-0 mr-0 justify-start"
                      onClick={() =>
                        setOrders((prev: POSOrder[]) =>
                          prev.map((order: POSOrder) =>
                            order.id === activeOrderId
                              ? {
                                  ...order,
                                  paymentMethod: paymentOption.method,
                                }
                              : order,
                          ),
                        )
                      }
                    >
                      <PaymentIcon className="mr-2 h-4 w-4 shrink-0" />
                      {paymentOption.label}
                    </Button>
                  );
                },
              )}
            </div>
          </FormField>

          {isWalletPayment ? (
            <div className="rounded border border-kit bg-kit-white px-3 py-2 text-xs">
              {!customerId ? (
                <p className="font-medium text-kit-danger">
                  Cần chọn khách hàng để thanh toán bằng ví.
                </p>
              ) : walletQuery.isLoading ? (
                <p className="text-kit-muted">Đang tải số dư ví...</p>
              ) : walletQuery.isError ? (
                <p className="font-medium text-kit-danger">
                  Không tải được thông tin ví.
                </p>
              ) : walletBalance == null ? null : (
                <>
                  <div className="flex items-center justify-between font-semibold text-kit-muted">
                    <span>Số dư ví:</span>
                    <span className="font-bold text-kit-heading">
                      {walletBalance.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  {walletInsufficient ? (
                    <p className="mt-1 font-medium text-kit-danger">
                      Số dư không đủ để thanh toán{" "}
                      {amountDue.toLocaleString("vi-VN")}đ.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          <FormField label="Khách thanh toán (VND)">
            <CurrencyInput
              value={tempPaidAmount}
              onChange={(value: number | undefined) =>
                setTempPaidAmount(value ?? 0)
              }
              inputSize="sm"
            />
          </FormField>

          <FormField label="Ghi chú đơn hàng">
            <Textarea
              value={activeOrder.note}
              onChange={(e) => {
                const val = e.target.value;
                setOrders((prev: POSOrder[]) =>
                  prev.map((order: POSOrder) =>
                    order.id === activeOrderId
                      ? { ...order, note: val }
                      : order,
                  ),
                );
              }}
              placeholder="Ghi chú thêm về dịch vụ, yêu cầu khách hàng..."
              rows={2}
              inputSize="sm"
            />
          </FormField>

          {activeOrder.paymentMethod === PAYMENT_METHOD.CASH &&
            tempPaidAmount > amountDue && (
              <div className="flex items-center justify-between border-t border-dashed border-kit pt-3 text-xs font-bold text-kit-muted">
                <span>Tiền thừa trả khách:</span>
                <span className="text-sm font-bold text-kit-primary">
                  {(tempPaidAmount - amountDue).toLocaleString("vi-VN")}đ
                </span>
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
}
