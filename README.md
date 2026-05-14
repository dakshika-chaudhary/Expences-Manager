
# ExpensesManager - Microservices Based Expense Tracking System

## Tech Stack
- Frontend: Next.js + Tailwind CSS + Framer Motion
- Backend: Spring Boot Microservices
- Database: PostgreSQL
- Authentication: OTP + JWT + Refresh Token
- API Gateway: Spring Cloud Gateway
- Service Discovery: Eureka Server

## Microservices
1. discovery-server
2. api-gateway
3. auth-service
4. expense-service
5. budget-service
6. notification-service

## Features
- Daily / Weekly / Monthly / Yearly expense tracking
- Category wise expense management
- Predefined + custom categories
- Salary management
- Budget alerts
- JWT authentication
- Email OTP verification
- Dark / Light mode
- Interactive dashboard

## Run Order
1. discovery-server
2. api-gateway
3. auth-service
4. expense-service
5. budget-service
6. notification-service
7. frontend

## Frontend
```bash
cd frontend
npm install
npm run dev
```

## Backend
Run each microservice individually:
```bash
mvn spring-boot:run
```
