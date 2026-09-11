# Project Tree

```
├── .gitattributes
├── .gitignore
├── GymApp.Api
│   ├── Controllers
│   │   ├── Auth
│   │   │   └── AuthController.cs
│   │   ├── Clients
│   │   │   └── ClientsController.cs
│   │   ├── Employees
│   │   │   └── EmployeesController.cs
│   │   ├── Memberships
│   │   │   └── MembershipController.cs
│   │   ├── Users
│   │   │   └── UsersController.cs
│   │   └── Visits
│   │       └── VisitController.cs
│   ├── DTOs
│   │   ├── Auth
│   │   │   ├── LoginDto.cs
│   │   │   └── LoginResponseDto.cs
│   │   ├── Clients
│   │   │   ├── ClientResponceDto.cs
│   │   │   ├── CreateClientDto.cs
│   │   │   └── UpdateClientsDto.cs
│   │   ├── Employees
│   │   │   ├── CreateEmployeeDto.cs
│   │   │   ├── EmployeeResponseDto.cs
│   │   │   ├── TrainerSelectDto.cs
│   │   │   └── UpdateEmployeeDto.cs
│   │   ├── Memberships
│   │   │   ├── CreateMembershipDto.cs
│   │   │   ├── MembershipResponseDto.cs
│   │   │   └── UpdateMembershipDto.cs
│   │   ├── Users
│   │   │   ├── CreateUserDto.cs
│   │   │   └── UserResponseDto.cs
│   │   └── Visits
│   │       ├── CreateVisitDto.cs
│   │       └── VisitResponseDto.cs
│   ├── Data
│   │   └── GymDbContext.cs
│   ├── GymApp.Api.csproj
│   ├── GymApp.Api.http
│   ├── Middleware
│   │   └── ExceptionHandlingMiddleware.cs
│   ├── Models
│   │   ├── Client.cs
│   │   ├── Employee.cs
│   │   ├── Membership.cs
│   │   ├── SystemUser.cs
│   │   └── Visit.cs
│   ├── Program.cs
│   ├── Properties
│   │   └── launchSettings.json
│   ├── Services
│   │   ├── Auth
│   │   │   ├── AuthService.cs
│   │   │   └── IAuthService.cs
│   │   ├── Clients
│   │   │   ├── ClientService.cs
│   │   │   └── IClientService.cs
│   │   ├── Employees
│   │   │   ├── EmployeeService.cs
│   │   │   └── IEmployeeService.cs
│   │   ├── Memberships
│   │   │   ├── IMembershipService.cs
│   │   │   └── MembershipService.cs
│   │   ├── Users
│   │   │   ├── IUserService.cs
│   │   │   └── UserService.cs
│   │   └── Visits
│   │       ├── IVisitService.cs
│   │       └── VisitService.cs
│   ├── Validators
│   │   ├── Clients
│   │   │   ├── CreateClientsDtoValidator.cs
│   │   │   └── UpdateClientDtoValidator.cs
│   │   ├── Employees
│   │   │   ├── CreateEmployeeDtoValidator.cs
│   │   │   └── UpdateEmployeeDtoValidator.cs
│   │   ├── Memberships
│   │   │   ├── CreateMembershipDtoValidator.cs
│   │   │   └── UpdateMembershipDtoValidator.cs
│   │   └── Visits
│   │       └── CreateVisitDtoValidator.cs
│   ├── appsettings.Development.json
│   └── appsettings.json
├── GymApp.Tests
│   ├── GymApp.Tests.csproj
│   └── ValidatorTests.cs
├── GymApp.slnx
├── README.md
├── db_sql_scripts
│   ├── 00_db_create.sql
│   ├── 01_db_structure.sql
│   ├── 02_seed_data.sql
│   └── gym_app_user.txt
├── docker-compose.yml
├── gym-app-frontend
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── api
│   │   │   ├── apiClient.ts
│   │   │   ├── auth.ts
│   │   │   ├── clients.ts
│   │   │   ├── employees.ts
│   │   │   ├── memberships.ts
│   │   │   ├── users.ts
│   │   │   └── visits.ts
│   │   ├── assets
│   │   │   ├── hero.png
│   │   │   ├── react.svg
│   │   │   └── vite.svg
│   │   ├── components
│   │   │   ├── Layout.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── clients
│   │   │   │   └── ClientFormModal.tsx
│   │   │   ├── employees
│   │   │   │   └── EmployeeFormModal.tsx
│   │   │   ├── memberships
│   │   │   │   └── MembershipFormModal.tsx
│   │   │   ├── users
│   │   │   │   └── UserFormModal.tsx
│   │   │   └── visits
│   │   │       └── VisitFormModal.tsx
│   │   ├── hooks
│   │   │   ├── useClients.ts
│   │   │   ├── useMemberships.ts
│   │   │   ├── useUsers.ts
│   │   │   └── useVisits.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   ├── pages
│   │   │   ├── ClientsPage.tsx
│   │   │   ├── EmployeesPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── MembershipsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   └── VisitsPage.tsx
│   │   ├── types
│   │   │   └── index.ts
│   │   └── utils
│   │       └── tableConfig.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── src
    ├── App.tsx
    ├── api
    │   ├── client.ts
    │   ├── clients.ts
    │   ├── memberships.ts
    │   └── visits.ts
    ├── components
    │   ├── ClientForm.tsx
    │   └── ClientTable.tsx
    ├── index.css
    ├── main.tsx
    ├── pages
    │   ├── ClientDetailsPage.tsx
    │   └── ClientsListPage.tsx
    └── types
        ├── client.ts
        ├── membership.ts
        └── visit.ts
```