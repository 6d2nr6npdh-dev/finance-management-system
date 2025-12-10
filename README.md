# 💰 FinanceHub - Multi-Organization Financial Management System

A comprehensive, enterprise-grade financial management system designed for small to medium-sized businesses. Built with modern web technologies and a robust PostgreSQL database architecture.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791)
![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Functions](#database-functions)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Team](#team)

## 🎯 Overview

FinanceHub is a modern financial management platform that enables organizations to: 
- Track income, expenses, and transfers across multiple accounts
- Generate and manage invoices with automated calculations
- Monitor budgets with real-time spending alerts
- Manage multiple organizations with complete data isolation
- Generate comprehensive financial reports and analytics
- Maintain complete audit trails for compliance

### Problem Statement

Existing financial management solutions suffer from:
- ❌ No true multi-organization support
- ❌ Expensive subscription models ($30-200/month)
- ❌ Manual data entry and reconciliation
- ❌ Limited customization options
- ❌ Weak audit capabilities

### Our Solution

FinanceHub addresses these challenges with: 
- ✅ True multi-tenancy with complete data isolation
- ✅ Automated balance management via database triggers
- ✅ Flexible budget system with threshold alerts
- ✅ Comprehensive audit trail for every change
- ✅ Cost-effective open-source foundation
- ✅ Role-based security per organization

## 🚀 Key Features

### Financial Management
- **Account Tracking**: Manage checking, savings, credit cards, loans, and investments
- **Transaction Management**: Record income, expenses, and transfers with categorization
- **Automated Reconciliation**: Real-time balance updates via database triggers
- **Multi-Currency Support**: Track finances in different currencies

### Invoicing & Payments
- **Invoice Generation**: Create professional invoices with line items
- **Automated Calculations**: Tax, discounts, and totals calculated automatically
- **Payment Tracking**: Monitor payment status and overdue invoices
- **Unique Invoice Numbers**: Auto-generated invoice numbering system

### Budget Management
- **Category & Account Budgets**: Set spending limits by category or account
- **Real-Time Tracking**:  Automatic spending calculation from cleared transactions
- **Alert System**: Configurable threshold alerts (default 80%)
- **Flexible Periods**: Monthly, quarterly, yearly, or custom date ranges

### Reporting & Analytics
- **Dashboard**:  Real-time financial overview with trends
- **Monthly Summaries**: Income vs. expenses over time
- **Expense Breakdown**: Categorized spending analysis with percentages
- **Cash Flow Reports**: Track money movement across accounts
- **Top Payees**: Identify highest spending vendors

### Multi-Organization Support
- **Complete Isolation**: Organizations have separate, isolated data
- **Role-Based Access**: Owner, Admin, Accountant, Viewer roles
- **Member Management**: Invite users with specific permissions
- **Organization Switching**: Users can belong to multiple organizations

### Security & Compliance
- **Row-Level Security**: PostgreSQL RLS on all tables
- **Audit Logging**:  Immutable logs of all operations
- **Permission Checks**: Function-level authorization
- **Secure Authentication**:  Supabase Auth with JWT tokens

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.2 with TypeScript
- **Styling**: TailwindCSS 3.x
- **UI Components**: Custom component library with Radix UI primitives
- **Charts**: Recharts for data visualization
- **Routing**:  Wouter (lightweight React router)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API

### Backend
- **Database**: PostgreSQL 15 (via Supabase)
- **Authentication**: Supabase Auth (JWT-based)
- **API**:  Supabase Client (auto-generated from schema)
- **Real-time**:  Supabase Realtime subscriptions

### DevOps & Tools
- **Package Manager**: npm/yarn
- **Build Tool**: Vite
- **Type Checking**: TypeScript 5.0
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

video link: https://drive.google.com/file/d/15CFKQvXrZD-aHN7a8KIRdxtLJmeVWDsA/view?usp=sharing
