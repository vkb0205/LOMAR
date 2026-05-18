import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  CheckCircle2, Circle, Gift, HeartPulse, Ticket, ArrowRight, Lock, Heart, Sparkles,
  Activity, Camera, Layers, MapPin, ChevronDown, ChevronUp, Trophy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';

const MOCK_USER_ID = 'U01';

interface Task {
  id: string; // user_journey_tasks.id
  taskId: string;
  name: string;
  isMandatory: boolean;
  status: string;
}

interface Voucher {
  id: string; // user_vouchers.id
  title: string;
  discountValue: string;
  status: string;
  requiredTaskId: string | null;
}

export default function Dashboard() {
  const { healthCheckCompleted, setHealthCheckCompleted } = useAppContext();
  const [searchParams] = useSearchParams();
  const stationParam = searchParams.get('station');
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStationId, setActiveStationId] = useState<string>('T01');

  useEffect(() => {
    if (stationParam && ['T01', 'T02', 'T03', 'T04'].includes(stationParam)) {
      setActiveStationId(stationParam);
    }
  }, [stationParam]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch ALL tasks from task_dictionary
        const { data: dictData } = await supabase
          .from('task_dictionary')
          .select('*');

        // Fetch user tasks progress
        const { data: userTasksData } = await supabase
          .from('user_journey_tasks')
          .select('*')
          .eq('user_id', MOCK_USER_ID);

        let mergedTasks: Task[] = [];

        if (dictData && dictData.length > 0) {
          mergedTasks = (dictData as any[]).map(dict => {
            const progress = (userTasksData as any[])?.find(ut => ut.task_id === dict.id);
            return {
              id: progress ? progress.id.toString() : `mock-${dict.id}`,
              taskId: dict.id,
              name: dict.name || 'Nhiệm vụ',
              isMandatory: dict.is_mandatory || false,
              status: progress?.status?.toLowerCase() || 'pending'
            };
          });
          
          // Sync with context if health check task exists
          const healthTask = mergedTasks.find(t => t.taskId === 'T01' || t.name.toLowerCase().includes('sức khỏe'));
          if (healthTask) {
            setHealthCheckCompleted(healthTask.status === 'completed');
          }
        }
        setTasks(mergedTasks);

        // Fetch ALL vouchers from dictionary
        const { data: allVouchersData } = await supabase
          .from('vouchers')
          .select('*');

        // Fetch user vouchers
        const { data: userVouchersData } = await supabase
          .from('user_vouchers')
          .select('*')
          .eq('user_id', MOCK_USER_ID);

        let mergedVouchers: Voucher[] = [];

        if (allVouchersData && allVouchersData.length > 0) {
          mergedVouchers = (allVouchersData as any[]).map(vDict => {
            const userV = (userVouchersData as any[])?.find(uv => uv.voucher_id === vDict.id);
            return {
              id: userV ? userV.id.toString() : `mock-${vDict.id}`,
              title: vDict.title || 'Voucher',
              discountValue: vDict.discount_value || '',
              status: userV ? userV.status?.toLowerCase() : 'locked',
              requiredTaskId: vDict.required_task_id || null
            };
          });
        }
        setVouchers(mergedVouchers);

        // Fetch saved designs from view v_dashboard_saved_designs
        const { data: savedDesignsData } = await supabase
          .from('v_dashboard_saved_designs')
          .select('*')
          .eq('user_id', MOCK_USER_ID);

        if (savedDesignsData) {
          setSavedDesigns(savedDesignsData);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const toggleTaskStatus = async (task: Task) => {
    const isCompleted = task.status === 'completed';
    const newStatus = isCompleted ? 'pending' : 'completed';
    const dbStatus = newStatus === 'completed' ? 'Completed' : 'Pending';
    
    // Update local state immediately for fast UI response
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    
    // Sync context if it's the health check task
    if (task.taskId === 'T01' || task.name.toLowerCase().includes('sức khỏe')) {
      setHealthCheckCompleted(newStatus === 'completed');
    }

    try {
      let taskDbId = task.id;
      if (task.id.startsWith('mock-')) {
        // Insert new task progress row
        const { data, error } = await (supabase
          .from('user_journey_tasks') as any)
          .insert({
            user_id: MOCK_USER_ID,
            task_id: task.taskId,
            status: dbStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null
          })
          .select('id')
          .single();

        if (error) throw error;
        if (data) {
          taskDbId = data.id.toString();
          // Update the task ID locally
          setTasks(prev => prev.map(t => t.taskId === task.taskId ? { ...t, id: taskDbId } : t));
        }
      } else {
        // Update existing row
        const { error } = await (supabase
          .from('user_journey_tasks') as any)
          .update({
            status: dbStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null
          })
          .eq('id', parseInt(task.id));

        if (error) throw error;
      }
        
      // Update vouchers that depend on this task
      const dependentVouchers = vouchers.filter(v => v.requiredTaskId === task.taskId);
      for (const voucher of dependentVouchers) {
        const newVoucherStatus = newStatus === 'completed' ? 'unlocked' : 'locked';
        const dbVoucherStatus = newVoucherStatus === 'completed' ? 'Unlocked' : 'Locked';

        if (voucher.id.startsWith('mock-')) {
          const { data: newV, error: errV } = await (supabase
            .from('user_vouchers') as any)
            .insert({
              user_id: MOCK_USER_ID,
              voucher_id: voucher.id.replace('mock-', ''),
              status: dbVoucherStatus,
              unlocked_at: newStatus === 'completed' ? new Date().toISOString() : null
            })
            .select('id')
            .single();

          if (newV) {
            setVouchers(prev => prev.map(v => v.id === voucher.id ? {
              ...v,
              id: newV.id.toString(),
              status: newVoucherStatus
            } : v));
          }
        } else {
          await (supabase
            .from('user_vouchers') as any)
            .update({
              status: dbVoucherStatus,
              unlocked_at: newStatus === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', parseInt(voucher.id));

          setVouchers(prev => prev.map(v => v.id === voucher.id ? { ...v, status: newVoucherStatus } : v));
        }
      }

      // Confetti celebration on completion!
      if (newStatus === 'completed') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F494A2', '#FFF5F5', '#1D3557', '#FCEADE']
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái nhiệm vụ:', error);
    }
  };

  // Logic & calculations
  const totalTasksCount = tasks.length || 4;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercentage = Math.round((completedTasksCount / totalTasksCount) * 100) || 0;

  const getProgressGreeting = () => {
    if (progressPercentage === 0) {
      return {
        title: "Chào bạn! Hãy bắt đầu hành trình nhé! 🗺️",
        desc: "Phố Hạnh Phúc đồng hành cùng bạn trên từng chặng đường chuẩn bị cho đám cưới trong mơ!"
      };
    }
    if (progressPercentage < 50) {
      return {
        title: "Khởi đầu tuyệt vời! 🚀",
        desc: "Bạn đã hoàn thành những bước đầu tiên. Bé Song Hỷ sẽ tiếp tục trợ giúp bạn!"
      };
    }
    if (progressPercentage < 100) {
      return {
        title: "Đang tiến rất gần đích rồi! 💪",
        desc: "Chỉ còn một vài công việc nữa thôi là ngày trọng đại của bạn sẽ hoàn toàn sẵn sàng!"
      };
    }
    return {
      title: "Tất cả đã sẵn sàng! 🎉 Chúc mừng bạn!",
      desc: "Hành trình chuẩn bị đã hoàn tất 100%. Chúc bạn và người thương một đám cưới viên mãn!"
    };
  };

  const greeting = getProgressGreeting();

  const stations = [
    {
      id: 'T01',
      name: 'Ga Sức Khỏe',
      category: 'Khám Sức Khỏe',
      description: 'Chăm sóc sức khỏe tiền hôn nhân là viên gạch đầu tiên xây dựng tổ ấm vững bền.',
      icon: Activity,
      color: 'text-emerald-500',
      bgGradient: 'from-emerald-50 to-teal-50/30',
      badgeBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      ctaText: 'Xem Gói Dịch Vụ',
      ctaLink: '/services'
    },
    {
      id: 'T02',
      name: 'Ga Tình Yêu',
      category: 'Studio',
      description: 'Lưu giữ những thước phim, khung hình kỷ niệm ngọt ngào trước thềm lễ cưới.',
      icon: Camera,
      color: 'text-rose-500',
      bgGradient: 'from-rose-50 to-pink-50/30',
      badgeBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      ctaText: 'Bắt Đầu Thiết Kế',
      ctaLink: '/customize?tab=Studio'
    },
    {
      id: 'T03',
      name: 'Ga Sắc Đẹp',
      category: 'Váy Cưới / Vest',
      description: 'Khoác lên mình bộ trang phục may đo độc bản, lộng lẫy và hoàn hảo nhất.',
      icon: Layers,
      color: 'text-purple-500',
      bgGradient: 'from-purple-50 to-indigo-50/30',
      badgeBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      ctaText: 'Tự Tay Thiết Kế',
      ctaLink: '/customize?tab=Váy Cưới'
    },
    {
      id: 'T04',
      name: 'Ga Hạnh Phúc',
      category: 'Venue',
      description: 'Tìm kiếm không gian sảnh tiệc ấm cúng, sang trọng cho ngày trọng đại nhất.',
      icon: MapPin,
      color: 'text-amber-500',
      bgGradient: 'from-amber-50 to-orange-50/30',
      badgeBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      ctaText: 'Thiết Kế Sảnh Tiệc',
      ctaLink: '/customize?tab=Venue'
    }
  ];

  const activeStation = stations.find(s => s.id === activeStationId) || stations[0];

  const getStationDesigns = (stationId: string) => {
    if (stationId === 'T03') {
      return savedDesigns.filter(d => d.category === 'Váy Cưới' || d.category === 'Vest');
    }
    if (stationId === 'T02') {
      return savedDesigns.filter(d => d.category === 'Studio');
    }
    if (stationId === 'T04') {
      return savedDesigns.filter(d => d.category === 'Venue');
    }
    return [];
  };

  return (
    <div className="w-full flex-1 p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 bg-[#FFFDFD]">
      
      {/* Dynamic Header Greeting & Interactive Progress Panel */}
      <div className="mb-8 bg-white rounded-3xl border border-rose-100/50 p-6 md:p-8 shadow-sm flex flex-col gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCEADE]/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#F494A2]/5 rounded-full blur-3xl"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-[10px] font-bold text-[#F494A2] bg-rose-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-2.5 inline-block">
              Tiến Trình Hành Trình
            </span>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1D3557] mb-1 font-serif">
              {greeting.title}
            </h1>
            <p className="text-xs text-[#1D3557]/70">
              {greeting.desc}
            </p>
          </div>
          <span className="text-xs text-gray-500 font-bold flex items-center gap-1 shrink-0 bg-rose-50/50 px-3 py-1.5 rounded-full border border-rose-100/50">
            <Trophy className="w-3.5 h-3.5 text-[#F494A2] fill-rose-50" />
            {completedTasksCount}/{totalTasksCount} Nhiệm vụ
          </span>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full relative z-10 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#1D3557]">
            <span>Tiến độ chuẩn bị của bạn</span>
            <span className="text-[#F494A2]">{progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-rose-100/20">
            <div 
              className="h-full bg-gradient-to-r from-[#F494A2] to-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Interactive Station Tabs & Content */}
        <div className="w-full lg:w-[68%] flex flex-col gap-6">
          
          {/* Station Tabs Bar hovering above content */}
          <div className="flex bg-white rounded-2xl shadow-sm p-1.5 border border-rose-100/50 overflow-x-auto no-scrollbar gap-1.5">
            {stations.map((station) => {
              const task = tasks.find(t => t.taskId === station.id);
              const isCompleted = task?.status === 'completed';
              const isActive = activeStationId === station.id;
              const Icon = station.icon;

              return (
                <button
                  key={station.id}
                  onClick={() => setActiveStationId(station.id)}
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-serif font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap border ${
                    isActive 
                      ? 'bg-[#F494A2] text-white shadow-md border-[#F494A2]' 
                      : 'bg-white hover:bg-rose-50/30 text-[#1D3557] border-transparent hover:border-rose-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : station.color}`} />
                  <span>{station.name}</span>
                  {isCompleted && (
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-500 fill-white'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Station Content Panel */}
          {activeStation && (() => {
            const station = activeStation;
            const task = tasks.find(t => t.taskId === station.id);
            const isCompleted = task?.status === 'completed';
            const Icon = station.icon;
            const stationDesigns = getStationDesigns(station.id);

            return (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCEADE]/10 rounded-full blur-2xl"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-rose-50/50 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${station.bgGradient} border border-rose-50 shadow-sm ${station.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider ${station.badgeBg} px-2.5 py-0.5 rounded-full`}>
                        {station.category}
                      </span>
                      <h2 className="text-xl font-bold text-[#1D3557] font-serif mt-1">
                        {station.name}
                      </h2>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-center self-start md:self-auto ${
                    isCompleted ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-[#F494A2] border border-rose-100/30'
                  }`}>
                    {isCompleted ? 'Trạng thái: Đã hoàn thành' : 'Trạng thái: Đang chờ'}
                  </span>
                </div>

                <div className="space-y-6">
                  <p className="text-xs text-[#1D3557]/70 leading-relaxed font-medium">
                    {station.description}
                  </p>

                  {/* Task Card with Big Checkbox */}
                  <div className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                    isCompleted 
                      ? 'bg-emerald-50/30 border-emerald-100/50' 
                      : 'bg-rose-50/10 border-rose-100/30'
                  }`}>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => task && toggleTaskStatus(task)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-sm active:scale-95 ${
                          isCompleted 
                            ? 'border-emerald-500 bg-emerald-500 text-white' 
                            : 'border-rose-300 hover:border-[#F494A2] bg-white'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-5 h-5 text-white" />}
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-emerald-800' : 'text-[#1D3557]'}`}>
                          {task?.name || 'Nhiệm vụ'}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {task?.isMandatory ? 'Yêu cầu Bắt buộc • Hoàn thành để nhận ưu đãi' : 'Tùy chọn'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Station Saved Designs Section */}
                  {station.id !== 'T01' && (
                    <div className="space-y-4 pt-2">
                      <h4 className="text-xs font-bold uppercase text-[#1D3557] tracking-wider flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#F494A2] fill-rose-100" />
                        Bản vẽ custom đã lưu tại {station.name}
                      </h4>

                      {stationDesigns.length === 0 ? (
                        <div className="border border-dashed border-rose-100 rounded-2xl p-8 text-center bg-rose-50/10">
                          <Sparkles className="w-6 h-6 mx-auto text-[#F494A2]/70 mb-3 animate-pulse" />
                          <p className="text-xs text-gray-500 font-medium mb-4">Chưa có thiết kế độc bản nào tại ga này</p>
                          <a
                            href={station.ctaLink}
                            className="inline-flex items-center px-5 py-2.5 bg-[#F494A2] text-white text-[10px] font-bold rounded-full uppercase tracking-wider hover:bg-rose-400 shadow-md transition-all active:scale-95"
                          >
                            {station.ctaText}
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </a>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {stationDesigns.map((design: any) => (
                            <div 
                              key={design.design_id} 
                              className="bg-white rounded-2xl border border-rose-50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-[9px] font-extrabold uppercase bg-rose-50 text-[#F494A2] px-2.5 py-1 rounded-full tracking-wider">
                                  {design.category}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {new Date(design.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                              <h5 className="font-serif font-bold text-sm text-[#1D3557] mb-2 leading-tight">
                                Bản vẽ {design.category}
                              </h5>
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                {design.selections?.slice(0, 4).map((sel: any, idx: number) => (
                                  <span key={idx} className="text-[9px] bg-rose-50/50 text-[#1D3557]/80 px-2 py-0.5 rounded border border-rose-100/50">
                                    {sel.option_name}: <strong className="text-[#1D3557]">{sel.value_name}</strong>
                                  </span>
                                ))}
                              </div>
                              <div className="pt-3 border-t border-rose-50 flex items-center justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Chi phí dự toán</span>
                                  <span className="text-xs font-extrabold text-[#F494A2]">
                                    {Number(design.total_price || 0).toLocaleString('vi-VN')} VND
                                  </span>
                                </div>
                                <div className="w-7 h-7 rounded-full border border-rose-100 flex items-center justify-center text-[#F494A2] group-hover:scale-105 transition-transform bg-rose-50/20">
                                  <Heart className="w-3.5 h-3.5 fill-current" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right Column: Voucher Wallet */}
        <div className="w-full lg:w-[32%] shrink-0">
          <div className="bg-gray-900 rounded-3xl shadow-xl p-6 md:p-8 text-white h-full relative overflow-hidden min-h-[500px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
            
            <h2 className="text-xl font-bold mb-6 flex items-center relative z-10 font-serif">
              <Gift className="w-6 h-6 mr-2 text-rose-400" />
              Ví Ưu Đãi Của Bạn
            </h2>

            <div className="space-y-4 relative z-10 w-full overflow-hidden">
              {loading && (
                <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400"></div>
                </div>
              )}
              
              <AnimatePresence mode="popLayout">
                {vouchers.map(voucher => {
                  const isUnlocked = voucher.status === 'unlocked' || voucher.status === 'redeemed';
                  
                  if (voucher.requiredTaskId && !isUnlocked) {
                    return (
                      <motion.div
                        key={voucher.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-800/50 backdrop-blur border border-gray-700/50 p-5 rounded-2xl w-full flex items-center text-gray-400 shadow-inner animate-in fade-in duration-300"
                      >
                        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border border-gray-700/30">
                          <Lock className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-300 text-sm leading-tight">Voucher Bí Mật</h3>
                          <p className="text-[10px] mt-1 text-gray-500 font-medium">
                            Hoàn thành "{tasks.find(t => t.taskId === voucher.requiredTaskId)?.name || 'nhiệm vụ'}" để mở khóa
                          </p>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={voucher.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      layout
                      className={voucher.requiredTaskId ? "bg-gradient-to-r from-rose-500 to-orange-500 p-[1.5px] rounded-2xl w-full shadow-lg" : "bg-gray-800 border border-gray-700 p-5 rounded-2xl flex items-center transition-all hover:bg-gray-700 w-full shadow-md"}
                    >
                      {voucher.requiredTaskId ? (
                        <div className="bg-white rounded-[14px] p-5 text-gray-900 flex items-center relative overflow-hidden w-full">
                          <div className="absolute -left-3 -top-3 w-16 h-16 bg-rose-100 rounded-full blur-xl opacity-50"></div>
                          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0 relative z-10">
                            <Ticket className="w-6 h-6 text-rose-600" />
                          </div>
                          <div className="flex-1 relative z-10 pr-2">
                            <span className="text-[9px] font-extrabold text-rose-600 uppercase tracking-widest mb-1 block">Đã Mở Khóa</span>
                            <h3 className="font-bold text-sm leading-tight text-[#1D3557] font-serif">{voucher.title}</h3>
                            <p className="text-[10px] text-gray-500 mt-1 font-medium">Áp dụng cho tất cả dịch vụ tương ứng trên phố</p>
                          </div>
                          <button className="ml-2 w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center transition-transform hover:scale-105 hover:bg-rose-500 flex-shrink-0 relative z-10 shadow-md active:scale-95">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <Ticket className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-sm leading-tight">{voucher.title}</h3>
                            <p className="text-[10px] text-gray-400 mt-1 font-medium">{voucher.discountValue}</p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
