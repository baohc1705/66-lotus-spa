import { useAuthStore } from "@/features/auth/stores/authStore";
import { cashierApi } from "@/features/cashier/api/cashier.api";
import { useCustomers } from "@/features/customers/hooks/useCustomers";
import type { CustomerDto } from "@/features/customers/types/customer.types";
import { invoiceApi } from "@/features/invoices/api/invoice.api";
import { useCreateInvoice } from "@/features/invoices/hooks/useInvoices";
import {
  PAYMENT_METHOD,
  POINT_VALUE_VND,
  type InvoiceDto,
} from "@/features/invoices/types/invoice.types";
import { useProductCategories } from "@/features/product_categories/hooks/useProductCategories";
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
import { formatDate } from "@/shared/utils/date.utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Barcode,
  ChevronDown,
  CreditCard,
  DollarSign,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  appointmentId?: number | null;
  invoiceId?: number | null;
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
    {
      id: "1",
      code: "Đơn Hàng #26070001",
      customer: null,
      items: [],
      discountAmount: 0,
      membershipDiscountAmount: 0,
      alreadyPaidAmount: 0,
      useLoyaltyPoints: false,
      paymentMethod: PAYMENT_METHOD.CASH,
      note: "",
    },
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
  const [tempDiscount, setTempDiscount] = useState<number>(0);
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

  const handleCreateNewOrder = () => {
    const nextNum = orders.length + 1;
    const newId = String(nextNum);
    const newOrder: POSOrder = {
      id: newId,
      code: `Đơn Hàng #2607${String(nextNum).padStart(4, "0")}`,
      customer: null,
      items: [],
      discountAmount: 0,
      membershipDiscountAmount: 0,
      alreadyPaidAmount: 0,
      useLoyaltyPoints: false,
      paymentMethod: PAYMENT_METHOD.CASH,
      note: "",
    };
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
        return { ...o, discountAmount: val };
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
      note: activeOrder.note || undefined,
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

    if (activeOrder.paymentMethod === PAYMENT_METHOD.VNPAY) {
      if (activeOrder.appointmentId) {
        setIsPayingInvoice(true);
        try {
          const response = await cashierApi.createVnPayUrl(
            activeOrder.appointmentId,
          );
          if (response.isSuccess && response.data) {
            window.location.href = response.data;
            return;
          }
          toast.error(
            response.message ||
              "Có lỗi xảy ra khi tạo liên kết thanh toán VNPAY",
          );
        } catch (err) {
          console.error("Error creating VNPAY URL", err);
          toast.error("Lỗi kết nối tới máy chủ");
        } finally {
          setIsPayingInvoice(false);
        }
      } else {
        toast.error(
          "Thanh toán VNPAY hiện tại chỉ khả dụng đối với đơn hàng tạo từ lịch hẹn.",
        );
      }
      return;
    }

    if (activeOrder.invoiceId) {
      setIsPayingInvoice(true);
      try {
        const result = await invoiceApi.payInvoice(
          activeOrder.invoiceId,
          activeOrder.paymentMethod,
          payload.paidAmount,
          payload.note,
        );
        if (result.isSuccess) {
          toast.success(result.message || "Thanh toán hóa đơn thành công.");
          await queryClient.invalidateQueries({ queryKey: ["cashier-daily"] });
          await queryClient.invalidateQueries({ queryKey: ["cashier-weekly"] });
          setIsCheckoutModalOpen(false);
          if (orders.length === 1) {
            setOrders([
              {
                id: "1",
                code: "Đơn Hàng #26070001",
                customer: null,
                items: [],
                discountAmount: 0,
                membershipDiscountAmount: 0,
                alreadyPaidAmount: 0,
                useLoyaltyPoints: false,
                paymentMethod: PAYMENT_METHOD.CASH,
                note: "",
              },
            ]);
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
          await queryClient.invalidateQueries({ queryKey: ["cashier-daily"] });
          await queryClient.invalidateQueries({ queryKey: ["cashier-weekly"] });
          setIsCheckoutModalOpen(false);
          if (orders.length === 1) {
            setOrders([
              {
                id: "1",
                code: "Đơn Hàng #26070001",
                customer: null,
                items: [],
                discountAmount: 0,
                membershipDiscountAmount: 0,
                alreadyPaidAmount: 0,
                useLoyaltyPoints: false,
                paymentMethod: PAYMENT_METHOD.CASH,
                note: "",
              },
            ]);
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
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setActiveCategoryId(null)}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200",
            activeCategoryId === null
              ? "bg-adminGreen-600 text-white border-adminGreen-600 shadow-sm"
              : "bg-white text-adminGray-600 border-adminGray-100 hover:bg-adminGray-50",
          )}
        >
          Tất cả
        </button>
        {cats.map((c: { id?: number; name?: string }) => (
          <button
            key={c.id}
            onClick={() => setActiveCategoryId(c.id ?? null)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all duration-200",
              activeCategoryId === c.id
                ? "bg-adminGreen-600 text-white border-adminGreen-600 shadow-sm"
                : "bg-white text-adminGray-600 border-adminGray-100 hover:bg-adminGray-50",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 w-full bg-adminGray-50 font-sans p-2 gap-2 relative z-10 overflow-hidden">
      <div className="bg-white border border-adminGray-100 rounded-[3px] p-2 shadow-sm shrink-0 flex items-center justify-between gap-3 relative">
        <div className="relative w-96 max-w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-adminGray-400" />
          </div>
          <input
            type="text"
            value={customerSearch}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCustomerSearch(e.target.value);
              setShowCustomerDropdown(true);
            }}
            onFocus={() => setShowCustomerDropdown(true)}
            placeholder="Tìm khách hàng theo tên hoặc số điện thoại"
            className="w-full text-xs bg-adminGray-50 border border-adminGray-300 rounded-[3px] py-2 pl-9 pr-4 text-adminInk focus:outline-none focus:border-adminGreen-600 focus:ring-1 focus:ring-adminGreen-600 transition shadow-inner"
          />

          {showCustomerDropdown && customerSearch.trim() && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowCustomerDropdown(false)}
              />
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-adminGray-100 rounded-[3px] shadow-lg max-h-56 overflow-y-auto z-30 divide-y divide-adminGray-100">
                {customerList.length === 0 ? (
                  <div className="p-3 text-xs text-adminGray-400 font-medium text-center">
                    Không tìm thấy khách hàng nào khớp.
                  </div>
                ) : (
                  customerList.map((c: CustomerDto) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectCustomer(c)}
                      className="w-full text-left p-2.5 text-xs text-adminInk hover:bg-adminGray-50/50 transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          {c.fullName}
                          <span className="text-2xs text-adminGray-400 font-normal">
                            (CS{String(c.id).padStart(5, "0")})
                          </span>
                        </div>
                        <div className="text-xs text-adminGray-600 mt-0.5">
                          {c.phone}
                        </div>
                      </div>
                      <div className="text-2xs text-adminGold-600 font-bold">
                        {c.loyaltyPoint ?? 0} điểm
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewOrder}
            className="flex items-center gap-1.5 bg-adminGreen-600 hover:bg-adminGreen-600/90 text-white px-3.5 py-1.5 rounded-[3px] text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Đơn Hàng</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 min-w-0 w-full gap-2 relative lg:grid lg:grid-cols-12">
        <div className="lg:col-span-6 bg-white border border-adminGray-100 rounded-[3px] shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-3 bg-white border-b border-adminGray-100 flex items-center justify-between shrink-0 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-sm text-adminGreen-600 flex items-center gap-1">
                <span>{activeOrder.code}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={activeOrderId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setActiveOrderId(e.target.value)
                  }
                  className="appearance-none bg-adminGreen-600 hover:bg-adminGreen-600/90 text-white rounded-[3px] py-1 pl-2.5 pr-8 text-xs font-bold shadow-sm focus:outline-none cursor-pointer"
                >
                  {orders.map((o: POSOrder) => (
                    <option key={o.id} value={o.id}>
                      {o.code} - {o.customer?.fullName || "Khách vãng lai"}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-white absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-3 border-b border-adminGray-100 bg-adminGray-50/20 shrink-0 grid grid-cols-12 gap-3 text-xs">
            <div className="col-span-6 flex items-start gap-2.5 border-r border-adminGray-100 pr-2">
              <div className="w-10 h-10 rounded-full bg-adminGray-100 border border-adminGray-100 flex items-center justify-center text-adminGray-600 font-bold shrink-0 shadow-inner">
                {activeOrder.customer?.fullName?.charAt(0) || (
                  <UserIcon className="w-5 h-5 text-adminGray-400" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold text-adminGreen-600 flex items-center gap-1">
                  <span className="truncate">
                    {activeOrder.customer?.fullName || "Khách vãng lai"}
                  </span>
                </div>
                <div className="text-xs text-adminGray-600 font-medium">
                  {activeOrder.customer?.phone || "Chưa có SĐT"}
                </div>
                <div className="text-xs text-adminGray-600">
                  Mã:{" "}
                  <span className="font-medium">
                    CS{String(activeOrder.customer?.id || 0).padStart(6, "0")}
                  </span>
                </div>
                <div className="text-xs text-state-danger-text font-bold flex items-center gap-1">
                  Điểm: {activeOrder.customer?.loyaltyPoint ?? 0} điểm
                </div>
              </div>
            </div>

            <div className="col-span-6 space-y-1 relative text-xs">
              <div className="flex justify-between gap-1 text-adminGray-600">
                <span>Ngày hóa đơn:</span>
                <span className="font-semibold text-adminInk flex items-center gap-0.5">
                  {formatDate().format("DD/MM/YYYY")}
                </span>
              </div>
              <div className="flex justify-between gap-1 text-adminGray-600">
                <span>Giờ vào/ra:</span>
                <span className="font-semibold text-adminInk flex items-center gap-0.5">
                  {formatDate().format("HH:mm")}
                </span>
              </div>
              <div className="flex justify-between gap-1 text-adminGray-600">
                <span>N.viên thu ngân:</span>
                <span className="font-semibold text-adminInk truncate">
                  {cashierName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-white">
            {activeOrder.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-adminGray-400 p-6">
                <div className="w-16 h-16 rounded-full bg-adminGray-50 flex items-center justify-center mb-2.5">
                  <Barcode className="w-8 h-8 text-adminGray-300" />
                </div>
                <p className="text-xs font-semibold text-adminGray-600">
                  Đơn hàng chưa có sản phẩm & dịch vụ nào.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-adminGray-50/80 border-b border-adminGray-100 text-2xs text-adminGray-600 font-bold uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                    <th className="py-2.5 px-3">Sản phẩm & dịch vụ</th>
                    <th className="py-2.5 px-2 text-center w-24">Số lượng</th>
                    <th className="py-2.5 px-2 text-center w-24">Nhân viên</th>
                    <th className="py-2.5 px-3 text-right w-28">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-adminGray-100 text-xs">
                  {activeOrder.items.map((item: POSOrderItem) => (
                    <tr
                      key={`${item.itemType}-${item.id}`}
                      className="hover:bg-adminGray-50/50 group transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-adminInk leading-tight">
                          {item.name}
                        </div>
                        <div className="text-2xs text-adminGray-400 font-medium mt-0.5">
                          Mã: {item.code} | Giá:{" "}
                          {item.price.toLocaleString("vi-VN")}đ
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex items-center justify-center border border-adminGray-100 rounded-[3px] bg-white w-20 mx-auto shadow-inner">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartItemQuantity(item.itemType, item.id, -1)
                            }
                            className="px-2 py-1 text-adminGray-600 hover:bg-adminGray-100 hover:text-adminInk font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="flex-1 font-bold text-center text-xs text-adminInk select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartItemQuantity(item.itemType, item.id, 1)
                            }
                            className="px-2 py-1 text-adminGray-600 hover:bg-adminGray-100 hover:text-adminInk font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center relative">
                        <div className="inline-block relative">
                          <select
                            value={item.staffId || ""}
                            onChange={(
                              e: React.ChangeEvent<HTMLSelectElement>,
                            ) => {
                              const val = e.target.value;
                              if (val)
                                updateCartItemStaff(
                                  item.itemType,
                                  item.id,
                                  Number(val),
                                );
                            }}
                            className="appearance-none bg-adminGray-50 border border-adminGray-100 rounded-[3px] py-1 pl-2 pr-6 text-2xs font-bold text-adminInk shadow-sm cursor-pointer hover:bg-adminGray-100 focus:outline-none"
                          >
                            <option value="">Chọn...</option>
                            {staffs.map((s: StaffDto) => (
                              <option key={s.id} value={s.id ?? ""}>
                                {s.fullName}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-adminGray-600 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-adminInk">
                        <div className="flex items-center justify-end gap-1.5">
                          <span>
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN",
                            )}
                            đ
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateCartItemQuantity(
                                item.itemType,
                                item.id,
                                -item.quantity,
                              )
                            }
                            className="p-1 text-adminGray-400 hover:text-lotus-error transition-colors rounded hover:bg-adminGray-100"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-3 bg-white border-t border-adminGray-100 shrink-0 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-adminGray-600 font-medium">
              <span>Thành tiền</span>
              <span className="font-bold text-adminInk">
                {subTotal.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-adminGray-600 font-medium">
              <button
                onClick={() => {
                  setTempDiscount(activeOrder.discountAmount);
                  setIsDiscountModalOpen(true);
                }}
                className="text-state-danger-text hover:underline flex items-center gap-0.5"
              >
                Giảm giá{" "}
                <span className="text-2xs text-adminGray-400 font-normal">
                  (Thêm giảm giá)
                </span>
              </button>
              <span className="font-bold text-state-danger-text">
                -{activeOrder.discountAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>
            <div className="flex justify-between items-center text-adminGray-600 font-medium">
              <span className="text-state-info-text flex items-center gap-0.5">
                Giảm hạng TV
              </span>
              <span className="font-bold text-adminGreen-600">
                -{activeOrder.membershipDiscountAmount.toLocaleString("vi-VN")}{" "}
                đ
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-adminGray-100 text-sm font-bold text-adminInk">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">Tổng tiền</span>
                {activeOrder.customer &&
                  (activeOrder.customer.loyaltyPoint ?? 0) > 0 && (
                    <label className="flex items-center gap-1 text-xs text-adminGray-600 font-normal cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={activeOrder.useLoyaltyPoints}
                        onChange={toggleLoyaltyPoints}
                        className="w-3.5 h-3.5 text-adminGreen-600 border-adminGray-300 rounded focus:ring-adminGreen-600"
                      />
                      <span>Điểm thưởng: {pointsUsed} điểm</span>
                    </label>
                  )}
              </div>
              <span className="text-lg font-bold text-adminGreen-600">
                {totalAmount.toLocaleString("vi-VN")} đ
              </span>
            </div>

            {activeOrder.alreadyPaidAmount > 0 && (
              <>
                <div className="flex justify-between items-center text-adminGray-600 font-medium">
                  <span>Đã thu (cọc):</span>
                  <span className="font-bold text-adminGreen-600">
                    -{activeOrder.alreadyPaidAmount.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-adminInk">
                  <span>Còn lại cần thu:</span>
                  <span className="text-lg font-bold text-adminGreen-600">
                    {amountDue.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </>
            )}

            <div className="flex items-center justify-between gap-1.5 pt-3">
              <button
                onClick={() => handleRemoveOrder(activeOrderId)}
                className="bg-state-warning-solid hover:bg-state-warning-solid text-white py-2 px-3 rounded-[3px] flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hủy</span>
              </button>

              <button
                onClick={() => {
                  if (activeOrder.items.length === 0) {
                    toast.error("Vui lòng chọn ít nhất 1 mặt hàng.");
                    return;
                  }
                  setTempPaidAmount(amountDue);
                  setIsCheckoutModalOpen(true);
                }}
                disabled={createInvoiceMutation.isPending || isPayingInvoice}
                className="bg-adminGreen-600 hover:bg-adminGreen-600/90 text-white py-2 px-4 rounded-[3px] flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm disabled:opacity-50"
              >
                <span>Thanh toán</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white border border-adminGray-100 rounded-[3px] shadow-sm flex flex-col overflow-hidden h-full">
          <div className="p-3 bg-white border-b border-adminGray-100 flex flex-col gap-3 shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-adminGray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Quét mã hoặc Tìm kiếm theo tên hoặc mã sản phẩm & dịch vụ"
                className="w-full text-xs bg-adminGray-50 border border-adminGray-300 rounded-[3px] py-2.5 pl-9 pr-4 text-adminInk focus:outline-none focus:border-adminGreen-600 focus:ring-1 focus:ring-adminGreen-600 transition shadow-inner"
              />
            </div>

            <div className="flex bg-adminGray-100 p-1 rounded-md border border-adminGray-100/60 shadow-sm">
              <button
                onClick={() => {
                  setActiveTab("services");
                  setActiveCategoryId(null);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none",
                  activeTab === "services"
                    ? "bg-gradient-to-r from-adminGreen-600 to-adminGreen-700 text-white shadow-md transform scale-[1.02]"
                    : "text-adminGray-600 hover:bg-adminGray-100/50 hover:text-adminInk",
                )}
              >
                <Sparkles
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    activeTab === "services" && "animate-pulse",
                  )}
                />
                <span>Dịch vụ</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("products");
                  setActiveCategoryId(null);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none",
                  activeTab === "products"
                    ? "bg-gradient-to-r from-adminGreen-600 to-adminGreen-700 text-white shadow-md transform scale-[1.02]"
                    : "text-adminGray-600 hover:bg-adminGray-100/50 hover:text-adminInk",
                )}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Sản phẩm</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("courses");
                  setActiveCategoryId(null);
                }}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-md transition-all duration-200 flex items-center justify-center gap-1.5 focus:outline-none",
                  activeTab === "courses"
                    ? "bg-gradient-to-r from-adminGreen-600 to-adminGreen-700 text-white shadow-md transform scale-[1.02]"
                    : "text-adminGray-600 hover:bg-adminGray-100/50 hover:text-adminInk",
                )}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Thẻ dịch vụ</span>
              </button>
            </div>

            {renderCategoryChips()}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 p-3 bg-adminGray-50/10">
            {loadingServices || loadingProducts || loadingCourses ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i: number) => (
                  <div
                    key={i}
                    className="bg-white border border-adminGray-100 h-28 rounded-[3px] animate-pulse"
                  />
                ))}
              </div>
            ) : filteredCatalogItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-adminGray-400 py-12">
                <SlidersHorizontal className="w-10 h-10 text-adminGray-300 mb-2" />
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
                          "bg-white border rounded-[3px] p-2 flex items-start gap-2.5 cursor-pointer hover:shadow-sm transition-all duration-150 select-none relative min-h-[72px]",
                          cartQty > 0
                            ? "border-adminGreen-600 ring-1 ring-adminGreen-600/40"
                            : "border-adminGray-100",
                        )}
                      >
                        {cartQty > 0 && (
                          <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-adminGreen-600 text-white flex items-center justify-center text-2xs font-bold shadow-sm z-10">
                            {cartQty}
                          </div>
                        )}

                        <div className="w-12 h-12 rounded-[3px] overflow-hidden bg-adminGray-100 flex items-center justify-center shrink-0 shadow-inner">
                          <FallbackImage
                            kind={itemType === 2 ? "product" : "service"}
                            src={imageUrl}
                            alt={item.name ?? undefined}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="font-bold text-xs text-adminInk uppercase tracking-wide truncate">
                            {item.name}
                          </div>
                          <div className="text-2xs text-adminGray-400 font-medium">
                            {item.code}
                          </div>
                          <div className="text-xs font-bold text-adminInk pt-1">
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

          <div className="bg-white border-t border-adminGray-100 p-2.5 text-2xs text-adminGray-600 font-medium flex items-center justify-end shrink-0">
            <span>Hoa Sen Spa POS © 2026</span>
          </div>
        </div>
      </div>

      {isDiscountModalOpen && (
        <div className="fixed inset-0 bg-adminInk/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-adminGray-100 rounded-[3px] shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-adminGray-50 border-b border-adminGray-100 flex items-center justify-between">
              <span className="font-bold text-xs text-adminInk uppercase tracking-wider">
                Áp dụng giảm giá
              </span>
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="text-adminGray-400 hover:text-adminGray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-2xs font-bold text-adminGray-600 uppercase tracking-wider">
                  Số tiền giảm (VND)
                </label>
                <input
                  type="number"
                  value={tempDiscount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempDiscount(Number(e.target.value))
                  }
                  placeholder="Nhập số tiền..."
                  className="w-full text-sm border border-adminGray-300 rounded-[3px] p-2 text-adminInk focus:outline-none focus:border-adminGreen-600"
                />
              </div>
            </div>

            <div className="p-3 bg-adminGray-50 border-t border-adminGray-100 flex justify-end gap-2">
              <button
                onClick={() => setIsDiscountModalOpen(false)}
                className="px-4 py-2 border border-adminGray-100 rounded-[3px] text-xs font-bold text-adminGray-600 hover:bg-adminGray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setDiscountAmount(tempDiscount);
                  setIsDiscountModalOpen(false);
                  toast.success("Đã áp dụng giảm giá!");
                }}
                className="px-4 py-2 bg-adminGreen-600 text-white rounded-[3px] text-xs font-bold hover:bg-adminGreen-600/90 transition"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-adminInk/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-adminGray-100 rounded-[3px] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-adminGray-50 border-b border-adminGray-100 flex items-center justify-between">
              <span className="font-bold text-xs text-adminInk uppercase tracking-wider">
                Xác nhận thanh toán
              </span>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-adminGray-400 hover:text-adminGray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="p-3 bg-adminGreen-600-light rounded-[3px] border border-adminGreen-600/10">
                <div className="flex justify-between items-center text-xs font-semibold text-adminGray-600">
                  <span>Khách hàng:</span>
                  <span className="font-bold text-adminInk">
                    {activeOrder.customer?.fullName || "Khách vãng lai"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-adminGray-600 mt-1">
                  <span>Tổng tiền hóa đơn:</span>
                  <span className="font-bold text-adminInk">
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                {activeOrder.alreadyPaidAmount > 0 && (
                  <div className="flex justify-between items-center text-xs font-semibold text-adminGray-600 mt-1">
                    <span>Đã thu (cọc):</span>
                    <span className="font-bold text-adminGreen-600">
                      -{activeOrder.alreadyPaidAmount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs font-semibold text-adminGray-600 mt-1">
                  <span>Số tiền cần thanh toán:</span>
                  <span className="font-bold text-adminGreen-600 text-sm">
                    {amountDue.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-2xs font-bold text-adminGray-600 uppercase tracking-wider">
                  Phương thức thanh toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
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
                      method: PAYMENT_METHOD.VNPAY,
                      label: "VNPAY QR",
                      icon: CreditCard,
                    },
                  ].map((item) => (
                    <button
                      key={item.method}
                      onClick={() =>
                        setOrders((prev: POSOrder[]) =>
                          prev.map((o: POSOrder) =>
                            o.id === activeOrderId
                              ? { ...o, paymentMethod: item.method }
                              : o,
                          ),
                        )
                      }
                      className={cn(
                        "flex items-center gap-2 p-2.5 border rounded-[3px] text-xs font-bold transition duration-200",
                        activeOrder.paymentMethod === item.method
                          ? "border-adminGreen-600 bg-adminGreen-600-light/40 text-adminGreen-600"
                          : "border-adminGray-100 bg-white text-adminGray-600 hover:bg-adminGray-50",
                      )}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-adminGray-600 uppercase tracking-wider">
                  Khách thanh toán (VND)
                </label>
                <input
                  type="number"
                  value={tempPaidAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTempPaidAmount(Number(e.target.value))
                  }
                  className="w-full text-sm border border-adminGray-300 rounded-[3px] p-2 font-bold text-adminInk focus:outline-none focus:border-adminGreen-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-bold text-adminGray-600 uppercase tracking-wider">
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={activeOrder.note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    const val = e.target.value;
                    setOrders((prev: POSOrder[]) =>
                      prev.map((o: POSOrder) =>
                        o.id === activeOrderId ? { ...o, note: val } : o,
                      ),
                    );
                  }}
                  placeholder="Ghi chú thêm về dịch vụ, yêu cầu khách hàng..."
                  rows={2}
                  className="w-full text-xs border border-adminGray-300 rounded-[3px] p-2 text-adminInk focus:outline-none focus:border-adminGreen-600 placeholder:text-adminGray-400"
                />
              </div>

              {activeOrder.paymentMethod === PAYMENT_METHOD.CASH &&
                tempPaidAmount > amountDue && (
                  <div className="flex justify-between items-center text-xs font-bold text-adminGray-600 border-t border-dashed border-adminGray-100 pt-3">
                    <span>Tiền thừa trả khách:</span>
                    <span className="text-adminGreen-600 text-sm font-bold">
                      {(tempPaidAmount - amountDue).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                )}
            </div>

            <div className="p-3 bg-adminGray-50 border-t border-adminGray-100 flex justify-end gap-2">
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 border border-adminGray-100 rounded-[3px] text-xs font-bold text-adminGray-600 hover:bg-adminGray-100 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckoutSubmit}
                disabled={createInvoiceMutation.isPending || isPayingInvoice}
                className="px-5 py-2 bg-adminGreen-600 text-white rounded-[3px] text-xs font-bold hover:bg-adminGreen-600/90 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {(createInvoiceMutation.isPending || isPayingInvoice) && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Xác nhận & Thu tiền</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
