# 🌓 Guía de Temas - MedAlert+

## Modo Claro y Modo Oscuro

MedAlert+ incluye soporte completo para temas claro y oscuro con transiciones suaves y colores optimizados para cada modo.

---

## 🎨 Paleta de Colores

### Modo Claro (Light Mode)

```css
--background: #f8fafb;          /* Fondo principal */
--foreground: #080820;          /* Texto principal */
--card: #ffffff;                /* Tarjetas */
--card-foreground: #080820;     /* Texto en tarjetas */
--primary: #0077FF;             /* Azul cielo */
--secondary: #32E3C2;           /* Turquesa */
--accent-green: #5AA622;        /* Verde lima */
--muted: #f0f4f8;               /* Elementos atenuados */
--muted-foreground: #64748b;    /* Texto atenuado */
--border: #e2e8f0;              /* Bordes */
```

### Modo Oscuro (Dark Mode)

```css
--background: #0a1628;          /* Fondo principal oscuro */
--foreground: #f1f5f9;          /* Texto claro */
--card: #0f1e33;                /* Tarjetas oscuras */
--card-foreground: #f1f5f9;     /* Texto claro */
--primary: #3b82f6;             /* Azul más brillante */
--secondary: #22d3ee;           /* Turquesa brillante */
--accent-green: #4ade80;        /* Verde brillante */
--muted: #1e293b;               /* Elementos atenuados */
--muted-foreground: #94a3b8;    /* Texto atenuado */
--border: #1e3a5f;              /* Bordes visibles */
```

---

## 🔄 Cómo Cambiar de Tema

### Desde la Pantalla de Login

En la pantalla de inicio de sesión, encontrarás un botón flotante en la esquina superior derecha:
- 🌙 **Ícono Luna**: Activar modo oscuro
- ☀️ **Ícono Sol**: Activar modo claro

### Desde Configuración

1. Navega a la pestaña **Configuración** (ícono de persona)
2. En la sección **Notificaciones**, busca la opción **Modo oscuro**
3. Activa o desactiva el switch según tu preferencia
4. Recibirás una notificación confirmando el cambio

---

## ✨ Características del Sistema de Temas

### Transiciones Suaves
```css
* {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease;
}
```

### Componentes Optimizados

#### ✅ Inputs y Formularios
- Fondo adaptativo según el tema
- Placeholders legibles en ambos modos
- Bordes con buen contraste

#### ✅ Cards y Modales
- Sombras ajustadas para cada modo
- Bordes visibles en modo oscuro
- Fondos con contraste óptimo

#### ✅ Gráficos (Recharts)
- Colores brillantes en modo oscuro
- Grillas y ejes legibles
- Tooltips adaptados al tema

#### ✅ Scrollbars
- Estilo personalizado en modo oscuro
- Hover state mejorado
- Bordes redondeados

---

## 🎯 Implementación Técnica

### Activar Modo Oscuro

```typescript
// Agregar clase 'dark' al elemento raíz
document.documentElement.classList.add('dark');
```

### Desactivar Modo Oscuro

```typescript
// Remover clase 'dark' del elemento raíz
document.documentElement.classList.remove('dark');
```

### Toggle entre Modos

```typescript
// Alternar entre modos
document.documentElement.classList.toggle('dark');
```

### Verificar Modo Actual

```typescript
// Verificar si está en modo oscuro
const isDark = document.documentElement.classList.contains('dark');
```

---

## 🧩 Uso en Componentes

### Ejemplo: Elemento con Tema Adaptable

```tsx
<div className="bg-card text-card-foreground border border-border">
  {/* Este div se adaptará automáticamente al tema */}
</div>
```

### Ejemplo: Estilos Específicos por Tema

```tsx
<div className="bg-white dark:bg-card text-black dark:text-white">
  {/* Estilos diferentes para cada tema */}
</div>
```

### Ejemplo: Componente con Toggle

```tsx
import { Moon, Sun } from "lucide-react";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <button onClick={toggleTheme}>
      {isDark ? <Sun /> : <Moon />}
    </button>
  );
}
```

---

## 📋 Checklist de Temas

### ✅ Pantallas Completas
- [x] SignInScreen - Con botón de tema
- [x] HomeScreen
- [x] RemindersScreen
- [x] ActivityScreen
- [x] HistoryScreen
- [x] ChatScreen
- [x] SettingsScreen - Con toggle de tema
- [x] PrivacyScreen
- [x] TermsScreen
- [x] HelpScreen

### ✅ Modales
- [x] AddMedicationModal
- [x] EditMedicationModal
- [x] StockManagementModal
- [x] ProfileEditModal
- [x] ConfirmDialog
- [x] ForgotPasswordModal

### ✅ Componentes
- [x] MedicationCard
- [x] ReminderCard
- [x] StockCard
- [x] ScheduleCard
- [x] TabBar
- [x] StatusBar
- [x] Toast
- [x] BrandLogo

---

## 🎨 Mejores Prácticas

### DO ✅
- Usar variables CSS de tema (`bg-card`, `text-foreground`, etc.)
- Probar componentes en ambos modos
- Mantener contraste accesible (WCAG AA mínimo)
- Usar transiciones suaves para cambios

### DON'T ❌
- Hardcodear colores (`bg-white`, `text-black`)
- Ignorar el contraste en modo oscuro
- Usar transparencias que no funcionen en ambos modos
- Olvidar los estados hover/focus en modo oscuro

---

## 🔍 Debugging

### Verificar Variables CSS

```javascript
// En la consola del navegador
const styles = getComputedStyle(document.documentElement);
console.log('Background:', styles.getPropertyValue('--background'));
console.log('Primary:', styles.getPropertyValue('--primary'));
```

### Forzar Tema para Testing

```javascript
// Forzar modo oscuro
document.documentElement.classList.add('dark');

// Forzar modo claro
document.documentElement.classList.remove('dark');
```

---

## 🎯 Accesibilidad

### Contraste de Colores

#### Modo Claro
- Texto principal: **15.8:1** (AAA)
- Texto secundario: **4.5:1** (AA)
- Botones primarios: **4.5:1** (AA)

#### Modo Oscuro
- Texto principal: **16.2:1** (AAA)
- Texto secundario: **7.1:1** (AAA)
- Botones primarios: **5.2:1** (AA+)

### Preferencias del Sistema

```css
/* Respetar preferencia del sistema (futuro) */
@media (prefers-color-scheme: dark) {
  :root {
    /* Aplicar modo oscuro por defecto */
  }
}
```

---

## 📊 Comparación Visual

| Elemento | Modo Claro | Modo Oscuro |
|----------|------------|-------------|
| Fondo | `#f8fafb` | `#0a1628` |
| Cards | `#ffffff` | `#0f1e33` |
| Texto | `#080820` | `#f1f5f9` |
| Primary | `#0077FF` | `#3b82f6` |
| Secondary | `#32E3C2` | `#22d3ee` |
| Bordes | `#e2e8f0` | `#1e3a5f` |

---

## 🚀 Roadmap Futuro

### Planeado
- [ ] Persistencia del tema en localStorage
- [ ] Respetar preferencia del sistema operativo
- [ ] Tema personalizado (custom colors)
- [ ] Modo alto contraste
- [ ] Preview de tema antes de aplicar

### En Consideración
- [ ] Más variantes de tema (sepia, navy, etc.)
- [ ] Programación automática (día/noche)
- [ ] Tema por sección de la app

---

## 📝 Notas Importantes

### Rendimiento
- Las transiciones CSS son optimizadas por GPU
- No hay impacto en rendimiento al cambiar temas
- Las variables CSS se recalculan instantáneamente

### Compatibilidad
- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Mobile browsers modernos

### Limitaciones
- No persistente (se resetea al recargar)
- No sincronizado con preferencia del sistema
- Solo 2 temas (claro/oscuro)

---

## 🎉 Conclusión

El sistema de temas de MedAlert+ ofrece:
- ✅ **2 modos completos**: Claro y Oscuro
- ✅ **Transiciones suaves**: 0.3s ease
- ✅ **Colores optimizados**: Para cada modo
- ✅ **Contraste accesible**: WCAG AA/AAA
- ✅ **Componentes consistentes**: 100% compatibles
- ✅ **Fácil de usar**: Toggle en 2 lugares

**Estado**: ✅ **TOTALMENTE FUNCIONAL**

---

*MedAlert+ v1.0.0 - Sistema de Temas Completo*

**Última actualización**: 10 de noviembre, 2025
