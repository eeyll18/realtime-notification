# Real-Time Notification System (React, Node.js, Socket.IO)

This project is a full-stack real-time notification application demonstrating the integration of React for the frontend, Node.js with Express for the backend, Socket.IO for real-time communication, and MongoDB for data persistence.

## Features

**User Authentication:** Secure registration and login for users (JWT-based).
*   **Role-Based Access Control:** Differentiates between 'user' and 'admin' roles.
*   **Real-Time Notifications:**
    *   Admins can send notifications to all connected users.
    *   Admins can send notifications to specific users.
    *   Users receive notifications instantly without needing to refresh the page.
*   **User-Specific Notifications:** Notifications can be targeted to individual users.
*   **Notification Persistence:** Notifications are stored in a MongoDB database.
