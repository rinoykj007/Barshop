# Barshop Frontend

A modern React frontend for the Barshop barbershop management system.

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── BookAppointment.jsx
│   │   └── AdminDashboard.jsx
│   ├── utils/          # Utility functions
│   │   └── api.js      # API configuration
│   ├── hooks/          # Custom React hooks
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # App entry point
│   └── index.css       # Global styles with Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Features

### Customer Features

- **Home Page**: Welcome page with services overview
- **Book Appointment**: Simple booking form with name, phone, and date/time
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features

- **Admin Dashboard**: View all appointments
- **Appointment Management**: Complete, cancel, or delete appointments
- **Statistics**: Quick overview of appointment counts
- **Status Management**: Track appointment statuses

## Getting Started

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## API Integration

The frontend connects to the backend API through:

- Proxy configuration in `vite.config.js`
- Axios instance in `src/utils/api.js`
- API endpoints for users and appointments

## Pages

### 🏠 Home (`/`)

- Hero section with call-to-action
- Services showcase
- About section

### 📅 Book Appointment (`/book`)

- Customer booking form
- Date/time picker
- Form validation
- Success/error messages

### 👨‍💼 Admin Dashboard (`/admin`)

- Appointment list table
- Status management
- Statistics overview
- Delete functionality

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for common components
- **Responsive design** with mobile-first approach
- **Color scheme** with primary/secondary themes

## Development

- **Hot reload** with Vite dev server
- **ESLint** for code quality
- **Component-based architecture**
- **Modern React patterns** with hooks

## Deployment

Build the project for production:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.
