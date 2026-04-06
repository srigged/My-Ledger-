# My Ledger - Secure Financial Management Portal

A high-performance, production-grade financial tracking application built with **React**, **TypeScript**, and **Firebase**. Designed for precision, security, and real-time data exploration.

## 🚀 Core Requirements & Implementation

### 1. Real-Time Financial Dashboard
*   **Requirement:** A centralized hub for monitoring fiscal health at a glance.
*   **Achievement:** Developed a dynamic dashboard featuring high-contrast KPI cards for Income, Expenses, Net Balance, and Transaction counts. Used `recharts` to provide a 6-month trend analysis and a categorical spending breakdown.

### 2. Interactive Data Exploration (Zoom & Pan)
*   **Requirement:** Ability to drill down into specific time ranges within financial trends.
*   **Achievement:** Enhanced the Trend Analysis chart with **Drag-to-Zoom** functionality using Recharts `ReferenceArea`. Integrated a **Brush** component for seamless panning across large datasets and a one-click **Reset Zoom** feature for quick navigation.

### 3. Secure Multi-Factor Authentication
*   **Requirement:** Robust user onboarding and secure access management.
*   **Achievement:** Integrated **Firebase Authentication** supporting both Google OAuth and Email/Password flows. Implemented a custom **Password Reset** flow with automated email dispatch to ensure account recoverability.

### 4. Granular Role-Based Access Control (RBAC)
*   **Requirement:** Differentiated access levels for Admins, Analysts, and Viewers.
*   **Achievement:** Architected a secure user profile system in **Firestore**. Enforced strict **Security Rules** that validate operations based on user roles, preventing unauthorized data modification or privilege escalation.

### 5. Persistent Dark & Light Modes
*   **Requirement:** A modern, accessible UI that adapts to user preferences.
*   **Achievement:** Built a custom `ThemeContext` with `localStorage` persistence. Styled the entire application using **Tailwind CSS** utility classes, ensuring consistent contrast and aesthetic appeal across both themes.

### 6. Real-Time Data Synchronization
*   **Requirement:** Instant updates across all connected clients without page refreshes.
*   **Achievement:** Leveraged Firestore's `onSnapshot` listeners for both user profiles and financial records. This ensures that any change made by an Admin is instantly reflected on an Analyst's dashboard.

---

## 🏗 Architecture Diagram

```mermaid
flowchart TB
    User((User))
    
    subgraph Frontend ["Frontend (React SPA)"]
        direction TB
        App[App Component]
        Context[Context: Auth, Theme]
        Views[Views: Dashboard, Records, Login]
        Charts[Recharts: Interactive Trends]
        
        App --> Context
        Context --> Views
        Views --> Charts
    end

    subgraph Firebase ["Backend Services (Firebase)"]
        direction TB
        Auth[Firebase Auth]
        Firestore[(Cloud Firestore)]
        Rules{Security Rules / RBAC}
        
        Firestore --- Rules
    end

    subgraph Infrastructure ["Infrastructure"]
        Vercel[Vercel]
    end

    User <--> Vercel
    Vercel -- Serves --> Frontend
    Frontend <--> Auth
    Frontend <--> Firestore
    
    style Frontend fill:#f9f,stroke:#333,stroke-width:2px
    style Firebase fill:#bbf,stroke:#333,stroke-width:2px
    style Infrastructure fill:#dfd,stroke:#333,stroke-width:2px
```

## 🛠 Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **Animations:** Motion (formerly Framer Motion)
*   **Charts:** Recharts (D3-based)
*   **Backend/DB:** Firebase (Auth, Firestore)
*   **Deployment:** Vercel

## 📦 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/my-ledger.git
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Firebase:**
    Create a `firebase-applet-config.json` in the root with your Firebase project credentials.
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
## Checkout MY LEDGER here: https://my-ledger-nu.vercel.app/

## Snapshots of the project
<img width="1437" height="873" alt="Screenshot 2026-04-06 201716" src="https://github.com/user-attachments/assets/1b1e6ed9-b85f-4460-9ab8-800d9953b1a7" />
<img width="1353" height="861" alt="Screenshot 2026-04-06 201735" src="https://github.com/user-attachments/assets/3b7eb3e5-344c-428e-a4ec-b594abfe8f73" />
<img width="1896" height="865" alt="Screenshot 2026-04-06 202239" src="https://github.com/user-attachments/assets/6680db90-7ebe-468a-b2d9-6f0481b6d9f5" />
<img width="1895" height="864" alt="Screenshot 2026-04-06 202303" src="https://github.com/user-attachments/assets/7e9a6cf6-fdd8-49ac-983a-0302f2777a8b" />
<img width="1894" height="862" alt="Screenshot 2026-04-06 202315" src="https://github.com/user-attachments/assets/ccf600d5-dfd4-43df-8f03-82c4c5fe970c" />
<img width="1876" height="870" alt="Screenshot 2026-04-06 202341" src="https://github.com/user-attachments/assets/fcfff745-d072-43be-a9ce-43b09245e807" />
<img width="1872" height="848" alt="Screenshot 2026-04-06 202358" src="https://github.com/user-attachments/assets/b43f5e04-e6cd-4984-8a69-3bcce1d74c49" />
<img width="1904" height="835" alt="Screenshot 2026-04-06 202637" src="https://github.com/user-attachments/assets/71188140-f457-45d9-b8b4-02991db0f8f2" />









