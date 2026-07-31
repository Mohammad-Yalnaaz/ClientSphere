# Software Requirements Specification (SRS)
# ClientSphere — Enterprise Client & Project Management Platform

**Document Version:** 1.0
**Document Status:** Complete (Chapters 1–6)
**Prepared For:** ClientSphere Product & Engineering Team
**Document Type:** Software Requirements Specification

---

## Chapter 1: Introduction and Project Foundation

### 1.1 Project Overview

ClientSphere is a production-grade, enterprise-oriented web application designed to serve as a centralized operating system for service-based businesses — agencies, consultancies, IT service providers, design studios, marketing firms, freelance collectives operating at scale, and similar organizations whose core business model revolves around delivering ongoing work to external clients.

At its core, ClientSphere unifies three domains that are typically fragmented across disconnected tools in most service businesses today:

1. **Client Relationship Management** — maintaining a structured, single source of truth for every client, their contacts, communication history, and account status.
2. **Project & Task Management** — planning, assigning, tracking, and delivering client work through structured projects, milestones, and tasks.
3. **Team Collaboration & Visibility** — enabling internal teams (project managers, employees, administrators) to coordinate in real time, with appropriate visibility boundaries between internal staff and external clients.

The application is architected using the **MERN stack** (MongoDB, Express.js, React, Node.js), with a modern frontend built on **Vite** and **Tailwind CSS**, using **shadcn/ui** as the component design system to ensure a polished, consistent, and accessible user interface. Authentication is handled through a hybrid approach combining **JWT-based credential authentication** and **Google OAuth** for streamlined sign-in. Media and document handling is offloaded to **Cloudinary**, while real-time features such as notifications, live updates, and presence are powered by **Socket.io**. ClientSphere integrates the **Google Gemini API** as an external AI service, providing three specific productivity features: the AI Task Description Generator, the AI Project Summary, and the AI Comment Summarizer. The application is deployed using a split-hosting strategy, with the frontend hosted on **Vercel** and the backend on **Render**, providing a cost-effective and scalable deployment model.

ClientSphere is designed from the outset with production-grade architectural principles, including role-based access control, scalability, modularity, security, and maintainability. The system is intended to support future enhancements such as analytics, billing, and third-party integrations without requiring significant architectural changes.

This document (the SRS) is being developed incrementally, chapter by chapter, to ensure that the architectural and functional foundation is fully agreed upon before any implementation work begins. Chapter 1 establishes the "why" and "what" of the system at a high level; subsequent chapters progressively define system architecture, data models, detailed functional specifications, API contracts, security design, and deployment strategy.

---

### 1.2 Problem Statement

Service-based businesses — regardless of size — generally face a recurring set of operational problems that ClientSphere is designed to solve:

**1.2.1 Fragmentation of Tools**
Most small and mid-sized service businesses rely on a patchwork of disconnected tools: spreadsheets for client lists, email threads for communication history, generic task boards (e.g., Trello-like tools) for project tracking, and separate file-sharing tools (Google Drive, Dropbox) for deliverables. This fragmentation causes information to live in silos, making it difficult to answer simple questions such as "What is the current status of Client X's project?" without checking three or four different systems.

**1.2.2 Lack of a Single Source of Truth for Client Data**
Client information — contact details, contracts, communication history, project history, billing status — is often scattered across CRMs, spreadsheets, and individual employees' inboxes. When an employee leaves or is reassigned, critical client context is frequently lost.

**1.2.3 Poor Visibility Into Project Health and Team Workload**
Managers and administrators often lack a real-time, accurate view of how many active projects are in progress, which are at risk of delay, and how work is distributed across the team. This leads to reactive management rather than proactive planning.

**1.2.4 Absence of Role-Appropriate Access**
Generic project management tools are typically built for internal teams only, and retrofitting client-facing access (e.g., allowing a client to view their own project's progress without seeing internal notes or other clients' data) is often clumsy, insecure, or simply unsupported.

**1.2.5 Inefficient Communication and Delayed Updates**
Without real-time notification systems, status changes, task assignments, and important updates are often communicated late (or not at all), through informal channels like chat apps or emails that are not tied to the actual work record.

**1.2.6 Scalability and Professionalism Gaps**
Tools cobbled together from spreadsheets and free-tier SaaS products rarely scale gracefully as a business grows from a handful of clients to dozens or hundreds, and they rarely present a professional, branded experience to external clients.

ClientSphere directly addresses these problems by providing a unified, role-aware, real-time platform purpose-built for the client-servicing workflow, rather than a generic project management tool that has been adapted after the fact.

---

### 1.3 Objectives

**1.3.1 Business Objectives**
- Provide a single, centralized platform where client data, project data, and task data are structurally linked rather than manually cross-referenced.
- Reduce the operational overhead of managing multiple clients and projects simultaneously by giving administrators and managers real-time visibility into organizational activity.
- Enable service-based businesses to present a professional, branded, self-service experience to their clients (where applicable), improving client trust and satisfaction.
- Support the natural growth of a service business — from a small team handling a few clients to a larger organization managing many concurrent projects and team members — without requiring a platform migration.

**1.3.2 Technical & Architectural Objectives**
- Design a data model and system architecture that is modular, maintainable, and extensible, so that future modules (billing, invoicing, reporting) can be layered on without re-architecting the core system.
- Implement a robust, secure authentication and authorization system supporting both traditional credential-based login (JWT) and federated login (Google OAuth), with clearly defined role-based access control (RBAC) from day one.
- Ensure the system is designed for real-time responsiveness (via Socket.io) wherever it materially improves the user experience — notifications, live status changes, collaborative awareness — without over-engineering real-time features where they are not needed.
- Establish clear boundaries and conventions for how data is scoped, validated, and secured at every layer (client, API, database) to meet production-grade security and data-integrity standards.
- Design the system so that it can be reliably deployed and operated using a modern split-hosting deployment model (Vercel for frontend, Render for backend), with attention to environment configuration, CORS, and cross-origin authentication concerns.
- Integrate the Google Gemini API as an external AI service to deliver the AI Task Description Generator, AI Project Summary, and AI Comment Summarizer, while keeping this integration cleanly isolated from the system's core business logic so that its temporary unavailability never affects unrelated functionality.

**1.3.3 Guiding Design Principles**
- **Correctness before features:** the data model and access-control logic must be correct and secure before additional functionality is layered on.
- **Separation of concerns:** clear boundaries between authentication, business logic, data access, and presentation layers.
- **Progressive disclosure of complexity:** the system should be simple for small teams to adopt, while structurally supporting enterprise-scale complexity (multiple roles, many concurrent projects, large teams) as usage grows.
- **Design for auditability:** significant actions (status changes, assignments, deletions) should be traceable, which will be elaborated in later chapters covering data modeling and logging.

---

### 1.4 Scope

**1.4.1 In-Scope for ClientSphere (Current Product Vision)**

- **User & Organization Management:** Registration, authentication (JWT and Google OAuth), role assignment, and profile management for internal users (administrators, managers/project leads, employees/team members).
- **Client Management:** Creation and maintenance of client records, including contact details, associated projects, status, and relevant metadata.
- **Project Management:** Creation of projects associated with clients, including project metadata (timelines, status, assigned team members, priority).
- **Task Management:** Breakdown of projects into tasks and subtasks, with assignment to specific team members, due dates, priority levels, and status tracking.
- **Team Collaboration Features:** Comments/discussion threads on tasks or projects, activity feeds, and real-time notifications for relevant events (assignment, status change, comments, mentions).
- **File & Document Handling:** Uploading, storing, and retrieving files and documents (e.g., deliverables, contracts, briefs) associated with clients or projects, using Cloudinary as the media storage layer.
- **Real-Time Functionality:** Live updates for task/project status changes, notifications, and presence indicators, powered by Socket.io.
- **Role-Based Dashboards:** Distinct, role-appropriate views and permissions for Administrators, Managers, Employees, and Clients.
- **Search & Filtering:** The ability to search and filter across clients, projects, and tasks.
- **AI-Assisted Productivity Features:** The AI Task Description Generator, AI Project Summary, and AI Comment Summarizer, powered by the Google Gemini API and available to authenticated, authorized users.
- **Deployment & Environment Management:** A production deployment pipeline using Vercel (frontend) and Render (backend), including environment-specific configuration.

**1.4.2 Planned for a Future Phase (Explicitly Deferred)**

- **Billing & Invoicing:** Financial features (invoice generation, payment tracking, integration with payment gateways) are not part of the initial scope and will only be considered in a later phase if prioritized.
- **Advanced Reporting/Analytics/BI:** Deep analytics dashboards (e.g., profitability analysis, resource utilization forecasting) are considered a future enhancement, not part of the initial build.
- **Native Mobile Applications:** The initial product is a responsive web application; dedicated native iOS/Android applications are out of scope for this SRS.

**1.4.3 Out-of-Scope (Not Currently Planned)**

- Multi-tenant support and white-label capabilities are being considered for future versions of ClientSphere. The initial release will focus on delivering a robust single-organization platform while ensuring the architecture can evolve to support multi-tenant deployments if required.

This scope will be revisited and refined as later chapters define the data model and detailed functional specifications; however, this section establishes the boundary that all subsequent design decisions in this document should respect unless explicitly revised.

---

### 1.5 Target Users

**1.5.1 Administrator (Organization Owner / Super Admin)**
- Represents the owner or top-level decision-maker of the service business using ClientSphere.
- Has full visibility and control over all clients, projects, tasks, and users within the organization.
- Responsible for user management (creating/deactivating accounts, assigning roles), high-level oversight of all ongoing work, and organization-wide configuration.
- Primary concerns: overall business visibility, resource allocation, accountability, and control.

**1.5.2 Manager / Project Lead**
- Represents a team lead or project manager responsible for one or more specific clients or projects.
- Can create and manage projects and tasks within their scope, assign tasks to employees, monitor progress, and communicate with Clients.
- Typically does not have organization-wide administrative control but has elevated permissions relative to a standard employee within their assigned scope.
- Primary concerns: keeping projects on track, managing team workload, and ensuring client satisfaction for their accounts.

**1.5.3 Employee / Team Member**
- Represents an individual contributor — a designer, developer, consultant, or similar — who is assigned tasks within projects.
- Primarily interacts with the system to view assigned tasks, update task status, communicate on task-level discussions, and upload relevant deliverables.
- Has restricted visibility, generally limited to projects/tasks they are directly assigned to, rather than full organizational visibility.
- Primary concerns: clarity on what needs to be done, deadlines, and straightforward status reporting.

**1.5.4 Client**
- Represents an external stakeholder — the customer of the service-based business — granted limited, read-oriented (or narrowly interactive) access to view the status of their own projects, communicate with the assigned team, and access shared deliverables.
- This role has the most restrictive access boundary: strictly scoped to their own organization's projects/data, with no visibility into other clients, internal team discussions, or internal-only data.
- This role is included in ClientSphere's Version 1 release, with its specific functional permissions defined in the functional requirements chapter.

**1.5.5 Summary Table of Roles and Primary Intent**

| Role | Primary Relationship to System | Core Need |
|---|---|---|
| Administrator | Owns the organization's ClientSphere instance | Full visibility & control |
| Manager / Project Lead | Manages specific clients/projects | Team coordination & delivery oversight |
| Employee / Team Member | Executes assigned work | Clarity on tasks & deadlines |
| Client | External recipient of services | Transparency into their own project status |

---

### 1.6 High-Level Functional Requirements

**FR-001: User Authentication & Authorization**
The system shall allow users to register and log in using email/password credentials (secured via JWT-based session handling) or via Google OAuth. The system shall enforce role-based access control such that every action a user can perform is governed by their assigned role and scope.

**FR-002: User & Role Management**
The system shall allow Administrators to create, update, deactivate, and assign roles to users within their organization.

**FR-003: Client Record Management**
The system shall allow authorized users (Administrators and Managers, per rules to be defined later) to create, view, update, and archive client records, including contact information and relevant metadata.

**FR-004: Project Management**
The system shall allow authorized users to create projects, associate them with a specific client, define project metadata (timeline, priority, status, description), and assign team members to the project.

**FR-005: Task & Subtask Management**
The system shall allow authorized users to create tasks (and subtasks) within a project, assign them to specific employees, set due dates and priority levels, and track status changes (e.g., To Do, In Progress, In Review, Completed).

**FR-006: Commenting & Activity Tracking**
The system shall allow users to add comments/discussion entries to tasks and/or projects, and shall maintain an activity log reflecting significant status and assignment changes.

**FR-007: File & Document Management**
The system shall allow users to upload and associate files/documents with clients, projects, or tasks, with storage and retrieval handled through Cloudinary.

**FR-008: Real-Time Notifications**
The system shall notify relevant users in real time (via Socket.io) of significant events pertinent to them, such as being assigned a task, a status change on a task they are involved with, or a new comment on a task/project they follow.

**FR-009: Dashboards & Role-Specific Views**
The system shall present role-appropriate dashboards for Administrators, Managers, Employees, and Clients, each exposing only the information and actions permitted by their assigned role.

**FR-010: Search & Filtering**
The system shall provide search and filtering capabilities across clients, projects, and tasks, scoped appropriately to the requesting user's role and permissions.

**FR-011: AI-Assisted Productivity Features**
The system shall integrate the Google Gemini API to provide three AI-assisted capabilities: an AI Task Description Generator that helps a user draft a Task's description, an AI Project Summary that generates a concise summary of a Project's current status and activity, and an AI Comment Summarizer that condenses a Task or Project's Comment history into a brief summary. These capabilities are available only to authenticated, authorized users and are designed to assist users rather than replace or bypass the system's core business logic.

---

### 1.7 Non-Functional Requirements

**NFR-1: Security**
- All authentication flows (JWT and Google OAuth) must follow current security best practices, including secure token storage/handling, protection against common web vulnerabilities (e.g., XSS, CSRF, injection attacks), and proper secret/environment variable management.
- Role-based access control must be enforced consistently at the API layer (not merely hidden in the UI), ensuring that unauthorized data access is not possible even via direct API calls.
- Data belonging to one organization must be strictly isolated from another, forming the basis of a later "multi-tenancy and data isolation" design decision.

**NFR-2: Scalability**
- The backend architecture and database schema must be designed to accommodate growth in the number of organizations, users, clients, and projects without requiring fundamental redesign.
- The system should be designed so that computationally or connection-heavy features (e.g., Socket.io real-time channels) can scale independently of core CRUD operations where feasible.

**NFR-3: Performance**
- Core user-facing operations (viewing dashboards, loading project/task lists, submitting updates) should be optimized for responsiveness, with attention to efficient database querying (appropriate indexing, pagination) to be detailed in the data modeling chapter.
- Real-time features must be implemented in a way that avoids excessive overhead or unnecessary broadcast of events to unrelated clients.

**NFR-4: Reliability & Availability**
- The system should be designed with sensible error handling and graceful degradation (e.g., if Cloudinary or the Google Gemini API is temporarily unavailable, core project/task management functionality should remain unaffected). Specifically, failure of the Google Gemini API shall affect only the AI Task Description Generator, AI Project Summary, and AI Comment Summarizer features; all other application functionality must continue operating normally.
- The deployment strategy (Vercel + Render) should account for environment configuration correctness across development, staging, and production environments.

**NFR-5: Maintainability & Extensibility**
- The codebase architecture must follow a clear separation of concerns (routing, controllers/business logic, data models, middleware) to support long-term maintainability by a team, not just the original author.
- The system must be designed such that future modules (billing, advanced analytics) can be added with minimal disruption to existing functionality.

**NFR-6: Usability & Accessibility**
- The user interface, built with Tailwind CSS and shadcn/ui, must provide a consistent, professional, and accessible experience across the different user roles, respecting standard accessibility conventions where practical.
- The interface must clearly differentiate role-specific views so users are never confused about what actions are available to them.

**NFR-7: Auditability**
- Significant state-changing actions (role changes, task reassignment, status transitions, deletions) should be traceable, laying the groundwork for an activity/audit log design to be detailed in a later chapter.

**NFR-8: Portability & Deployment Consistency**
- The application must be deployable in a consistent, repeatable manner across environments, with the frontend hosted on Vercel and backend on Render, and with clear separation of configuration (API URLs, secrets, CORS rules) between environments.

**NFR-9: Data Integrity**
- The data model (to be detailed in a later chapter) must enforce referential consistency between related entities (e.g., a task must always belong to a valid project, which must always belong to a valid client) to prevent orphaned or inconsistent records.

---

**End of Chapter 1.**

---
---
## Chapter 2: System Architecture

### 2.1 Overall System Architecture

ClientSphere is structured as a **three-tier system** — a presentation tier, an application/logic tier, and a data tier — augmented by a real-time communication layer and a background job processing layer, and supported by a bounded set of external managed services.

The presentation tier is a React single-page application (SPA), fully decoupled from the backend and communicating exclusively through a defined REST API and a supplementary real-time channel. The application/logic tier is a **modular monolith**: a single deployable Node.js/Express backend, internally organized into clearly separated domain modules (Authentication, Users, Clients, Projects, Tasks, Notifications, Files, Background Jobs, and AI Integration). The data tier is MongoDB, accessed through Mongoose.

**2.1.1 Rationale for a Modular Monolith Over Microservices.** A microservices architecture introduces substantial operational overhead — inter-service communication, distributed transaction handling, independent deployment pipelines — that is only justified when scale or team-size pressures demand it. ClientSphere does not yet face those pressures, so it instead adopts a modular monolith: each domain module has its own internal boundary (routing, business logic, data models) even though all modules are deployed together. This preserves the organizational benefits of separation without the operational cost, and leaves the door open to extracting a module (Notifications and Background Jobs being the most likely candidates) into an independent service later, if scale genuinely requires it.

**2.1.2 Rationale for a Decoupled Frontend.** Building the frontend as an SPA rather than a server-rendered application allows independent deployment and scaling of frontend (Vercel) and backend (Render), supports the rich, app-like interactivity the product requires (live dashboards, real-time notifications), and establishes a clean, testable contract boundary between frontend and backend.

In summary, ClientSphere is a three-tier system — presentation (React), application/logic (modular Express monolith), and data (MongoDB) — supported by real-time communication (Socket.io) and background job processing (BullMQ + Redis), and dependent on a bounded set of external services (Google OAuth, Cloudinary, and the Google Gemini API).

---

### 2.2 High-Level Component Architecture

The system is organized into six logical layers of responsibility, most of which live inside the single backend deployment described above:

- **Layer 1 — Presentation Layer:** The React + Vite application, responsible for rendering UI, managing client-side state, calling backend APIs, and reacting to real-time events.
- **Layer 2 — API / Application Layer:** The Express.js layer exposing REST endpoints, verifying authentication and authorization, validating input, and hosting the Socket.io server.
- **Layer 3 — Business Logic Layer:** The domain modules (Authentication, Users, Clients, Projects, Tasks, Notifications, Files, AI Integration) that encode the system's actual rules.
- **Layer 4 — Data Access & Persistence Layer:** Mongoose models and schemas, responsible for validation and communication with MongoDB.
- **Layer 5 — Asynchronous Processing Layer:** The BullMQ job queue, backed by Redis, for deferred or long-running work (detailed in Section 2.9).
- **Layer 6 — External Services Layer:** Google OAuth, Cloudinary, and the Google Gemini API — each accessed through a dedicated internal service wrapper so that swapping a provider later does not require changes to business logic elsewhere.

```
                    ┌───────────────────────────┐
                    │        CLIENT BROWSER        │
                    │  React + Vite + Tailwind +   │
                    │         shadcn/ui             │
                    └───────────────┬───────────────┘
                                    │  HTTPS (REST) + WebSocket (Socket.io)
                                    ▼
                ┌─────────────────────────────────────────┐
                │        BACKEND APPLICATION (Render)        │
                │  Middleware: Auth, RBAC, Validation          │
                │  Domain Modules: Users, Clients, Projects,   │
                │  Tasks, Notifications, Files, AI Integration │
                │  Socket.io Server (Real-Time)                │
                └──────┬───────────┬───────────┬────────┬──┬───┘
                       │           │           │        │  │
              Mongoose │   OAuth   │   Media   │  Jobs  │  │ AI
              Queries  │  Verify   │  Upload   │(BullMQ)│  │ Requests
                       ▼           ▼           ▼        ▼  ▼
              ┌───────────┐ ┌─────────────┐ ┌────────┐ ┌───────┐ ┌────────┐
              │  MongoDB    │ │Google OAuth   │ │Cloudinary│ │ Redis   │ │ Gemini   │
              │            │ │              │ │        │ │        │ │ API      │
              └───────────┘ └─────────────┘ └────────┘ └───────┘ └────────┘
```

A defining structural property of this architecture is that the browser never communicates directly with MongoDB, Google OAuth, Cloudinary, Redis, or the Google Gemini API — every external interaction is mediated by the backend, forming one consistent security boundary.

**AI Integration via Google Gemini API.** ClientSphere integrates the **Google Gemini API** as an external managed service, positioned within Layer 6 alongside Google OAuth and Cloudinary. This integration provides three specific, bounded productivity features: the **AI Task Description Generator**, the **AI Project Summary**, and the **AI Comment Summarizer**. All communication with the Gemini API is initiated and mediated exclusively by the backend's AI Integration module (Layer 3) — the frontend never communicates with Gemini directly, and Gemini API credentials are stored only within the backend's environment configuration, never exposed to the browser. Every request to the Gemini API is made only on behalf of an authenticated and authorized User, consistent with the authorization discipline applied to every other capability in this system. Gemini-generated output is treated strictly as an assistive suggestion presented to the User — it never bypasses, overrides, or replaces the business logic, validation, or authorization rules described elsewhere in this SRS. Should the Gemini API become temporarily unavailable, this affects only the three AI-assisted features listed above; all core ClientSphere functionality — Client, Project, and Task management, collaboration, notifications, and file handling — continues to operate normally and independently of the Gemini API's availability.

---

### 2.3 Frontend Architecture

The frontend is a React application built with **Vite**, chosen for fast development iteration and efficient production builds.

**Structural Organization.** The frontend is organized around role-aware routing and rendering: navigation, dashboard content, and available actions are driven by the authenticated user's role (Administrator, Manager, Employee, or, later, Client), keeping role-specific presentation logic centralized rather than scattered across components.

**State and Session Management.** The frontend maintains the session token resulting from login (via JWT or Google OAuth) and attaches it to outgoing requests, and establishes a Socket.io connection after authentication to receive real-time events without polling.

**Styling and Components.** Tailwind CSS provides utility-first styling, while shadcn/ui supplies a consistent, accessible base component library, ensuring visual consistency across several distinct role-based views.

**API Consumption Boundary.** The frontend consumes only the backend's REST API and Socket.io channel; it never holds privileged credentials for MongoDB, Cloudinary, Google's servers, or the Google Gemini API. Every privileged operation — including every AI-assisted request — is mediated and authorized by the backend.

---

### 2.4 Backend Architecture

The backend is a Node.js application built on **Express.js**, structured as the modular monolith introduced in Section 2.1.

**Layered Internal Structure.** Responsibility is separated into routing, middleware (authentication, authorization, validation, centralized error handling), business logic (domain modules), and data access (Mongoose models) — allowing the backend to remain a single deployable unit while internally organized with the discipline of a distributed system.

**Domain Module Organization.** Each domain — Users, Clients, Projects, Tasks, Notifications, Files, Background Jobs, AI Integration — is internally cohesive, with its own routing, logic, and data concerns, minimizing cross-module coupling and supporting the extensibility objective from Chapter 1. The AI Integration module is responsible for mediating every request to the Google Gemini API on behalf of the AI Task Description Generator, AI Project Summary, and AI Comment Summarizer features, and for enforcing that such requests originate only from authenticated, authorized Users.

**Typical Request Lifecycle.** Consider a Manager updating a task's status: the request arrives with an authentication token; authentication middleware resolves the requesting user; authorization middleware checks whether their role and relationship to the task permit the action; input validation checks the incoming data; the Tasks module executes the business rule and determines any side effects; the change is persisted through the Data Access Layer; a structured response is returned; and a Socket.io event notifies other relevant users in real time. This authenticate–authorize–validate–execute–persist–respond–propagate pattern governs every state-changing operation and will be specified precisely in the later API Design chapter.

**Error Handling.** Centralized error-handling middleware ensures failures at any layer are caught, logged, and translated into consistent responses, rather than handled inconsistently module by module.

---

### 2.5 Database Architecture

MongoDB, accessed through **Mongoose**, is the system's data tier. This section describes its architectural role; concrete schemas and relationships are deferred to the Data Modeling chapter.

**Role of Mongoose.** Mongoose adds schema definition, type enforcement, and validation on top of MongoDB's flexible document model, combining the operational flexibility of a document database with the data-integrity discipline (NFR-9) a production system requires.

**Organizing Philosophy.** Data is organized around the core entities introduced in Chapter 1 — Users, Organizations, Clients, Projects, Tasks, Comments/Activity, Notifications, and File metadata — with each entity stored so as to preserve referential consistency with the entities it logically depends on (for example, a task is only meaningful in relation to a valid project). Whether specific relationships are embedded or referenced is a decision for the next chapter, not this one.

**Separation from File Storage.** MongoDB stores only metadata about uploaded files — never binary content, which is Cloudinary's responsibility (Section 2.7) — keeping the database tier focused on structured application data.

**Performance Considerations.** Consistent with NFR-3, the database layer is expected to rely on appropriate indexing and pagination for high-traffic queries; the specific strategy is deferred, but query efficiency is established here as a first-class concern.

---

### 2.6 Authentication & Authorization Architecture

Authentication and authorization span the Authentication module and the authorization middleware described in Section 2.4; full security detail (token expiry, refresh strategy, password hashing, session invalidation) is deferred to a dedicated Security chapter.

**Dual Login Paths, One Session Model.** ClientSphere supports email/password login secured via **JWT**, and federated login via **Google OAuth**. Both paths converge into the same internal representation — a signed session token attached to subsequent requests — so every other backend module remains agnostic to how a user originally authenticated, isolating login-method specifics within the Authentication module.

**Role-Based Access Control.** Authorization is enforced through RBAC aligned with the roles from Chapter 1 (Administrator, Manager, Employee, and, later, Client), checked consistently at the API layer rather than hidden in frontend UI — ensuring unauthorized actions are rejected regardless of how a request was constructed (NFR-1).

**Scoped Authorization.** Beyond role alone, several actions are scoped to a specific relationship (a Manager may only manage their assigned projects; an Employee may only update tasks assigned to them). This principle is established here and will be elaborated with precise rules in the Functional Specification chapter.

---

### 2.7 File Storage Architecture

File and document handling is delegated to **Cloudinary**, a managed media storage and delivery service, rather than self-hosted storage.

**Upload Flow.** A permitted user initiates an upload from the frontend, associated with a specific client, project, or task. The backend authenticates and authorizes the request before the file is transferred to Cloudinary (whether fully backend-proxied or via a backend-issued signed credential is finalized in a later chapter).

**Metadata Persistence.** Once Cloudinary returns a secure delivery URL, the backend persists a reference — URL, filename, uploader, timestamp, associated entity — in MongoDB; binary content never resides in the application database.

**Retrieval and Access Control.** Files are retrieved via their Cloudinary URL, but visibility is governed by the same authorization rules that apply to the entity the file is attached to.

**Why a Managed Service.** Offloading storage, transformation, and CDN delivery to Cloudinary avoids the operational burden of self-hosted storage and lets engineering effort focus on ClientSphere's core domain logic.

---

### 2.8 Real-Time Communication Architecture

**Socket.io** provides a persistent, bidirectional channel between backend and connected clients, complementing — not replacing — the REST API.

**Where Real-Time Is Used.** Consistent with the "without over-engineering" principle from Chapter 1, real-time communication is used specifically for notifications, live project/task status updates, and presence indicators; routine data retrieval continues to use standard REST requests.

**Scoped Delivery.** Events are structured around rooms scoped to relevant entities (a room per project or per user), so events are only delivered to users meant to receive them — both a performance consideration (NFR-3) and a security consideration mirroring the authorization discipline applied to REST endpoints.

**Process Placement.** The Socket.io server runs within the same backend process as the REST API, which is why the backend requires a persistent-process hosting platform (Section 2.10) rather than a purely serverless one.

---

### 2.9 Background Job Processing Architecture (BullMQ + Redis)

Not all backend work belongs inside the synchronous request/response cycle. Sending transactional emails — specifically, the Welcome Email, the Password Reset Email, and the Invitation Email — is either too slow or too failure-prone to execute while a user waits on an HTTP response. ClientSphere addresses this with a background job processing layer built on **BullMQ**, backed by **Redis**.

**Why a Job Queue Is Needed.** Without a job queue, any slow or unreliable operation would either block the user's response until it completes, or risk being lost entirely on failure. A job queue decouples *triggering* an operation from *executing* it: the API layer enqueues a job and responds immediately, while the work is processed independently.

**Role of Redis.** Redis is the fast, in-memory store that BullMQ uses to track job state — queued, active, completed, failed, delayed — and to coordinate job distribution safely, including across multiple backend instances. Redis is therefore an architectural dependency in its own right, alongside MongoDB.

**Role of BullMQ.** BullMQ provides the queueing abstraction: named queues — specifically, a Welcome Email queue, a Password Reset Email queue, and an Invitation Email queue — enqueuing from domain modules when an email should be sent asynchronously, and worker processes that consume jobs with built-in retries, backoff on failure, and delayed/scheduled execution.

**Where This Fits.** Background processing sits within the Asynchronous Processing Layer (Section 2.2, Layer 5). Domain modules do not execute slow side effects directly; they enqueue a job, and a worker performs the execution, and new categories of background work can be introduced as new queues without altering the modules that enqueue them.

**Reliability Characteristics.** Because BullMQ persists job state in Redis rather than only in memory, a failed job can be retried automatically, and jobs are not silently lost if a worker restarts — directly supporting the reliability objective from Chapter 1 (NFR-4).

---

### 2.10 Deployment Architecture

**Topology.** The **frontend** is deployed as a static-built React application on **Vercel**, well suited to a Vite-based SPA. The **backend** — including the REST API, Socket.io server, and BullMQ workers — is deployed as a persistent Node.js service on **Render**, required because both Socket.io connections and BullMQ workers depend on a persistent process rather than a serverless model. **MongoDB** and **Redis** are hosted as managed cloud services external to both platforms (for example, MongoDB Atlas and a managed Redis provider), accessed by the backend over secured connections; specific providers will be confirmed in a later Deployment & DevOps chapter.

**Environment Separation.** The system supports at least Development and Production environments, each with its own environment variables (database strings, JWT secrets, OAuth credentials, Cloudinary credentials, Redis connection details, and Gemini API credentials) and its own CORS configuration, since the frontend and backend are hosted on different origins. Consistent with the security principle established in Section 2.12, Gemini API credentials are stored only within the backend's environment configuration and are never exposed to, or accessible from, the frontend.

**Why This Split-Hosting Model.** This topology reflects the objective from Chapter 1 of a modern split-hosting deployment: it allows frontend and backend to be deployed, scaled, and rolled back independently, using each platform for the workload it is best suited to — edge-optimized static hosting versus persistent-process hosting.

---

### 2.11 Technology Stack Summary

| Technology | Purpose | Reason for Selection |
|---|---|---|
| React | Frontend UI library | Component-based architecture suited to a role-aware, interactive dashboard application |
| Vite | Frontend build tool / dev server | Fast development iteration and efficient production builds |
| Tailwind CSS | Utility-first styling | Rapid, consistent styling across many role-based views |
| shadcn/ui | UI component library | Accessible, consistent base components without building common patterns from scratch |
| Node.js | Backend runtime | Unified JavaScript language across frontend and backend |
| Express.js | Backend web framework | Lightweight, flexible routing and middleware model suited to a modular monolith |
| MongoDB | Primary data store | Flexible document model suited to evolving entities during iterative design |
| Mongoose | Data modeling / ODM | Schema definition, validation, and structured querying over MongoDB |
| JWT | Credential-based authentication | Stateless, widely adopted session representation |
| Google OAuth | Federated authentication | Reduces login friction; offloads identity verification to a trusted provider |
| Cloudinary | File & media storage/delivery | Managed storage, transformation, and CDN delivery without self-hosted overhead |
| Socket.io | Real-time communication | Live notifications and status updates without client-side polling |
| BullMQ | Background job queueing | Reliable, retry-capable asynchronous processing decoupled from the request cycle |
| Redis | Job queue broker / state store | Fast, in-memory store required by BullMQ to track and coordinate jobs |
| Google Gemini API | AI-assisted productivity features | Provides AI Task Description Generation, AI Project Summary Generation, and AI Comment Summarization through a secure backend integration |
| Vercel | Frontend hosting | CDN-optimized static hosting suited to a Vite-built SPA |
| Render | Backend hosting | Supports persistent processes required by Socket.io and BullMQ workers |

---

### 2.12 Architectural Design Principles

**Scalability.** The modular monolith (2.1.1), the separation of synchronous requests from asynchronous jobs (2.9), and the independent deployability of frontend and backend (2.10) allow individual sources of load to be reasoned about, and eventually scaled, without redesigning the whole system.

**Security.** Enforced structurally: the frontend never holds privileged credentials (2.3), including Gemini API credentials, which are stored only on the backend (2.10); authorization is checked at the API layer for every state-changing action (2.6), including every AI-assisted request (2.2); and real-time events are scoped so users only receive data they are authorized to see (2.8).

**Separation of Concerns.** Every layer — presentation, API, business logic, data access, asynchronous processing, external services (2.2) — has a distinct, bounded responsibility, and backend domain modules (2.4) are similarly bounded, so a change to one domain does not require touching unrelated domains.

**Maintainability.** Centralized, consistent handling of authentication, authorization, validation, and error handling (2.4) means these concerns are implemented once and reused everywhere, keeping the codebase easier for a team to reason about over time.

**Extensibility.** The architecture absorbs additional capability without disruption: the Google Gemini API is integrated as an external service providing AI-assisted productivity features while remaining isolated behind a dedicated wrapper and decoupled from the application's core business logic (2.2); new background-work categories can be introduced as new queues without altering existing modules (2.9); and any domain module could, in principle, be extracted into an independent service later (2.1.1).

**Reliability.** Background job retries (2.9) and centralized error handling (2.4) ensure failures are caught and recovered rather than silently lost, while the split-hosting model keeps frontend and backend deployment issues isolated from one another.

**Performance.** Real-time delivery is scoped to avoid unnecessary broadcast overhead (2.8); slow operations are deferred to background workers so they never block a user-facing response (2.9); and indexing and pagination are treated as first-class database concerns rather than an afterthought (2.5).

---

### Conclusion

This chapter has defined the structural foundation of ClientSphere: a three-tier system comprising a decoupled React frontend, a modular monolithic Express backend, and a MongoDB data tier, supported by a Socket.io real-time layer, a BullMQ/Redis background processing layer, and a bounded set of external services (Google OAuth, Cloudinary, and the Google Gemini API) — all deployed through a split-hosting model across Vercel and Render. Every decision described here traces back to the requirements established in Chapter 1 and is anchored to the explicit design principles in Section 2.12.

With the system's architectural shape now fully defined, the next chapter turns to the **Data Model** — the concrete entities, their attributes, and the relationships between them — the natural next layer of detail beneath this architecture.

---

**End of Chapter 2.**

---
---

## Chapter 3: Data Model

### 3.1 Introduction

Chapter 2 established *how* ClientSphere is structurally organized — its tiers, layers, and supporting services. Chapter 3 turns to *what the system remembers*: the core entities that make up its data model, the philosophy that governs how those entities are designed, and the relationships that will eventually connect them.

This chapter is intentionally sequenced ahead of any concrete schema definition. Before deciding how an entity is represented in the database — its exact fields, data types, embedding versus referencing choices, or indexing strategy — it is necessary to agree on *what entities exist conceptually*, *why they exist*, and *what role each plays* in the system as a whole. This section-by-section beginning of Chapter 3 addresses exactly that: the database design philosophy that will govern every subsequent modeling decision, followed by a high-level introduction to each core entity. Field-level detail, attribute definitions, and inter-entity relationships are deliberately deferred to later sections of this chapter, so that the conceptual model can be reviewed and agreed upon on its own terms before implementation-level specifics are layered on top of it.

---

### 3.2 Database Design Philosophy

ClientSphere's data model is guided by a small number of consistent principles, each traceable back to the functional and non-functional requirements established in Chapter 1 and the architectural decisions established in Chapter 2.

**3.2.1 Why MongoDB Is an Appropriate Fit.** ClientSphere's core domain — clients, projects, tasks, and the collaboration that happens around them — is naturally hierarchical and somewhat variable in shape: a project may have few or many tasks, a task may have few or many subtasks and comments, and different organizations using the platform may accumulate different amounts and kinds of activity around their work. MongoDB's document-oriented model accommodates this kind of naturally nested, variably shaped data more gracefully than a rigid, uniformly tabular structure would, particularly during a phase where the product's exact feature set (and therefore its data shape) is still expected to evolve. This flexibility does not come at the cost of discipline, however — as established in Chapter 2, Mongoose is used precisely to reintroduce schema definition and validation at the application layer, so the system gains the adaptability of a document database without sacrificing data integrity.

**3.2.2 Entity-Oriented, Not Table-Oriented, Thinking.** Rather than beginning from a normalized, table-first mindset, ClientSphere's data model begins from the real-world entities a service business actually thinks in — organizations, people, clients, projects, tasks, and the record of activity around them — and only afterward considers how those entities are technically represented. This ordering ensures the data model remains legible to the business logic and to anyone reasoning about the system, rather than becoming an artifact of database mechanics.

**3.2.3 Organizational Boundary as a First-Class Concept.** Every entity in ClientSphere exists in relation to a single owning Organization. This is not merely a convenience; it is the foundation of the data isolation principle established in Chapter 1 (NFR-1) — that data belonging to one organization must be strictly separated from another. This boundary is treated as a first-class modeling concern from the very beginning of the data model, rather than something retrofitted later, precisely because retrofitting data isolation into an already-built system is far riskier than designing it in from the start.

**3.2.4 Referential Consistency Over Convenience.** Consistent with NFR-9 from Chapter 1, the data model is designed so that dependent entities never exist in a meaningless or orphaned state — a task is only meaningful in relation to a valid project, a project only in relation to a valid client and organization, and so on. The specific mechanism for enforcing this (embedding versus referencing, application-level checks versus database-level constraints) is a decision for later sections of this chapter; the principle itself — that these relationships must always be consistent — is established now.

**3.2.5 Designing for Auditability From the Start.** Because Chapter 1 establishes auditability (NFR-7) as a required system quality, the data model treats the historical record of what happened — who changed what, and when — as a first-class entity category in its own right (reflected in the Activity Log entity introduced below), rather than as an afterthought bolted onto other entities.

**3.2.6 Separating Structured Data From Media.** As established in Chapter 2, binary file content is never stored in MongoDB; only metadata describing a file (and a reference to where its actual content lives in Cloudinary) is part of the data model. This keeps the database tier focused on structured, queryable application data.

**3.2.7 Designing for Growth Without Premature Complexity.** The data model is designed to comfortably support the roles, workflows, and scale described in Chapter 1, while deliberately avoiding speculative complexity (for example, structures anticipating billing or multi-tenant white-labeling) that has been explicitly deferred in Chapter 1's scope. This mirrors the same "correctness before features" discipline applied to the architecture in Chapter 2.

---

### 3.3 Core System Entities Overview

This section introduces, at a purely conceptual level, the entities that together form ClientSphere's data model. Each entity is described only in terms of its purpose and role within the system; attributes, fields, and relationships between entities are addressed in later sections of this chapter.

**3.3.1 Organization.** The Organization entity represents a single service-based business using ClientSphere — the owning boundary within which all of that business's users, clients, projects, and activity exist. It is the top-level container referenced by the data isolation principle established in Section 3.2.3, and conceptually anchors every other entity in the system to a specific business tenant.

**3.3.2 Users.** The Users entity represents the individual people who authenticate into ClientSphere on behalf of an Organization or a Client relationship — Administrators, Managers, Employees, and Clients, as introduced in Chapter 1. It exists to represent identity, authentication, and the general profile of a person interacting with the system, independent of what they are specifically permitted to do (which is the concern of the Roles entity).

**3.3.3 Roles.** The Roles entity represents the defined permission levels within the system — Administrator, Manager, Employee, and Client — as established in Chapter 1's target user definitions. It exists to formally encode what a given category of user is authorized to do, supporting the role-based access control architecture described in Chapter 2.

**3.3.4 Clients.** The Clients entity represents the external customers of a service-based business — the parties on whose behalf projects are delivered. It exists to serve as the single source of truth for client identity and account context that Chapter 1 identifies as currently missing in most service businesses' fragmented tooling.

**3.3.5 Projects.** The Projects entity represents a defined body of work being delivered to a specific client. It exists as the primary organizing unit around which tasks, team assignments, timelines, and status are structured, and is the entity through which most day-to-day project management activity in the system takes place.

**3.3.6 Tasks.** The Tasks entity represents an individual unit of work within a project, assignable to a specific team member. It exists to break project-level work down into concrete, trackable, and assignable pieces, forming the operational core of the task management functionality described in Chapter 1.

**3.3.7 Subtasks.** The Subtasks entity represents a further breakdown of an individual task into smaller, more granular units of work. It exists to support cases where a task itself is substantial enough to benefit from internal decomposition and independent progress tracking, without elevating that internal structure to the level of a full task in its own right.

**3.3.8 Comments.** The Comments entity represents discussion and communication attached to a task or project. It exists to keep team communication tied directly to the work it concerns, rather than occurring in disconnected channels such as email or chat applications, directly addressing the communication fragmentation problem identified in Chapter 1.

**3.3.9 Notifications.** The Notifications entity represents a discrete alert delivered to a specific user in response to a relevant system event — an assignment, a status change, a comment, and so on. It exists to support the real-time awareness objective described in Chapter 1 and the real-time communication architecture described in Chapter 2.

**3.3.10 Activity Logs.** The Activity Log entity represents a chronological record of significant actions taken within the system — status changes, assignments, role changes, and similar state transitions. It exists specifically to satisfy the auditability principle established in Section 3.2.5, providing a traceable history of what happened within an organization's use of the platform.

**3.3.11 File Metadata.** The File Metadata entity represents the descriptive record of a file or document associated with a client, project, or task — its name, uploader, timestamp, and reference to its actual stored content. It exists to let the system track and govern access to files without storing binary content directly, consistent with the separation of structured data from media described in Section 3.2.6.

Together, these eleven entities form the conceptual vocabulary of ClientSphere's data model. The sections that follow later in this chapter will define each entity's specific attributes, the relationships that connect them, and the modeling decisions (such as embedding versus referencing) required to represent those relationships within MongoDB.

---

### 3.4 Entity Descriptions

Section 3.3 introduced each core entity at the level of a single sentence. This section expands on that introduction, examining each entity's responsibility within the system, its purpose from the perspective of the business problem it addresses, its lifecycle from creation to eventual archival or deletion, who or what owns it, and why it matters to ClientSphere as a whole.

Before doing so, one refinement to the conceptual model introduced in Section 3.3 should be made explicit. Section 3.3 introduced Roles as a distinct entity. On further consideration, a standalone Roles entity is not architecturally justified for ClientSphere at its current stage: the set of roles in the system is small, fixed by the platform itself rather than defined or customized by individual organizations, and used purely as an authorization label rather than as an object with its own independent lifecycle or behavior. Introducing a separate entity for something that is, in practice, a constrained classification would add modeling overhead without a corresponding architectural benefit. Accordingly, from this point forward, **role is treated as an authorization property of the User entity** — a defining characteristic of a user, rather than a freestanding entity in its own right. Should ClientSphere later require organization-defined custom roles or fine-grained, per-permission configurability, this decision can be revisited; no other entity in the system depends on Roles existing independently, so this refinement has no disruptive effect on the remainder of the data model.

**3.4.1 Organization**
*Responsibility:* The Organization entity is responsible for representing a single service-based business as a distinct tenant within ClientSphere, and for serving as the ultimate owning boundary for every other entity in the system.
*Purpose:* Its purpose is to make the data isolation principle established in Section 3.2.3 concrete — every User, Client, Project, and downstream entity exists because it belongs, directly or indirectly, to exactly one Organization.
*Lifecycle:* An Organization is created once, at the point a business first adopts ClientSphere, and persists for the entire duration of that business's use of the platform. It is a long-lived entity, rarely modified in its core identity, though it may accumulate configuration or settings over time (addressed in later sections).
*Ownership:* An Organization is not owned by any other entity in the system; it is the root of ownership itself. It is, however, administered by one or more Users holding the Administrator role.
*Importance:* Without the Organization entity, there would be no structural boundary preventing one business's clients, projects, or team members from being visible to another's — it is the single most foundational entity in the entire data model.

**3.4.2 User**
*Responsibility:* The User entity is responsible for representing an individual person who authenticates into ClientSphere and interacts with the system on behalf of their Organization.
*Purpose:* Its purpose is to serve as the identity and authorization anchor for every action taken within the system — every task assignment, comment, uploaded file, and status change is ultimately attributable to a specific User, and every permission check in the system (Chapter 2, Section 2.6) resolves against a User's role.
*Lifecycle:* A User is created when an individual is invited to or registers with an Organization's ClientSphere instance (via credential-based registration or Google OAuth), persists through the ongoing course of their employment or engagement with that Organization, and is eventually deactivated (rather than necessarily deleted outright, to preserve historical attribution on past work) when they leave.
*Ownership:* A User belongs to exactly one Organization and carries a role (Administrator, Manager, Employee, or Client) as an authorization property, per the refinement above.
*Importance:* The User entity is the acting subject behind virtually every other entity's activity in the system; it is the entity through which the human accountability and auditability objectives from Chapter 1 are made possible.

**3.4.3 Client**
*Responsibility:* The Client entity is responsible for representing an external customer of the Organization — the party on whose behalf work is performed.
*Purpose:* Its purpose is to serve as the single, authoritative record of a customer relationship, addressing the fragmentation and lost-context problems identified in Chapter 1's problem statement.
*Lifecycle:* A Client record is created when a new customer relationship begins, is actively maintained and referenced throughout the life of that relationship (across potentially many Projects over time), and is eventually archived — rather than deleted — when the relationship concludes, so that historical project and communication context is preserved.
*Ownership:* A Client belongs to exactly one Organization; it is not owned by any individual User, though specific Users may be associated with managing it.
*Importance:* The Client entity is the anchor point around which the entire service-delivery relationship is organized — every Project in the system exists because it is being delivered to some Client. Authenticated Users carrying the Client role (Section 3.4.2) are associated with a specific Client record and are granted controlled access to their assigned Projects, assigned Tasks, shared Files, Notifications, and permitted Comment discussions, while remaining restricted from internal organizational data through the role-based access control described in Chapter 2 (Section 2.6).

**3.4.4 Project**
*Responsibility:* The Project entity is responsible for representing a defined, bounded body of work being delivered to a specific Client.
*Purpose:* Its purpose is to serve as the primary organizing unit of day-to-day work — the level at which timelines, priority, overall status, and team assignment are defined — directly supporting the project management functional requirements from Chapter 1.
*Lifecycle:* A Project is created when work for a Client is initiated, moves through a sequence of states as work progresses (to be enumerated precisely in a later section), and is eventually closed out upon completion or, in some cases, cancellation — with its historical record retained rather than removed.
*Ownership:* A Project belongs to exactly one Client (and, transitively, to that Client's Organization), and is typically overseen by one or more Users holding the Manager role.
*Importance:* The Project entity is the pivot point of the entire system: it is where client context (Client), work breakdown (Task), team involvement (User), collaboration (Comment), and documentation (File Metadata) all converge.

**3.4.5 Task**
*Responsibility:* The Task entity is responsible for representing a single, concrete unit of assignable work within a Project.
*Purpose:* Its purpose is to translate a Project's overall scope into discrete, trackable pieces of work that can be assigned to individuals, given deadlines, and monitored to completion, forming the operational core of the task management functionality identified in Chapter 1.
*Lifecycle:* A Task is created within the context of a Project, progresses through a defined set of status states as it is worked on, and is ultimately marked complete (or, occasionally, cancelled) — remaining part of the historical record of the Project even after completion.
*Ownership:* A Task belongs to exactly one Project, and is typically assigned to exactly one User at a given time, though its assignment may change over its lifecycle.
*Importance:* The Task entity is the primary unit through which an Employee experiences and interacts with the system, and the primary unit through which a Manager or Administrator gauges real-time project progress.

**3.4.6 Subtask**
*Responsibility:* The Subtask entity is responsible for representing a further, more granular breakdown of an individual Task.
*Purpose:* Its purpose is to accommodate Tasks substantial enough to benefit from internal decomposition, allowing progress to be tracked at a finer resolution without requiring every small step of work to be elevated to the level of a full, independently assignable Task.
*Lifecycle:* A Subtask is created in the context of a specific Task, is completed (typically before or alongside its parent Task), and is retained as part of that Task's historical record once done.
*Ownership:* A Subtask belongs to exactly one Task, and, transitively, to that Task's Project.
*Importance:* While not always required, the Subtask entity gives the system the flexibility to represent varying degrees of task complexity without forcing either excessive granularity (many trivial top-level Tasks) or insufficient granularity (large, opaque Tasks with no visible internal progress).

**3.4.7 Comment**
*Responsibility:* The Comment entity is responsible for representing a discrete unit of discussion or communication attached to a Task or Project.
*Purpose:* Its purpose is to keep team and Client communication directly and permanently tied to the specific piece of work it concerns, directly addressing the communication fragmentation problem identified in Chapter 1's problem statement.
*Lifecycle:* A Comment is created at the moment a User contributes to a discussion, and — unlike many other entities in this system — is not expected to move through a status lifecycle of its own; it exists as a permanent (or editable, subject to rules defined later) part of the historical record of the Task or Project it is attached to.
*Ownership:* A Comment belongs to exactly one Task or Project, and is attributed to exactly one authoring User.
*Importance:* The Comment entity is what allows ClientSphere to function as a genuine collaboration platform rather than a purely administrative tracking tool — it is where the actual conversation about the work takes place.

**3.4.8 Notification**
*Responsibility:* The Notification entity is responsible for representing a discrete alert generated in response to a system event and intended for a specific User.
*Purpose:* Its purpose is to make relevant changes elsewhere in the system (an assignment, a status change, a new Comment) visible to the Users who need to know about them, without requiring those Users to actively poll or search for updates — directly supporting the real-time awareness objective from Chapter 1 and the real-time architecture from Chapter 2.
*Lifecycle:* A Notification is created automatically at the moment a relevant triggering event occurs, exists in an unread state until the recipient User views or acknowledges it, and is eventually considered resolved (though, unlike most entities in this system, individual Notifications are of relatively short-lived practical relevance once acknowledged).
*Ownership:* A Notification belongs to exactly one recipient User, though it is generated as a consequence of activity on some other entity (a Task, Project, or Comment).
*Importance:* The Notification entity is what makes ClientSphere feel responsive and current rather than something Users must actively check — it is the data-model counterpart to the real-time communication architecture described in Chapter 2.

**3.4.9 Activity Log**
*Responsibility:* The Activity Log entity is responsible for representing a permanent, chronological record of a significant state-changing action taken within the system.
*Purpose:* Its purpose is to satisfy the auditability principle established in Section 3.2.5 — providing a traceable answer to "who did what, and when" for the kinds of actions (status changes, assignments, role changes) that matter to accountability within an Organization.
*Lifecycle:* An Activity Log entry is created automatically at the moment a relevant action occurs and is never modified or deleted thereafter; unlike nearly every other entity in this system, it is designed to be strictly append-only, since a historical record that could be altered after the fact would defeat its purpose.
*Ownership:* An Activity Log entry belongs to the Organization in which the action occurred, and references the acting User and the entity that was affected.
*Importance:* The Activity Log entity is what allows ClientSphere to answer accountability and history questions with confidence — a capability that ad hoc tools (spreadsheets, informal chat threads) identified in Chapter 1 fundamentally lack.

**3.4.10 File Metadata**
*Responsibility:* The File Metadata entity is responsible for representing the descriptive record of a file or document associated with a Client, Project, or Task.
*Purpose:* Its purpose is to let the system track, govern access to, and display files without storing their binary content directly, consistent with the separation of structured data from media established in Section 3.2.6 and the file storage architecture described in Chapter 2.
*Lifecycle:* A File Metadata record is created at the moment a file is successfully uploaded to Cloudinary, persists for as long as the file remains relevant to its associated entity, and is removed (along with, typically, the underlying stored file) if it is deliberately deleted by an authorized User.
*Ownership:* A File Metadata record belongs to exactly one associated entity — a Client, Project, or Task — and is attributed to the User who uploaded it.
*Importance:* The File Metadata entity is what allows ClientSphere to present deliverables, contracts, and briefs as an integrated part of the work they relate to, rather than as files scattered across disconnected storage tools — directly addressing one of the fragmentation problems identified in Chapter 1.

---

### 3.5 Entity Relationships

Section 3.4 examined each entity individually. This section describes how these entities relate to and depend on one another. All relationships are described conceptually, in terms of ownership, cardinality, and dependency; the specific mechanism by which a relationship is technically represented within MongoDB (embedding a related entity directly within its parent document versus referencing it by identifier) is a modeling decision reserved for a later section of this chapter.

**3.5.1 Organization → Users**
An Organization has a **one-to-many** relationship with Users: a single Organization is associated with many Users, while each User belongs to exactly one Organization. This relationship is foundational rather than incidental — a User's very existence within the system is meaningless outside the context of the Organization it belongs to, and every permission a User holds is ultimately scoped within that Organization's boundary.

**3.5.2 Organization → Clients**
An Organization has a **one-to-many** relationship with Clients: a single Organization maintains many Client records, while each Client belongs to exactly one Organization. This mirrors the Organization–Users relationship and reinforces the same data isolation principle — one Organization's Clients must never be visible to, or confusable with, another Organization's Clients.

**3.5.3 Client → Projects**
A Client has a **one-to-many** relationship with Projects: a single Client may have many Projects delivered to them over time (a service business rarely delivers only one project per customer relationship), while each Project belongs to exactly one Client. A Project's dependency on its Client is strict — a Project cannot meaningfully exist without a Client it is being delivered to, reflecting the referential consistency principle established in Section 3.2.4.

**3.5.4 Project → Tasks**
A Project has a **one-to-many** relationship with Tasks: a single Project is broken down into many Tasks, while each Task belongs to exactly one Project. This is the relationship through which a Project's overall scope becomes concretely actionable, and it is similarly a strict dependency — a Task divorced from a Project has no meaningful context in this system.

**3.5.5 Task → Subtasks**
A Task has a **one-to-many** relationship with Subtasks: a single Task may be broken down into many Subtasks, while each Subtask belongs to exactly one Task. Unlike the Project–Task relationship, this relationship is optional rather than mandatory for every Task — many Tasks will have no Subtasks at all, and the presence of Subtasks reflects a Task's internal complexity rather than a universal structural requirement.

**3.5.6 Task/Project → Comments**
Both Tasks and Projects have a **one-to-many** relationship with Comments: a single Task or Project may accumulate many Comments over time, while each Comment belongs to exactly one Task or Project (not both simultaneously). This relationship is additive and open-ended by nature — unlike Tasks within a Project, Comments are not part of the "work breakdown" of their parent entity, but rather an ongoing, unbounded record of discussion attached to it.

**3.5.7 User → Tasks**
A User has a **one-to-many** relationship with Tasks through assignment: a single User may be assigned many Tasks across one or more Projects, while, at a given point in time, a Task is typically assigned to exactly one User. This relationship is distinct from ownership in the structural sense (a Task is owned by its Project, not by the User assigned to it) — it instead represents a responsibility association that may change over a Task's lifecycle as reassignment occurs.

**3.5.8 User → Notifications**
A User has a **one-to-many** relationship with Notifications: a single User accumulates many Notifications over time, while each Notification belongs to exactly one recipient User. This relationship is directional and consequential rather than structural — a Notification exists only because some other event occurred elsewhere in the system (an assignment, a status change, a Comment), and it is directed at a User rather than being created by one.

**3.5.9 User → Activity Logs**
A User has a **one-to-many** relationship with Activity Log entries as the acting party: a single User's actions accumulate many Activity Log entries over time, while each Activity Log entry references exactly one acting User (and, in most cases, one affected entity such as a Task or Project). This relationship is what gives the Activity Log its accountability value — every entry can always be traced back to the specific User responsible for the action it records.

**3.5.10 Files Attached to Clients, Projects, or Tasks**
File Metadata has a **one-to-many, polymorphic** relationship with the entities it can be attached to: a single Client, Project, or Task may have many associated File Metadata records, while each File Metadata record belongs to exactly one such parent entity (a Client, a Project, or a Task, but never more than one at a time, and never more than one type simultaneously). This is described as polymorphic because, conceptually, the "parent" of a given File Metadata record may be any one of three different entity types, rather than always the same type — a distinction that will need to be resolved into a concrete modeling approach in a later section of this chapter.

**3.5.11 Summary of Dependency Direction**
Taken together, these relationships form a consistent dependency direction running from Organization, down through Client, Project, and Task, to Subtask, Comment, Notification, Activity Log, and File Metadata. Every entity beneath Organization in this chain depends, directly or transitively, on the entities above it for its own meaning and existence — a Subtask has no meaning without its Task, a Task has no meaning without its Project, and so on, all the way back to the Organization boundary established in Section 3.2.3. This consistent directional dependency is what will make the referential-integrity rules referenced throughout this chapter enforceable in practice, and it is the conceptual structure that the remaining sections of this chapter will translate into concrete data-modeling decisions.

---

### 3.6 Data Integrity Constraints

Section 3.5 established how entities depend on one another. This section defines the design principles that ensure those dependencies remain trustworthy over time — that is, that the data model does not merely describe relationships on paper, but actively resists becoming inconsistent as the system is used, extended, and operated at scale. These are stated here as principles the system must uphold; the specific mechanisms (schema-level validation, application-level checks, or database-level constraints) by which they are enforced are an implementation concern outside the scope of this SRS.

**3.6.1 Entity Ownership as a Constraint, Not Just a Description.** Section 3.4 described ownership for each entity (a Project is owned by a Client, a Task by a Project, and so on). Within this section, ownership is elevated from a descriptive property to an enforced constraint: an entity must never be created, or allowed to persist, without a valid reference to the entity that owns it. A Task without a Project, or a Project without a Client, is not merely unusual — it is treated as an invalid system state that must be prevented.

**3.6.2 Referential Integrity Across the Dependency Chain.** Consistent with the referential consistency principle from Section 3.2.4, every reference from one entity to another (User to Organization, Task to Project, Comment to its parent Task or Project, File Metadata to its parent entity) must, at all times, point to an entity that actually exists and is of the expected type. The system must not permit a reference to be created against a nonexistent or mismatched target, and must account for what happens to dependent entities if a referenced entity is removed or archived — addressed further in Section 3.8.

**3.6.3 Prevention of Orphaned Records.** An orphaned record — a dependent entity whose owning entity has been removed while the dependent entity remains — represents a direct violation of the referential integrity principle above, and is treated as a defect to be architecturally prevented rather than a condition the system tolerates and works around. This principle directly shapes the data lifecycle policies described in Section 3.8, where deletion is deliberately constrained to avoid producing orphaned dependents.

**3.6.4 Mandatory Versus Optional Relationships.** Not every relationship identified in Section 3.5 carries the same weight. Some relationships are mandatory — a Task cannot exist without a Project, and a Project cannot exist without a Client — reflecting entities whose very identity depends on their parent. Others are optional — a Task may or may not have Subtasks, an entity may or may not have associated File Metadata. The data model must clearly distinguish these two categories, since mandatory relationships require strict enforcement at creation time, while optional relationships require only that, if present, they conform to the same referential integrity rules.

**3.6.5 Validation as a Layered Principle.** Data validity in ClientSphere is not the responsibility of a single point in the system, but a layered principle applied consistently across the architecture described in Chapter 2: input is validated when it enters the system through the API layer, business rules are enforced within the relevant domain module, and structural validity is reinforced at the data access layer. This layered approach ensures that no single missed check becomes the sole line of defense against invalid data.

**3.6.6 Business Rule Enforcement Beyond Structural Validity.** Some integrity requirements are not purely structural but reflect the business logic of a service-delivery platform — for instance, a Task should not be assignable to a User who has no association with the Organization owning the Project, and a Client should not be archived while it still has active Projects in progress. These rules are treated as part of the data model's integrity contract, even though they are enforced through business logic rather than through the shape of the data alone.

**3.6.7 Organizational Data Isolation as an Integrity Concern.** Building on the isolation principle established in Section 3.2.3, data integrity in ClientSphere explicitly includes isolation between Organizations: no query, relationship, or operation should ever be capable of associating one Organization's Users, Clients, Projects, or other entities with another Organization's data. This is treated not merely as a security property (addressed in Chapter 2's authorization architecture) but as a data integrity property in its own right — cross-organization contamination of data would represent a fundamental correctness failure of the model, independent of any authorization check.

**3.6.8 Consistent Auditability.** As established in Section 3.2.5 and reflected in the Activity Log entity (Section 3.4.9), auditability is itself an integrity concern: an Activity Log entry, once created, must remain accurate and unaltered, and every significant state-changing action across every entity in the system must reliably produce a corresponding record. A gap in this record — an action that occurred without leaving a trace — represents a failure of the data model's integrity just as surely as an orphaned record does, since it undermines the trustworthiness of the historical account the system is designed to provide.

---

### 3.7 Indexing Strategy

Where Section 3.6 addressed the correctness of ClientSphere's data, this section addresses its efficiency at scale. Indexing is the primary mechanism by which a document database sustains acceptable read performance as data volume grows, and it is treated here as a design philosophy rather than a set of concrete definitions — consistent with the performance objective established in Chapter 1 (NFR-3) and the database architecture described in Chapter 2 (Section 2.5.4), the actual index definitions themselves are an implementation-phase concern and are deliberately not specified in this SRS.

**3.7.1 Purpose of Indexing in This System.** Without appropriate indexing, a document database must scan larger and larger portions of a collection to satisfy even simple lookups as the volume of Organizations, Users, Clients, Projects, and Tasks grows. Indexing exists to keep the most frequent and performance-sensitive queries fast regardless of overall data volume, directly supporting ClientSphere's scalability objective (Chapter 1, NFR-2) and its expectation of responsive dashboards and task views (NFR-3).

**3.7.2 Organization Ownership.** Because nearly every query in the system is implicitly or explicitly scoped to a single Organization (per the isolation principle in Section 3.2.3 and 3.6.7), efficient lookup by owning Organization is expected to be one of the most foundational indexing needs in the entire system — underlying queries across Users, Clients, Projects, and most other entities.

**3.7.3 User Authentication and Lookup.** Login operations, by their nature, must resolve a user's identity quickly and are among the most frequent operations in the system; efficient lookup by the credentials or identity fields used during authentication (whether via JWT-based credential login or Google OAuth) is therefore a priority indexing concern.

**3.7.4 Client Search.** As an Organization's client base grows, the ability to quickly locate a specific Client — whether by name or other identifying detail, per the search and filtering functional requirement from Chapter 1 (FR-010) — depends on efficient lookup structures scoped within an Organization's boundary.

**3.7.5 Project Retrieval.** Because Projects are the primary organizing unit of daily work (Section 3.4.4), efficient retrieval of Projects — by their owning Client, by their current status, or by assigned team members — is expected to be a heavily used access pattern, particularly for the role-specific dashboards described in Chapter 1 (FR-009).

**3.7.6 Task Assignment and Status.** Tasks are the entity through which Employees and Managers most frequently interact with the system (Section 3.4.5), and queries filtering Tasks by assigned User or by current status (to populate personal task lists or project-level status views) are expected to be among the most frequent queries in the entire system, warranting corresponding indexing attention.

**3.7.7 Notification Retrieval.** Because Notifications are generated frequently and are typically retrieved per-User in near real time (Section 3.4.8), efficient lookup scoped to a specific recipient User — and likely further scoped by read/unread state — is necessary to keep the real-time experience described in Chapter 2 responsive.

**3.7.8 Activity Log History.** Activity Log entries (Section 3.4.9) accumulate continuously and are, by design, never deleted (Section 3.6.8); efficient retrieval of a chronological history — scoped to an Organization, a specific entity, or a specific acting User — is necessary to prevent this ever-growing collection from becoming a performance liability precisely because of its intentionally permanent nature.

**3.7.9 File Metadata Lookup.** Because File Metadata records are typically retrieved in the context of whichever Client, Project, or Task they are attached to (Section 3.4.10), efficient lookup scoped to that parent entity is the primary indexing need for this entity.

**3.7.10 Balancing Read Performance, Write Overhead, and Storage Cost.** Indexing is not a cost-free optimization: every index added improves the read patterns it supports, but also adds overhead to every write operation that touches the indexed fields, and consumes additional storage. The indexing philosophy for ClientSphere is therefore one of deliberate restraint — indexes are warranted where they support genuinely frequent, performance-sensitive access patterns (such as those identified above), rather than being added speculatively for every conceivable query. This balance will be revisited and made concrete once real usage patterns and query frequencies are better understood during implementation, at which point specific index definitions — outside the scope of this SRS — will be established.

---

### 3.8 Data Lifecycle Management

The entities described throughout this chapter do not exist in a static state; each moves through a lifecycle from creation to eventual retirement. This section describes the principles governing that lifecycle at a conceptual level, extending the individual per-entity lifecycle notes introduced in Section 3.4 into a coherent, system-wide policy.

**3.8.1 Creation.** Every entity in ClientSphere comes into existence as the direct result of a deliberate action by an authenticated User (or, in limited cases such as Notifications and Activity Log entries, as an automatic consequence of another User's action), and, per Section 3.6.1, is never permitted to exist without satisfying its mandatory ownership relationships at the moment of creation.

**3.8.2 Updates.** Most entities in the system are expected to be updated over the course of their lifecycle — a Project's status changes, a Task is reassigned, a Client's contact details are corrected. Updates are treated as a normal and expected part of an entity's life, provided they do not violate the integrity constraints established in Section 3.6; where an update represents a significant state change (a status transition, a reassignment), it is expected to produce a corresponding Activity Log entry, consistent with the auditability principle established throughout this chapter.

**3.8.3 Soft Deletion Versus Hard Deletion.** ClientSphere distinguishes between two conceptually different forms of removal. **Soft deletion** — marking an entity as inactive, archived, or no longer current, while retaining its underlying record — is the default and strongly preferred approach for business-significant entities such as Clients, Projects, and Users, since it preserves historical context and satisfies the auditability principle even after an entity is no longer active. **Hard deletion** — the permanent, irreversible removal of a record — is reserved for narrower cases where retaining the record serves no business purpose and may even be undesirable (for example, a File Metadata record explicitly and deliberately removed by an authorized User, or a Notification that has already served its purpose and aged out). This distinction reflects a deliberate philosophy: the system defaults toward preservation, and treats permanent removal as the exception rather than the rule.

**3.8.4 Archival.** Archival is the specific application of soft deletion to entities that remain business-relevant historically but are no longer part of active, ongoing work — an Organization archiving a Client relationship that has ended, or a completed Project being moved out of active dashboards. Archived entities remain fully present in the data model and retain all of their historical relationships (their past Projects, Tasks, Comments, and Activity Log entries), but are excluded from the active, day-to-day views described in Chapter 1's functional requirements.

**3.8.5 Historical Preservation as a Default Stance.** Across every entity described in this chapter, the default lifecycle stance is preservation rather than deletion. This reflects a deliberate design position: for a platform whose value proposition includes being a single source of truth for client and project history (Chapter 1, Section 1.2.2), permanently discarding historical operational data would directly undermine the platform's core purpose. Entities are removed outright only when there is a clear and specific reason to do so, never as a default behavior of the system.

**3.8.6 Audit Retention.** Consistent with Section 3.6.8, Activity Log entries are treated as permanent once created and are not subject to the soft-deletion or archival lifecycle applied to other entities — they are retained indefinitely as the authoritative historical record of the Organization's use of the platform, independent of whether the entities they reference (a Project, a Task) have themselves since been archived.

**3.8.7 File Lifecycle.** A File Metadata record's lifecycle is tied to, but not strictly identical to, the lifecycle of its parent entity: a file remains retrievable for as long as its parent Client, Project, or Task remains part of the system's record (including while archived), and is only removed — along with its underlying stored content in Cloudinary — when explicitly and deliberately deleted by an authorized User, consistent with the narrower hard-deletion case described in Section 3.8.3.

**3.8.8 Organization Offboarding Considerations.** When a business ceases using ClientSphere altogether, the Organization entity itself — and everything that depends on it — reaches the end of its lifecycle. Consistent with the preservation-first philosophy established throughout this section, offboarding is expected to default toward deactivation or archival of the entire Organization (and its full dependency chain of Clients, Projects, Tasks, and historical records) rather than immediate, irreversible deletion, in order to accommodate scenarios such as data export requests, dispute resolution, or a business resuming use of the platform after a period of inactivity. The precise policies and retention periods governing full data deletion upon a formal offboarding request are a matter of business and legal policy, and will be addressed in a later chapter alongside broader compliance considerations, rather than being fully specified here.

---

### 3.9 Design Assumptions and Future Extensibility

The data model described throughout this chapter is not a neutral, all-purpose design — it reflects a set of deliberate assumptions appropriate to ClientSphere's current stage, and it has been shaped with an explicit eye toward how it will need to grow. This section makes those assumptions explicit and describes the extension points the model has been designed to accommodate.

**3.9.1 Governing Assumption: This Model Serves the MVP Scope Defined in Chapter 1.** Every entity, relationship, and principle established in this chapter has been deliberately scoped to the initial product vision defined in Chapter 1, Section 1.4 — a single-Organization-focused platform supporting Client, Project, and Task management, team collaboration, file handling, and real-time notifications. The model intentionally does not attempt to anticipate every conceivable future capability up front. This mirrors the "correctness before features" and "progressive disclosure of complexity" principles introduced in Chapter 1 (Section 1.3.3): a data model that tried to pre-accommodate every plausible future feature today would carry unjustified complexity into the current build, in exchange for flexibility that may never be needed in the form anticipated.

**3.9.2 Assumption: Roles Are Fixed and Platform-Defined.** As established in Section 3.4, the current model assumes a small, fixed set of platform-defined roles (Administrator, Manager, Employee, and Client) rather than organization-customizable roles or granular, per-permission configurability. This assumption keeps the authorization model simple for the current scope, while remaining a clearly identified point at which the model would need to change if requirements evolved.

**3.9.3 Assumption: Single-Tenant Focus Within a Multi-Organization Platform.** The model assumes that each Organization operates independently, with no current requirement for cross-Organization collaboration, shared Clients, or shared Projects between separate Organizations. This assumption keeps the isolation principle established in Section 3.2.3 clean and unambiguous, and reflects the out-of-scope determination on multi-tenant white-labeling noted in Chapter 1, Section 1.4.3.

**3.9.4 Assumption: A Flat Project–Task–Subtask Hierarchy Is Sufficient.** The model assumes that a three-level breakdown of work — Project, Task, Subtask — is sufficient to represent the granularity of work service businesses need to track, rather than an arbitrarily deep, recursive hierarchy of nested work items. This assumption keeps the Task and Subtask entities described in Section 3.4 straightforward, while remaining an identified point of potential future revision should more complex project methodologies be required.

**3.9.5 Extensibility Without Fundamental Redesign.** The entities and relationships established in this chapter have been deliberately organized so that future capabilities can be introduced as additive extensions to the existing model, rather than requiring the foundational structure — the Organization boundary, the Client–Project–Task dependency chain, and the ownership and integrity principles established in Sections 3.2, 3.5, and 3.6 — to be reworked. The following future enhancements, several of which were already identified as explicitly deferred in Chapter 1 (Section 1.4.2), illustrate this extensibility:

- **Custom Roles and Permissions:** Should organization-defined roles or fine-grained permission configuration become necessary, this can be introduced by evolving the role property described in Section 3.4.2 into a more expressive permissions structure, without altering the User entity's relationship to the rest of the model.
- **Enhanced Client Portal Capabilities:** Beyond the controlled access already granted to the Client role in Version 1 (Sections 3.3.3, 3.4.2, 3.4.3) — assigned Projects, assigned Tasks, shared Files, Notifications, and permitted Comment discussions — additional self-service capabilities could be layered onto the existing Client-facing visibility rules without altering the underlying entity model, since Clients, Projects, Tasks, Comments, and File Metadata are already modeled as distinct entities capable of supporting scoped, restricted access.
- **Team-Based Workspaces:** Should an Organization require internal subdivision (departments, pods, or sub-teams) beneath the Organization level, this can be introduced as a new layer between Organization and User/Project without disturbing the existing Organization-level isolation principle.
- **Billing and Invoicing:** Financial entities (invoices, payment records) can be introduced as new entities associated with existing Clients and Projects, following the same ownership and referential integrity principles already established in Sections 3.5 and 3.6.
- **Time Tracking:** Time-tracking records can be introduced as a new entity associated with Tasks and Users, following the same User-to-Task relationship pattern already established in Section 3.5.7.
- **Calendar and Scheduling:** Scheduling entities (deadlines, milestones, calendar events) can be layered onto existing Project and Task entities as additional associated data, rather than requiring those core entities to be restructured.
- **Expanded AI-Powered Insights and Analytics:** Beyond the three AI-assisted productivity features already integrated via the Google Gemini API in Version 1 — the AI Task Description Generator, AI Project Summary, and AI Comment Summarizer, described in Chapter 2 (Section 2.2) — any future, more advanced AI-powered insights or analytics could consume the existing entity model (Projects, Tasks, Activity Logs) as their input, rather than requiring a parallel or replacement data model.
- **Third-Party Integrations:** Future integrations (with external calendars, communication tools, or accounting systems) can be represented as additional metadata or reference fields on existing entities, following the same pattern already used for Cloudinary-backed File Metadata.
- **Advanced Reporting:** Deeper analytics and reporting, deferred in Chapter 1 (Section 1.4.2), can be built as read-oriented consumers of the existing entity and Activity Log data, rather than requiring new source-of-truth entities.

**3.9.6 Why These Are Extension Points, Not Current Requirements.** Each of the capabilities listed above is intentionally excluded from the current scope, consistent with the scope boundary established in Chapter 1, Section 1.4. Their exclusion is not an oversight but a deliberate choice to keep the current architecture lean, comprehensible, and maintainable, per the guiding principles introduced in Chapters 1 and 2. The purpose of identifying them here is to demonstrate that this restraint does not come at the cost of future flexibility — the model has been shaped so that each of these capabilities, if and when prioritized, can be added additively rather than forcing a foundational redesign of the entities and relationships established throughout this chapter.

---

### 3.10 Chapter Summary

Chapter 3 has established ClientSphere's conceptual data model — the "what the system remembers" counterpart to the architectural "how the system works" established in Chapter 2.

The chapter began by defining a **database design philosophy** (Section 3.2) grounded in MongoDB's suitability for ClientSphere's naturally nested and variably shaped domain, an entity-first mode of thinking, the Organization boundary as a first-class concern, referential consistency, built-in auditability, separation of structured data from media, and deliberate restraint against premature complexity. It then introduced the system's **core entities** (Section 3.3, expanded in Section 3.4) — Organization, User, Client, Project, Task, Subtask, Comment, Notification, Activity Log, and File Metadata — describing each one's responsibility, purpose, lifecycle, and ownership, and refining the model along the way by treating Role as an authorization property of User rather than a standalone entity.

Building on those entities, the chapter described the **relationships** that connect them (Section 3.5), establishing a consistent dependency chain running from Organization down through Client, Project, Task, and their dependents, with cardinality and ownership defined in prose ahead of any implementation-level modeling decision. It then translated those relationships into a set of **data integrity principles** (Section 3.6) — ownership as an enforced constraint, referential integrity, orphan prevention, the distinction between mandatory and optional relationships, layered validation, business rule enforcement, organizational isolation, and consistent auditability — followed by an **indexing philosophy** (Section 3.7) identifying where read performance matters most across the entity set, while explicitly deferring concrete index definitions to the implementation phase. The chapter then addressed **data lifecycle management** (Section 3.8), establishing a consistent preference for soft deletion, archival, and historical preservation over permanent deletion, in direct service of ClientSphere's role as a durable system of record. Finally, this section's preceding discussion (Section 3.9) made explicit the assumptions underlying the current model and demonstrated that the model has been deliberately shaped to absorb significant future capabilities — custom roles, enhanced client portal capabilities, team workspaces, billing, time tracking, scheduling, expanded AI-powered insights, third-party integrations, and advanced reporting — as additive extensions rather than requiring foundational redesign.

Throughout, this chapter has remained deliberately implementation-independent: no schemas, field definitions, embedding-versus-referencing decisions, or index syntax have been specified, consistent with its purpose as a conceptual data model rather than a technical database design document.

With both the system's architecture (Chapter 2) and its conceptual data model (Chapter 3) now established, the next chapter turns to **functional behavior** — defining, in precise and testable terms, how Users interact with the entities defined in this chapter to accomplish the goals identified in Chapter 1: creating and managing Clients and Projects, assigning and completing Tasks, collaborating through Comments, and receiving Notifications, all governed by the roles, relationships, and integrity principles this chapter has put in place.

---

**End of Chapter 3.**

---
---

## Chapter 4: Functional Requirements

### 4.1 Introduction

Chapters 2 and 3 established, respectively, *how ClientSphere is structured* and *what it remembers*. Chapter 4 turns to *what the system does* — the observable behavior ClientSphere must exhibit from the perspective of the Users who interact with it, expressed in precise, verifiable terms.

Where Chapter 1 stated functional requirements at a high level (Section 1.6), sufficient to establish the product's functional footprint, this chapter decomposes that footprint into detailed, individually identifiable requirements. Each requirement in this chapter describes a specific piece of system behavior — what must happen, under what conditions, and from whose perspective — without prescribing how that behavior is technically implemented. The architecture defined in Chapter 2 establishes the components capable of delivering this behavior (the API layer, the domain modules, the real-time layer, the background processing layer), and the conceptual data model defined in Chapter 3 establishes the entities this behavior acts upon (Organization, User, Client, Project, Task, and the rest); this chapter is the layer that connects the two, defining the functional contract the system must fulfill using the structure and data already established.

Consistent with the approach taken throughout this SRS, this chapter remains implementation-independent: it does not specify API endpoints, request or response formats, database queries, or user-interface layouts. Those concerns belong to later, more technical artifacts that will be produced once this functional baseline has been agreed upon.

---

### 4.2 Functional Requirement Organization

**4.2.1 Organization by Business Capability.** The functional requirements in this chapter are grouped by major business capability — authentication and authorization, client management, project management, task management, collaboration, notifications, file handling, and so on — rather than by backend implementation module. While Chapter 2 organizes the backend internally into domain modules for architectural purposes (Section 2.4.2), that internal organization is an implementation concern; this chapter is organized instead around the capabilities a User actually experiences, ensuring that the functional requirements remain meaningful to business stakeholders and not only to engineers.

**4.2.2 Requirement Identification.** Every functional requirement in this chapter is assigned a unique identifier following the pattern **FR-[CAPABILITY]-[NUMBER]** (for example, FR-AUTH-001), where the capability prefix reflects the business capability the requirement belongs to. This ensures that any individual requirement can be referenced unambiguously, both within this document and in later artifacts (test plans, technical designs) that will need to trace back to a specific requirement.

**4.2.3 Testability.** Each requirement is written as a discrete, verifiable statement of system behavior — describing a specific condition and a specific expected outcome — so that it can later be validated through testing without ambiguity about whether the requirement has been satisfied. Requirements that cannot be phrased in a testable way are treated as insufficiently defined and are refined until they can be.

**4.2.4 Implementation Independence.** Consistent with the approach maintained throughout this SRS, functional requirements describe *what* the system must do, not *how* it does it. A requirement may reference an entity or role established in earlier chapters (a Task, a Manager), but it does not prescribe specific technical mechanisms, data structures, or interface designs, which remain the province of later, implementation-focused artifacts.

**4.2.5 Traceability to Business Objectives.** Every requirement in this chapter is traceable back to the business and technical objectives established in Chapter 1 (Section 1.3) and the problems identified in Chapter 1's problem statement (Section 1.2). This traceability ensures that no requirement exists in isolation from the reasons ClientSphere is being built in the first place, and gives later reviewers a way to confirm that the full set of Chapter 1 objectives is actually addressed somewhere in this chapter's requirements.

---

### 4.3 User Authentication and Authorization

This section defines the functional requirements governing how Users establish, maintain, and lose access to ClientSphere, and how the system determines what an authenticated User is permitted to do. These requirements build directly on the authentication and authorization architecture described in Chapter 2 (Section 2.6) and the User entity described in Chapter 3 (Section 3.4.2), and correspond to the business objective of secure, role-appropriate access established in Chapter 1 (Section 1.3.2).

**FR-AUTH-001 — User Registration.**
The system shall allow a new individual to register as a User by providing the required identifying and credential information.
*Explanation:* This is the entry point by which an individual becomes a recognized User within a specific Organization, whether as the first Administrator of a newly registered Organization (FR-AUTH-002) or as a subsequent User invited into an existing one.

**FR-AUTH-002 — Organization Registration.**
The system shall allow a new Organization to be established, together with an initial User who is automatically assigned the Administrator role for that Organization.
*Explanation:* This requirement reflects the Organization entity's role as the top-level owning boundary established in Chapter 3 (Section 3.4.1) — an Organization cannot exist without at least one User responsible for administering it, and this requirement ensures that responsibility is established at the moment of creation.

**FR-AUTH-003 — Secure Credential-Based Login.**
The system shall allow a registered User to authenticate using their registered email address and password, and shall reject authentication attempts using incorrect credentials.
*Explanation:* This is the primary login path for Users who registered directly rather than through Google OAuth, and it must behave symmetrically — succeeding only when the supplied credentials genuinely match a registered User.

**FR-AUTH-004 — JWT-Based Session Issuance.**
The system shall, upon successful authentication by any supported method, issue a signed session token representing the authenticated User's identity and role, to be presented on subsequent requests.
*Explanation:* This requirement reflects the unified session model described in Chapter 2 (Section 2.6.1) — regardless of login path, a successful authentication converges into the same kind of session credential.

**FR-AUTH-005 — Google OAuth Login.**
The system shall allow a User to authenticate using their Google account, and shall verify the resulting identity assertion before establishing an authenticated session.
*Explanation:* This provides the federated login path introduced in Chapter 1 and architecturally described in Chapter 2, reducing login friction for Users who prefer not to manage a separate password.

**FR-AUTH-006 — Account Provisioning via Google OAuth.**
The system shall, when a User authenticates via Google OAuth for the first time and no matching User record exists, provision a new User record consistent with the registration behavior defined in FR-AUTH-001, associated with the appropriate Organization.
*Explanation:* This ensures that the Google OAuth login path can serve as a genuine alternative to credential-based registration, not merely a login mechanism for already-registered Users.

**FR-AUTH-007 — Logout.**
The system shall allow an authenticated User to explicitly terminate their current session, after which the previously issued session credential shall no longer be accepted for authenticating further requests.
*Explanation:* This requirement ensures Users have explicit, reliable control over ending their own authenticated session, independent of whatever session expiry policy is defined at the implementation level.

**FR-AUTH-008 — Password Change.**
The system shall allow an authenticated User to change their password, provided they correctly supply their current password, and shall invalidate the previous password immediately upon success.
*Explanation:* Requiring the current password guards against a scenario in which an unattended, already-authenticated session is misused to silently take over an account.

**FR-AUTH-009 — Password Reset Request.**
The system shall allow an individual who is unable to log in to initiate a password reset process by supplying their registered email address, without revealing whether that email address corresponds to an existing account.
*Explanation:* This requirement supports Users who have forgotten their password, while the non-disclosure behavior guards against using the reset flow to enumerate valid accounts.

**FR-AUTH-010 — Password Reset Completion.**
The system shall allow a User to establish a new password through a securely issued, time-limited reset mechanism, and shall invalidate that mechanism once it has been used or has expired.
*Explanation:* This completes the password reset flow initiated in FR-AUTH-009, ensuring the reset capability cannot be reused or left open indefinitely.

**FR-AUTH-011 — Session Validation.**
The system shall validate the authenticity and current validity of a User's session credential on every request that requires authentication, and shall reject requests bearing an invalid, expired, or otherwise unrecognized credential.
*Explanation:* This requirement is the functional counterpart to the authentication middleware described in Chapter 2 (Section 2.4.1) — no authenticated action may proceed without this validation occurring first.

**FR-AUTH-012 — Role-Based Authorization.**
The system shall determine whether an authenticated User is permitted to perform a requested action based on the role associated with that User, and shall permit the action only if that role includes the necessary permission.
*Explanation:* This requirement reflects the role-based access control principle described in Chapter 2 (Section 2.6.2), applied here as an observable behavioral requirement rather than an architectural description.

**FR-AUTH-013 — Scoped Access Control.**
The system shall restrict a User's access to entities (Clients, Projects, Tasks, and related data) to those within their own Organization, and, where applicable, to those they are specifically associated with (such as Projects they are assigned to), regardless of their role.
*Explanation:* This requirement extends role-based authorization (FR-AUTH-012) with the scoped-authorization principle described in Chapter 2 (Section 2.6.3) and the organizational isolation principle described in Chapter 3 (Sections 3.2.3 and 3.6.7) — a role alone does not grant unlimited access across Organization boundaries.

**FR-AUTH-014 — Unauthorized Access Handling.**
The system shall reject any request for an action or resource that the requesting User's role or scope does not permit, and shall do so consistently regardless of whether the lack of permission is due to role, organizational boundary, or specific entity association.
*Explanation:* This ensures that authorization is enforced as a genuine barrier at the point of request handling, consistent with the principle from Chapter 2 that authorization must never rely solely on the frontend UI declining to present an option.

**FR-AUTH-015 — Account Activation.**
The system shall allow an Administrator to activate a User account within their Organization, granting that User the ability to authenticate and access the system according to their assigned role.
*Explanation:* This supports the onboarding of new team members into an Organization's existing ClientSphere instance, consistent with the User management responsibilities of the Administrator role established in Chapter 1 (Section 1.5.1).

**FR-AUTH-016 — Account Deactivation.**
The system shall allow an Administrator to deactivate a User account within their Organization, immediately preventing that User from authenticating or accessing the system, while preserving that User's historical association with past Tasks, Comments, and Activity Log entries.
*Explanation:* This reflects the lifecycle principle established in Chapter 3 (Section 3.4.2 and Section 3.8.3) — a departing team member's access is revoked, but their historical contribution to the Organization's work is preserved rather than erased.

**FR-AUTH-017 — Authentication Failure Handling.**
The system shall respond to a failed authentication attempt (incorrect credentials, an inactive account, or an invalid or expired session credential) with a clear rejection of the attempt, without granting any level of partial or degraded access.
*Explanation:* This requirement ensures that authentication is treated as a strict boundary — an authentication attempt either succeeds in full or is rejected in full, with no intermediate state in which a User is partially authenticated.

**FR-AUTH-018 — Repeated Authentication Failure Response.**
The system shall recognize repeated, unsuccessful authentication attempts against a single account within a limited period of time as a condition requiring a protective response.
*Explanation:* This requirement establishes, at a functional level, that the system must not treat unlimited repeated login failures as an ordinary occurrence; the precise protective mechanism (temporary lockout, delay, or additional verification) is a security design decision to be detailed in a later chapter rather than specified here.

---

### 4.4 Organization Management

This section defines the functional requirements governing the creation, configuration, and lifecycle of the Organization entity described in Chapter 3 (Section 3.4.1) — the top-level tenant boundary within which all other ClientSphere activity takes place.

**FR-ORG-001 — Organization Creation**
*Priority:* High
*Traceability:* FR-002 (User & Role Management), Chapter 1 Section 1.3.2
*Requirement Statement:* The system shall allow a new Organization to be created as part of the registration process described in FR-AUTH-002, establishing that Organization as a distinct tenant with no data connection to any other Organization.
*Rationale:* The Organization is the root of every ownership relationship described in Chapter 3 (Section 3.5); no other entity in the system can meaningfully exist until an Organization exists to own it.

**FR-ORG-002 — Organization Profile Management**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator to view and update their Organization's profile information, including its name and general descriptive details.
*Rationale:* Keeping Organization-level information current supports the professional, branded experience objective identified in Chapter 1 (Section 1.3.1).

**FR-ORG-003 — Organization Settings Management**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator to view and modify Organization-level settings that govern how the platform behaves for all Users within that Organization.
*Rationale:* Organization-wide settings provide a single point of configuration consistent with the Administrator's organization-wide oversight role established in Chapter 1 (Section 1.5.1).

**FR-ORG-004 — Organization Branding**
*Priority:* Low
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator to associate identifying branding elements, such as an organization name and logo, with their Organization for presentation within the platform.
*Rationale:* Branding supports the professional, client-facing presentation objective identified in Chapter 1 (Section 1.3.1), and is treated as a lower-priority enhancement relative to core operational capabilities.

**FR-ORG-005 — Organization Activation**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall recognize a newly created Organization as active by default upon successful registration, permitting normal use of the platform by its Users.
*Rationale:* This establishes a clear, unambiguous starting state for every new Organization, consistent with the lifecycle principles described in Chapter 3 (Section 3.8.1).

**FR-ORG-006 — Organization Deactivation**
*Priority:* High
*Traceability:* FR-002, Chapter 3 Section 3.8.8
*Requirement Statement:* The system shall support deactivation of an Organization, preventing all Users within that Organization from authenticating or accessing platform functionality, while preserving that Organization's underlying data.
*Rationale:* Consistent with the offboarding considerations established in Chapter 3 (Section 3.8.8), deactivation must be reversible and non-destructive, distinguishing a suspended Organization from a deleted one.

**FR-ORG-007 — Organization Ownership**
*Priority:* High
*Traceability:* FR-002, Chapter 3 Section 3.4.1
*Requirement Statement:* The system shall ensure that every Organization has at least one User holding the Administrator role at all times, and shall prevent an action that would leave an Organization without any Administrator.
*Rationale:* An Organization without an Administrator would be left with no User capable of managing it, an invalid operational state given the Administrator responsibilities defined in Chapter 1 (Section 1.5.1).

**FR-ORG-008 — Organization Data Isolation**
*Priority:* High
*Traceability:* Chapter 1 NFR-1; Chapter 3 Sections 3.2.3, 3.6.7
*Requirement Statement:* The system shall ensure that no User, Client, Project, Task, or other entity associated with one Organization is ever visible to, or accessible by, a User of a different Organization.
*Rationale:* This is the direct functional expression of the organizational isolation principle established as both a security concern (Chapter 2, Section 2.6.2) and a data integrity concern (Chapter 3, Section 3.6.7).

**FR-ORG-009 — Organization Configuration**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator to configure Organization-specific operational parameters relevant to how their team uses the platform, within the boundaries established by the platform's supported capabilities.
*Rationale:* This supports the flexibility a service business needs to adapt the platform to its own working practices, without extending into organization-customizable roles or permissions, which remain out of scope per Chapter 3 (Section 3.9.2).

**FR-ORG-010 — Organization Deletion Policy**
*Priority:* High
*Traceability:* Chapter 3 Section 3.8.8
*Requirement Statement:* The system shall not permit the permanent, irreversible deletion of an Organization and its associated data through routine platform operation; permanent deletion, where required, shall follow a distinct, deliberately safeguarded process outside of normal use.
*Rationale:* This reflects the preservation-first lifecycle philosophy established in Chapter 3 (Section 3.8.5), ensuring that an Organization's historical business records cannot be lost through an ordinary user action or mistake.

**FR-ORG-011 — Organization Audit Logging**
*Priority:* High
*Traceability:* FR-006 (Commenting & Activity Tracking); Chapter 3 Section 3.6.8
*Requirement Statement:* The system shall record, in the Activity Log, every significant Organization-level change, including activation, deactivation, and modification of Organization profile or settings information, together with the identity of the User who performed the action.
*Rationale:* This extends the auditability principle established in Chapter 3 (Section 3.4.9) to the Organization level, ensuring that organization-wide changes are as traceable as changes to any other entity in the system.

---

### 4.5 User Management

This section defines the functional requirements governing how Users are added to, modified within, and removed from an Organization, building on the User entity described in Chapter 3 (Section 3.4.2) and the role-based access control established in Chapter 2 (Section 2.6).

**FR-USER-001 — Invite User**
*Priority:* High
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator or Manager (subject to their permitted scope) to invite a new individual to join their Organization as a User, specifying the role to be assigned upon acceptance.
*Rationale:* Invitation is expected to be the primary path by which most Organizations grow their team within ClientSphere, distinct from open self-registration.

**FR-USER-002 — Create User Directly**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall allow an Administrator to directly create a new User record within their Organization without requiring an invitation-acceptance step, assigning that User an initial role at the time of creation.
*Rationale:* This supports Organizations that prefer to provision accounts directly rather than relying on an invitation flow, consistent with the Administrator's user-management responsibility established in Chapter 1 (Section 1.5.1).

**FR-USER-003 — Update User Profile**
*Priority:* Medium
*Traceability:* FR-002
*Requirement Statement:* The system shall allow a User to view and update their own profile information, and shall allow an Administrator to update profile information for any User within their Organization.
*Rationale:* Keeping profile information accurate is a baseline expectation for a system that attributes actions (Comments, Task assignments, Activity Log entries) to specific individuals, per Chapter 3 (Section 3.4.2).

**FR-USER-004 — Change User Role**
*Priority:* High
*Traceability:* FR-002; Chapter 3 Section 3.4 (Role as a User property)
*Requirement Statement:* The system shall allow an Administrator to change the role assigned to a User within their Organization, and shall apply the new role's permissions immediately to that User's subsequent actions.
*Rationale:* Role changes are a sensitive operation directly affecting a User's access, warranting High priority and restriction to the Administrator role per the authorization model established in Chapter 2 (Section 2.6.2).

**FR-USER-005 — Activate User Account**
*Priority:* Medium
*Traceability:* FR-002; FR-AUTH-015
*Requirement Statement:* The system shall allow an Administrator to reactivate a previously deactivated User account within their Organization, restoring that User's ability to authenticate.
*Rationale:* This complements FR-AUTH-015, supporting scenarios such as a returning team member whose access was temporarily suspended.

**FR-USER-006 — Deactivate User Account**
*Priority:* High
*Traceability:* FR-002; FR-AUTH-016
*Requirement Statement:* The system shall allow an Administrator to deactivate a User account within their Organization, immediately revoking that User's ability to authenticate while preserving their historical association with past work.
*Rationale:* This is the Organization-management counterpart to FR-AUTH-016, reflecting the same preservation-over-deletion principle established in Chapter 3 (Section 3.8.3).

**FR-USER-007 — Remove User**
*Priority:* Medium
*Traceability:* FR-002; Chapter 3 Section 3.8.3
*Requirement Statement:* The system shall allow an Administrator to remove a User from active participation in their Organization through a soft-removal mechanism, without permanently deleting that User's historical records or attributions.
*Rationale:* Consistent with the soft-deletion-by-default philosophy established in Chapter 3 (Section 3.8.3), removing a User must not sever the historical record of their past contributions.

**FR-USER-008 — View Users**
*Priority:* Medium
*Traceability:* FR-009 (Dashboards & Role-Specific Views)
*Requirement Statement:* The system shall allow authorized Users to view a list of Users within their Organization, scoped according to their role and permitted visibility.
*Rationale:* Visibility into team composition supports the coordination and oversight objectives described in Chapter 1 (Section 1.3.1), while remaining subject to the same scoped-access principle established in FR-AUTH-013.

**FR-USER-009 — Search Users**
*Priority:* Low
*Traceability:* FR-010 (Search & Filtering)
*Requirement Statement:* The system shall allow authorized Users to search for a specific User within their Organization by name or other identifying detail.
*Rationale:* This supports usability as an Organization's team grows in size, consistent with the search and filtering functional requirement established in Chapter 1.

**FR-USER-010 — Filter Users**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall allow authorized Users to filter the list of Users within their Organization by attributes such as role or account status (active or deactivated).
*Rationale:* Filtering complements search (FR-USER-009) in supporting efficient navigation of an Organization's User base.

**FR-USER-011 — Assign Managers**
*Priority:* Medium
*Traceability:* FR-002; Chapter 1 Section 1.5.2
*Requirement Statement:* The system shall allow an Administrator to establish an association between a Manager and the Employees or Projects that Manager is responsible for.
*Rationale:* This supports the scoped-authorization principle established in Chapter 2 (Section 2.6.3), under which a Manager's elevated permissions are typically bounded to their assigned scope rather than the entire Organization.

**FR-USER-012 — User Ownership Within Organization**
*Priority:* High
*Traceability:* FR-002; Chapter 3 Sections 3.4.2, 3.5.1
*Requirement Statement:* The system shall ensure that every User record belongs to exactly one Organization at all times, consistent with the Organization–User relationship described in Chapter 3 (Section 3.5.1).
*Rationale:* This enforces, at the functional level, the structural ownership constraint established as a data integrity principle in Chapter 3 (Section 3.6.1).

**FR-USER-013 — Prevent Unauthorized User Management**
*Priority:* High
*Traceability:* FR-001 (User Authentication & Authorization); FR-AUTH-012, FR-AUTH-013
*Requirement Statement:* The system shall reject any attempt by a User to create, modify, deactivate, or remove another User's account unless the requesting User's role and scope explicitly permit that action.
*Rationale:* User management is among the most sensitive categories of action in the system, and this requirement ensures it is governed by the same strict authorization discipline established in Section 4.3.

**FR-USER-014 — Audit Significant User Actions**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, every significant User-management action — creation, role change, activation, deactivation, and removal — together with the identity of the User who performed it and the User it was performed upon.
*Rationale:* This extends the auditability principle from Chapter 3 to the User-management capability, ensuring that changes affecting who can access the system are as traceable as changes to any other entity.

---

### 4.6 Client Management

This section defines the functional requirements governing the creation, maintenance, and lifecycle of the Client entity described in Chapter 3 (Section 3.4.3), directly supporting the client relationship management objective established in Chapter 1 (Section 1.2.2).

**FR-CLIENT-001 — Create Client**
*Priority:* High
*Traceability:* FR-003 (Client Record Management)
*Requirement Statement:* The system shall allow an authorized User to create a new Client record within their Organization, capturing the client's identifying and contact information.
*Rationale:* This is the entry point for establishing the single source of truth for client data identified as a core problem-statement need in Chapter 1 (Section 1.2.2).

**FR-CLIENT-002 — Update Client**
*Priority:* Medium
*Traceability:* FR-003
*Requirement Statement:* The system shall allow an authorized User to update the information associated with an existing Client record.
*Rationale:* Client information changes over the course of a relationship, and keeping it current is essential to the Client entity's role as an authoritative record, per Chapter 3 (Section 3.4.3).

**FR-CLIENT-003 — View Client**
*Priority:* Medium
*Traceability:* FR-003; FR-009
*Requirement Statement:* The system shall allow an authorized User to view the details of a Client record, including a summary of associated Projects, subject to the visibility rules established in FR-CLIENT-012.
*Rationale:* This supports the day-to-day reference use of Client records described in Chapter 1's problem statement (Section 1.2.1).

**FR-CLIENT-004 — Archive Client**
*Priority:* Medium
*Traceability:* FR-003; Chapter 3 Section 3.8.4
*Requirement Statement:* The system shall allow an authorized User to archive a Client record, marking it as no longer active while preserving the record and its historical associations.
*Rationale:* This reflects the archival lifecycle principle established in Chapter 3 (Section 3.8.4), applied specifically to Clients whose relationship with the Organization has concluded.

**FR-CLIENT-005 — Restore Archived Client**
*Priority:* Low
*Traceability:* FR-003
*Requirement Statement:* The system shall allow an authorized User to restore a previously archived Client record to active status.
*Rationale:* This accommodates scenarios such as a former client relationship resuming, consistent with the reversibility expected of soft-deletion and archival operations per Chapter 3 (Section 3.8.3).

**FR-CLIENT-006 — Search Clients**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to search for a Client record within their Organization by name or other identifying detail.
*Rationale:* This directly supports the search and filtering functional requirement established in Chapter 1 (FR-010), applied to the Client entity.

**FR-CLIENT-007 — Filter Clients**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to filter Client records by attributes such as status (active or archived).
*Rationale:* Filtering complements search (FR-CLIENT-006) to support efficient navigation as an Organization's client base grows.

**FR-CLIENT-008 — Client Status Management**
*Priority:* Medium
*Traceability:* FR-003
*Requirement Statement:* The system shall maintain a current status for each Client record (such as active or archived) and shall reflect status changes immediately in how that Client is presented throughout the system.
*Rationale:* A consistently maintained status is what allows archival (FR-CLIENT-004) and restoration (FR-CLIENT-005) to function as reliable, observable operations rather than ambiguous states.

**FR-CLIENT-009 — Associate Projects with Clients**
*Priority:* High
*Traceability:* FR-003; FR-004 (Project Management); Chapter 3 Section 3.5.3
*Requirement Statement:* The system shall require that every Project be associated with exactly one existing Client at the time of its creation, consistent with the Client–Project relationship described in Chapter 3 (Section 3.5.3).
*Rationale:* This enforces, at the functional level, the mandatory relationship and referential integrity principle established in Chapter 3 (Sections 3.5.3 and 3.6.4) — a Project cannot meaningfully exist without the Client it is being delivered to.

**FR-CLIENT-010 — Prevent Duplicate Client Records**
*Priority:* Medium
*Traceability:* FR-003
*Requirement Statement:* The system shall assist authorized Users in identifying potential duplicate Client records (for example, matching contact details) at the time of creation, so that duplicate records can be knowingly avoided.
*Rationale:* Duplicate Client records would undermine the single-source-of-truth objective established in Chapter 1 (Section 1.2.2); this requirement addresses that risk without prescribing a specific matching mechanism, which remains an implementation concern.

**FR-CLIENT-011 — Client Ownership by Organization**
*Priority:* High
*Traceability:* Chapter 1 NFR-1; Chapter 3 Section 3.5.2
*Requirement Statement:* The system shall ensure that every Client record belongs to exactly one Organization at all times, consistent with the Organization–Client relationship described in Chapter 3 (Section 3.5.2).
*Rationale:* This enforces, at the functional level, the ownership constraint established as a data integrity principle in Chapter 3 (Section 3.6.1).

**FR-CLIENT-012 — Client Visibility Based on Authorization**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall restrict visibility of a Client record to Users within the owning Organization, and, where applicable, to Users specifically associated with that Client's Projects, in accordance with the scoped access control principle established in Section 4.3.
*Rationale:* This ensures Client data is never exposed beyond its owning Organization or beyond the Users who have a legitimate reason to access it.

**FR-CLIENT-013 — Audit Significant Client Operations**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, every significant Client-record operation — creation, update, archival, and restoration — together with the identity of the User who performed it.
*Rationale:* This extends the auditability principle from Chapter 3 to the Client Management capability, ensuring that changes to client records are as traceable as changes to any other entity in the system.

---

### 4.7 Project Management

This section defines the functional requirements governing the creation, maintenance, and lifecycle of the Project entity described in Chapter 3 (Section 3.4.4), the primary organizing unit through which client work is planned, assigned, and tracked, directly supporting the project management objective established in Chapter 1 (Section 1.3.1).

**FR-PROJ-001 — Create Project**
*Priority:* High
*Traceability:* FR-004 (Project Management)
*Requirement Statement:* The system shall allow an authorized User to create a new Project, capturing its descriptive information, timeline, and priority, and associating it with an existing Client as required by FR-CLIENT-009.
*Rationale:* This is the entry point through which client work becomes structured and trackable within ClientSphere.

**FR-PROJ-002 — Edit Project**
*Priority:* Medium
*Traceability:* FR-004
*Requirement Statement:* The system shall allow an authorized User to update a Project's descriptive information, timeline, and priority after creation.
*Rationale:* Project details commonly evolve over the course of delivery, and the system must allow this evolution to be reflected accurately.

**FR-PROJ-003 — View Project Details**
*Priority:* Medium
*Traceability:* FR-004; FR-009
*Requirement Statement:* The system shall allow an authorized User to view the full details of a Project, including its associated Client, assigned team members, current status, and a summary of its Tasks.
*Rationale:* This supports the day-to-day project oversight described in Chapter 1's problem statement (Section 1.2.3).

**FR-PROJ-004 — Archive Project**
*Priority:* Medium
*Traceability:* FR-004; Chapter 3 Section 3.8.4
*Requirement Statement:* The system shall allow an authorized User to archive a Project, marking it as no longer active while preserving the Project record and its full historical association with Tasks, Comments, and files.
*Rationale:* This reflects the archival lifecycle principle established in Chapter 3, applied to Projects that have concluded.

**FR-PROJ-005 — Restore Archived Project**
*Priority:* Low
*Traceability:* FR-004
*Requirement Statement:* The system shall allow an authorized User to restore a previously archived Project to active status.
*Rationale:* This accommodates scenarios such as previously closed work resuming, consistent with the reversibility expected of archival operations.

**FR-PROJ-006 — Project Responsible Ownership**
*Priority:* High
*Traceability:* FR-004; Chapter 1 Section 1.5.2
*Requirement Statement:* The system shall require that every Project have at least one User holding the Manager role designated as responsible for its oversight.
*Rationale:* This establishes clear accountability for a Project's outcome, consistent with the Manager role's responsibilities described in Chapter 1 (Section 1.5.2), and is distinct from the Project's structural association with its Client (FR-PROJ-007).

**FR-PROJ-007 — Associate Project with Client**
*Priority:* High
*Traceability:* FR-003; FR-004; FR-CLIENT-009
*Requirement Statement:* The system shall prevent a Project's associated Client from being changed once the Project has been created.
*Rationale:* Building on the mandatory Client–Project relationship already established in FR-CLIENT-009, this requirement adds the further constraint that this association, once established, is fixed — reassigning a Project to a different Client would misrepresent the historical record of who the work was actually delivered for.

**FR-PROJ-008 — Assign Managers**
*Priority:* High
*Traceability:* FR-004; FR-USER-011
*Requirement Statement:* The system shall allow an Administrator to assign one or more Users holding the Manager role to a Project, granting them the elevated permissions associated with that role within the scope of that Project.
*Rationale:* This applies the scoped-authorization principle established in Chapter 2 (Section 2.6.3) specifically to Project-level Manager assignment.

**FR-PROJ-009 — Assign Team Members**
*Priority:* High
*Traceability:* FR-004; Chapter 3 Section 3.4.4
*Requirement Statement:* The system shall allow an authorized User to assign one or more Employees to a Project, granting them visibility into that Project consistent with the scoped access control established in FR-AUTH-013.
*Rationale:* Team assignment is what makes a Project's work visible and actionable to the Employees responsible for delivering it.

**FR-PROJ-010 — Project Lifecycle**
*Priority:* High
*Traceability:* FR-004; Chapter 3 Section 3.4.4
*Requirement Statement:* The system shall recognize a defined sequence of lifecycle states for a Project, from initiation through active work to completion or cancellation, and shall ensure a Project is always in exactly one such state.
*Rationale:* A clearly defined lifecycle is what allows Project status (FR-PROJ-011) and progress tracking (FR-PROJ-014) to be meaningful and consistent across the system.

**FR-PROJ-011 — Project Status Management**
*Priority:* High
*Traceability:* FR-004
*Requirement Statement:* The system shall allow an authorized User to change a Project's current status, and shall immediately reflect that change wherever the Project is displayed throughout the system.
*Rationale:* Timely, accurate status is central to the real-time project visibility objective identified in Chapter 1 (Section 1.2.3).

**FR-PROJ-012 — Priority Management**
*Priority:* Medium
*Traceability:* FR-004
*Requirement Statement:* The system shall allow an authorized User to assign and change a priority level for a Project, and shall make that priority level visible wherever the Project is listed.
*Rationale:* Priority supports Managers and Administrators in allocating attention and resources across multiple concurrent Projects, addressing the workload visibility problem identified in Chapter 1 (Section 1.2.3).

**FR-PROJ-013 — Due Dates and Timelines**
*Priority:* High
*Traceability:* FR-004
*Requirement Statement:* The system shall allow an authorized User to define and update a Project's expected timeline, including a target completion date.
*Rationale:* Timeline information is foundational to the proactive project management objective identified in Chapter 1 (Section 1.2.3), enabling identification of Projects at risk of delay.

**FR-PROJ-014 — Project Progress Tracking**
*Priority:* High
*Traceability:* FR-004; FR-009
*Requirement Statement:* The system shall present an indication of a Project's overall progress, derived from the completion status of its associated Tasks.
*Rationale:* This directly addresses the poor visibility into project health identified in Chapter 1's problem statement (Section 1.2.3), and depends on the Task-level progress calculation defined in FR-TASK-017.

**FR-PROJ-015 — Project Visibility Based on Authorization**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall restrict visibility of a Project to Users within the owning Organization who are either assigned to that Project or otherwise permitted by their role to view it, including a Client-role User associated with the Project's Client, who may view only Projects belonging to that Client.
*Rationale:* This applies the scoped access control principle established in Section 4.3 specifically to the Project entity, ensuring Employees see only Projects relevant to them, Clients see only their own assigned Projects, and Administrators retain organization-wide visibility.

**FR-PROJ-016 — Project Search**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to search for a Project within their permitted visibility scope by name or other identifying detail.
*Rationale:* This applies the search functional requirement from Chapter 1 (FR-010) to the Project entity.

**FR-PROJ-017 — Project Filtering**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to filter Projects by attributes such as status, priority, associated Client, or assigned Manager.
*Rationale:* Filtering supports efficient navigation as the number of concurrent Projects within an Organization grows.

**FR-PROJ-018 — Project Sorting**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to sort a list of Projects by attributes such as due date, priority, or status.
*Rationale:* Sorting complements filtering (FR-PROJ-017) in supporting efficient prioritization of attention across multiple Projects.

**FR-PROJ-019 — Project Activity History**
*Priority:* Medium
*Traceability:* FR-006
*Requirement Statement:* The system shall allow an authorized User to view a chronological history of significant activity associated with a Project, drawn from the Activity Log.
*Rationale:* This gives Managers and Administrators direct insight into how a Project has evolved, complementing the audit logging established in FR-PROJ-022.

**FR-PROJ-020 — Prevent Duplicate or Invalid Projects**
*Priority:* Medium
*Traceability:* FR-004
*Requirement Statement:* The system shall prevent the creation of a Project that lacks a valid associated Client or that duplicates an existing Project's identifying details for the same Client without deliberate confirmation.
*Rationale:* This upholds the referential integrity principle established in Chapter 3 (Section 3.6.2) while guarding against accidental duplicate records.

**FR-PROJ-021 — Prevent Archiving When Business Rules Prohibit It**
*Priority:* Medium
*Traceability:* FR-004; Chapter 3 Section 3.6.6
*Requirement Statement:* The system shall prevent a Project from being archived while it contains Tasks that are not yet in a completed or cancelled state, unless the archiving User explicitly confirms this action.
*Rationale:* This reflects the business rule enforcement principle established in Chapter 3 (Section 3.6.6), preventing unfinished work from being silently hidden from active views.

**FR-PROJ-022 — Audit Significant Project Operations**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, every significant Project operation — creation, status change, archival, restoration, and team or Manager reassignment — together with the identity of the User who performed it.
*Rationale:* This extends the auditability principle established throughout this SRS to the Project Management capability.

---

### 4.8 Task Management

This section defines the functional requirements governing the creation, assignment, and lifecycle of the Task and Subtask entities described in Chapter 3 (Sections 3.4.5 and 3.4.6), forming the operational core through which day-to-day work is executed and tracked, consistent with the task management objective established in Chapter 1 (Section 1.2.3). Consistent with FR-PROJ-015 and FR-AUTH-013, a Client-role User's visibility into Tasks is limited to those belonging to Projects associated with their own Client account.

**FR-TASK-001 — Create Task**
*Priority:* High
*Traceability:* FR-005 (Task & Subtask Management)
*Requirement Statement:* The system shall allow an authorized User to create a new Task within an existing Project, capturing its description, due date, and priority.
*Rationale:* This is the entry point through which a Project's overall scope is broken down into concrete, assignable work, per Chapter 3 (Section 3.4.5).

**FR-TASK-002 — Edit Task**
*Priority:* Medium
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to update a Task's description, due date, and priority after creation.
*Rationale:* Task details commonly require adjustment as work progresses or requirements are clarified.

**FR-TASK-003 — Archive Task**
*Priority:* Medium
*Traceability:* FR-005; Chapter 3 Section 3.8.3
*Requirement Statement:* The system shall allow an authorized User to archive a Task, removing it from active views while preserving the Task record and its historical associations with Comments and Activity Log entries.
*Rationale:* This applies the preservation-over-deletion philosophy established in Chapter 3 (Section 3.8.3) to the Task entity.

**FR-TASK-004 — Restore Archived Task**
*Priority:* Low
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to restore a previously archived Task to active status.
*Rationale:* This accommodates situations in which work presumed finished or cancelled needs to resume, consistent with the reversibility expected of archival operations.

**FR-TASK-005 — Create Subtask**
*Priority:* Medium
*Traceability:* FR-005; Chapter 3 Section 3.4.6
*Requirement Statement:* The system shall allow an authorized User to create a Subtask within an existing Task, capturing its own description and completion state.
*Rationale:* This supports the further breakdown of complex Tasks described in Chapter 3 (Section 3.4.6).

**FR-TASK-006 — Edit Subtask**
*Priority:* Low
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to update a Subtask's description and completion state after creation.
*Rationale:* This mirrors Task editing (FR-TASK-002) at the Subtask level, ensuring finer-grained work items remain accurate over time.

**FR-TASK-007 — Assign Task**
*Priority:* High
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to assign a Task to a single User who is a member of the Task's associated Project.
*Rationale:* Assignment is what transforms a Task from an unowned item of work into an individual's clear responsibility, per Chapter 3 (Section 3.5.7).

**FR-TASK-008 — Reassign Task**
*Priority:* Medium
*Traceability:* FR-005; Chapter 3 Section 3.5.7
*Requirement Statement:* The system shall allow an authorized User to change the assignment of a Task from one User to another, and shall record this change as a significant event per FR-TASK-026.
*Rationale:* Reassignment reflects the changeable nature of the User–Task relationship described in Chapter 3 (Section 3.5.7), distinct from the Task's fixed ownership by its Project (FR-TASK-010).

**FR-TASK-009 — Support Multiple Subtasks per Task**
*Priority:* Low
*Traceability:* FR-005; Chapter 3 Section 3.5.5
*Requirement Statement:* The system shall allow a Task to have any number of associated Subtasks, without imposing an artificial limit on how many a single Task may contain.
*Rationale:* This reflects the optional, one-to-many Task–Subtask relationship established in Chapter 3 (Section 3.5.5), which varies naturally with a Task's internal complexity.

**FR-TASK-010 — Task Ownership**
*Priority:* High
*Traceability:* Chapter 3 Sections 3.4.5, 3.5.4
*Requirement Statement:* The system shall ensure that every Task belongs to exactly one Project at all times, and shall prevent a Task from existing independently of a Project.
*Rationale:* This enforces, at the functional level, the mandatory Project–Task relationship and ownership constraint established in Chapter 3 (Sections 3.5.4 and 3.6.1).

**FR-TASK-011 — Associate Task with Project**
*Priority:* High
*Traceability:* FR-005; FR-PROJ-007
*Requirement Statement:* The system shall prevent a Task's associated Project from being changed once the Task has been created.
*Rationale:* Mirroring the fixed Client association established for Projects in FR-PROJ-007, this prevents a Task's historical context from being misrepresented by moving it between Projects after the fact.

**FR-TASK-012 — Due Dates**
*Priority:* High
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to define and update a due date for a Task.
*Rationale:* Due dates are essential to the deadline-clarity need identified for Employees in Chapter 1 (Section 1.5.3).

**FR-TASK-013 — Priority Levels**
*Priority:* Medium
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to assign and change a priority level for a Task.
*Rationale:* Task-level priority allows an assigned Employee to determine which of their Tasks warrants immediate attention.

**FR-TASK-014 — Task Status Transitions**
*Priority:* High
*Traceability:* FR-005; Chapter 1 Section 1.6 (FR-005)
*Requirement Statement:* The system shall recognize a defined sequence of status states for a Task (for example, To Do, In Progress, In Review, and Completed) and shall allow an authorized User to move a Task between these states.
*Rationale:* This gives concrete, observable meaning to the task tracking objective identified in Chapter 1 (Section 1.6).

**FR-TASK-015 — Task Dependencies (Future Extensibility)**
*Priority:* Low
*Traceability:* Chapter 3 Section 3.9.5
*Requirement Statement:* The system is not required to support dependency relationships between Tasks in the current scope, but the Task entity's design shall not preclude the future introduction of such relationships.
*Rationale:* Consistent with the extensibility principle established in Chapter 3 (Section 3.9.5), this requirement explicitly defers Task dependencies rather than silently omitting consideration of them.

**FR-TASK-016 — Task Completion**
*Priority:* High
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an assigned User, or another authorized User, to mark a Task as complete, and shall record the date and time at which completion occurred.
*Rationale:* Completion is the terminal, expected outcome of a Task's lifecycle and the basis for progress calculation (FR-TASK-017).

**FR-TASK-017 — Progress Calculation**
*Priority:* High
*Traceability:* FR-004; FR-005; FR-PROJ-014
*Requirement Statement:* The system shall calculate a Project's overall progress based on the proportion of its associated Tasks that are marked complete, accounting for Subtask completion where a Task contains Subtasks.
*Rationale:* This defines, at a functional level, exactly how the Project progress tracking requirement established in FR-PROJ-014 is derived from underlying Task and Subtask data.

**FR-TASK-018 — Bulk Task Updates**
*Priority:* Medium
*Traceability:* FR-005
*Requirement Statement:* The system shall allow an authorized User to apply a single update, such as a status or priority change, to more than one selected Task at the same time.
*Rationale:* Bulk updates reduce the operational overhead of managing large numbers of Tasks, supporting the efficiency objective established in Chapter 1 (Section 1.3.1).

**FR-TASK-019 — Task Search**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to search for a Task within their permitted visibility scope by title or other identifying detail.
*Rationale:* This applies the search functional requirement from Chapter 1 (FR-010) to the Task entity.

**FR-TASK-020 — Task Filtering**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to filter Tasks by attributes such as status, priority, assigned User, or due date.
*Rationale:* Filtering supports efficient navigation of Tasks across potentially many concurrent Projects.

**FR-TASK-021 — Task Sorting**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to sort a list of Tasks by attributes such as due date, priority, or status.
*Rationale:* Sorting complements filtering (FR-TASK-020) in helping Users determine which Tasks require the most immediate attention.

**FR-TASK-022 — Personal Assigned-Task View**
*Priority:* High
*Traceability:* FR-005; FR-009; Chapter 1 Section 1.5.3
*Requirement Statement:* The system shall provide each User with a view listing only the Tasks currently assigned to them across all Projects they participate in.
*Rationale:* This directly addresses the clarity-on-assigned-work need identified for Employees in Chapter 1 (Section 1.5.3).

**FR-TASK-023 — Prevent Invalid Assignments**
*Priority:* High
*Traceability:* FR-005; FR-AUTH-013
*Requirement Statement:* The system shall prevent a Task from being assigned to a User who is not a member of the Task's associated Project.
*Rationale:* This upholds the scoped access control principle established in Section 4.3, ensuring assignment reflects an actual, authorized working relationship between the User and the Project.

**FR-TASK-024 — Prevent Invalid Status Transitions**
*Priority:* Medium
*Traceability:* FR-005; Chapter 3 Section 3.6.6
*Requirement Statement:* The system shall prevent a Task from being moved to a status that does not represent a valid transition from its current status, as defined by the Task lifecycle established in FR-TASK-014.
*Rationale:* This applies the business rule enforcement principle established in Chapter 3 (Section 3.6.6) to Task status changes, preventing states such as marking an already-archived Task as newly in progress.

**FR-TASK-025 — Task Activity History**
*Priority:* Medium
*Traceability:* FR-006
*Requirement Statement:* The system shall allow an authorized User to view a chronological history of significant activity associated with a Task, drawn from the Activity Log.
*Rationale:* This mirrors the Project-level activity history established in FR-PROJ-019, applied to the finer-grained Task entity.

**FR-TASK-026 — Audit Significant Task Operations**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, every significant Task operation — creation, assignment, reassignment, status change, and archival — together with the identity of the User who performed it.
*Rationale:* This extends the auditability principle established throughout this SRS to the Task Management capability, which represents the most frequent category of state-changing activity in the system.

---

### 4.9 Collaboration & Comments

This section defines the functional requirements governing the Comment entity described in Chapter 3 (Section 3.4.7), the mechanism through which Users discuss and coordinate around a specific Task or Project, directly supporting the communication objective established in Chapter 1 (Section 1.2.5). Consistent with Chapter 1's restriction that a Client-role User may access only permitted discussions, a Comment may be designated as internal to the Organization's team or as open to Client participation; a Client-role User's access to Comments is limited to those designated as open to them, even where they are otherwise authorized to view the associated Task or Project.

**FR-COMMENT-001 — Add Comment to Task**
*Priority:* High
*Traceability:* FR-006 (Commenting & Activity Tracking)
*Requirement Statement:* The system shall allow an authorized User to add a Comment to a Task they are permitted to view, subject to the further restriction, per FR-COMMENT-013, that a Client-role User may only participate in discussions designated as open to Client participation.
*Rationale:* This is the primary mechanism by which discussion is tied directly to a specific piece of work, per Chapter 3 (Section 3.4.7).

**FR-COMMENT-002 — Add Comment to Project**
*Priority:* High
*Traceability:* FR-006
*Requirement Statement:* The system shall allow an authorized User to add a Comment to a Project they are permitted to view, subject to the same Client-participation restriction established in FR-COMMENT-001.
*Rationale:* This extends the same capability to Project-level discussion, supporting coordination that concerns a Project as a whole rather than any single Task.

**FR-COMMENT-003 — Edit Comment**
*Priority:* Medium
*Traceability:* FR-006
*Requirement Statement:* The system shall allow the original author of a Comment to edit its content after it has been posted.
*Rationale:* This accommodates ordinary correction of a Comment's wording without requiring it to be deleted and recreated.

**FR-COMMENT-004 — Delete Comment**
*Priority:* Medium
*Traceability:* FR-006; Chapter 3 Section 3.8.3
*Requirement Statement:* The system shall allow the original author of a Comment, or an Administrator, to delete that Comment, subject to the authorization rules established in FR-COMMENT-012.
*Rationale:* Restricting deletion to the author or an Administrator prevents arbitrary removal of discussion by uninvolved parties.

**FR-COMMENT-005 — View Comment History**
*Priority:* Medium
*Traceability:* FR-006
*Requirement Statement:* The system shall display all Comments associated with a Task or Project in chronological order to any User authorized to view that Task or Project.
*Rationale:* A complete, ordered history of discussion is necessary for a Comment thread to serve as a reliable record of what was discussed and decided.

**FR-COMMENT-006 — Mention Users**
*Priority:* Medium
*Traceability:* FR-006; FR-008 (Real-Time Notifications)
*Requirement Statement:* The system shall allow a User composing a Comment to explicitly mention one or more other Users, and shall generate a Notification (per FR-NOTIFY-006) to each mentioned User.
*Rationale:* Mentions allow a User to direct a Comment's relevance to specific individuals rather than relying on them to discover it independently.

**FR-COMMENT-007 — Rich Text Support**
*Priority:* Low
*Traceability:* FR-006
*Requirement Statement:* The system shall allow a Comment's content to include basic text formatting (such as emphasis, lists, or links) beyond plain, unformatted text.
*Rationale:* This supports clearer, more structured communication without prescribing a specific technical formatting mechanism, which remains an implementation concern.

**FR-COMMENT-008 — Comment Ordering**
*Priority:* Medium
*Traceability:* FR-006
*Requirement Statement:* The system shall present Comments associated with a Task or Project in the order they were created, with the most recent Comment identifiable as such.
*Rationale:* Consistent ordering ensures a Comment thread reads as a coherent conversation rather than an arbitrarily arranged list.

**FR-COMMENT-009 — Threaded Replies (Future Extensibility)**
*Priority:* Low
*Traceability:* Chapter 3 Section 3.9.5
*Requirement Statement:* The system is not required to support nested, threaded replies to individual Comments in the current scope, but the Comment entity's design shall not preclude the future introduction of such threading.
*Rationale:* Consistent with the extensibility principle established in Chapter 3 (Section 3.9.5), this requirement explicitly defers threaded replies rather than silently omitting consideration of them.

**FR-COMMENT-010 — Author Attribution**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.7
*Requirement Statement:* The system shall permanently associate every Comment with the identity of the User who authored it, and shall display that authorship wherever the Comment appears.
*Rationale:* Attribution is essential to the Comment entity's role in supporting accountable team communication, per Chapter 3 (Section 3.4.7).

**FR-COMMENT-011 — Timestamp Recording**
*Priority:* High
*Traceability:* FR-006
*Requirement Statement:* The system shall record the date and time at which a Comment was created, and, if applicable, the date and time it was last edited.
*Rationale:* Timestamps are necessary to preserve the chronological integrity of a Comment thread (FR-COMMENT-008) and to support accurate historical review.

**FR-COMMENT-012 — Prevent Unauthorized Editing or Deletion**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall reject any attempt to edit or delete a Comment by a User other than its original author, except where that User holds the Administrator role.
*Rationale:* This upholds the authorization discipline established in Section 4.3, ensuring a Comment's content cannot be altered by uninvolved Users.

**FR-COMMENT-013 — Visibility of Comments Based on Permissions**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall restrict visibility of a Comment to Users who are authorized to view the Task or Project it is attached to, and shall further restrict a Client-role User's visibility to only those Comments designated as open to Client participation, excluding internal team-only discussions.
*Rationale:* A Comment's visibility must never exceed the visibility of the entity it concerns, consistent with the scoped access control principle established in Section 4.3, while a Client-role User must never be exposed to internal organizational discussion not intended for them.

**FR-COMMENT-014 — Activity Logging for Collaboration Actions**
*Priority:* Medium
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, the creation and deletion of Comments, together with the identity of the User who performed the action.
*Rationale:* This extends the auditability principle established throughout this SRS to collaboration activity, while deliberately excluding routine edits from Activity Log entries to avoid disproportionate log volume relative to their significance.

---

### 4.10 File Management

This section defines the functional requirements governing the File Metadata entity described in Chapter 3 (Section 3.4.10), and the file storage architecture described in Chapter 2 (Section 2.7), through which deliverables, contracts, and briefs are attached to a Client, Project, or Task. Consistent with Chapter 1's restriction that a Client-role User may access only shared Files, a File Metadata record may be designated as internal to the Organization's team or as shared with the Client, and a Client-role User's access is limited to files designated as shared, even where they are otherwise authorized to view the associated Client, Project, or Task.

**FR-FILE-001 — Upload Files**
*Priority:* High
*Traceability:* FR-007 (File & Document Management)
*Requirement Statement:* The system shall allow an authorized User to upload a file and associate it with a Client, Project, or Task they are permitted to modify.
*Rationale:* This is the entry point through which deliverables and documents become part of ClientSphere's integrated record, per Chapter 1 (Section 1.2.1).

**FR-FILE-002 — Associate Files with Clients**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall allow a File Metadata record to be associated with exactly one Client.
*Rationale:* This supports attaching client-level documents, such as contracts or briefs, that are not specific to any single Project.

**FR-FILE-003 — Associate Files with Projects**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall allow a File Metadata record to be associated with exactly one Project.
*Rationale:* This supports attaching Project-level deliverables and reference material relevant to the Project as a whole.

**FR-FILE-004 — Associate Files with Tasks**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall allow a File Metadata record to be associated with exactly one Task.
*Rationale:* This supports attaching material specific to an individual unit of work, consistent with the polymorphic File Metadata relationship established in Chapter 3 (Section 3.5.10).

**FR-FILE-005 — View Files**
*Priority:* Medium
*Traceability:* FR-007; FR-009
*Requirement Statement:* The system shall display the files associated with a Client, Project, or Task to any User authorized to view that entity, restricting a Client-role User's view to only those files designated as shared with the Client.
*Rationale:* Files must be discoverable in the context of the work they relate to, rather than requiring separate navigation, while internal-only files must remain invisible to a Client-role User.

**FR-FILE-006 — Download Files**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall allow an authorized User to retrieve the full content of a file associated with a Client, Project, or Task they are permitted to view.
*Rationale:* Download capability ensures files remain usable outside of ClientSphere's interface where necessary.

**FR-FILE-007 — Preview Supported File Types**
*Priority:* Low
*Traceability:* FR-007
*Requirement Statement:* The system shall present an in-application preview for file types it supports previewing, without requiring the file to be downloaded first.
*Rationale:* Previewing reduces friction for Users reviewing common deliverable formats, though it remains a lower-priority enhancement relative to core upload and association capability.

**FR-FILE-008 — Replace File Versions**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall allow an authorized User to upload a new version of a previously uploaded file, associating it with the same File Metadata record while preserving a reference to the version it replaced.
*Rationale:* Version replacement supports the common workflow of revising a deliverable without losing continuity with its prior versions.

**FR-FILE-009 — Archive Files**
*Priority:* Low
*Traceability:* FR-007; Chapter 3 Section 3.8.3
*Requirement Statement:* The system shall allow an authorized User to archive a File Metadata record, removing it from active views while preserving the record and its association with its parent entity.
*Rationale:* This applies the preservation-over-deletion philosophy established in Chapter 3 to files that are no longer actively relevant but retain historical value.

**FR-FILE-010 — Delete Files**
*Priority:* Medium
*Traceability:* FR-007; Chapter 3 Section 3.8.3, 3.8.7
*Requirement Statement:* The system shall allow an authorized User to permanently delete a File Metadata record and its underlying stored content, consistent with the narrower hard-deletion case established in Chapter 3 (Section 3.8.7).
*Rationale:* Unlike most entities in this system, files may need to be permanently removed (for example, an accidental or incorrect upload), and this requirement provides that deliberate capability.

**FR-FILE-011 — Restore Archived Files**
*Priority:* Low
*Traceability:* FR-007
*Requirement Statement:* The system shall allow an authorized User to restore a previously archived File Metadata record to active status.
*Rationale:* This complements FR-FILE-009, preserving the reversibility expected of archival operations.

**FR-FILE-012 — File Metadata Visibility**
*Priority:* Medium
*Traceability:* FR-007; Chapter 3 Section 3.4.10
*Requirement Statement:* The system shall display, for each file, its filename, uploader, and upload timestamp to any User authorized to view its parent entity.
*Rationale:* This gives Users the descriptive context needed to identify a file without requiring them to open or download it first.

**FR-FILE-013 — File Ownership**
*Priority:* High
*Traceability:* Chapter 3 Sections 3.4.10, 3.5.10
*Requirement Statement:* The system shall ensure that every File Metadata record belongs to exactly one parent entity — a Client, a Project, or a Task — at all times.
*Rationale:* This enforces, at the functional level, the polymorphic ownership constraint established in Chapter 3 (Section 3.5.10).

**FR-FILE-014 — File Access Authorization**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall restrict access to a file to Users who are authorized to view its parent Client, Project, or Task, regardless of how the file's underlying storage location might otherwise be reached, and shall further restrict a Client-role User's access to only files designated as shared with the Client, per FR-FILE-005.
*Rationale:* This upholds the retrieval and access control principle established in Chapter 2 (Section 2.7.3), ensuring a file is never more accessible than the entity it belongs to, and that a Client-role User can never reach an internal-only file directly.

**FR-FILE-015 — File Size Validation**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall reject a file upload that exceeds a defined maximum size, and shall inform the uploading User that the file could not be accepted for this reason.
*Rationale:* Size limits protect the system from excessive storage and bandwidth consumption; the specific limit value is an implementation and configuration concern outside the scope of this SRS.

**FR-FILE-016 — Unsupported File Handling**
*Priority:* Medium
*Traceability:* FR-007
*Requirement Statement:* The system shall reject an upload of a file type it does not support, and shall inform the uploading User that the file type could not be accepted.
*Rationale:* This ensures Users receive clear feedback rather than an unexplained failure when attempting to upload an incompatible file type.

**FR-FILE-017 — Duplicate Upload Handling**
*Priority:* Low
*Traceability:* FR-007
*Requirement Statement:* The system shall allow multiple distinct File Metadata records with the same filename to be associated with the same parent entity, distinguishing between them by upload timestamp and uploader.
*Rationale:* Since legitimate scenarios (revised drafts, resubmissions) may reasonably share a filename, the system accommodates this rather than treating identical filenames as an error condition.

**FR-FILE-018 — Audit Significant File Operations**
*Priority:* High
*Traceability:* FR-006; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record, in the Activity Log, every significant file operation — upload, version replacement, archival, restoration, and deletion — together with the identity of the User who performed it.
*Rationale:* This extends the auditability principle established throughout this SRS to the File Management capability.

---

### 4.11 Notifications

This section defines the functional requirements governing the Notification entity described in Chapter 3 (Section 3.4.8) and the real-time communication architecture described in Chapter 2 (Section 2.8), through which Users are made aware of relevant system events without needing to actively search for them.

**FR-NOTIFY-001 — Generate Notifications Automatically**
*Priority:* High
*Traceability:* FR-008 (Real-Time Notifications)
*Requirement Statement:* The system shall automatically generate a Notification for a User whenever a defined triggering event relevant to that User occurs, without requiring manual initiation by any User.
*Rationale:* Automatic generation is what allows Notifications to reliably reflect system activity, per Chapter 3 (Section 3.4.8).

**FR-NOTIFY-002 — Notify Task Assignment**
*Priority:* High
*Traceability:* FR-008; FR-TASK-007
*Requirement Statement:* The system shall generate a Notification for a User when a Task is assigned to them.
*Rationale:* This directly supports the Employee clarity-on-assigned-work need identified in Chapter 1 (Section 1.5.3).

**FR-NOTIFY-003 — Notify Task Reassignment**
*Priority:* Medium
*Traceability:* FR-008; FR-TASK-008
*Requirement Statement:* The system shall generate a Notification for both the previously assigned User and the newly assigned User when a Task is reassigned.
*Rationale:* Both parties have a legitimate interest in a reassignment: one is relieved of responsibility, and the other newly assumes it.

**FR-NOTIFY-004 — Notify Status Changes**
*Priority:* High
*Traceability:* FR-008; FR-PROJ-011; FR-TASK-014
*Requirement Statement:* The system shall generate a Notification for relevant Users when the status of a Task or Project they are associated with changes.
*Rationale:* This directly addresses the delayed-communication problem identified in Chapter 1 (Section 1.2.5).

**FR-NOTIFY-005 — Notify Comments**
*Priority:* Medium
*Traceability:* FR-008; FR-COMMENT-001, FR-COMMENT-002
*Requirement Statement:* The system shall generate a Notification for relevant Users when a new Comment is added to a Task or Project they are associated with, subject to the restriction that a Client-role User shall be notified only of Comments they are authorized to view per FR-COMMENT-013.
*Rationale:* This ensures ongoing discussion is surfaced to participants without requiring them to continuously monitor a Task or Project, while never alerting a Client-role User to the existence of an internal-only discussion they cannot access.

**FR-NOTIFY-006 — Notify Mentions**
*Priority:* High
*Traceability:* FR-008; FR-COMMENT-006
*Requirement Statement:* The system shall generate a Notification for a User when they are explicitly mentioned in a Comment.
*Rationale:* This fulfills the mention capability established in FR-COMMENT-006, ensuring a mention reliably reaches its intended recipient.

**FR-NOTIFY-007 — Notify Project Updates**
*Priority:* Medium
*Traceability:* FR-008; FR-PROJ-002
*Requirement Statement:* The system shall generate a Notification for relevant Users when significant Project-level information, such as its timeline or priority, is updated.
*Rationale:* This keeps Managers, assigned team members, and the Client-role User associated with the Project aware of changes to the context surrounding their work.

**FR-NOTIFY-008 — Notification Prioritization**
*Priority:* Low
*Traceability:* FR-008
*Requirement Statement:* The system shall distinguish Notifications originating from higher-urgency events (such as a Task assignment or a mention) from those originating from lower-urgency events (such as a general Project update), in how they are presented to the User.
*Rationale:* Prioritization helps Users identify the Notifications most likely to require immediate attention amid a larger volume of routine updates.

**FR-NOTIFY-009 — Read/Unread State**
*Priority:* High
*Traceability:* FR-008; Chapter 3 Section 3.4.8
*Requirement Statement:* The system shall maintain a read or unread state for each Notification, defaulting to unread at the time of creation.
*Rationale:* This state is what allows a User to distinguish new activity from activity they have already acknowledged.

**FR-NOTIFY-010 — Mark Notification as Read**
*Priority:* Medium
*Traceability:* FR-008
*Requirement Statement:* The system shall allow a User to mark an individual Notification as read.
*Rationale:* This gives Users direct control over acknowledging specific Notifications.

**FR-NOTIFY-011 — Mark All Notifications as Read**
*Priority:* Low
*Traceability:* FR-008
*Requirement Statement:* The system shall allow a User to mark all of their currently unread Notifications as read in a single action.
*Rationale:* This reduces the effort required to clear a backlog of routine Notifications, supporting the same efficiency objective referenced in FR-TASK-018.

**FR-NOTIFY-012 — Notification History**
*Priority:* Medium
*Traceability:* FR-008
*Requirement Statement:* The system shall allow a User to view their past Notifications, including those already marked as read, for a reasonable period of time.
*Rationale:* Notification history allows a User to revisit an alert they may have dismissed without fully acting on it.

**FR-NOTIFY-013 — Notification Filtering**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall allow a User to filter their Notifications by attributes such as read/unread state or triggering event type.
*Rationale:* This applies the search and filtering functional requirement from Chapter 1 (FR-010) to the Notification entity.

**FR-NOTIFY-014 — Notification Visibility**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall ensure that a Notification is visible only to its intended recipient User, and never to any other User regardless of role.
*Rationale:* This upholds the scoped delivery principle established in Chapter 2 (Section 2.8.2), applied here as an observable, testable functional requirement.

**FR-NOTIFY-015 — Real-Time Delivery**
*Priority:* High
*Traceability:* FR-008; Chapter 2 Section 2.8
*Requirement Statement:* The system shall deliver a Notification to an actively connected User without requiring that User to manually refresh or re-request their Notification list.
*Rationale:* This is the functional expression of the real-time communication architecture established in Chapter 2, directly addressing the delayed-communication problem identified in Chapter 1 (Section 1.2.5).

**FR-NOTIFY-016 — Prevent Duplicate Notifications**
*Priority:* Medium
*Traceability:* FR-008
*Requirement Statement:* The system shall not generate more than one Notification for the same User in response to a single occurrence of the same triggering event.
*Rationale:* This prevents redundant alerts from a single event from being perceived as multiple, unrelated pieces of activity.

**FR-NOTIFY-017 — Notification Retention**
*Priority:* Low
*Traceability:* Chapter 3 Section 3.8.6
*Requirement Statement:* The system shall retain a Notification for a defined period sufficient to support the notification history requirement (FR-NOTIFY-012), after which it may be removed independently of the entity that originally triggered it.
*Rationale:* Consistent with the shorter practical relevance of individual Notifications noted in Chapter 3 (Section 3.4.8), Notifications are treated as a more transient record than the Activity Log, which is retained permanently per Section 3.8.6.

**FR-NOTIFY-018 — Audit Significant Notification Events**
*Priority:* Low
*Traceability:* FR-006
*Requirement Statement:* The system shall record, in the Activity Log, the occurrence of a triggering event that generates Notifications (such as a Task assignment or status change) as part of that event's own audit record, rather than logging the Notification itself as a separate audited action.
*Rationale:* Since a Notification is a derived consequence of another auditable action already covered elsewhere in this chapter (for example, FR-TASK-026), this requirement clarifies that the underlying event, not the Notification it produces, is the appropriate subject of audit logging.

---

### 4.12 Dashboard & Reporting

This section defines the functional requirements governing the role-specific dashboards and summary reporting views described in Chapter 1 (Section 1.6, FR-009), through which Users obtain an at-a-glance understanding of organizational, project, and task activity without navigating to each entity individually.

**FR-DASH-001 — Role-Specific Dashboards**
*Priority:* High
*Traceability:* FR-009 (Dashboards & Role-Specific Views)
*Requirement Statement:* The system shall present a dashboard to every authenticated User, the content of which is determined by that User's role.
*Rationale:* This establishes the dashboard as a universal entry point whose content adapts to the User viewing it, consistent with the role-aware presentation principle established in Chapter 2 (Section 2.3.1).

**FR-DASH-002 — Administrator Dashboard**
*Priority:* High
*Traceability:* FR-009; Chapter 1 Section 1.5.1
*Requirement Statement:* The system shall present an Administrator with a dashboard emphasizing organization-wide metrics, including overall Client, Project, and User activity across the Organization.
*Rationale:* This directly supports the Administrator's need for overall business visibility identified in Chapter 1 (Section 1.5.1).

**FR-DASH-003 — Manager Dashboard**
*Priority:* High
*Traceability:* FR-009; Chapter 1 Section 1.5.2
*Requirement Statement:* The system shall present a Manager with a dashboard emphasizing the Projects they oversee and the workload of the team members assigned to those Projects.
*Rationale:* This directly supports the Manager's need to keep their Projects on track and manage team workload, per Chapter 1 (Section 1.5.2).

**FR-DASH-004 — Employee Dashboard**
*Priority:* High
*Traceability:* FR-009; Chapter 1 Section 1.5.3
*Requirement Statement:* The system shall present an Employee with a dashboard emphasizing the Tasks currently assigned to them and any associated deadlines.
*Rationale:* This directly supports the Employee's need for clarity on assigned work, per Chapter 1 (Section 1.5.3), and complements the personal assigned-task view established in FR-TASK-022.

**FR-DASH-005 — Personalized Dashboard Content**
*Priority:* Medium
*Traceability:* FR-009
*Requirement Statement:* The system shall ensure that the specific data displayed on a dashboard reflects only the Clients, Projects, and Tasks the viewing User is authorized to see, consistent with their individual scope of involvement.
*Rationale:* Even within a shared role, two Users (for example, two Managers overseeing different Projects) must see dashboard content specific to their own scope rather than an identical, generic view.

**FR-DASH-006 — Dashboard Widgets**
*Priority:* Low
*Traceability:* FR-009
*Requirement Statement:* The system shall organize dashboard content into discrete, individually identifiable sections, each presenting a specific category of information (such as recent activity or upcoming deadlines).
*Rationale:* Discrete sections allow a dashboard to present multiple categories of information clearly, without prescribing a specific visual layout, which remains a design and implementation concern.

**FR-DASH-007 — Organization Overview**
*Priority:* Medium
*Traceability:* FR-009; Chapter 1 Section 1.5.1
*Requirement Statement:* The system shall present the Administrator dashboard with a summary count of active Clients, active Projects, and active Users within the Organization.
*Rationale:* This gives the Administrator an immediate, high-level sense of organizational scale and activity.

**FR-DASH-008 — Project Overview**
*Priority:* Medium
*Traceability:* FR-009; FR-PROJ-014
*Requirement Statement:* The system shall present, within the relevant dashboard, a summary of Projects the viewing User is associated with, including each Project's current status and progress.
*Rationale:* This surfaces the Project progress tracking established in FR-PROJ-014 at the dashboard level, without requiring the User to open each Project individually.

**FR-DASH-009 — Task Overview**
*Priority:* Medium
*Traceability:* FR-009; FR-TASK-022
*Requirement Statement:* The system shall present, within the relevant dashboard, a summary of Tasks assigned to the viewing User, including their status and due dates.
*Rationale:* This surfaces the personal assigned-task view established in FR-TASK-022 in a condensed, at-a-glance form.

**FR-DASH-010 — Recent Activity**
*Priority:* Medium
*Traceability:* FR-009; FR-006
*Requirement Statement:* The system shall present, within the relevant dashboard, a summary of the most recent significant activity relevant to the viewing User, drawn from the Activity Log.
*Rationale:* This gives Users immediate awareness of recent change without requiring them to consult the full Activity Log history described in FR-PROJ-019 and FR-TASK-025.

**FR-DASH-011 — Pending Work Summary**
*Priority:* Medium
*Traceability:* FR-009
*Requirement Statement:* The system shall present, within the relevant dashboard, a count or summary of Tasks that remain incomplete and are relevant to the viewing User's role and scope.
*Rationale:* This gives Managers and Employees a quick sense of outstanding work without requiring navigation into individual Projects.

**FR-DASH-012 — Upcoming Deadlines**
*Priority:* High
*Traceability:* FR-009; FR-TASK-012; FR-PROJ-013
*Requirement Statement:* The system shall present, within the relevant dashboard, a summary of Tasks and Projects with due dates approaching within a defined near-term window, relevant to the viewing User.
*Rationale:* This directly addresses the proactive-management objective identified in Chapter 1 (Section 1.2.3), surfacing deadline risk before it becomes a missed deadline.

**FR-DASH-013 — Team Workload Visibility**
*Priority:* Medium
*Traceability:* FR-009; Chapter 1 Section 1.2.3
*Requirement Statement:* The system shall present, within the Manager and Administrator dashboards, a summary of how Tasks are distributed across the team members within their respective scope.
*Rationale:* This directly addresses the poor visibility into team workload identified in Chapter 1's problem statement (Section 1.2.3).

**FR-DASH-014 — Dashboard Refresh Behavior**
*Priority:* Medium
*Traceability:* FR-009; Chapter 2 Section 2.8
*Requirement Statement:* The system shall update dashboard content to reflect relevant changes without requiring the viewing User to manually reload the page, for changes that occur while the dashboard is actively being viewed.
*Rationale:* This applies the real-time communication capability described in Chapter 2 to the dashboard, keeping it consistent with the real-time delivery principle established in FR-NOTIFY-015.

**FR-DASH-015 — Permission-Based Visibility**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall ensure that no dashboard ever displays data belonging to a Client, Project, or Task the viewing User is not authorized to access.
*Rationale:* This restates the scoped access control principle established in Section 4.3 as it specifically applies to dashboard aggregation, since a dashboard summarizing data across many entities carries a particular risk of inadvertently exposing unauthorized information if not carefully scoped.

**FR-DASH-016 — Reporting Summaries**
*Priority:* Medium
*Traceability:* FR-009
*Requirement Statement:* The system shall allow an authorized User to view a summary report of activity across a defined set of Clients, Projects, or Tasks within their permitted scope, over a specified period of time.
*Rationale:* This extends the dashboard's at-a-glance summaries into a more deliberate, User-initiated reporting capability, without constituting the advanced analytics explicitly deferred in Chapter 1 (Section 1.4.2).

**FR-DASH-017 — Export Capability**
*Priority:* Low
*Traceability:* FR-009
*Requirement Statement:* Where a reporting summary is presented, the system shall allow an authorized User to export that summary in a commonly readable format for use outside the platform.
*Rationale:* Export supports Users who need to share or archive a summary outside of ClientSphere, though it remains a lower-priority enhancement relative to the summaries themselves.

**FR-DASH-018 — Audit Significant Reporting Operations**
*Priority:* Low
*Traceability:* FR-006
*Requirement Statement:* The system shall record, in the Activity Log, the export of a reporting summary containing Client or Project data, together with the identity of the User who performed the export.
*Rationale:* Because an export moves data outside the platform's own access-control boundary, this action warrants an audit record even though routine dashboard viewing does not.

---

### 4.13 Search & Filtering

This section defines the functional requirements governing search and filtering as a cross-cutting capability spanning Clients, Projects, Tasks, Users, and Files, building on the entity-specific search and filter requirements already established in Sections 4.5 through 4.8, and fulfilling the general search and filtering objective established in Chapter 1 (Section 1.6, FR-010).

**FR-SEARCH-001 — Global Search**
*Priority:* Medium
*Traceability:* FR-010 (Search & Filtering)
*Requirement Statement:* The system shall allow an authorized User to submit a single search query and receive matching results drawn from across Clients, Projects, and Tasks within their permitted visibility scope.
*Rationale:* Global search provides a single entry point for locating relevant information, complementing rather than replacing the entity-specific search capabilities established elsewhere in this chapter.

**FR-SEARCH-002 — Search Clients**
*Priority:* Medium
*Traceability:* FR-010; FR-CLIENT-006
*Requirement Statement:* The system shall include matching Client records among the results returned by a search query, consistent with the Client search capability already established in FR-CLIENT-006.
*Rationale:* This confirms that Client search participates in the unified search experience described in FR-SEARCH-001, rather than existing only as an isolated, Client-specific capability.

**FR-SEARCH-003 — Search Projects**
*Priority:* Medium
*Traceability:* FR-010; FR-PROJ-016
*Requirement Statement:* The system shall include matching Project records among the results returned by a search query, consistent with the Project search capability already established in FR-PROJ-016.
*Rationale:* This extends Project search into the unified search experience described in FR-SEARCH-001.

**FR-SEARCH-004 — Search Tasks**
*Priority:* Medium
*Traceability:* FR-010; FR-TASK-019
*Requirement Statement:* The system shall include matching Task records among the results returned by a search query, consistent with the Task search capability already established in FR-TASK-019.
*Rationale:* This extends Task search into the unified search experience described in FR-SEARCH-001.

**FR-SEARCH-005 — Search Users**
*Priority:* Low
*Traceability:* FR-010; FR-USER-009
*Requirement Statement:* The system shall include matching User records among the results returned by a search query, consistent with the User search capability already established in FR-USER-009, where the searching User is authorized to view User records.
*Rationale:* This extends User search into the unified search experience described in FR-SEARCH-001, subject to the same authorization limits already governing User visibility.

**FR-SEARCH-006 — Search Files**
*Priority:* Low
*Traceability:* FR-010; FR-007
*Requirement Statement:* The system shall allow an authorized User to search for a File Metadata record by filename within their permitted visibility scope.
*Rationale:* This introduces search specifically for the File Metadata entity, which was not addressed as part of the file management requirements established in Section 4.10.

**FR-SEARCH-007 — Keyword Search**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall match a search query against relevant descriptive text fields of an entity (such as a Client's name, a Project's title, or a Task's description) rather than requiring an exact, whole-value match.
*Rationale:* Keyword-level matching makes search practically usable, since Users rarely recall the complete, exact value of the field they are searching for.

**FR-SEARCH-008 — Filtering by Status**
*Priority:* Medium
*Traceability:* FR-010; FR-PROJ-017; FR-TASK-020; FR-CLIENT-007
*Requirement Statement:* The system shall allow an authorized User to filter search results by the status of the underlying Client, Project, or Task, consistent with the status-based filtering already established for each of those entities individually.
*Rationale:* This confirms status filtering operates consistently as a cross-entity capability rather than being defined differently for each entity.

**FR-SEARCH-009 — Filtering by Priority**
*Priority:* Medium
*Traceability:* FR-010; FR-PROJ-017; FR-TASK-020
*Requirement Statement:* The system shall allow an authorized User to filter search results by the priority level of the underlying Project or Task.
*Rationale:* This applies priority-based filtering consistently across the entities to which priority applies.

**FR-SEARCH-010 — Filtering by Assignee**
*Priority:* Medium
*Traceability:* FR-010; FR-TASK-020
*Requirement Statement:* The system shall allow an authorized User to filter Task-related search results by the User to whom each Task is assigned.
*Rationale:* This supports Managers reviewing work distribution across their team, complementing the team workload visibility established in FR-DASH-013.

**FR-SEARCH-011 — Filtering by Client**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to filter Project-related and File-related search results by their associated Client.
*Rationale:* This allows a User to narrow results to the work concerning a specific Client, a common navigational need identified in Chapter 1's problem statement (Section 1.2.1).

**FR-SEARCH-012 — Filtering by Project**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall allow an authorized User to filter Task-related and File-related search results by their associated Project.
*Rationale:* This mirrors client-based filtering (FR-SEARCH-011) at the Project level, supporting navigation focused on a specific body of work.

**FR-SEARCH-013 — Sorting**
*Priority:* Low
*Traceability:* FR-010; FR-PROJ-018; FR-TASK-021
*Requirement Statement:* The system shall allow an authorized User to sort search results by relevant attributes such as due date, priority, or last updated date.
*Rationale:* This confirms sorting operates consistently across search results generally, extending the entity-specific sorting already established in FR-PROJ-018 and FR-TASK-021.

**FR-SEARCH-014 — Saved Filters (Future Extensibility)**
*Priority:* Low
*Traceability:* Chapter 3 Section 3.9.5
*Requirement Statement:* The system is not required to support saving a filter or search configuration for repeated future use in the current scope, but the search and filtering capability's design shall not preclude the future introduction of saved filters.
*Rationale:* Consistent with the extensibility principle established in Chapter 3 (Section 3.9.5), this requirement explicitly defers saved filters rather than silently omitting consideration of them.

**FR-SEARCH-015 — Search Authorization**
*Priority:* High
*Traceability:* FR-001; FR-AUTH-013
*Requirement Statement:* The system shall restrict search results to only those entities the searching User is authorized to view, applying the same scoped access control principle established in Section 4.3 to search as to direct navigation.
*Rationale:* Search must never function as a means of bypassing the authorization rules that would otherwise restrict a User's direct access to an entity.

**FR-SEARCH-016 — No Cross-Organization Search Results**
*Priority:* High
*Traceability:* Chapter 1 NFR-1; Chapter 3 Section 3.2.3
*Requirement Statement:* The system shall never include, in any search result, an entity belonging to an Organization other than the searching User's own Organization.
*Rationale:* This is the search-specific expression of the organizational data isolation principle established in Chapter 3 (Section 3.2.3), warranting explicit statement given the particular risk that a poorly scoped search could otherwise surface cross-organization data.

**FR-SEARCH-017 — Search Result Relevance**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall order search results such that entities more closely matching the search query are presented ahead of less closely matching ones.
*Rationale:* Relevance ordering makes search results practically useful, particularly as the volume of matching results grows.

**FR-SEARCH-018 — Empty Search Handling**
*Priority:* Medium
*Traceability:* FR-010
*Requirement Statement:* The system shall clearly indicate to a User when a search query returns no matching results, rather than presenting an ambiguous or blank outcome.
*Rationale:* Clear feedback prevents a User from mistaking a legitimate empty result for a system malfunction.

**FR-SEARCH-019 — Invalid Search Handling**
*Priority:* Low
*Traceability:* FR-010
*Requirement Statement:* The system shall reject a malformed or invalid search query without error, informing the User that the query could not be processed as submitted.
*Rationale:* This ensures unusual or improperly formed input degrades gracefully rather than producing an unhandled failure.

---

### 4.14 Error Handling & Validation

This section defines the functional requirements governing how ClientSphere responds to invalid input, unauthorized actions, and unexpected conditions, ensuring the system behaves predictably and preserves data integrity even when an operation cannot be completed as requested.

**FR-ERROR-001 — Required Field Validation**
*Priority:* High
*Traceability:* Chapter 3 Section 3.6.5
*Requirement Statement:* The system shall reject the creation or update of an entity if a field designated as mandatory for that entity is missing, and shall identify which field is missing.
*Rationale:* This applies the layered validation principle established in Chapter 3 (Section 3.6.5) as an observable, testable behavior.

**FR-ERROR-002 — Input Validation**
*Priority:* High
*Traceability:* Chapter 3 Section 3.6.5
*Requirement Statement:* The system shall reject a submitted value that does not conform to the expected format or type for its corresponding field, and shall identify which field failed validation.
*Rationale:* This ensures malformed input is caught before it can affect the data model, rather than being silently accepted in an inconsistent form.

**FR-ERROR-003 — Business Rule Validation**
*Priority:* High
*Traceability:* Chapter 3 Section 3.6.6
*Requirement Statement:* The system shall reject an operation that would violate a defined business rule (such as the invalid status transitions described in FR-TASK-024 or the archiving restriction described in FR-PROJ-021), even where the underlying input is otherwise well-formed.
*Rationale:* This distinguishes business rule enforcement from basic structural validation, consistent with the business rule enforcement principle established in Chapter 3 (Section 3.6.6).

**FR-ERROR-004 — Authorization Failure Handling**
*Priority:* High
*Traceability:* FR-AUTH-014
*Requirement Statement:* The system shall reject a request for an action the requesting User is not permitted to perform, consistent with the unauthorized access handling requirement established in FR-AUTH-014, and shall not disclose information about the entity beyond what is necessary to indicate the request was denied.
*Rationale:* This ensures authorization failures are handled consistently across every capability described in this chapter, without leaking details that could reveal information about entities the User is not authorized to see.

**FR-ERROR-005 — Authentication Failure Handling**
*Priority:* High
*Traceability:* FR-AUTH-017
*Requirement Statement:* The system shall reject a request lacking valid authentication, consistent with the authentication failure handling requirement established in FR-AUTH-017, prior to evaluating any authorization or business logic for that request.
*Rationale:* Authentication must be confirmed before any other processing occurs, ensuring unauthenticated requests are never partially evaluated against business logic.

**FR-ERROR-006 — Resource Not Found Handling**
*Priority:* Medium
*Traceability:* Chapter 3 Section 3.6.2
*Requirement Statement:* The system shall clearly indicate when a requested entity does not exist, distinguishing this condition from an authorization failure where the entity exists but is not visible to the requesting User.
*Rationale:* Distinguishing "does not exist" from "not authorized to view" supports clear, predictable behavior, while the specific wording or detail disclosed in each case remains subject to the confidentiality consideration established in FR-ERROR-004.

**FR-ERROR-007 — Duplicate Resource Handling**
*Priority:* Medium
*Traceability:* FR-CLIENT-010; FR-PROJ-020
*Requirement Statement:* The system shall respond to an attempt to create a likely-duplicate record, as identified per FR-CLIENT-010 and FR-PROJ-020, by clearly informing the requesting User rather than silently creating a duplicate or silently rejecting the request.
*Rationale:* This ensures duplicate handling is visible and actionable to the User, rather than occurring invisibly in either direction.

**FR-ERROR-008 — Invalid State Transition Handling**
*Priority:* Medium
*Traceability:* FR-TASK-024; Chapter 3 Section 3.6.6
*Requirement Statement:* The system shall clearly inform a User when a requested status change is rejected as an invalid transition, identifying the entity's current status.
*Rationale:* This gives a User the context needed to understand why a status change did not succeed, complementing the invalid transition prevention established in FR-TASK-024.

**FR-ERROR-009 — Invalid File Handling**
*Priority:* Medium
*Traceability:* FR-FILE-015; FR-FILE-016
*Requirement Statement:* The system shall clearly inform a User when a file upload is rejected for exceeding the size limit established in FR-FILE-015 or for an unsupported file type as established in FR-FILE-016, distinguishing between these two reasons.
*Rationale:* Distinguishing the specific reason for rejection helps the User understand what corrective action, if any, is possible.

**FR-ERROR-010 — Validation Feedback**
*Priority:* High
*Traceability:* FR-ERROR-001; FR-ERROR-002
*Requirement Statement:* The system shall provide feedback for a rejected operation that identifies which aspect of the request was invalid, sufficient for the requesting User to understand what correction is needed.
*Rationale:* Feedback that merely indicates failure, without explaining why, would leave a User unable to correct their input and resubmit successfully.

**FR-ERROR-011 — Consistent Error Responses**
*Priority:* Medium
*Traceability:* Chapter 2 Section 2.4.4
*Requirement Statement:* The system shall present errors of the same category (validation failure, authorization failure, not-found, and so on) in a consistent manner across every capability described in this chapter.
*Rationale:* This is the functional expression of the centralized error-handling architecture established in Chapter 2 (Section 2.4.4), ensuring Users experience predictable behavior regardless of which part of the system produced an error.

**FR-ERROR-012 — Graceful Handling of Unexpected Failures**
*Priority:* High
*Traceability:* Chapter 1 NFR-4
*Requirement Statement:* The system shall respond to an unexpected internal failure by informing the requesting User that the operation could not be completed, without exposing internal technical detail about the cause of the failure.
*Rationale:* This directly supports the reliability and graceful degradation objective established in Chapter 1 (NFR-4), ensuring an unforeseen failure does not present raw technical detail to a User.

**FR-ERROR-013 — Preservation of Data Integrity After Failures**
*Priority:* High
*Traceability:* Chapter 3 Section 3.6; Chapter 1 NFR-9
*Requirement Statement:* The system shall ensure that a failed operation does not leave an entity in a partially updated or inconsistent state; an operation must either complete fully or have no lasting effect on the data model.
*Rationale:* This upholds the data integrity principle established throughout Chapter 3 (Section 3.6), preventing a failure partway through an operation from producing exactly the kind of inconsistent state that chapter's principles are designed to prevent.

**FR-ERROR-014 — Logging of Significant System Errors**
*Priority:* Medium
*Traceability:* Chapter 1 NFR-4; Chapter 3 Section 3.4.9
*Requirement Statement:* The system shall record the occurrence of significant, unexpected internal failures in a manner accessible for later technical review, distinct from the User-facing Activity Log described in Chapter 3.
*Rationale:* Technical error logging serves operational and diagnostic purposes distinct from the business-oriented Activity Log, and the two are not intended to be the same record.

**FR-ERROR-015 — Retry Guidance Where Appropriate**
*Priority:* Low
*Traceability:* Chapter 1 NFR-4
*Requirement Statement:* Where a failure is likely to be transient (such as a temporarily unavailable external service described in Chapter 2, Section 2.5), the system shall indicate to the User that the operation may succeed if attempted again.
*Rationale:* This helps a User distinguish a transient issue worth retrying from a substantive error requiring correction of their input, supporting the graceful degradation objective established in Chapter 1 (NFR-4).

---

### 4.15 Chapter Summary

Chapter 4 has translated the architecture established in Chapter 2 and the conceptual data model established in Chapter 3 into a comprehensive, testable specification of ClientSphere's observable behavior. Beginning with the foundational capability of authentication and authorization (Section 4.3), the chapter proceeded through the full set of business capabilities identified across this SRS: Organization and User management (Sections 4.4–4.5), Client management (Section 4.6), Project and Task management (Sections 4.7–4.8), collaboration through Comments (Section 4.9), File management (Section 4.10), Notifications (Section 4.11), Dashboards and reporting (Section 4.12), cross-cutting Search and Filtering (Section 4.13), and, finally, the error handling and validation behavior that governs how the system responds when an operation cannot be completed as requested (Section 4.14). Across these sections, well over one hundred individually identifiable requirements have been defined, each assigned a unique identifier, a priority, an explicit traceability reference, a testable SHALL statement, and a rationale connecting it back to the reasoning established earlier in this document.

Every one of these requirements exists in direct service of the business objectives and problem statement established in Chapter 1: the fragmentation of tools is addressed by unifying Client, Project, Task, Comment, and File data within a single system of record; the lack of a single source of truth is addressed by the Client and Organization management capabilities; poor visibility into project health and team workload is addressed by the dashboard, progress tracking, and reporting capabilities; the absence of role-appropriate access is addressed by the authentication, authorization, and scoped-visibility requirements running throughout every section; and delayed communication is addressed by the Comment and Notification capabilities. At the same time, this chapter has consistently honored the architecture defined in Chapter 2 — reflecting the modular monolith's domain boundaries in how requirements are grouped, the real-time communication layer in every requirement describing live delivery, and the background processing layer's role in supporting asynchronous behavior — and the conceptual data model defined in Chapter 3, with every requirement's traceability grounded in the entities, relationships, and integrity principles that chapter established.

Throughout, this chapter has deliberately remained implementation-independent: no API endpoints, request or response structures, database queries, or interface layouts have been specified. This is intentional. Chapter 4 defines the functional contract ClientSphere must fulfill; it does not yet define the technical means by which that contract is delivered.

With the system's architecture, data model, and functional behavior now fully established, the next chapter turns to the **API Specification** — translating the functional requirements defined in this chapter into the concrete request and response contracts, endpoint structures, and technical interface details through which the frontend, backend, and external services described in Chapter 2 will actually communicate to deliver the behavior this chapter has defined.

---

**End of Chapter 4.**

---
---

## Chapter 5: API Specification

### 5.1 API Specification Overview

**5.1.1 Purpose of the API Layer.** Chapter 4 defined, in precise and testable terms, what ClientSphere must do from a User's perspective. Chapter 5 begins the process of defining how that behavior is exposed as a technical contract — the Application Programming Interface (API) through which the frontend described in Chapter 2 (Section 2.3) invokes the business logic and data described in Chapters 2 and 3. The API layer exists to serve as the single, well-defined boundary through which every functional requirement in Chapter 4 is actually invoked; no functional behavior in this system is reachable except through this layer.

**5.1.2 Role of REST APIs Within ClientSphere.** Consistent with the API/Application Layer described in Chapter 2 (Section 2.2, Layer 2), ClientSphere exposes its functionality through a **REST (Representational State Transfer) API**. REST is adopted because it organizes functionality around identifiable resources — Organizations, Users, Clients, Projects, Tasks, and the other entities defined in Chapter 3 — manipulated through a small, standard set of operations, rather than around an open-ended collection of bespoke actions. This resource orientation gives the API a structure that mirrors the conceptual data model already established, making the API easier to reason about consistently across every business capability defined in Chapter 4.

**5.1.3 Relationship Between Frontend and Backend.** As established in Chapter 2 (Section 2.1.2), the frontend and backend are fully decoupled: the React frontend has no direct access to the database, to Cloudinary, to Google OAuth, or to any other backend dependency. The REST API is the sole channel through which the frontend requests data or triggers a change in system state. This relationship is deliberately one of client and service — the frontend initiates every request, and the backend is solely responsible for enforcing the rules, described throughout Chapter 4, that govern whether and how that request is fulfilled.

**5.1.4 Stateless Communication Model.** Each request made to the API is handled as an independent, self-contained unit: the backend does not rely on memory of a prior request to interpret the current one. Every request that requires an authenticated context carries the information (the session credential described in Chapter 2, Section 2.6.1) necessary for the backend to establish that context anew. This statelessness is what allows the backend, described as a single deployable service in Chapter 2 (Section 2.1.1), to handle requests predictably and, if scaled to multiple instances in the future, without requiring requests from the same User to be routed to the same specific instance.

**5.1.5 Interaction With the Authentication System.** Every API request that acts on behalf of a specific User passes through the authentication verification described in Chapter 4 (FR-AUTH-011) before any further processing occurs. The API layer is where this verification is actually applied: a request either carries a valid session credential and proceeds, or it does not and is rejected, consistent with the authentication failure handling established in FR-AUTH-017 and FR-ERROR-005.

**5.1.6 Interaction With the Business Logic Layer.** Once a request has been authenticated and its authorization confirmed, the API layer delegates to the business logic layer — the domain modules described in Chapter 2 (Section 2.4.2) — which apply the actual rules defined throughout Chapter 4 (such as the status transition rules in FR-TASK-024 or the archiving restriction in FR-PROJ-021). The API layer itself does not contain business rules; it is responsible for routing a validated, authenticated request to the module responsible for fulfilling it, and for returning that module's result in a consistent form.

**5.1.7 Interaction With the Data Layer.** The API layer never communicates with MongoDB directly. Every read or write of persisted data passes through the business logic layer into the data access layer described in Chapter 2 (Section 2.2, Layer 4), ensuring that the integrity principles established in Chapter 3 (Section 3.6) are applied consistently regardless of which API request triggered the underlying data operation.

**5.1.8 Interaction With the Real-Time Communication Layer.** Certain API requests — for example, a Task status change or the posting of a Comment — have effects that must also be communicated to other connected Users in real time. Where this is the case, fulfilling the request through the REST API layer also results in the emission of an event through the Socket.io layer described in Chapter 2 (Section 2.8), consistent with the real-time delivery requirement established in FR-NOTIFY-015. The REST API and the real-time layer are complementary rather than redundant: the REST API is the channel through which a User's own request is submitted and fulfilled, while the real-time layer is the channel through which other Users learn of the resulting change.

**5.1.9 Scope of This Chapter.** This chapter defines the API's conceptual contract — the design principles the API adheres to, and, in later sections, the resources it exposes and the general shape of its behavior for each functional area defined in Chapter 4. Consistent with the implementation-independent approach maintained throughout this SRS, this chapter does not define specific endpoint paths, request or response payload structures, HTTP framework routing syntax, or database query logic; those are implementation-phase artifacts that will be produced once this conceptual contract has been agreed upon.

**5.1.10 Relationship to Previous Chapters.** This chapter is the direct technical continuation of the three chapters that precede it: it exposes the architecture defined in Chapter 2, operates on the entities defined in Chapter 3, and fulfills the functional requirements defined in Chapter 4. Every design principle and, later, every described API behavior in this chapter must trace back to a specific requirement, entity, or architectural component already established — this chapter introduces no new business capability, only the technical contract through which existing, already-defined capability is exposed.

---

### 5.2 API Design Principles

This section establishes the philosophy the API layer adheres to as a whole. These are architectural commitments that every part of the API — regardless of which functional area or entity it concerns — is expected to honor consistently. Specific resources and their behavior are addressed in later sections of this chapter; this section deliberately stays at the level of principle.

**5.2.1 RESTful, Resource-Oriented Design.** The API is organized around the core entities defined in Chapter 3 — Organizations, Users, Clients, Projects, Tasks, Subtasks, Comments, Notifications, Activity Log entries, and File Metadata — treating each as an addressable resource, rather than organizing the API around an open-ended set of bespoke, action-named operations. This mirrors the entity-oriented thinking established in Chapter 3 (Section 3.2.2), ensuring the API's shape remains legible in terms of the same conceptual vocabulary already established for the data model.

**5.2.2 Consistent Resource Conventions.** Every resource is expected to be addressed and behave according to the same consistent conventions, regardless of which functional area it belongs to — the way a Client is created, retrieved, updated, or archived follows the same general pattern as the way a Project or Task is created, retrieved, updated, or archived. This consistency is a deliberate design commitment, not an incidental byproduct, and directly supports the maintainability objective established in Chapter 1 (Section 1.3.2) by ensuring a developer's understanding of one resource's behavior transfers directly to another's.

**5.2.3 Standard, Meaningful Use of HTTP Methods.** The API relies on the standard HTTP methods to express the nature of an operation — retrieving a resource, creating one, updating one, or removing one — using each method consistently for the category of operation it conventionally represents, rather than overloading a single method to mean different things in different parts of the API.

**5.2.4 Stateless Requests.** Consistent with Section 5.1.4, every request is handled independently, with no reliance on server-held conversational state between requests. Any context a request depends on (the requesting User's identity and role) is established fresh from the credential the request itself carries.

**5.2.5 Authentication Requirements.** Every API request that acts on behalf of a User is required to carry a valid session credential, per FR-AUTH-011, with a narrow, explicitly defined set of exceptions (such as the login and registration operations themselves, and the password reset request described in FR-AUTH-009, which necessarily occur before a session exists).

**5.2.6 Authorization Enforcement.** Every request is subject to the role-based and scoped authorization principles established in Chapter 2 (Section 2.6) and Chapter 4 (FR-AUTH-012, FR-AUTH-013), applied consistently at the API layer itself rather than assumed to have already been enforced by the frontend. An authorized frontend UI is a usability convenience, never a substitute for API-level enforcement.

**5.2.7 Request Validation.** Every request is validated against the required-field, input-format, and business-rule validation principles established in Chapter 4 (Section 4.14) before it is permitted to affect the underlying data model, with rejected requests handled consistent with the validation feedback and consistent error response principles established in FR-ERROR-010 and FR-ERROR-011.

**5.2.8 Consistent Response Structure.** Every response returned by the API — whether representing success or failure — follows a consistent overall structure, so that a consumer of the API (principally the frontend, but potentially other future consumers) can rely on a predictable shape regardless of which resource or operation produced the response. The specific structure itself is an implementation-phase concern; the principle established here is that it must be uniform.

**5.2.9 Standard HTTP Status Code Usage.** The API communicates the outcome of a request using HTTP status codes in accordance with their standard, conventional meaning — distinguishing, for example, success from client-side input error, from authentication failure, from authorization failure, from a resource that does not exist — consistent with the differentiated error handling established in Chapter 4 (Section 4.14).

**5.2.10 Idempotency Where Appropriate.** Operations that are naturally idempotent — such as retrieving a resource, or updating a resource to a specific target state — are designed so that repeating the same request produces the same resulting state without unintended side effects, such as duplicate creation. This is particularly relevant to operations like marking a Notification as read (FR-NOTIFY-010), which should behave identically whether performed once or repeated.

**5.2.11 Pagination Philosophy.** Any API operation that returns a potentially large collection of resources (such as a list of Tasks across an active Project, or Activity Log entries accumulated over time per Chapter 3, Section 3.7.8) is expected to return that collection in bounded, navigable portions rather than as a single unbounded result set, consistent with the performance objective established in Chapter 1 (NFR-3) and the indexing philosophy established in Chapter 3 (Section 3.7).

**5.2.12 Filtering Philosophy.** Wherever Chapter 4 establishes a filtering capability (such as filtering Tasks by status or assignee, per FR-TASK-020, or the cross-cutting filtering established in Section 4.13), the API exposes that capability as an explicit, composable part of how a resource collection is requested, rather than requiring the full collection to be retrieved and filtered elsewhere.

**5.2.13 Sorting Philosophy.** Similarly, wherever Chapter 4 establishes a sorting capability (FR-PROJ-018, FR-TASK-021, FR-SEARCH-013), the API allows the desired sort order to be expressed as part of the request for a resource collection, with a sensible default order applied when no explicit sort is specified.

**5.2.14 Search Support.** The global and entity-specific search capabilities established in Chapter 4 (Section 4.13) are exposed through the API as an explicit query capability, applying the same search authorization and organizational isolation principles established in FR-SEARCH-015 and FR-SEARCH-016 to every search request regardless of which resource type it targets.

**5.2.15 Error Handling Philosophy.** The API's error-handling behavior is a direct expression of Chapter 4, Section 4.14: validation failures, authorization failures, authentication failures, not-found conditions, and unexpected internal failures are each communicated in a distinguishable, consistent manner, with sufficient information for the consumer to understand what occurred without exposing internal technical detail, per FR-ERROR-012.

**5.2.16 Versioning Strategy.** The API is designed with the expectation that its contract will evolve over time as ClientSphere's functional scope grows, particularly given the future capabilities identified in Chapter 3 (Section 3.9.5) and Chapter 1 (Section 1.4.2). The API's versioning approach is intended to allow such evolution to occur in a controlled, clearly identified manner, without silently altering the behavior an existing consumer depends on. The specific technical mechanism for expressing a version is an implementation-phase decision, not specified in this chapter.

**5.2.17 Backward Compatibility.** Consistent with the maintainability and extensibility objectives established in Chapter 1 (Section 1.3.2) and Chapter 3 (Section 3.9), changes to the API are expected to preserve the behavior existing consumers rely on wherever reasonably possible, introducing new capability additively rather than altering or removing existing behavior without a clear, deliberate versioning decision.

**5.2.18 Security Considerations.** The API is the enforcement point for the security principles established throughout this SRS — the authentication and authorization requirements described in Sections 5.2.5 and 5.2.6, the organizational data isolation principle established in Chapter 3 (Section 3.2.3), and the broader security objective established in Chapter 1 (NFR-1). No resource or operation is exempt from these considerations by virtue of appearing to be low-risk; every request is subject to the same enforcement discipline.

**5.2.19 Extensibility.** The API's resource-oriented structure is designed to accommodate the future capabilities identified throughout this SRS — custom roles, a Client Portal, billing, time tracking, and the AI Integration Layer described in Chapter 3 (Section 3.9.5) — as new resources or additive extensions to existing ones, consistent with the extensibility principle established in Chapter 2 (Section 2.12.5).

**5.2.20 Maintainability.** Because the API mirrors the entity-oriented conceptual model established in Chapter 3 and the modular domain structure established in Chapter 2 (Section 2.4.2), its overall shape is expected to remain comprehensible and consistent as it grows, allowing a developer familiar with one resource's API behavior to reasonably predict another's, directly supporting the maintainability objective established in Chapter 1 (Section 1.3.2).

---

### 5.3 Authentication API

This section defines the conceptual API contract that exposes the authentication and authorization functional requirements established in Chapter 4 (Section 4.3). Consistent with the approach maintained throughout this chapter, this section describes what each authentication capability provides to a consumer of the API, not the technical mechanism by which it is delivered.

**5.3.1 Authentication Resource Overview**

The Authentication API is the conceptual gateway through which an individual establishes, maintains, and relinquishes an authenticated identity within ClientSphere. It is not itself a business entity in the sense that Client or Project are; rather, it is the API surface responsible for producing and validating the authenticated session that every other part of the API depends upon.

The Authentication API is closely bound to the User entity described in Chapter 3 (Section 3.4.2): every successful authentication operation resolves to a specific User record, and every subsequent authenticated request is understood, at the API layer, as a request made on behalf of that User. It is, in turn, bound to the Organization entity (Chapter 3, Section 3.4.1) because a User's identity is only ever meaningful within the Organization they belong to — authentication does not merely confirm *who* a person is, but *which Organization's* User they are.

The Authentication API is the API-layer expression of the Authentication Service described architecturally in Chapter 2 (Section 2.6.1): it is where the two login paths established in Chapter 4 (credential-based login and Google OAuth) converge into the single internal session representation described there. Once a session has been established through this API, every subsequent request across every other resource relies on the Authorization enforcement described in Chapter 4 (FR-AUTH-012, FR-AUTH-013) to determine what that authenticated User may do — the Authentication API establishes *who* is asking, while authorization, enforced consistently across the rest of the API per Section 5.2.6, determines *what* they may ask for.

Consistent with the stateless communication model established in Section 5.1.4, the Authentication API does not itself maintain server-side session state between requests. Each authentication-related operation either produces a session credential to be presented on future requests, or validates a credential already presented — the API does not depend on the backend recalling a prior authentication interaction.

**5.3.2 Registration Operations**

The registration capability of the Authentication API conceptually exposes two related, but distinct, operations, corresponding to FR-AUTH-001 and FR-AUTH-002.

The first is **Organization registration**, through which a new Organization is established together with its first User. This operation conceptually accepts the identifying information necessary to create both the Organization and its initial User in a single, coordinated action, consistent with the Organization Ownership requirement established in FR-ORG-007, which requires every Organization to have at least one Administrator at all times.

The second is **initial administrator creation**, which is not a separate operation from Organization registration but its necessary companion: the User created as part of Organization registration is conceptually always assigned the Administrator role, satisfying FR-AUTH-002 and FR-ORG-007 simultaneously. Subsequent Users joining that Organization are provisioned through the User Management capability described in Chapter 4 (Section 4.5), rather than through this registration operation.

The registration capability is expected to apply the **validation requirements** established in Chapter 4 (Section 4.14) — confirming that required identifying and credential information is present and well-formed before an Organization or User record is created — and to apply **duplicate prevention**, ensuring that a registration attempt using an email address already associated with an existing User is rejected rather than silently creating a conflicting or ambiguous identity.

A **successful registration outcome** conceptually results in a newly created Organization and its initial Administrator User, together with an established authenticated session for that User, consistent with the session issuance behavior described in FR-AUTH-004 — allowing the newly registered Administrator to proceed directly into using the platform without a separate, subsequent login step.

**5.3.3 Login Operations**

The login capability of the Authentication API exposes the credential-based **User authentication** operation described in FR-AUTH-003. Conceptually, this operation accepts a registered User's identifying credentials and performs **credential verification** against the corresponding User record, succeeding only when the supplied credentials genuinely match.

Upon successful verification, the API performs **session establishment**, issuing the session credential described in FR-AUTH-004, which the frontend subsequently presents on further requests.

A **failed authentication** attempt — whether due to incorrect credentials or another disqualifying condition — is conceptually rejected without establishing a session, consistent with the authentication failure handling described in FR-AUTH-017; the API does not distinguish, in what it communicates back, between "no such account" and "incorrect credentials," consistent with the confidentiality principle already established for authorization failures in Section 5.2.6.

The login operation also performs **account status validation**, confirming that the User's account is currently active rather than deactivated, per FR-AUTH-016; a login attempt against a deactivated account is conceptually treated the same as a failed authentication attempt, denying session establishment.

Finally, the login operation inherently performs **Organization isolation**: a successful login resolves the authenticating User strictly within the Organization they belong to, and the resulting session is scoped to that Organization for the remainder of its validity, consistent with the organizational data isolation principle established in Chapter 3 (Section 3.2.3) and reinforced in FR-ORG-008.

**5.3.4 Logout Operations**

The logout capability of the Authentication API exposes **session termination**, corresponding to FR-AUTH-007: an authenticated User may explicitly end their current session, after which the previously issued session credential is no longer accepted for authenticating further requests.

From a **security considerations** standpoint, logout is treated as a deliberate, User-initiated boundary — it exists specifically so a User can ensure their session cannot be used further, particularly relevant on a shared or public device, and its behavior does not depend on, or wait for, any other pending operation to complete.

The **expected post-logout behavior** is that any subsequent request presenting the now-terminated session credential is rejected in the same manner as any other invalid credential, per FR-AUTH-011 and FR-ERROR-005 — logout does not partially degrade access, it removes it entirely.

**5.3.5 Password Management**

The password management capability of the Authentication API conceptually exposes several related operations, corresponding to FR-AUTH-008 through FR-AUTH-010.

**Change password** allows an already-authenticated User to establish a new password, conceptually requiring that they first supply their current password, consistent with FR-AUTH-008 — this operation is only ever performed in the context of an existing authenticated session.

**Forgot password** allows an individual who cannot currently authenticate to initiate the reset process described in FR-AUTH-009, conceptually accepting their registered email address without revealing whether that address corresponds to an existing account, consistent with the non-disclosure principle already established for that requirement.

**Password reset** is the completion of that process, described in FR-AUTH-010, through which a new password is established using the securely issued mechanism produced by the forgot-password operation.

**Password validation** applies to both the change-password and password-reset operations: a newly supplied password is conceptually checked against defined strength and format expectations before being accepted, consistent with the input validation principle established in Chapter 4 (FR-ERROR-002).

The **reset token lifecycle**, described only conceptually here and not in technical detail, follows the time-limited, single-use pattern already established in FR-AUTH-010: a reset mechanism, once issued, remains valid only for a limited period and is invalidated immediately upon use, preventing it from being reused or left open indefinitely.

**5.3.6 Current User Operations**

The Authentication API exposes a conceptual operation for **retrieving the authenticated User's own profile** — the identifying and descriptive information associated with the User entity described in Chapter 3 (Section 3.4.2) — allowing the frontend to present the currently logged-in individual's own information without requiring a separate lookup through the User Management capability.

This operation also conceptually returns the User's **Organization context**, confirming which Organization the authenticated session is scoped to, consistent with the Organization isolation principle established in Section 5.3.3.

It further returns the User's **assigned role** — Administrator, Manager, or Employee, per the role property established in Chapter 3 (Section 3.4, refined in Chapter 3 Section 3.4's opening note) — and, derived from that role, the **permissions available to the User**, allowing the frontend to determine which capabilities described throughout Chapter 4 it should present as available to the currently authenticated individual, consistent with the role-aware presentation principle established in Chapter 2 (Section 2.3.1).

**5.3.7 Google OAuth Authentication**

The Google OAuth capability of the Authentication API exposes the federated login path described in FR-AUTH-005, through **external identity provider interaction** — the API conceptually verifies an identity assertion obtained from Google before proceeding, rather than accepting an unverified claim of identity.

Following successful verification, the API performs **User account association**: it determines whether the verified identity corresponds to an existing User record within the appropriate Organization.

For a **first-time login**, where no matching User record exists, the API conceptually provisions a new User record consistent with FR-AUTH-006, associating it with the appropriate Organization before establishing a session.

For a **returning User login**, where a matching User record already exists, the API resolves directly to that existing User and establishes a session for them, without creating a duplicate record.

**Organization membership considerations** govern how a Google-authenticated identity is associated with a specific Organization — consistent with the Organization isolation principle established throughout this chapter, a Google OAuth login is not permitted to grant access across Organization boundaries, and the specific mechanism by which a Google-authenticated individual is associated with the correct Organization is a matter for the detailed functional design already established conceptually in Chapter 4, rather than a new business rule introduced here.

**Failure scenarios** for Google OAuth authentication — such as a failed or rejected identity verification from Google, or an inability to resolve the verified identity to a permitted Organization — are conceptually handled consistent with the authentication failure handling principle established in FR-AUTH-017, denying session establishment without partial or degraded access.

**5.3.8 Session Validation**

The Authentication API exposes the conceptual capability of **validating authenticated sessions**, corresponding to FR-AUTH-011 — every request elsewhere in the API that requires authentication relies on this same underlying validation, confirming that a presented session credential is genuine and currently valid before any further processing occurs.

**Expired sessions** are conceptually treated as invalid: a session credential that has passed its period of validity is rejected in the same manner as one that was never valid, requiring the User to authenticate again through the login or Google OAuth operations described above.

**Unauthorized requests** — a request presenting no session credential at all, where one is required — are rejected at this same validation point, prior to any authorization or business-logic evaluation, consistent with the ordering principle established in Section 5.2.5.

**Authentication failure handling**, consistent with FR-AUTH-017 and FR-ERROR-005, ensures that every category of session validation failure — missing, invalid, or expired — is communicated back to the requesting consumer in a consistent manner, without granting any intermediate or partially authenticated state.

**5.3.9 Authentication API Design Considerations**

**Statelessness.** Every operation described in this section is designed around the stateless communication model established in Section 5.1.4 — session establishment produces a portable credential, and session validation independently confirms that credential's validity, without the backend needing to recall the specific prior interaction that produced it.

**Security.** The Authentication API is the most security-sensitive surface described in this chapter, since it is the origin point of every authenticated session in the system; it upholds the security objective established in Chapter 1 (NFR-1) through consistent credential verification, non-disclosure of account existence during password recovery, and rejection of any partially authenticated state.

**Authorization.** While authentication determines identity, the Authentication API's Current User operation (Section 5.3.6) is also where a consumer learns the authorization context — role and derived permissions — that governs every subsequent request elsewhere in the API, tying this section directly to the authorization enforcement principle established in Section 5.2.6.

**Validation.** Every operation involving new input — registration, password change, and password reset — is subject to the request validation principle established in Section 5.2.7, ensuring malformed or insufficient input is rejected before it can affect the User or Organization data model.

**Consistent responses.** Authentication outcomes — success, invalid credentials, invalid session, or validation failure — are communicated using the same consistent response structure and status code conventions established in Sections 5.2.8 and 5.2.9, ensuring the frontend can handle authentication outcomes as predictably as it handles any other API response.

**Auditability.** Significant authentication events — registration, login, logout, password change, and role or account-status changes reflected through the Current User operation — connect to the Activity Log auditability principle established in Chapter 3 (Section 3.4.9) and Chapter 4 (FR-ORG-011, FR-USER-014), ensuring that changes to who can access an Organization's ClientSphere instance remain traceable.

**Scalability.** Because session validation depends only on the credential presented with each request rather than on server-held state, the Authentication API is designed to remain functionally consistent regardless of how many backend instances may eventually handle traffic, consistent with the scalability objective established in Chapter 2 (Section 2.12.1).

**Extensibility.** The Authentication API's separation between *how* a session is established (credential login, Google OAuth, and potentially additional methods in the future) and *what* a session means once established (a User's identity, Organization, and role) allows a future additional authentication method to be introduced without altering how the rest of the API consumes an established session, consistent with the extensibility principle established in Chapter 3 (Section 3.9.5).

---

### 5.4 User Management API

This section defines the conceptual API contract that exposes the User Management functional requirements established in Chapter 4 (Section 4.5). Consistent with the approach maintained throughout this chapter, this section describes what each User Management capability provides to a consumer of the API, not the technical mechanism by which it is delivered.

**5.4.1 User Resource Overview**

The User Management API is the conceptual surface through which the User entity described in Chapter 3 (Section 3.4.2) is created, retrieved, updated, and administered within the boundary of a single Organization. Where the Authentication API described in Section 5.3 is concerned with establishing and validating a session for a single individual, the User Management API is concerned with the Administrator's — and, within their permitted scope, the Manager's — ability to manage the population of Users who make up their Organization's ClientSphere instance.

Every operation exposed by the User Management API operates strictly within the Organization data isolation principle established in Chapter 2 (Section 2.6.2) and Chapter 3 (Section 3.2.3): a request against this API can only ever create, retrieve, or modify Users belonging to the requesting User's own Organization. This API is closely bound to the role-based access control principle established in Chapter 2 (Section 2.6.2) and the functional requirements defined in Chapter 4 (FR-USER-001 through FR-USER-014) — it is where an Administrator's user-management responsibility, and a Manager's narrower, scope-bounded responsibility, are actually exercised.

Consistent with the four roles established in Chapter 1 (Administrator, Manager, Employee, and Client), the User Management API treats all four as User records differing only in their assigned role. A Client-role User is created, retrieved, and administered through the same conceptual operations described in this section as any other User, subject to the same Organization boundary; no separate API surface exists for the Client role.

**5.4.2 User Creation Operations**

The User Management API exposes two conceptually distinct creation operations, corresponding to FR-USER-001 and FR-USER-002.

**Invite User** allows an Administrator, or a Manager acting within their permitted scope, to invite a new individual to join the Organization, specifying the role — Administrator, Manager, Employee, or Client — to be assigned once the invitation is accepted. This operation does not immediately create an active User; it conceptually produces a pending invitation that becomes an active User record only upon the invited individual's acceptance, consistent with FR-USER-001.

**Create User Directly** allows an Administrator to provision a new User record immediately, without an intervening invitation-acceptance step, assigning that User's role at the time of creation, consistent with FR-USER-002. This operation is conceptually available for any of the four supported roles, including Client, allowing an Administrator to directly provision a Client-role User for a stakeholder who should not go through the invitation flow.

Both operations apply the request validation principle established in Section 5.2.7, and both are subject to the User Ownership Within Organization requirement established in FR-USER-012 — every User created through either operation is bound to the requesting Administrator's or Manager's own Organization.

**5.4.3 User Retrieval Operations**

The User Management API exposes a conceptual operation for **retrieving a single User's** profile and role information, and a related operation for **retrieving a list of Users** within the requesting individual's Organization, corresponding to FR-USER-008.

Both retrieval operations are scoped according to the requesting User's own role and permitted visibility: an Administrator may retrieve the full population of Users within their Organization, while a Manager's retrieval is conceptually bounded to the Users within their assigned scope, consistent with FR-USER-008 and the scoped access control principle established in FR-AUTH-013. Because User Management concerns internal organizational composition, a Client-role User is not a consumer of these retrieval operations — a Client's own visibility is expressed instead through the Project, Task, File, Notification, and Comment APIs described in later sections of this chapter, not through visibility into the Organization's internal User population.

**5.4.4 User Update Operations**

The User Management API exposes an operation for **updating a User's profile information**, corresponding to FR-USER-003. Consistent with that requirement, this operation is available to a User updating their own profile, regardless of role — including a Client-role User maintaining their own profile information — and separately available to an Administrator updating the profile of any User within their Organization.

Profile update is deliberately narrow in conceptual scope: it concerns only the descriptive information associated with a User record, and does not extend to role assignment, which is addressed separately in Section 5.4.6, or to account status, which is addressed in Section 5.4.5.

**5.4.5 User Activation and Deactivation**

The User Management API exposes conceptual operations for **activating** and **deactivating** a User account, corresponding to FR-USER-005 and FR-USER-006, together with the related **Remove User** operation corresponding to FR-USER-007.

**Activation** restores a previously deactivated User's ability to authenticate, consistent with FR-USER-005. **Deactivation** immediately revokes a User's ability to authenticate while preserving that User's historical association with past Tasks, Comments, and Activity Log entries, consistent with FR-USER-006 and the preservation-over-deletion philosophy established in Chapter 3 (Section 3.8.3). **Remove User** applies the same soft-removal mechanism described in FR-USER-007, withdrawing a User from active participation in the Organization without permanently deleting their historical records.

All three operations are restricted to the Administrator role and are applied uniformly regardless of the target User's assigned role — an Administrator deactivating a Client-role User follows the same conceptual behavior as deactivating an Employee, immediately revoking that Client's ability to authenticate and access their assigned Projects, Tasks, shared Files, Notifications, and permitted Comments, while preserving the historical record of their prior activity.

**5.4.6 User Role Management**

The User Management API exposes a conceptual operation for **changing the role assigned to a User**, corresponding to FR-USER-004. This operation is restricted to the Administrator role and applies the new role's permissions immediately to the affected User's subsequent actions, consistent with FR-USER-004.

Role management operates across the full set of four roles established in Chapter 1 — an Administrator may reassign a User between the Administrator, Manager, Employee, and Client roles, subject to the Organization Ownership requirement established in FR-ORG-007, which prevents an action that would leave the Organization without at least one remaining Administrator. Changing a User's role to or from Client is conceptually no different from any other role change: it immediately takes effect and is governed by the same scoped access control principle established in FR-AUTH-013, meaning a User's visibility into Projects, Tasks, Files, Notifications, and Comments is re-evaluated according to their newly assigned role on every subsequent request.

This operation also exposes the related capability described in FR-USER-011, allowing an Administrator to establish the association between a Manager and the Employees or Projects that Manager is responsible for, which conceptually governs the scope within which that Manager's elevated permissions apply.

**5.4.7 User Search and Filtering**

The User Management API exposes conceptual **search** and **filtering** operations over the Organization's User population, corresponding to FR-USER-009 and FR-USER-010. Search allows an authorized User to locate a specific User by name or other identifying detail, while filtering allows narrowing the User list by attributes such as role or account status.

Both operations apply the search authorization principle established in Chapter 4 (Section 4.13) and Section 5.2.14: results are always scoped to the requesting User's own Organization and further bounded by their permitted visibility, consistent with FR-USER-008. As with retrieval generally, these operations are internal-management capabilities exercised by Administrators and Managers, and are not part of the Client role's own interaction with the API.

**5.4.8 User Management API Design Considerations**

**Statelessness.** Consistent with Section 5.1.4, every User Management operation is evaluated independently against the requesting User's session credential and role, without reliance on server-held state from a prior request.

**Security.** Every operation described in this section is authenticated and authorized before execution, consistent with Sections 5.2.5 and 5.2.6; role changes and account status changes are treated as sensitive operations restricted to the Administrator role, reflecting the High priority assigned to FR-USER-004 and FR-USER-006 in Chapter 4.

**Authorization.** The User Management API is itself the mechanism by which the authorization context described in Section 5.3.6 is assigned to a User in the first place — role management (Section 5.4.6) determines the permissions every other API surface in this chapter will subsequently enforce for that User, including a Client-role User's scoped access to their own assigned Projects, Tasks, Files, Notifications, and Comments.

**Validation.** User creation and update operations are subject to the request validation principle established in Section 5.2.7, ensuring incomplete or malformed profile and role information is rejected before it can affect the Organization's User population.

**Consistent responses.** Outcomes across all operations in this section — successful creation, validation failure, unauthorized attempt, or not-found — are communicated using the same consistent response structure and status code conventions established in Sections 5.2.8 and 5.2.9.

**Auditability.** Every significant User Management action — creation, role change, activation, deactivation, and removal — is recorded in the Activity Log consistent with FR-USER-014, ensuring that changes affecting who can access an Organization's ClientSphere instance, and in what capacity, remain fully traceable.

**Scalability.** Because User Management operations are scoped to a single Organization and rely on the same stateless session model established throughout this chapter, this API is expected to remain functionally consistent regardless of how many Organizations or Users the platform eventually serves, consistent with the scalability objective established in Chapter 2 (Section 2.12.1).

**Extensibility.** The uniform treatment of all four roles as a single User resource, differing only in an assigned role property, allows the User Management API to accommodate the Client role without requiring a separate API surface, and would similarly accommodate any future role introduced consistent with the extensibility principle established in Chapter 3 (Section 3.9.5), without altering the creation, retrieval, update, or administration operations already described in this section.

---

### 5.5 Client Management API

This section defines the conceptual API contract that exposes the Client Management functional requirements established in Chapter 4 (Section 4.6). As in prior sections of this chapter, the discussion here is limited to what each capability provides, leaving the technical means of delivery to later, implementation-focused artifacts.

**5.5.1 Client Resource Overview**

A point of terminology deserves emphasis before describing this API's operations. Throughout this SRS, "Client" carries two related but distinct meanings: the **Client entity**, described in Chapter 3 (Section 3.4.3), which represents an external customer of the Organization and the record around which Projects are organized; and the **Client role**, one of the four authorized roles established in Chapter 1, assigned to an authenticated User associated with that entity. The Client Management API described in this section governs the former — the creation, retrieval, and maintenance of Client entity records by internal Users (Administrators and Managers). Operations exercised by an authenticated Client-role User are addressed separately, in the sections of this chapter governing Projects, Tasks, Files, Notifications, and Comments, where that role's scoped visibility applies.

The Client Management API sits alongside the Organization and User Management APIs described in Sections 5.3 and 5.4, but serves a different purpose: where the User Management API governs who may log in and what they may do, the Client Management API governs the record of *whom the Organization serves*. Every Client entity managed through this API belongs to exactly one Organization, per the ownership relationship described in Chapter 3 (Section 3.5.2), and every operation exposed here is bounded by that same Organization boundary.

**5.5.2 Client Creation Operations**

An authorized User — an Administrator or a Manager acting within their permitted scope — creates a new Client entity by supplying its identifying and contact information, corresponding to FR-CLIENT-001. This operation exists as the entry point through which a customer relationship becomes part of the Organization's structured record, addressing the fragmentation problem identified in Chapter 1 (Section 1.2.2).

Creation is subject to the duplicate-prevention behavior described in FR-CLIENT-010: the API surfaces potential matches against existing Client records at the time of submission, so that a duplicate entity is created only with deliberate confirmation rather than by oversight. Every newly created Client entity is bound to the requesting User's own Organization, in keeping with the ownership constraint established in FR-CLIENT-011.

Creating a Client entity does not, by itself, provision a Client-role User. The two are related but separate actions: an Administrator who wishes to grant an external stakeholder authenticated access must additionally invite or create a User with the Client role, per Section 5.4.2, and associate that User with the relevant Client entity, as described in Section 5.5.5.

**5.5.3 Client Retrieval Operations**

Retrieval of a single Client entity's details — including its identifying information and a summary of its associated Projects — is available to any User authorized to view it, per FR-CLIENT-003. A related operation returns the list of Client entities within an Organization, subject to the same authorization boundary.

Visibility here follows the rule established in FR-CLIENT-012: an internal User sees Client records within their own Organization, and, depending on role, may be further limited to Clients whose Projects they are specifically associated with. A Client-role User is not a consumer of this retrieval operation in the same sense as an Administrator or Manager; that individual's own relationship to a Client entity is expressed instead through the Project-level visibility described in Chapter 4 (FR-PROJ-015) and Section 5.6, rather than through direct retrieval of the Client record itself.

**5.5.4 Client Update Operations**

An authorized User updates a Client entity's information after creation, per FR-CLIENT-002, reflecting changes such as a revised contact or a corrected detail as the relationship evolves. Two further operations govern the entity's active status: archiving a Client, per FR-CLIENT-004, marks it inactive while preserving its record and historical associations, and restoring an archived Client, per FR-CLIENT-005, returns it to active status. Status changes take effect immediately across every part of the system that displays or filters by Client status, consistent with FR-CLIENT-008.

Archival carries a structural implication worth noting here: because every Project must reference an existing Client, per FR-CLIENT-009, archiving a Client does not detach or orphan its existing Projects — those Projects, and the Tasks, Comments, and Files attached to them, remain intact and simply inherit the inactive status of the Client they belong to.

**5.5.5 Client Assignment and Relationship Management**

This subsection addresses the point at which the Client entity and the Client role intersect. While Chapter 4 does not define a single dedicated requirement for this association, it follows directly from the User Management capability described in Section 5.4 together with the Client entity operations described above: an Administrator associates a Client-role User with a specific Client entity, establishing the scope within which that User's Project, Task, File, Notification, and Comment visibility is subsequently evaluated, per FR-PROJ-015, FR-COMMENT-013, and FR-FILE-005.

This association is exclusive by design — a Client-role User is tied to exactly one Client entity at a time, mirroring the single-parent ownership pattern already established for Projects in Chapter 3 (Section 3.5.3). Removing or reassigning this association is treated with the same care as any other role-affecting change described in Section 5.4.6: it takes effect immediately and is recorded in the Activity Log per the auditability principle applied throughout this chapter.

**5.5.6 Client Search and Filtering**

Locating a specific Client entity by name or other identifying detail is available to an authorized User through the search capability described in FR-CLIENT-006, while narrowing the list of Client entities by status — active or archived — is available through the filtering capability described in FR-CLIENT-007. Both operations respect the same authorization and Organization-scoping rules that govern retrieval generally, per Section 5.2.14 and Section 5.2.15, returning only Client entities the requesting User is permitted to see.

As with retrieval, these operations serve internal Users managing the Organization's roster of customers; a Client-role User's own need to locate relevant information is met instead through the Project, Task, and File search capabilities described in later sections of this chapter, scoped to the single Client entity they are associated with.

**5.5.7 Client Management API Design Considerations**

A handful of design commitments carry particular weight for this API, given the dual meaning of "Client" discussed in Section 5.5.1.

Authorization here operates on two levels at once: an internal User's access to the Client Management operations described in this section is governed by role and organizational scope, per FR-CLIENT-012, while a Client-role User's access to their own associated data flows through entirely separate API surfaces rather than through this one. Keeping these two authorization paths distinct prevents the ambiguity that would otherwise arise from a single role name serving two purposes.

Referential integrity is enforced wherever this API intersects with Projects: the mandatory Client–Project relationship described in FR-CLIENT-009 means no operation in this section, or in the Project Management API described later in this chapter, permits a Project to exist without a valid Client reference. Every creation, update, archival, and restoration operation described above is recorded in the Activity Log, per FR-CLIENT-013, giving Administrators a complete history of how the Organization's client relationships have changed over time.

Search and retrieval scale with the same indexing considerations described in Chapter 3 (Section 3.7.4), since an Organization's Client roster, like its Project and Task populations, is expected to grow over the life of the platform. No AI-assisted capability applies to the operations described in this section; the Google Gemini integration described in Chapter 2 is limited to the AI Task Description Generator, AI Project Summary, and AI Comment Summarizer, none of which act on the Client entity directly.

---

### 5.6 Project Management API

This section defines the conceptual API contract that exposes the Project Management functional requirements established in Chapter 4 (Section 4.7).

**5.6.1 Project Resource Overview**

The Project entity, described in Chapter 3 (Section 3.4.4), is the primary organizing unit of client work. The Project Management API is where that entity is created, tracked, and maintained through its lifecycle.

Every Project belongs to exactly one Client, per the relationship described in Chapter 3 (Section 3.5.3) and enforced through the Client Management API in Section 5.5.6. This API therefore never operates on a Project in isolation from its Client context; every operation described below presumes a Project already tied to a valid Client entity.

Four roles interact with this API, each within the boundary already defined in earlier chapters. An Administrator retains organization-wide visibility. A Manager oversees the Projects they are assigned to. An Employee sees Projects they are a team member of. A Client-role User sees only Projects belonging to their own associated Client entity, per FR-PROJ-015. No new permission is introduced here beyond what Chapter 4 already establishes.

**5.6.2 Project Creation Operations**

An authorized User creates a new Project by supplying its descriptive information, timeline, and priority, per FR-PROJ-001. The Client association is mandatory at creation and, per FR-PROJ-007, fixed thereafter — a Project cannot later be reassigned to a different Client.

Creation also requires designating at least one Manager responsible for the Project, per FR-PROJ-006. This responsible-ownership assignment is distinct from the Client association: one governs accountability for delivery, the other governs whom the work is being delivered to.

The API rejects creation attempts that lack a valid Client reference or that duplicate an existing Project's identifying details for the same Client without deliberate confirmation, per FR-PROJ-020.

**5.6.3 Project Retrieval Operations**

Retrieving a Project's full details — its associated Client, assigned team, current status, and Task summary — is available to any User authorized to view it, per FR-PROJ-003. A related operation lists Projects within the requesting User's permitted scope.

Visibility follows FR-PROJ-015 exactly as summarized in Section 5.6.1. An Employee's list reflects only Projects they participate in. A Client-role User's list reflects only Projects belonging to their associated Client. An Administrator's list spans the Organization.

Retrieval also surfaces progress information derived from the Task-level calculation described in FR-TASK-017 and FR-PROJ-014, giving any authorized viewer — including a Client checking on their own work — a current picture of how far a Project has advanced without needing to inspect every underlying Task individually.

**5.6.4 Project Update Operations**

An authorized User updates a Project's descriptive information, timeline, and priority after creation, per FR-PROJ-002 and FR-PROJ-012. Timeline updates matter particularly here: due dates drive the deadline visibility that Chapter 1 identifies as a recurring gap in ad hoc project tracking (Section 1.2.3), so a change to a Project's target completion date takes effect immediately across every dashboard and list that displays it.

Archiving a Project, per FR-PROJ-004, is blocked while it still contains incomplete Tasks, per FR-PROJ-021, unless the requesting User explicitly confirms the action. This prevents unfinished work from silently disappearing from active views. Restoring an archived Project, per FR-PROJ-005, reverses this and returns it to active status.

**5.6.5 Project Status Management**

A dedicated operation governs a Project's position within its defined lifecycle, per FR-PROJ-010 and FR-PROJ-011. Status changes are immediate and are reflected wherever the Project appears — dashboards, lists, and the Project's own detail view alike.

This operation is also where the AI Project Summary capability becomes relevant. An authorized User may request an AI-assisted summary of a Project's current status and recent activity, generated by the Google Gemini API as described in Chapter 2 (Section 2.2). The summary draws on existing Project, Task, and Activity Log data; it does not alter the Project's status or any other stored information, and a User remains free to accept, edit, or discard the generated text before it is used anywhere. This is an optional, assistive operation, not a required step in status management, and it is subject to the same authentication and authorization rules as every other Project operation in this section.

**5.6.6 Project Membership and Client Association**

Assigning Managers to a Project, per FR-PROJ-008, and assigning Employees as team members, per FR-PROJ-009, are handled as related but separate operations. Manager assignment grants elevated, Project-scoped permissions; team member assignment grants ordinary visibility and the ability to be assigned Tasks within that Project.

The Client association itself is not managed here. As established in FR-PROJ-007 and Section 5.5.5, that association is fixed at creation and altered only through the Client-role assignment process described in the Client Management API. This API's membership operations concern only the internal team — Administrators, Managers, and Employees — working on the Project, not the Client-role User who views it.

**5.6.7 Project Search and Filtering**

Locating a Project by name or identifying detail is available through the search operation described in FR-PROJ-016. Narrowing a Project list by status, priority, associated Client, or assigned Manager is available through the filtering operation described in FR-PROJ-017, and ordering results by due date, priority, or status is available through the sorting operation described in FR-PROJ-018.

Each of these operations returns only Projects within the requesting User's authorized visibility, exactly as described in Section 5.6.3. A Client-role User's search results, for instance, are drawn only from Projects belonging to their own Client entity, never from the Organization's broader Project population.

**5.6.8 Project Management API Design Considerations**

Referential integrity anchors this API: no Project exists without a valid Client, and no Client association changes once set. This mirrors the enforcement already described for the Client Management API in Section 5.5.7 and traces back to the data integrity principles established in Chapter 3 (Section 3.6).

Every creation, status change, archival, restoration, and team or Manager reassignment is recorded in the Activity Log, per FR-PROJ-022, giving every role with visibility into a Project — including a Client — access to a reliable history of how that Project has progressed, subject to the same visibility rules that govern the Project itself.

The AI Project Summary operation described in Section 5.6.5 remains strictly assistive. It requires an authenticated, authorized User to initiate it, never runs automatically, and never bypasses the validation or business rules that otherwise govern Project data. Its unavailability, per Chapter 2 (Section 2.2), affects only the summary capability itself; Project creation, tracking, and status management continue unaffected.

---

### 5.7 Task Management API

This section defines the conceptual API contract that exposes the Task Management functional requirements established in Chapter 4 (Section 4.8).

**5.7.1 Task Resource Overview**

The Task entity, described in Chapter 3 (Section 3.4.5), breaks a Project's scope into concrete, assignable work. The Subtask entity, described in Chapter 3 (Section 3.4.6), provides a further, optional layer of breakdown beneath an individual Task. This API treats both as a single conceptual resource family, since a Subtask has no independent existence apart from the Task it belongs to.

Every Task belongs to exactly one Project, and that association is fixed once created, per FR-TASK-011. This API therefore always operates within the boundary of a specific, already-existing Project.

Role interaction here follows the same pattern already established for Projects. An Administrator sees every Task within the Organization. A Manager sees Tasks within their assigned Projects. An Employee sees Tasks they participate in or are assigned to. A Client-role User sees only Tasks belonging to Projects associated with their own Client entity, per Section 5.6.1 and FR-PROJ-015. No additional permission is introduced at the Task level beyond what these earlier sections already grant.

**5.7.2 Task Creation Operations**

An authorized User creates a Task within an existing Project by supplying its description, due date, and priority, per FR-TASK-001. A related operation creates a Subtask within an existing Task, per FR-TASK-005, capturing its own description and completion state. A Task may hold any number of Subtasks, per FR-TASK-009; the API imposes no artificial ceiling, since the right amount of breakdown varies with each piece of work.

Creation is where the AI Task Description Generator becomes relevant. An authorized User may request an AI-assisted draft or refinement of a Task's description, based on context the User supplies, generated through the Google Gemini API described in Chapter 2 (Section 2.2). This operation only produces text for the User's review; it never creates, assigns, or completes a Task on its own, and the User must explicitly save the description — edited or not — before it becomes part of the Task record. Declining the suggestion leaves Task creation otherwise unaffected.

**5.7.3 Task Retrieval Operations**

Retrieving a Task's details is available to any User authorized to view it, per the visibility rules summarized in Section 5.7.1. A related operation lists Tasks within a Project, and a further operation, per FR-TASK-022, returns a personal view limited to Tasks assigned to the requesting User across every Project they participate in.

This personal view matters most to an Employee, who otherwise has no reason to browse every Project's full Task list to find their own responsibilities. It draws only on Tasks already visible to that User under the existing authorization rules; it does not grant any broader access than the User already holds.

**5.7.4 Task Update Operations**

An authorized User updates a Task's description, due date, and priority after creation, per FR-TASK-002. A parallel operation updates a Subtask's description and completion state, per FR-TASK-006.

Archiving a Task, per FR-TASK-003, removes it from active views while preserving its record and its historical association with Comments and Activity Log entries, following the same preservation-over-deletion philosophy already applied to Projects and Clients earlier in this chapter. Restoring an archived Task, per FR-TASK-004, reverses this.

A bulk update operation, per FR-TASK-018, allows a single status or priority change to apply across several selected Tasks at once. This exists chiefly to reduce the effort of managing large Task lists; without it, a Manager closing out dozens of completed Tasks at the end of a sprint would need to update each one individually.

**5.7.5 Task Assignment and Status Management**

Assigning a Task to a single member of its Project is available through the operation described in FR-TASK-007, and reassigning it from one User to another is available through FR-TASK-008. The API rejects any assignment to a User who is not a member of the Task's Project, per FR-TASK-023 — a Task assigned outside the Project's team would create a responsibility no one associated with that work is positioned to fulfill.

Status management, per FR-TASK-014, moves a Task through its defined lifecycle states. The API rejects a transition that does not represent a valid move from the Task's current status, per FR-TASK-024, preventing situations such as an archived Task being marked newly in progress without first being restored.

Marking a Task complete, per FR-TASK-016, records the date and time completion occurred. This timestamp, together with every other Task's completion state, feeds directly into the Project-level progress calculation already described in Section 5.6.3; this API does not recompute or restate that calculation, only supplies the underlying data it depends on.

**5.7.6 Task Priority and Due Date Management**

Priority and due date are updated through the same operation described in Section 5.7.4, but warrant separate mention because of how directly they support the deadline-clarity objective identified in Chapter 1 (Section 1.5.3). A due date exists so an Employee can judge which of their Tasks needs attention first; a priority level exists for the same reason, at a coarser level of granularity. Both take effect immediately across every list, filter, and dashboard where the Task appears.

**5.7.7 Task Search and Filtering**

Locating a Task by title or identifying detail is available through the search operation described in FR-TASK-019. Narrowing a Task list by status, priority, assigned User, or due date is available through the filtering operation described in FR-TASK-020, and ordering results is available through the sorting operation described in FR-TASK-021.

As with every retrieval operation in this section, results never exceed the requesting User's authorized visibility. A Client-role User searching for a Task, for instance, can only surface Tasks belonging to Projects tied to their own Client entity — the search operation itself grants no additional reach beyond what Section 5.7.1 already establishes.

**5.7.8 Task Management API Design Considerations**

Two referential constraints anchor this API: a Task cannot exist without a Project, and that association cannot later change. Both trace back to the data integrity principles established in Chapter 3 (Section 3.6) and mirror the same discipline already applied to the Project–Client relationship in Section 5.6.8.

Every creation, assignment, reassignment, status change, and archival is recorded in the Activity Log, per FR-TASK-026, extending the auditability already established for Organizations, Users, Clients, and Projects down to the level of individual work items.

The AI Task Description Generator remains strictly assistive, exactly as described in Section 5.7.2. It requires an authenticated, authorized User; it never bypasses the validation and business rules that otherwise govern Task creation and editing; and its output is never persisted without that User's explicit review and approval. Should the Gemini API become unavailable, per Chapter 2 (Section 2.2), Task creation and editing continue normally — only the drafting assistance itself is affected.

---

### 5.8 Comment Management API

This section defines the conceptual API contract that exposes the Comment Management functional requirements established in Chapter 4 (Section 4.9).

**5.8.1 Comment Resource Overview**

The Comment entity, described in Chapter 3 (Section 3.4.7), ties discussion directly to the Task or Project it concerns. This API governs how that discussion is created, read, and maintained, without introducing any structure beyond what Chapter 3 already defines.

A distinction carried forward from Chapter 4 shapes much of this section: a Comment may be designated as internal to the Organization's team or as open to Client participation, per FR-COMMENT-013. This is not a separate entity or a new attribute category invented here — it is simply how the existing Comment resource is exposed differently depending on who is asking.

Role interaction follows the pattern already familiar from Sections 5.6 and 5.7. An Administrator, Manager, or Employee sees every Comment on a Task or Project they are otherwise authorized to view. A Client-role User sees only those Comments marked open to Client participation, even on a Task or Project they can otherwise access in full, per FR-COMMENT-013.

**5.8.2 Comment Creation Operations**

An authorized User adds a Comment to a Task, per FR-COMMENT-001, or to a Project, per FR-COMMENT-002. Both operations require the User to already hold view access to the target Task or Project.

A Client-role User is further limited: their participation is restricted to discussions designated as open to Client participation. This is not a separate creation operation — it is the same operation described above, with the same restriction applied that already governs visibility. A Client cannot post into an internal-only thread any more than they can read one.

Mentioning another User within a Comment, per FR-COMMENT-006, triggers the Notification described in FR-NOTIFY-006, addressed further in Section 5.10. Basic text formatting is supported at creation, per FR-COMMENT-007, without dictating how that formatting is technically represented.

**5.8.3 Comment Retrieval Operations**

Retrieving the Comments attached to a Task or Project is available to any User authorized to view that Task or Project, per FR-COMMENT-005, and results are returned in chronological order, per FR-COMMENT-008.

For a Client-role User, retrieval silently omits internal-only Comments rather than surfacing them in a restricted or placeholder form. This matters for a reason worth stating plainly: even acknowledging that a hidden discussion exists could reveal something the Client was never meant to know — that internal disagreement, a delay, or a concern was being discussed. Omission, not partial disclosure, is the only behavior consistent with FR-COMMENT-013.

Every Comment returned carries its author and timestamp, per FR-COMMENT-010 and FR-COMMENT-011, so a reader can judge not just what was said but by whom and when.

**5.8.4 Comment Update and Deletion Operations**

A Comment's original author may edit its content after posting, per FR-COMMENT-003. Editing is available only to that author — no other role, including Administrator, may alter another User's words, though an Administrator may remove a Comment entirely, per FR-COMMENT-004, alongside the original author.

This asymmetry is deliberate. Preserving what someone actually said protects the integrity of the discussion record; removing a Comment outright is a coarser action reserved for cases where the content should not remain at all, and Chapter 4 restricts that coarser action to the author and the Administrator specifically to prevent arbitrary removal by an uninvolved party, per FR-COMMENT-012.

Deletion and editing apply equally regardless of whether a Comment is internal or open to Client participation; the distinction described in Section 5.8.1 governs visibility, not who may modify a Comment's content.

**5.8.5 Comment Search and Filtering**

A dedicated Comment search operation is not separately defined in Chapter 4; instead, Comment content participates in the global search capability described in Chapter 4 (Section 4.13) and Section 5.2.14, returning matching Comments alongside other resource types within the requesting User's authorized visibility.

This inherits every restriction already described in this section. A Client-role User's search results include only Comments marked open to Client participation, exactly as retrieval does in Section 5.8.3 — search offers no shortcut around a restriction that direct retrieval already enforces.

**5.8.6 Comment Management API Design Considerations**

Authorization here operates at two levels simultaneously: access to the parent Task or Project, and, for a Client-role User specifically, a further check against the internal-or-open designation described in FR-COMMENT-013. Both checks must pass before a Comment is returned or accepted.

Creation and deletion of a Comment are recorded in the Activity Log, per FR-COMMENT-014, while routine edits are deliberately excluded from that record — a choice Chapter 4 makes to avoid disproportionate log volume relative to the significance of a minor wording correction.

The AI Comment Summarizer is available as an optional operation on a Task or Project's existing discussion. An authenticated, authorized User initiates it explicitly; it produces a summary drawn only from Comments that User is already permitted to see, so a Client-role User requesting a summary receives one reflecting only the Client-visible thread, never the internal discussion layered beneath it. The operation never creates, edits, or deletes a Comment on its own, and the resulting summary is presented for the User to use or disregard as they see fit. Should the Gemini API become unavailable, per Chapter 2 (Section 2.2), Comment creation, retrieval, and discussion continue unaffected — only the summarization assistance itself is unavailable.

---

### 5.9 File Management API

This section defines the conceptual API contract that exposes the File Management functional requirements established in Chapter 4 (Section 4.10).

**5.9.1 File Resource Overview**

The File Metadata entity, described in Chapter 3 (Section 3.4.10), is the record this API manages — a description of a file's name, uploader, timestamp, and parent association. The file's binary content lives outside this API entirely, in Cloudinary, per the file storage architecture described in Chapter 2 (Section 2.7). This API never exposes storage-layer detail; it exposes only the metadata record and the operations that govern it.

A File Metadata record attaches to exactly one parent — a Client, a Project, or a Task — per the polymorphic relationship described in Chapter 3 (Section 3.5.10). This API has no independent existence apart from that parent; every operation described below presumes a specific, already-authorized parent entity.

Authorization is inherited, not recalculated. A User who lacks access to a Task, Project, or Client has no path to that entity's Files through this API, regardless of how the request is constructed — the parent's visibility rules, already established in Sections 5.5 through 5.8, govern here without restatement.

A further distinction, carried forward from Chapter 4, applies specifically to the Client role: a File may be designated as internal to the Organization's team or as shared with the Client, per FR-FILE-005. A Client-role User's access is limited to the latter, even on a parent entity they can otherwise view in full — the same principle already applied to Comments in Section 5.8.1.

**5.9.2 File Upload Operations**

An authorized User uploads a file and associates it with a Client, Project, or Task they are permitted to modify, per FR-FILE-001. The API validates the upload against a defined maximum size, per FR-FILE-015, and against a defined set of supported file types, per FR-FILE-016, rejecting anything outside those bounds with a reason the User can act on.

A rejected upload is not silently discarded without explanation; distinguishing an oversized file from an unsupported type, per FR-ERROR-009, lets the User understand whether the file itself is the problem or merely its format.

Uploading a new version of an existing file, per FR-FILE-008, associates that version with the same File Metadata record while preserving a reference to what it replaced. This exists because deliverables are revised far more often than they are replaced outright — a version history serves that reality better than treating every revision as an unrelated new file.

**5.9.3 File Retrieval Operations**

Viewing the files attached to a Client, Project, or Task is available to any User authorized to view that parent, per FR-FILE-005, and downloading a file's full content is available under the same authorization, per FR-FILE-006. Where a file type supports it, an in-application preview is available without requiring a download first, per FR-FILE-007.

For a Client-role User, retrieval returns only files designated as shared. As with the Comment restriction described in Section 5.8.3, this is an omission rather than a partial disclosure — an internal-only file simply does not appear in the list, rather than appearing as a locked or restricted entry that would itself hint at content the Client was never meant to know existed.

Every returned file carries its descriptive metadata — name, uploader, and upload timestamp — per FR-FILE-012, giving a viewer enough context to identify a file without opening it.

**5.9.4 File Update and Deletion Operations**

Archiving a File Metadata record, per FR-FILE-009, removes it from active views while preserving both the record and its association with its parent entity, consistent with the preservation-over-deletion approach already applied to Clients, Projects, and Tasks earlier in this chapter. Restoring an archived file, per FR-FILE-011, reverses this.

Permanent deletion, per FR-FILE-010, is the one meaningful exception to that preservation-first pattern applied throughout the rest of this API. Chapter 3 (Section 3.8.7) treats a file as a narrower case than most entities in this system — an incorrect or accidental upload has little value in staying part of the historical record, unlike a Client, Project, or Task, whose history remains relevant even once inactive. Deletion removes the File Metadata record and its underlying stored content together; the two are never permitted to fall out of sync.

Two File Metadata records attached to the same parent may share an identical filename, per FR-FILE-017, distinguished instead by uploader and timestamp — a legitimate outcome of resubmission or revision that the API does not treat as an error condition.

**5.9.5 File Search and Filtering**

A dedicated operation locates a File Metadata record by filename within the requesting User's authorized visibility, per FR-SEARCH-006, and File content also participates in the global search capability described in Chapter 4 (Section 4.13) alongside Clients, Projects, Tasks, and Comments.

Every restriction already described in this section carries into search without exception. A Client-role User's search results include only files designated as shared, exactly as direct retrieval does in Section 5.9.3 — search offers no broader reach than browsing a parent entity's file list directly would.

**5.9.6 File Management API Design Considerations**

Authorization is evaluated twice for every operation in this section: once against the parent Client, Project, or Task, and, for a Client-role User, a second time against the internal-or-shared designation described in FR-FILE-005. A file is only ever returned when both checks pass, per FR-FILE-014.

Upload, version replacement, archival, restoration, and deletion are each recorded in the Activity Log, per FR-FILE-018, extending the same auditability already applied to every other resource in this chapter down to the level of individual documents. Because deletion here is permanent rather than reversible, this audit record is the only remaining trace of a file once it is gone — making the completeness of that record more consequential for Files than for any other entity described in this chapter.

The separation between this API's metadata operations and Cloudinary's storage role, established in Chapter 2 (Section 2.7.4), means a temporary disruption to the underlying storage service affects only upload and retrieval of file content; it does not affect the metadata operations, authorization checks, or Activity Log entries described in this section.

---

### 5.10 Notification Management API

This section defines the conceptual API contract that exposes the Notification functional requirements established in Chapter 4 (Section 4.11).

**5.10.1 Notification Resource Overview**

A Notification, described in Chapter 3 (Section 3.4.8), never originates on its own. It exists only as a byproduct of something else happening elsewhere in the system — a Task assignment, a status change, a Comment, a mention, or a Project update. This API has no operation for creating a Notification directly; every Notification a User receives traces back to one of the business events already described in Sections 5.6 through 5.9.

Ownership is exclusive and permanent: a Notification belongs to exactly one recipient User and is never visible to anyone else, per FR-NOTIFY-014. This holds regardless of role. An Administrator has no broader reach into another User's Notifications than an Employee or a Client does into theirs.

Two concerns that might appear to be the same thing are handled separately here. Persisting a Notification — recording that it occurred, for a given User, at a given time — is distinct from delivering it to that User in the moment. A Notification can exist in the system's record without ever having reached an actively connected User, and its persistence does not depend on delivery having succeeded.

This ownership model mirrors the User–Notification relationship described in Chapter 3 (Section 3.5.8): a single User accumulates many Notifications over the course of their activity on the platform, but a Notification is never shared between recipients, even where the same underlying event happens to be relevant to several Users at once. A Task reassignment relevant to two different individuals, for instance, produces two separate Notification records, one for each recipient, rather than a single record visible to both.

**5.10.2 Notification Generation**

Generation happens automatically, triggered by the underlying event rather than by any direct request to this API. A Task assignment generates a Notification for the newly assigned User, per FR-NOTIFY-002; reassignment generates one for both the previous and new assignee, per FR-NOTIFY-003; a status change generates one for every User associated with the affected Task or Project, per FR-NOTIFY-004; a new Comment or an explicit mention generates one for participants in that discussion, per FR-NOTIFY-005 and FR-NOTIFY-006; and a significant Project update generates one for its Manager, team, and associated Client, per FR-NOTIFY-007.

Generation respects whatever restriction already governs the triggering event. A Comment marked internal to the Organization's team, per Section 5.8.1, never generates a Notification for a Client-role User — that User was never authorized to see the Comment itself, and a Notification announcing its existence would leak exactly the information Section 5.8.3 already takes care to withhold.

The same triggering event never produces more than one Notification for the same recipient, per FR-NOTIFY-016. A Task reassignment, for instance, is a single occurrence, and each affected User receives exactly one Notification describing it, not one for every field the reassignment happened to touch.

**5.10.3 Notification Retrieval**

A User retrieves their own Notifications — both currently unread ones and, for a defined retention period, ones already addressed — through the history operation described in FR-NOTIFY-012. Retrieval never spans beyond the requesting User's own identity; there is no operation, at any role, for retrieving another User's Notifications.

Notifications carry an indication of relative urgency, per FR-NOTIFY-008, distinguishing an event like a direct assignment or mention from a more routine update. This does not change what a User is permitted to retrieve, only how the returned results might reasonably be ordered or emphasized.

**5.10.4 Notification Read Status Management**

Every Notification carries a read or unread state, defaulting to unread at the moment it is generated, per FR-NOTIFY-009. A User marks an individual Notification as read, per FR-NOTIFY-010, or clears their entire unread backlog in a single action, per FR-NOTIFY-011. Filtering the Notification list by this state, or by the type of event that triggered it, is available per FR-NOTIFY-013.

Marking a Notification as read has no effect beyond the Notification itself. It does not alter the Task, Project, Comment, or other resource that generated it, and it carries no implication that the underlying event has been acted upon — only that the User has seen it.

**5.10.5 Notification Delivery**

Delivery is where the distinction drawn in Section 5.10.1 matters most. A Notification is persisted the moment it is generated, independent of whether its recipient is currently connected to the system. Delivery to an actively connected User happens through the real-time communication architecture described in Chapter 2 (Section 2.8), without requiring that User to manually refresh or re-request their Notification list, per FR-NOTIFY-015.

A User who is not actively connected simply retrieves their accumulated Notifications, per Section 5.10.3, the next time they authenticate — nothing is lost for having missed the moment of delivery. This is precisely why persistence cannot depend on delivery: a Notification's value would be hollow if it existed only for the instant a User happened to be present to receive it.

Notifications are treated as shorter-lived than the Activity Log described in Section 5.12. Chapter 3 (Section 3.8.6) retains a Notification only long enough to support the history operation in Section 5.10.3, after which it may be removed independently of the entity that originally triggered it — unlike an Activity Log entry, which is never removed at all.

**5.10.6 Notification Management Design Considerations**

Strict recipient-only visibility is the defining constraint of this API. No aggregation, dashboard, or reporting capability described elsewhere in this chapter is permitted to surface one User's Notifications to another, regardless of role.

Certain categories of Notification depend on the background processing layer described in Chapter 2 (Section 2.9) for their underlying delivery mechanism — a Welcome, Password Reset, or Invitation email, for instance, is dispatched asynchronously rather than as part of the triggering request's immediate response. This does not change anything described in this section about how a Notification is generated, retrieved, or read; it only affects how certain notification-adjacent communications reach a User outside the application itself.

Auditability here follows a rule already established in Chapter 4: the triggering event, not the Notification it produces, is what receives an Activity Log entry, per FR-NOTIFY-018. A Task assignment is recorded once, as an assignment; the Notification it generates is a derived consequence, not a second auditable action.

Volume is a practical concern this API must anticipate without addressing at the level of implementation. An Organization with many active Projects and a large team can generate a substantial number of Notifications over time, particularly for a Manager or Administrator associated with a wide span of activity. Retrieval, per Section 5.10.3, and the retention limit described in Section 5.10.5, exist precisely to keep this volume bounded and navigable, consistent with the pagination philosophy established in Section 5.2.11, rather than requiring every User to contend with an ever-growing, unbounded list.

---

### 5.11 Dashboard & Analytics API

This section defines the conceptual API contract that exposes the Dashboard and Reporting functional requirements established in Chapter 4 (Section 4.12).

**5.11.1 Dashboard Resource Overview**

A dashboard is not a stored entity in the sense that a Client, Project, or Task is. Nothing in Chapter 3 defines a persistent Dashboard record, and this API introduces none. What this API exposes is an aggregation — a read-oriented view assembled, at the moment it is requested, from data already held by other resources: Clients, Projects, Tasks, Comments, Notifications, and Activity Log entries.

This design decision follows directly from the entity-oriented philosophy established in Chapter 3 (Section 3.2.2). A Dashboard entity would have no independent meaning of its own; it would exist only as a copy of information that already lives elsewhere in the data model, risking exactly the inconsistency Chapter 3's referential integrity principles (Section 3.6) are designed to prevent. By treating a dashboard purely as an aggregation, this API guarantees that what a User sees can never drift out of alignment with the underlying Project, Task, or Notification records it summarizes.

Because a dashboard is derived rather than stored, it carries no independent lifecycle of its own. It cannot be created, archived, or deleted; it simply reflects whatever the underlying resources currently contain, filtered through the viewer's own authorization. There is no operation in this API for modifying a dashboard directly, because there is nothing to modify — every change a User might wish to see reflected on their dashboard is made through the Project, Task, Comment, File, or Notification operations already described earlier in this chapter, and the dashboard responds to those changes rather than being edited itself.

This also means the dashboard carries no organizational boundary of its own beyond what its underlying resources already enforce. A dashboard aggregates only what the requesting User's Organization and role already permit them to see; it introduces no separate isolation mechanism, because the isolation described in Chapter 2 (Section 2.6.2) and Chapter 3 (Section 3.2.3) already governs every resource the dashboard draws from.

**5.11.2 Dashboard Data Retrieval**

A single retrieval operation returns the aggregated content appropriate to the requesting User, per FR-DASH-001. The specific composition of that content — organization-wide metrics, managed Projects, assigned Tasks, recent activity, pending work, or upcoming deadlines — depends on the requesting User's role and individual scope of involvement, per FR-DASH-005, rather than on any parameter the User supplies directly.

This retrieval operation performs no independent authorization logic of its own. It reuses the same visibility rules already governing Clients, Projects, Tasks, and Notifications elsewhere in this chapter, and simply presents their intersection in one place. Authorization is evaluated once, at the level of each underlying resource, and the dashboard inherits the result rather than re-deriving it — a separate, parallel authorization scheme built specifically for aggregation would risk drifting out of step with the rules already established for those resources individually.

A single retrieval operation, rather than several separate ones assembled by the consumer, is a deliberate design choice. Because a dashboard's value lies in giving a User an immediate, consolidated picture of their situation, requiring that User's own client application to separately query Projects, Tasks, and Notifications and assemble the result would undermine the purpose the dashboard exists to serve. The aggregation described in this section is therefore treated as a first-class API responsibility, not an incidental convenience layered on top of other operations after the fact.

The result returned by this operation reflects the underlying resources as they exist at the moment of the request. If a Task is completed, a Project's status changes, or a new Notification is generated between one retrieval and the next, the subsequent retrieval reflects that change automatically, without requiring any separate synchronization step. There is no intermediate caching layer described in this section that could allow a dashboard to present information that has already been superseded elsewhere in the system.

**5.11.3 Role-Specific Views**

An Administrator's retrieval draws on organization-wide counts and summaries, per FR-DASH-002 and FR-DASH-007, reflecting the same unrestricted visibility already established for that role throughout this chapter. Because an Administrator's Organization may contain many Clients, Projects, and Users, this view is inherently the broadest of the four, and its purpose is oversight rather than task execution — an Administrator's dashboard exists to answer questions about the health of the business as a whole, not to walk through any single piece of work in detail.

A Manager's retrieval draws on the Projects they oversee and the workload distributed across their assigned team, per FR-DASH-003 and FR-DASH-013, bounded by the same Project-level scope described in Section 5.6.1. This narrower view exists because a Manager's accountability, unlike an Administrator's, is tied to specific Projects rather than the Organization as a whole; a Manager's dashboard is deliberately shaped to answer questions about their own area of responsibility, not the Organization's entire portfolio of work.

An Employee's retrieval draws on their own assigned Tasks and approaching deadlines, per FR-DASH-004 and FR-DASH-012, mirroring the personal Task view described in Section 5.7.3. This is the narrowest of the three internal roles' views, reflecting the fact that an Employee's day-to-day relationship with the system is centered on individual units of work rather than broader Project or Organization oversight.

A Client-role User's retrieval draws on the Projects, Tasks, and Notifications already visible to that role under FR-PROJ-015, FR-AUTH-013, and Section 5.10.3 — a summary of their own engagement with the Organization, and nothing beyond it. No new capability is introduced for this role here; the dashboard simply aggregates what Sections 5.6, 5.7, and 5.10 already make available to a Client, presented as a single view. It is the exact same aggregation mechanism described in Section 5.11.2, constrained by exactly the same authorization boundary that already governs everything else a Client can access in this chapter — the role gains no special dashboard-specific privilege, and loses none, by virtue of this aggregation existing.

Across all four roles, the underlying principle is the same: the dashboard does not decide what a User is allowed to see. It only decides how to present what that User was already permitted to see, given the role and scope established well before this section of the chapter.

**5.11.4 Dashboard Refresh**

Dashboard content updates to reflect relevant changes without requiring a manual reload, for changes occurring while it is being actively viewed, per FR-DASH-014. This relies on the same real-time communication architecture already described in Section 5.10.5, rather than introducing a separate delivery mechanism specific to dashboards.

This behavior matters most for the roles whose dashboards emphasize time-sensitive information — an Employee watching a Task's status change, or a Manager watching a team member's workload shift over the course of a day. Real-time reflection means a dashboard is never a static snapshot taken once at the moment of login; it remains a live view for as long as it remains open, staying aligned with whatever the underlying Projects, Tasks, and Notifications currently reflect. A User who leaves their dashboard open across an entire working session sees it evolve alongside their actual work, rather than needing to periodically refresh the page to discover what has changed since the last retrieval.

**5.11.5 Dashboard Design Considerations**

Aggregation carries a particular risk worth naming directly: a view that draws from several resources at once could, if carelessly assembled, surface a fragment of data a User was never individually authorized to see, even though no single underlying request would have exposed it. Permission-based visibility, per FR-DASH-015, exists specifically to guard against this — every piece of aggregated content is filtered by the same authorization rules that would apply if it were requested on its own. It is not enough for a dashboard to be correct for most roles; every element combined into an aggregated view must independently satisfy its underlying resource's authorization boundary, or it has no place on the dashboard at all.

Reporting summaries and export, per FR-DASH-016 and FR-DASH-017, extend this same read-oriented aggregation over a defined period rather than a live snapshot, and remain subject to the identical authorization boundary. Export is the one operation in this section with a corresponding Activity Log entry, per FR-DASH-018, since it is the point at which data leaves the platform's own access-control boundary; everything described elsewhere in this section stays within the platform and is therefore not separately audited beyond the audit trail already maintained for the underlying resources.

The dashboard's relationship to Notifications and the Activity Log is worth distinguishing from its relationship to Clients, Projects, and Tasks. Notifications contribute a forward-looking element to a dashboard — recent, timely events a User has not yet acted on — while Activity Log entries, addressed in full in Section 5.12, contribute a backward-looking one, summarizing recent history rather than pending action. A dashboard draws on both without collapsing the distinction between them: a Notification's presence on a dashboard does not make it part of the historical record, and an Activity Log entry's presence does not make it a pending item requiring the User's attention.

From a maintainability standpoint, this API's read-only, purely derivative nature is itself an advantage: extending it to reflect a future capability would require only including that capability's already-existing authorization rules in the aggregation, not designing a new lifecycle or write path. Scalability follows the same reasoning — because the dashboard is assembled at request time from data that already exists, rather than maintaining any independent copy of it, this API introduces no additional data-consistency burden as an Organization's volume of Clients, Projects, or Tasks grows.

---

### 5.12 Activity Log API

This section defines the conceptual API contract that exposes the Activity Log described in Chapter 3 (Section 3.4.9) and the auditability requirements distributed throughout Chapter 4.

**5.12.1 Activity Log Resource Overview**

An Activity Log entry is a permanent, chronological record of a significant action taken within the system. Unlike every other resource described in this chapter, it is not intended to change once created — no operation in this API updates or removes an existing entry, consistent with the append-only design established in Chapter 3 (Section 3.8.6).

The Activity Log exists for a narrower purpose than Comments or Notifications. Where a Comment supports ongoing discussion and a Notification supports timely awareness, the Activity Log supports accountability: a durable answer to who did what, and when, independent of whether anyone happens to be watching at the time. A Comment invites a reply; a Notification expects to be acknowledged and eventually forgotten; an Activity Log entry expects neither. It simply persists, waiting to answer a question that may not even be asked until long after the action it describes has taken place.

This distinction matters because the three resources are easy to conflate at a glance — all three, in some sense, describe something that "happened." A Project's Comment thread is a place for participants to work something out together. A Notification is a nudge, aimed at a single recipient, meant to draw attention to something recent. The Activity Log, by contrast, is addressed to no one in particular at the moment of its creation; it is written for whoever, at some later point, needs to reconstruct what took place.

**5.12.2 Activity Recording**

Recording is entirely automatic. No operation in this API accepts a manually authored Activity Log entry; every entry is a direct consequence of a state-changing action already described elsewhere in this chapter — a Client created or archived, a Project's status changed, a Task reassigned, a File uploaded or deleted, a Comment posted or removed, a User's role changed.

This mirrors the individual audit requirements already established for each resource — FR-ORG-011, FR-USER-014, FR-CLIENT-013, FR-PROJ-022, FR-TASK-026, FR-COMMENT-014, and FR-FILE-018 — without restating each one; this section simply confirms that all of them converge on a single, shared Activity Log resource rather than separate, resource-specific histories.

Automatic recording is a deliberate rejection of an alternative design in which Users might be asked to manually log significant actions themselves — a record that depends on individual diligence is not one an Organization can fully trust, since an omission would be indistinguishable from an action that genuinely left no trace. By tying every entry directly to the action that produced it, the Activity Log's completeness depends only on the system's own correctness, not on any individual's memory or willingness to document what they did.

Traceability follows directly from this design. Because every entry names both the acting User and the affected resource, it can always be read back to a specific individual and a specific Client, Project, Task, Comment, or File — never as an anonymous event. This is what allows the Activity Log to serve administrative investigation: an Administrator reviewing a dispute over a missed deadline or a deleted Comment can trace the sequence of actions that led to the current state, rather than relying on recollection from the individuals involved.

**5.12.3 Activity Retrieval**

Retrieving the Activity Log entries associated with a Project or a Task is available to any User authorized to view that entity, per FR-PROJ-019 and FR-TASK-025, returned in chronological order. Retrieval scoped to an Organization as a whole is available to an Administrator, consistent with that role's organization-wide visibility established throughout this chapter.

Chronological ordering is not an incidental presentation detail; it is what makes the Activity Log useful as a record of sequence rather than merely a collection of facts. Knowing that a Task was reassigned matters less on its own than knowing whether that reassignment happened before or after the Task's due date was extended, or before or after a related Comment was posted. Retrieval preserves this ordering precisely so that a reviewer can reconstruct the sequence of events, not just their existence.

Retrieval scoped to a Client entity is available under the same principle, drawing on the Client-level operations described in Section 5.5, and gives an Administrator or Manager a consolidated history of everything that has occurred across a Client's full portfolio of Projects, rather than requiring that history to be reassembled Project by Project.

**5.12.4 Activity Visibility**

Visibility follows the authorization already established for the entity or action an entry concerns, rather than introducing a separate permission model of its own. Where an underlying resource carries its own internal-or-shared designation — a Comment or a File, per Sections 5.8 and 5.9 — the Activity Log entry describing an action taken on it is subject to that same restriction. A Client-role User accordingly sees the history of their own visible Projects and Tasks, but not the entries describing an internal-only Comment or File they were never authorized to view in the first place.

This inherited-visibility approach reflects the same organizational isolation principle applied everywhere else in this chapter: an Activity Log entry belonging to one Organization is never retrievable by a User of another, regardless of role, and an entry describing an action a Client-role User was never authorized to witness in the moment it happened remains equally invisible to that same User after the fact. History does not grant access that the present moment would have denied — an Activity Log entry cannot be used as a backdoor into information the underlying resource's own visibility rules were designed to withhold.

**5.12.5 Activity Log Design Considerations**

Immutability is the defining property of this resource. Because an entry cannot be edited or removed once created, the Activity Log remains a trustworthy record precisely by refusing the kind of write access every other resource in this chapter otherwise permits. This is a stronger guarantee than mere convention — no role described in this SRS, including the Administrator, is granted an operation for altering or deleting an existing entry. An audit record that could be revised after the fact by the very role most likely to be its subject would defeat the purpose of maintaining one at all; immutability closes off that possibility entirely, rather than merely discouraging it through policy.

Retention is permanent, per Chapter 3 (Section 3.8.6), distinguishing this resource from the more transient Notification described in Section 5.10.5. A Notification's usefulness fades once it has been read; an Activity Log entry's usefulness does not fade at all, since its purpose is historical rather than immediate. This is also why the Activity Log supports accountability rather than collaboration — it exists to answer questions after the fact, not to carry a conversation forward the way Comments and Notifications do.

Long-term retention reflects a judgment about what kind of value this resource provides over time. A Project or Task may be archived once its work concludes, but the history of how it was carried out remains relevant indefinitely — for resolving a disagreement raised months later, or for demonstrating due diligence to a Client. Troubleshooting depends on exactly this permanence: identifying where something went wrong within a Project frequently requires looking back well past the period anyone would think to check in the moment.

Security auditing and organizational accountability depend on this same permanence and completeness. Because every state-changing action across every resource in this chapter is captured automatically, per Section 5.12.2, the Activity Log gives an Organization a single, reliable place to answer questions about how its data has been used and by whom. This SRS does not define specific regulatory obligations the Activity Log must satisfy, but the properties described throughout this section — immutability, completeness, permanence, and authorized traceability — are precisely what such obligations typically require.

From a maintainability standpoint, the Activity Log imposes little burden on future growth: because every entry is generated automatically as a byproduct of an action that would have occurred regardless, introducing a new resource to this SRS in the future requires only extending the same automatic-recording pattern to it, not designing an entirely new auditing mechanism.

---

### 5.13 AI Services API

This section defines the conceptual interface through which ClientSphere's three approved AI-assisted capabilities communicate with the Google Gemini integration described in Chapter 2 (Section 2.2). It does not introduce a fourth resource alongside Projects, Tasks, and Comments; rather, it consolidates the design principles already applied individually in Sections 5.6.5, 5.7.2, and 5.8.6, so that those principles are stated once, in full, rather than scattered in briefer form across three separate sections.

**5.13.1 AI Services Overview**

Every AI-assisted operation in this SRS shares the same shape: an authenticated, authorized User explicitly requests it; the Google Gemini API generates content based on existing application data; and the User reviews, edits, or discards that content before it has any lasting effect. No operation described in this section runs on a schedule, in the background, or in response to anything other than a direct, User-initiated request.

The scope of this interface is fixed at exactly three capabilities, matching the Version 1 baseline established in Chapter 1 (Section 1.1) and Chapter 2 (Section 2.2): the AI Task Description Generator, the AI Project Summary, and the AI Comment Summarizer. No chatbot, recommendation engine, predictive model, or general-purpose assistant is exposed through this or any other API described in this chapter. This boundary is not incidental; Chapter 2 (Section 2.2) deliberately isolates the Gemini integration behind a dedicated service wrapper precisely so its scope can be constrained to these three capabilities without depending on discipline exercised elsewhere in the codebase.

This interface is also deliberately positioned as a layer of assistance operating alongside the business logic described throughout this chapter, rather than as a parallel decision-making authority. Business logic, expressed through the validation and authorization rules established in Sections 5.2.6 and 5.2.7, determines what is permitted to happen within ClientSphere; the AI Services API never participates in that determination. It only ever offers a suggestion that a User may choose to feed into the ordinary Task, Project, or Comment operations already governed by that logic — the AI layer proposes, and the existing, unchanged business rules dispose.

Every operation described in this section requires the same authentication and authorization evaluation as any other request in this chapter, per Sections 5.2.5 and 5.2.6, performed before the Gemini API is ever invoked.

**5.13.2 AI Task Description Generation**

This operation drafts or refines a Task's description from context a User supplies, addressing the drafting burden that often accompanies breaking a Project down into individual units of work. It is available only where the requesting User is already authorized to create or edit the Task in question, per the Task Management authorization rules described in Section 5.7 — the operation confers no ability to describe or influence a Task the requesting User could not otherwise touch.

It never creates, assigns, or completes a Task on its own; its output becomes part of the Task record only once the User has explicitly saved it, and until that moment the generated text has no existence within ClientSphere's stored data at all. A User who requests a description, reviews it, and closes the Task without saving it leaves no trace of having done so within the system.

**5.13.3 AI Project Summary Generation**

This operation produces a summary of a Project's current status and recent activity, drawn from data the requesting User is already authorized to view, addressing the difficulty of quickly conveying a Project's state without manually reviewing every Task and Comment attached to it. It has no effect on the Project's stored status, timeline, or any other field; it only produces text for the User's own use, whether to inform an internal update or to prepare something to share with a Client.

Because the summary draws only on data the requesting User can already see, its content necessarily respects the same visibility boundaries described in Sections 5.6 and 5.8 — a Manager's summary may reflect internal detail unavailable to a Client, while a Client-role User requesting a summary of their own Project receives one built only from what that role is already permitted to view.

**5.13.4 AI Comment Summarization**

This operation condenses an existing Comment thread into a brief summary, limited to Comments the requesting User is already permitted to see, addressing the practical difficulty of catching up on a lengthy discussion after being away from a Task or Project for some time. A Client-role User invoking this operation receives a summary of only the Client-visible portion of a discussion, never the internal layer beneath it, exactly as retrieval and search already behave for that role in Sections 5.8.3 and 5.8.5.

This operation reads existing Comments; it does not add to, alter, or remove any of them. A summary generated through this operation exists only as output returned to the requesting User in that moment — it is not appended to the Comment thread, and no other participant is made aware that a summary was requested unless the requesting User separately chooses to share it through an ordinary Comment of their own.

**5.13.5 AI Service Design Considerations**

Every operation in this section is advisory rather than authoritative. Generated content is a suggestion, not a conclusion; the User remains responsible for reviewing it before it is used anywhere else in the system, and nothing described in this section relieves a User of that responsibility. This framing is a deliberate constraint on what Gemini is permitted to influence: it may shape the words a User ultimately chooses to save, but it never determines, on its own authority, what a Task's actual status is or what a Comment thread actually decided.

Authorization is never bypassed on the strength of an AI-generated result. Each operation checks the same role and scope rules that would apply to the underlying Task, Project, or Comment if the User were acting without AI assistance at all, per Section 5.2.6 — a User who lacks permission to edit a Task cannot obtain that permission indirectly by requesting a description for it, because the authorization check occurs before the Gemini API is ever consulted.

Validation is likewise unaffected. Content a User chooses to save after reviewing an AI-generated suggestion passes through the same request validation described in Section 5.2.7 as content the User typed unaided, regardless of whether the words being validated originated from the User or from a draft the User chose to accept.

No operation in this section modifies system state without the User's explicit confirmation. Nothing described here creates, assigns, completes, reassigns, archives, or deletes a Task, Project, or Comment automatically; the AI layer only ever produces a draft or summary for a User to act on or set aside. This is the clearest expression of the separation this section maintains between AI assistance and business logic: business logic executes in response to a User's deliberate action, and the AI layer's only role is to help that User decide what action, if any, to take.

This section deliberately introduces no persistent record of an AI request or its generated output. Chapter 3 defines no entity for storing a prompt, a response, or a history of AI interactions, and this API introduces none either — the generated content either becomes part of an existing resource once a User saves it, or it is discarded, in which case nothing about the interaction persists at all. This is a security consideration as much as a data-modeling one: because no prompt or response is retained independently of a User's decision to save it, there is no separate store of AI interaction history that could itself become a target for unauthorized access.

Should the Gemini API become unavailable, per Chapter 2 (Section 2.2), every operation in this section becomes temporarily unavailable while the underlying Task, Project, and Comment capabilities it assists continue to function exactly as described in Sections 5.6 through 5.8. A User unable to reach the AI Task Description Generator, for instance, is still fully able to write a Task's description manually — the assistance is unavailable, but the capability it assists is not. This graceful separation is what allows the three AI-assisted operations described in this section to enhance the Task, Project, and Comment APIs described earlier in this chapter without their absence, however caused, degrading those APIs' core operation.

Consistency with the rest of this chapter is maintained throughout: the same authentication model established in Section 5.3, the same authorization discipline established in Section 5.2.6, and the same validation discipline established in Section 5.2.7 apply here exactly as they apply to every other resource in this chapter. The AI Services API introduces no exception to any principle already established in this chapter — only a narrow, clearly bounded set of assistive operations layered on top of them.

---

### 5.14 Chapter Summary

Chapter 5 has translated the functional requirements defined in Chapter 4 into a conceptual API contract — a description of what ClientSphere's API layer must provide, without prescribing the technical means of delivering it.

Every resource addressed in this chapter traces directly to the entities established in Chapter 3: Organizations and Users in Sections 5.3 and 5.4, Clients in Section 5.5, Projects and Tasks in Sections 5.6 and 5.7, Comments in Section 5.8, Files in Section 5.9, Notifications in Section 5.10, aggregated Dashboard views in Section 5.11, and the Activity Log in Section 5.12. The API's resource-oriented design, established as a governing principle in Section 5.2.1, has held consistently across every one of these sections: each resource is created, retrieved, updated, and where applicable archived or deleted through the same consistent conventions, rather than through resource-specific patterns invented section by section.

Authorization has been the single most recurring thread running through this chapter. Every operation, in every section, has been bound to the role-based and scoped access control principles established in Chapter 2 (Section 2.6) and Chapter 4 (Section 4.3) — and, wherever a Client-role User's access needed particular care, this chapter has been explicit about the boundary between what that role may reach and what it may not, whether that meant a Project scoped to a single Client, a Comment marked open to Client participation, or a File designated as shared. Organizational data isolation, established in Chapter 2 (Section 2.6.2) and Chapter 3 (Section 3.2.3), has applied without exception: no operation described in this chapter has permitted one Organization's data to become visible to another's.

The API's modularity mirrors the backend architecture established in Chapter 2 (Section 2.4.2): each section in this chapter corresponds to a domain module already defined there, and the three Google Gemini capabilities, consolidated in Section 5.13, have been treated throughout as additive, assistive operations layered onto existing resources rather than a parallel system requiring its own data model or authorization scheme. This is also where the chapter's extensibility and maintainability rest — because every resource follows the same conventions and the same authorization discipline, a future capability, should one ever be introduced, would extend this chapter's existing pattern rather than requiring a new one.

Consistent with every chapter that precedes it, Chapter 5 has remained deliberately implementation-independent. No endpoint, request format, response format, or underlying technology has been specified; this chapter defines the contract the system's API must fulfill, not the code that fulfills it.

The conceptual API established here is the foundation the remaining chapters of this SRS build upon. Where this chapter has described what the API must do, the chapters that follow turn to how ClientSphere is secured, deployed, and verified against everything this document has defined — the security, deployment, and testing considerations that translate the architecture, data model, functional requirements, and API contract already established into a system ready for production use.

---

**End of Chapter 5.**

---
---

## Chapter 6: Security Architecture

### 6.1 Security Overview

**6.1.1 Purpose of Security**

Security in ClientSphere exists to protect something specific: the trust a service-based business places in the platform when it moves its clients, its projects, and its internal coordination into a single system of record. Every requirement in Chapter 4 and every conceptual API operation in Chapter 5 presumes that the data behind it is safe from unauthorized eyes and unauthorized change — this chapter makes that presumption explicit, describing the security posture the rest of this SRS has been quietly built on top of.

The relationship between security and the system architecture described in Chapter 2 is not one of addition but of enforcement. Chapter 2 already established where authentication is verified, where authorization is checked, and where an Organization's data is isolated from another's; this chapter does not introduce new mechanisms so much as it names the reasoning behind those mechanisms and states, plainly, what they are meant to achieve.

What is being protected falls into two related categories. The first is organizational information itself — the Clients, Projects, Tasks, and Comments that make up an Organization's working record, much of which is commercially sensitive by nature. The second is the Organization's ongoing business operations — its ability to rely on ClientSphere continuing to function correctly, without disruption or corruption, as work is actively being coordinated through it. A platform that loses either of these — the confidentiality of what it stores, or the reliability of what it does — loses the trust that justified adopting it as a system of record in the first place. Security, in this sense, is not a defensive afterthought layered onto ClientSphere; it is the precondition for the platform being trustworthy enough to serve its intended purpose at all.

**6.1.2 Security Objectives**

**Confidentiality** governs who may see what. This matters more in ClientSphere than in a purely internal tool, because the Client role, established in Chapter 1, means an authenticated party outside the Organization itself has standing access to a portion of the system. Confidentiality here is not a single boundary but two nested ones: the Organization boundary that separates one business's data from another's, and the internal-versus-Client boundary that separates a business's own working discussion from what it chooses to share with the people it serves.

**Integrity** governs whether stored information can be trusted to reflect what actually happened. A Task whose status could be silently altered by an unauthorized party, or an Activity Log entry that could be quietly edited after the fact, would undermine the very problem ClientSphere exists to solve — the fragmented, unreliable record-keeping described in Chapter 1's problem statement. Integrity is what makes the platform's record worth consulting at all.

**Availability** matters because ClientSphere is meant to be consulted continuously, not occasionally. A service business coordinating live client work cannot tolerate a platform that is frequently or unpredictably unreachable; the graceful-degradation principle already established in Chapter 2 (Section 2.12.6) and carried through the AI Services API in Chapter 5 (Section 5.13.5) exists precisely so that a failure in one dependency, such as Cloudinary or the Gemini API, never becomes a failure of the platform as a whole.

**Accountability** ties every action back to the individual who took it. This is what the Activity Log, described in Chapter 3 (Section 3.4.9) and given its own API contract in Chapter 5 (Section 5.12), exists to provide — a record that survives disagreement, staff turnover, and the simple passage of time, so that responsibility for a decision is never a matter of memory or dispute.

**Least Privilege** means a User is granted only the access their role and scope require, never more. This is the principle underlying every scoped visibility rule already established across Chapters 4 and 5 — a Manager's reach stopping at their assigned Projects, an Employee's at their assigned Tasks, and a Client's at their own Client entity — and it matters because a platform that granted broader access "just in case" would multiply the damage any single compromised account could do.

**Defense in Depth** reflects the layered enforcement already built into the architecture: authentication, authorization, validation, and organizational isolation each independently guard against a failure of the others. No single layer is trusted to carry the full weight of the system's security on its own.

**Secure-by-Default** means the platform's starting posture, before any configuration or customization, is a restrictive one — visibility withheld until explicitly granted, rather than granted until explicitly withheld. This is why, for instance, a Comment or File is only made visible to a Client-role User when explicitly designated as shared or open to Client participation, per Chapter 4 (Sections 4.9 and 4.10), rather than being visible by default and later restricted.

**6.1.3 Relationship with Previous Chapters**

Security does not stand apart from the architecture, data model, functional requirements, and API contract already established in this SRS; it is the connective reasoning that explains why those chapters were shaped the way they were. Chapter 2's modular monolith, its mediated access to external services, and its stateless authentication model were not arbitrary architectural preferences — they were choices that made a consistent security boundary possible in the first place. Chapter 3's referential integrity principles and organizational data isolation were not purely data-modeling concerns — they were the structural precondition for confidentiality and integrity to be enforceable at all. Chapter 4's authorization-scoped functional requirements, and Chapter 5's conceptual API contract built around inherited, never-recalculated authorization, are where those structural preconditions become concrete, testable behavior. This chapter does not repeat any of that; it draws the throughline between them and states the security reasoning that has been implicit throughout.

**6.1.4 Organizational Security Model**

Organization isolation is the foundational boundary of ClientSphere's security model, established architecturally in Chapter 2 (Section 2.6.2) and structurally in Chapter 3 (Section 3.2.3). Every entity in the system exists in relation to exactly one Organization, and no operation described anywhere in Chapters 4 or 5 permits that boundary to be crossed, regardless of role. This is a stronger guarantee than ordinary access control, because it does not depend on any individual permission check being correctly applied in every case — it is a property of how the data itself is structured, reinforced by consistent enforcement at every layer described in Chapter 2.

Within that boundary sits a second, narrower one specific to the Client role: the distinction between what is internal to an Organization's own team and what is shared with the Client it concerns. Chapter 4 established this distinction concretely for Comments (Section 4.9) and Files (Section 4.10) — a Comment or File may be designated as internal or as open to Client participation, and a Client-role User's access is limited to the latter regardless of what else they can otherwise view. This tenant-boundary protection extends the same logic that separates one Organization from another to a finer grain within a single Organization, separating a business's own internal deliberation from what it has chosen to make visible to the party it serves.

Protection of shared resources — a Project's status, a shared File, a permitted Comment — follows a consistent rule: visibility flows outward deliberately, never by default. A resource is Client-visible because someone with the authority to do so decided it should be, not because the system failed to withhold it. This is what makes the Client role, introduced as a genuine architectural addition in this SRS, compatible with the confidentiality expectations an Organization's internal team reasonably holds for its own working discussion.

**6.1.5 Security Philosophy**

Security in ClientSphere is treated as a cross-cutting concern rather than a feature confined to a single module. It is not implemented once in an authentication component and considered complete; it recurs in the request validation described in Chapter 4 (Section 4.14), in the authorization checks described in Chapter 5's every resource section, in the scoped delivery of real-time events described in Chapter 2 (Section 2.8.2), and in the background processing layer described in Chapter 2 (Section 2.9). No part of the system is exempt from this recurrence.

This is what layered security means in practice: an error or oversight in one layer — a missed check in a single API operation, for instance — does not by itself compromise the system, because other layers (organizational isolation, role-based scoping, request validation) would still stand between an unauthorized request and the data it sought. Consistent enforcement, applied identically regardless of which resource or role is involved, is what makes this layering meaningful rather than accidental; a security principle that applied to Projects but not to Files would not be a principle at all, only a convention.

Separation of responsibilities keeps this consistency achievable. Authentication, described in Section 6.2, establishes identity. Authorization, described in Section 6.3, determines what that identity may do. Neither is permitted to substitute for the other, and neither is scattered arbitrarily across the system — each is a distinct, well-defined concern with its own section in this chapter, mirroring the distinct roles they already play throughout Chapters 2, 4, and 5.

Maintainability and extensibility follow from this same discipline. Because security is enforced consistently rather than reimplemented per resource, extending ClientSphere with new capability — as Chapter 3 (Section 3.9.5) already anticipates — inherits the existing security posture automatically, rather than requiring that posture to be reconstructed for whatever comes next. This is the architectural philosophy guiding the remainder of this chapter: security is not a wall built around a finished system, but a set of consistent, layered, cross-cutting properties the system has held from its foundations upward.

---

### 6.2 Authentication Security

**6.2.1 Authentication Overview**

Authentication answers a single question: is this individual who they claim to be? Everything else this chapter describes — every authorization check, every scoped visibility rule — depends on that question having already been answered correctly, which is why authentication functions as the trusted entry point to the entire system. An authorization decision made against a misidentified User would be no decision at all; it is only meaningful once identity itself is settled.

This is why authentication is always evaluated before authorization, never alongside or after it, as already established in Chapter 5 (Section 5.2.5 and Section 5.3.8). A request without a valid, verified identity is rejected before any role or scope is even considered, because there is nothing yet to apply a role or scope to.

Authentication's relationship to the User and Organization entities described in Chapter 3 is direct: a successful authentication resolves to exactly one User record, and that User belongs to exactly one Organization. Every subsequent security decision in this chapter — every authorization check in Section 6.3 — proceeds from this resolved identity, never from a request's claims about itself.

**6.2.2 Credential-Based Authentication**

Credential-based authentication verifies account ownership by confirming that whoever is attempting to log in possesses the correct combination of registered identifier and secret known only to the legitimate account holder. This is the login workflow described functionally in Chapter 4 (FR-AUTH-003): a User supplies their credentials, and the system either confirms a match against the corresponding account or rejects the attempt.

An authentication failure — an incorrect credential, or an attempt against an account that does not exist — is handled identically from the requester's point of view, consistent with the non-disclosure principle already established in Chapter 5 (Section 5.3.3). This is a deliberate protection against unauthorized access: an attacker probing for valid accounts gains no information from a failed attempt beyond the fact that it failed, since the system never distinguishes "wrong password" from "no such account" in what it communicates back.

This SRS deliberately does not describe how a credential is stored or compared — no hashing algorithm, library, or technical mechanism is specified anywhere in this document, consistent with the implementation-independent approach maintained throughout. What matters at the specification level is the guarantee such a mechanism must uphold: a credential must never be recoverable from what the system stores, and a match must never be confirmable except by the legitimate authentication process itself.

**6.2.3 Google OAuth Authentication**

Federated authentication, described functionally in Chapter 4 (FR-AUTH-005), allows a User to authenticate by relying on a trusted identity provider — Google — rather than a credential registered directly with ClientSphere. The platform does not independently verify the individual's identity in this path; it verifies that Google has already done so, and accepts that verification as sufficient.

This works because the identity provider is trusted precisely for the purpose of identity verification, and because ClientSphere's own security posture does not depend on how a session was originally established, only on the fact that it was established correctly. Once a Google-authenticated User is resolved to a User account, per Chapter 5 (Section 5.3.7), that account's association with a specific Organization proceeds under the exact same rules as any other User — federated login grants no broader or different access than credential-based login would for the same individual.

Consistent authorization regardless of authentication method is what makes supporting both paths safe rather than merely convenient. A User's role, scope, and every downstream authorization decision described in Section 6.3 are entirely indifferent to whether that User logged in with a password or through Google — the two paths converge into one identical kind of authenticated session, as already established in Chapter 2 (Section 2.6.1). The advantage of supporting OAuth alongside local authentication is therefore twofold: it reduces the friction of adopting the platform for individuals who prefer not to manage another password, without introducing a second, differently-trusted class of User to reason about.

**6.2.4 Session Security**

An authenticated session begins the moment credential verification or federated identity verification succeeds, and it persists, in the sense of being honored by the system, only until it is explicitly ended or otherwise becomes invalid. Session establishment produces the portable credential described in Chapter 5 (Section 5.1.4), which a User's client presents on every subsequent request requiring authentication.

Session expiration and logout are the two ordinary paths by which a session ends. Logout, described functionally in Chapter 4 (FR-AUTH-007), is a deliberate act by the User; expiration is a passive limit on how long a session may be honored without renewed verification. Both result in the same outcome described in Chapter 5 (Section 5.3.4): the previously valid credential is no longer accepted, and any request presenting it is treated exactly as an unauthenticated request would be.

An invalid session — one that has expired, been explicitly ended, or was never valid to begin with — is never granted partial or degraded access. This SRS treats authentication as a binary boundary throughout; there is no intermediate state in which a User is "somewhat" authenticated, and prevention of unauthorized reuse depends on this being strictly true. A session credential, once invalidated, must never be honored again under any circumstance, regardless of what request presents it or how soon after invalidation that request arrives.

This session model applies identically to both channels a User interacts with the system through: the REST API described throughout Chapter 5, and the real-time communication layer described in Chapter 2 (Section 2.8). A session invalidated on one channel is invalidated on both — there is no scenario in which a User logged out of the ordinary API retains a live real-time connection carrying the authority of a session that no longer exists.

**6.2.5 Password Recovery Security**

Password recovery exists for the case where a User can no longer authenticate through ordinary means, and it is treated with the same rigor as authentication itself, because a poorly secured recovery path would otherwise become the easiest way to compromise an account rather than the hardest. Identity verification in this workflow does not rely on the User's original credential, since that credential is precisely what has been lost — it relies instead on the User's independent control of their registered email address.

The secure recovery workflow, described functionally in Chapter 4 (FR-AUTH-009 and FR-AUTH-010), proceeds through a temporary recovery process: a time-limited, single-use mechanism issued in response to a recovery request, which the User then uses to establish a new password. This mechanism is deliberately narrow in what it permits — it allows a password to be reset, and nothing else; it grants no session, no visibility into the account's data, and no other capability.

This workflow depends on the asynchronous email architecture described in Chapter 2 (Section 2.9), since the recovery mechanism must reach the User outside the application itself, through the Password Reset Email queue already established there. Protection against unauthorized password changes follows from the same non-disclosure principle described in Section 6.2.2: a recovery request against an email address that has no corresponding account produces no observable difference in behavior, and successfully completing a reset requires possession of the issued mechanism, not merely knowledge that an account exists.

**6.2.6 Authentication Design Considerations**

Authentication functions as the first security boundary in ClientSphere, and every other consideration in this chapter is downstream of it. This is why authentication is applied with total consistency across the application — there is no operation described anywhere in Chapter 5 that is reachable without it, apart from the narrow, explicitly defined exceptions (registration, login itself, and the initiation of password recovery) already identified in Chapter 5 (Section 5.2.5).

Maintainability follows from authentication's separation into its own dedicated concern, described architecturally in Chapter 2 (Section 2.6.1): because every other module in the system depends on an already-resolved, already-verified identity rather than performing its own verification, a change to how authentication itself is carried out — introducing a further federated provider, for instance — would touch only that dedicated concern, not the authorization logic built on top of it.

Scalability and extensibility follow from the stateless session model already established in Chapter 5 (Section 5.1.4): because validating a session depends only on the credential presented with a given request, authentication imposes no requirement that a User's requests be handled by any particular instance of the backend, and a future authentication method could be introduced without disturbing this property.

Finally, authentication's deliberate separation from authorization is what allows this chapter to treat the two as genuinely distinct sections rather than a single blended concern. Authentication answers only who is asking; it never determines what they may do, and Section 6.3 is where that separate question is addressed in full.

---

### 6.3 Authorization & Access Control

**6.3.1 Authorization Overview**

Where authentication establishes identity, authorization determines what that identity is permitted to do. The two are frequently conflated in casual description, but ClientSphere treats them as strictly sequential and strictly distinct: authentication must already have succeeded before authorization is ever evaluated, and a successful authentication carries no permission of its own beyond having established who is asking.

This section builds directly on the role-based access control model established in Chapter 2 (Section 2.6.2) and expressed functionally throughout Chapter 4. Its purpose here is not to redefine that model but to state, explicitly and in one place, the reasoning that governs how every resource described in Chapter 5 protects itself — resource protection, in this sense, is simply authorization applied consistently to a specific Client, Project, Task, or other entity.

**6.3.2 Role-Based Access Control**

The four roles established in Chapter 1 — Administrator, Manager, Employee, and Client — remain the entire vocabulary of authorization in ClientSphere; this chapter introduces no additional role and no exception to how these four already behave. An Administrator's authority is organization-wide, reflecting their accountability for the Organization as a whole rather than any single Project or Client relationship. A Manager's authority is bounded to the Projects they are responsible for, reflecting accountability for delivery rather than for the Organization's broader operation. An Employee's authority is bounded to the work directly assigned to them, reflecting individual contribution rather than oversight. A Client's authority is the narrowest of the four, reflecting their position as an external party whose relationship to the system is defined entirely by what has been shared with them, never by internal standing within the Organization.

What unites these four is not a shared level of access but a shared principle: each role's authority corresponds to its actual responsibility within the service-delivery relationship described in Chapter 1, and no role is granted authority beyond what that responsibility requires.

**6.3.3 Organization-Level Isolation**

Organization boundaries function as the outermost layer of authorization, evaluated before any role-specific permission is considered. A request is first confined to the requesting User's own Organization, and only within that confinement does role determine what may be seen or done. This ordering matters: role-based permission is meaningless if it can be evaluated against the wrong Organization's data, so isolation is not merely one authorization rule among many but the precondition every other rule depends on.

Cross-organization protection, in this sense, is absolute rather than role-dependent — an Administrator of one Organization has no more access to a second Organization's data than a Client of that second Organization's own competitor would. Tenant isolation applies uniformly across every resource described in Chapter 5, and prevention of unauthorized organizational access is enforced identically regardless of how a request attempts to reach another Organization's data, whether through direct retrieval, search, or aggregation.

**6.3.4 Resource-Level Authorization**

Every resource described in Chapter 5 inherits authorization from the same small set of principles rather than defining its own. Users, Clients, and Projects are governed by organization membership and role, per Sections 5.4 through 5.6. Tasks inherit their authorization from the Project they belong to, per Section 5.7, extending the same visibility a User already holds over that Project down to the work items within it. Comments and Files carry an additional, finer distinction — internal versus shared — layered on top of their parent Task or Project's authorization, per Sections 5.8 and 5.9. Notifications are the narrowest case of all, visible only to their single named recipient regardless of role, per Section 5.10. Dashboards and Activity Log entries introduce no independent authorization model whatsoever; they aggregate or recount other resources and inherit those resources' visibility exactly, per Sections 5.11 and 5.12. AI Services, per Section 5.13, inherit the authorization of whatever Task, Project, or Comment they are asked to assist with, and grant no visibility beyond what the requesting User already holds over that underlying resource.

This inheritance pattern, rather than a resource-by-resource reimplementation of authorization logic, is what keeps the system's security posture coherent as it grows: a new capability built on an existing resource inherits that resource's authorization automatically, rather than requiring authorization to be reasoned about anew each time.

**6.3.5 Client Visibility Model**

The Client role's visibility is deliberately the most constrained in the system, and this section states plainly why. A Client is not a member of the Organization's team; they are the party the Organization's work is being performed for. Extending them the same visibility an Employee holds would expose internal deliberation, disagreement, and working detail that has nothing to do with the deliverable the Client is owed, and would compromise exactly the confidentiality objective described in Section 6.1.2.

This is enforced through the shared-versus-internal distinction already established in Chapter 4: shared Files and Client-visible Comments are made available deliberately, per Sections 4.9 and 4.10, while internal Comments and internal Files remain invisible to a Client-role User regardless of what else they can see on the same Project. Restricted project information follows the same logic at a coarser level — a Client sees their own Project's status, timeline, and progress, but never the Organization's broader portfolio, its other Clients, or its internal staffing decisions.

Client access is intentionally constrained, rather than merely narrow by omission, because the alternative would quietly undermine the trust an Organization places in ClientSphere to keep its internal operations internal. A platform that could not reliably make this distinction would not be safe to use for genuine client collaboration at all — the constraint is what makes the Client role a feature rather than a liability.

**6.3.6 Authorization Consistency**

Authorization inheritance, described in Section 6.3.4, is what allows this consistency to hold across every surface a User might interact with, not only the ordinary request-and-response pattern described throughout Chapter 5. Real-time communication, per Chapter 2 (Section 2.8.2), delivers an event only to a User already authorized to know about it — a Client-role User is never pushed a real-time update concerning an internal-only Comment, any more than they could retrieve it directly. Background processing, per Chapter 2 (Section 2.9), carries no independent authorization logic of its own; the transactional emails it dispatches are triggered by actions already authorized at the moment they occurred, not re-evaluated afterward.

AI-assisted operations, per Chapter 5 (Section 5.13), are bound by the same rule stated there directly: an AI Services request never sees more than the requesting User already could, and never acts with more authority than that User already holds. File management, per Section 5.9, and Dashboard aggregation, per Section 5.11, both draw on other resources' authorization rather than defining their own, exactly as described in Section 6.3.4. Notification delivery, per Section 5.10, remains bound to its single recipient regardless of which channel — real-time or retrieved history — delivers it.

The unifying property across all of these surfaces is that authorization is evaluated once, against the underlying resource, and every other surface that touches that resource — whether a live event, a background job, an AI suggestion, or an aggregated view — respects that single evaluation rather than performing a separate one that could drift out of alignment with it.

**6.3.7 Authorization Design Considerations**

The Principle of Least Privilege, introduced in Section 6.1.2, governs every role and every resource described in this chapter: access is granted because a specific responsibility requires it, never because withholding it would be inconvenient. Default denial is the practical expression of this principle — where this chapter has not explicitly stated that a role may access something, the correct behavior is to deny that access, not to permit it until a restriction is written.

Consistency, maintained through the inheritance pattern described in Section 6.3.4, is what keeps this system reasoned-about rather than merely documented — a developer or reviewer who understands how authorization works for one resource already understands how it works for every other, because none of them depart from the shared principles stated in this chapter. This consistency is also the foundation of the chapter's maintainability: a correction or refinement to an authorization principle applies uniformly, rather than needing to be separately reconciled across a dozen resource-specific implementations.

Extensibility and future scalability follow directly. Because authorization in ClientSphere is a small set of consistently applied principles rather than a sprawling collection of resource-specific rules, a future capability — whether a new resource, a new AI-assisted operation, or an expansion of the Client role's own scope, per Chapter 3 (Section 3.9.5) — can be reasoned about against those same principles rather than requiring an entirely new authorization model to be designed alongside it. The architectural rationale underlying this entire chapter, in short, is that security in ClientSphere is not a property bolted onto individual features, but a small, consistent, and deliberately unglamorous set of rules applied without exception — and it is precisely that lack of exception that makes the platform trustworthy enough to hold what an Organization and its Clients place inside it.

---

### 6.4 Data Protection

**6.4.1 Data Protection Overview**

Authentication and authorization, addressed in Sections 6.2 and 6.3, govern who may act and what they may act upon. Data protection addresses something adjacent but distinct: the ongoing safeguarding of the information itself, once it exists within ClientSphere, regardless of which specific request or User happens to be touching it at a given moment. An Organization entrusts the platform with its Client relationships, its Project history, and its team's working record precisely because that information is valuable, and protecting it is what justifies that trust continuing to be extended.

This protection cannot be reduced to a single mechanism applied at a single point. It spans the complete data lifecycle described later in this section — from the moment a Client record or Task is first created, through every retrieval and modification it undergoes, to its eventual archival — and it must hold at every one of those points, not merely at the moment of storage. Confidentiality, integrity, and availability, introduced as security objectives in Section 6.1.2, are what this protection exists to preserve. Losing any one of the three undermines the platform's value regardless of how well the other two are maintained.

Data protection, understood this way, is a continuous architectural responsibility rather than a discrete security feature. It is expressed through the same organizational isolation, referential integrity, and scoped visibility principles that Chapters 2 and 3 already built the system around, and this section states the reasoning that ties those principles together under a single protective purpose.

**6.4.2 Organizational Data Isolation**

Every piece of data in ClientSphere is owned, directly or transitively, by exactly one Organization — a principle established structurally in Chapter 3 (Section 3.2.3) and enforced architecturally in Chapter 2 (Section 2.6.2). Data protection depends on this ownership being more than a labeling convention: it must produce a logical separation strong enough that one Organization's information is never reachable, by any path, from another Organization's request.

This separation applies without exception across every entity described in this SRS. Users and Clients are bound to a single Organization at creation and remain so for the whole of their record. Projects and Tasks inherit that same boundary transitively through the Client and Project they belong to, per the dependency chain described in Chapter 3 (Section 3.5.11). Comments and Files carry the boundary further, since they attach to an already-isolated Project or Task. Notifications and Dashboards, being derived rather than independently stored, inherit isolation automatically from whatever they aggregate or report on, exactly as described in Sections 5.10 and 5.11. Activity Log entries, despite their permanence, are no exception — an entry belongs to the Organization in which the action occurred and is never retrievable outside it, per Section 5.12.4. Even AI-assisted operations, per Section 5.13, operate only on data already scoped to the requesting User's own Organization, since the Gemini integration never receives more context than the underlying Task, Project, or Comment already permits.

Organizational isolation is fundamental to the platform for a reason that goes beyond ordinary access control: ClientSphere serves many independent businesses from a shared platform, and the entire premise of that arrangement depends on each Organization behaving, from its own point of view, as though it were the only one being served. A single failure of this isolation — one Organization's Client list or Project history becoming visible to another — would not be a minor defect but a fundamental breach of what the platform promised to provide, regardless of how well every other security property held.

**6.4.3 Protection of Sensitive Information**

Not every category of information ClientSphere holds carries the same sensitivity, and data protection accounts for this without abandoning a single, unified strategy. User information — identity, contact details, and role — is sensitive chiefly because it identifies real individuals and determines their standing within the system; its protection rests on the authentication and authorization boundaries described earlier in this chapter. Client information carries a different weight, since it often reflects a business relationship an Organization would not want disclosed to competitors, and its protection depends on the organizational isolation described in Section 6.4.2 holding without exception.

Project information combines operational detail with the commercial context of the Client it concerns, while uploaded documents — contracts, briefs, and deliverables — frequently represent the single most sensitive material attached to a Project, warranting the shared-versus-internal distinction already established in Chapter 4 (Section 4.10). Internal comments carry a narrower but no less important sensitivity: the candid discussion a team has about its own work, which is precisely what the Client visibility model described in Section 6.3.5 exists to shield. Activity history exposes not only what an Organization has but how its decisions were actually made, and authentication-related information, though addressed procedurally in Section 6.2, is the one category whose exposure would compromise every other protection this section describes.

What unifies these categories, despite their differing sensitivity, is that each is protected through the same architectural principles — organizational isolation, role-based scoping, and, where applicable, the internal-versus-shared distinction — rather than through a separate protective scheme invented for each.

**6.4.4 Data Integrity Protection**

Integrity protection ensures that stored information can be relied upon to reflect what genuinely occurred, and it begins with a structural constraint rather than a procedural one: unauthorized modification is prevented by the same authorization discipline described in Section 6.3, which determines not only who may view a piece of data but who, if anyone, may change it. This is inseparable from the referential integrity and business rule enforcement already established in Chapter 3 (Section 3.6) — a Task cannot be silently detached from its Project, and a status cannot transition to a state its own lifecycle forbids, per Chapter 4 (FR-TASK-024), regardless of who is attempting the change.

Validation before persistence, described functionally in Chapter 4 (Section 4.14), is what keeps this protection proactive rather than reactive: information is checked for correctness and consistency before it is ever stored, rather than being accepted and corrected afterward. Controlled updates follow the same logic — every modification passes through the same authorization and validation discipline that governed the data's original creation, so that an update can never bypass a rule its creation would have been subject to. Together, these protections guard against accidental or inconsistent change as much as deliberate misuse; a well-intentioned but malformed update is rejected by the same mechanism that would reject a malicious one, because the system does not distinguish intent, only conformity to its own rules.

The Activity Log, described in Section 5.12, represents the clearest expression of integrity as historical accuracy rather than merely present-moment correctness. Because its entries are immutable once created, per Chapter 3 (Section 3.8.6), the record of what happened cannot be revised to suit a later narrative — integrity here extends backward in time, not only across the current state of the system. This is what makes reliable business operations possible at all: a Manager relying on a Project's recorded status, or an Administrator investigating a past decision, can trust that the information they are consulting has not quietly shifted beneath them since it was first recorded.

**6.4.5 Data Availability**

Availability protection ensures that information remains reachable to every User who is authorized to reach it, without unnecessary delay or disruption. This is not in tension with confidentiality so much as it is balanced against it: the same authorization rules that withhold data from those not entitled to it are designed to impose no obstacle whatsoever on those who are. A Client-role User's restricted visibility, described in Section 6.3.5, is a confidentiality boundary, not an availability one — within that boundary, the Client's access to their own assigned Projects, Tasks, and shared Files is expected to be as immediate and reliable as any internal User's access to their own scope.

Reliable access to organizational information depends in part on the graceful degradation already established in Chapter 2 (Section 2.12.6) and carried through the AI Services API in Chapter 5 (Section 5.13.5): a disruption to an optional external dependency — Cloudinary's storage layer, or the Gemini API — affects only the specific capability that dependency supports, never the platform's core ability to retrieve and act on its own stored information. Availability, in this sense, is closely tied to the reliability objective established in Chapter 1 (NFR-4); a platform that is confidential and accurate but frequently unreachable would still fail the trust an Organization places in it as a system of record.

**6.4.6 Data Lifecycle Protection**

Protection does not attach to data at a single moment; it applies continuously across every stage a piece of information passes through. At creation, protection begins with the authorization and validation discipline described in Sections 6.3 and 6.4.4, ensuring information never enters the system in an unauthorized or malformed state. During storage, organizational isolation and the entity-level ownership described in Section 6.4.2 keep that information correctly bounded for as long as it exists. At retrieval, the same authorization rules evaluated at creation are evaluated again, ensuring that time passing since a record was created never loosens who may see it.

Modification is protected by the controlled-update discipline described in Section 6.4.4, and archiving — addressed functionally throughout Chapter 4 for Clients, Projects, Tasks, and Files alike — is treated as a change in status rather than a loss of protection; an archived record remains exactly as isolated, exactly as access-controlled, as an active one. Deletion is the one lifecycle stage where this SRS deliberately departs from its general preference for preservation, reserved narrowly for cases such as File removal, per Chapter 3 (Section 3.8.7), where retaining the underlying content serves no continuing purpose — and even here, the Activity Log entry describing that deletion, per Section 5.9.6, persists permanently, so that the fact an action occurred is never itself lost even when the content it concerned is.

Preserving historical relationships across this lifecycle matters as much as protecting any single record in isolation. An archived Client's past Projects remain attached to it, per Chapter 3 (Section 3.8.4), rather than being severed once that Client becomes inactive, because a fragmented history would be little better than no history at all. Security considerations, in other words, do not relax once a record moves out of active use — an archived Project deserves the same isolation and access control its active counterpart received, for exactly as long as it continues to exist within the system.

**6.4.7 Data Protection Design Considerations**

Consistent protection across every module is what allows this section's principles to be stated once rather than separately for Users, Clients, Projects, Tasks, Comments, Files, Notifications, Dashboards, and Activity Logs alike. Layered protection — organizational isolation, role-based authorization, validation, and immutable audit history each operating independently — ensures that no single point of failure compromises the whole, echoing the defense-in-depth principle introduced in Section 6.1.2. Separation of responsibilities keeps this manageable: data protection does not duplicate the work already done by authentication and authorization, it relies on them, while contributing its own distinct concern for the information's confidentiality, integrity, and availability once those boundaries have been correctly established.

Maintainability follows from this same non-duplication: because every resource inherits the same protective principles rather than implementing its own, a refinement to how integrity or isolation is enforced applies uniformly rather than needing reconciliation across a dozen separate implementations. Scalability and extensibility follow in turn — an Organization's growing volume of Clients, Projects, and Tasks, or a future capability added to this SRS, per Chapter 3 (Section 3.9.5), inherits the same protective posture automatically, without requiring data protection to be redesigned for whatever the platform eventually becomes.

Long-term protection of organizational information is, ultimately, the point of everything this section has described: a Client relationship, a Project's history, and the record of how an Organization's team carried out its work are expected to remain confidential, accurate, and available not only on the day they are created but for as long as the Organization continues to rely on ClientSphere to hold them. This aligns directly with the architecture established in Chapters 2 and 3 — data protection introduces no mechanism those chapters did not already anticipate, only the explicit reasoning for why they were built the way they were.

Data protection, in this sense, completes the picture that authentication and authorization began. Authentication establishes who is present; authorization establishes what they may do; data protection ensures that the information itself remains worth protecting throughout its entire existence within the platform, regardless of who is or is not actively interacting with it at any given moment. The remaining security topics in this chapter build on exactly this foundation, turning next to the more specific mechanisms and considerations that support it in practice.

---

### 6.5 API Security

**6.5.1 API Security Overview**

Every interaction a User has with ClientSphere, regardless of role, ultimately passes through the API layer described throughout Chapter 5. This makes the API the primary communication boundary of the entire system — the single point through which the presentation tier described in Chapter 2 reaches the business logic, data, and external services beneath it. Nothing in this platform is reachable by any other path, which is precisely what allows this section to speak of API security as though it were the operational face of the security architecture already described in Sections 6.1 through 6.4.

The API is best understood as a controlled access point rather than an open channel: it does not merely relay requests to the layers beneath it, it decides, for every single request, whether that request is entitled to reach them at all. This is where authentication, authorization, and data protection stop being abstract principles and become concrete behavior — a request either satisfies all three, in sequence, or it does not proceed. Every request is held to this same discipline regardless of the requesting User's role; an Administrator's request receives no shortcut through validation, and a Client-role User's request receives no relaxed version of authorization. API security, understood this way, is not an isolated component bolted onto the system's edge — it is the point at which every architectural principle already established in this chapter is actually exercised.

**6.5.2 Authentication and Authorization Enforcement**

Every request begins with authentication, evaluated before any business operation is even considered, exactly as described in Section 6.2.1. A request lacking a valid, verified session is rejected at this point regardless of what it asks for, since there is no identity yet to evaluate against any rule that follows.

Only once identity is established does authorization proceed, and it proceeds in a fixed order that mirrors the layered isolation described in Section 6.3.3: organizational boundary verification comes first, confirming that whatever the request concerns belongs to the requesting User's own Organization, followed by role-based access verification, confirming that the User's assigned role — Administrator, Manager, Employee, or Client — permits the category of action being requested, followed finally by resource-level authorization, confirming the User's specific relationship to the Project, Task, or other entity in question, per the inheritance pattern described in Section 6.3.4. Client role restrictions are enforced at this same point, never as an afterthought applied once a response has already been assembled — a Client-role User's request for an internal-only Comment or File is refused during authorization itself, not filtered out of a response that was already retrieved.

Every endpoint in this API follows this same discipline without exception, because a single endpoint permitted to skip a step would undermine the guarantee every other endpoint depends on. Consistent authorization across all endpoints is not a convenience for developers reasoning about the system; it is the property that makes the organizational isolation and role-based access control described earlier in this chapter actually true in practice, rather than true only where someone remembered to enforce it.

**6.5.3 Request Validation**

Authentication and authorization determine whether a request is permitted to proceed; validation determines whether what the request contains is fit to be acted upon at all. A request may come from a fully authorized User and still describe something malformed — a missing required field, a value outside its expected range, or a business rule violation such as an invalid status transition already described in Chapter 4 (FR-TASK-024) — and validation is what catches this before it ever reaches the data the request concerns.

This protection against malformed or invalid data occurs before business logic execution, not alongside or after it, which is what prevents an incomplete or inconsistent request from producing a half-applied change. This ordering connects directly to the data integrity principles established in Chapter 3 (Section 3.6): a Task cannot be created without its mandatory Project reference, and a Client cannot be archived while active Projects remain incomplete, per Chapter 4 (FR-PROJ-021), because validation refuses to let such a request reach the layer that would otherwise apply it.

Validation is best understood as a layered architectural principle rather than a single checkpoint. It recurs at the boundary of the API itself, within the business logic that governs each resource, and again at the point where data is persisted, echoing the layered protection already described in Section 6.1.5. This redundancy is deliberate: preventing an inconsistent system state is too important to depend on any single validation step never being bypassed or overlooked.

**6.5.4 API Communication Protection**

Every exchange between the frontend described in Chapter 2 (Section 2.3) and the backend it communicates with is treated as occurring over a trusted communication channel, one whose confidentiality and integrity are protected for the duration of the exchange. Confidentiality here means that information in transit — a Task's description, a Comment's content, a session credential — remains shielded from anyone positioned between the two parties who might otherwise observe it. Integrity means that what the backend receives is verifiably what the frontend sent, without alteration occurring unnoticed along the way.

This protection applies uniformly regardless of the sensitivity of any individual request; a routine retrieval and a Client's request for a shared File are protected by the identical channel, since the value of a trusted channel lies in its consistency, not in being selectively applied to whatever a system happens to judge sensitive at a given moment. This SRS deliberately does not name the specific mechanism by which this trust is established, consistent with its implementation-independent approach — what matters at this level of specification is the property such a mechanism must guarantee, not the technology chosen to guarantee it.

**6.5.5 Error Handling and Information Exposure**

A failed request — whether due to invalid input, an authorization failure, or an unexpected internal condition — must be handled without revealing more about the system than the requesting User needs to know, a principle already established functionally in Chapter 4 (Section 4.14) and applied here as a security consideration in its own right. Secure handling of failure means the difference between a request that was merely malformed and one that touched a resource the User was never authorized to see is not disclosed in a way that would help an unauthorized party refine a future attempt, echoing the non-disclosure principle already established for authentication in Section 6.2.2.

This is achieved through consistent error responses applied across every resource described in Chapter 5, avoiding unnecessary disclosure of internal system details — the specific reason an internal failure occurred, or the structure of the system that produced it — regardless of which layer the failure originated in. A clear separation is maintained between what a User is shown and what would be recorded for internal diagnostic purposes, echoing the distinction already drawn in Chapter 4 (FR-ERROR-014) between the Activity Log and technical error logging. This separation supports both security and maintainability at once: a consistent, minimal error response gives an attacker little to work with, while still leaving developers a complete internal record to investigate a genuine fault.

**6.5.6 API Security Design Considerations**

Consistency is the property that makes every principle in this section meaningful — an authorization rule, a validation check, or an error-handling convention applied to most endpoints but not all would leave exactly the gap an attacker would search for. Layered protection, echoing Section 6.1.5, ensures that authentication, authorization, validation, and controlled error disclosure each stand independently, so that no single oversight compromises the whole. Separation of concerns keeps this achievable in practice: the API enforces these principles uniformly rather than allowing each resource described in Chapter 5 to define its own variation of them.

Scalability and maintainability follow from the same reasoning already applied to authentication in Section 6.2.6 — because these protections are enforced consistently rather than reimplemented per resource, extending the API with a future capability inherits this discipline automatically. Alignment with previous chapters is not incidental here; every principle in this section is the operational expression of something already established architecturally in Chapter 2, structurally in Chapter 3, functionally in Chapter 4, and conceptually in Chapter 5. API security, in short, is not a separate concern layered on top of this SRS's earlier chapters — it is the point at which their combined reasoning is actually enforced, request by request, for every User the system serves.

---

### 6.6 File Storage Security

**6.6.1 File Storage Security Overview**

Uploaded files — contracts, briefs, and deliverables described functionally in Chapter 4 (Section 4.10) — often carry a concentration of sensitive detail disproportionate to their number, since a single document can reveal commercial terms, internal drafts, or client-specific information that no amount of Task or Comment text alone would expose. Securing these files matters precisely because they are frequently the most consequential artifacts a Project produces, and their protection is inseparable from the protection of the organizational information they document.

This protection is not confined to the moment a file is uploaded; it applies throughout the complete file lifecycle described later in this section, from creation through eventual deletion. File security, understood this way, is not a separate concern from the rest of this chapter but a direct extension of it — the same organizational isolation, authorization, and data protection principles already established in Sections 6.3 and 6.4 apply to a File Metadata record exactly as they apply to a Project or a Task.

**6.6.2 Access Control for Files**

No file is retrievable without authorization evaluated first, following the same sequence already described in Section 6.5.2: organizational boundary, role, and resource-specific relationship, applied to the file's parent Client, Project, or Task before the file itself is ever considered. Role-based visibility follows from this inheritance directly — an Employee's reach into a Project's files mirrors their reach into that Project itself, and a Manager's mirrors the Projects they are responsible for.

Client visibility restrictions apply here with particular weight, echoing the shared-versus-internal distinction established in Chapter 4 (Section 4.10): a Client-role User's access is limited to files explicitly designated as shared, even where they are otherwise authorized to view the Project a file is attached to. This is why files inherit permissions from their associated entities rather than carrying an independent authorization scheme of their own — a file has no meaning apart from the Client, Project, or Task it documents, and its visibility should never diverge from the visibility already established for that context. Consistent authorization across Projects, Tasks, and Clients is what keeps this inheritance trustworthy; a file's protection is only as strong as the protection of the entity it belongs to.

**6.6.3 Protection of Uploaded Content**

Once a file has been uploaded, its content is protected against unauthorized modification and unauthorized replacement alike. This is why version replacement, described functionally in Chapter 4 (FR-FILE-008), is treated as a distinct, deliberate operation rather than an implicit consequence of merely uploading a file with the same name — a new version is only ever created by an authorized action, never by an incidental collision.

Ownership is preserved throughout a file's existence: the identity of the User who uploaded a file, and the timestamp at which they did so, remain part of its record for as long as the file itself persists, consistent with the File Metadata entity described in Chapter 3 (Section 3.4.10). File metadata — name, uploader, and association — receives the same protection as the file's content, since metadata alone can reveal sensitive context even without the underlying document being opened. This consistency with Chapter 3's data model is deliberate: file security introduces no new concept the data model did not already anticipate, only the explicit protective reasoning behind what that model already describes.

**6.6.4 File Lifecycle Protection**

Security responsibilities remain constant across every stage a file passes through. At upload, per Chapter 4 (FR-FILE-001), authorization and the validation described in Section 6.5.3 govern whether a file is accepted at all. During storage, the same organizational and entity-level protections described in Section 6.4.2 keep the file correctly bounded. At retrieval, authorization is evaluated again rather than assumed to still hold from the moment of upload, ensuring that a change in a User's role or a file's shared status is reflected immediately.

Updating a file's metadata is subject to the same controlled-update discipline already described in Section 6.4.4, and archiving a file, per Chapter 3 (Section 3.8.3), preserves its protection exactly as an active file's protection is preserved — an archived file is neither more exposed nor more hidden than it was before. Deletion, addressed in Chapter 4 (FR-FILE-010), is the one lifecycle stage where files depart from this SRS's general preference for preservation, and even here the Activity Log entry recording that deletion persists permanently, per Section 5.9.6, so that the fact of removal is never itself lost.

**6.6.5 External Storage Considerations**

Cloudinary, described architecturally in Chapter 2 (Section 2.7), functions as an external managed storage service rather than a component of ClientSphere's own trust boundary. Every storage operation — upload, retrieval, or deletion — is mediated by the backend, exactly as established in Chapter 2 (Section 2.7.1); no User, regardless of role, is ever granted direct administrative access to the underlying storage service itself.

This mediation is what preserves organizational ownership despite the content physically residing outside ClientSphere's own infrastructure: authorization is always evaluated by the backend before a file is reached, never delegated to the storage provider, and a User's relationship to a file is defined entirely by ClientSphere's own records rather than by anything the storage service independently knows or grants. The separation between application security and external storage is deliberate and total — Cloudinary is trusted only to hold content the backend has already authorized, never to make an authorization decision of its own.

**6.6.6 File Storage Security Design Considerations**

Consistency, maintainability, and scalability here follow the same reasoning already established for the API in Section 6.5.6: because file authorization is inherited rather than independently defined, it remains coherent as an Organization's volume of Clients, Projects, and Tasks grows, and any refinement to how a parent entity is protected extends automatically to the files attached to it. Separation of responsibilities keeps the backend accountable for every authorization decision, while leaving the mechanics of durable storage to the external service best suited to it, per the architectural reasoning already established in Chapter 2 (Section 2.7.4).

Long-term protection of organizational documents follows directly from everything described in this section: a contract or deliverable uploaded early in a Client relationship is expected to remain exactly as protected years later, regardless of how the Project it belongs to has since evolved. File storage security, in the end, is not a separate discipline from the data protection strategy described in Section 6.4 — it is that strategy applied to the one category of information whose protection depends on an external service's cooperation as well as ClientSphere's own.

---

### 6.7 AI Integration Security

**6.7.1 AI Security Overview**

The Google Gemini integration, established architecturally in Chapter 2 (Section 2.2) and exposed conceptually through the AI Services API in Chapter 5 (Section 5.13), introduces a security consideration distinct from any other external service this SRS describes: it does not merely store or transmit an Organization's information, it generates new content from it. Securing this capability means ensuring that generation never becomes a path around the protections this chapter has otherwise established.

The foundation of this section is a single, already-stated architectural fact, repeated here because everything else in this section depends on it: AI is an assistive capability, never an autonomous decision-maker. It does not act on ClientSphere's behalf; it produces a suggestion for a User to accept, revise, or discard. AI security, understood this way, is not a separate security domain requiring its own authorization model — it is the existing system security described in Sections 6.2 through 6.5, applied to a capability that happens to involve an external generative service, with one additional, non-negotiable constraint: AI must never be permitted to bypass a business rule that would otherwise govern the action it is assisting with.

**6.7.2 Authorized Use of AI Features**

Every AI-assisted operation described in Chapter 5 (Section 5.13) is available only to an authenticated User, evaluated through the exact same sequence described in Section 6.5.2 before the Gemini API is ever invoked. Role-based authorization applies without modification: a User's ability to request the AI Task Description Generator, the AI Project Summary, or the AI Comment Summarizer depends entirely on whether that User already holds the authority to create or edit the Task, view the Project, or view the Comment thread in question.

Organization boundary enforcement holds here exactly as it does everywhere else in this chapter — an AI-assisted request never draws on, or produces output informed by, information belonging to an Organization other than the requesting User's own. Client role restrictions apply identically, per Section 5.13.4: a Client-role User requesting a Comment summary receives one built only from the Client-visible portion of a discussion, never the internal layer beneath it, because the AI Services API introduces no visibility an ordinary request would not already grant. This is the central design commitment of this entire section: AI inherits existing permissions rather than introducing new ones, and no operation in Chapter 5 grants a User broader reach by virtue of an AI feature being involved.

**6.7.3 Protection of Information Shared with AI**

Project information, Task information, and Comments shared with the Gemini API for the purpose of generating a summary or a description are limited strictly to what the requesting operation requires, and no more. This reflects a data minimization principle applied consistently across all three approved capabilities: the AI Project Summary draws on the Project and its related Tasks and Activity Log entries, per Chapter 5 (Section 5.6.5), not on unrelated Projects or Clients elsewhere in the Organization; the AI Comment Summarizer draws only on the specific thread it is asked to summarize, per Section 5.8.6, not on the Organization's broader collaboration history.

Organizational information more generally — a User's identity, an Organization's configuration, or data belonging to a different Client or Project — is never shared with the Gemini integration as part of fulfilling a Task, Project, or Comment request, since none of it is relevant to what any of the three approved capabilities are designed to produce. This controlled interaction with an external AI service mirrors the same mediated-access principle already established for Cloudinary in Section 6.6.5: the backend decides precisely what context is shared, request by request, rather than exposing broader access that the AI service itself might otherwise be trusted to limit on its own.

**6.7.4 Reliability and Safe Operation**

Every AI-assisted capability described in this SRS is optional functionality layered onto an already-complete set of Task, Project, and Comment operations, never a required step within them. This is what makes graceful degradation possible: should the Gemini API become unavailable, per Chapter 2 (Section 2.2) and reaffirmed throughout Chapter 5 (Sections 5.6.5, 5.7.2, and 5.8.6), only the three assistive operations themselves are affected. A User unable to reach the AI Comment Summarizer remains fully able to read the underlying Comment thread directly.

This independence of core business operations from an optional external dependency is a direct expression of the reliability objective established in Chapter 1 (NFR-4): the platform's essential value — coordinating Client work through Projects, Tasks, and Comments — must never be held hostage to the availability of a capability that exists only to make that coordination faster or more convenient.

**6.7.5 AI Output Governance**

Content generated by the Gemini integration is treated, without exception, as a suggestion rather than a conclusion. It requires human review before adoption — a User must explicitly save a generated Task description, or explicitly act on a generated summary, before it has any lasting effect anywhere in the system, exactly as described in Chapter 5 (Section 5.13.5). No operation described anywhere in this SRS allows AI-generated content to modify business data automatically; the distinction between proposing and deciding, drawn throughout Chapter 5, is treated as an absolute one here, not a matter of degree.

AI never overrides authorization and never replaces a business rule: a User who lacks permission to edit a Task gains none by requesting AI assistance with it, and a status transition an AI-generated suggestion might imply is still subject to the exact same validity rules established in Chapter 4 (FR-TASK-024). Accountability is preserved throughout, because every action ultimately taken — saving a description, applying a summary elsewhere, acting on advice a summary contained — remains attributable to the User who chose to act on it, per the Activity Log principles established in Section 5.12; the Gemini integration itself is never the recorded actor behind any change to ClientSphere's stored data.

**6.7.6 AI Security Design Considerations**

Separation of concerns keeps this section coherent: the Gemini integration is confined to the isolated service wrapper described in Chapter 2 (Section 2.4.3), and nothing in this section grants it a role in authorization, validation, or business logic, all of which remain exactly where Sections 6.3 through 6.5 already placed them. Consistent authorization, applied identically across all three approved capabilities, ensures that AI assistance never becomes an exception to the rules this chapter has established for every other operation in the system.

Maintainability and future extensibility follow from the same reasoning already applied to external services throughout this chapter: because AI inherits rather than duplicates authorization, and because its output is advisory rather than authoritative, a future refinement to how Gemini is invoked would touch only the isolated integration layer, not the security principles this section depends on. Protection of organizational information remains paramount throughout, and alignment with the earlier architectural principles established across this chapter is total — nothing about AI integration has required this SRS to introduce a new security concept, only to apply its existing ones to a capability that happens to involve generated content.

Secure AI integration, in this sense, strengthens ClientSphere's productivity exactly as intended in Chapter 1, without loosening any protection this chapter has built. The three approved capabilities make Task creation, Project reporting, and Comment review faster, while the authorization, data protection, and accountability principles established throughout this chapter continue to govern every action a User ultimately takes — AI assists the work; it never becomes a second, less-scrutinized way of doing it.

---

### 6.8 Communication Security

**6.8.1 Communication Security Overview**

ClientSphere is, at its core, a platform built around communication — between a User and the system that serves them, between the system and the external services it depends on, and among the team members and Clients whose collaboration the platform exists to support. Every one of these exchanges carries information deserving the same protection this chapter has already described for data at rest, and this section addresses what secure communication means for each of them in turn.

The frontend and backend described in Chapter 2 exchange information constantly, from the moment a User authenticates through every subsequent Task, Project, or Comment operation described in Chapter 5. The backend, in parallel, communicates outward to Google OAuth, Cloudinary, and the Google Gemini API. Real-time delivery, per Chapter 2 (Section 2.8), adds a third channel entirely, carrying Notifications and live updates to Users as they occur. None of these channels exist in isolation from the security architecture already established in Sections 6.1 through 6.7 — communication security is simply that architecture examined from the perspective of information in motion rather than information at rest.

The relationship between communication security and the rest of this chapter is one of extension rather than addition. Authentication, authorization, and data protection describe what happens to a request once it has arrived and been evaluated; communication security describes the condition of that request, and of the response returned to it, for the entire interval it spends traveling between two parties. A system could enforce every authorization rule this chapter describes with perfect consistency and still fail its Users if the information exchanged along the way were left exposed in transit — which is why this section treats communication as a distinct concern deserving its own explicit reasoning, even though it draws on principles already established elsewhere in this chapter.

**6.8.2 Secure Internal Communication**

Interaction between the presentation, business logic, and data layers described in Chapter 2 (Section 2.2) is controlled at every boundary rather than left open once a User's identity has been established. The frontend communicates with the backend only through the API contract described in Chapter 5, never reaching the business logic, data access, or external service layers directly, exactly as the layered architecture in Chapter 2 intends.

This separation is itself a communication protection, not merely a structural convenience. Because the frontend never holds a direct channel to MongoDB, Cloudinary, or the Gemini API, per Chapter 2 (Section 2.3.4), there is no internal exchange a User's own browser could observe or manipulate beyond the single, mediated channel the backend exposes. Every internal exchange between layers therefore happens within a boundary the User's own request never crosses, preserving the architectural separation established in Chapter 2 as a security property in its own right.

**6.8.3 Secure External Service Communication**

Communication with Google OAuth, described functionally in Chapter 4 (FR-AUTH-005), with Cloudinary, described in Chapter 2 (Section 2.7), and with the Google Gemini API, described in Chapter 2 (Section 2.2), shares a single defining property: it is backend-mediated only. No external service ever communicates directly with a User's own client application on ClientSphere's behalf, and no User ever holds credentials capable of reaching one of these services independently of the backend.

This mediation is what preserves organizational information despite the platform's reliance on services it does not itself operate. An identity assertion from Google is verified by the backend before any session is established; a file reaches Cloudinary only after the backend has authorized the upload; a Project or Comment shared with the Gemini API is limited to exactly what the requesting operation requires, per Section 6.7.3. System security is preserved across every one of these integrations precisely because none of them is trusted with more than the backend deliberately extends to it, request by request.

**6.8.4 Real-Time Communication Security**

The Socket.io layer described in Chapter 2 (Section 2.8) carries the same authorization discipline as every REST operation described in Chapter 5, rather than a relaxed variant of it. A real-time connection is established only after authentication, and every event delivered across it is evaluated against the same organizational isolation and role-based scoping already described in Section 6.3 before it ever reaches a connected User.

Project-level visibility governs which Users receive a given real-time event, mirroring the scoped delivery already established in Chapter 2 (Section 2.8.2): a Task status change is delivered only to Users already authorized to view that Task, and a Notification, per Section 5.10.5, is delivered only to its single named recipient regardless of how many other Users might be connected at the same moment. Protection against unauthorized event visibility is total in this respect — a Client-role User's real-time connection carries no broader awareness of internal-only Comments or Files than a direct request for the same information would. Consistency with REST authorization is not a coincidental resemblance; it is the same underlying authorization evaluated once and honored identically regardless of which channel ultimately delivers the result.

**6.8.5 Communication Security Design Considerations**

Confidentiality and integrity remain the two properties every channel described in this section must uphold, whether that channel connects a User to the backend, the backend to an external service, or the backend to a Notification's eventual recipient. Consistency across these channels is what makes the protection meaningful — a real-time event held to a lesser standard than its REST equivalent would create exactly the kind of gap the layered protection described in Section 6.1.5 exists to prevent.

Maintainability and scalability follow the same reasoning already applied elsewhere in this chapter: because every channel enforces the same authorization discipline rather than a channel-specific variant, extending communication to a future capability inherits this protection automatically. Secure communication, in the end, is what allows ClientSphere's collaborative purpose to be fulfilled without compromise — a Client conversing with their service team, a team coordinating in real time, and a backend relying on external services all depend on channels that are trustworthy precisely because they are held to the same standard as everything else this chapter has described.

---

### 6.9 Audit Logging & Monitoring

**6.9.1 Audit Logging Overview**

Accountability, introduced as a security objective in Section 6.1.2, depends on more than the authorization rules that govern a given moment — it depends on a durable record of what was actually done once that moment has passed. This is the role the Activity Log entity, described in Chapter 3 (Section 3.4.9) and given its full conceptual API contract in Chapter 5 (Section 5.12), plays within ClientSphere's security architecture: it is the mechanism through which the platform's stated protections remain verifiable after the fact, not merely trusted in the moment.

This supports organizational governance in a direct sense — an Administrator overseeing their Organization's use of ClientSphere can rely on the Activity Log to answer questions about who changed a Client's status, reassigned a Task, or altered a User's role, without depending on memory or informal explanation. Traceability of every significant operation described throughout Chapters 4 and 5 is what makes this governance possible, and it is why the Activity Log recurs throughout this SRS as the connective thread tying every resource's history together.

**6.9.2 Audit Logging Principles**

Every significant action described in this SRS — creation, modification, status change, reassignment, archival, or deletion — produces a corresponding Activity Log entry automatically, per the recording principle already established in Section 5.12.2. Identity attribution is inseparable from this recording: an entry that could not be traced to a specific acting User would provide none of the accountability this section exists to support.

Chronological history preserves not merely that something occurred but the sequence in which related events unfolded, a property already emphasized in Section 5.12.3. Organizational ownership applies to audit entries exactly as it applies to every other resource described in this chapter — an entry belongs to the Organization in which the action occurred and is never visible outside it. Integrity of these historical records is absolute: an entry, once created, is never altered or removed, per Chapter 3 (Section 3.8.6), and this consistency holds throughout the system rather than varying by resource type or acting role.

**6.9.3 Security Monitoring**

Beyond the resource-specific Activity Log entries already described throughout this SRS, certain categories of activity carry particular security relevance and warrant attention as a class rather than only as individual entries. Authentication events — successful logins, failed attempts, and password changes — are significant precisely because they mark the boundary this chapter has repeatedly identified as foundational; unusual patterns among them, such as repeated failed attempts against a single account already addressed functionally in Chapter 4 (FR-AUTH-018), are exactly the kind of activity an Organization benefits from being able to recognize.

Authorization failures deserve similar attention, since a pattern of repeated, unsuccessful attempts to reach a resource outside a User's permitted scope may indicate something worth an Administrator's awareness beyond any single rejected request. Administrative operations — role changes, deactivations, and Organization-level configuration changes — carry a similarly elevated significance, given the broader consequence such actions can have relative to ordinary Project or Task activity. System awareness, built from these categories collectively, gives an Organization a security-relevant view of its own platform usage without requiring any capability beyond what the Activity Log and its underlying recording principles already provide.

This monitoring capability is deliberately built from information the system already records rather than a separate observation mechanism layered on top of it. Because authentication events, authorization failures, and administrative operations already produce Activity Log entries under the principles established in Section 6.9.2, security-relevant awareness does not require ClientSphere to track anything beyond what its ordinary operation already generates — it requires only that these particular categories of entry be recognized as carrying a security significance distinct from routine Project or Task activity, and treated with the corresponding attention that significance warrants.

**6.9.4 Audit Information Protection**

The Activity Log's value depends entirely on its own trustworthiness, which is why audit records receive protection at least as strict as the information they describe. Visibility into an Activity Log entry is restricted to Users authorized to view the entity or action it concerns, per Section 5.12.4, never disclosed more broadly merely because the information happens to be historical rather than current.

Prevention of unauthorized modification is total rather than merely discouraged: no operation described anywhere in this SRS permits an existing Activity Log entry to be altered, by any role, under any circumstance. This is what gives the Activity Log its long-term trustworthiness — a record that could be revised after the fact by the very role most likely to be its subject would defeat the purpose of maintaining one at all. A clear separation is preserved between operational data, which is expected to change as work progresses, and audit history, which is expected never to change once written; conflating the two would compromise the very property that makes audit information useful in the first place.

**6.9.5 Audit Logging Design Considerations**

Accountability and transparency are two sides of the same design goal: an Organization's team should be able to trust that their actions are recorded accurately, and an Administrator should be able to trust that the record they consult is complete. Maintainability follows from the automatic, action-triggered recording already described in Section 6.9.2 — because no entry depends on a User remembering to document anything, the system's audit trail requires no ongoing manual diligence to remain accurate.

Organizational trust is built directly on this foundation, since a platform whose history could be quietly altered would not be a platform an Organization could safely rely on to mediate its Client relationships. Support for future investigation is what gives this trust lasting value — a question raised long after an action occurred can still be answered, because nothing about the Activity Log's design depends on how soon after an event the question happens to be asked. Alignment with the security objectives established in Section 6.1.2 is complete: audit logging strengthens ClientSphere's security not by preventing every possible failure, but by ensuring that whatever does occur can always be traced, attributed, and understood after the fact.

---

### 6.10 Security Design Principles

**6.10.1 Principle of Least Privilege**

Every role described in Chapter 1 — Administrator, Manager, Employee, and Client — is granted the minimum permission its responsibility actually requires, never more. Role-based permissions already established in Section 6.3.2 reflect this directly, and Client restrictions, discussed at length in Section 6.3.5, represent this principle at its most visible: an external party's access is narrowed to exactly what a service relationship requires, and nothing an internal team member would otherwise hold. Resource-level access, inherited throughout Chapter 5 rather than granted broadly, keeps this principle consistent down to the level of an individual Task or File. The result is a reduced attack surface throughout the system — no account, regardless of role, holds authority beyond what its legitimate purpose demands, which limits what any single compromised credential could actually accomplish.

**6.10.2 Defense in Depth**

No single mechanism in this chapter is trusted to carry ClientSphere's security on its own. Authentication establishes identity; authorization determines what that identity may do; data protection safeguards information regardless of who is currently interacting with it; validation catches malformed or inconsistent input before it reaches persistence; monitoring, per Section 6.9.3, surfaces patterns worth an Organization's attention; and communication security, per Section 6.8, protects information as it moves between every layer described in Chapter 2. Each of these layers functions independently of the others, so that a weakness in any single one does not, by itself, compromise the platform as a whole.

Consider what this layering means in practice for a single hypothetical lapse: were an authorization check for a single resource ever mistakenly omitted, the request would still first have had to clear authentication, still have had to satisfy organizational isolation, and would still leave a trace in the Activity Log described in Section 6.9 the moment it took effect. No individual layer is asked to be perfect on its own, because the layers behind it remain in place regardless of whether the one in front held.

**6.10.3 Separation of Responsibilities**

Authentication, authorization, business logic, data management, AI integration, file management, and monitoring each remain distinct concerns throughout this SRS, never blended into a single, undifferentiated security mechanism. This separation is not merely organizational tidiness — it is what allows each concern to be reasoned about, and if necessary revised, independently of the others. A refinement to how Gemini requests are mediated, per Section 6.7.6, touches the AI integration layer alone; a refinement to file access, per Section 6.6.6, touches file management alone. Responsibilities remain independent precisely so that the system's security as a whole does not depend on any one of them being perfectly intertwined with the rest.

**6.10.4 Secure by Design**

Security in ClientSphere was never a capability added after the fact; it is integrated into the architecture described in Chapter 2, the data model described in Chapter 3, and the functional requirements described in Chapter 4 from their initial conception. This is why this chapter has so consistently found itself explaining reasoning already implicit in earlier chapters rather than introducing new mechanisms — organizational isolation, scoped authorization, and referential integrity were security decisions from the moment they were first described, not features retrofitted with protective intent. Consistency across every module follows directly, and long-term maintainability follows in turn: a system secure by design does not accumulate protective patches over time, because its foundational structure already anticipated the protection this chapter describes.

**6.10.5 Scalability and Maintainability**

Security in ClientSphere is built to remain effective as an Organization's own use of the platform grows, and as the platform itself is extended with future capability. Consistent authorization, applied identically regardless of how many Clients, Projects, or Users an Organization accumulates, ensures that scale never becomes an excuse for relaxed enforcement. The modular architecture described in Chapter 2 (Section 2.4.2) keeps this manageable: a future addition, per Chapter 3 (Section 3.9.5), inherits the same authorization and data protection principles automatically, easing future enhancement without requiring this chapter's reasoning to be reconstructed from scratch. This is the same architectural philosophy that has guided every chapter of this SRS, applied here specifically to the question of security holding steady over time.

**6.10.6 Security Principles Summary**

Least privilege, defense in depth, separation of responsibilities, secure-by-design architecture, and deliberate attention to scalability and maintainability are not five independent ideas competing for attention — they are five expressions of a single underlying commitment: that ClientSphere's protection should never depend on any one safeguard, any one role's restraint, or any one moment of correct enforcement. Together, they are what allow every security decision described throughout this chapter, from the narrowest Client visibility rule to the broadest organizational isolation boundary, to be trusted as more than an isolated precaution.

---

### 6.11 Chapter Summary

This chapter has described ClientSphere's security architecture as a single, coherent discipline rather than a checklist of isolated protections. It began with a security overview establishing confidentiality, integrity, availability, accountability, least privilege, defense in depth, and secure-by-default principles as the objectives every subsequent section would serve, and it proceeded through authentication and authorization as the twin boundaries — identity and permission — on which every other protection depends. Data protection extended that reasoning across the complete lifecycle of an Organization's information, while API security, file storage security, and AI integration security each applied the same underlying principles to the specific surfaces through which Users, files, and generated content actually reach the system. Communication security carried this protection into information in motion, and audit logging closed the chapter by ensuring that everything this architecture protects remains verifiable after the fact, not merely trusted in the moment.

Across all ten sections, one theme has recurred deliberately: security in ClientSphere is not a standalone feature bolted onto a finished system. It is embedded in the modular architecture established in Chapter 2, the referential integrity and organizational isolation established in Chapter 3, the scoped functional requirements established in Chapter 4, and the inherited authorization running through every API described in Chapter 5. This chapter has introduced no mechanism those earlier chapters had not already anticipated — it has stated, explicitly and in one place, the reasoning that connects them.

This reasoning supports the objectives established at the very beginning of this SRS. The security, reliability, and data isolation non-functional requirements described in Chapter 1 (Section 1.7) are not aspirations this chapter merely gestures toward; they are the direct product of the organizational isolation described in Section 6.4.2, the layered authentication and authorization described in Sections 6.2 and 6.3, and the accountability the Activity Log provides throughout Section 6.9. A platform that satisfies these principles is one capable of holding the trust Chapter 1 identified as the entire premise of ClientSphere's value to a service-based business.

With the system's architecture, data model, functional requirements, API contract, and security posture now fully established, this SRS turns next to how ClientSphere is deployed, verified, and maintained in production — the practical considerations that carry everything this document has defined from specification into a system a service-based business can actually rely on.

---

**End of Chapter 6.**
