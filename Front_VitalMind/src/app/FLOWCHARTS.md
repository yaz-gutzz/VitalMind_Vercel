# 📊 Flowcharts de MedAlert+

Documentación visual de los flujos principales de navegación y funcionalidad de la aplicación MedAlert+.

---

## 🔵 FLOW 1: Inicio de la App
**Flujo de Onboarding → Autenticación**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1️⃣  ONBOARDING - BIENVENIDA                                      │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━                                      │
│     💙 Bienvenido a MedAlert+                                      │
│     • Presentación de la app                                        │
│     • Beneficios principales                                        │
│     • Características destacadas                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  2️⃣  ONBOARDING - RECORDATORIOS                                   │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                   │
│     🔔 Sistema de alertas inteligentes                             │
│     • Notificaciones precisas                                       │
│     • Horarios personalizados                                       │
│     • Confirmación de tomas                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  3️⃣  ONBOARDING - PRIVACIDAD                                      │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━                                      │
│     🛡️  Seguridad de datos garantizada                             │
│     • Encriptación de extremo a extremo                             │
│     • Protección de información médica                              │
│     • Control total de tus datos                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  4️⃣  LOGIN / REGISTER                                             │
│     ━━━━━━━━━━━━━━━━━━━━                                          │
│     🔐 Autenticación unificada (Tabs)                              │
│     • Email y contraseña                                            │
│     • Tabs integrados (Login/Register)                              │
│     • Recuperación de contraseña                                    │
│     • Acceso rápido                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                        ✅ ACCESO A LA APP

```

---

## 🔴 FLOW 2: Registro de Usuario
**Creación de cuenta nueva**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1️⃣  DATOS PERSONALES                                             │
│     ━━━━━━━━━━━━━━━━━                                             │
│     👤 Información básica del usuario                              │
│     • Nombre completo                                               │
│     • Correo electrónico                                            │
│     • Foto de perfil (opcional)                                     │
│     • Número de teléfono                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  2️⃣  CONTRASEÑA Y SEGURIDAD                                       │
│     ━━━━━━━━━━━━━━━━━━━━━━━━                                       │
│     🔒 Seguridad de la cuenta                                      │
│     • Mínimo 8 caracteres                                           │
│     • Al menos una mayúscula                                        │
│     • Al menos un número                                            │
│     • Confirmación de contraseña                                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  3️⃣  PERFIL MÉDICO                                                │
│     ━━━━━━━━━━━━━━                                                 │
│     🩺 Datos de salud (opcional pero recomendado)                  │
│     • Alergias medicamentosas                                       │
│     • Condiciones médicas                                           │
│     • Contactos de emergencia                                       │
│     • Médico de cabecera                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  4️⃣  CONFIRMACIÓN                                                 │
│     ━━━━━━━━━━━━━                                                  │
│     ✅ Cuenta creada exitosamente                                   │
│     • Email verificado                                              │
│     • Perfil completo                                               │
│     • Listo para usar la app                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                        🎉 BIENVENIDO A MEDALERT+

```

---

## 🟢 FLOW 3: Gestión de Medicamentos
**Agregar y configurar medicamentos**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1️⃣  DASHBOARD (PANTALLA PRINCIPAL)                               │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                                 │
│     🏠 Vista general de medicamentos                               │
│     • Medicamentos de hoy                                           │
│     • Próximas tomas                                                │
│     • Estadísticas de adherencia                                    │
│     • Acciones rápidas                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  2️⃣  AGREGAR MEDICAMENTO                                          │
│     ━━━━━━━━━━━━━━━━━━━━━                                          │
│     ✨ Nueva entrada de medicamento                                │
│     • Nombre del medicamento                                        │
│     • Dosis y forma farmacéutica                                    │
│     • Frecuencia de toma                                            │
│     • Hora específica                                               │
│     • Stock inicial                                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  3️⃣  CONFIGURAR ALERTAS                                           │
│     ━━━━━━━━━━━━━━━━━━━━                                           │
│     🔔 Recordatorios personalizados                                │
│     • Frecuencia (diaria, semanal, mensual)                         │
│     • Horarios específicos                                          │
│     • Duración del tratamiento                                      │
│     • Tipo de notificación                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  4️⃣  SEGUIMIENTO Y ADHERENCIA                                     │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━                                      │
│     📊 Historial y reportes                                        │
│     • Gráficos de adherencia                                        │
│     • Reportes mensuales                                            │
│     • Historial de tomas                                            │
│     • Análisis de cumplimiento                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                        📈 SALUD BAJO CONTROL

```

---

## 🟡 FLOW 4: Funciones Premium
**Características avanzadas (Requieren suscripción Premium)**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  1️⃣  CITAS MÉDICAS 👑 PREMIUM                                     │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━                                      │
│     📅 Gestión completa de citas                                   │
│     • Agendar consultas y laboratorios                              │
│     • Recordatorios de citas                                        │
│     • Historial de consultas                                        │
│     • Notas del médico                                              │
│     • Resultados de análisis                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  2️⃣  CUIDADORES Y FAMILIA 👑 PREMIUM                              │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                               │
│     👨‍👩‍👧‍👦 Compartir información con cuidadores                       │
│     • Invitar a familiares                                          │
│     • Permisos personalizados                                       │
│     • Notificaciones compartidas                                    │
│     • Comunicación en tiempo real                                   │
│     • Seguimiento coordinado                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  3️⃣  DETECTOR DE INTERACCIONES 👑 PREMIUM                         │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            │
│     ⚠️  Prevención de interacciones medicamentosas                 │
│     • Alertas de interacciones peligrosas                           │
│     • Prevención de efectos adversos                                │
│     • Análisis de compatibilidad                                    │
│     • Base de datos actualizada                                     │
│     • Sugerencias alternativas                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  4️⃣  INTEGRACIÓN ALEXA                                            │
│     ━━━━━━━━━━━━━━━━━━━━                                           │
│     🎤 Control por voz con Alexa                                   │
│     • Comandos de voz                                               │
│     • Consultas sobre medicamentos                                  │
│     • Confirmación de tomas                                         │
│     • Recordatorios por voz                                         │
│     • Consultas de stock                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                ↓
                        🌟 EXPERIENCIA PREMIUM COMPLETA

```

---

## 📱 Pantallas Principales

### Navegación Principal (Tab Bar)
1. **🏠 Home** - Dashboard con medicamentos de hoy
2. **🔔 Calendario** - Recordatorios y horarios
3. **📊 Actividad** - Historial y estadísticas
4. **💬 Chat** - Asistente médico (ChatBot)
5. **⚙️ Configuración** - Perfil y ajustes

### Pantallas Secundarias
- **👤 Perfil Médico** - Información de salud
- **📅 Citas Médicas** 👑 - Gestión de citas
- **👨‍👩‍👧‍👦 Cuidadores** 👑 - Compartir con familia
- **🎤 Alexa** - Integración con Alexa
- **🔐 Privacidad** - Seguridad y datos
- **📄 Términos** - Términos de uso
- **❓ Ayuda** - Soporte y FAQ

---

## 🎯 Arquitectura de Navegación

```
                        ONBOARDING (Permanente)
                                 ↓
                         LOGIN / REGISTER
                                 ↓
                    ┌────────────────────────┐
                    │   PANTALLA PRINCIPAL   │
                    │        (HOME)          │
                    └───────────┬────────────┘
                                ↓
        ┌──────────┬────────────┼────────────┬──────────┐
        ↓          ↓            ↓            ↓          ↓
     HOME      CALENDARIO   ACTIVIDAD     CHAT    CONFIGURACIÓN
        │          │            │            │          │
        │          │            │            │          ├─→ Perfil Médico
        │          │            │            │          ├─→ Citas 👑
        │          │            │            │          ├─→ Cuidadores 👑
        │          │            │            │          ├─→ Alexa
        │          │            │            │          ├─→ Flowcharts
        │          │            │            │          ├─→ Privacidad
        │          │            │            │          ├─→ Términos
        │          │            │            │          ├─→ Ayuda
        │          │            │            │          └─→ Cerrar sesión
        │          │            │            │
        └──────────┴────────────┴────────────┘
                                │
                    FUNCIONES COMPARTIDAS:
                    • Agregar medicamento
                    • Editar perfil
                    • Notificaciones
                    • Reportes
                    • Detector interacciones 👑

```

---

## 📊 Resumen de Funcionalidades

### ✅ Funciones Básicas (Gratis)
- ✓ Onboarding completo
- ✓ Login/Register unificado
- ✓ Dashboard de medicamentos
- ✓ Recordatorios inteligentes
- ✓ Historial de tomas
- ✓ Gráficos de adherencia
- ✓ Gestión de stock
- ✓ Reportes básicos
- ✓ Chatbot asistente
- ✓ Modo oscuro
- ✓ Perfil médico

### 👑 Funciones Premium
- 👑 Citas médicas completas
- 👑 Compartir con cuidadores
- 👑 Detector de interacciones
- 👑 Reportes avanzados
- 👑 Soporte prioritario

### 🎤 Integración Alexa (Gratis)
- ✓ Comandos de voz
- ✓ Consultas sobre medicamentos
- ✓ Confirmación de tomas
- ✓ Control por voz

---

## 🎨 Sistema de Diseño

### Colores Principales
- **Primario (Azul Médico)**: `#0066cc`
- **Secundario (Verde Esmeralda)**: `#10b981`
- **Acento**: Naranja y amarillo para Premium
- **Destructivo**: Rojo para alertas

### Responsive
- Optimizado para móviles: `max-width: 375px`
- Diseño vertical (portrait)
- Navegación fluida entre pantallas
- Transiciones suaves con Motion

---

## 📈 Estadísticas de la App

| Métrica | Valor |
|---------|-------|
| **Flujos principales** | 4 |
| **Pantallas totales** | 16+ |
| **Funciones Premium** | 3 |
| **Pantallas principales** | 5 |
| **Pantallas secundarias** | 8 |
| **Modales/Diálogos** | 6 |

---

## 🚀 Mejoras Recientes

### ✅ Completado
1. **OnboardingFlow permanente** - Siempre se muestra al inicio
2. **Login/Register unificado** - Tabs en una sola pantalla
3. **Imágenes en onboarding** - Espacios para imágenes optimizadas
4. **Reducción de pasos** - Solo pasos importantes para el paciente
5. **Eliminación modo viaje** - Simplificación de funciones
6. **Reporte básico** - Sin restricción Premium
7. **Funciones Premium marcadas** - Citas, cuidadores, interacciones
8. **Perfil con foto** - Funcionalidad completa de foto de perfil
9. **Estadísticas visuales** - Stats personales en configuración
10. **Mejoras en diseño** - Pantallas médicas y profesionales
11. **Logout mejorado** - Diálogo limpio e intuitivo
12. **Recuperación contraseña** - Modal completamente profesional

---

*Última actualización: Diciembre 2025*
*Versión: 2.5.0*
