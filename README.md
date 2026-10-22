# FinTrack

A personal finance and investment tracking mobile application built with **React Native, Expo, and Laravel**.

FinTrack allows users to manage their financial transactions, monitor their overall financial position, and track investment portfolios through a mobile application connected to a RESTful Laravel API.

---

## 📱 Overview

FinTrack was developed as a full-stack mobile application with a separate frontend and backend architecture.

The application provides users with:

* Secure user registration and login
* Token-based authentication
* Personal transaction management
* Income and expense tracking
* Financial dashboard
* Investment portfolio management
* Investment Buy/Sell functionality
* Portfolio performance and profit/loss calculations
* User profile information retrieved from the backend

---

## ✨ Features

### 🔐 Authentication

Users can:

* Register a new account
* Confirm their password during registration
* Login securely
* Logout
* Retrieve their authenticated user profile

Authentication is implemented using **Laravel Sanctum** and bearer tokens.

The mobile application stores the authentication token using `AsyncStorage` and automatically attaches it to authenticated API requests.

---

### 💰 Transaction Management

Users can manage their personal transactions.

Supported operations include:

* View transactions
* Add transactions
* Delete transactions
* Categorize transactions as income or expense
* Track transaction amounts and dates

---

### 📊 Financial Dashboard

The dashboard provides an overview of the user's financial position.

It calculates:

* Total income
* Total expenses
* Current balance
* Financial outlook

The balance/outlook can be used by the frontend to visually distinguish between positive and negative financial conditions.

---

### 📈 Investment Portfolio

FinTrack includes an investment portfolio management system.

Users can view:

* Total portfolio value
* Total amount invested
* Overall profit/loss
* Return percentage
* Portfolio outlook
* Individual investments

Each investment displays information such as:

* Symbol
* Investment name
* Quantity
* Average buy price
* Current price
* Current value
* Profit/loss
* Return percentage

Profit and loss are calculated based on the difference between the investment's current value and its invested amount.

---

### 💵 Buy & Sell Investments

The portfolio interface includes Buy and Sell functionality.

Users can:

* Buy an investment
* Sell an existing investment
* Specify investment quantity
* Track the resulting portfolio position

The backend processes the investment transactions while the frontend refreshes the portfolio information.

---

### 👤 User Profile

The profile page retrieves the authenticated user's information from the backend rather than relying on hardcoded data.

Displayed information includes:

* User name
* Email address

The application uses the authenticated `/me` endpoint to retrieve the current user.

---

## 🛠️ Tech Stack

### Frontend

* **React Native**
* **Expo**
* **Expo Router**
* **TypeScript**
* **Axios**
* **AsyncStorage**

### Backend

* **Laravel 12**
* **PHP**
* **Laravel Sanctum**
* **SQLite**
* **REST API**

### Development Tools

* Git
* GitHub
* Postman
* Visual Studio Code
* Android device / Expo Go

---

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│       FinTrack Mobile       │
│                             │
│ React Native + Expo         │
│ TypeScript                  │
│ Expo Router                 │
│ Axios                       │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               │ Bearer Token
               ▼
┌─────────────────────────────┐
│       Laravel Backend       │
│                             │
│ Laravel 12                  │
│ Laravel Sanctum             │
│ REST API                    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          SQLite             │
│                             │
│ Users                       │
│ Transactions                │
│ Investments                 │
└─────────────────────────────┘
```

---

## 🔑 API Endpoints

### Authentication

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| POST   | `/api/register` | Register a new user    |
| POST   | `/api/login`    | Login                  |
| GET    | `/api/me`       | Get authenticated user |
| POST   | `/api/logout`   | Logout                 |

### Transactions

| Method | Endpoint                          | Description             |
| ------ | --------------------------------- | ----------------------- |
| GET    | `/api/transactions`               | Get user transactions   |
| POST   | `/api/transactions`               | Create transaction      |
| DELETE | `/api/transactions/{transaction}` | Delete transaction      |
| GET    | `/api/dashboard`                  | Get financial dashboard |

### Portfolio

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/api/portfolio`         | Get investments       |
| POST   | `/api/portfolio`         | Create investment     |
| GET    | `/api/portfolio/summary` | Get portfolio summary |
| POST   | `/api/portfolio/buy`     | Buy investment        |
| POST   | `/api/portfolio/sell`    | Sell investment       |

Authenticated endpoints require a Laravel Sanctum bearer token.

---

## 🔒 Authentication Flow

The authentication flow works as follows:

```text
User
 │
 ▼
Login / Register
 │
 ▼
Laravel API
 │
 ▼
Sanctum Token
 │
 ▼
AsyncStorage
 │
 ▼
Axios Interceptor
 │
 ▼
Authorization: Bearer <token>
 │
 ▼
Protected API Endpoints
```

The Axios instance automatically retrieves the stored token from `AsyncStorage` and adds it to authenticated requests.

---

## 📂 Frontend Structure

A simplified structure of the mobile application:

```text
src/
├── app/
│   ├── login.tsx
│   ├── register.tsx
│   └── tabs/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── transactions.tsx
│       ├── portfolio.tsx
│       └── profile.tsx
│
└── services/
    └── api.ts
```

---

## 📂 Backend Structure

The Laravel backend follows an API-oriented structure:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── TransactionController.php
│   │       └── InvestmentController.php
│   │
│   └── Requests/
│
├── Models/
│   ├── User.php
│   ├── Transaction.php
│   └── Investment.php
│
routes/
└── api.php
```

---

## 🧪 API Testing

The backend APIs were tested independently using **Postman** before integrating them with the mobile application.

This allowed API responses, authentication, request payloads, and endpoint behavior to be verified separately from the frontend.

Example registration payload:

```json
{
  "name": "felin",
  "email": "felin@test.com",
  "password": "12345678",
  "password_confirmation": "12345678"
}
```

Laravel validates the `password_confirmation` field through the `confirmed` validation rule.

---

## 🚀 Running the Project

### Backend

Navigate to the Laravel backend:

```bash
cd fintrack-api
```

Install dependencies:

```bash
composer install
```

Run migrations:

```bash
php artisan migrate
```

Start the Laravel development server:

```bash
php artisan serve --host=0.0.0.0
```

The API will be available through the configured local network address.

---

### Frontend

Navigate to the React Native project:

```bash
cd FinTrack
```

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npx expo start
```

The application can then be opened through Expo Go or an available Android development environment.

---

## 🔄 Development Workflow

The application was developed using a frontend/backend separation:

```text
Frontend Development
        ↓
API Request
        ↓
Laravel Controller
        ↓
Validation
        ↓
Model / Database
        ↓
JSON Response
        ↓
React Native UI
```

Postman was also used during development to verify API behavior independently.

---

## 🎯 Project Goals

The main goal of FinTrack is to provide a practical example of a full-stack financial application while demonstrating:

* Mobile application development
* REST API development
* Authentication
* Database integration
* CRUD operations
* Financial calculations
* Investment management
* Frontend/backend integration
* API testing
* Git/GitHub project management

---

## 🔮 Future Improvements

Potential improvements include:

* Real-time investment market prices
* Investment price charts
* Transaction charts and analytics
* More investment types
* Search and filtering
* Push notifications
* Budget management
* Financial reports
* Cloud database deployment
* Production API deployment
* Improved error handling
* Automated testing
* CI/CD pipeline

---

## 👨‍💻 Developer

**Stanley Pudjowibowo**

Software Engineer with experience in full-stack web development, enterprise applications, frontend development, backend development, and API integration.

### Technologies

`React Native` · `Expo` · `TypeScript` · `Laravel` · `PHP` · `REST API` · `SQLite` · `Axios` · `Laravel Sanctum`

---

## 📌 Project Status

**Active Development**

FinTrack is currently being developed as a full-stack mobile finance and investment management application.
