# Integration Plan: Payment Flow + Existing Architecture

**Date:** 2025-10-01
**Status:** In Progress
**Goal:** Integrate Stripe payment flow with existing `/resumes` routes while maintaining backward compatibility

---

## 🎯 Problem Statement

We built a **separate** `/optimizations` endpoint for the paid SaaS flow, but the original project already has a working `/resumes` architecture. This creates:

- **Code duplication** (two separate resume processing flows)
- **Disconnected data** (SQLite models vs Supabase schema)
- **Confusion** (two different APIs for the same functionality)

---

## 🏗️ Current Architecture Analysis

### **Original Project (Free, Local)**

```
Database: SQLite + SQLAlchemy ORM
AI Engine: Ollama (local models)
Auth: None (local-first)

Models:
├── Resume (raw text storage)
├── ProcessedResume (structured JSON data)
├── Job (job description)
└── ProcessedJob (structured job data)

API Routes:
POST /api/v1/resumes/upload  → Upload PDF/DOCX → Store in SQLite
POST /api/v1/jobs/           → Submit job description → Store in SQLite
POST /api/v1/resumes/improve → AI processing (free) → Return JSON
GET  /api/v1/resumes?id=X    → Fetch resume data
```

### **New SaaS Features (Paid, Cloud)**

```
Database: Supabase (PostgreSQL)
AI Engine: OpenRouter (cloud API)
Auth: Supabase Auth (JWT)

Tables:
├── profiles (user accounts)
├── optimizations (paid jobs)
└── payments (Stripe transactions)

API Routes:
POST /api/v1/payments/create-intent  → Create Stripe payment
POST /api/v1/optimizations/          → Process AFTER payment
GET  /api/v1/optimizations/:id       → Get optimization status
```

---

## ✅ Integration Strategy

### **Principle: SaaS-First Transformation**

Transform existing **local-first system** into **paid SaaS service**:

```python
# Single SaaS mode - no dual operation
# Transform: SQLite → Supabase
# Transform: Ollama → OpenRouter
# Transform: No auth → Supabase Auth + Stripe
# Transform: Free → Paid
```

### **Unified API Routes**

#### **1. Resume Upload** (TRANSFORM existing)

```
POST /api/v1/resumes/upload
Body: file (PDF/DOCX) + user_id (JWT auth)
Logic:
- Store in Supabase table + Storage bucket
- Replace SQLite storage
- Add user authentication
```

#### **2. Job Description** (TRANSFORM existing)

```
POST /api/v1/jobs/
Body: { job_description, user_id }
Logic:
- Store in Supabase (migrate from SQLite)
- Add user_id field for authentication
```

#### **3. Payment Intent** (NEW - from separate system)

```
POST /api/v1/payments/create-intent
Body: { resume_id, job_id, user_id }
Response: { payment_intent_id, client_secret }
```

#### **4. AI Processing** (TRANSFORM existing - mandatory payment)

```
POST /api/v1/resumes/improve
Body: { resume_id, job_id, payment_intent_id }

Logic:
- Verify payment_intent_id is "succeeded"
- Process with OpenRouter (replace Ollama)
- Store result in Supabase (replace SQLite)
- Generate and store DOCX file
```

#### **5. DOCX Download** (NEW)

```
GET /api/v1/resumes/:resume_id/download
Response: .docx file stream
Logic: Fetch processed resume → Generate .docx → Stream
```

---

## 🗄️ Database Integration

### **Approach: Complete Migration to Supabase**

```python
# app/core/database.py - REMOVE SQLite completely
def get_db_session():
    """Return Supabase client only"""
    return get_supabase_admin_client()
```

### **Schema Migration**

**SQLite Models** (remove):

```python
# DELETE: apps/backend/app/models/resume.py (SQLite)
# DELETE: apps/backend/app/models/job.py (SQLite)
# DELETE: apps/backend/app/models/association.py (SQLite)
```

**Supabase Schema** (create new):

```sql
-- Create Supabase tables to replace SQLite
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resume_id UUID UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,  -- Supabase storage path
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    job_id UUID UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE processed_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    resume_id UUID REFERENCES resumes(id),
    job_id UUID REFERENCES jobs(id),
    optimized_content TEXT NOT NULL,
    docx_storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Changes**:

- Complete removal of SQLite models
- Add `user_id` for authentication
- Add `storage_path` for file storage
- Migrate all existing SQLite logic to Supabase

---

## 📁 File Structure Changes

### **Remove SQLite Models**

```
# DELETE these files:
apps/backend/app/
├── models/resume.py          # DELETE: SQLite models
├── models/job.py             # DELETE: SQLite models
├── models/association.py     # DELETE: SQLite associations
├── models/user.py            # DELETE: SQLite user model
└── models/base.py            # DELETE: SQLite base model
```

### **Keep and Enhance**

```
apps/backend/app/
├── services/resume_service.py    # ENHANCE: Migrate to Supabase
├── services/job_service.py       # ENHANCE: Migrate to Supabase
├── api/router/v1/resume.py       # ENHANCE: Add auth + payment
├── api/router/v1/job.py          # ENHANCE: Add auth
└── api/router/v1/optimizations.py # MOVE: Integrate into resume.py
```

### **Keep Existing SaaS Components**

```
apps/backend/app/
├── services/stripe_service.py       # KEEP: Payment logic
├── services/payment_verification.py # KEEP: Payment verification
├── services/ai_optimization.py      # KEEP: OpenRouter integration
├── services/docx_generation.py      # KEEP: DOCX generation
├── core/supabase_client.py          # KEEP: Supabase client
└── core/stripe_client.py            # KEEP: Stripe client
```

---

## 🔄 Migration Path

### **Phase 1: Add Payment Routes** ✅ (Done)

- Created `/payments/` endpoints
- Stripe integration working
- Created `/optimizations/` endpoints (separate system)

### **Phase 2: Merge Systems & Transform Routes** 🚧 (Current)

1. **REMOVE** separate `/optimizations/` endpoints completely
2. **TRANSFORM** existing `/resumes/improve` to require payment verification
3. **DELETE** all SQLite model files
4. **MIGRATE** ResumeService and JobService to Supabase
5. **ADD** mandatory authentication to all routes

### **Phase 3: Database Migration** 📋 (Next)

1. Create Supabase tables: `resumes`, `jobs`, `processed_resumes`
2. Add RLS policies for user data isolation
3. Remove all SQLite dependencies from codebase

### **Phase 4: Frontend Integration** 📋 (Next)

1. Update frontend to use unified `/resumes` flow
2. Add payment flow before AI processing
3. Add DOCX download functionality
4. Remove all references to `/optimizations` endpoints

---

## 🧪 Testing Strategy

### **SaaS-Only Tests**

```bash
# Set environment
export SUPABASE_URL=http://127.0.0.1:54321
export SUPABASE_SERVICE_KEY=...
export STRIPE_SECRET_KEY=sk_test_...

# Test complete paid flow
1. User authenticates (JWT token)
2. Upload resume → Supabase table + Storage
3. Submit job description → Supabase table
4. Create payment intent → Stripe
5. Confirm payment → webhook updates
6. Call /improve with payment_intent_id → AI processing
7. Download DOCX → Supabase Storage
```

### **Integration Tests**

- **Authentication flow**: JWT validation
- **Payment flow**: Stripe → Supabase update
- **File processing**: Upload → Extract → AI → DOCX
- **Error handling**: Failed payments, invalid files, AI errors

---

## 🚀 Implementation Checklist

### **Phase 2: Merge Systems (Current Priority)**

- [ ] **REMOVE** `/api/router/v1/optimizations.py` completely
- [ ] **DELETE** all SQLite model files (`models/*.py`)
- [ ] **TRANSFORM** `/resumes/improve` to require `payment_intent_id`
- [ ] **MIGRATE** `ResumeService` to use Supabase instead of SQLite
- [ ] **MIGRATE** `JobService` to use Supabase instead of SQLite
- [ ] **ADD** mandatory JWT authentication middleware
- [ ] **CREATE** `/resumes/:id/download` endpoint for DOCX files

### **Database Changes**

- [ ] Create Supabase migration: `resumes` table
- [ ] Create Supabase migration: `jobs` table
- [ ] Create Supabase migration: `processed_resumes` table
- [ ] Add RLS policies for user data isolation
- [ ] Remove all SQLite dependencies from `core/database.py`

### **Frontend Changes**

- [ ] Update API calls to use unified `/resumes` endpoints
- [ ] Add payment flow before calling `/improve`
- [ ] Add DOCX download functionality
- [ ] Remove all references to `/optimizations` endpoints

### **Testing**

- [ ] Integration test: complete SaaS workflow
- [ ] Authentication test: JWT validation
- [ ] Payment test: Stripe integration
- [ ] File processing test: Upload → AI → DOCX
- [ ] Error handling test: Failed payments, invalid files

---

## 📊 Success Metrics

✅ **Integration Complete When:**

1. **Single unified API** using only `/resumes/*` endpoints
2. **Mandatory payment verification** before AI processing
3. **Complete SQLite removal** - only Supabase remaining
4. **Authentication required** for all endpoints
5. **DOCX download functional** from processed results
6. **All PRD requirements met** (Stories 1.1-1.4)

---

## 🎯 Next Steps

**Immediate (Today):**

1. **DELETE** `/optimizations.py` - remove separate system
2. **TRANSFORM** `/resumes/improve` - add mandatory payment verification
3. **DELETE** all SQLite model files
4. **MIGRATE** services to use Supabase only

**Short-term (This Week):**

1. Create Supabase migrations for new table structure
2. Add authentication middleware to all routes
3. Create DOCX download endpoint
4. Update frontend to use unified flow

**Long-term:**

1. Add analytics dashboard
2. Multi-language support (pt-BR)
3. LGPD compliance audit
4. Performance optimization
