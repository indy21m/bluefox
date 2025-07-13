### **Project Title:** BlueFox - An Intelligent Survey Platform for ConvertKit Segmentation

### **Project Kick-off Instructions:**

- **Design Source of Truth**: This project's aesthetic is paramount. In the project's root, you will find two folders:
    
    - `/start`: Contains screenshots of our primary inspiration, RightMessage. Use these to guide the layout, user flow, and overall feel of the survey experience.
        
    - `/penguin`: Contains the "Penguin Sensei" style guidelines. Adhere to these for typography, color palettes, component styling, and spacing. The final app must be beautiful, modern, and professional.
        
- **Security Warning**: The ConvertKit API Key provided below is for reference only. In the implementation, it **must** be stored as an environment variable (`CONVERTKIT_API_KEY`) and **never** hardcoded into the frontend or committed to git.
    

### **🎯 Core Objective**

Build a production-grade survey platform that replicates the core segmentation functionality of "Right Message." The primary goal is to create one-question-per-screen surveys that intelligently segment subscribers by mapping their answers directly to **ConvertKit custom fields**.

### **🔑 Key Features**

1. **RightMessage-Style Survey Flow**: A seamless, one-question-per-screen experience with automatic advancement.
    
2. **Conditional Logic Engine**: Build intelligent survey paths where the next question is determined by the previous answer.
    
3. **Direct Custom Field Mapping**: Map specific survey answers to predefined values within your ConvertKit custom fields.
    
4. **Multi-Survey Architecture**: Create and manage distinct surveys for different audiences.
    
5. **Professional Admin Dashboard**: A secure interface to build surveys, create logic, and manage ConvertKit settings, strictly following the `/penguin` and `/start` design guides.
    
6. **ConvertKit v4 API Integration**: Utilize the latest ConvertKit API for robust and secure communication.
    

### **🛠 Technical Stack & Deployment**

- **Frontend**: **React 18** with **TypeScript** and **Vite**.
    
    - **Deployment**: The static frontend build will be deployed to **Kinsta Static Site Hosting**.
        
- **Backend**: A lightweight **Node.js Express API**. This will be a simple server to securely handle ConvertKit communication.
    
    - **Deployment**: The Node.js Express API will be deployed as a service on **Kinsta Application Hosting**. This keeps all project assets within your Kinsta account.
        
- **Branding**: **BlueFox** brand identity with a sleek blue fox logo and a blue-to-purple gradient theme, as defined in the `/penguin` style guide.
    

### **📋 Implementation Plan**

#### **Phase 1: Foundation & Architecture (Kinsta Ready)**

1. **Project Setup**: Initialize a React + TypeScript + Vite project.
    
2. **Design System**: Implement the core React components based on the `/penguin` style guide.
    
3. **Type Definitions**: Create detailed TypeScript types for `Survey`, `Question`, `Answer`, etc.
    
4. **Routing**: Set up `React Router` for the survey-taking flow and the admin dashboard.
    

#### **Phase 2: The Survey-Taker Experience**

5. **Survey Component**: Build the primary one-question-per-screen survey component, mirroring the UX from the `/start` screenshots.
    
6. **Auto-Advance**: Implement a `useEffect` hook that automatically proceeds to the next question after a 500ms delay.
    
7. **Progress Indicator**: Create a minimalist progress bar.
    
8. **Conditional Logic**: Implement the client-side logic engine.
    

#### **Phase 3: Admin Dashboard**

9. **Authentication**: Create a simple, secure authentication system for the admin dashboard.
    
10. **Survey Builder**: Develop an intuitive drag-and-drop interface for creating surveys.
    
11. **Visual Logic Builder**: Design a UI to visually map conditional logic.
    
12. **ConvertKit Integration UI**:
    
    - Create a settings page for the admin to input their ConvertKit API Key.
        
    - **Fetch Custom Fields**: Implement a feature that calls the backend to fetch all available custom fields from the user's ConvertKit account (`GET /v4/custom_fields`).
        

#### **Phase 4: ConvertKit API Integration (Node.js Backend on Kinsta) - VERIFIED**

13. **Node.js Express API Setup**: Create a simple Node.js Express server with an endpoint like `/api/update-subscriber`.
    
14. **Secure API Key Handling**: On Kinsta, set an environment variable named `CONVERTKIT_API_KEY` with the value `kit_25f337ff207d24a2bad6c541c1dedfbb`. The Node.js app will access this key using `process.env.CONVERTKIT_API_KEY`.
    
15. **API Endpoint Logic**: The `/api/update-subscriber` endpoint will receive the subscriber's email and survey answers and perform the following sequence:
    
    - **Find Subscriber**: Find the subscriber's ID with a `GET` request to `https://api.convertkit.com/v4/subscribers?api_key=<YOUR_KEY>&email_address=<USER_EMAIL>`.
        
    - **Update Custom Fields**: Use the subscriber's ID to update their custom fields with a `PUT` request. **(Correction Applied)** The `api_key` must be in the URL, not the body.
        
    
    **Example `PUT` request (inside your Node.js code):**
    
    JavaScript
    
    ```
    // In your Node.js Express route handler
    const apiKey = process.env.CONVERTKIT_API_KEY;
    const subscriberId = '...'; // from the GET request
    const fieldsToUpdate = { ... }; // from the frontend
    
    // CORRECTED: The api_key is a query parameter in the URL.
    const url = `https://api.convertkit.com/v4/subscribers/${subscriberId}?api_key=${apiKey}`;
    
    await fetch(url, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      // CORRECTED: The request body ONLY contains the fields to update.
      body: JSON.stringify({
        fields: fieldsToUpdate
      })
    });
    ```
    

#### **Phase 5: Final Polish & Deployment to Kinsta**

16. **Branding**: Fully integrate the BlueFox branding as per the design guides.
    
17. **Responsiveness**: Ensure a flawless experience on all devices.
    
18. **Error Handling**: Implement robust error handling for API failures.
    
19. **Deployment**:
    
    - Configure the React frontend for deployment on **Kinsta Static Site Hosting**.
        
    - Configure the Node.js Express API for deployment on **Kinsta Application Hosting**. Ensure the `CONVERTKIT_API_KEY` environment variable is set in the Kinsta dashboard.