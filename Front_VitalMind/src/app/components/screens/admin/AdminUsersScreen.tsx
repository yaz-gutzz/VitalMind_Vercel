import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  Search, CheckCircle, XCircle, Clock, UserCheck, UserX, ChevronLeft, Trash2, Send,
  Mail, Shield, Sun, Moon,
} from "lucide-react";
import { useAdminTheme } from "../../admin/AdminThemeContext";
import { toast } from "sonner";
import { apiRequest } from "../../../lib/api";
import { useEffect } from "react";

type Status = "active" | "inactive" | "pending";

interface AppUser {
  id: number;
  name: string;
  email: string;
  age: number;
  joined: string;
  lastActive: string;
  status: Status;
  registros: number;
  consultas: number;
  color: string;
}



const statusCfg: Record<Status, { label: string; color: string; icon: typeof CheckCircle }> = {
  active: { label: "Activo", color: "#22C55E", icon: CheckCircle },
  inactive: { label: "Inactivo", color: "#64748B", icon: XCircle },
  pending: { label: "Pendiente", color: "#F59E0B", icon: Clock },
};

const filters: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "inactive", label: "Inactivos" },
  { key: "pending", label: "Pendientes" },
];

export function AdminUsersScreen() {
  const navigate = useNavigate();
  const { dark, toggle } = useAdminTheme();
  const [users,setUsers] = useState<AppUser[]>([]);  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);

  const bg = dark ? "#070A12" : "#F1F5F9";
  const card = dark ? "#0D1322" : "#FFFFFF";
  const border = dark ? "rgba(148,163,184,0.14)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#9CA3AF" : "#64748B";
  const inputBg = dark ? "#0B1120" : "#F8FAFC";
  const accent = "#14B8A6";

  const filtered = users.filter((u) => {
    const s = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const f = filter === "all" || u.status === filter;
    return s && f;
  });

  useEffect(()=>{

  loadUsers();

  },[]);



  async function loadUsers(){

  try{

  const data = await apiRequest(
  "/admin/users"
  );


  setUsers(data);


  }catch(error){

  toast.error(
  "Error cargando usuarios"
  );

  }

  }

  const toggleStatus = async(user: AppUser)=>{
  try{
  const nextStatus = user.status==="active"? "inactive": "active";

  await apiRequest(`/admin/users/${user.id}/status`,{method:"PATCH",body:JSON.stringify({status:nextStatus})});

  setUsers(us =>us.map(u =>u.id===user.id?{...u,status:nextStatus}:u));

  if(selected){
  setSelected({...selected,status:nextStatus});
  }

  toast.success(`${user.name} ${nextStatus==="active"?"activado":"desactivado"}`);
  }catch(error){toast.error("Error actualizando usuario");
  }};


  const approveUser = async(user:AppUser)=>{

  try{
  await apiRequest(`/admin/users/${user.id}/status`,{method:"PATCH",body:JSON.stringify({status:"active"})});

  setUsers(us =>us.map(u =>u.id===user.id?{...u,status:"active"}:u));
  if(selected){setSelected({...selected,status:"active"});
  }
  toast.success(`${user.name} aprobado`);

  }catch{toast.error("No se pudo aprobar");
  }};

  const deleteUser = (user: AppUser) => {
    setUsers((us) => us.filter((u) => u.id !== user.id));
    setSelected(null);
    setDeleteConfirm(false);
    toast.success(`Usuario ${user.name} eliminado`);
  };

  const sendNotification = async (user: AppUser) => {
    setSendingMsg(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSendingMsg(false);
    toast.success(`Notificación enviada a ${user.name}`);
  };

  const sendResetEmail = (user: AppUser) => {
    toast.promise(new Promise((r) => setTimeout(r, 1200)), {
      loading: `Enviando email a ${user.email}...`,
      success: "Email de recuperación enviado",
      error: "Error al enviar",
    });
  };

  if (selected) {
    const cfg = statusCfg[selected.status];
    const Icon = cfg.icon;
    return (
      <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
        <div className="mx-auto max-w-[1200px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { setSelected(null); setDeleteConfirm(false); }} className="flex items-center gap-2" style={{ color: muted }}>
              <ChevronLeft size={18} /> <span className="text-sm">Usuarios</span>
            </button>
            <button onClick={toggle}>
              {dark ? <Sun size={16} style={{ color: "#F59E0B" }} /> : <Moon size={16} style={{ color: "#6366F1" }} />}
            </button>
          </div>

          {/* Avatar + info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: selected.color + "25" }}>
              <span className="text-xl font-bold" style={{ color: selected.color }}>
                {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: text }}>{selected.name}</h2>
              <p className="text-sm" style={{ color: muted }}>{selected.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Icon size={13} style={{ color: cfg.color }} />
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {[
              { label: "Edad", value: `${selected.age} años` },
              { label: "Registros", value: String(selected.registros) },
              { label: "Consultas IA", value: String(selected.consultas) },
              { label: "Registrado", value: selected.joined },
              { label: "Última actividad", value: selected.lastActive },
              { label: "Bienestar", value: "78 pts" },
            ].map((item) => (
              <div key={item.label} className="rounded-[16px] p-4 border" style={{ backgroundColor: card, borderColor: border }}>
                <p className="text-[10px] mb-0.5" style={{ color: muted }}>{item.label}</p>
                <p className="text-sm font-bold" style={{ color: text }}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: muted }}>Acciones</p>

            {selected.status === "pending" && (
              <button
                onClick={() => approveUser(selected)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "#22C55E20", border: "1px solid #22C55E40", color: "#22C55E" }}
              >
                <Shield size={18} /> Aprobar cuenta
              </button>
            )}

            <button
              onClick={() => toggleStatus(selected)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-semibold text-sm transition-all active:scale-95"
              style={selected.status === "active"
                ? { backgroundColor: "#EF444420", border: "1px solid #EF444440", color: "#EF4444" }
                : { backgroundColor: "#22C55E20", border: "1px solid #22C55E40", color: "#22C55E" }
              }
            >
              {selected.status === "active" ? <><UserX size={18} /> Desactivar cuenta</> : <><UserCheck size={18} /> Activar cuenta</>}
            </button>

            <button
              onClick={() => sendNotification(selected)}
              disabled={sendingMsg}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-semibold text-sm transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: "#2563EB20", border: "1px solid #2563EB40", color: "#2563EB" }}
            >
              <Send size={18} /> {sendingMsg ? "Enviando..." : "Enviar notificación push"}
            </button>

            <button
              onClick={() => sendResetEmail(selected)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-semibold text-sm transition-all active:scale-95"
              style={{ backgroundColor: card, border: `1px solid ${border}`, color: text }}
            >
              <Mail size={18} /> Enviar email de recuperación
            </button>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-semibold text-sm transition-all active:scale-95"
                style={{ backgroundColor: "#EF444415", border: "1px solid #EF444430", color: "#EF4444" }}
              >
                <Trash2 size={18} /> Eliminar usuario
              </button>
            ) : (
              <div className="rounded-[18px] p-4 border" style={{ backgroundColor: "#EF444410", borderColor: "#EF444440" }}>
                <p className="text-sm font-semibold text-center text-[#EF4444] mb-3">¿Confirmar eliminación de {selected.name}?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-[14px] text-sm font-semibold"
                    style={{ backgroundColor: card, color: muted, border: `1px solid ${border}` }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => deleteUser(selected)}
                    className="flex-1 py-2.5 rounded-[14px] text-sm font-bold text-white"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    Sí, eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-full overflow-y-auto" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 pt-8 lg:pt-10 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-1" style={{ color: muted }}>
            <ChevronLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold" style={{ color: text }}>Usuarios</h1>
            <p className="text-xs" style={{ color: muted }}>{users.length} registrados · {users.filter((u) => u.status === "active").length} activos</p>
          </div>
          <button onClick={toggle}>
            {dark ? <Sun size={16} style={{ color: "#F59E0B" }} /> : <Moon size={16} style={{ color: "#6366F1" }} />}
          </button>
        </div>

        <div className="relative mb-4 max-w-xl">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: muted }} />
          <input
            type="text" placeholder="Buscar usuario..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[14px] pl-11 pr-4 py-3 text-sm focus:outline-none"
            style={{ backgroundColor: inputBg, border: `1px solid ${border}`, color: text }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={filter === f.key
                ? { backgroundColor: "#0F766E", color: "#fff" }
                : { backgroundColor: inputBg, color: muted, border: `1px solid ${border}` }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 lg:px-8 xl:px-10 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-3 lg:gap-4 pb-24 lg:pb-10">
        {filtered.map((user, i) => {
          const cfg = statusCfg[user.status];
          const Icon = cfg.icon;
          return (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(user)}
              className="w-full rounded-[20px] p-4 flex items-center gap-3 border text-left active:scale-98 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: card, borderColor: border }}
            >
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: user.color + "25" }}>
                <span className="text-sm font-bold" style={{ color: user.color }}>
                  {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: text }}>{user.name}</p>
                <p className="text-xs truncate" style={{ color: muted }}>{user.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Icon size={11} style={{ color: cfg.color }} />
                  <span className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="text-[10px] ml-1" style={{ color: muted }}>· {user.lastActive}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-medium" style={{ color: muted }}>{user.registros} reg.</p>
                <p className="text-[10px]" style={{ color: muted }}>{user.consultas} IA</p>
              </div>
            </motion.button>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 lg:col-span-2 2xl:col-span-3" style={{ color: muted }}>
            <Search size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Sin resultados para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
