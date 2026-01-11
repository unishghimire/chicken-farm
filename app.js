// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBV-aJoP8NEBVXU3zLXjh5jGZX7gYTtUFE",
  authDomain: "chicken-nepal.firebaseapp.com",
  projectId: "chicken-nepal",
  storageBucket: "chicken-nepal.firebasestorage.app",
  messagingSenderId: "181991954442",
  appId: "1:181991954442:web:a86f06c575e53979f0a7f3",
  measurementId: "G-TNT1XYL2MK",
  databaseURL: "https://chicken-nepal-default-rtdb.firebaseio.com"
};

// 2. STATE
const state = {
    user: null,
    settings: {
        priceLive: 290,
        availability: true,
        deliveryFee: 50
    },
    liveStats: { 
        totalBirds: 0, 
        daily: { day: 1, weight: 40, feed: 0, mortality: 0, medicine: "None" }
    },
    cart: { type: 'live', qty: 1 }
};

// 3. INITIALIZE APP
let auth, db, rtdb;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    rtdb = firebase.database();
    startListeners();
} catch (e) {
    console.error("Firebase Error:", e);
}

// 4. ROUTER
function router(page) {
    const app = document.getElementById('app');
    window.scrollTo(0, 0);
    document.getElementById('mobile-menu').classList.add('hidden');

    switch(page) {
        case 'home': renderHome(); break;
        case 'products': renderProducts(); break;
        case 'gallery': renderGallery(); break;
        case 'about': renderAbout(); break;
        case 'contact': renderContact(); break;
        case 'admin-login': renderAdminLogin(); break;
        case 'admin-dashboard': 
            if(state.user) renderAdminDashboard();
            else router('admin-login');
            break;
        default: renderHome();
    }
}

// 5. DATA LISTENERS
function startListeners() {
    auth.onAuthStateChanged(u => {
        state.user = u;
        const btn = document.getElementById('nav-admin-btn');
        if(btn) btn.innerText = u ? 'Dashboard' : 'Admin';
    });

    try {
        rtdb.ref('farmStats').on('value', snap => {
            if(snap.exists()) {
                const val = snap.val();
                state.liveStats.totalBirds = val.totalBirds || 0;
                if(val.daily) state.liveStats.daily = val.daily;
                
                if(document.getElementById('live-bird-count')) document.getElementById('live-bird-count').innerText = state.liveStats.totalBirds;
                if(document.getElementById('stat-day')) document.getElementById('stat-day').innerText = state.liveStats.daily.day;
                if(document.getElementById('stat-weight')) document.getElementById('stat-weight').innerText = state.liveStats.daily.weight + 'g';
                if(document.getElementById('stat-feed')) document.getElementById('stat-feed').innerText = state.liveStats.daily.feed + 'kg';
                if(document.getElementById('stat-med')) document.getElementById('stat-med').innerText = state.liveStats.daily.medicine || 'None';
            }
        });
    } catch(e){}

    try {
        db.collection('settings').doc('general').onSnapshot(doc => {
            if(doc.exists) {
                state.settings = doc.data();
                const els = document.querySelectorAll('.live-price-disp');
                els.forEach(e => e.innerText = `Rs. ${state.settings.priceLive}/kg`);
            }
        });
    } catch(e){}
}

// 6. RENDER FUNCTIONS

// --- HOME ---
function renderHome() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in">
            <!-- Hero Section -->
            <div class="relative h-[600px] flex items-center justify-center text-center text-white px-4 bg-cover bg-center bg-no-repeat bg-fixed"
                 style="background-image: url('https://www.farmforward.com/wp-content/uploads/2023/03/broiler-chicken.jpg');">
                <div class="absolute inset-0 bg-black/60"></div>
                <div class="relative z-10 max-w-4xl mx-auto">
                    <h1 class="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-xl text-white">GreenValley Farm</h1>
                    <div class="h-1.5 w-24 bg-yellow-400 mx-auto mb-8 rounded-full shadow-lg"></div>
                    <p class="text-xl md:text-3xl mb-10 font-light text-gray-100 drop-shadow-md leading-relaxed">Raising Nepal's Finest Organic Broiler Chicken</p>
                    <button onclick="router('products')" class="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-12 rounded-full text-lg shadow-2xl transition transform hover:-translate-y-1 hover:scale-105 border-2 border-green-400 uppercase tracking-wider">ORDER LIVE BIRDS</button>
                </div>
            </div>
            
            <!-- Stats -->
            <div class="max-w-6xl mx-auto -mt-24 relative z-10 px-4 mb-20">
                <div class="bg-white rounded-2xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center border-t-8 border-green-600 mb-8">
                    <div class="border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0">
                        <div class="inline-block p-3 bg-green-100 rounded-full text-green-600 mb-3"><i class="fa-solid fa-money-bill-wave text-2xl"></i></div>
                        <p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Market Rate</p>
                        <h2 class="text-5xl font-extrabold text-gray-800 live-price-disp">Rs. ${state.settings.priceLive}</h2>
                        <p class="text-gray-400 text-sm mt-2">Per Kilogram</p>
                    </div>
                    <div>
                        <div class="inline-block p-3 bg-blue-100 rounded-full text-blue-600 mb-3"><i class="fa-solid fa-layer-group text-2xl"></i></div>
                        <p class="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Live Stock</p>
                        <h2 id="live-bird-count" class="text-5xl font-extrabold text-blue-600">${state.liveStats.totalBirds}</h2>
                        <p class="text-gray-400 text-sm mt-2">Healthy Birds Available</p>
                    </div>
                </div>

                <!-- Log -->
                <div class="bg-gray-900 rounded-2xl shadow-xl p-6 text-white border border-gray-700">
                    <div class="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                        <h3 class="font-bold text-yellow-400 uppercase tracking-widest"><i class="fa-solid fa-clipboard-list mr-2"></i> Daily Farm Log</h3>
                        <span class="text-xs text-gray-400">Updated: Today</span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div class="bg-gray-800 rounded-xl p-4">
                            <i class="fa-solid fa-calendar-day text-2xl text-green-400 mb-2"></i>
                            <p class="text-xs text-gray-400 uppercase font-bold">Batch Age</p>
                            <h4 id="stat-day" class="text-2xl font-bold">${state.liveStats.daily.day} <span class="text-sm font-normal">Days</span></h4>
                        </div>
                        <div class="bg-gray-800 rounded-xl p-4">
                            <i class="fa-solid fa-weight-scale text-2xl text-yellow-400 mb-2"></i>
                            <p class="text-xs text-gray-400 uppercase font-bold">Avg Weight</p>
                            <h4 id="stat-weight" class="text-2xl font-bold">${state.liveStats.daily.weight} <span class="text-sm font-normal">g</span></h4>
                        </div>
                        <div class="bg-gray-800 rounded-xl p-4">
                            <i class="fa-solid fa-wheat-awn text-2xl text-blue-400 mb-2"></i>
                            <p class="text-xs text-gray-400 uppercase font-bold">Feed Today</p>
                            <h4 id="stat-feed" class="text-2xl font-bold">${state.liveStats.daily.feed} <span class="text-sm font-normal">kg</span></h4>
                        </div>
                        <div class="bg-gray-800 rounded-xl p-4 border border-green-800">
                            <i class="fa-solid fa-heart-pulse text-2xl text-red-400 mb-2"></i>
                            <p class="text-xs text-gray-400 uppercase font-bold">Health / Meds</p>
                            <h4 id="stat-med" class="text-xl font-bold truncate">${state.liveStats.daily.medicine || "Healthy"}</h4>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transparency Section (UPDATED IMAGE) -->
            <section class="py-16 px-4 bg-gray-50">
                <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div class="relative group">
                         <div class="absolute -inset-1 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                         <img src="https://www.farmforward.com/wp-content/uploads/2023/03/broiler-chicken.jpg" 
                              class="relative rounded-2xl shadow-xl border-4 border-white w-full h-80 object-cover">
                    </div>
                    <div>
                        <h2 class="text-4xl font-bold text-gray-800 mb-6">Transparent Farming</h2>
                        <p class="text-gray-600 mb-6 text-lg leading-relaxed">
                            We believe in full transparency. Our daily logs show exactly what our birds eat and their health status, so you know your meat is safe.
                        </p>
                        <button onclick="router('about')" class="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 transition shadow">
                            Read Our Story &rarr;
                        </button>
                    </div>
                </div>
            </section>
        </div>
    `;
}

// --- ORDER PAGE ---
function renderProducts() {
    document.getElementById('app').innerHTML = `
        <div class="max-w-3xl mx-auto px-4 py-12 fade-in">
            <div class="text-center mb-10"><h1 class="text-3xl font-bold text-green-900">Order Fresh Chicken</h1><p class="text-gray-500 mt-2">Direct from farm.</p></div>
            <div class="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
                <div class="bg-green-50 p-6 border-b border-green-100 flex justify-between items-center">
                    <div><span class="text-xs font-bold text-green-600 uppercase tracking-wide">Product</span><h2 class="text-xl font-bold text-green-900">Live Broiler Bird</h2></div>
                    <div class="text-right"><span class="text-xs font-bold text-green-600 uppercase tracking-wide">Rate</span><h2 class="text-xl font-bold text-green-900 live-price-disp">Rs. ${state.settings.priceLive}/kg</h2></div>
                </div>
                <div class="p-8">
                    <div class="mb-6"><label class="block font-bold text-gray-700 mb-2">Quantity (KG)</label><div class="flex items-center"><input type="number" id="qty" value="1" min="1" oninput="calcTotal()" class="w-full border-2 border-gray-300 rounded-l-lg p-3 text-lg"><span class="bg-gray-100 border-2 border-l-0 border-gray-300 rounded-r-lg p-3 font-bold text-gray-500 px-6">KG</span></div></div>
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 flex justify-between items-center"><span class="text-yellow-800 font-medium">Estimated Cost:</span><span id="total-disp" class="text-2xl font-bold text-yellow-900">Rs. ${state.settings.priceLive}</span></div>
                    <form onsubmit="placeOrder(event)" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5"><div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Name</label><input type="text" id="c-name" required class="w-full border p-3 rounded-lg"></div><div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Phone</label><input type="tel" id="c-phone" required class="w-full border p-3 rounded-lg"></div></div>
                        <div><label class="block text-xs font-bold text-gray-500 mb-1 uppercase">Delivery</label><select id="c-method" onchange="calcTotal()" class="w-full border p-3 rounded-lg bg-white"><option value="pickup">Farm Pickup (Free)</option><option value="delivery">Home Delivery (+Rs. 50)</option></select></div>
                        <textarea id="c-addr" placeholder="Address..." class="w-full border p-3 rounded-lg h-24 hidden"></textarea>
                        <button type="submit" class="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-lg shadow-lg">CONFIRM ORDER</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    calcTotal();
}

// --- ABOUT PAGE ---
function renderAbout() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in">
            <div class="bg-green-900 text-white py-20 text-center"><h1 class="text-4xl font-bold mb-4">Our Standards</h1><p class="text-green-200">Quality You Can Trust</p></div>
            <div class="max-w-6xl mx-auto px-4 py-16">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div class="bg-white p-8 rounded-xl shadow-lg border-t-4 border-green-500"><h3 class="text-xl font-bold mb-3">Bio-Security</h3><p class="text-gray-600">Strict hygiene protocols.</p></div>
                    <div class="bg-white p-8 rounded-xl shadow-lg border-t-4 border-yellow-500"><h3 class="text-xl font-bold mb-3">Veg Feed</h3><p class="text-gray-600">Maize and soya based.</p></div>
                    <div class="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-500"><h3 class="text-xl font-bold mb-3">Clean Water</h3><p class="text-gray-600">Dual-filtration system.</p></div>
                </div>
            </div>
        </div>
    `;
}

// --- CONTACT PAGE ---
function renderContact() {
    document.getElementById('app').innerHTML = `
        <div class="fade-in max-w-6xl mx-auto px-4 py-16">
            <div class="text-center mb-16"><h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="bg-white p-6 rounded-xl shadow-md"><h3 class="font-bold">Location</h3><p class="text-gray-600">Ward 4, Countryside, Nepal</p></div>
                    <div class="bg-white p-6 rounded-xl shadow-md"><h3 class="font-bold">Phone</h3><p class="text-gray-600">9876543210</p></div>
                </div>
                <div class="bg-gray-200 rounded-xl shadow-md h-64 relative"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56516.31625952983!2d85.3261328!3d27.7089603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb198a307baabf%3A0xb5137c1bf18db1ea!2sKathmandu" width="100%" height="100%" style="border:0;" allowfullscreen="" class="absolute inset-0"></iframe></div>
            </div>
        </div>
    `;
}

// --- GALLERY ---
function renderGallery() {
    document.getElementById('app').innerHTML = `<div class="fade-in max-w-6xl mx-auto px-4 py-12"><h1 class="text-3xl font-bold text-center mb-10">Farm Gallery</h1><div id="gallery-grid" class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="col-span-3 text-center">Loading...</div></div></div>`;
    db.collection('gallery').orderBy('timestamp', 'desc').get().then(snap => {
        const grid = document.getElementById('gallery-grid');
        if(snap.empty) { grid.innerHTML = 'No images.'; return; }
        let h = '';
        snap.forEach(d => {
            const da = d.data();
            h += `<div class="group relative rounded-lg overflow-hidden shadow-lg"><img src="${da.url}" class="w-full h-64 object-cover transform transition group-hover:scale-110 cursor-pointer" onclick="window.open(this.src)">${state.user?`<button onclick="deleteImage('${d.id}')" class="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Delete</button>`:''}</div>`;
        });
        grid.innerHTML = h;
    });
}

// --- ADMIN DASHBOARD ---
function renderAdminDashboard() {
    document.getElementById('app').innerHTML = `
        <div class="p-6 max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <button onclick="auth.signOut().then(()=>router('home'))" class="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">Logout</button>
            </div>
            
            <div class="bg-gray-800 text-white p-6 rounded-xl shadow-lg mb-8">
                <h3 class="font-bold text-yellow-400 text-sm uppercase mb-4"><i class="fa-solid fa-pen-to-square mr-2"></i> Update Daily Log</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div><label class="text-xs text-gray-400 uppercase">Day</label><input id="up-day" type="number" class="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white" value="${state.liveStats.daily.day}"></div>
                    <div><label class="text-xs text-gray-400 uppercase">Wgt (g)</label><input id="up-weight" type="number" class="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white" value="${state.liveStats.daily.weight}"></div>
                    <div><label class="text-xs text-gray-400 uppercase">Feed (kg)</label><input id="up-feed" type="number" class="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white" value="${state.liveStats.daily.feed}"></div>
                    <div><label class="text-xs text-gray-400 uppercase text-red-300">Mortality</label><input id="up-mortality" type="number" class="w-full bg-gray-700 border border-red-500 p-2 rounded text-white" value="0"></div>
                    <div><label class="text-xs text-gray-400 uppercase">Medicine</label><input id="up-med" type="text" class="w-full bg-gray-700 border border-gray-600 p-2 rounded text-white" value="${state.liveStats.daily.medicine || 'None'}"></div>
                </div>
                <button onclick="saveDailyStats()" class="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">UPDATE LOG & SYNC STOCK</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div class="bg-white p-6 rounded-xl shadow border"><h3 class="font-bold text-gray-500 text-xs uppercase mb-2">Total Birds (Manual)</h3><div class="flex gap-2"><input id="adm-birds" type="number" class="border p-2 w-full rounded font-bold" value="${state.liveStats.totalBirds}"><button onclick="saveStats()" class="bg-blue-600 text-white px-4 rounded"><i class="fa-solid fa-save"></i></button></div></div>
                <div class="bg-white p-6 rounded-xl shadow border"><h3 class="font-bold text-gray-500 text-xs uppercase mb-2">Price (Rs/kg)</h3><div class="flex gap-2"><input id="adm-p-live" type="number" class="border p-2 w-full rounded font-bold" value="${state.settings.priceLive}"><button onclick="savePrices()" class="bg-green-600 text-white px-4 rounded"><i class="fa-solid fa-save"></i></button></div></div>
                <div class="bg-white p-6 rounded-xl shadow border"><h3 class="font-bold text-gray-500 text-xs uppercase mb-2">Add Gallery URL</h3><div class="flex gap-2"><input id="img-url" type="text" placeholder="URL..." class="border p-2 w-full rounded text-sm"><button onclick="addGalleryImage()" class="bg-purple-600 text-white px-4 rounded"><i class="fa-solid fa-plus"></i></button></div></div>
            </div>

            <div class="bg-white rounded-xl shadow overflow-hidden"><div class="p-6 border-b flex justify-between"><h3 class="font-bold">Recent Orders</h3><button onclick="loadOrders()" class="text-blue-600 text-sm">Refresh</button></div><table class="w-full text-left text-sm"><tbody id="order-list"><tr><td class="p-4">Loading...</td></tr></tbody></table></div>
        </div>
    `;
    loadOrders();
}

// 7. LOGIC HANDLERS
window.saveDailyStats = () => {
    const day = parseInt(document.getElementById('up-day').value), weight = parseInt(document.getElementById('up-weight').value), feed = parseInt(document.getElementById('up-feed').value), mort = parseInt(document.getElementById('up-mortality').value)||0, med = document.getElementById('up-med').value;
    rtdb.ref('farmStats/daily').set({day, weight, feed, medicine: med, mortality: mort});
    if(mort>0){ rtdb.ref('farmStats/totalBirds').transaction(c=>(c||0)-mort); alert(`Updated! Removed ${mort} dead birds.`); } else { alert("Updated!"); }
    document.getElementById('up-mortality').value=0;
};
window.calcTotal = () => {
    const q = document.getElementById('qty').value||0, m = document.getElementById('c-method').value, p = state.settings.priceLive;
    let t = q*p; if(m==='delivery'){t+=50; document.getElementById('c-addr').classList.remove('hidden');}else{document.getElementById('c-addr').classList.add('hidden');}
    document.getElementById('total-disp').innerText = `Rs. ${t}`;
};
window.placeOrder = async (e) => {
    e.preventDefault(); e.target.querySelector('button').disabled=true;
    try { await db.collection('orders').add({customer: document.getElementById('c-name').value, phone: document.getElementById('c-phone').value, type:'live', qty: document.getElementById('qty').value, method: document.getElementById('c-method').value, address: document.getElementById('c-addr').value||'Pickup', status: 'Pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()}); alert("Order Placed!"); router('home'); } catch(e){ alert(e.message); }
};
window.saveStats = () => rtdb.ref('farmStats').update({totalBirds: parseInt(document.getElementById('adm-birds').value)});
window.savePrices = () => db.collection('settings').doc('general').set({priceLive: parseFloat(document.getElementById('adm-p-live').value)}, {merge:true});
window.addGalleryImage = () => { const u=document.getElementById('img-url').value; if(u) db.collection('gallery').add({url:u, timestamp:firebase.firestore.FieldValue.serverTimestamp()}).then(()=>{alert('Added'); document.getElementById('img-url').value=''}); };
window.deleteImage = (id) => { if(confirm('Delete?')) db.collection('gallery').doc(id).delete().then(()=>renderGallery()); };
function loadOrders() { db.collection('orders').orderBy('timestamp', 'desc').limit(20).onSnapshot(s => { let h=''; s.forEach(d=>{ const o=d.data(); h+=`<tr class="border-b"><td class="p-4"><b>${o.customer}</b><br>${o.phone}</td><td class="p-4">${o.qty}kg</td><td class="p-4">${o.status}</td><td class="p-4">${o.status==='Pending'?`<button onclick="changeStatus('${d.id}','Completed',${o.qty})" class="text-green-600">✔</button>`:''}</td></tr>`; }); document.getElementById('order-list').innerHTML = h; }); }
window.changeStatus = (id, s, q) => { if(s==='Completed' && prompt(`Deduct ${q}kg from stock? (Enter birds count)`)) rtdb.ref('farmStats/totalBirds').transaction(c=>(c||0)-parseInt(arguments[2])); db.collection('orders').doc(id).update({status:s}); };
function renderAdminLogin() { if(state.user){router('admin-dashboard');return;} document.getElementById('app').innerHTML=`<div class="flex justify-center h-[70vh] items-center"><div class="bg-white p-8 shadow-xl rounded-xl w-full max-w-sm"><h2 class="font-bold text-xl mb-4 text-center">Admin</h2><input id="le" placeholder="Email" class="border p-3 w-full mb-3 rounded"><input id="lp" type="password" placeholder="Pass" class="border p-3 w-full mb-6 rounded"><button onclick="auth.signInWithEmailAndPassword(document.getElementById('le').value,document.getElementById('lp').value)" class="bg-green-800 text-white w-full py-3 rounded font-bold">Login</button></div></div>`; }

router('home');
