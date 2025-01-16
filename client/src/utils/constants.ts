export const projects = [
    {
        id: 1,
        name: "AR Inventory Management System",
        repo_link: "http://github.com/Agnish1611/ar-inventory-management-system",
        description: "An AR-based inventory management system that tracks and manages inventory in real-time using augmented reality.",
        technologies: ["React", "Node.js", "MongoDB", "AR.js"],
        commits: [
            {
                id: "v1a2b3",
                message: "Initialized project with React and Node.js setup",
                date: "2025-01-01",
                author: "Charlie Green",
                branch: "main",
            },
            {
                id: "c4d5e6",
                message: "Configured MongoDB for inventory data storage",
                date: "2025-01-02",
                author: "Diana Blue",
                branch: "main",
            },
            {
                id: "f7g8h9",
                message: "Integrated AR.js for augmented reality visualization",
                date: "2025-01-03",
                author: "Charlie Green",
                branch: "feature/ar-integration",
            },
            {
                id: "i0j1k2",
                message: "Developed API endpoints for CRUD operations on inventory",
                date: "2025-01-04",
                author: "Diana Blue",
                branch: "feature/api-crud",
            },
            {
                id: "l3m4n5",
                message: "Implemented user authentication and role-based access control",
                date: "2025-01-05",
                author: "Charlie Green",
                branch: "feature/auth",
            },
            {
                id: "o6p7q8",
                message: "Added real-time stock update feature using WebSockets",
                date: "2025-01-06",
                author: "Diana Blue",
                branch: "feature/websockets",
            },
            {
                id: "r9s0t1",
                message: "Optimized AR rendering for better performance",
                date: "2025-01-07",
                author: "Charlie Green",
                branch: "refactor/ar-performance",
            },
            {
                id: "u2v3w4",
                message: "Enhanced UI/UX for seamless user interaction",
                date: "2025-01-08",
                author: "Diana Blue",
                branch: "feature/ui-enhancements",
            }
        ],
        documentation: {
            overview: "This project implements an AR-based inventory management system designed to enhance productivity and accuracy by leveraging augmented reality for inventory tracking and management.",
            setup: "1. Clone the repository\n2. Install dependencies using `npm install`\n3. Start the development server with `npm start`",
            features: [
                "Augmented reality-based inventory visualization",
                "Real-time stock updates",
                "Detailed reporting and analytics",
                "Multi-user access with role-based permissions"
            ],
            api: {
                endpoints: [
                    {
                        route: "/api/inventory",
                        method: "GET",
                        description: "Fetch a list of all inventory items"
                    },
                    {
                        route: "/api/inventory/:id",
                        method: "PUT",
                        description: "Update details of a specific inventory item"
                    },
                    {
                        route: "/api/inventory",
                        method: "POST",
                        description: "Add a new inventory item"
                    },
                    {
                        route: "/api/inventory/:id",
                        method: "DELETE",
                        description: "Remove a specific inventory item"
                    }
                ]
            }
        },
        flowchart: `
            graph TD
                A[User] -->|Open AR View| B[Frontend Application]
                B -->|Request Inventory Data| C[API Gateway]
                C -->|Fetch Data| D[Inventory Service]
                D -->|Query| E[Database]
                E -->|Return Inventory Data| D
                D -->|Response| C
                C -->|Send Data| B
                B -->|Render AR Visualization| A
                A -->|Update Inventory| B
                B -->|Send Update| C
                C -->|Update Record| D
                D -->|Persist Changes| E
        `
    },
    {
        id: 2,
        name: "E-commerce Platform",
        repo_link: "http://github.com/Agnish1611/e-commerce-platform",
        description: "A full-featured e-commerce platform with secure payment processing and personalized shopping experiences.",
        technologies: ["React", "Express", "PostgreSQL", "Stripe"],
        commits: [
            {
                id: "x1y2z3",
                message: "Initialized project with React and Express setup",
                date: "2025-01-01",
                author: "Charlie Green",
                branch: "main",
            },
            {
                id: "a4b5c6",
                message: "Designed and implemented PostgreSQL schema for products, users, and orders",
                date: "2025-01-02",
                author: "Diana Blue",
                branch: "main",
            },
            {
                id: "d7e8f9",
                message: "Developed product browsing and filtering features",
                date: "2025-01-03",
                author: "Charlie Green",
                branch: "feature/product-filtering",
            },
            {
                id: "g0h1i2",
                message: "Integrated Stripe API for secure payment processing",
                date: "2025-01-04",
                author: "Diana Blue",
                branch: "feature/payment",
            },
            {
                id: "j3k4l5",
                message: "Added user authentication and JWT-based session management",
                date: "2025-01-05",
                author: "Charlie Green",
                branch: "feature/auth",
            },
            {
                id: "m6n7o8",
                message: "Implemented cart functionality with session persistence",
                date: "2025-01-06",
                author: "Diana Blue",
                branch: "feature/cart",
            }
        ],
        documentation: {
            overview: "This project is an e-commerce platform providing a seamless online shopping experience with advanced features like secure payment processing and personalized recommendations.",
            setup: "1. Clone the repository\n2. Install dependencies using `npm install`\n3. Run the server with `npm start`",
            features: [
                "Product browsing and filtering",
                "Secure payment gateway integration",
                "Order tracking and history",
                "User authentication and profiles"
            ],
            api: {
                endpoints: [
                    {
                        route: "/api/products",
                        method: "GET",
                        description: "Retrieve a list of all available products"
                    },
                    {
                        route: "/api/cart",
                        method: "POST",
                        description: "Add a product to the cart"
                    },
                    {
                        route: "/api/orders",
                        method: "POST",
                        description: "Place an order"
                    },
                    {
                        route: "/api/users/login",
                        method: "POST",
                        description: "Authenticate user and generate a token"
                    }
                ]
            }
        },
        flowchart: `
            graph TD
                A[User] -->|Search Products| B[Frontend Application]
                B -->|Request Product Data| C[API Gateway]
                C -->|Fetch Products| D[Product Service]
                D -->|Query| E[Product Database]
                E -->|Return Data| D
                D -->|Send Data| C
                C -->|Send Response| B
                B -->|Display Products| A
                A -->|Add to Cart| F[Cart Service]
                F -->|Update Cart| G[Cart Database]
                A -->|Checkout| H[Payment Gateway]
                H -->|Process Payment| I[Order Service]
                I -->|Create Order| J[Order Database]
        `
    },
    {
        id: 3,
        name: "Smart Home Automation System",
        repo_link: "http://github.com/Agnish1611/smart-home-automation-system",
        description: "An IoT-based smart home automation system for controlling and monitoring home appliances remotely.",
        technologies: ["React", "Node.js", "Raspberry Pi", "MQTT"],
        commits: [
            {
                id: "p1q2r3",
                message: "Initialized project with React and Node.js setup",
                date: "2025-01-01",
                author: "Charlie Green",
                branch: "main",
            },
            {
                id: "s4t5u6",
                message: "Integrated MQTT broker for IoT communication",
                date: "2025-01-02",
                author: "Diana Blue",
                branch: "feature/mqtt",
            },
            {
                id: "v7w8x9",
                message: "Developed device control API endpoints",
                date: "2025-01-03",
                author: "Charlie Green",
                branch: "feature/device-control",
            },
            {
                id: "y0z1a2",
                message: "Added real-time device status monitoring",
                date: "2025-01-04",
                author: "Diana Blue",
                branch: "feature/status-monitoring",
            },
            {
                id: "b3c4d5",
                message: "Implemented user authentication and dashboard",
                date: "2025-01-05",
                author: "Charlie Green",
                branch: "feature/auth-dashboard",
            },
            {
                id: "e6f7g8",
                message: "Optimized system performance for low-latency control",
                date: "2025-01-06",
                author: "Diana Blue",
                branch: "refactor/performance",
            }
        ],
        documentation: {
            overview: "This project is a smart home automation system enabling users to control and monitor their appliances remotely via an IoT-based platform.",
            setup: "1. Clone the repository\n2. Install dependencies using `npm install`\n3. Deploy the MQTT broker and run the server with `npm start`",
            features: [
                "Remote appliance control",
                "Real-time status monitoring",
                "User authentication and role-based access",
                "Energy usage analytics"
            ],
            api: {
                endpoints: [
                    {
                        route: "/api/devices",
                        method: "GET",
                        description: "Retrieve a list of connected devices"
                    },
                    {
                        route: "/api/devices/:id",
                        method: "POST",
                        description: "Send a control command to a specific device"
                    },
                    {
                        route: "/api/status",
                        method: "GET",
                        description: "Fetch the current status of all devices"
                    }
                ]
            }
        },
        flowchart: `
            graph TD
                A[User] -->|Open Dashboard| B[Frontend Application]
                B -->|Request Device Data| C[API Gateway]
                C -->|Fetch Data| D[Device Service]
                D -->|Query| E[Device Database]
                E -->|Return Data| D
                D -->|Send Response| C
                C -->|Send Data| B
                B -->|Display Devices| A
                A -->|Send Control Command| F[MQTT Broker]
                F -->|Relay Command| G[Device Controller]
                G -->|Update Status| H[Device]
                H -->|Send Status| F
                F -->|Update Dashboard| B
        `
    },

    {
        id: 4,
        name: "Online Learning Platform",
        repo_link: "http://github.com/Agnish1611/online-learning-platform",
        description: "A platform for delivering online courses with video streaming, quizzes, and progress tracking.",
        technologies: ["React", "Django", "PostgreSQL", "AWS S3"],
        commits: [
            {
                id: "g1h2i3",
                message: "Initialized project with React and Django setup",
                date: "2025-01-01",
                author: "Charlie Green",
                branch: "main",
            },
            {
                id: "j4k5l6",
                message: "Developed user authentication and profile management",
                date: "2025-01-02",
                author: "Diana Blue",
                branch: "feature/auth-profile",
            },
            {
                id: "m7n8o9",
                message: "Implemented course creation and management",
                date: "2025-01-03",
                author: "Charlie Green",
                branch: "feature/course-management",
            },
            {
                id: "p0q1r2",
                message: "Integrated AWS S3 for video storage",
                date: "2025-01-04",
                author: "Diana Blue",
                branch: "feature/video-storage",
            },
            {
                id: "s3t4u5",
                message: "Added quiz and progress tracking features",
                date: "2025-01-05",
                author: "Charlie Green",
                branch: "feature/quiz-progress",
            },
            {
                id: "v6w7x8",
                message: "Optimized video streaming for low-latency playback",
                date: "2025-01-06",
                author: "Diana Blue",
                branch: "refactor/video-streaming",
            }
        ],
        documentation: {
            overview: "This project is an online learning platform that provides tools for course delivery, quizzes, and student progress tracking.",
            setup: "1. Clone the repository\n2. Install dependencies using `pip install -r requirements.txt` and `npm install`\n3. Start the development server with `python manage.py runserver` and `npm start`",
            features: [
                "Course creation and management",
                "Video streaming with AWS S3",
                "Interactive quizzes",
                "Student progress tracking"
            ],
            api: {
                endpoints: [
                    {
                        route: "/api/courses",
                        method: "GET",
                        description: "Retrieve a list of all courses"
                    },
                    {
                        route: "/api/quiz/:id",
                        method: "POST",
                        description: "Submit quiz answers"
                    },
                    {
                        route: "/api/progress",
                        method: "GET",
                        description: "Fetch student progress data"
                    }
                ]
            }
        },
        flowchart: `
            graph TD
                A[User] -->|Login| B[Authentication Service]
                B -->|Validate User| C[User Database]
                C -->|Response| B
                B -->|Grant Access| D[Frontend Application]
                D -->|Request Course Data| E[API Gateway]
                E -->|Fetch Courses| F[Course Service]
                F -->|Query| G[Course Database]
                G -->|Return Data| F
                F -->|Send Data| E
                E -->|Send Response| D
                D -->|Stream Video| H[AWS S3]
                D -->|Submit Quiz| I[Quiz Service]
                I -->|Update Progress| J[Progress Tracker]
                J -->|Store Data| K[Progress Database]
        `
    },

    {
        id: 5,
        name: "Fitness Tracking App",
        repo_link: "http://github.com/Agnish1611/fitness-tracking-app",
        description: "A mobile app for tracking fitness activities, calories burned, and workout progress.",
        technologies: ["React Native", "Firebase", "Google Maps API"],
        commits: [
            {
                id: "a1b2c3",
                message: "Initialized project with React Native setup",
                date: "2025-01-01",
                author: "Charlie Green",
                branch: "main",
            },
            {
                id: "d4e5f6",
                message: "Integrated Firebase for user authentication and data storage",
                date: "2025-01-02",
                author: "Diana Blue",
                branch: "feature/firebase-integration",
            },
            {
                id: "g7h8i9",
                message: "Implemented activity tracking and calorie calculation",
                date: "2025-01-03",
                author: "Charlie Green",
                branch: "feature/activity-tracking",
            },
            {
                id: "j0k1l2",
                message: "Added Google Maps API for route tracking",
                date: "2025-01-04",
                author: "Diana Blue",
                branch: "feature/route-tracking",
            },
            {
                id: "m3n4o5",
                message: "Enhanced UI/UX for a seamless user experience",
                date: "2025-01-05",
                author: "Charlie Green",
                branch: "feature/ui-enhancements",
            },
            {
                id: "p6q7r8",
                message: "Optimized app performance for lower battery usage",
                date: "2025-01-06",
                author: "Diana Blue",
                branch: "refactor/performance",
            }
        ],
        documentation: {
            overview: "This project is a fitness tracking app designed to help users monitor their workouts, calories burned, and progress over time.",
            setup: "1. Clone the repository\n2. Install dependencies using `npm install`\n3. Start the app with `npm start`",
            features: [
                "Activity and calorie tracking",
                "Route tracking with Google Maps",
                "User authentication with Firebase",
                "Workout progress tracking"
            ],
            api: {
                endpoints: [
                    {
                        route: "/api/activities",
                        method: "GET",
                        description: "Retrieve a list of all tracked activities"
                    },
                    {
                        route: "/api/activities",
                        method: "POST",
                        description: "Log a new activity"
                    },
                    {
                        route: "/api/progress",
                        method: "GET",
                        description: "Fetch user progress data"
                    }
                ]
            }
        },
        flowchart: `
            graph TD
                A[User] -->|Open App| B[Frontend Application]
                B -->|Login| C[Firebase Auth]
                C -->|Validate User| D[Firebase Database]
                D -->|Response| C
                C -->|Grant Access| B
                B -->|Track Activity| E[Activity Tracker]
                E -->|Store Data| D
                B -->|Track Route| F[Google Maps API]
                F -->|Return Route| B
                B -->|Calculate Calories| G[Calorie Calculator]
                G -->|Update Progress| D
        `
    }
];
