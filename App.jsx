
import React, { useEffect, useMemo, useState } from "react";

const BRAND = {
  name: "BLACKDRAGON FF",
  slogan: "Acc chất — Giao nhanh — Bảo hành",
  logo: (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#111" />
      <path d="M6 17c2-4 6-6 9-6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="7" r="1.8" fill="#fff" />
    </svg>
  ),
};

const SAMPLE = Array.from({ length: 12 }).map((_, i) => ({
  id: `FF${10000 + i}`,
  nickname: `BD_Player${100 + i}`,
  level: Math.floor(Math.random() * 200) + 1,
  skins: Math.floor(Math.random() * 80),
  price: [19900, 39900, 79900, 149900][Math.floor(Math.random() * 4)],
  rating: (Math.random() * 2 + 3).toFixed(1),
  img: `https://picsum.photos/seed/black${i}/600/400`,
}));

const ADMIN_CRED = { user: "admin", pass: "shopadmin" };

export default function FreeFireShopPro() {
  const [products, setProducts] = useState(() => {
    const raw = localStorage.getItem("bf_products");
    return raw ? JSON.parse(raw) : SAMPLE;
  });
  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem("bf_cart");
    return raw ? JSON.parse(raw) : [];
  });
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState(() => !!localStorage.getItem("bf_admin"));
  const [orders, setOrders] = useState(() => {
    const raw = localStorage.getItem("bf_orders");
    return raw ? JSON.parse(raw) : [];
  });
  const [bankQr, setBankQr] = useState(() => localStorage.getItem("bf_bank_qr") || null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState("stripe");
  const [customer, setCustomer] = useState({ name: "", phone: "" });

  useEffect(() => {
    localStorage.setItem("bf_products", JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem("bf_cart", JSON.stringify(cart));
  }, [cart]);
  useEffect(() => {
    localStorage.setItem("bf_orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    if (bankQr) localStorage.setItem("bf_bank_qr", bankQr);
  }, [bankQr]);

  const filtered = useMemo(() => {
    return products.filter((p) => p.nickname.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase()));
  }, [products, query]);

  function addToCart(p) {
    if (cart.find((c) => c.id === p.id)) return alert("Tài khoản đã có trong giỏ");
    setCart((s) => [...s, p]);
  }
  function removeFromCart(id) {
    setCart((s) => s.filter((c) => c.id !== id));
  }

  function adminLogin(username, password) {
    if (username === ADMIN_CRED.user && password === ADMIN_CRED.pass) {
      localStorage.setItem("bf_admin", "1");
      setAdmin(true);
      alert("Đăng nhập admin thành công.");
    } else alert("Tài khoản admin không đúng.");
  }

  function adminLogout() {
    localStorage.removeItem("bf_admin");
    setAdmin(false);
  }

  function addProduct(p) {
    setProducts((s) => [{ ...p, id: `FF${Math.floor(Math.random() * 90000) + 10000}` }, ...s]);
  }
  function updateProduct(id, patch) {
    setProducts((s) => s.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function deleteProduct(id) {
    setProducts((s) => s.filter((it) => it.id !== id));
  }

  function placeOrder(method) {
    if (!customer.name || !customer.phone) return alert("Vui lòng nhập tên & số điện thoại để hoàn tất đơn.");
    const order = {
      id: `ORD${Date.now()}`,
      items: cart,
      total: cart.reduce((s, c) => s + c.price, 0),
      method,
      customer,
      status: method === "stripe" ? "paid (mock)" : "pending",
      createdAt: new Date().toISOString(),
    };
    setOrders((s) => [order, ...s]);
    setCart([]);
    setShowCheckout(false);
    alert(`Đơn hàng ${order.id} được tạo. Trạng thái: ${order.status}`);
  }

  function handleBankQrUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBankQr(reader.result);
      alert("Đã cập nhật QR thanh toán (lưu localStorage). Vui lòng không upload thông tin nhạy cảm công khai.");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{minHeight:'100vh',background:'#000',color:'#fff',padding:20}}>
      <header style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{background:'#111',padding:8,borderRadius:8}}>{BRAND.logo}</div>
          <div>
            <div style={{fontSize:20,fontWeight:700}}>{BRAND.name}</div>
            <div style={{fontSize:12,opacity:0.7}}>{BRAND.slogan}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{fontSize:14,opacity:0.9}}>Giỏ: <strong>{cart.length}</strong></div>
          <button onClick={() => setShowCheckout(true)} style={{background:'#16a34a',padding:'8px 12px',borderRadius:6,border:0}}>Thanh toán</button>
          {admin ? (
            <button onClick={adminLogout} style={{padding:'8px 12px',borderRadius:6}}>Thoát Admin</button>
          ) : (
            <AdminLogin onLogin={adminLogin} />
          )}
        </div>
      </header>

      <main style={{maxWidth:1100,margin:'20px auto',display:'grid',gridTemplateColumns:'1fr 3fr',gap:20}}>
        <aside style={{background:'#0b0b0b',padding:16,borderRadius:8}}>
          <div>
            <label style={{fontSize:12,opacity:0.7}}>Tìm kiếm</label>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="nickname hoặc id" style={{width:'100%',marginTop:8,padding:10,background:'#111',borderRadius:6,border:'1px solid #222'}} />
          </div>

          <div style={{marginTop:12}}>
            <div style={{fontSize:12,opacity:0.7}}>Thanh toán QR (admin upload)</div>
            {bankQr ? (
              <img src={bankQr} alt="bank-qr" style={{marginTop:8,borderRadius:6,width:'100%'}} />
            ) : (
              <div style={{marginTop:8,fontSize:12,opacity:0.6}}>Chưa có QR. Admin có thể upload ở trang Admin.</div>
            )}
          </div>

          <div style={{marginTop:12,borderTop:'1px solid #222',paddingTop:12}}>
            <div style={{fontSize:12,opacity:0.7}}>Kênh hỗ trợ</div>
            <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:6}}>
              <a style={{fontSize:14}} href="#">Zalo: 0xxxxxxxx</a>
              <a style={{fontSize:14}} href="#">Facebook: /blackdragonff</a>
              <a style={{fontSize:14}} href="#">Hotline: 0xxxxxxxx</a>
            </div>
          </div>
        </aside>

        <section>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:16}}>
            {filtered.map((p)=>(
              <article key={p.id} style={{background:'#0b0b0b',borderRadius:8,overflow:'hidden'}}>
                <img src={p.img} alt={p.nickname} style={{width:'100%',height:160,objectFit:'cover'}} />
                <div style={{padding:12}}>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <div>
                      <div style={{fontWeight:700}}>{p.nickname}</div>
                      <div style={{fontSize:12,opacity:0.7}}>{p.id} · Level {p.level}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:700}}>{p.price.toLocaleString()}₫</div>
                      <div style={{fontSize:12,opacity:0.7}}>⭐ {p.rating}</div>
                    </div>
                  </div>

                  <div style={{marginTop:12,display:'flex',gap:8}}>
                    <button onClick={()=>addToCart(p)} style={{flex:1,padding:10,borderRadius:6,border:'1px solid #333'}}>Thêm giỏ</button>
                    <button onClick={()=>{setCart([p]); setShowCheckout(true);}} style={{flex:1,padding:10,borderRadius:6,background:'#4f46e5',border:0}}>Mua</button>
                  </div>

                  {admin && (
                    <div style={{marginTop:10,display:'flex',gap:8,fontSize:12}}>
                      <button onClick={()=>updateProduct(p.id,{price:p.price+1000})} style={{padding:6,borderRadius:6,border:'1px solid #333'}}>Tăng giá +1k</button>
                      <button onClick={()=>deleteProduct(p.id)} style={{padding:6,borderRadius:6,border:'1px solid #333'}}>Xóa</button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <CartPreview cart={cart} remove={removeFromCart} />

          <OrderHistory orders={orders} admin={admin} />
        </section>
      </main>

      {showCheckout && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{width:'100%',maxWidth:900,background:'#111',borderRadius:8,padding:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontWeight:700}}>Thanh toán</h3>
              <button onClick={()=>setShowCheckout(false)} style={{opacity:0.7}}>Đóng</button>
            </div>

            <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{background:'#0b0b0b',padding:12,borderRadius:8}}>
                <div style={{fontSize:12,opacity:0.7}}>Thông tin khách</div>
                <input style={{width:'100%',marginTop:8,padding:10,background:'#111',borderRadius:6,border:'1px solid #222'}} placeholder="Họ và tên" value={customer.name} onChange={(e)=>setCustomer(s=>({...s,name:e.target.value}))} />
                <input style={{width:'100%',marginTop:8,padding:10,background:'#111',borderRadius:6,border:'1px solid #222'}} placeholder="Số điện thoại" value={customer.phone} onChange={(e)=>setCustomer(s=>({...s,phone:e.target.value}))} />
                <div style={{marginTop:12,fontSize:12,opacity:0.7}}>Phương thức thanh toán</div>
                <select value={checkoutMethod} onChange={(e)=>setCheckoutMethod(e.target.value)} style={{width:'100%',marginTop:8,padding:10,background:'#111',borderRadius:6,border:'1px solid #222'}}>
                  <option value="stripe">Thẻ/InternetBanking (mô phỏng)</option>
                  <option value="qr">Scan QR (ảnh QR upload)</option>
                  <option value="bank">Chuyển khoản (hướng dẫn)</option>
                </select>

                <div style={{marginTop:12}}>Tổng: <strong>{cart.reduce((s,c)=>s+c.price,0).toLocaleString()}₫</strong></div>

                <div style={{marginTop:12,display:'flex',gap:8}}>
                  <button onClick={()=>placeOrder(checkoutMethod)} style={{flex:1,background:'#16a34a',padding:10,borderRadius:6}}>Đặt hàng</button>
                  <button onClick={()=>{setCheckoutMethod('stripe'); alert('Mô phỏng: sẽ chuyển tới cổng thanh toán.');}} style={{flex:1,borderRadius:6,border:'1px solid #333'}}>Thanh toán ngay</button>
                </div>
              </div>

              <div style={{background:'#0b0b0b',padding:12,borderRadius:8}}>
                <div style={{fontSize:12,opacity:0.7}}>Xem trước thanh toán</div>
                {checkoutMethod==='qr' && (
                  <div style={{marginTop:12,textAlign:'center'}}>
                    {bankQr ? <img src={bankQr} alt="qr" style={{width:180}} /> : <div style={{fontSize:12,opacity:0.6}}>Chưa có QR. Admin upload ở trang Admin.</div>}
                    <div style={{fontSize:12,opacity:0.6,marginTop:8}}>Quét QR từ điện thoại của bạn để chuyển tiền.</div>
                  </div>
                )}
                {checkoutMethod==='bank' && (
                  <div style={{marginTop:12,fontSize:12,opacity:0.7}}>
                    <p>Hướng dẫn chuyển khoản:</p>
                    <ol style={{paddingLeft:18,marginTop:8}}>
                      <li>Chuyển tiền theo hướng dẫn</li>
                      <li>Ghi rõ mã đơn hàng ở nội dung chuyển khoản</li>
                      <li>Gửi lại hóa đơn chuyển khoản cho admin để xác nhận</li>
                    </ol>
                  </div>
                )}
                {checkoutMethod==='stripe' && <div style={{marginTop:12,fontSize:12,opacity:0.7}}>Mô phỏng thanh toán thẻ. Thực tế cần backend kết nối cổng thanh toán.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {admin && <AdminPanel addProduct={addProduct} handleBankQrUpload={handleBankQrUpload} products={products} />}

      <footer style={{maxWidth:1100,margin:'20px auto',textAlign:'center',opacity:0.6,fontSize:12}}>© {new Date().getFullYear()} {BRAND.name} — Giao dịch thật cần backend & cổng thanh toán.</footer>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [u,setU]=useState(''); const [p,setP]=useState('');
  return (<div style={{display:'flex',gap:8,alignItems:'center'}}>
    <input value={u} onChange={(e)=>setU(e.target.value)} placeholder="admin" style={{padding:6,background:'#111',borderRadius:6,border:'1px solid #222'}} />
    <input value={p} onChange={(e)=>setP(e.target.value)} placeholder="pass" style={{padding:6,background:'#111',borderRadius:6,border:'1px solid #222'}} />
    <button onClick={()=>onLogin(u,p)} style={{padding:'6px 10px',borderRadius:6}}>Admin</button>
  </div>);
}

function CartPreview({cart,remove}) {
  return (<div style={{marginTop:20,background:'#0b0b0b',padding:12,borderRadius:8}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
      <div style={{fontWeight:700}}>Giỏ hàng</div>
      <div style={{opacity:0.8}}>Tổng: {cart.reduce((s,c)=>s+c.price,0).toLocaleString()}₫</div>
    </div>
    <div style={{marginTop:12,display:'grid',gap:8}}>
      {cart.length===0 && <div style={{opacity:0.6}}>Giỏ trống</div>}
      {cart.map(c=>(<div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#111',padding:8,borderRadius:6}}>
        <div><div style={{fontWeight:700}}>{c.nickname}</div><div style={{fontSize:12,opacity:0.7}}>{c.id}</div></div>
        <div style={{textAlign:'right'}}><div style={{fontWeight:700}}>{c.price.toLocaleString()}₫</div><button onClick={()=>remove(c.id)} style={{marginTop:6,padding:'6px 8px',borderRadius:6,border:'1px solid #333'}}>Xóa</button></div>
      </div>))}
    </div>
  </div>);
}

function AdminPanel({addProduct,handleBankQrUpload,products}) {
  const [show,setShow]=useState(true);
  const [form,setForm]=useState({nickname:'',level:1,skins:0,price:19900,img:''});
  return (<div style={{position:'fixed',right:16,bottom:16,width:360,zIndex:60}}>
    <div style={{background:'#111',padding:12,borderRadius:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontWeight:700}}>Admin Panel</div>
        <div style={{fontSize:12,opacity:0.7}}>Số acc: {products.length}</div>
      </div>

      <div style={{marginTop:12}}>
        <input value={form.nickname} onChange={(e)=>setForm(s=>({...s,nickname:e.target.value}))} placeholder="Nickname" style={{width:'100%',padding:8,background:'#0b0b0b',borderRadius:6,border:'1px solid #222'}} />
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:8}}>
          <input type="number" value={form.level} onChange={(e)=>setForm(s=>({...s,level:Number(e.target.value)}))} style={{padding:8,background:'#0b0b0b',borderRadius:6}} />
          <input type="number" value={form.skins} onChange={(e)=>setForm(s=>({...s,skins:Number(e.target.value)}))} style={{padding:8,background:'#0b0b0b',borderRadius:6}} />
          <input type="number" value={form.price} onChange={(e)=>setForm(s=>({...s,price:Number(e.target.value)}))} style={{padding:8,background:'#0b0b0b',borderRadius:6}} />
        </div>
        <input value={form.img} onChange={(e)=>setForm(s=>({...s,img:e.target.value}))} placeholder="Image URL" style={{width:'100%',padding:8,background:'#0b0b0b',borderRadius:6,marginTop:8}} />
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={()=>{addProduct(form); setForm({nickname:'',level:1,skins:0,price:19900,img:''})}} style={{flex:1,background:'#4f46e5',padding:10,borderRadius:6}}>Thêm acc</button>
          <label style={{flex:1,background:'#0b0b0b',padding:10,borderRadius:6,textAlign:'center',cursor:'pointer',border:'1px solid #222'}}>Upload QR<input type="file" accept="image/*" onChange={(e)=>handleBankQrUpload(e.target.files && e.target.files[0])} style={{display:'none'}} /></label>
        </div>
      </div>

      <div style={{marginTop:12,fontSize:12,opacity:0.7}}>Lưu ý: QR upload được lưu localStorage (không an toàn). Để thanh toán thật, tích hợp backend & cổng thanh toán.</div>
    </div>
  </div>);
}

function OrderHistory({orders,admin}) {
  return (<div style={{marginTop:20,background:'#0b0b0b',padding:12,borderRadius:8}}>
    <div style={{fontWeight:700}}>Lịch sử đơn</div>
    <div style={{marginTop:12,display:'grid',gap:8}}>
      {orders.length===0 && <div style={{opacity:0.6}}>Chưa có đơn hàng</div>}
      {orders.map(o=>(<div key={o.id} style={{background:'#111',padding:8,borderRadius:6}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div><div style={{fontWeight:700}}>{o.id} · {o.customer.name}</div><div style={{fontSize:12,opacity:0.7}}>{o.customer.phone} · {new Date(o.createdAt).toLocaleString()}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontWeight:700}}>{o.total.toLocaleString()}₫</div><div style={{fontSize:12,opacity:0.7}}>{o.status}</div></div>
        </div>
        {admin && <div style={{marginTop:8,fontSize:12}}>{o.items.map(item=><div key={item.id}>{item.nickname} · {item.id}</div>)}</div>}
      </div>))}
    </div>
  </div>);
}
