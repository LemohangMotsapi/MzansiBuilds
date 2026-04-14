# MzansiBuilds

**MzansiBuilds** is a platform designed for developers to build in public. It allows the community to track ongoing projects, celebrate finished products, and foster collaboration across the ecosystem.

---

## Purpose
The primary goal of MzansiBuilds is to provide a transparent live feed of developer activity. By allowing developers to share their progress and milestones, the platform encourages accountability and opens doors for collaboration and community support.

---

## Tech Stack
* **Frontend:** React (Vite)
* **Backend:** Node.js & Express
* **Database:** Supabase (PostgreSQL)
* **Authentication:** JSON Web Tokens (JWT)
* **Deployment:** Render

---

## Key Features (User Journey)

### 1. Account Management
* Developers can create and manage their own secure accounts.
* Authentication is handled via JWT to ensure data privacy and authorized access.

### 2. Project Management
* **Create & Edit:** Developers can start new project entries, specifying the title, description, tech stack, and the current stage of development.
* **Support Requests:** Users can indicate what kind of support they need to move their project forward.

### 3. Community Live Feed
* A real-time feed displays what other developers are currently building.
* **Engagement:** Users can comment on projects or "raise a hand" to request collaboration on a specific build.

### 4. Progress Tracking (Milestones)
* Projects are not static. Developers can continuously update their progress by adding specific milestones achieved during the build process.

### 5. The Celebration Wall
* Once a project is marked as "Shipped" it is automatically featured on the **Celebration Wall**, highlighting developers who have successfully built and shipped in public.

---

## System Architecture

* **RESTful API:** A Node/Express server handles the business logic and serves as the bridge between the UI and the data layer.
* **Relational Database:** A PostgreSQL schema manages linked data between users, projects, milestones, and discussions.
* **Security:** Password hashing and protected API routes ensure a secure environment for developer data.

---

## Local Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LemohangMotsapi/MzansiBuilds.git
2.  **Backend Setup:**
    * Navigate to `/backend`
    * Run `npm install`
    <!--* Configure your `.env` with `SUPABASE_URL`, `SUPABASE_KEY`, and `JWT_SECRET`. --> 
    * Run `npm start`
3.  **Frontend Setup:**
    * Navigate to `/frontend`
    * Run `npm install`
    * Run `npm run dev`

## Deployed Site
    Link: [text](https://mzansibuilds-frontend.onrender.com)
