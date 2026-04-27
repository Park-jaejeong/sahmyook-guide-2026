import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  User, 
  AlertCircle, 
  Ban, 
  ChevronRight, 
  BriefcaseMedical,
  Stethoscope,
  Activity,
  Menu,
  Save,
  X,
  Edit3
} from 'lucide-react';
import { departments as initialData } from './data';
import { Department, Doctor } from './types';

// --- Components ---

interface SidebarItemProps {
  dept: Department;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  dept, 
  isActive, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-2.5 text-lg font-medium transition-all duration-200 border-l-4
      ${isActive 
        ? 'bg-blue-50 text-blue-800 border-blue-600' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'
      }`}
  >
    <Activity className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
    <div className="flex flex-col items-start">
      <span className="leading-none">{dept.name}</span>
      <span className="text-sm text-gray-400 font-normal mt-1">{dept.code}</span>
    </div>
  </button>
);

interface TagProps {
  children: React.ReactNode;
  color?: 'blue' | 'gray' | 'red';
}

const Tag: React.FC<TagProps> = ({ children, color = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-800 border-blue-100',
    gray: 'bg-gray-100 text-gray-800 border-gray-200',
    red: 'bg-red-50 text-red-800 border-red-100'
  };
  return (
    <span className={`px-4 py-2 rounded-lg text-base font-medium border ${styles[color]} inline-block shadow-sm`}>
      {children}
    </span>
  );
};

interface InfoCardProps {
  title?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}) => (
  <div className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-200 ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        {Icon && <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-md"><Icon size={24} /></div>}
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => (
  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col gap-4 hover:border-blue-300 transition-colors shadow-sm">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
        <User size={28} />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{doctor.name}</p>
        <p className="text-sm text-blue-600 font-medium">{doctor.role}</p>
      </div>
    </div>
    <div className="space-y-2 text-base text-gray-600 mt-1 bg-white p-4 rounded-lg border border-gray-100">
      {doctor.hours && doctor.hours.map((h, i) => (
        <div key={i} className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{h}</span>
        </div>
      ))}
      {doctor.note && (
        <div className="pt-2 mt-2 border-t border-gray-100">
          <p className="text-sm text-red-500 font-medium flex items-center gap-1">
             <AlertCircle size={14} /> {doctor.note}
          </p>
        </div>
      )}
    </div>
  </div>
);

// --- Edit Components ---

const TextAreaField = ({ label, value, onChange, rows = 3 }: { label: string, value: string, onChange: (val: string) => void, rows?: number }) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <textarea
      className="w-full p-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/30 text-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
    />
  </div>
);

const InputField = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="mb-4">
    <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
    <input
      type="text"
      className="w-full p-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/30 text-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  // Initialize state from localStorage if available, otherwise use initialData
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const savedData = localStorage.getItem('hospital_departments_data');
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (e) {
      console.error('Failed to load data from localStorage:', e);
    }
    return initialData;
  });

  const [selectedId, setSelectedId] = useState<string>('fm');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Department | null>(null);

  const selectedIndex = useMemo(() => departments.findIndex(d => d.id === selectedId), [departments, selectedId]);
  const selectedDept = departments[selectedIndex];

  // Sync edit form when selection changes (if not editing)
  useEffect(() => {
    if (!isEditing) {
      setEditForm(JSON.parse(JSON.stringify(selectedDept)));
    }
  }, [selectedDept, isEditing]);

  const filteredDepartments = useMemo(() => 
    departments.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [departments, searchTerm]);

  const handleSave = () => {
    if (editForm && selectedIndex !== -1) {
      const newDepartments = [...departments];
      newDepartments[selectedIndex] = editForm;
      setDepartments(newDepartments);
      
      // Save changes to localStorage
      try {
        localStorage.setItem('hospital_departments_data', JSON.stringify(newDepartments));
      } catch (e) {
        console.error('Failed to save data to localStorage:', e);
        alert('저장에 실패했습니다. 저장 공간을 확인해주세요.');
      }
      
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditForm(JSON.parse(JSON.stringify(selectedDept)));
    setIsEditing(false);
  };

  const updateEditField = (field: keyof Department, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-gray-800">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-96 bg-white border-r border-gray-200 h-full shadow-lg z-10">
        <div className="p-8 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3 text-blue-700 mb-8">
            <div className="p-3 bg-blue-700 rounded-xl shadow-lg">
              <BriefcaseMedical className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">삼육부산병원</span>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="진료과 검색..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white">
          <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-6 mt-2">Department List</div>
          <div className="space-y-1">
            {filteredDepartments.map(dept => (
              <SidebarItem 
                key={dept.id} 
                dept={dept} 
                isActive={selectedId === dept.id} 
                onClick={() => {
                  setSelectedId(dept.id);
                  setIsEditing(false);
                }} 
              />
            ))}
          </div>
        </div>

      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="absolute left-0 top-0 w-[85%] max-w-sm h-full bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
             <div className="mb-8 font-bold text-2xl text-slate-900 border-b pb-4">진료과 선택</div>
             <div className="overflow-y-auto h-full pb-20 space-y-2">
              {filteredDepartments.map(dept => (
                <SidebarItem 
                  key={dept.id} 
                  dept={dept} 
                  isActive={selectedId === dept.id} 
                  onClick={() => {
                    setSelectedId(dept.id);
                    setIsMobileMenuOpen(false);
                  }} 
                />
              ))}
             </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-full relative">
        {/* Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-8 py-5 flex justify-between items-center border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 text-base text-gray-500">
            <button className="lg:hidden mr-2 p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-7 h-7 text-gray-700" />
            </button>
            <span className="font-medium hidden sm:inline">진료과 안내</span>
            <ChevronRight className="w-5 h-5 hidden sm:inline" />
            <span className="font-bold text-2xl text-slate-900">{selectedDept.name}</span>
            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500 ml-2">{selectedDept.code}</span>
          </div>
          <div className="flex items-center gap-4">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-base font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <X size={18} /> 취소
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                  <Save size={18} /> 저장하기
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <Edit3 size={18} /> 정보 수정
              </button>
            )}
          </div>
        </header>

        {isEditing && editForm ? (
          /* --- EDIT MODE --- */
          <div className="p-8 max-w-[1600px] mx-auto space-y-8 pb-32">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="text-blue-600" /> 기본 정보 수정
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="진료과명" value={editForm.name} onChange={v => updateEditField('name', v)} />
                <InputField label="영문명" value={editForm.engName || ''} onChange={v => updateEditField('engName', v)} />
                <InputField label="위치" value={editForm.location} onChange={v => updateEditField('location', v)} />
                <InputField label="연락처" value={editForm.phone} onChange={v => updateEditField('phone', v)} />
                <div className="md:col-span-2">
                  <TextAreaField label="진료과 소개 (요약)" value={editForm.description} onChange={v => updateEditField('description', v)} rows={2} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">진료 과목 (쉼표로 구분)</h2>
                <textarea 
                  className="w-full h-40 p-4 border rounded-xl text-lg bg-slate-50"
                  value={editForm.subjects.join(', ')}
                  onChange={e => updateEditField('subjects', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                />
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-red-600">진료 불가 항목 (줄바꿈으로 구분)</h2>
                <textarea 
                  className="w-full h-40 p-4 border rounded-xl text-lg bg-red-50"
                  value={editForm.impossible.join('\n')}
                  onChange={e => updateEditField('impossible', e.target.value.split('\n'))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-amber-600">필수 안내 사항 (줄바꿈으로 구분)</h2>
                <textarea 
                  className="w-full h-48 p-4 border border-amber-200 rounded-xl text-lg bg-amber-50/30"
                  value={editForm.requirements.join('\n')}
                  onChange={e => updateEditField('requirements', e.target.value.split('\n'))}
                />
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 text-blue-600">주요 검사 항목 (줄바꿈으로 구분)</h2>
                <textarea 
                  className="w-full h-48 p-4 border border-blue-200 rounded-xl text-lg bg-blue-50/30"
                  value={(editForm.tests || []).join('\n')}
                  onChange={e => updateEditField('tests', e.target.value.split('\n'))}
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">접수/진료 시간 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="초진 접수 마감" value={editForm.registration.firstVisit} onChange={v => updateEditField('registration', {...editForm.registration, firstVisit: v})} />
                <InputField label="재진 접수 마감" value={editForm.registration.reVisit} onChange={v => updateEditField('registration', {...editForm.registration, reVisit: v})} />
                <InputField label="정기 휴진 정보" value={editForm.breakInfo} onChange={v => updateEditField('breakInfo', v)} />
                <InputField label="접수처 노트" value={editForm.registration.note || ''} onChange={v => updateEditField('registration', {...editForm.registration, note: v})} />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-sm text-gray-700 mb-2">기본 진료 시간 (줄바꿈으로 구분)</h3>
                <textarea 
                  className="w-full p-4 border rounded-xl text-lg bg-slate-50"
                  value={editForm.hours.join('\n')}
                  onChange={e => updateEditField('hours', e.target.value.split('\n'))}
                  rows={3}
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-2">의료진 정보 (JSON 편집)</h2>
              <p className="text-sm text-gray-500 mb-4">의료진 정보는 데이터 구조 유지를 위해 JSON 형식으로 편집합니다.</p>
              <textarea 
                className="w-full h-64 p-4 border border-gray-300 rounded-xl font-mono text-sm bg-slate-800 text-green-400"
                value={JSON.stringify(editForm.doctors, null, 2)}
                onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateEditField('doctors', parsed);
                  } catch (err) {
                    // Allow typing invalid json while editing
                  }
                }}
              />
            </div>
          </div>
        ) : (
          /* --- VIEW MODE --- */
          <div className="p-6 md:p-10 w-full max-w-full mx-auto space-y-8 pb-32">
            
            {/* Hero Card */}
            <div className="bg-white rounded-[2rem] p-10 shadow-lg border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl pointer-events-none"></div>
              
              <div className="flex flex-col xl:flex-row justify-between gap-10 relative z-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 text-sm font-extrabold rounded-full mb-4 shadow-sm">
                       <Activity size={16} /> 진료과 코드: {selectedDept.code}
                    </span>
                    <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">{selectedDept.name}</h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
                      {selectedDept.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 min-w-[320px]">
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-blue-200 shadow-lg">
                      <MapPin size={28} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">진료 위치</p>
                      <p className="text-2xl font-bold text-slate-900">{selectedDept.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                    <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-emerald-200 shadow-lg">
                      <Phone size={28} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">연락처</p>
                      <p className="text-2xl font-bold text-slate-900">{selectedDept.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Main Content Column */}
              <div className="xl:col-span-8 space-y-8">
                
                {/* Subjects */}
                <InfoCard title="진료 과목 및 주요 질환" icon={BriefcaseMedical}>
                  <div className="flex flex-wrap gap-3">
                    {selectedDept.subjects.map((subject, idx) => (
                      <Tag key={idx} color="gray">{subject}</Tag>
                    ))}
                  </div>
                </InfoCard>

                {/* Doctors */}
                <InfoCard title="의료진 소개" icon={User}>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedDept.doctors.map((doctor, idx) => (
                      <DoctorCard key={idx} doctor={doctor} />
                    ))}
                   </div>
                </InfoCard>

                 {/* Hours Detail */}
                 <InfoCard title="기본 진료 시간 안내" icon={Calendar}>
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div>
                            <span className="text-lg font-bold text-slate-900 block mb-3 border-b border-slate-200 pb-2">운영 시간</span>
                            <div className="space-y-2">
                              {selectedDept.hours.map((h, i) => (
                                <div key={i} className="text-lg text-slate-700 flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                                  {h}
                                </div>
                              ))}
                            </div>
                         </div>
                         <div>
                            <span className="text-lg font-bold text-red-600 block mb-3 border-b border-slate-200 pb-2">정기 휴진</span>
                            <div className="text-lg text-slate-700 font-medium bg-white p-4 rounded-lg border border-slate-200 inline-block">
                              {selectedDept.breakInfo}
                            </div>
                         </div>
                      </div>
                    </div>
                 </InfoCard>

                 {/* Requirements */}
                 {selectedDept.requirements.length > 0 && (
                  <InfoCard title="필수 안내 사항" icon={AlertCircle} className="bg-amber-50/30 border-amber-100">
                    <ul className="grid grid-cols-1 gap-3">
                      {selectedDept.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-100 shadow-sm text-lg text-slate-800">
                           <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                           {req}
                        </li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
              </div>

              {/* Side Info Column */}
              <div className="xl:col-span-4 space-y-8">
                
                {/* Registration Deadline */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-8 border border-orange-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -mr-10 -mt-10 opacity-20 blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 text-orange-800 relative z-10">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                      <Clock size={28} />
                    </div>
                    <h3 className="font-extrabold text-2xl">접수 마감</h3>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                      <p className="text-sm font-bold text-orange-600 mb-2 uppercase tracking-wide">초진 (첫 방문)</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{selectedDept.registration.firstVisit}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100/50">
                      <p className="text-sm font-bold text-blue-600 mb-2 uppercase tracking-wide">재진</p>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{selectedDept.registration.reVisit}</p>
                      {selectedDept.registration.note && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-100">
                          <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                            <AlertCircle size={14} /> {selectedDept.registration.note}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-orange-700 mt-6 font-medium text-center bg-orange-100/50 py-2 rounded-lg">
                    * 대기 상황에 따라 조기 마감될 수 있습니다.
                  </p>
                </div>

                {/* Excluded Items */}
                {selectedDept.impossible.length > 0 && (
                  <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 text-red-600">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <Ban size={28} />
                      </div>
                      <h3 className="font-extrabold text-2xl">진료 불가 항목</h3>
                    </div>
                    <ul className="space-y-3">
                      {selectedDept.impossible.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-lg text-slate-700 bg-red-50/50 p-3 rounded-xl border border-red-50">
                          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tests (Optional) */}
                 {selectedDept.tests && selectedDept.tests.length > 0 && (
                  <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                    <div className="flex items-center gap-3 mb-6 text-slate-700">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                        <Stethoscope size={24} />
                      </div>
                      <h3 className="font-extrabold text-xl">주요 검사</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {selectedDept.tests.map((test, idx) => (
                         <span key={idx} className="bg-white text-slate-700 text-base font-medium px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                           {test}
                         </span>
                       ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;