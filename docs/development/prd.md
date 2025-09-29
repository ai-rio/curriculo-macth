Certainly. Here is the complete Product Requirements Document (PRD) in raw markdown format.

---

## **Product Requirements Document (PRD)**

### **1. Goals and Background Context**

- **Goals:**
  - **Business:** Acquire 100 paying customers within the first three months of launch to validate the business model.
  - **User:** Achieve a user-reported interview invitation rate of 25% or higher, demonstrating clear value to the user.
- **Background Context:**
  The service will address a gap in the Brazilian job market where qualified professionals are often rejected by automated systems (ATS) due to poorly tailored résumés. The MVP will be a responsive web app offering a one-time, paid, AI-driven résumé optimization service. The core value proposition is to provide a strategically rewritten résumé with unparalleled precision, going beyond simple keyword matching to align a candidate's experience with a specific role's demands.

### **2. Requirements**

- **Functional Requirements (FR):**
  1.  `FR1`: Users must be able to create an account and log in using an email and password.
  2.  `FR2`: The system must provide a "Forgot Password" flow for users to reset their password via email.
  3.  `FR3`: Authenticated users must be able to upload a résumé file in PDF or DOCX format.
  4.  `FR4`: Authenticated users must be able to submit a job description by pasting text.
  5.  `FR5`: After uploading, the user must be presented with a confirmation step before proceeding to payment.
  6.  `FR6`: The system must process a one-time payment before delivering the final résumé.
  7.  `FR7`: The core AI engine must generate an optimized résumé.
  8.  `FR8`: The final optimized résumé must be available for download in `.docx` format.
- **Non-Functional Requirements (NFR):**
  1.  `NFR1`: The user interface and all communication must be localized for the Brazilian market (pt-BR).
  2.  `NFR2`: All user data must be encrypted in transit and at rest, with a clear Privacy Policy compliant with LGPD.
  3.  `NFR3`: The platform must be responsive and functional on modern desktop and mobile web browsers.
  4.  `NFR4`: The service must maintain high availability and minimal processing latency during Brazilian business hours.

### **3. User Interface Design Goals**

- **Overall UX Vision:** The user experience must be clean, professional, and straightforward. It should inspire confidence and feel like a premium, expert service. The user should feel guided and secure throughout the process.
- **Key Interaction Paradigms:** The core interaction will be a simple, linear "wizard-style" flow.
- **Core Screens:**
  - Landing Page
  - Sign-Up Page
  - Login Page
  - Forgot Password Page
  - A simple User Dashboard to initiate the process.
  - Payment Page/Modal.
  - Results Page with download link.
- **Accessibility:** The interface will adhere to **WCAG 2.1 AA** standards.
- **Branding:** To be defined, but the overall aesthetic should be modern, professional, and trustworthy.

### **4. Technical Assumptions**

- **Repository Structure:** The project will be structured as a **Monorepo**, adhering to the existing patterns of the original codebase to simplify development and code sharing.
- **Service Architecture:** The backend will be a **Monolithic** service. This is the most straightforward and fastest approach to deliver the MVP.
- **Testing Requirements:** The project will require **Unit and Integration tests** to ensure code quality and system stability for the initial launch.

### **5. Epic List**

- **Epic 1: End-to-End MVP User Workflow**
  - **Goal:** A new user can successfully sign up, submit their résumé and a job description, pay for the service, and receive a downloadable, AI-optimized `.docx` résumé.

### **6. Epic Details: Stories & Acceptance Criteria**

- **Story 1.1: Project Foundation**
  - **As a** developer, **I want** a monorepo set up with a basic Next.js frontend and FastAPI backend, **so that** I have a foundation to build the service on.
  - **Acceptance Criteria:**
    1.  A monorepo structure is initialized using `npm workspaces`.
    2.  An `apps/frontend` directory contains a default Next.js 15+ application.
    3.  An `apps/backend` directory contains a default FastAPI application structure.
    4.  Root-level `npm` scripts exist to install dependencies and run both frontend and backend servers concurrently (`npm run dev`).
    5.  The backend server runs on port 8000 and exposes a basic `/ping` health check endpoint that returns a `200 OK` status.
    6.  The frontend server runs on port 3000 and successfully renders a placeholder page.
- **Story 1.2: Complete User Authentication**
  - **As a** user, **I want** to be able to create an account, log in, and reset my password, **so that** I have secure and reliable access to the service.
  - **Acceptance Criteria:**
    1.  A user can navigate to a "Sign Up" page and create a new account using an email address and a password.
    2.  Upon successful sign-up, a new user is created in the Supabase backend, and the user is automatically logged in and redirected to the main dashboard page.
    3.  The system prevents sign-ups with an email address that is already registered and displays a clear error message.
    4.  A registered user can navigate to a "Login" page and sign in with their correct credentials.
    5.  Upon successful login, the user is redirected to the main dashboard page.
    6.  If a user attempts to log in with incorrect credentials, a clear error message is displayed.
    7.  From the login page, a user can initiate a "Forgot Password" flow by entering their email address.
    8.  The system (via Supabase) sends a password reset link to the user's registered email.
    9.  A logged-in user can find and use a "Logout" button to securely end their session and be redirected to the landing page.
- **Story 1.3: Document Submission & Payment**
  - **As a** logged-in user, **I want** to upload my résumé, paste a job description, and pay for the service, **so that** I can initiate an optimization request.
  - **Acceptance Criteria:**
    1.  The main dashboard for a logged-in user displays a file upload component and a text area for the job description.
    2.  The file upload component only accepts `.pdf` and `.docx` files up to a 2MB size limit.
    3.  The user receives clear visual feedback if they attempt to upload an invalid file type or a file that is too large.
    4.  A "Proceed to Payment" button is disabled until a valid résumé file is successfully uploaded AND text is present in the job description field.
    5.  Clicking "Proceed to Payment" initiates the Stripe payment flow.
    6.  Upon successful payment, the user is redirected to a results page (which can initially show a "Processing..." state).
    7.  If the payment fails or is canceled, the user is returned to the submission page with their file and text still in place, with a clear error message.
- **Story 1.4: AI Processing & Results**
  - **As a** paying user, **I want** the system to process my inputs, generate an optimized résumé, and make it available for download as a `.docx` file on a results page, **so that** I can receive the final product I paid for.
  - **Acceptance Criteria:**
    1.  After a successful payment, the backend securely retrieves the user's submitted résumé and job description to begin processing.
    2.  The core AI engine is triggered to generate the optimized résumé text.
    3.  The system converts the final AI-generated text into a `.docx` file.
    4.  The user is shown a loading or "Processing..." state on the results page while the AI is working.
    5.  Once processing is complete, the results page updates to display the full text of the newly optimized résumé.
    6.  A prominent "Download" button is visible and enabled on the results page.
    7.  Clicking the "Download" button successfully downloads the generated `.docx` file to the user's device.
    8.  If the AI processing or file generation fails, the user is shown a clear error message and provided with instructions for support.

---

This document is finalized and ready for the development phase.
