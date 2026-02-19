# NextAuth.js + Prisma Migration Guide

## Completed Setup ✅

### 1. **Prisma Schema**
   - Created comprehensive schema with NextAuth models (User, Account, Session, VerificationToken)
   - Added all business models (Admin, CustomerProfile, Product, Order, Payment, etc.)
   - Location: `prisma/schema.prisma`

### 2. **NextAuth Configuration**
   - Created auth configuration with Credentials provider
   - JWT strategy with role-based access
   - Password hashing with bcryptjs
   - Location: `auth.ts`

### 3. **Database Setup**
   - NextAuth API route: `app/api/auth/[...nextauth]/route.ts`
   - Environment variables configured in `.env`
   - Prisma client with Optimize extension: `lib/prisma.ts`

### 4. **Authentication Endpoints**
   - Updated signin route: `app/api/auth/signin/route.ts` ✅
   - Updated signup route: `app/api/auth/signup/route.ts` ✅
   - Updated signout route: `app/api/auth/signout/route.ts` ✅

### 5. **App Layout & Providers**
   - Updated main layout.tsx to use NextAuthProvider ✅
   - Created NextAuthProvider component ✅

## Next Steps - API Routes Migration

The following API routes still need to be migrated from Supabase to Prisma queries:

### High Priority (User-Facing):
- [ ] `app/api/customer-profile/route.ts` - Get/Update customer profile
- [ ] `app/api/products/route.ts` - Get products
- [ ] `app/api/orders/route.ts` - Create/Get orders
- [ ] `app/api/payments/initialize/route.ts` - Initialize payments
- [ ] `app/api/payments/verify/route.ts` - Verify payments
- [ ] `app/api/wishlist/route.ts` - Wishlist operations

### Medium Priority (Admin):
- [ ] `app/api/admin/products/route.ts` - Manage products
- [ ] `app/api/admin/orders/route.ts` - Manage orders
- [ ] `app/api/admin/customers/route.ts` - Customer management
- [ ] `app/api/admin/analytics/route.ts` - Analytics

### Lower Priority:
- [ ] `app/api/notifications/email/route.ts` - Email notifications
- [ ] `app/api/admin/invitations/route.ts` - Admin invitations
- [ ] `app/api/homepage/route.ts` - Homepage sections

## Migration Pattern Example

### Before (Supabase):
```typescript
const { data, error } = await supabase
  .from('customer_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### After (Prisma):
```typescript
import prisma from '@/lib/prisma';

const profile = await prisma.customerProfile.findUnique({
  where: { userId: userId },
});
```

## Important Notes

1. **Database Migration**: Run `pnpm prisma migrate dev --name init` to initialize the database with the new schema

2. **User Imports**: To migrate existing Supabase users to Postgres:
   - Create a migration script in `scripts/` directory
   - Export users from Supabase
   - Import into new PostgreSQL database

3. **Authentication Flow**:
   - NextAuth now handles all auth logic
   - Credentials provider validates against Prisma database
   - JWT tokens manage sessions
   - No more Supabase auth dependency

4. **API Response compatibility**:
   - Existing auth endpoints maintain same response format
   - Easier integration with frontend code

5. **Password Security**:
   - Passwords are hashed with bcryptjs before storage
   - Never store plain passwords
   - Always use verifyPassword helper when needed

## Running the Application

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma generate

# Create database schema
pnpm prisma migrate dev --name init

# Start development server
pnpm dev
```

## Environment Variables Required

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

Generate NEXTAUTH_SECRET with: `openssl rand -base64 32`
