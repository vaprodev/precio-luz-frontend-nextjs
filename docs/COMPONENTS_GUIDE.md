# 📦 Guía de Componentes Disponibles - TailNext Template

## 🎨 ATOMS (Componentes Básicos)

### `Logo.tsx`

- Logo de la aplicación
- Usado en Header y Footer

### `Providers.tsx`

- Proveedor de temas (dark/light mode)
- Wrapper para toda la aplicación

### `ToggleDarkMode.tsx`

- Botón para cambiar entre modo oscuro/claro
- Icono de sol/luna

### `ToggleMenu.tsx`

- Botón hamburguesa para menú móvil
- Animación de apertura/cierre

---

## 🧩 COMMON (Componentes Comunes)

### `Background.tsx`

- Fondo decorativo para secciones
- Gradientes y patrones

### `CTA.tsx`

- Botones de Call-to-Action
- Estilos primary/secondary

### `Collapse.tsx`

- Acordeón/collapse animado
- Para FAQs y contenido expandible

### `DividerLine.tsx`

- Líneas divisorias decorativas
- Separadores de secciones

### `Dropdown.tsx`

- Menú desplegable
- Para navegación y selección

### `Form.tsx`

- Componente de formulario
- Inputs, textareas, checkboxes

### `Headline.tsx`

- Títulos y subtítulos de sección
- Con tagline opcional

### `ItemGrid.tsx`

- Grid responsive para items
- Features, servicios, etc.

### `ItemTeam.tsx`

- Tarjeta de miembro del equipo
- Foto, nombre, rol, social links

### `ItemTestimonial.tsx`

- Tarjeta de testimonio
- Avatar, nombre, rating, texto

### `Timeline.tsx`

- Línea de tiempo
- Para procesos, historia, pasos

### `WidgetWrapper.tsx`

- Wrapper común para todas las secciones
- Padding, márgenes, responsive

---

## 🏗️ WIDGETS (Secciones Completas)

### 📢 Anuncios y Notificaciones

#### `Announcement.tsx`

- Banner de anuncio en la parte superior
- Mensajes importantes, promociones

---

### 🎯 Call to Action

#### `CallToAction.tsx`

- CTA simple con botón
- Título + descripción + acción

#### `CallToAction2.tsx`

- CTA con imagen de fondo
- Versión más visual

---

### 🏠 Hero Sections

#### `Hero.tsx`

- Hero principal con imagen
- Título, subtítulo, 2 botones

#### `Hero2.tsx`

- Hero alternativo
- Con features destacadas

---

### ✨ Features

#### `Features.tsx`

- Grid de características
- Iconos + título + descripción

#### `Features2.tsx`

- Features con imagen lateral
- Layout alternativo

#### `Features3.tsx`

- Features con tabs
- Organización por categorías

#### `Features4.tsx`

- Features destacadas
- Con números o badges

---

### 📝 Content

#### `Content.tsx`

- Sección de contenido con imagen
- Texto largo + imagen lateral
- Para About, descripción de producto

---

### 💰 Pricing

#### `Pricing.tsx`

- Tablas de precios
- Planes (básico, pro, enterprise)
- Features incluidas, botones de acción

---

### 📊 Stats

#### `Stats.tsx`

- Estadísticas destacadas
- Números grandes + descripciones
- Ej: "1000+ clientes", "99% satisfacción"

---

### 👣 Steps

#### `Steps.tsx`

- Proceso paso a paso
- Numeración, iconos
- "Cómo funciona"

---

### ❓ FAQs

#### `FAQs.tsx`

- Preguntas frecuentes
- Accordion/collapse

#### `FAQs2.tsx`

- FAQs en 2 columnas

#### `FAQs3.tsx`

- FAQs con tabs por categoría

#### `FAQs4.tsx`

- FAQs con búsqueda

---

### 💬 Testimonials

#### `Testimonials.tsx`

- Testimonios en grid
- Avatares, nombres, ratings

#### `Testimonials2.tsx`

- Testimonios en carousel
- Versión deslizante

---

### 📞 Contact

#### `Contact.tsx`

- Formulario de contacto
- Campos: nombre, email, mensaje

#### `Contact2.tsx`

- Contacto con mapa
- Info adicional (dirección, teléfono)

---

### 👥 Team

#### `Team.tsx`

- Grid de equipo
- Fotos, nombres, roles

#### `Team2.tsx`

- Team con diseño alternativo
- Más información por miembro

---

### 🔍 Comparison

#### `Comparison.tsx`

- Tabla de comparación
- Para comparar planes, productos

---

### 🌟 Social Proof

#### `SocialProof.tsx`

- Logos de clientes/partners
- "Confían en nosotros"
- Credibilidad

---

### 🦶 Footer

#### `Footer.tsx`

- Footer completo
- Links, redes sociales, copyright

#### `Footer2.tsx`

- Footer minimalista
- Versión reducida

---

### 🧭 Header

#### `Header.tsx`

- Navegación principal
- Logo, menú, dark mode toggle
- Responsive con hamburger

---

## 🎯 COMPONENTES MÁS ÚTILES PARA PRECIO LUZ HOY

### Para Homepage:

1. ✅ **Hero** - Título principal "Precio Luz Hoy"
2. ✅ **Stats** - Precio actual, ahorro promedio
3. ✅ **Features** - Ventajas de usar la app
4. ✅ **CallToAction** - Invitar a calcular ahorro

### Para Dashboard de Precios:

1. ✅ **Content** - Explicación de cómo funciona
2. ✅ **Timeline** - Precios por hora (visualización)
3. ✅ **Comparison** - Comparar diferentes tramos
4. ✅ **Stats** - Mejor hora, peor hora, promedio

### Para About/Info:

1. ✅ **Content** - Información de la app
2. ✅ **FAQs** - Preguntas frecuentes
3. ✅ **Contact** - Contacto y soporte

### Reutilizables:

1. ✅ **Header** - Ya está integrado
2. ✅ **Footer** - Ya está integrado
3. ✅ **ToggleDarkMode** - Para todo el sitio

---

## 📚 Cómo Usar un Componente

```tsx
// Ejemplo: Usar Stats en tu página de precios
import Stats from '~/components/widgets/Stats';

const statsData = {
  id: 'stats-precios',
  title: 'Precios de Hoy',
  items: [
    {
      title: '0.085 €/kWh',
      description: 'Precio Actual',
    },
    {
      title: '14:00 - 16:00',
      description: 'Mejor Franja',
    },
    {
      title: '25%',
      description: 'Ahorro Potencial',
    },
  ],
};

export default function PreciosPage() {
  return <Stats {...statsData} />;
}
```

---

## 🎨 Personalización

Todos los componentes:

- ✅ Usan Tailwind CSS
- ✅ Soportan dark mode
- ✅ Son responsive
- ✅ Aceptan props para personalización
- ✅ TypeScript tipado

---

## 📖 Ver Ejemplos

Cada componente tiene ejemplos en:

- `src/shared/data/` - Datos de ejemplo
- `src/stories/` - Storybook stories
- `app/(pages)/` - Páginas de ejemplo
