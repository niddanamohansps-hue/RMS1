# System Documentation

Welcome to the Recruitment Management System (RMS) Documentation. 
This folder contains detailed technical documentation regarding the backend architecture and its integration with the frontend clients.

## Available Documentation

| Document | Description |
|----------|-------------|
| [API Integration Guide](./api_integration.md) | Details the REST API endpoints and how the `admindashboard` and `careerpage` frontends consume them. Includes details on authentication and data flow. |
| [Database Schema](./database_schema.md) | Outlines the core database models, relationships, and tables used by the Django backend. |
| [API Endpoint Reference](./api_endpoints.md) | Comprehensive reference for all API endpoints, including JSON requests, responses, and authorization roles. |

## Workflow Overview
1. **Frontend Apps**: The system utilizes two independent React frontends. 
   - **Admin Dashboard**: For internal HR administration, role approvals, and applicant tracking.
   - **Career Page**: For external candidates to browse jobs, apply, and complete onboarding.
2. **Backend**: A robust Django REST Framework backend serves both frontends, isolating data access based on user roles (Admin vs. Candidate).
3. **Database**: The relational database ensures strict data integrity between organizational roles, applications, interviews, and candidate profiles.
