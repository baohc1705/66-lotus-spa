import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  Calendar,
  ShoppingBag,
  CreditCard,
  Award,
  Heart,
  BellRing,
  Notebook,
  Image,
  Phone,
  ChevronRight,
} from "lucide-react";

interface CustomerCrmActivityProps {
  customerId: number | null;
}

export function CustomerCrmActivity({ customerId }: CustomerCrmActivityProps) {
  const [activeTab, setActiveTab] = useState("history");

  if (!customerId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border border-adminGray-100 rounded shadow-sm p-6 text-center text-adminGray-400">
        <BellRing className="w-12 h-12 text-adminGray-300 mb-2 stroke-[1.5]" />
        <p className="text-sm font-medium">
          Chọn một khách hàng để xem lịch sử CRM
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border border-adminGray-100 rounded overflow-hidden shadow-sm">
      {/* Tabs list */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="w-full justify-start rounded-none border-b border-adminGray-100 bg-transparent p-0 h-9 shrink-0">
          <TabsTrigger
            value="history"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-adminGray-600 hover:text-adminInk data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:shadow-none"
          >
            Lịch sử giao dịch
          </TabsTrigger>
          <TabsTrigger
            value="photos"
            className="flex-1 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-2 text-xs font-semibold text-adminGray-600 hover:text-adminInk data-[state=active]:border-adminGreen-600 data-[state=active]:text-adminGreen-600 data-[state=active]:shadow-none"
          >
            Ảnh Khách Hàng
          </TabsTrigger>
        </TabsList>

        {/* Tab contents */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          <TabsContent
            value="history"
            className="m-0 border-0 outline-none space-y-3.5"
          >
            {/* 1. Lịch hẹn sắp tới */}
            <SectionCard
              title="Lịch hẹn sắp tới"
              icon={Calendar}
              iconColor="text-state-info-text"
            >
              <div className="border border-adminGray-100 rounded p-2.5 bg-state-info-bg/20 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-adminInk">
                      07/07/2026 - 08:00
                    </span>
                    <p className="text-xs text-adminGray-600 mt-0.5">
                      @ HoaSenSpa
                    </p>
                  </div>
                  <span className="text-2xs font-semibold bg-state-success-bg text-state-success-text border border-state-success-border/50 px-1.5 py-0.5 rounded">
                    Hoàn thành
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-adminGray-100">
                  <button className="text-xs text-state-info-text hover:underline flex items-center gap-1 font-semibold">
                    <Phone className="w-3 h-3" /> Gọi điện
                  </button>
                  <button className="text-2xs text-adminGray-400 hover:text-adminGray-600 hover:underline font-medium">
                    * Xem lịch hẹn cũ 6 tháng gần đây
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* 2. Đơn hàng đã thực hiện */}
            <SectionCard
              title="Đơn hàng đã thực hiện"
              icon={ShoppingBag}
              iconColor="text-adminGold-600"
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Chưa có đơn hàng nào được thực hiện
              </div>
            </SectionCard>

            {/* 3. Các lần trả tiền */}
            <SectionCard
              title="Các lần trả tiền"
              icon={CreditCard}
              iconColor="text-adminGold-600"
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Chưa có lịch sử thanh toán
              </div>
            </SectionCard>

            {/* 4. Thẻ dịch vụ của khách */}
            <SectionCard
              title="Thẻ dịch vụ của khách"
              icon={Award}
              iconColor="text-adminGold-600"
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Chưa sở hữu thẻ dịch vụ
              </div>
            </SectionCard>

            {/* 5. Dịch vụ & Sản phẩm yêu thích */}
            <SectionCard
              title="Dịch vụ & Sản phẩm yêu thích"
              icon={Heart}
              iconColor="text-state-danger-text"
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Chưa có sản phẩm hoặc dịch vụ yêu thích
              </div>
            </SectionCard>

            {/* 6. Nhắc nhở chưa thực hiện */}
            <SectionCard
              title="Nhắc nhở chưa thực hiện"
              icon={BellRing}
              iconColor="text-state-warning-solid"
              action={
                <button className="text-xs text-adminGreen-600 hover:underline font-semibold flex items-center">
                  Xem toàn bộ <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Không có nhắc nhở chưa thực hiện
              </div>
            </SectionCard>

            {/* 7. Hồ sơ ghi chú */}
            <SectionCard
              title="Hồ sơ ghi chú"
              icon={Notebook}
              iconColor="text-rose-500"
              action={
                <button className="text-xs text-adminGreen-600 hover:underline font-semibold flex items-center">
                  Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
                </button>
              }
            >
              <div className="text-center py-3 text-adminGray-400 text-xs italic">
                Chưa có tài liệu ghi chú
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent
            value="photos"
            className="m-0 border-0 outline-none text-center py-12 text-adminGray-400 text-xs"
          >
            <Image className="w-12 h-12 text-adminGray-300 mx-auto mb-2 stroke-[1.5]" />
            <p className="font-medium text-adminGray-600 mb-1">
              Chưa có hình ảnh nào của khách hàng
            </p>
            <p className="text-xs">
              Tải lên hình ảnh trước/sau điều trị, ảnh thẻ của khách hàng tại
              đây.
            </p>
            <button className="mt-4 text-xs bg-adminGray-100 hover:bg-adminGray-100 border border-adminGray-300/80 text-adminInk font-bold px-3 py-1.5 rounded transition-colors">
              Tải ảnh lên
            </button>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  children,
  action,
}: SectionCardProps) {
  return (
    <div className="border-b border-adminGray-100 pb-3 last:border-b-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <span className="text-xs font-bold text-adminInk">{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
