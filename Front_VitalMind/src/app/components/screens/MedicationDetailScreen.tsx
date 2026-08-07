import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api";
import { ArrowLeft, Pill, Clock, Calendar, Edit, Trash2, Pause } from "lucide-react";import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

export function MedicationDetailScreen() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [medication, setMedication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{date:string; taken:number; missed:number;}[]>([]);

  const presentationMap = {
    pastilla: "Pastilla",
    tableta: "Tableta",
    capsula: "Cápsula",
    jarabe: "Jarabe",
    inyeccion: "Inyección",
    gota: "Gotas",
    crema: "Crema",
    parche: "Parche",
  };

useEffect(() => {
  if (!id) return;
  const loadData = async () => {
    try {
      const medicationData = await apiRequest<any>(
        `/medications/${id}`
      );
      setMedication(medicationData);
      const historyData = await apiRequest<Array<{
        date: string;
        taken: number | string;
        missed: number | string;
      }>>(
        `/medications/${id}/history`
      );
      setHistory(
        historyData.map((item) => ({
          date: item.date,
          taken: Number(item.taken),
          missed: Number(item.missed)
        }))
      );
    } catch(error) {
      toast.error("No se pudo cargar la información");
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, [id]);


  const handlePause = () => {
    toast.success("Medicamento pausado");
  };


  const handleDelete = () => {

    if(confirm("¿Eliminar medicamento?")){

      apiRequest(`/medications/${id}`, {
        method:"DELETE"
      })
      .then(()=>{

        toast.success("Medicamento eliminado");
        navigate("/medicamentos");

      })
      .catch(()=>{
        toast.error("No se pudo eliminar");
      });

    }

  };


  if(loading){

    return(
      <div className="h-full flex items-center justify-center">
        Cargando medicamento...
      </div>
    );

  }


  if(!medication){

    return(
      <div className="h-full flex items-center justify-center">
        Medicamento no encontrado
      </div>
    );

  }


  return (

<div className="h-full bg-background flex flex-col">


{/* HEADER */}

<div
className="px-6 pt-12 pb-8"
style={{
background:`linear-gradient(135deg, ${medication.color} 0%, ${medication.color}CC 100%)`
}}
>


<div className="flex items-center gap-4 mb-6">


<button
onClick={()=>navigate("/medicamentos")}
className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
>
<ArrowLeft className="text-white"/>
</button>


<h1 className="text-2xl font-bold text-white flex-1">
{medication.name}
</h1>


<button
onClick={()=>navigate(`/medicamentos/${id}/edit`)}
className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
>
<Edit className="text-white"/>
</button>


</div>



<div className="bg-white/10 rounded-[24px] p-5">


<div className="grid grid-cols-2 gap-4">


<div>
<p className="text-white/70 text-sm">
Dosis
</p>

<p className="text-white font-semibold text-lg">
{medication.dose}
</p>
</div>



<div>

<p className="text-white/70 text-sm">
Presentación
</p>

<p className="text-white font-semibold text-lg">
{
presentationMap[
medication.type as keyof typeof presentationMap
]
}
</p>

</div>




<div>

<p className="text-white/70 text-sm">
Frecuencia
</p>

<p className="text-white font-semibold text-lg">
{medication.frequency}
</p>

</div>




<div>

<p className="text-white/70 text-sm">
Hora
</p>

<p className="text-white font-semibold text-lg">
{medication.time}
</p>

</div>

<div>

<p className="text-white/70 text-sm">
Duración
</p>

<p className="text-white font-semibold text-lg">
{medication.days_duration} días
</p>

</div>

</div>


</div>


</div>





{/* CONTENIDO */}


<div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">



<div>


<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">

<Clock className="text-primary"/>

Horario

</h2>



<div className="bg-card border rounded-[16px] px-4 py-3 flex justify-between">


<span>
{medication.time}
</span>


<span>
{medication.dose}
</span>


</div>


</div>





<div>


<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">

<Pill className="text-primary"/>

Información

</h2>



<p className="bg-card border rounded-[16px] p-4">

Medicamento tipo {
presentationMap[
medication.type as keyof typeof presentationMap
]
}.
Frecuencia programada:
{medication.frequency}
</p>
</div>
<div>
<h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
<Calendar className="text-primary"/>
Adherencia (7 días)
</h2>
<div className="bg-card border rounded-[16px] p-4">
<div className="h-40">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={history}>
<XAxis dataKey="date"/>
<YAxis/>
<Tooltip/>
<Line
dataKey="taken"
stroke="#0F766E"
name="Tomados"
/>
<Line
dataKey="missed"
stroke="#EF4444"
name="Omitidos"
/>
</LineChart>
</ResponsiveContainer>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-3">
<button
onClick={handlePause}
className="border rounded-[16px] py-4 flex justify-center gap-2"
>
<Pause/>
Pausar
</button>
<button
onClick={handleDelete}
className="border rounded-[16px] py-4 flex justify-center gap-2 text-red-500"
>
<Trash2/>
Eliminar
</button>
</div>
</div>
</div>
  );
}