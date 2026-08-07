import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Save } from "lucide-react";
import { apiRequest } from "../../lib/api";
import { toast } from "sonner";
import { useTheme } from "../ThemeContext";

export function EditMedicationScreen() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("pastilla");
  const [daysDuration, setDaysDuration] = useState<number>(0);


  const bg = dark ? "#0F172A" : "#F8FAFC";
  const card = dark ? "#1E293B" : "#FFFFFF";
  const border = dark ? "rgba(255,255,255,.08)" : "#E2E8F0";
  const text = dark ? "#F8FAFC" : "#0F172A";
  const muted = dark ? "#94A3B8" : "#64748B";
  const inputBg = dark ? "rgba(255,255,255,.05)" : "#F8FAFC";

  useEffect(() => {

    if (!id) return;

    apiRequest<any>(`/medications/${id}`)
      .then((med) => {

        setName(med.name);
        setDose(med.dose);
        setFrequency(med.frequency);
        setTime(med.time);
        setType(med.type);
        setDaysDuration(med.days_duration);

      })
      .catch(() => toast.error("No se pudo cargar el medicamento"))
      .finally(() => setLoading(false));

  }, [id]);

  const saveMedication = () => {

    apiRequest(`/medications/${id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name,
        dose,
        frequency,
        time_label: time,
        type,
        days_duration: daysDuration
      })
    })
      .then(() => {

        toast.success("Medicamento actualizado");
        navigate(`/medicamentos/${id}`);

      })
      .catch(() => {

        toast.error("No se pudo actualizar");

      });

  };

  if (loading) {

    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: bg, color: text }}
      >
        Cargando...
      </div>
    );

  }

  return (

    <div
      className="min-h-screen"
      style={{ backgroundColor: bg }}
    >

      {/* Header */}

      <div
        className="px-5 pt-12 pb-8"
        style={{
          background:
            "linear-gradient(135deg,#0F766E 0%,#2563EB 100%)"
        }}
      >

        <div className="flex items-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ChevronLeft className="text-white" />
          </button>

          <h1 className="text-2xl font-bold text-white">
            Editar medicamento
          </h1>

        </div>

      </div>

      <div className="p-5 space-y-5">

        <div
          className="rounded-[22px] p-5 border space-y-4"
          style={{
            backgroundColor: card,
            borderColor: border
          }}
        >

          <div>

            <label
              className="text-sm mb-1 block"
              style={{ color: muted }}
            >
              Nombre
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              style={{
                backgroundColor: inputBg,
                borderColor: border,
                color: text
              }}
            />

          </div>

          <div>

            <label
              className="text-sm mb-1 block"
              style={{ color: muted }}
            >
              Dosis
            </label>

            <input
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              style={{
                backgroundColor: inputBg,
                borderColor: border,
                color: text
              }}
            />

          </div>

          <div>

            <label
              className="text-sm mb-1 block"
              style={{ color: muted }}
            >
              Hora
            </label>

            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              style={{
                backgroundColor: inputBg,
                borderColor: border,
                color: text
              }}
            />

          </div>

          <div>

            <label
              className="text-sm mb-1 block"
              style={{ color: muted }}
            >
              Frecuencia
            </label>

            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              style={{
                backgroundColor: inputBg,
                borderColor: border,
                color: text
              }}
            >
              <option value="Diario">Diario</option>
              <option value="Cada 8 horas">Cada 8 horas</option>
              <option value="Cada 12 horas">Cada 12 horas</option>
              <option value="Cada 24 horas">Cada 24 horas</option>
              <option value="Semanal">Semanal</option>
              <option value="Solo cuando sea necesario">
                Solo cuando sea necesario
              </option>
            </select>

          </div>
          <div>

            <label
            className="text-sm mb-1 block"
            style={{ color: muted }}
            >
            Duración del tratamiento (días)
            </label>


            <input

            type="number"

            min="1"

            value={daysDuration}

            onChange={(e)=>setDaysDuration(Number(e.target.value))}

            className="w-full rounded-xl border px-4 py-3"

            style={{
            backgroundColor: inputBg,
            borderColor:border,
            color:text
            }}

            />

            </div>

          <div>

            <label
              className="text-sm mb-1 block"
              style={{ color: muted }}
            >
              Presentación
            </label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border px-4 py-3"
              style={{
                backgroundColor: inputBg,
                borderColor: border,
                color: text
              }}
            >
              <option value="pastilla">Pastilla</option>
              <option value="tableta">Tableta</option>
              <option value="capsula">Cápsula</option>
              <option value="jarabe">Jarabe</option>
              <option value="inyeccion">Inyección</option>
              <option value="gota">Gotas</option>
              <option value="crema">Crema</option>
              <option value="parche">Parche</option>
            </select>

          </div>

        </div>

        <button
          onClick={saveMedication}
          className="w-full py-4 rounded-[18px] text-white font-semibold flex items-center justify-center gap-2"
          style={{
            background:
              "linear-gradient(135deg,#0F766E 0%,#2563EB 100%)"
          }}
        >
          <Save size={18} />
          Guardar cambios
        </button>

      </div>

    </div>

  );

}