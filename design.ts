// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   ChevronLeft, 
//   Plus, 
//   Trash2, 
//   Check, 
//   X,
//   Camera,
//   Info,
//   ChevronDown,
//   PlusCircle,
//   Sun,
//   Moon,
//   Search,
//   Package,
//   ShoppingCart,
//   User,
//   LayoutGrid,
//   Store,
//   Users,
//   LogOut,
//   ChevronRight,
//   ShieldCheck,
//   Bell,
//   Settings,
//   Mail,
//   Lock,
//   ArrowRight
// } from 'lucide-react';

// export default function App() {
//   // Global Auth State
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
  
//   // Navigation: 'inventory' | 'orders' | 'profile'
//   const [activeTab, setActiveTab] = useState('inventory');
//   // Sub-navigation for Inventory: 'list' | 'create-product'
//   const [inventoryView, setInventoryView] = useState('list'); 
  
//   const [darkMode, setDarkMode] = useState(true);
//   const profileInputRef = useRef(null);
//   const [searchQuery, setSearchQuery] = useState('');

//   // --- USER PROFILE STATE ---
//   const [userProfile, setUserProfile] = useState({
//     name: 'Haris Khan',
//     email: 'haris@store.com',
//     photo: null,
//     role: 'Admin'
//   });

//   // --- PRODUCTS LIST STATE ---
//   const [productsList, setProductsList] = useState([
//     { id: 1, name: 'Meezan Oil', price: '500 - 1200', stock: 45, category: 'Cooking Oil' },
//     { id: 2, name: 'National Salt', price: '40', stock: 120, category: 'Spices' },
//     { id: 3, name: 'Tapal Danedar', price: '250', stock: 12, category: 'Tea' },
//   ]);

//   // --- SWIPE TO DELETE STATE ---
//   const [swipedItemId, setSwipedItemId] = useState(null);
//   const startX = useRef(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragOffset, setDragOffset] = useState(0);

//   // --- THEME CLASSES ---
//   const theme = {
//     bg: darkMode ? 'bg-[#0a0a0a]' : 'bg-[#f8f9fa]',
//     surface: darkMode ? 'bg-[#161616]' : 'bg-white',
//     headerBg: darkMode ? 'bg-[#0a0a0a]/90' : 'bg-white/95',
//     border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
//     divide: darkMode ? 'divide-zinc-800' : 'divide-zinc-200',
//     textPrimary: darkMode ? 'text-zinc-100' : 'text-zinc-900',
//     textSecondary: darkMode ? 'text-zinc-500' : 'text-zinc-400',
//     inputBg: darkMode ? 'bg-[#161616]' : 'bg-white',
//     card: darkMode ? 'bg-[#161616]' : 'bg-white shadow-sm',
//     navBg: darkMode ? 'bg-[#121212]/90' : 'bg-white/90',
//     accent: 'text-emerald-500',
//     accentBg: 'bg-emerald-500'
//   };

//   // --- HANDLERS ---
//   const handleLogin = (e) => {
//     e.preventDefault();
//     setIsLoggedIn(true);
//   };

//   const handleLogout = () => {
//     setIsLoggedIn(false);
//     setActiveTab('inventory');
//     setInventoryView('list');
//   };

//   const deleteProduct = (id) => {
//     setProductsList(productsList.filter(p => p.id !== id));
//     setSwipedItemId(null);
//     setDragOffset(0);
//   };

//   const handleProfilePhoto = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setUserProfile({...userProfile, photo: reader.result});
//       reader.readAsDataURL(file);
//     }
//   };

//   const onStart = (clientX, id) => {
//     if (swipedItemId && swipedItemId !== id) {
//       setSwipedItemId(null);
//       setDragOffset(0);
//     }
//     startX.current = clientX;
//     setIsDragging(true);
//   };

//   const onMove = (clientX, id) => {
//     if (!isDragging) return;
//     const diff = startX.current - clientX;
//     if (diff > 0) setDragOffset(Math.min(diff, 100));
//     else if (swipedItemId === id) setDragOffset(Math.max(80 + diff, 0));
//   };

//   // --- VIEWS ---

//   const LoginScreen = () => (
//     <div className={`fixed inset-0 z-[100] ${theme.bg} flex flex-col px-8 pt-24 pb-12`}>
//       <div className="mb-12">
//         <div className={`w-16 h-16 rounded-[1.5rem] ${theme.accentBg} flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20`}>
//           <Package size={32} className="text-white" />
//         </div>
//         <h1 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h1>
//         <p className={`${theme.textSecondary} text-sm`}>Sign in to manage your inventory and orders seamlessly.</p>
//       </div>

//       <form onSubmit={handleLogin} className="space-y-4">
//         <div className="space-y-2">
//           <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary} ml-1`}>Email Address</label>
//           <div className="relative">
//             <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textSecondary}`} />
//             <input 
//               type="email" 
//               defaultValue="admin@store.com"
//               placeholder="name@company.com"
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all`}
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary} ml-1`}>Password</label>
//           <div className="relative">
//             <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textSecondary}`} />
//             <input 
//               type="password" 
//               defaultValue="password"
//               placeholder="••••••••"
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all`}
//             />
//           </div>
//         </div>

//         <div className="flex justify-end">
//           <button type="button" className={`text-[10px] font-bold ${theme.accent} uppercase tracking-wider`}>Forgot Password?</button>
//         </div>

//         <button 
//           type="submit"
//           className={`w-full h-14 ${theme.accentBg} text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all mt-4`}
//         >
//           Sign In
//           <ArrowRight size={16} />
//         </button>
//       </form>

//       <div className="mt-auto text-center">
//         <p className={`text-xs ${theme.textSecondary}`}>
//           Don't have an account? <span className={`${theme.accent} font-bold cursor-pointer`}>Contact Admin</span>
//         </p>
//       </div>
//     </div>
//   );

//   const ProfileScreen = () => (
//     <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-6">
//       <header className="flex items-center justify-between mb-2">
//         <h1 className="text-xl font-black tracking-tight">Account</h1>
//         <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl ${theme.surface} border ${theme.border}`}>
//           {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
//         </button>
//       </header>

//       <div className={`${theme.card} border ${theme.border} rounded-[2rem] p-6 flex flex-col items-center text-center space-y-4`}>
//         <div className="relative group cursor-pointer" onClick={() => profileInputRef.current.click()}>
//           <div className={`w-24 h-24 rounded-[2rem] overflow-hidden border-4 ${darkMode ? 'border-zinc-800' : 'border-zinc-100'} bg-zinc-800 flex items-center justify-center`}>
//             {userProfile.photo ? (
//               <img src={userProfile.photo} className="w-full h-full object-cover" alt="Profile" />
//             ) : (
//               <User size={40} className="text-zinc-600" />
//             )}
//           </div>
//           <button className={`absolute -bottom-1 -right-1 p-2 ${theme.accentBg} text-white rounded-xl shadow-lg border-2 ${darkMode ? 'border-[#161616]' : 'border-white'}`}>
//             <Camera size={14} />
//           </button>
//           <input type="file" ref={profileInputRef} className="hidden" onChange={handleProfilePhoto} accept="image/*" />
//         </div>
//         <div>
//           <h2 className="text-lg font-bold">{userProfile.name}</h2>
//           <p className={`text-xs ${theme.textSecondary}`}>{userProfile.email} • {userProfile.role}</p>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-1 ${theme.textSecondary}`}>Personal Settings</h3>
//         <div className={`${theme.card} border ${theme.border} rounded-[1.5rem] divide-y ${theme.divide} overflow-hidden`}>
//           <div className="p-4 flex items-center justify-between active:bg-zinc-500/5 transition-colors cursor-pointer">
//             <div className="flex items-center gap-3">
//               <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ${theme.textSecondary}`}><User size={18} /></div>
//               <div className="flex flex-col"><span className="text-sm font-bold">Edit Name</span><span className="text-[10px] opacity-60">Change your display name</span></div>
//             </div>
//             <ChevronRight size={18} className={theme.textSecondary} />
//           </div>
//           <div className="p-4 flex items-center justify-between active:bg-zinc-500/5 transition-colors cursor-pointer">
//             <div className="flex items-center gap-3">
//               <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ${theme.textSecondary}`}><ShieldCheck size={18} /></div>
//               <div className="flex flex-col"><span className="text-sm font-bold">Change Password</span><span className="text-[10px] opacity-60">Secure your account</span></div>
//             </div>
//             <ChevronRight size={18} className={theme.textSecondary} />
//           </div>
//         </div>
//       </div>

//       <div className="space-y-3">
//         <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] px-1 ${theme.textSecondary}`}>Workspace</h3>
//         <div className={`${theme.card} border ${theme.border} rounded-[1.5rem] divide-y ${theme.divide} overflow-hidden`}>
//           <div className="p-4 flex items-center justify-between active:bg-zinc-500/5 transition-colors cursor-pointer">
//             <div className="flex items-center gap-3">
//               <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ${theme.textSecondary}`}><Store size={18} /></div>
//               <div className="flex flex-col"><span className="text-sm font-bold">Manage Stores</span><span className="text-[10px] opacity-60">3 Stores linked</span></div>
//             </div>
//             <ChevronRight size={18} className={theme.textSecondary} />
//           </div>
//           <div className="p-4 flex items-center justify-between active:bg-zinc-500/5 transition-colors cursor-pointer">
//             <div className="flex items-center gap-3">
//               <div className={`p-2 rounded-lg ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} ${theme.textSecondary}`}><Users size={18} /></div>
//               <div className="flex flex-col"><span className="text-sm font-bold">Manage Users</span><span className="text-[10px] opacity-60">Permissions & Roles</span></div>
//             </div>
//             <ChevronRight size={18} className={theme.textSecondary} />
//           </div>
//         </div>
//       </div>

//       <button 
//         onClick={handleLogout}
//         className="w-full p-5 rounded-[1.5rem] border border-red-500/20 bg-red-500/5 text-red-500 flex items-center justify-center gap-2 active:scale-95 transition-all"
//       >
//         <LogOut size={18} />
//         <span className="text-xs font-black uppercase tracking-widest">Logout Session</span>
//       </button>
//     </div>
//   );

//   // --- RENDER LOGIC ---
//   if (!isLoggedIn) {
//     return <LoginScreen />;
//   }

//   let content;
//   if (activeTab === 'orders') {
//     content = (
//       <div className={`flex-1 flex flex-col items-center justify-center p-10 text-center ${theme.bg}`}>
//         <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center mb-4`}>
//           <ShoppingCart size={32} className={theme.textSecondary} />
//         </div>
//         <h2 className="text-xl font-black mb-2">Orders</h2>
//         <p className={`${theme.textSecondary} text-sm`}>This section is currently under construction.</p>
//       </div>
//     );
//   } else if (activeTab === 'profile') {
//     content = <ProfileScreen />;
//   } else {
//     if (inventoryView === 'list') {
//       content = (
//         <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-4" onClick={() => { setSwipedItemId(null); setDragOffset(0); }}>
//           <header className={`sticky top-0 z-20 -mx-6 px-6 pt-4 pb-3 flex items-center justify-between ${theme.headerBg} backdrop-blur-xl border-b ${theme.border} mb-2`}>
//             <div className="p-2 w-10" /> {/* Spacer */}
//             <h1 className="text-base font-bold tracking-tight">Inventory</h1>
//             <button onClick={(e) => { e.stopPropagation(); setInventoryView('create-product'); }} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl active:scale-90 transition-all">
//               <Plus size={22} />
//             </button>
//           </header>

//           <div className="relative group" onClick={(e) => e.stopPropagation()}>
//             <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textSecondary}`}><Search size={18} /></div>
//             <input 
//               type="text" placeholder="Search products..." value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-[1.25rem] pl-11 pr-4 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all`}
//             />
//           </div>

//           <div className="space-y-3">
//             <div className="flex items-center justify-between px-1">
//               <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.textSecondary}`}>My Items</h2>
//               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${darkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>
//                 {productsList.length} Items
//               </span>
//             </div>
//             {productsList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
//               <div 
//                 key={item.id} 
//                 className="relative overflow-hidden rounded-[1.5rem] select-none touch-none"
//                 onMouseDown={(e) => onStart(e.clientX, item.id)}
//                 onMouseMove={(e) => onMove(e.clientX, item.id)}
//                 onMouseUp={() => { if (dragOffset > 50) setSwipedItemId(item.id); setIsDragging(false); if (dragOffset <= 50) setDragOffset(0); }}
//                 onMouseLeave={() => { if (isDragging) { if (dragOffset > 50) setSwipedItemId(item.id); setIsDragging(false); if (dragOffset <= 50) setDragOffset(0); } }}
//                 onTouchStart={(e) => onStart(e.touches[0].clientX, item.id)}
//                 onTouchMove={(e) => onMove(e.touches[0].clientX, item.id)}
//                 onTouchEnd={() => { if (dragOffset > 50) setSwipedItemId(item.id); setIsDragging(false); if (dragOffset <= 50) setDragOffset(0); }}
//               >
//                 <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center pr-6 pl-10" onClick={(e) => { e.stopPropagation(); deleteProduct(item.id); }}>
//                   <div className={`w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 transition-all ${swipedItemId === item.id ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}><Trash2 size={18} /></div>
//                 </div>
//                 <div 
//                   className={`${theme.card} border ${theme.border} rounded-[1.5rem] p-3 flex items-center gap-3 relative z-10 transition-transform duration-300 ease-out pointer-events-none`}
//                   style={{ transform: swipedItemId === item.id ? 'translateX(-80px)' : (isDragging && (startX.current - dragOffset) !== startX.current) ? `translateX(-${dragOffset}px)` : 'translateX(0)' }}
//                 >
//                   <div className={`w-12 h-12 rounded-xl ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'} flex items-center justify-center shrink-0`}><Package size={20} className={theme.textSecondary} /></div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <h3 className="font-bold text-sm flex-1 break-words">{item.name} <span className="font-normal opacity-60 ml-1">({item.category})</span></h3>
//                       <span className={`text-[11px] font-bold ${item.stock < 20 ? 'text-amber-500' : theme.textSecondary}`}>Qty: {item.stock}</span>
//                     </div>
//                     <div className="mt-1"><span className="text-xs font-black text-emerald-500">Rs. {item.price}</span></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     } else if (inventoryView === 'create-product') {
//       content = (
//         <div className="flex-1 overflow-y-auto px-6 pb-40 pt-6 space-y-6">
//           <header className={`sticky top-0 z-10 -mx-6 px-6 pt-4 pb-3 flex items-center justify-between ${theme.headerBg} backdrop-blur-xl border-b ${theme.border} mb-4`}>
//             <button onClick={() => setInventoryView('list')} className={`p-2 -ml-1 ${theme.textSecondary}`}><ChevronLeft size={22} /></button>
//             <h1 className="text-base font-bold tracking-tight">Create Product</h1>
//             <div className="w-10" />
//           </header>
//           <div className="space-y-4">
//              <div className="space-y-2">
//               <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Title *</label>
//               <input type="text" className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm outline-none`} placeholder="Product Name" />
//             </div>
//             <div className="space-y-2">
//               <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Description</label>
//               <textarea rows="2" className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm outline-none resize-none`} placeholder="Brief description..." />
//             </div>
//           </div>
//           <div className="fixed bottom-24 left-6 right-6 z-40">
//             <button onClick={() => setInventoryView('list')} className="w-full h-14 bg-emerald-600 text-white font-black rounded-2xl shadow-2xl uppercase tracking-widest text-xs">Save Product</button>
//           </div>
//         </div>
//       );
//     }
//   }

//   return (
//     <div className={`fixed inset-0 ${theme.bg} ${theme.textPrimary} font-sans flex flex-col transition-colors duration-300 overflow-hidden`}>
//       {content}
//       <nav className={`fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-3 border-t ${theme.border} ${theme.navBg} backdrop-blur-xl flex items-center justify-between`}>
//         <button onClick={() => { setActiveTab('inventory'); setInventoryView('list'); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'inventory' ? theme.accent : theme.textSecondary}`}>
//           <LayoutGrid size={22} strokeWidth={activeTab === 'inventory' ? 2.5 : 2} />
//           <span className="text-[10px] font-bold">Inventory</span>
//         </button>
//         <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'orders' ? theme.accent : theme.textSecondary}`}>
//           <ShoppingCart size={22} strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
//           <span className="text-[10px] font-bold">Orders</span>
//         </button>
//         <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? theme.accent : theme.textSecondary}`}>
//           <User size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
//           <span className="text-[10px] font-bold">Profile</span>
//         </button>
//       </nav>
//     </div>
//   );
// }



// // For products, create, edit, create varients below one is used

// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   ChevronLeft, 
//   Plus, 
//   Trash2, 
//   Check, 
//   X,
//   Camera,
//   Info,
//   ChevronDown,
//   PlusCircle,
//   Sun,
//   Moon
// } from 'lucide-react';

// export default function App() {
//   const [view, setView] = useState('create-product'); // 'create-product' or 'create-variant'
//   const [darkMode, setDarkMode] = useState(true);
//   const [productImage, setProductImage] = useState(null);
//   const fileInputRef = useRef(null);

//   // --- GLOBAL SCHEMA STATE ---
//   const [productName, setProductName] = useState('Meezan Oil');
//   const [description, setDescription] = useState('Meezan cooking oil');
//   const [enableVariants, setEnableVariants] = useState(true);
//   const [selectedUnit, setSelectedUnit] = useState('Weight');
  
//   // Base product pricing/inventory (used when variants are disabled)
//   const [basePrice, setBasePrice] = useState('');
//   const [baseInventory, setBaseInventory] = useState('');
  
//   const [availableOptions, setAvailableOptions] = useState(['KG', 'Liter', 'Size', 'ML', 'Gram', 'Box', 'Packet', 'Bottle', 'Can', 'Dozen']);
  
//   const [variants, setVariants] = useState([
//     { id: '1', title: 'Meezan Oil — Liter', option: 'Liter', inventory: 10, price: 500 },
//   ]);

//   // --- SECOND SCREEN (CREATE VARIANT) STATE ---
//   const [tempVariant, setTempVariant] = useState({
//     title: '',
//     option: 'KG',
//     inventory: '',
//     price: ''
//   });
//   const [newOptionInput, setNewOptionInput] = useState('');
//   const [isAddingNewOption, setIsAddingNewOption] = useState(false);

//   // --- HANDLERS ---
//   const handleImageUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => setProductImage(reader.result);
//       reader.readAsDataURL(file);
//     }
//   };

//   const addNewOption = () => {
//     if (newOptionInput && !availableOptions.includes(newOptionInput)) {
//       setAvailableOptions([...availableOptions, newOptionInput]);
//       setTempVariant({ ...tempVariant, option: newOptionInput });
//       setNewOptionInput('');
//       setIsAddingNewOption(false);
//     }
//   };

//   const deleteOption = (e, optToDelete) => {
//     e.stopPropagation();
//     setAvailableOptions(availableOptions.filter(opt => opt !== optToDelete));
//     if (tempVariant.option === optToDelete) {
//       setTempVariant({ ...tempVariant, option: availableOptions[0] || '' });
//     }
//   };

//   const addVariantToProduct = () => {
//     if (!tempVariant.title) return;
//     setVariants([...variants, { ...tempVariant, id: Date.now().toString() }]);
//     setView('create-product');
//     setTempVariant({ title: '', option: availableOptions[0] || 'KG', inventory: '', price: '' });
//   };

//   // --- THEME CLASSES ---
//   const theme = {
//     bg: darkMode ? 'bg-[#0a0a0a]' : 'bg-[#f8f9fa]',
//     surface: darkMode ? 'bg-[#161616]' : 'bg-white',
//     headerBg: darkMode ? 'bg-[#0a0a0a]/90' : 'bg-white/95',
//     border: darkMode ? 'border-zinc-800' : 'border-zinc-200',
//     headerShadow: darkMode ? 'shadow-[0_4px_10px_rgba(0,0,0,0.4)]' : 'shadow-[0_2px_6px_rgba(0,0,0,0.04)]',
//     textPrimary: darkMode ? 'text-zinc-100' : 'text-zinc-900',
//     textSecondary: darkMode ? 'text-zinc-500' : 'text-zinc-400',
//     inputBg: darkMode ? 'bg-[#161616]' : 'bg-white',
//     card: darkMode ? 'bg-[#161616]' : 'bg-white shadow-sm',
//     pillActive: darkMode ? 'bg-[#222] text-emerald-400' : 'bg-emerald-50 text-emerald-600',
//     pillInactive: darkMode ? 'text-zinc-500' : 'text-zinc-400'
//   };

//   // --- RENDER CREATE VARIANT VIEW ---
//   if (view === 'create-variant') {
//     return (
//       <div className={`fixed inset-0 ${theme.bg} ${theme.textPrimary} font-sans flex flex-col transition-colors duration-300`}>
//         {/* Centered Header (Ultra-Compact Height) */}
//         <header className={`sticky top-0 z-10 px-4 pt-4 pb-3 flex items-center justify-between ${theme.headerBg} backdrop-blur-xl ${theme.headerShadow} border-b ${theme.border}`}>
//           <button onClick={() => setView('create-product')} className={`p-2 -ml-1 ${theme.textSecondary}`}>
//             <ChevronLeft size={22} />
//           </button>
//           <h1 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2">Create Variant</h1>
//           <div className="w-10" />
//         </header>

//         <div className="flex-1 overflow-y-auto px-6 space-y-8 pb-32 pt-6">
//           {/* Title Input */}
//           <div className="space-y-2">
//             <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Variant Title</label>
//             <input 
//               type="text" 
//               placeholder="e.g. Large Bottle"
//               value={tempVariant.title}
//               onChange={(e) => setTempVariant({...tempVariant, title: e.target.value})}
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all`} 
//             />
//           </div>

//           {/* Optimized Variant Options Management */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Select Option</label>
//               <span className={`text-[10px] ${theme.textSecondary}`}>{availableOptions.length} available</span>
//             </div>

//             <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
//               <button 
//                 onClick={() => setIsAddingNewOption(true)}
//                 className={`shrink-0 w-12 h-12 ${theme.surface} border ${theme.border} rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500/10 transition-colors`}
//               >
//                 <Plus size={20} />
//               </button>
              
//               {availableOptions.map((opt) => (
//                 <div 
//                   key={opt}
//                   onClick={() => setTempVariant({...tempVariant, option: opt})}
//                   className={`shrink-0 relative group h-12 px-5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${tempVariant.option === opt ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : `${theme.surface} ${theme.border} ${theme.textSecondary}`}`}
//                 >
//                   <span className="text-sm font-bold whitespace-nowrap">{opt}</span>
//                   <button 
//                     onClick={(e) => deleteOption(e, opt)}
//                     className="p-1 -mr-2 text-zinc-400 hover:text-red-500 transition-colors"
//                   >
//                     <X size={14} />
//                   </button>
//                 </div>
//               ))}
//             </div>

//             {isAddingNewOption && (
//               <div className={`${theme.surface} border border-emerald-500/30 p-4 rounded-2xl flex gap-3 animate-in zoom-in-95 duration-200`}>
//                 <input 
//                   autoFocus
//                   type="text" 
//                   placeholder="New option name..."
//                   value={newOptionInput}
//                   onChange={(e) => setNewOptionInput(e.target.value)}
//                   className="flex-1 bg-transparent text-sm outline-none"
//                 />
//                 <div className="flex gap-2">
//                   <button onClick={() => setIsAddingNewOption(false)} className={`p-2 ${theme.textSecondary}`}><X size={18}/></button>
//                   <button onClick={addNewOption} className="bg-emerald-500 text-white p-2 rounded-lg"><Check size={18}/></button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Pricing & Inventory */}
//           <div className="space-y-6">
//              <div className="space-y-2">
//               <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Inventory</label>
//               <input 
//                 type="number" 
//                 placeholder="0"
//                 value={tempVariant.inventory}
//                 onChange={(e) => setTempVariant({...tempVariant, inventory: e.target.value})}
//                 className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm outline-none`} 
//               />
//             </div>

//             <div className="space-y-4">
//               <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Price (PKR)</label>
//               <div className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 flex items-center gap-3`}>
//                 <span className={`${theme.textSecondary} font-bold`}>Rs.</span>
//                 <input 
//                   type="number" 
//                   placeholder="0"
//                   value={tempVariant.price}
//                   onChange={(e) => setTempVariant({...tempVariant, price: e.target.value})}
//                   className="bg-transparent w-full outline-none text-sm" 
//                 />
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-emerald-500/5 p-4 rounded-2xl flex gap-3 border border-emerald-500/10">
//             <Info size={16} className="text-emerald-500/50 shrink-0 mt-0.5" />
//             <p className={`text-[11px] ${theme.textSecondary} leading-relaxed italic`}>
//               This price will be used for specific variant attributes like size, unit etc.
//             </p>
//           </div>
//         </div>

//         <div className={`p-6 bg-gradient-to-t from-[#00000022] to-transparent`}>
//           <button 
//             onClick={addVariantToProduct}
//             className="w-full h-16 bg-emerald-600 text-white font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg"
//           >
//             ADD VARIANT
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- RENDER MAIN CREATE PRODUCT VIEW ---
//   return (
//     <div className={`fixed inset-0 ${theme.bg} ${theme.textPrimary} font-sans flex flex-col transition-colors duration-300`}>
//       {/* Centered Header (Ultra-Compact Height) */}
//       <header className={`sticky top-0 z-10 px-4 pt-4 pb-3 flex items-center justify-between ${theme.headerBg} backdrop-blur-xl ${theme.headerShadow} border-b ${theme.border}`}>
//         <button className={`p-2 -ml-1 ${theme.textSecondary}`}>
//           <ChevronLeft size={22} />
//         </button>
        
//         <h1 className="text-base font-bold tracking-tight absolute left-1/2 -translate-x-1/2">Create Product</h1>
        
//         <button 
//           onClick={() => setDarkMode(!darkMode)}
//           className={`p-2 transition-all active:scale-90 ${darkMode ? 'text-amber-400' : 'text-indigo-600'}`}
//         >
//           {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//         </button>
//       </header>

//       <div className="flex-1 overflow-y-auto px-6 pb-32 pt-6 space-y-6">
//         {/* Media Upload */}
//         <div 
//           onClick={() => fileInputRef.current.click()}
//           className={`relative w-full aspect-video ${theme.surface} rounded-[2.5rem] border-2 border-dashed ${theme.border} flex flex-col items-center justify-center gap-2 overflow-hidden group active:opacity-80 transition-all`}
//         >
//           <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
//           {productImage ? (
//             <>
//               <img src={productImage} alt="Preview" className="w-full h-full object-cover" />
//               <button 
//                 onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
//                 className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-xl rounded-full text-white"
//               >
//                 <X size={16} />
//               </button>
//             </>
//           ) : (
//             <>
//               <div className={`w-14 h-14 ${darkMode ? 'bg-[#222]' : 'bg-zinc-100'} rounded-3xl flex items-center justify-center ${theme.textSecondary} shadow-inner group-hover:scale-105 transition-transform`}>
//                 <Camera size={28} />
//               </div>
//               <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme.textSecondary}`}>Product Media</span>
//             </>
//           )}
//         </div>

//         {/* Basic Info */}
//         <div className="space-y-4">
//           <div className="space-y-2">
//             <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Title *</label>
//             <input 
//               type="text" 
//               value={productName}
//               onChange={(e) => setProductName(e.target.value)}
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all font-medium`} 
//             />
//           </div>
//           <div className="space-y-2">
//             <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Description</label>
//             <textarea 
//               rows="2"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm focus:border-emerald-500/50 outline-none resize-none transition-all font-medium`} 
//             />
//           </div>
//         </div>

//         {/* Variants Logic */}
//         <div className="space-y-6">
//           <div className="flex items-center gap-3 cursor-pointer" onClick={() => setEnableVariants(!enableVariants)}>
//             <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${enableVariants ? 'bg-emerald-500 border-emerald-500 text-white' : darkMode ? 'border-zinc-700' : 'border-zinc-300'}`}>
//               {enableVariants && <Check size={16} strokeWidth={4} />}
//             </div>
//             <span className={`text-sm font-bold ${darkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>Enable variants</span>
//           </div>

//           {!enableVariants ? (
//             /* Base Price & Inventory (No Variants) */
//             <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
//               <div className="space-y-2">
//                 <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Price (PKR)</label>
//                 <div className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 flex items-center gap-2`}>
//                    <span className={`${theme.textSecondary} text-xs font-bold`}>Rs.</span>
//                    <input 
//                     type="number" 
//                     placeholder="0"
//                     value={basePrice}
//                     onChange={(e) => setBasePrice(e.target.value)}
//                     className="bg-transparent w-full outline-none text-sm" 
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Inventory</label>
//                 <input 
//                   type="number" 
//                   placeholder="0"
//                   value={baseInventory}
//                   onChange={(e) => setBaseInventory(e.target.value)}
//                   className={`w-full ${theme.inputBg} border ${theme.border} rounded-2xl p-4 text-sm outline-none`} 
//                 />
//               </div>
//             </div>
//           ) : (
//             /* Variants UI */
//             <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
//               <div className="space-y-3">
//                 <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Variant Settings</label>
//                 <div className={`${theme.surface} border ${theme.border} rounded-2xl p-1.5 flex gap-1`}>
//                   {['Unit', 'Weight', 'Size'].map(unit => (
//                     <button 
//                       key={unit}
//                       onClick={() => setSelectedUnit(unit)}
//                       className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${selectedUnit === unit ? theme.pillActive : theme.pillInactive}`}
//                     >
//                       {unit}
//                     </button>
//                   ))}
//                   <div className={`w-10 flex items-center justify-center ${theme.textSecondary}`}>
//                     <ChevronDown size={16} />
//                   </div>
//                 </div>
//               </div>

//               {/* Added Variations List */}
//               <div className="space-y-3">
//                 <label className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Added Variations</label>
//                 <div className="space-y-3">
//                   {variants.map((v) => (
//                     <div key={v.id} className={`${theme.card} border ${theme.border} rounded-2xl p-4 flex items-center justify-between group`}>
//                       <div className="flex flex-col gap-1">
//                         <span className="text-sm font-bold">{v.title}</span>
//                         <div className="flex gap-2">
//                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'} rounded-md border text-zinc-500`}>{v.option}</span>
//                           <span className={`text-[9px] font-black uppercase px-2 py-0.5 ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'} rounded-md border text-zinc-500`}>Qty: {v.inventory}</span>
//                           <span className="text-[9px] font-black text-emerald-500 uppercase px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">Rs. {v.price}</span>
//                         </div>
//                       </div>
//                       <button onClick={() => setVariants(variants.filter(x => x.id !== v.id))} className="p-2 text-zinc-400 hover:text-red-500 transition-colors">
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   ))}
//                   <button 
//                     onClick={() => setView('create-variant')}
//                     className={`w-full py-5 border-2 border-dashed ${theme.border} rounded-2xl flex items-center justify-center gap-3 ${theme.textSecondary} group active:scale-[0.99] transition-all`}
//                   >
//                     <PlusCircle size={20} className="group-hover:text-emerald-500 transition-colors" />
//                     <span className="text-xs font-black uppercase tracking-widest">Add Variation</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Save Button */}
//       <div className={`p-6 bg-gradient-to-t from-${darkMode ? '[#0a0a0a]' : '[#f8f9fa]'} to-transparent sticky bottom-0`}>
//         <button className={`w-full h-16 ${darkMode ? 'bg-[#1a1a1a] border-zinc-800 text-zinc-400' : 'bg-zinc-900 border-zinc-900 text-white'} border font-black rounded-2xl flex items-center justify-center active:scale-95 transition-all uppercase tracking-[0.2em] text-xs shadow-xl`}>
//           Save Product
//         </button>
//       </div>
//     </div>
//   );
// }