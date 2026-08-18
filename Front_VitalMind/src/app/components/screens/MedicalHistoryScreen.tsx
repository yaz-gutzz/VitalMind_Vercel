import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertCircle,
  Scissors,
  Syringe,
  FileText,
  Pill,
  X,
  Stethoscope,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { useTheme } from "../ThemeContext";
import { apiRequest } from "../../lib/api";

import type {
  MedicalHistoryCategory,
  MedicalHistoryItem,
} from "../../lib/types";

/*
|--------------------------------------------------------------------------
| Configuración de categorías
|--------------------------------------------------------------------------
*/

type SectionMeta = {
  icon: typeof AlertCircle;
  label: string;
  color: string;
  placeholder?: string;
};

const sectionMeta: Record<
  MedicalHistoryCategory,
  SectionMeta
> = {
  diseases: {
    icon: AlertCircle,
    label: "Enfermedades",
    color: "#EF4444",
    placeholder:
      "ej. Hipertensión arterial (2019)",
  },

  allergies: {
    icon: AlertCircle,
    label: "Alergias",
    color: "#F59E0B",
    placeholder:
      "ej. Penicilina – Reacción severa",
  },

  medications: {
    icon: Pill,
    label: "Medicamentos actuales",
    color: "#0F766E",
  },

  surgeries: {
    icon: Scissors,
    label: "Cirugías",
    color: "#8B5CF6",
    placeholder:
      "ej. Apendicectomía (2018)",
  },

  consultations: {
    icon: Stethoscope,
    label: "Consultas médicas",
    color: "#2563EB",
  },

  vaccines: {
    icon: Syringe,
    label: "Vacunas",
    color: "#22C55E",
    placeholder:
      "ej. Influenza – Oct 2024",
  },

  results: {
    icon: FileText,
    label: "Resultados clínicos",
    color: "#EC4899",
    placeholder:
      "ej. Hemograma – Junio 2025 · Normal",
  },
};

const categoryOrder: MedicalHistoryCategory[] = [
  "diseases",
  "allergies",
  "medications",
  "surgeries",
  "consultations",
  "vaccines",
  "results",
];

/*
|--------------------------------------------------------------------------
| Datos reales de medicamentos
|--------------------------------------------------------------------------
*/

type Medication = {
  id: number | string;
  userId?: number | string;
  name: string;
  dose: string;
  frequency: string;
  time?: string;
  taken?: boolean;
  tomado?: boolean;
  type?: string;
};

/*
|--------------------------------------------------------------------------
| Datos reales de citas
|--------------------------------------------------------------------------
*/

type Appointment = {
  id: number | string;
  specialty?: string;
  doctor?: string;
  appointment_date?: string;
  appointment_time?: string;
  place?: string;
  color?: string;
  status?: string;
};

/*
|--------------------------------------------------------------------------
| Pantalla
|--------------------------------------------------------------------------
*/

export function MedicalHistoryScreen() {
  const navigate = useNavigate();
  const { dark } = useTheme();

  const [expanded, setExpanded] =
    useState<MedicalHistoryCategory | null>(
      "diseases",
    );

  const [items, setItems] =
    useState<MedicalHistoryItem[]>([]);

  const [medications, setMedications] =
    useState<Medication[]>([]);

  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [addingFor, setAddingFor] =
    useState<MedicalHistoryCategory | null>(
      null,
    );

  const [newDescription, setNewDescription] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Cargar todo el historial
  |--------------------------------------------------------------------------
  */

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        historyResponse,
        medicationResponse,
        appointmentResponse,
      ] = await Promise.all([
        apiRequest<MedicalHistoryItem[]>(
          "/medical-history",
        ),

        apiRequest<Medication[]>(
          "/medications",
        ),

        apiRequest<Appointment[]>(
          "/appointments",
        ),
      ]);

      setItems(
        Array.isArray(historyResponse)
          ? historyResponse
          : [],
      );

      setMedications(
        Array.isArray(
          medicationResponse,
        )
          ? medicationResponse
          : [],
      );

      setAppointments(
        Array.isArray(
          appointmentResponse,
        )
          ? appointmentResponse
          : [],
      );
    } catch (error) {
      console.error(
        "Medical history load error:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el historial médico",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Agrupar historial
  |--------------------------------------------------------------------------
  */

  const itemsByCategory = useMemo(() => {
    const map =
      new Map<
        MedicalHistoryCategory,
        MedicalHistoryItem[]
      >();

    for (const category of categoryOrder) {
      map.set(category, []);
    }

    for (const item of items) {
      const list =
        map.get(item.category);

      if (list) {
        list.push(item);
      }
    }

    return map;
  }, [items]);

  /*
  |--------------------------------------------------------------------------
  | Abrir módulo oficial
  |--------------------------------------------------------------------------
  */

  const goToOfficialModule = (
    category: MedicalHistoryCategory,
  ) => {
    switch (category) {
      case "medications":
        navigate("/medicamentos");
        break;

      case "consultations":
        navigate("/citas");
        break;

      default:
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Agregar historial
  |--------------------------------------------------------------------------
  */

  const addItem = async () => {
    if (!addingFor) {
      return;
    }

    /*
     * Estas categorías tienen un módulo propio.
     * No se crean desde historial.
     */
    if (
      addingFor ===
        "medications" ||
      addingFor ===
        "consultations"
    ) {
      goToOfficialModule(
        addingFor,
      );
      setAddingFor(null);
      return;
    }

    const description =
      newDescription.trim();

    if (!description) {
      toast.error(
        "Escribe una descripción",
      );
      return;
    }

    if (description.length < 3) {
      toast.error(
        "La descripción es demasiado corta",
      );
      return;
    }

    if (description.length > 500) {
      toast.error(
        "La descripción no puede superar los 500 caracteres",
      );
      return;
    }

    try {
      setSaving(true);

      await apiRequest<MedicalHistoryItem>(
        "/medical-history",
        {
          method: "POST",
          body: JSON.stringify({
            category:
              addingFor,
            description,
          }),
        },
      );

      await loadData();

      toast.success(
        "Registro agregado correctamente",
      );

      setNewDescription("");
      setAddingFor(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo agregar el registro",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Eliminar registro
  |--------------------------------------------------------------------------
  */

  const deleteItem = async (
    id: number,
  ) => {
    try {
      await apiRequest(
        `/medical-history/${id}`,
        {
          method: "DELETE",
        },
      );

      await loadData();

      toast.success(
        "Registro eliminado",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el registro",
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Estadísticas
  |--------------------------------------------------------------------------
  */

  const stats = [
    {
      label: "Enfermedades",
      value:
        itemsByCategory.get(
          "diseases",
        )?.length ?? 0,
      color: "#FCA5A5",
    },

    {
      label: "Medicamentos",
      value:
        medications.length,
      color: "#6EE7B7",
    },

    {
      label: "Vacunas",
      value:
        itemsByCategory.get(
          "vaccines",
        )?.length ?? 0,
      color: "#93C5FD",
    },
  ];

  /*
  |--------------------------------------------------------------------------
  | Tema
  |--------------------------------------------------------------------------
  */

  const pageBg = dark
    ? "#070A12"
    : "#F8FAFC";

  const surface = dark
    ? "#0D1322"
    : "#FFFFFF";

  const border = dark
    ? "rgba(148,163,184,0.14)"
    : "#E2E8F0";

  const title = dark
    ? "#F8FAFC"
    : "#0F172A";

  const body = dark
    ? "#CBD5E1"
    : "#475569";

  const muted = dark
    ? "#94A3B8"
    : "#64748B";

  const inputClass = dark
    ? "w-full rounded-[14px] px-4 py-3.5 text-sm border border-slate-700 focus:outline-none focus:border-[#0F766E] bg-[#090D16] text-slate-100"
    : "w-full rounded-[14px] px-4 py-3.5 text-sm border border-[#E2E8F0] focus:outline-none focus:border-[#0F766E] bg-[#F8FAFC] text-slate-800";

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="h-full overflow-y-auto transition-colors"
      style={{
        backgroundColor: pageBg,
      }}
    >
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}

      <div
        className="px-6 pt-12 pb-8"
        style={{
          background:
            "linear-gradient(140deg, #0D6B64 0%, #0F766E 45%, #1D4ED8 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-white">
              Historial Médico
            </h1>

            <p className="text-white/70 text-sm">
              Tu información de salud completa
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {stats.map(
            (stat) => (
              <div
                key={stat.label}
                className="bg-white/15 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/20"
              >
                <p className="text-2xl font-bold text-white">
                  {stat.value}
                </p>

                <p className="text-white/70 text-xs">
                  {stat.label}
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONTENIDO                                                    */}
      {/* ============================================================ */}

      <div className="px-5 mt-6 space-y-3 pb-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className={`h-20 rounded-[20px] animate-pulse ${
                    dark
                      ? "bg-slate-800/40"
                      : "bg-slate-200/60"
                  }`}
                />
              ),
            )}
          </div>
        )}

        {!loading &&
          categoryOrder.map(
            (category) => {
              const meta =
                sectionMeta[
                  category
                ];

              const Icon =
                meta.icon;

              const isOpen =
                expanded ===
                category;

              const categoryItems =
                itemsByCategory.get(
                  category,
                ) ?? [];

              const isMedications =
                category ===
                "medications";

              const isConsultations =
                category ===
                "consultations";

              const count =
                isMedications
                  ? medications.length
                  : isConsultations
                    ? appointments.length
                    : categoryItems.length;

              return (
                <div
                  key={category}
                  className="rounded-[20px] shadow-sm overflow-hidden"
                  style={{
                    backgroundColor:
                      surface,
                    border: `1px solid ${border}`,
                  }}
                >
                  {/* ------------------------------------------------ */}
                  {/* HEADER DE SECCIÓN                                */}
                  {/* ------------------------------------------------ */}

                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        isOpen
                          ? null
                          : category,
                      )
                    }
                    className="w-full flex items-center gap-3 p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor:
                          `${meta.color}15`,
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{
                          color:
                            meta.color,
                        }}
                      />
                    </div>

                    <span
                      className="flex-1 text-sm font-semibold text-left"
                      style={{
                        color: title,
                      }}
                    >
                      {
                        meta.label
                      }
                    </span>

                    <span
                      className="text-xs font-medium mr-1"
                      style={{
                        color: muted,
                      }}
                    >
                      {count}
                    </span>

                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isOpen
                          ? "rotate-90"
                          : ""
                      }`}
                      style={{
                        color:
                          muted,
                      }}
                    />
                  </button>

                  {/* ------------------------------------------------ */}
                  {/* CONTENIDO                                        */}
                  {/* ------------------------------------------------ */}

                  {isOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className="border-t"
                      style={{
                        borderColor:
                          border,
                      }}
                    >
                      {/* ================================================= */}
                      {/* MEDICAMENTOS                                    */}
                      {/* ================================================= */}

                      {isMedications && (
                        <div className="px-4 py-4">
                          {medications.length ===
                          0 ? (
                            <div className="py-2">
                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    muted,
                                }}
                              >
                                No tienes medicamentos
                                registrados.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    "/medicamentos",
                                  )
                                }
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-[14px] py-3 text-xs font-semibold text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg,#0F766E,#2563EB)",
                                }}
                              >
                                <Pill className="w-4 h-4" />
                                Ir a medicamentos
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {medications
                                  .slice(
                                    0,
                                    5,
                                  )
                                  .map(
                                    (
                                      medication,
                                    ) => {
                                      const taken =
                                        Boolean(
                                          medication.tomado ??
                                            medication.taken,
                                        );

                                      return (
                                        <div
                                          key={
                                            medication.id
                                          }
                                          className={`flex items-center gap-3 rounded-xl p-3 ${
                                            dark
                                              ? "bg-slate-900/60"
                                              : "bg-slate-50"
                                          }`}
                                        >
                                          <div className="w-9 h-9 rounded-xl bg-[#0F766E15] flex items-center justify-center flex-shrink-0">
                                            <Pill className="w-4 h-4 text-[#0F766E]" />
                                          </div>

                                          <div className="flex-1 min-w-0">
                                            <p
                                              className="text-sm font-semibold"
                                              style={{
                                                color:
                                                  title,
                                              }}
                                            >
                                              {
                                                medication.name
                                              }
                                            </p>

                                            <p
                                              className="text-xs mt-0.5"
                                              style={{
                                                color:
                                                  muted,
                                              }}
                                            >
                                              {
                                                medication.dose
                                              }{" "}
                                              ·{" "}
                                              {
                                                medication.frequency
                                              }

                                              {medication.time
                                                ? ` · ${medication.time}`
                                                : ""}
                                            </p>
                                          </div>

                                          <span
                                            className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                                              taken
                                                ? dark
                                                  ? "bg-green-500/10 text-green-300"
                                                  : "bg-green-50 text-green-600"
                                                : dark
                                                  ? "bg-amber-500/10 text-amber-300"
                                                  : "bg-amber-50 text-amber-600"
                                            }`}
                                          >
                                            {taken
                                              ? "Tomado"
                                              : "Pendiente"}
                                          </span>
                                        </div>
                                      );
                                    },
                                  )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    "/medicamentos",
                                  )
                                }
                                className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed rounded-[14px] py-2.5 text-xs font-semibold transition-colors"
                                style={{
                                  borderColor:
                                    dark
                                      ? "#334155"
                                      : "#CBD5E1",
                                  color:
                                    "#0F766E",
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Gestionar medicamentos
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* ================================================= */}
                      {/* CONSULTAS                                       */}
                      {/* ================================================= */}

                      {isConsultations && (
                        <div className="px-4 py-4">
                          {appointments.length ===
                          0 ? (
                            <div className="py-2">
                              <p
                                className="text-xs"
                                style={{
                                  color:
                                    muted,
                                }}
                              >
                                No tienes citas
                                registradas.
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    "/citas",
                                  )
                                }
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-[14px] py-3 text-xs font-semibold text-white"
                                style={{
                                  background:
                                    "linear-gradient(135deg,#2563EB,#0F766E)",
                                }}
                              >
                                <CalendarDays className="w-4 h-4" />
                                Ir a mis citas
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-3">
                                {appointments
                                  .slice(
                                    0,
                                    5,
                                  )
                                  .map(
                                    (
                                      appointment,
                                    ) => (
                                      <div
                                        key={
                                          appointment.id
                                        }
                                        className={`flex items-center gap-3 rounded-xl p-3 ${
                                          dark
                                            ? "bg-slate-900/60"
                                            : "bg-slate-50"
                                        }`}
                                      >
                                        <div className="w-9 h-9 rounded-xl bg-[#2563EB15] flex items-center justify-center flex-shrink-0">
                                          <CalendarDays className="w-4 h-4 text-[#2563EB]" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <p
                                            className="text-sm font-semibold"
                                            style={{
                                              color:
                                                title,
                                            }}
                                          >
                                            {appointment.specialty ||
                                              "Consulta médica"}
                                          </p>

                                          <p
                                            className="text-xs mt-0.5"
                                            style={{
                                              color:
                                                muted,
                                            }}
                                          >
                                            {appointment.doctor ||
                                              "Profesional de salud"}

                                            {appointment.appointment_date
                                              ? ` · ${appointment.appointment_date}`
                                              : ""}

                                            {appointment.appointment_time
                                              ? ` · ${appointment.appointment_time}`
                                              : ""}
                                          </p>

                                          {appointment.place && (
                                            <p
                                              className="text-[10px] mt-1"
                                              style={{
                                                color:
                                                  muted,
                                              }}
                                            >
                                              {
                                                appointment.place
                                              }
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    "/citas",
                                  )
                                }
                                className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed rounded-[14px] py-2.5 text-xs font-semibold"
                                style={{
                                  borderColor:
                                    dark
                                      ? "#334155"
                                      : "#CBD5E1",
                                  color:
                                    "#2563EB",
                                }}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Gestionar citas
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* ================================================= */}
                      {/* DEMÁS CATEGORÍAS                                */}
                      {/* ================================================= */}

                      {!isMedications &&
                        !isConsultations && (
                          <>
                            <div className="px-4 py-3 space-y-2.5">
                              {categoryItems.length ===
                                0 && (
                                <p
                                  className="text-xs italic"
                                  style={{
                                    color:
                                      muted,
                                  }}
                                >
                                  Sin registros
                                  todavía
                                </p>
                              )}

                              {categoryItems.map(
                                (
                                  item,
                                ) => (
                                  <div
                                    key={
                                      item.id
                                    }
                                    className="flex items-center gap-3"
                                  >
                                    <div
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{
                                        backgroundColor:
                                          meta.color,
                                      }}
                                    />

                                    <p
                                      className="text-sm flex-1"
                                      style={{
                                        color:
                                          body,
                                      }}
                                    >
                                      {
                                        item.description
                                      }
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteItem(
                                          item.id,
                                        )
                                      }
                                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                        dark
                                          ? "hover:bg-red-500/10"
                                          : "hover:bg-red-50"
                                      }`}
                                      aria-label="Eliminar registro"
                                    >
                                      <X
                                        className="w-3.5 h-3.5"
                                        style={{
                                          color:
                                            dark
                                              ? "#64748B"
                                              : "#CBD5E1",
                                        }}
                                      />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>

                            <div className="px-4 pb-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingFor(
                                    category,
                                  );
                                  setNewDescription(
                                    "",
                                  );
                                }}
                                className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-[14px] py-2.5 text-xs font-medium transition-colors ${
                                  dark
                                    ? "border-slate-700 text-slate-400 hover:border-[#0F766E] hover:text-[#8BE9D6]"
                                    : "border-[#E2E8F0] text-slate-400 hover:border-[#0F766E] hover:text-[#0F766E]"
                                }`}
                              >
                                <Plus className="w-4 h-4" />
                                Agregar{" "}
                                {meta.label.toLowerCase()}
                              </button>
                            </div>
                          </>
                        )}
                    </motion.div>
                  )}
                </div>
              );
            },
          )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DE REGISTRO                                             */}
      {/* ============================================================ */}

      {addingFor && (
        <div
          className="fixed inset-0 z-50 flex items-end"
          style={{
            backgroundColor:
              "rgba(0,0,0,0.5)",
          }}
          onClick={() =>
            !saving &&
            setAddingFor(null)
          }
        >
          <motion.div
            initial={{
              y: "100%",
            }}
            animate={{
              y: 0,
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="w-full max-w-2xl mx-auto rounded-t-[32px] p-6"
            style={{
              backgroundColor:
                surface,
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-lg font-bold"
                style={{
                  color:
                    title,
                }}
              >
                Agregar{" "}
                {sectionMeta[
                  addingFor
                ].label.toLowerCase()}
              </h3>

              <button
                type="button"
                onClick={() =>
                  !saving &&
                  setAddingFor(null)
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  dark
                    ? "bg-slate-800"
                    : "bg-slate-50"
                }`}
              >
                <X
                  className="w-4 h-4"
                  style={{
                    color:
                      muted,
                  }}
                />
              </button>
            </div>

            <label
              className="text-xs font-medium mb-1 block"
              style={{
                color:
                  muted,
              }}
            >
              Descripción
            </label>

            <input
              type="text"
              autoFocus
              maxLength={500}
              placeholder={
                sectionMeta[
                  addingFor
                ].placeholder ||
                "Escribe una descripción"
              }
              value={
                newDescription
              }
              onChange={(event) =>
                setNewDescription(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  addItem();
                }
              }}
              className={
                inputClass
              }
            />

            <p
              className="text-[10px] mt-1"
              style={{
                color:
                  muted,
              }}
            >
              {newDescription.length}/500
            </p>

            <button
              type="button"
              onClick={addItem}
              disabled={
                saving ||
                newDescription.trim()
                  .length < 3
              }
              className="w-full mt-5 py-4 rounded-[20px] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              style={{
                background:
                  "linear-gradient(135deg, #0F766E 0%, #2563EB 100%)",
                boxShadow:
                  "0 8px 24px rgba(15,118,110,0.3)",
              }}
            >
              <Plus className="w-[18px] h-[18px]" />

              {saving
                ? "Guardando..."
                : "Agregar registro"}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}